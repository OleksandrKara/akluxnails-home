import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date — original publish date, never changes
  updated?: string; // ISO date — set only when a post is meaningfully revised after publishing
  tags?: string[];
}

export interface BlogPost extends BlogPostMeta {
  content: string; // raw MDX body, rendered by the caller via next-mdx-remote/rsc
  // Background photo for the article's hero banner — an explicit `heroImage` in frontmatter wins
  // (lets a specific post pick its best shot); otherwise the first real <img> already embedded in
  // the post's own content, so the hero never shows a photo that hasn't already been vetted for
  // this exact article. `undefined` for the handful of posts with no photos of their own at all,
  // which render a plain color hero instead (see components/BlogHero.tsx).
  heroImage?: string;
}

/** First `<img src="...">` in the raw MDX body, in document order — a plain regex is enough since
 * this only reads content this project's own authors write, never external/untrusted input. */
function firstImageSrc(content: string): string | undefined {
  return content.match(/<img[^>]+src="([^"]+)"/)?.[1];
}

/** Every published post, newest first, excluding drafts. Simple file-based content for now — a
 * post is a single .mdx file in content/blog/ with frontmatter (title, description, date, and
 * optionally updated/tags/draft); no CMS yet, matching the initial scope (see the plan:
 * file-based posts now, a custom editor later if needed).
 *
 * `draft: true` posts are excluded here — and therefore from the blog index and the sitemap
 * (both call this function) — but are still reachable directly by URL via getPostBySlug, so a
 * draft can be reviewed at its real URL before flipping the flag off.
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .filter((filename) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
      return !matter(raw).data.draft;
    })
    .map((filename) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug: filename.replace(/\.mdx$/, ""),
        title: data.title ?? filename,
        description: data.description ?? "",
        date: data.date ?? new Date(0).toISOString(),
        updated: data.updated ?? undefined,
        tags: Array.isArray(data.tags) ? data.tags : undefined,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? new Date(0).toISOString(),
    updated: data.updated ?? undefined,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    content,
    heroImage: data.heroImage ?? firstImageSrc(content),
  };
}

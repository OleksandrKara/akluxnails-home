import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
}

export interface BlogPost extends BlogPostMeta {
  content: string; // raw MDX body, rendered by the caller via next-mdx-remote/rsc
}

/** Every published post, newest first. Simple file-based content for now — a post is a single
 * .mdx file in content/blog/ with frontmatter (title, description, date); no CMS yet, matching
 * the initial scope (see the plan: file-based posts now, a custom editor later if needed).
 */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
      const { data } = matter(raw);
      return {
        slug: filename.replace(/\.mdx$/, ""),
        title: data.title ?? filename,
        description: data.description ?? "",
        date: data.date ?? new Date(0).toISOString(),
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
    content,
  };
}

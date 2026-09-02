import { notFound } from "next/navigation";
import Link from "next/link";
import type { ComponentProps } from "react";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookNowButton from "@/components/BookNowButton";
import BlogPhotoLightbox from "@/components/BlogPhotoLightbox";
import BlogHero from "@/components/BlogHero";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

// Comparison tables render at their natural width regardless of viewport — on a narrow phone
// that's wider than the screen, so without this wrapper the table (and the whole page) scrolls
// sideways instead of just the table itself.
const mdxComponents = {
  table: (props: ComponentProps<"table">) => (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="prose prose-neutral w-full max-w-none" {...props} />
    </div>
  ),
};

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BlogHero title={post.title} date={post.date} updated={post.updated} tags={post.tags} image={post.heroImage} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <article className="prose prose-neutral max-w-none">
          <BlogPhotoLightbox>
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </BlogPhotoLightbox>
        </article>

        {/* The conversion path this blog didn't have before — every post ends with a real path
            back into booking, not just informational content with nowhere to go. */}
        <div className="not-prose mt-10 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-6 text-center ring-1 ring-[var(--color-border)]">
          <p className="text-lg font-medium text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to book your appointment?
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            See our full service menu or book directly online.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]">
              Book Your Appointment
            </BookNowButton>
            <Link
              href="/#services"
              className="inline-block rounded-[var(--radius-pill)] px-6 py-3 text-sm font-medium text-[var(--color-accent)] ring-1 ring-[var(--color-accent-border-soft)] hover:bg-[var(--color-accent-tint-2)]"
            >
              View Services
            </Link>
          </div>
        </div>

        <p className="not-prose mt-8">
          <Link href="/blog" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
            ← Back to the blog
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}

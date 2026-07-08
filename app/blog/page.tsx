import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Nail care tips, trends, and news from AK.LUX.NAILS in Downtown San Diego.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <h1
          className="text-3xl text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Blog
        </h1>
        {posts.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--color-muted)]">
            No posts yet — check back soon.
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-6">
            {posts.map((p) => (
              <li key={p.slug} className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
                <Link href={`/blog/${p.slug}`} className="text-lg font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]">
                  {p.title}
                </Link>
                <p className="mt-1 text-xs text-[var(--color-muted-2)]">
                  {new Date(p.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{p.description}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

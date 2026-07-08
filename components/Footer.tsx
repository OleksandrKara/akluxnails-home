import Link from "next/link";
import { BUSINESS_NAME } from "@/lib/siteData";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-[var(--color-muted-2)] sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</span>
          <nav className="flex gap-4">
            <Link href="/blog" className="hover:text-[var(--color-ink)]">Blog</Link>
            <Link href="/#location" className="hover:text-[var(--color-ink)]">Location</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

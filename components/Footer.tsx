import Link from "next/link";
import { BUSINESS_NAME } from "@/lib/siteData";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-[var(--color-muted-2)] sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</span>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="/prices" className="hover:text-[var(--color-ink)]">Prices</Link>
            <Link href="/russian-pedicure" className="hover:text-[var(--color-ink)]">Russian Pedicure</Link>
            <Link href="/gel-nail-extensions" className="hover:text-[var(--color-ink)]">Gel Extensions</Link>
            <Link href="/blog" className="hover:text-[var(--color-ink)]">Blog</Link>
            <Link href="/privacy-policy" className="hover:text-[var(--color-ink)]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--color-ink)]">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

import BookNowButton from "./BookNowButton";
import { SERVICES } from "@/lib/siteData";

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2
        className="text-2xl text-[var(--color-ink)]"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Services
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SERVICES.map((s) => (
          <div key={s.name} className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
            <h3 className="font-medium text-[var(--color-ink)]">{s.name}</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]">
          Book an Appointment
        </BookNowButton>
      </div>
    </section>
  );
}

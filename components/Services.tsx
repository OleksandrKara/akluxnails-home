import BookNowButton from "./BookNowButton";
import { getCuratedMenu } from "@/lib/square/catalog";
import { toWireItem } from "@/lib/square/wire";
import { LOCATION } from "@/lib/siteData";

function formatPrice(cents: number): string {
  if (cents === 0) return "Request";
  return `$${(cents / 100).toFixed(0)}`;
}

function ServiceIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent-dark)]">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2.5c.9 2.3 2.2 3.6 4.5 4.5-2.3.9-3.6 2.2-4.5 4.5-.9-2.3-2.2-3.6-4.5-4.5 2.3-.9 3.6-2.2 4.5-4.5z"
          fill="currentColor"
        />
        <path
          d="M6 13c.5 1.4 1.3 2.2 2.7 2.7C7.3 16.2 6.5 17 6 18.4c-.5-1.4-1.3-2.2-2.7-2.7C4.7 15.2 5.5 14.4 6 13z"
          fill="currentColor"
        />
        <path
          d="M18 12.5c.6 1.7 1.6 2.7 3.3 3.3-1.7.6-2.7 1.6-3.3 3.3-.6-1.7-1.6-2.7-3.3-3.3 1.7-.6 2.7-1.6 3.3-3.3z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export default async function Services() {
  const menu = await getCuratedMenu();

  return (
    <section id="services" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Services
      </h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Our most-requested manicures, pedicures, and combos. Tap any service to book it directly.
      </p>

      <div className="mt-6 space-y-8">
        {menu.groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">{group.title}</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {group.services.map((service) => {
                const cheapest = service.variations.reduce((min, v) => (v.priceCents < min.priceCents ? v : min));
                const wireService = toWireItem(service);
                const wireVariation = wireService.variations.find((v) => v.variationId === cheapest.variationId)!;
                // Cheapest variation regardless of tier count — a nail-tech choice for tiered
                // services (if any) is made in its own step later in the flow.
                const preselection = { service: wireService, variation: wireVariation };
                return (
                  <BookNowButton
                    key={service.itemId}
                    preselection={preselection}
                    className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-4 text-left ring-1 ring-[var(--color-border)] transition hover:ring-[var(--color-accent)] hover:shadow-md"
                  >
                    <ServiceIcon />
                    <span className="min-w-0 flex-1 font-medium leading-snug text-[var(--color-ink)]">{service.name}</span>
                    <span className="shrink-0 text-sm font-medium text-[var(--color-accent)]">
                      {service.variations.length === 1
                        ? formatPrice(service.variations[0].priceCents)
                        : `from ${formatPrice(cheapest.priceCents)}`}
                    </span>
                  </BookNowButton>
                );
              })}
            </div>
            {group.addOnGroups.length > 0 && (
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Add-ons: {group.addOnGroups.flatMap((g) => g.options.map((o) => o.name)).join(" · ")} — choose when you book.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]">
          Book an Appointment
        </BookNowButton>
        <a
          href={LOCATION.groupBookingSmsHref}
          className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-6 py-3 text-sm font-medium text-[var(--color-accent)] ring-1 ring-[var(--color-accent-border-soft)] hover:bg-[var(--color-accent-tint-2)]"
        >
          💬 Booking for a group? Text us
        </a>
      </div>
    </section>
  );
}

import BookNowButton from "./BookNowButton";
import { getCuratedMenu } from "@/lib/square/catalog";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export default async function Services() {
  const menu = await getCuratedMenu();

  return (
    <section id="services" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h2 className="text-2xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-heading)" }}>
        Services
      </h2>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Our most-requested manicures, pedicures, and combos — book online, add extras at checkout.
      </p>

      <div className="mt-6 space-y-8">
        {menu.groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">{group.title}</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {group.services.map((service) => (
                <div
                  key={service.itemId}
                  className="flex items-center justify-between rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]"
                >
                  <h4 className="font-medium text-[var(--color-ink)]">{service.name}</h4>
                  <span className="shrink-0 pl-3 text-sm text-[var(--color-accent)]">
                    {service.variations.length === 1
                      ? formatPrice(service.variations[0].priceCents)
                      : `from ${formatPrice(Math.min(...service.variations.map((v) => v.priceCents)))}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {menu.addOns.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">Add-ons</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {menu.addOns.map((a) => a.name).join(" · ")} — added at checkout when you book.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white hover:bg-[var(--color-accent-hover)]">
          Book an Appointment
        </BookNowButton>
      </div>
    </section>
  );
}

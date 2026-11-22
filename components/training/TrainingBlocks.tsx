import { TRAINING } from "@/lib/trainingCourse";

const h2 = "text-2xl text-[var(--color-ink)] sm:text-3xl";
const heading = { fontFamily: "var(--font-heading)" } as const;

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">{children}</p>;
}

export function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** Enrollment as a real sequence (the order is the information), same four-step idea as the PMU
 * Academy's "How enrollment works". */
export function EnrollmentSteps() {
  return (
    <section className="mt-20" aria-labelledby="enroll-title">
      <Eyebrow>How enrollment works</Eyebrow>
      <h2 id="enroll-title" className={`mt-1 ${h2}`} style={heading}>
        From first question to certificate
      </h2>
      <ol className="relative mt-8 space-y-5 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-[var(--color-border)] sm:before:left-[23px]">
        {TRAINING.steps.map((s, i) => (
          <li key={s.title} className="relative flex gap-4 sm:gap-6">
            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-base font-semibold text-white ring-4 ring-[var(--color-accent-tint-2)] sm:h-12 sm:w-12 sm:text-lg" style={heading} aria-hidden>
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)] sm:p-6">
              <h3 className="text-xl text-[var(--color-ink)]" style={heading}>{s.title}</h3>
              <p className="mt-1 text-sm font-medium text-[var(--color-ink-soft)]">{s.text}</p>
              <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-muted)]">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <Check />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function klarnaMonthly(price: number): number {
  const { months, apr } = TRAINING.payment.klarna;
  const r = apr / 100 / 12;
  return Math.round(((price * r) / (1 - (1 + r) ** -months)) * 100) / 100;
}

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** The same split the PMU Academy shows, sitting right under the photo gallery: a $1,000 deposit saves
 * the place, the rest comes two weeks before the course. The bar is drawn to scale (deposit / total). */
export function PaymentBreakdown() {
  const p = TRAINING.payment;
  const balance = p.total - p.deposit;
  const depositPct = Math.round((p.deposit / p.total) * 100);
  return (
    <section className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)] sm:p-6" aria-labelledby="pay-title">
      <Eyebrow>Payment</Eyebrow>
      <h2 id="pay-title" className="mt-1 text-xl text-[var(--color-ink)] sm:text-2xl" style={heading}>
        How the {usd(p.total)} is paid
      </h2>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[var(--color-accent-tint)]" role="img" aria-label={`${usd(p.deposit)} deposit, then ${usd(balance)} two weeks before the course`}>
        <div className="h-full bg-[var(--color-accent)]" style={{ width: `${depositPct}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-[2fr_3fr] gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted-2)]">When you enroll</p>
          <p className="text-2xl text-[var(--color-ink)] sm:text-3xl" style={heading}>{usd(p.deposit)}</p>
          <p className="text-xs leading-snug text-[var(--color-muted)]">Deposit. It saves your place in the class.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted-2)]">Two weeks before</p>
          <p className="text-2xl text-[var(--color-ink)] sm:text-3xl" style={heading}>{usd(balance)}</p>
          <p className="text-xs leading-snug text-[var(--color-muted)]">The rest of the course price.</p>
        </div>
      </div>
      <div className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-accent-tint-2)] p-4">
        <p className="text-sm text-[var(--color-ink)]">
          Or pay over time: as low as <strong className="text-lg">${klarnaMonthly(p.total).toFixed(2)}/mo</strong>* with{" "}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/training/klarna-badge.svg" alt="Klarna" width={45} height={19} className="inline-block h-[19px] w-auto align-[-4px]" />
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">Payment plans are available with {p.options.join(", ")}.</p>
      </div>
      <p className="mt-3 text-[11px] leading-snug text-[var(--color-muted-2)]">{p.disclosure}</p>
    </section>
  );
}

export function Objections() {
  return (
    <section className="mt-20" aria-labelledby="obj-title">
      <Eyebrow>Before you decide</Eyebrow>
      <h2 id="obj-title" className={`mt-1 ${h2}`} style={heading}>
        Honest answers to common worries
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TRAINING.objections.map((o) => (
          <div key={o.q} className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)] sm:p-6">
            <span className="block h-6 text-5xl leading-none text-[var(--color-accent)] opacity-40" style={heading} aria-hidden>“</span>
            <h3 className="mt-1 text-lg text-[var(--color-ink)]" style={heading}>{o.q}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{o.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Questions as a native accordion (no script): the first one open, every answer one tap away. */
export function FaqAccordion({
  items = TRAINING.faq,
  eyebrow = "Questions",
  title = "Everything about the course",
}: {
  items?: ReadonlyArray<{ readonly q: string; readonly a: string }>;
  eyebrow?: string;
  title?: string;
} = {}) {
  return (
    <section className="mt-20" aria-labelledby="faq-title">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id="faq-title" className={`mt-1 ${h2}`} style={heading}>
        {title}
      </h2>
      <div className="mt-6 divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-card)] ring-1 ring-[var(--color-border)]">
        {items.map((f, i) => (
          <details key={f.q} open={i === 0} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-[var(--color-ink)] [&::-webkit-details-marker]:hidden">
              {f.q}
              <svg className="h-5 w-5 shrink-0 text-[var(--color-accent)] transition-transform group-open:rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

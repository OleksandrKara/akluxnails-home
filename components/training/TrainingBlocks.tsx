import { TRAINING } from "@/lib/trainingCourse";

const h2 = "text-2xl text-[var(--color-ink)] sm:text-3xl";
const heading = { fontFamily: "var(--font-heading)" } as const;

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">{children}</p>;
}

/** Enrollment as a real sequence (the order is the information), same four-step idea as the PMU
 * Academy's "How enrollment works". */
export function EnrollmentSteps() {
  return (
    <section className="mt-16" aria-labelledby="enroll-title">
      <Eyebrow>How enrollment works</Eyebrow>
      <h2 id="enroll-title" className={`mt-1 ${h2}`} style={heading}>
        From first question to certificate
      </h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2">
        {TRAINING.steps.map((s, i) => (
          <li key={s.title} className="relative rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
            <span className="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white" aria-hidden>
              {i + 1}
            </span>
            <h3 className="mt-2 text-lg text-[var(--color-ink)]" style={heading}>{s.title}</h3>
            <p className="mt-1 text-sm font-medium text-[var(--color-ink-soft)]">{s.text}</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
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

/** The same split the PMU Academy shows: a $1,000 deposit saves the place, the rest comes two weeks
 * before the course, plus the pay-over-time example with its APR disclosure. */
export function PaymentBreakdown() {
  const p = TRAINING.payment;
  const balance = p.total - p.deposit;
  return (
    <section className="mt-16" aria-labelledby="pay-title">
      <Eyebrow>Payment</Eyebrow>
      <h2 id="pay-title" className={`mt-1 ${h2}`} style={heading}>
        How the {usd(p.total)} is paid
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_1fr]">
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted-2)]">When you enroll</p>
          <p className="mt-1 text-3xl text-[var(--color-ink)]" style={heading}>{usd(p.deposit)}</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Deposit. It saves your place in the class.</p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted-2)]">Before the course</p>
          <p className="mt-1 text-3xl text-[var(--color-ink)]" style={heading}>{usd(balance)}</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{p.balanceNote}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] bg-[var(--color-accent-tint-2)] p-5 ring-1 ring-[var(--color-accent)]">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted-2)]">Or pay over time</p>
          <p className="mt-1 text-sm text-[var(--color-ink)]">
            As low as <strong className="text-xl">${klarnaMonthly(p.total).toFixed(2)}/mo</strong>* with Klarna
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">Payment plans are available with {p.options.join(", ")}.</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-snug text-[var(--color-muted-2)]">{p.disclosure}</p>
    </section>
  );
}

export function Objections() {
  return (
    <section className="mt-16" aria-labelledby="obj-title">
      <Eyebrow>Before you decide</Eyebrow>
      <h2 id="obj-title" className={`mt-1 ${h2}`} style={heading}>
        Honest answers to common worries
      </h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {TRAINING.objections.map((o) => (
          <div key={o.q} className="rounded-[var(--radius-lg)] bg-[var(--color-card)] p-5 ring-1 ring-[var(--color-border)]">
            <h3 className="text-base font-medium text-[var(--color-ink)]">“{o.q}”</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{o.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Questions as a native accordion (no script): the first one open, every answer one tap away. */
export function FaqAccordion() {
  return (
    <section className="mt-16" aria-labelledby="faq-title">
      <Eyebrow>Questions</Eyebrow>
      <h2 id="faq-title" className={`mt-1 ${h2}`} style={heading}>
        Everything about the course
      </h2>
      <div className="mt-6 divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-card)] ring-1 ring-[var(--color-border)]">
        {TRAINING.faq.map((f, i) => (
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

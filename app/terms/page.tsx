import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BUSINESS_NAME, LOCATION } from "@/lib/siteData";

export const metadata: Metadata = {
  title: "Terms & SMS Program",
  description: `Terms of use and text messaging program details for ${BUSINESS_NAME}.`,
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 text-sm leading-relaxed text-[var(--color-muted)] sm:px-6">
        <h1
          className="text-3xl text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Terms &amp; SMS Program
        </h1>
        <p className="mt-2 text-xs text-[var(--color-muted-2)]">Last updated July 2026</p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">Using this website</h2>
        <p className="mt-2">
          This website is provided by {BUSINESS_NAME} to let you learn about and book our
          services. By booking an appointment or submitting a request, you confirm the
          information you provide is accurate and that you&apos;re authorized to use the phone
          number and payment method you enter.
        </p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">Text messaging (SMS) program</h2>
        <p className="mt-2">
          When you book an appointment, submit a 4-hand service request, or otherwise give us your
          phone number, you consent to receive text messages from {BUSINESS_NAME} related to:
        </p>
        <ul className="mt-2 list-disc pl-5">
          <li>Confirmation of a request you submitted</li>
          <li>Appointment reminders</li>
          <li>Rebooking follow-ups after a visit</li>
          <li>Occasional win-back or promotional offers, only if you separately opt in to these</li>
        </ul>
        <p className="mt-2">
          <strong className="text-[var(--color-ink)]">Message frequency varies</strong> based on
          your appointment activity — typically a few messages around each visit, plus occasional
          follow-ups if you haven&apos;t booked in a while. <strong className="text-[var(--color-ink)]">Message
          and data rates may apply.</strong> Consent to receive these messages is not a condition
          of purchasing any service.
        </p>
        <p className="mt-2">
          Reply <strong>STOP</strong> at any time to unsubscribe from all texts, or{" "}
          <strong>HELP</strong> for help. You can also opt out by contacting us at{" "}
          <a href={LOCATION.phoneHref} className="text-[var(--color-accent)] hover:underline">
            {LOCATION.phone}
          </a>
          . For details on how we handle your information, see our{" "}
          <a href="/privacy-policy" className="text-[var(--color-accent)] hover:underline">
            Privacy Policy
          </a>
          .
        </p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">Appointments &amp; payments</h2>
        <p className="mt-2">
          Bookings are processed through Square. Any card-on-file requirement, cancellation, or
          no-show policy shown at the time of booking applies to that appointment.
        </p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">Contact us</h2>
        <p className="mt-2">
          Questions about these terms? Reach us at {LOCATION.address} or{" "}
          <a href={LOCATION.phoneHref} className="text-[var(--color-accent)] hover:underline">
            {LOCATION.phone}
          </a>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}

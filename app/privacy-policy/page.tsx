import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BUSINESS_NAME, LOCATION } from "@/lib/siteData";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BUSINESS_NAME} collects, uses, and protects your information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 text-sm leading-relaxed text-[var(--color-muted)] sm:px-6">
        <h1
          className="text-3xl text-[var(--color-ink)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-[var(--color-muted-2)]">Last updated July 2026</p>

        <p className="mt-6">
          {BUSINESS_NAME} (&quot;we,&quot; &quot;us&quot;) operates a nail salon at {LOCATION.address}.
          This policy explains what information we collect when you book an appointment, submit a
          request through our website, or visit the salon, and how we use it.
        </p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">Information we collect</h2>
        <p className="mt-2">
          When you book an appointment, submit a 4-hand service request, or otherwise contact us
          through our website or in person, we collect your name, phone number, and — if you
          provide it — your email address. If you book online, this also includes the appointment
          details you select (service, date/time) and, for card-on-file bookings, payment
          information processed directly by our payment processor (Square); we do not store your
          full card number ourselves.
        </p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">How we use it</h2>
        <p className="mt-2">We use your information to:</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Schedule, confirm, and manage your appointments</li>
          <li>
            Send you appointment-related text messages and calls — confirmations, reminders,
            rebooking follow-ups, and (only with your separate consent) occasional promotional
            offers. See our{" "}
            <a href="/terms" className="text-[var(--color-accent)] hover:underline">
              Terms &amp; SMS Program details
            </a>{" "}
            for message frequency and opt-out instructions.
          </li>
          <li>Respond to questions or requests you send us</li>
          <li>Improve our services and website</li>
        </ul>
        <p className="mt-2">
          <strong className="text-[var(--color-ink)]">We do not sell your personal information</strong>{" "}
          to third parties. Text messaging opt-in data and consent is never shared with or sold to
          any third party for marketing purposes.
        </p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">Who we share it with</h2>
        <p className="mt-2">
          We share information only with the service providers we use to run the business: Square
          (booking and payments), and Twilio (text message delivery). These providers process your
          information solely on our behalf and under their own privacy/security obligations.
        </p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">Your choices</h2>
        <p className="mt-2">
          You can opt out of text messages at any time by replying <strong>STOP</strong> to any
          message from us, or contact us directly at{" "}
          <a href={LOCATION.phoneHref} className="text-[var(--color-accent)] hover:underline">
            {LOCATION.phone}
          </a>{" "}
          to ask us to delete your contact information.
        </p>

        <h2 className="mt-8 text-lg font-medium text-[var(--color-ink)]">Contact us</h2>
        <p className="mt-2">
          Questions about this policy? Reach us at {LOCATION.address} or{" "}
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

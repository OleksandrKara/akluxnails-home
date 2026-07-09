import BookNowButton from "../BookNowButton";
import FadeUp from "./FadeUp";

export default function FinalCtaV4() {
  return (
    <section className="bg-[var(--color-ink)] py-20 text-center text-white">
      <FadeUp className="mx-auto max-w-2xl px-6">
        <h2 className="text-3xl sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
          Your Appointment Is One Tap Away
        </h2>
        <div className="mt-8">
          <BookNowButton className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-9 py-4 text-base font-medium text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-hover)]">
            Book Russian Manicure
          </BookNowButton>
        </div>
      </FadeUp>
    </section>
  );
}

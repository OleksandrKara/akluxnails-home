/** Shared "guarantee" shield-check icon — used anywhere the 14-day guarantee is called out (e.g.
 * the card-entry trust badge in DetailsStep). */
export default function ShieldCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 5 6v5.5c0 4.4 2.9 7.9 7 9 4.1-1.1 7-4.6 7-9V6l-7-2.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 12.2l2 2 4-4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

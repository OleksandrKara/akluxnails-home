/** Small filled star — marks a "Top" tier technician wherever the nail-tech filter appears (see
 * DateTimeStep). Uses currentColor so it always matches whatever text color it's placed next to. */
export default function StarIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.6 6.8L12 17.6l-6.2 3.3 1.6-6.8-5.2-4.6 6.9-.7L12 2.5z" />
    </svg>
  );
}

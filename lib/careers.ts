/**
 * Careers page copy (owner request 2026-11-22). Every fact is the owner's: W-2 employment, a
 * starting wage of $18.50 an hour, overtime under California law, a production bonus, tips kept
 * by the technician, family-owned, friendly team, English not required. Exact bonus numbers are
 * explained at the interview and are deliberately not printed here until the owner confirms them.
 * California pay-transparency law means the posted wage must stay accurate: update START_WAGE
 * (and the JobPosting data below) whenever the starting wage changes.
 */
export const CAREERS = {
  slug: "careers",
  title: "Nail Technician Careers in Downtown San Diego",
  metaTitle: "Russian Manicure Artist Job in Downtown San Diego (W-2)",
  metaDescription:
    "AK.LUX.NAILS, a family-owned Russian manicure studio in Downtown San Diego, is hiring a Russian manicure artist. W-2 employee, starting at $18.50 per hour, overtime under California law, bonuses and 100% of your tips.",
  startWage: "$18.50",
  startWageNumber: 18.5,
  intro: [
    "AK.LUX.NAILS is a family-owned Russian manicure studio in Downtown San Diego. We are looking for a Russian manicure artist to join our friendly team as a W-2 employee.",
    "We operate according to California law and regulations. That means real payroll, real timecards and the breaks the law gives you.",
  ],
  offer: [
    { title: "W-2 employee", text: "You are on our payroll, not renting a booth and not a 1099 contractor. We pay payroll taxes and follow California employment rules." },
    { title: "Starting at $18.50 per hour", text: "Your wage is reviewed every year, and your pay can grow with your work." },
    { title: "Overtime under California law", text: "Overtime is paid at the rate California law requires. We plan schedules so overtime stays the exception, and we pay it every time it happens." },
    { title: "A bonus on top of your wage", text: "You earn a bonus for each completed service above a set number every pay period. We explain the numbers at the interview, so you know exactly how it works." },
    { title: "100% of your tips", text: "Every tip is yours. We never take a share of tips." },
    { title: "Paid twice a month", text: "Pay periods are the 1st to the 15th and the 16th to the end of the month." },
    { title: "Breaks as California law requires", text: "Meal and rest breaks, and time to reset your station between clients." },
    { title: "A friendly team", text: "A small family-owned studio where people help each other and talk to each other." },
  ],
  lookFor: [
    "Russian manicure skills: dry (no soak) e-file and combined technique, clean cuticle work, strong shaping and gel work.",
    "A valid California manicurist license.",
    "Time for the work. A full service takes about 2 hours here, and we book it that way. We do not rush, and quality comes first.",
    "A good communicator with clients and with the team. English is not required.",
    "Responsibility: on time, a tidy station, every sanitation step done every time.",
    "Kind, calm and reliable. Clients come back for the person as much as for the nails.",
  ],
  apply: [
    "Tell us about your experience and how long you have worked with Russian manicure.",
    "Send photos of your work.",
    "Tell us which days and hours you can work.",
  ],
  equal: "AK.LUX.NAILS is an equal opportunity employer. We hire based on skill, reliability and the way you treat people.",
  email: "info@akluxnails.com",
} as const;

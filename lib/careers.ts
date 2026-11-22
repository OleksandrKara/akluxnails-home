/**
 * Careers page copy (owner request 2026-11-22). Every fact is the owner's: W-2 employment, a
 * starting wage of $18.50 an hour, overtime under California law, individual KPI bonuses, pay
 * reviewed on KPIs, tips kept by the technician, family-owned, friendly team, English not
 * required, team trainings, company parties several times a year, a chance to teach courses and
 * train new specialists, managers on hand 12 hours a day 7 days a week, and the salon provides
 * materials, tools, uniform, clients and marketing. Exact bonus numbers are explained at the
 * interview and are deliberately not printed here until the owner confirms them. California
 * pay-transparency law means the posted wage must stay accurate: update startWage,
 * startWageNumber and the FAQ answer whenever the starting wage changes.
 */
export const CAREERS = {
  slug: "careers",
  title: "Russian Manicure Artist Jobs in Downtown San Diego",
  metaTitle: "Russian Manicure Artist Job in Downtown San Diego (W-2, from $18.50/hr)",
  metaDescription:
    "AK.LUX.NAILS, a family-owned Russian manicure studio in Downtown San Diego, is hiring a Russian manicure artist. W-2 employee from $18.50 per hour, overtime, KPI bonuses, 100% of tips, paid trainings and a path to teaching.",
  startWage: "$18.50",
  startWageNumber: 18.5,
  intro: [
    "AK.LUX.NAILS is a family-owned Russian manicure studio in Downtown San Diego. We are looking for a Russian manicure artist to join our friendly team as a W-2 employee.",
    "We operate according to California law and regulations. That means real payroll, real timecards and the breaks the law gives you. The salon brings the clients, the marketing, the materials and the tools. You bring your skill and your care for the person in your chair.",
  ],
  glance: [
    { label: "Role", value: "Russian manicure artist" },
    { label: "Employment", value: "W-2 employee, not a booth renter" },
    { label: "Starting pay", value: "From $18.50 per hour" },
    { label: "Plus", value: "Overtime, KPI bonus, 100% of tips" },
    { label: "Where", value: "Downtown San Diego" },
    { label: "Language", value: "English not required" },
  ],
  pay: [
    { title: "Hourly wage from $18.50", text: "You are paid for your time. The wage is reviewed on your KPIs, so strong work moves your pay up." },
    { title: "Overtime under California law", text: "Overtime is paid at the rate California law requires, every time it happens." },
    { title: "Individual KPI bonuses", text: "Bonuses are set for each person. We explain how they work at the interview, so you know the numbers before you start." },
    { title: "100% of your tips", text: "Every tip is yours. We never take a share." },
  ],
  growth: [
    { title: "You start", text: "A friendly team shows you how the studio works, the standards and the schedule." },
    { title: "You train", text: "We run trainings for our manicure team, so your technique keeps growing." },
    { title: "Your pay grows", text: "Your wage is reviewed on KPIs. Results are measured, and good results are paid." },
    { title: "You can teach", text: "There is a path to teaching courses and training new manicure specialists in our studio." },
  ],
  provided: [
    "All materials and professional products",
    "All tools, kept sterile",
    "A uniform",
    "Clients booked for you",
    "Marketing, so you do not pay for ads",
    "A clean, bright, equipped station",
  ],
  culture: [
    { title: "A friendly team", text: "A small family-owned studio where people help each other and talk to each other." },
    { title: "Managers on hand 12 hours a day, 7 days a week", text: "Whenever the studio is open, a manager is there for questions and support." },
    { title: "Company parties several times a year", text: "We celebrate together, not only work together." },
    { title: "A good location in the city center", text: "Downtown San Diego, easy to reach, in a bright studio on Seventh Avenue." },
    { title: "Sterility is the standard", text: "After every client, tools are cleaned, disinfected, sealed in a pouch and sterilized in a dry-heat sterilizer. Each client gets a new file, buffer and cotton." },
    { title: "Breaks as California law requires", text: "Meal and rest breaks, and time to reset your station between clients." },
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
  faq: [
    {
      q: "Is this a W-2 job or do I rent a booth?",
      a: "It is a W-2 job. You are our employee, on our payroll, with timecards, overtime and breaks under California law. You do not rent a booth and you are not a 1099 contractor.",
    },
    {
      q: "How much does a Russian manicure artist make at AK.LUX.NAILS?",
      a: "The starting wage is $18.50 per hour. On top of that you earn overtime when it applies, an individual KPI bonus and 100% of your tips. Your wage is reviewed on your KPIs.",
    },
    {
      q: "Do I need to speak English?",
      a: "No. English is not required. You do need to be a good communicator with clients and with the team.",
    },
    {
      q: "Do I need a California manicurist license?",
      a: "Yes. Working on paying clients in California requires a license from the California Board of Barbering and Cosmetology, and we ask for a valid license.",
    },
    {
      q: "What does the salon provide?",
      a: "The salon provides all materials and tools, a uniform, the clients and the marketing. You do not buy products or pay for ads.",
    },
    {
      q: "Is there room to grow?",
      a: "Yes. We run trainings for our manicure team and review pay on KPIs. There is also a path to teaching courses and training new manicure specialists.",
    },
    {
      q: "Is there support from managers?",
      a: "Yes. Managers are available 12 hours a day, 7 days a week.",
    },
    {
      q: "What is a Russian manicure artist?",
      a: "A Russian manicure artist does a dry (no soak) manicure with an e-file and nippers, often combined with hand tools, with very clean cuticle work and precise shaping. It is a detailed technique, which is why one full service takes about 2 hours.",
    },
    {
      q: "Where is the salon?",
      a: "AK.LUX.NAILS is in Downtown San Diego, in the city center.",
    },
  ],
  equal: "AK.LUX.NAILS is an equal opportunity employer. We hire based on skill, reliability and the way you treat people.",
  email: "info@akluxnails.com",
} as const;

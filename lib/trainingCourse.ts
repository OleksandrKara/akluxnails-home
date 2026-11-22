/**
 * The Russian manicure course (owner request 2026-11-22), taught at the studio. Every fact here
 * comes from the owner's own course outline. It is a skills course, not a state licensing
 * program, and the page says so plainly (California requires a Board of Barbering and Cosmetology
 * license to work on paying clients). The program is run by Anna Kara's Permanent Makeup Academy
 * (BPPE exemption 94874(f): every program is $2,500 or less), so the price here must stay at or
 * below $2,500 and match the Academy's own course list.
 */
export const TRAINING = {
  slug: "russian-manicure-course",
  title: "Russian Manicure Course in San Diego",
  metaTitle: "Russian Manicure Course for Beginners in San Diego",
  metaDescription:
    "3-day Russian manicure course for beginners at AK.LUX.NAILS in Downtown San Diego. E-file and combined manicure, sanitation, two live models, certificate and 1 month of support. $2,470.",
  priceUsd: 2470,
  price: "$2,470",
  intro: [
    "A 3-day course for people who have never done nails. You learn Russian (dry, e-file) manicure at AK.LUX.NAILS, our working nail studio in Downtown San Diego. We start with the basics: what goes where, and why. Then you practice, first on mock shells, then on two live models.",
    "You finish with a Certificate of Completion. For 1 month after the course you can ask us questions and send your work for feedback.",
  ],
  chips: ["3 days", "In person, San Diego", "Beginners", "Certificate"],
  priceNote: "A $1,000 deposit saves your spot. The rest is paid two weeks before the course.",
  included: [
    "3 days of training in our working nail studio",
    "Practice on mock shells and two live models",
    "Photos for your portfolio",
    "Certificate of Completion",
    "1 month of questions and feedback after the course",
  ],
  notIncluded: "A take-home kit is not included. Travel, accommodation and lunches are not included either.",
  days: [
    {
      title: "Day 1: How a nail works, sanitation and products",
      points: [
        "Nail and skin structure: matrix, nail bed, free edge and cuticle. Nail plate types and how to adjust your work to each.",
        "Shaping: angle, length and balance.",
        "Sanitation: autoclave, dry heat and chemical disinfection, a clean workstation, gloves, mask and goggles.",
        "Tools and products: nippers, pushers, e-file bits, file and buffer grits, rubber, builder and jelly bases, primers, bonders and top coats.",
        "Practice on quail eggs: gel removal, bit choice, speed and pressure, before you touch a person.",
      ],
    },
    {
      title: "Day 2: Prep and strengthening",
      points: [
        "Full prep: cuticle work, buffing, dehydrating and priming.",
        "E-file basics: bit choice, RPM, angle and heat.",
        "Strengthening natural nails with a base and nude builder gel.",
        "Careful cuticle work on your own hand, with an instructor next to you.",
        "Your first live model, with feedback from the instructor.",
      ],
    },
    {
      title: "Day 3: French, glossy red and your portfolio",
      points: [
        "The instructor shows a classic French manicure with a fine brush and a clean smile line.",
        "Two live models: classic French on the first, glossy red on the second.",
        "Photos for your portfolio: light, hand position, angles and basic editing.",
        "Final review with feedback just for you, a plan for what to learn next and a plan for practice at home.",
      ],
    },
  ],
  work: {
    before: [
      { src: "/images/training/before-1.jpg", alt: "A model's natural nails before the manicure" },
      { src: "/images/training/before-2.jpg", alt: "A model's natural nails before the manicure, second hand" },
    ],
    after: [
      { src: "/images/training/after-black.jpg", alt: "Student work on a live model: glossy black gel on square nails" },
      { src: "/images/training/after-burgundy.jpg", alt: "Student work on a live model: burgundy cat-eye gel on almond nails" },
      { src: "/images/training/after-2.jpg", alt: "Student work on a live model: natural pink builder gel overlay" },
    ],
  },
  graduate: { src: "/images/training/graduate.jpg", alt: "A graduate of the Russian manicure course holding her framed certificate and flowers at the AK.LUX.NAILS studio" },
  licenseNotice:
    "The course is a skills course and is not a state licensing program. A California manicurist license from the Board of Barbering and Cosmetology is required to work on paying clients.",
  licenseGuide:
    "We give every student a step-by-step guide to getting a California manicurist license, so you know what comes next after the course.",
  steps: [
    { title: "Talk to Anastasia", text: "Our course curator answers your questions and helps you enroll.", bullets: ["Ask anything about the course.", "She tells you the next date and the places that are open.", "She helps you decide if this course fits your level."] },
    { title: "Deposit and agreement", text: "A $1,000 deposit saves your place.", bullets: ["We email you the enrollment agreement.", "You read and sign it before you pay anything further.", "Cancellation and refund terms are in the agreement, in advance."] },
    { title: "Three days of training", text: "You move from theory to real work.", bullets: ["Day 1: anatomy, sanitation and products, practice on mock shells.", "Day 2: prep, e-file and your first live model.", "Day 3: French and glossy red on two live models, plus photos for your portfolio."] },
    { title: "Certificate and support", text: "You leave with a Certificate of Completion.", bullets: ["1 month of questions and feedback on your work.", "A plan for what to learn next.", "A guide to getting your California manicurist license."] },
  ],
  payment: {
    total: 2470,
    deposit: 1000,
    balanceNote: "Paid two weeks before the course starts.",
    options: ["Affirm", "Klarna", "PayPal"],
    klarna: { months: 24, apr: 19.99 },
    disclosure:
      "*Example: 24 monthly payments at 19.99% APR. Financing through Klarna is subject to credit approval; your rate and term may differ. Ask us about paying with Klarna when you send a request.",
  },
  objections: [
    { q: "I have never done nails.", a: "That is who this course is for. It starts from zero with theory and sanitation, then mock shells, then a live model. An instructor is next to you." },
    { q: "Will I be ready to work after 3 days?", a: "You will have the base: what to do, in what order and why. Nail extensions and pedicure are separate courses. You keep growing with practice, and for 1 month you can send us your work for feedback." },
    { q: "How do I get my license?", a: "We give you a step-by-step guide to getting your California manicurist license. The license is a separate step, and the guide shows you what to do next." },
    { q: "Is hands-on practice enough?", a: "You practice on mock shells, on your own hand for cuticle work, and on two live models, with feedback from the instructor." },
    { q: "Can I pay in parts?", a: "Yes. $1,000 saves your spot and the rest is paid two weeks before the course. You can also use Affirm, Klarna or PayPal." },
    { q: "What if I change my mind?", a: "You see the cancellation and refund terms in the enrollment agreement before you pay anything further." },
  ],
  faq: [
    {
      q: "Do I need experience for the Russian manicure course?",
      a: "No. The course starts from zero with theory and sanitation. You practice step by step before you work on a live model.",
    },
    {
      q: "How do I get a California manicurist license?",
      a: "We give every student a step-by-step guide to getting a California manicurist license. The license itself is a separate step with the California Board of Barbering and Cosmetology, and it is required to work on paying clients in California.",
    },
    {
      q: "How much does the course cost and how do I pay?",
      a: "The course is $2,470. To save your spot you pay a $1,000 deposit, and the rest two weeks before the course. Payment plans are available with Affirm, Klarna and PayPal.",
    },
    {
      q: "Can I get my deposit back?",
      a: "The deposit and the final payment are non-refundable after the date stated in your enrollment agreement. You see these terms in the agreement before you pay. In case of a disaster, each situation is reviewed individually.",
    },
    {
      q: "Is a kit included in the price?",
      a: "No. A take-home kit is not included. In class you work with the studio's professional products and tools.",
    },
    {
      q: "What products do you teach with?",
      a: "Professional brands used in our studio, such as Marathon, Kamilfo, Luna and American Creators.",
    },
    {
      q: "Do you teach nail extensions or pedicure in this course?",
      a: "No. This is the basic course: nail and skin anatomy, materials, e-file and combined manicure, and practice. Nail extensions and pedicure are separate courses.",
    },
    {
      q: "Is there support after the course?",
      a: "Yes. For 1 month after the course you can ask questions and get feedback on your work.",
    },
    {
      q: "When is the next course?",
      a: "Send us a text. Anastasia, our course curator, answers your questions and helps you enroll: she tells you the next date and the places that are open and sends the enrollment agreement.",
    },
  ],
} as const;

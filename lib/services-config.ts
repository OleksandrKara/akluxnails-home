/**
 * Owner-curated homepage service menu — which real Square catalog items to feature and how to
 * group them. Prices/availability are always fetched live from Square (see lib/square/catalog.ts);
 * only *which items to show and how to group/label them* lives here. No CMS yet — same as the
 * blog, I update this file on request when the owner wants the menu changed.
 *
 * Item names must match Square catalog item names exactly (case-sensitive) — catalog.ts resolves
 * each by name and silently drops any that don't currently exist in Square, so a rename in Square
 * won't crash the page, just quietly stop showing that item until this file is updated to match.
 *
 * "1st Visit Specials" category items are excluded categorically in catalog.ts itself — never
 * list one here, but even if one were mistakenly added, it would still be filtered out there.
 */

export interface ServiceGroup {
  title: string;
  /** Real Square catalog item names, in display order. */
  items: string[];
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: "Manicures",
    items: [
      "Regular Manicure Gel-Overlay",
      "Manicure (No Polish)",
      "Gel Nail Extension",
      "European Express Manicure",
      "Japanese manicure",
      "Japanese manicure Deluxe (with massage & spa hand care)",
    ],
  },
  {
    title: "Pedicures",
    items: [
      "Regular Pedicure Gel-Overlay",
      "Pedicure (No Polish)",
    ],
  },
  {
    title: "Mani + Pedi Combos (4 Hands)",
    items: [
      "Pedicure Gel-Overlay and Manicure Gel-Overlay in 4 hands",
      "Pedicure Gel-Overlay and Japanese manicure in 4 hands",
    ],
  },
  {
    title: "Men's Services",
    items: [
      "Men’s Regular Manicure (No Polish)",
      "Men’s Regular Pedicure (No Polish)",
    ],
  },
];

/** Real Square catalog item names offered as add-ons on top of any service above. */
export const ADD_ONS: string[] = [
  "Design",
  "Ombre (design)",
  "Extra strengthening gel",
];

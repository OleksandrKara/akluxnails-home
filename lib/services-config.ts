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
 *
 * Add-ons are scoped per group (not one global list) — e.g. nail removal only makes sense
 * alongside a manicure, not a men's no-polish service. When a visitor has services selected from
 * more than one group, the booking flow shows the union of each selected group's add-ons.
 */

export interface ServiceGroup {
  title: string;
  /** Real Square catalog item names, in display order. */
  items: string[];
  /** Real Square catalog item names offered as add-ons for services in this group. */
  addOns: string[];
}

const MANICURE_ADD_ONS = [
  "Design",
  "Ombre (design)",
  "Removal Acrylic",
  "Removal Gel",
  "Removal Gel X (only removal without manicure, includes filing and shaping of the nail)",
];

const PEDICURE_ADD_ONS = ["Design", "Ombre (design)"];

/** The $0 lead-capture placeholder item for 4-hand appointments (need manual staff coordination,
 * so they're not self-service bookable — see catalog.ts's availableForBooking filter). Booked at
 * the next open slot as a placeholder; staff follow up to schedule the real appointment. */
export const FOUR_HANDS_REQUEST_ITEM_NAME = "Request for 4-Hands Manicure & Pedicure Gel Overlay";

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
    addOns: MANICURE_ADD_ONS,
  },
  {
    title: "Pedicures",
    items: [
      "Regular Pedicure Gel-Overlay",
      "Pedicure (No Polish)",
    ],
    addOns: PEDICURE_ADD_ONS,
  },
  {
    title: "Men's Services",
    items: [
      "Men’s Regular Manicure (No Polish)",
      "Men’s Regular Pedicure (No Polish)",
    ],
    addOns: [],
  },
];

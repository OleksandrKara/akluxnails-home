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
 * Add-ons are modeled as radio-button groups, not a checklist — each group is mutually exclusive
 * (you have one nail finish, one type of product being removed, not several at once), shown right
 * under each selected service in a group that has any. A group with zero add-on groups (Men's
 * Services, 4-Hand Appointments) shows none.
 */

export interface AddOnGroup {
  /** Shown as the radio group's label, e.g. "Nail art" or "Removing old product". */
  label: string;
  /** Real Square catalog item names, radio-style — "None" is always the implicit first option. */
  options: string[];
}

export interface ServiceGroup {
  title: string;
  /** Real Square catalog item names, in display order. */
  items: string[];
  addOnGroups: AddOnGroup[];
}

const NAIL_ART_ADD_ON_GROUP: AddOnGroup = {
  label: "Nail art",
  options: ["Design", "Ombre (design)"],
};

const REMOVAL_ADD_ON_GROUP: AddOnGroup = {
  label: "Removing old product",
  options: [
    "Removal Acrylic",
    "Removal Gel",
    "Removal Gel X (only removal without manicure, includes filing and shaping of the nail)",
  ],
};

/** The $0 lead-capture placeholder item for 4-hand appointments (need manual staff coordination
 * to run two techs at once) — real Square availability search still works on it normally (it's
 * bookable), it's just not a real priced service, so the booking flow skips the card-on-file step
 * for it and frames the confirmation as "we'll follow up" rather than a firm appointment. */
export const FOUR_HANDS_REQUEST_ITEM_NAME = "Request for 4-Hands Manicure & Pedicure Gel Overlay";

/** Curated marketing "starting from" figure — deliberately NOT read from Square, since the real
 * catalog price for this item is genuinely $0 (call-for-pricing; final price is worked out on the
 * follow-up call). Shown wherever this item's price would otherwise render as "$0"/"Request";
 * never used for the actual Square booking or any cart total, both of which the 4-hand flow
 * already keeps hidden. Update this constant directly if the owner changes the figure. */
export const FOUR_HANDS_DISPLAY_PRICE_CENTS = 24900;

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: "Manicures",
    items: [
      "Russian Gel-Overlay Manicure",
      "Manicure (No Polish)",
      "Gel Nail Extension",
      "European Express Manicure",
      "Japanese manicure",
      "Japanese manicure Deluxe (with massage & spa hand care)",
    ],
    addOnGroups: [NAIL_ART_ADD_ON_GROUP, REMOVAL_ADD_ON_GROUP],
  },
  {
    title: "Pedicures",
    items: [
      "Regular Pedicure Gel-Overlay (Dry)",
      "Pedicure (No Polish)",
    ],
    addOnGroups: [NAIL_ART_ADD_ON_GROUP],
  },
  {
    title: "Men's Services",
    items: [
      "Men’s Regular Manicure (No Polish)",
      "Men’s Regular Pedicure (No Polish)",
    ],
    addOnGroups: [],
  },
  {
    title: "4-Hand Appointments",
    items: [FOUR_HANDS_REQUEST_ITEM_NAME],
    addOnGroups: [],
  },
];

export type ExclusivityBucket = "hands" | "feet" | "fourHands";

/** Explicit overrides for the one group that mixes hands/feet items — every other group's items
 * all share one bucket. */
const ITEM_BUCKET_OVERRIDES: Record<string, ExclusivityBucket> = {
  "Men’s Regular Manicure (No Polish)": "hands",
  "Men’s Regular Pedicure (No Polish)": "feet",
};

/** A customer gets one manicure and one pedicure per visit, and the 4-hand request is its own
 * flow that doesn't mix with anything else (see useBookingFlow's addService, which enforces this).
 * Resolved by real group membership, not name-guessing — not every item name actually says
 * "manicure"/"pedicure" (e.g. "Gel Nail Extension") or matches case ("Japanese manicure"). */
export function exclusivityBucketForItem(itemName: string): ExclusivityBucket | null {
  if (itemName === FOUR_HANDS_REQUEST_ITEM_NAME) return "fourHands";
  const override = ITEM_BUCKET_OVERRIDES[itemName];
  if (override) return override;
  if (SERVICE_GROUPS.find((g) => g.title === "Manicures")?.items.includes(itemName)) return "hands";
  if (SERVICE_GROUPS.find((g) => g.title === "Pedicures")?.items.includes(itemName)) return "feet";
  return null;
}

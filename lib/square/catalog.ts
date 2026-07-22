import type { Square } from "square";
import { getSquareClient } from "./client";
import { SERVICE_GROUPS } from "../services-config";

// "1st Visit Specials" is a real category in the live Square catalog covering every first-time-
// client service (e.g. "1st Time Regular Manicure Gel-Overlay"). Excluded categorically here, plus
// a defensive name-prefix check, so the homepage can never show a first-time-only service — those
// are mani.akluxnails.com's job, not this page's.
const FIRST_VISIT_CATEGORY_NAME = "1st Visit Specials";
const FIRST_VISIT_NAME_PREFIX = "1st Time";

export interface ServiceVariationOption {
  variationId: string;
  variationVersion: bigint;
  name: string;
  priceCents: number;
  /** Square's own "assigned team members" setting for this variation
   * (item_variation_data.team_member_ids) — the source resolveTechnicians below reads to decide
   * whose name to attribute this variation to. */
  teamMemberIds?: string[];
  /** Resolved once per catalog snapshot, only for items with more than one variation, and only
   * when exactly one team member is assigned to this variation in Square's own catalog (see
   * resolveTechnicians below) — undefined if unassigned, assigned to more than one person (a
   * genuine rotating pool, not a single-person tier), or the name lookup failed. */
  technicianId?: string;
  technicianName?: string;
}

export interface CatalogServiceItem {
  itemId: string;
  name: string;
  variations: ServiceVariationOption[];
}

interface CatalogSnapshot {
  itemsByName: Map<string, CatalogServiceItem>;
  fetchedAt: number;
}

declare global {
  var __catalogSnapshot: CatalogSnapshot | undefined;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

function isItemVariation(
  obj: Square.CatalogObject,
): obj is Square.CatalogObject.ItemVariation {
  return obj.type === "ITEM_VARIATION";
}

/**
 * Attributes a tiered variation (e.g. "Nail Artist" / "Top Nail Artist") to the one named
 * technician Square's own catalog says can perform it — item_variation_data.team_member_ids, the
 * real "assigned team members" setting for that variation in Square's dashboard. This used to be
 * guessed by searching that variation's live availability and reading off whichever team member's
 * slot came back first, which quietly broke the moment more than one team member could be
 * assigned/eligible for the same variation (adding a new technician to the roster who's also
 * eligible on an existing tier made the "first slot" pick arbitrary, and could resolve two
 * different tiers to the same person — collapsing "Choose your nail tech" down to a single option
 * and hiding it entirely). Reading the catalog's own assignment is deterministic and doesn't
 * depend on anyone's calendar having open slots at all.
 *
 * A variation assigned to more than one team member is a genuine rotating pool, not a
 * single-person tier — deliberately left unresolved so callers fall back to the raw variation
 * name instead of guessing which of several assigned people to show.
 */
async function resolveTechnicians(itemsByName: Map<string, CatalogServiceItem>): Promise<void> {
  const client = getSquareClient();
  const nameCache = new Map<string, string | undefined>();

  async function resolveOne(variation: ServiceVariationOption): Promise<void> {
    const teamMemberIds = variation.teamMemberIds;
    if (!teamMemberIds || teamMemberIds.length !== 1) return;
    const teamMemberId = teamMemberIds[0];
    variation.technicianId = teamMemberId;
    if (nameCache.has(teamMemberId)) {
      variation.technicianName = nameCache.get(teamMemberId);
      return;
    }
    try {
      // Given name only — Square's booking-profile display_name is inconsistently formatted
      // ("Tatiana" vs "Susan Alieva" for the two real technicians here), and a single first name
      // reads more naturally in a "choose your nail tech" picker either way.
      const res = await client.teamMembers.get({ teamMemberId });
      const givenName = res.teamMember?.givenName ?? undefined;
      nameCache.set(teamMemberId, givenName);
      variation.technicianName = givenName;
    } catch (err) {
      console.error("Failed to resolve technician name for", teamMemberId, err);
    }
  }

  const tasks: Promise<void>[] = [];
  for (const item of itemsByName.values()) {
    if (item.variations.length <= 1) continue;
    for (const variation of item.variations) {
      tasks.push(resolveOne(variation));
    }
  }
  await Promise.all(tasks);
}

async function fetchCatalogSnapshot(): Promise<CatalogSnapshot> {
  const client = getSquareClient();
  const page = await client.catalog.list({ types: "ITEM,CATEGORY" });
  const objects: Square.CatalogObject[] = [];
  for await (const obj of page) {
    objects.push(obj);
  }

  const categoryNameById = new Map<string, string>();
  for (const obj of objects) {
    if (obj.type === "CATEGORY" && obj.id && obj.categoryData?.name) {
      categoryNameById.set(obj.id, obj.categoryData.name);
    }
  }

  const itemsByName = new Map<string, CatalogServiceItem>();
  for (const obj of objects) {
    if (obj.type !== "ITEM") continue;
    const data = obj.itemData;
    if (!data?.name) continue;

    const categoryNames = (data.categories ?? [])
      .map((c) => (c.id ? categoryNameById.get(c.id) : undefined))
      .filter((n): n is string => Boolean(n));

    const isFirstVisit =
      categoryNames.includes(FIRST_VISIT_CATEGORY_NAME) ||
      data.name.startsWith(FIRST_VISIT_NAME_PREFIX);
    if (isFirstVisit) continue;

    const variations: ServiceVariationOption[] = (data.variations ?? [])
      .filter(isItemVariation)
      // Square marks some variations (e.g. 4-hand combos, which need manual staff coordination)
      // as not self-service bookable — never surface those for online booking, regardless of
      // what's listed in services-config.ts.
      .filter((v) => v.itemVariationData?.availableForBooking !== false)
      .map((v) => ({
        variationId: v.id,
        variationVersion: v.version ?? BigInt(0),
        name: v.itemVariationData?.name || "Regular",
        priceCents: Number(v.itemVariationData?.priceMoney?.amount ?? BigInt(0)),
        teamMemberIds: v.itemVariationData?.teamMemberIds ?? undefined,
      }));

    if (variations.length === 0) continue;
    itemsByName.set(data.name, { itemId: obj.id, name: data.name, variations });
  }

  await resolveTechnicians(itemsByName);

  return { itemsByName, fetchedAt: Date.now() };
}

async function getCatalogSnapshot(): Promise<CatalogSnapshot> {
  if (global.__catalogSnapshot && Date.now() - global.__catalogSnapshot.fetchedAt < CACHE_TTL_MS) {
    return global.__catalogSnapshot;
  }
  global.__catalogSnapshot = await fetchCatalogSnapshot();
  return global.__catalogSnapshot;
}

export interface CuratedAddOnGroup {
  label: string;
  /** Real, resolved options for this radio group — "None" is implicit, not listed here. */
  options: CatalogServiceItem[];
}

export interface CuratedServiceGroup {
  title: string;
  services: CatalogServiceItem[];
  /** Add-on radio groups for this group's services (e.g. nail removal only for manicures). */
  addOnGroups: CuratedAddOnGroup[];
}

export interface CuratedMenu {
  groups: CuratedServiceGroup[];
}

/**
 * Resolves lib/services-config.ts's curated item names against live Square data. Any name that no
 * longer matches a real catalog item is silently dropped — a rename in Square quietly stops
 * showing that item rather than crashing the page.
 */
export async function getCuratedMenu(): Promise<CuratedMenu> {
  const snapshot = await getCatalogSnapshot();

  const groups = SERVICE_GROUPS.map((group) => ({
    title: group.title,
    services: group.items
      .map((name) => snapshot.itemsByName.get(name))
      .filter((item): item is CatalogServiceItem => Boolean(item)),
    addOnGroups: group.addOnGroups
      .map((addOnGroup) => ({
        label: addOnGroup.label,
        options: addOnGroup.options
          .map((name) => snapshot.itemsByName.get(name))
          .filter((item): item is CatalogServiceItem => Boolean(item)),
      }))
      .filter((addOnGroup) => addOnGroup.options.length > 0),
  })).filter((group) => group.services.length > 0);

  return { groups };
}

/** Reverse lookup used when a booking request only carries a variation id (from the client). */
export async function getServiceVariation(
  variationId: string,
): Promise<{ item: CatalogServiceItem; variation: ServiceVariationOption } | null> {
  const snapshot = await getCatalogSnapshot();
  for (const item of snapshot.itemsByName.values()) {
    const variation = item.variations.find((v) => v.variationId === variationId);
    if (variation) return { item, variation };
  }
  return null;
}

/** Direct by-name lookup, bypassing the curated groups — used for the 4-hands request
 * placeholder item, which is intentionally not part of the regular curated menu. */
export async function getItemByName(name: string): Promise<CatalogServiceItem | null> {
  const snapshot = await getCatalogSnapshot();
  return snapshot.itemsByName.get(name) ?? null;
}

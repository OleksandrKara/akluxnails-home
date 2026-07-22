import type { Square } from "square";
import { getSquareClient } from "./client";
import { SERVICE_GROUPS } from "../services-config";

// "1st Visit Specials" is a real category in the live Square catalog covering every first-time-
// client service (e.g. "1st Time Regular Manicure Gel-Overlay"). Excluded categorically here, plus
// a defensive name-prefix check, so the homepage can never show a first-time-only service — those
// are mani.akluxnails.com's job, not this page's.
const FIRST_VISIT_CATEGORY_NAME = "1st Visit Specials";
const FIRST_VISIT_NAME_PREFIX = "1st Time";

export interface TechnicianRef {
  id: string;
  name: string;
}

export interface ServiceVariationOption {
  variationId: string;
  variationVersion: bigint;
  name: string;
  priceCents: number;
  /** Square's own "assigned team members" setting for this variation
   * (item_variation_data.team_member_ids) — the source resolveTechnicians below reads to build
   * technicians below. */
  teamMemberIds?: string[];
  /** Every technician Square's catalog assigns to this variation, resolved once per catalog
   * snapshot (see resolveTechnicians below) — usually one, but can be more than one when several
   * technicians share the same priced tier (e.g. two people both doing "Nail Artist" while a
   * third does "Top Nail Artist" alone). Undefined for single-variation (non-tiered) services, or
   * if nobody's assignment could be resolved to a name. */
  technicians?: TechnicianRef[];
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
 * Attributes every variation — a tiered main service (e.g. "Nail Artist" / "Top Nail Artist") or a
 * single-variation add-on alike — to every named technician Square's own catalog says can perform
 * it: item_variation_data.team_member_ids, the real "assigned team members" setting for that
 * variation in Square's dashboard. This used to be guessed by searching a variation's live
 * availability and reading off whichever team member's slot came back first, which quietly broke
 * the moment more than one team member could be assigned/eligible for the same variation. Reading
 * the catalog's own assignment is deterministic, doesn't depend on anyone's calendar having open
 * slots at all, and resolves *every* assignee rather than assuming exactly one, so two technicians
 * sharing a price tier both stay individually selectable instead of collapsing into "ambiguous,
 * show nothing".
 *
 * Every variation is resolved, not just tiered ones — an add-on (single variation, no price tiers)
 * can still be restricted to specific technicians in Square (e.g. only some technicians do a
 * particular nail-art design), and the booking flow needs that to correctly narrow "Choose your
 * nail tech" down to people who can actually perform everything the visitor picked, not just the
 * main service. An add-on with no team_member_ids at all resolves to no `technicians` here, which
 * callers treat as "no restriction" (anyone can do it), not "nobody can".
 */
async function resolveTechnicians(itemsByName: Map<string, CatalogServiceItem>): Promise<void> {
  const client = getSquareClient();
  const nameCache = new Map<string, string | undefined>();

  async function resolveName(teamMemberId: string): Promise<string | undefined> {
    if (nameCache.has(teamMemberId)) return nameCache.get(teamMemberId);
    try {
      // Given name only — Square's booking-profile display_name is inconsistently formatted
      // ("Tatiana" vs "Susan Alieva" for the two real technicians here), and a single first name
      // reads more naturally in a "choose your nail tech" picker either way.
      const res = await client.teamMembers.get({ teamMemberId });
      const givenName = res.teamMember?.givenName ?? undefined;
      nameCache.set(teamMemberId, givenName);
      return givenName;
    } catch (err) {
      console.error("Failed to resolve technician name for", teamMemberId, err);
      return undefined;
    }
  }

  async function resolveOne(variation: ServiceVariationOption): Promise<void> {
    const teamMemberIds = variation.teamMemberIds;
    if (!teamMemberIds || teamMemberIds.length === 0) return;
    const resolved = await Promise.all(
      teamMemberIds.map(async (id) => {
        const name = await resolveName(id);
        return name ? { id, name } : null;
      }),
    );
    const technicians = resolved.filter((t): t is TechnicianRef => t !== null);
    if (technicians.length > 0) variation.technicians = technicians;
  }

  const tasks: Promise<void>[] = [];
  for (const item of itemsByName.values()) {
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

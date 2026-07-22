import type { CatalogServiceItem, TechnicianRef } from "./catalog";

// bigint (variation version) isn't JSON-serializable, and isn't safely passable across the
// server/client component boundary either — always convert to this "wire" shape (string version)
// before sending catalog data to the browser, whether via an API response or component props.
export interface WireServiceItem {
  itemId: string;
  name: string;
  variations: {
    variationId: string;
    variationVersion: string;
    name: string;
    priceCents: number;
    technicians?: TechnicianRef[];
  }[];
}

export function toWireItem(item: CatalogServiceItem): WireServiceItem {
  return {
    itemId: item.itemId,
    name: item.name,
    variations: item.variations.map((v) => ({
      variationId: v.variationId,
      variationVersion: v.variationVersion.toString(),
      name: v.name,
      priceCents: v.priceCents,
      technicians: v.technicians,
    })),
  };
}

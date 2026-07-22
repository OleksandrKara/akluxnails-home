export interface TechnicianRef {
  id: string;
  name: string;
}

export interface WireVariation {
  variationId: string;
  variationVersion: string;
  name: string;
  priceCents: number;
  /** Resolved server-side only for tiered items (see lib/square/catalog.ts's resolveTechnicians)
   * — every technician Square's catalog assigns to this variation. Usually one, but can be more
   * than one when several technicians share the same priced tier. Undefined for single-variation
   * services, or if nobody's assignment could be resolved to a name. */
  technicians?: TechnicianRef[];
}

export interface WireServiceItem {
  itemId: string;
  name: string;
  variations: WireVariation[];
}

export interface WireAddOnGroup {
  label: string;
  /** Radio-style options — "None" is implicit, not listed here. */
  options: WireServiceItem[];
}

export interface WireServiceGroup {
  title: string;
  services: WireServiceItem[];
  /** Add-on radio groups for this group's services (e.g. removal add-ons for manicures only). */
  addOnGroups: WireAddOnGroup[];
}

export interface ServicesResponse {
  groups: WireServiceGroup[];
}

export interface WireSlotSegment {
  teamMemberId: string;
  serviceVariationId: string;
  serviceVariationVersion: string;
  durationMinutes: number;
}

export interface WireSlot {
  startAt: string;
  segments: WireSlotSegment[];
}

export interface ContactInfo {
  givenName: string;
  familyName: string;
  phoneNumber: string;
  emailAddress: string;
}

/** One service + the tier the visitor picked for it, plus its own add-on radio-group choices —
 * the unit of selection in the cart. */
export interface SelectedService {
  service: WireServiceItem;
  variation: WireVariation;
  addOns: WireServiceItem[];
}

export type BookingStep = "services" | "addons" | "datetime" | "details" | "done";

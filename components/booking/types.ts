export interface WireVariation {
  variationId: string;
  variationVersion: string;
  name: string;
  priceCents: number;
}

export interface WireServiceItem {
  itemId: string;
  name: string;
  variations: WireVariation[];
}

export interface WireServiceGroup {
  title: string;
  services: WireServiceItem[];
  /** Add-ons applicable to this group's services only (e.g. removal add-ons for manicures). */
  addOns: WireServiceItem[];
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

/** One service + the tier the visitor picked for it — the unit of selection in the cart. */
export interface SelectedService {
  service: WireServiceItem;
  variation: WireVariation;
}

export type BookingStep = "services" | "datetime" | "details" | "done";

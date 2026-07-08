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
}

export interface ServicesResponse {
  groups: WireServiceGroup[];
  addOns: WireServiceItem[];
}

export interface WireSlot {
  startAt: string;
  teamMemberId: string;
  serviceVariationId: string;
  serviceVariationVersion: string;
  durationMinutes: number;
}

export interface ContactInfo {
  givenName: string;
  familyName: string;
  phoneNumber: string;
  emailAddress: string;
}

export type BookingStep = "services" | "datetime" | "contact" | "card" | "confirm" | "done";

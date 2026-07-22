"use client";

import { useState } from "react";
import { exclusivityBucketForItem } from "@/lib/services-config";
import type { BookingStep, ContactInfo, SelectedService, WireServiceItem, WireSlot, WireVariation } from "./types";

export interface BookingFlowState {
  step: BookingStep;
  selectedServices: SelectedService[];
  slot: WireSlot | null;
  contact: ContactInfo;
  smsOptIn: boolean;
  cancellationAgreed: boolean;
  bookingId: string | null;
  technicianName: string | null;
  customerId: string | null;
  /** Whether this customer already had a card on file at booking time — lets DoneStep skip the
   * "secure your appointment" card prompt entirely for a customer who's already secured. */
  hasCardOnFile: boolean;
  /** The customer's nail-tech filter choice on DateTimeStep — null means "any available tech".
   * Not to be confused with `technicianName` above, which is the *confirmed* appointment's
   * technician, only known after a real booking is created. */
  selectedTechId: string | null;
}

const initialContact: ContactInfo = { givenName: "", familyName: "", phoneNumber: "", emailAddress: "" };

/** A homepage-card click always preselects a real variation (the cheapest, for a tiered
 * service) — a nail-tech choice for tiered services, if any, is made later in its own step
 * rather than by withholding preselection here. */
export interface Preselection {
  service: WireServiceItem;
  variation: WireVariation;
}

export function useBookingFlow(preselection?: Preselection) {
  const [state, setState] = useState<BookingFlowState>({
    step: "services",
    selectedServices: preselection
      ? [{ service: preselection.service, variation: preselection.variation, addOns: [] }]
      : [],
    slot: null,
    contact: initialContact,
    smsOptIn: false,
    cancellationAgreed: false,
    bookingId: null,
    technicianName: null,
    customerId: null,
    hasCardOnFile: false,
    selectedTechId: null,
  });

  function goTo(step: BookingStep) {
    setState((s) => ({ ...s, step }));
  }

  function addService(service: WireServiceItem, variation: WireVariation) {
    setState((s) => {
      const bucket = exclusivityBucketForItem(service.name);
      const existing = s.selectedServices.find((sel) => sel.service.itemId === service.itemId);

      const withoutConflicts =
        bucket === "fourHands"
          ? []
          : s.selectedServices.filter((sel) => {
              if (sel.service.itemId === service.itemId) return true;
              const selBucket = exclusivityBucketForItem(sel.service.name);
              if (selBucket === "fourHands") return false;
              if (bucket && selBucket === bucket) return false;
              return true;
            });

      const withoutThisItem = withoutConflicts.filter((sel) => sel.service.itemId !== service.itemId);
      return {
        ...s,
        selectedServices: [...withoutThisItem, { service, variation, addOns: existing?.addOns ?? [] }],
      };
    });
  }

  function removeService(itemId: string) {
    setState((s) => ({ ...s, selectedServices: s.selectedServices.filter((sel) => sel.service.itemId !== itemId) }));
  }

  function proceedToAddOns() {
    setState((s) => ({ ...s, step: "addons" }));
  }

  function proceedToDateTime() {
    setState((s) => ({ ...s, step: "datetime" }));
  }

  /** `null` = "any available tech". A specific choice immediately rewrites every currently
   * tiered selected service's `variation` to that technician's, so the estimated price on
   * AddOns/DateTime/Details is right straight away rather than only once a slot is picked. */
  function setTech(technicianId: string | null) {
    setState((s) => ({
      ...s,
      selectedTechId: technicianId,
      selectedServices: technicianId
        ? s.selectedServices.map((sel) => {
            if (sel.service.variations.length <= 1) return sel;
            const matched = sel.service.variations.find((v) => v.technicians?.some((t) => t.id === technicianId));
            return matched ? { ...sel, variation: matched } : sel;
          })
        : s.selectedServices,
    }));
  }

  /** Radio-style: picking an option for a group replaces whatever was already picked from that
   * same group for this service (pass null to clear it back to "None"). */
  function setServiceAddOn(itemId: string, groupOptionIds: string[], addOn: WireServiceItem | null) {
    setState((s) => ({
      ...s,
      selectedServices: s.selectedServices.map((sel) => {
        if (sel.service.itemId !== itemId) return sel;
        const withoutGroup = sel.addOns.filter((a) => !groupOptionIds.includes(a.itemId));
        return { ...sel, addOns: addOn ? [...withoutGroup, addOn] : withoutGroup };
      }),
    }));
  }

  /** The chosen slot's segments are the ground truth for what's actually about to be booked
   * (see DetailsStep — the real Square appointment is created from `slot`, not from
   * `selectedServices[].variation`). Re-aligning `variation` to match here matters most for the
   * "any tech" path — whichever technician's combo the picked slot came from is only known once
   * a real slot is chosen — but doing it unconditionally is a harmless no-op otherwise. */
  function selectSlot(slot: WireSlot) {
    setState((s) => ({
      ...s,
      slot,
      step: "details",
      selectedServices: s.selectedServices.map((sel) => {
        const matchedVariationId = slot.segments.find((seg) =>
          sel.service.variations.some((v) => v.variationId === seg.serviceVariationId),
        )?.serviceVariationId;
        const matchedVariation = sel.service.variations.find((v) => v.variationId === matchedVariationId);
        return matchedVariation ? { ...sel, variation: matchedVariation } : sel;
      }),
    }));
  }

  function setContact(contact: ContactInfo) {
    setState((s) => ({ ...s, contact }));
  }

  function setSmsOptIn(smsOptIn: boolean) {
    setState((s) => ({ ...s, smsOptIn }));
  }

  function setCancellationAgreed(cancellationAgreed: boolean) {
    setState((s) => ({ ...s, cancellationAgreed }));
  }

  function bookingCreated(
    bookingId: string,
    technicianName: string | null,
    customerId: string,
    hasCardOnFile: boolean,
  ) {
    setState((s) => ({ ...s, bookingId, technicianName, customerId, hasCardOnFile, step: "done" }));
  }

  /** Called once DoneStep's card prompt succeeds, so a re-render doesn't show it again (e.g. if
   * something else in the modal re-renders DoneStep). */
  function cardSecured() {
    setState((s) => ({ ...s, hasCardOnFile: true }));
  }

  const totalCents = state.selectedServices.reduce((sum, sel) => {
    const addOnCents = sel.addOns.reduce((s2, a) => s2 + (a.variations[0]?.priceCents ?? 0), 0);
    return sum + sel.variation.priceCents + addOnCents;
  }, 0);

  return {
    state,
    totalCents,
    goTo,
    addService,
    removeService,
    proceedToAddOns,
    proceedToDateTime,
    setTech,
    setServiceAddOn,
    selectSlot,
    setContact,
    setSmsOptIn,
    setCancellationAgreed,
    bookingCreated,
    cardSecured,
  };
}

export type BookingFlow = ReturnType<typeof useBookingFlow>;

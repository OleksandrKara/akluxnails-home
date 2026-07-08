"use client";

import { useState } from "react";
import { exclusivityBucketForItem } from "@/lib/services-config";
import type { BookingStep, ContactInfo, SelectedService, WireServiceItem, WireSlot, WireVariation } from "./types";

export interface BookingFlowState {
  step: BookingStep;
  selectedServices: SelectedService[];
  /** A service to open the tier picker for on mount (homepage card click on a multi-tier
   * service) — never pre-picks a tier, so the visitor always chooses their own provider. */
  pendingServiceId: string | null;
  slot: WireSlot | null;
  contact: ContactInfo;
  smsOptIn: boolean;
  cancellationAgreed: boolean;
  bookingId: string | null;
  technicianName: string | null;
}

const initialContact: ContactInfo = { givenName: "", familyName: "", phoneNumber: "", emailAddress: "" };

/** `variation` is only set for single-tier services, which have nothing to actually choose —
 * multi-tier services are passed with `variation: null` so the visitor is asked to pick their
 * provider instead of silently getting the cheapest one. */
export interface Preselection {
  service: WireServiceItem;
  variation: WireVariation | null;
}

export function useBookingFlow(preselection?: Preselection) {
  const [state, setState] = useState<BookingFlowState>({
    step: "services",
    selectedServices:
      preselection && preselection.variation
        ? [{ service: preselection.service, variation: preselection.variation, addOns: [] }]
        : [],
    pendingServiceId: preselection && !preselection.variation ? preselection.service.itemId : null,
    slot: null,
    contact: initialContact,
    smsOptIn: false,
    cancellationAgreed: false,
    bookingId: null,
    technicianName: null,
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

  function selectSlot(slot: WireSlot) {
    setState((s) => ({ ...s, slot, step: "details" }));
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

  function bookingCreated(bookingId: string, technicianName: string | null) {
    setState((s) => ({ ...s, bookingId, technicianName, step: "done" }));
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
    setServiceAddOn,
    selectSlot,
    setContact,
    setSmsOptIn,
    setCancellationAgreed,
    bookingCreated,
  };
}

export type BookingFlow = ReturnType<typeof useBookingFlow>;

"use client";

import { useState } from "react";
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
}

const initialContact: ContactInfo = { givenName: "", familyName: "", phoneNumber: "", emailAddress: "" };

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
  });

  function goTo(step: BookingStep) {
    setState((s) => ({ ...s, step }));
  }

  function addService(service: WireServiceItem, variation: WireVariation) {
    setState((s) => {
      const existing = s.selectedServices.find((sel) => sel.service.itemId === service.itemId);
      const withoutThisItem = s.selectedServices.filter((sel) => sel.service.itemId !== service.itemId);
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

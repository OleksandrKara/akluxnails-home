"use client";

import { useState } from "react";
import type { BookingStep, ContactInfo, WireServiceItem, WireSlot, WireVariation } from "./types";

export interface BookingFlowState {
  step: BookingStep;
  service: WireServiceItem | null;
  variation: WireVariation | null;
  addOns: WireServiceItem[];
  slot: WireSlot | null;
  contact: ContactInfo;
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
    step: preselection ? "datetime" : "services",
    service: preselection?.service ?? null,
    variation: preselection?.variation ?? null,
    addOns: [],
    slot: null,
    contact: initialContact,
    bookingId: null,
    technicianName: null,
  });

  function goTo(step: BookingStep) {
    setState((s) => ({ ...s, step }));
  }

  function selectService(service: WireServiceItem, variation: WireVariation) {
    setState((s) => ({ ...s, service, variation }));
  }

  function clearService() {
    setState((s) => ({ ...s, service: null, variation: null, addOns: [] }));
  }

  function proceedToDateTime() {
    setState((s) => ({ ...s, step: "datetime" }));
  }

  function toggleAddOn(addOn: WireServiceItem) {
    setState((s) => {
      const exists = s.addOns.some((a) => a.itemId === addOn.itemId);
      return { ...s, addOns: exists ? s.addOns.filter((a) => a.itemId !== addOn.itemId) : [...s.addOns, addOn] };
    });
  }

  function selectSlot(slot: WireSlot) {
    setState((s) => ({ ...s, slot, step: "details" }));
  }

  function setContact(contact: ContactInfo) {
    setState((s) => ({ ...s, contact }));
  }

  function bookingCreated(bookingId: string, technicianName: string | null) {
    setState((s) => ({ ...s, bookingId, technicianName, step: "done" }));
  }

  const addOnTotalCents = state.addOns.reduce(
    (sum, a) => sum + (a.variations[0]?.priceCents ?? 0),
    0,
  );
  const totalCents = (state.variation?.priceCents ?? 0) + addOnTotalCents;

  return {
    state,
    totalCents,
    goTo,
    selectService,
    clearService,
    proceedToDateTime,
    toggleAddOn,
    selectSlot,
    setContact,
    bookingCreated,
  };
}

export type BookingFlow = ReturnType<typeof useBookingFlow>;

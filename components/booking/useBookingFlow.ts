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
  customerId: string | null;
  bookingId: string | null;
}

const initialContact: ContactInfo = { givenName: "", familyName: "", phoneNumber: "", emailAddress: "" };

export function useBookingFlow() {
  const [state, setState] = useState<BookingFlowState>({
    step: "services",
    service: null,
    variation: null,
    addOns: [],
    slot: null,
    contact: initialContact,
    customerId: null,
    bookingId: null,
  });

  function reset() {
    setState({
      step: "services",
      service: null,
      variation: null,
      addOns: [],
      slot: null,
      contact: initialContact,
      customerId: null,
      bookingId: null,
    });
  }

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
    setState((s) => ({ ...s, slot, step: "contact" }));
  }

  function submitContact(contact: ContactInfo, customerId: string) {
    setState((s) => ({ ...s, contact, customerId, step: "card" }));
  }

  function cardStored() {
    setState((s) => ({ ...s, step: "confirm" }));
  }

  function bookingCreated(bookingId: string) {
    setState((s) => ({ ...s, bookingId, step: "done" }));
  }

  const addOnTotalCents = state.addOns.reduce(
    (sum, a) => sum + (a.variations[0]?.priceCents ?? 0),
    0,
  );
  const totalCents = (state.variation?.priceCents ?? 0) + addOnTotalCents;

  return {
    state,
    totalCents,
    reset,
    goTo,
    selectService,
    clearService,
    proceedToDateTime,
    toggleAddOn,
    selectSlot,
    submitContact,
    cardStored,
    bookingCreated,
  };
}

export type BookingFlow = ReturnType<typeof useBookingFlow>;

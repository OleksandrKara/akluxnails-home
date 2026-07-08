"use client";

import { useState } from "react";
import type { BookingStep, ContactInfo, SelectedService, WireServiceItem, WireSlot, WireVariation } from "./types";

export interface BookingFlowState {
  step: BookingStep;
  selectedServices: SelectedService[];
  addOns: WireServiceItem[];
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
    selectedServices: preselection ? [{ service: preselection.service, variation: preselection.variation }] : [],
    addOns: [],
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
      const withoutThisItem = s.selectedServices.filter((sel) => sel.service.itemId !== service.itemId);
      return { ...s, selectedServices: [...withoutThisItem, { service, variation }] };
    });
  }

  function removeService(itemId: string) {
    setState((s) => ({ ...s, selectedServices: s.selectedServices.filter((sel) => sel.service.itemId !== itemId) }));
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

  function setSmsOptIn(smsOptIn: boolean) {
    setState((s) => ({ ...s, smsOptIn }));
  }

  function setCancellationAgreed(cancellationAgreed: boolean) {
    setState((s) => ({ ...s, cancellationAgreed }));
  }

  function bookingCreated(bookingId: string, technicianName: string | null) {
    setState((s) => ({ ...s, bookingId, technicianName, step: "done" }));
  }

  const servicesTotalCents = state.selectedServices.reduce((sum, sel) => sum + sel.variation.priceCents, 0);
  const addOnTotalCents = state.addOns.reduce((sum, a) => sum + (a.variations[0]?.priceCents ?? 0), 0);
  const totalCents = servicesTotalCents + addOnTotalCents;

  return {
    state,
    totalCents,
    goTo,
    addService,
    removeService,
    proceedToDateTime,
    toggleAddOn,
    selectSlot,
    setContact,
    setSmsOptIn,
    setCancellationAgreed,
    bookingCreated,
  };
}

export type BookingFlow = ReturnType<typeof useBookingFlow>;

"use client";

import { useState } from "react";
import FourHandsRequestModal from "./FourHandsRequestModal";

export default function FourHandsRequestButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        Request a 4-Hand Appointment
      </button>
      {open && <FourHandsRequestModal onClose={() => setOpen(false)} />}
    </>
  );
}

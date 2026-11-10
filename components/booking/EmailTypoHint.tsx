"use client";

import { useState, type RefObject } from "react";
import { suggestEmail } from "@/lib/emailTypo";

/** Mistyped-domain check for an email field: suggests a fix after blur or a submit attempt. */
export function useEmailTypo(email: string, setEmail: (v: string) => void, ref: RefObject<HTMLInputElement | null>) {
  const [checked, setChecked] = useState(false);
  const [kept, setKept] = useState<string | null>(null);
  const trimmed = email.trim();
  const suggestion = trimmed && kept !== trimmed ? suggestEmail(trimmed) : null;
  return {
    suggestion,
    visible: Boolean(suggestion) && checked,
    onChange: (v: string) => {
      setEmail(v);
      setChecked(false);
    },
    onBlur: () => setChecked(true),
    /** Call on submit: returns true (and focuses the field) when a suggestion should block it first. */
    blocksSubmit: () => {
      if (!suggestion) return false;
      setChecked(true);
      ref.current?.focus();
      ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      return true;
    },
    accept: () => {
      if (!suggestion) return;
      setEmail(suggestion);
      setChecked(false);
      ref.current?.focus();
    },
    keep: () => setKept(trimmed),
  };
}

export default function EmailTypoHint({ id, suggestion, onAccept, onKeep }: { id: string; suggestion: string; onAccept: () => void; onKeep: () => void }) {
  return (
    <div id={id} role="status" className="mt-2 grid gap-2 rounded-lg border-2 border-[var(--color-accent)] bg-[var(--color-accent-tint-2)] p-3">
      <p className="min-w-0 break-words text-[15px] leading-snug text-[var(--color-ink)]">
        Did you mean <strong className="break-all">{suggestion}</strong>?
      </p>
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        <button type="button" className="min-h-[44px] rounded-lg bg-[var(--color-accent)] px-3 py-2 text-[15px] font-bold text-white" onClick={onAccept}>
          Yes, use this
        </button>
        <button type="button" className="min-h-[44px] rounded-lg border-2 border-[var(--color-border)] bg-white px-3 py-2 text-[15px] text-[var(--color-ink)]" onClick={onKeep}>
          No, keep mine
        </button>
      </div>
    </div>
  );
}

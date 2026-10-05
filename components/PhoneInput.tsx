"use client";

import { useId, useMemo, useState } from "react";
import { getCountryCallingCode, type CountryCode } from "libphonenumber-js/min";
import { applyInput, countryName, countryOptions, flagEmoji, PINNED_COUNT, textsReach } from "@/lib/phone";
import type { PhoneState } from "@/lib/phoneState";

/**
 * Phone field with a country picker, like Square's (owner request 2026-10-05): US by default and
 * formatted as typed ("(619) 555-0123"), any other country one tap away, a pasted or autofilled
 * "+380…" switches the country by itself. The number is only flagged as wrong once the client
 * leaves the field (no red text while they are still typing), and the parent gets `valid` to
 * keep Continue disabled until it is a real number for that country.
 *
 * The picker is a native <select> laid over the flag chip: on phones that opens the system list,
 * which is easier to scroll and search than a custom dropdown.
 */
export default function PhoneInput({
  value,
  onChange,
  placeholder,
  className = "",
  autoFocus,
  name = "tel",
  showErrors = false,
  radiusClassName = "rounded-[var(--radius-sm)]",
  inputClassName = "py-2",
}: {
  value: PhoneState;
  onChange: (next: PhoneState) => void;
  placeholder?: string;
  /** Extra classes for the outer field box (margins, width). */
  className?: string;
  autoFocus?: boolean;
  name?: string;
  /** Set once the form was submitted, so an empty or wrong number is flagged even if the client
   * never focused the field. */
  showErrors?: boolean;
  /** Corner radius / input padding to match the surrounding form's own fields. */
  radiusClassName?: string;
  inputClassName?: string;
}) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const options = useMemo(() => countryOptions(), []);
  const showError = (touched && value.display !== "" && !value.valid) || (showErrors && !value.valid);
  const dial = getCountryCallingCode(value.country);

  function changeCountry(code: CountryCode) {
    // Re-read the digits already typed under the new country's rules.
    onChange(applyInput(value.display, code));
  }

  return (
    <div className={className}>
      <div
        className={`flex items-stretch overflow-hidden ${radiusClassName} border bg-[var(--color-card,#fff)] transition-colors focus-within:border-[var(--color-accent)] ${
          showError ? "border-red-500" : "border-[var(--color-border)]"
        }`}
      >
        <label className="relative flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-[var(--color-border)] bg-[var(--color-accent-tint-2)] pl-3 pr-2 text-sm">
          <span aria-hidden className="text-base leading-none">
            {flagEmoji(value.country)}
          </span>
          <span className="tabular-nums text-[var(--color-ink)]">+{dial}</span>
          <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden className="text-[var(--color-muted)]">
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <select
            aria-label={`Country code, ${countryName(value.country)} selected`}
            value={value.country}
            onChange={(e) => changeCountry(e.target.value as CountryCode)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            <optgroup label="Common">
              {options.slice(0, PINNED_COUNT).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} (+{c.dial})
                </option>
              ))}
            </optgroup>
            <optgroup label="All countries">
              {options.slice(PINNED_COUNT).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} (+{c.dial})
                </option>
              ))}
            </optgroup>
          </select>
        </label>
        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus={autoFocus}
          required
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
          placeholder={placeholder ?? (value.country === "US" || value.country === "CA" ? "(619) 555-0123" : "Phone number")}
          value={value.display}
          onChange={(e) => onChange(applyInput(e.target.value, value.country))}
          onBlur={() => setTouched(true)}
          className={`min-w-0 flex-1 bg-transparent px-3 text-base text-[var(--color-ink)] outline-none ${inputClassName}`}
        />
        {value.valid ? (
          <span className="flex items-center pr-3 text-green-600" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
        ) : null}
      </div>
      {showError ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
          {value.display === ""
            ? "Please enter your phone number."
            : value.country === "US"
            ? "Please enter a 10-digit US phone number."
            : `This doesn't look like a valid ${countryName(value.country)} number.`}
        </p>
      ) : value.valid && !textsReach(value.country) ? (
        <p className="mt-1 text-xs text-[var(--color-muted)]">We&rsquo;ll call you; text messages only reach US and Canadian numbers.</p>
      ) : null}
    </div>
  );
}

"use client";

/**
 * A/B test of the booking date/time step (owner OK 2026-10-14: "Да, тест"). About half of the
 * visitors who reach this step left before the details step; arm B replaces the long one-month
 * slot list with a day strip + one day's times, without the same time repeated per nail tech.
 *
 *  A = current list (control), B = day strip.
 * The arm is picked once per browser (50/50) and kept in localStorage, so a returning visitor sees
 * the same version. `?dt=a` / `?dt=b` forces an arm (QA, screenshots). Every funnel event carries
 * the arm (metadata.dt_arm) and Clarity gets a `dt_arm` tag, so the two arms can be compared
 * without touching the dashboards. Remove the losing arm when the test ends.
 */
export type DatetimeArm = "A" | "B";
const KEY = "ak_dt_arm_v1";

export function getDatetimeArm(): DatetimeArm {
  if (typeof window === "undefined") return "A";
  try {
    const forced = new URLSearchParams(window.location.search).get("dt");
    if (forced === "a" || forced === "b") {
      const arm = forced.toUpperCase() as DatetimeArm;
      localStorage.setItem(KEY, arm);
      return arm;
    }
    const saved = localStorage.getItem(KEY);
    if (saved === "A" || saved === "B") return saved;
    const arm: DatetimeArm = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(KEY, arm);
    return arm;
  } catch {
    return "A";
  }
}

export function tagClarityArm(arm: DatetimeArm): void {
  try {
    (window as Window & { clarity?: (action: "set", key: string, value: string) => void }).clarity?.("set", "dt_arm", arm);
  } catch {
    // best-effort
  }
}

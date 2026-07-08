import { BUSINESS_NAME, LOCATION } from "@/lib/siteData";

function toUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export interface CalendarEventInfo {
  title: string;
  startAt: string;
  durationMinutes: number;
  description: string;
}

export function googleCalendarUrl(event: CalendarEventInfo): string {
  const start = new Date(event.startAt);
  const end = new Date(start.getTime() + event.durationMinutes * 60 * 1000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: event.description,
    location: LOCATION.address,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function icsDataUrl(event: CalendarEventInfo): string {
  const start = new Date(event.startAt);
  const end = new Date(start.getTime() + event.durationMinutes * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//" + BUSINESS_NAME + "//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@akluxnails.com`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(LOCATION.address)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

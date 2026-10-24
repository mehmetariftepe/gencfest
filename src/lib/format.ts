const TZ = "Europe/Istanbul";

export const fmtDateTime = (d: Date) =>
  d.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: TZ });

export const fmtTime = (d: Date) => d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

export const ageLabel = (a: "under18" | "adult") => (a === "under18" ? "18 altı" : "18+");

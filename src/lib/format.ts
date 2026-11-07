import { ARTISTS, RENTERS } from "./data";

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
export const shortDate = (d: Date | string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
export const dayMonth = (d: Date | string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
export const time = (d: Date | string) => new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export const artistById = (id: string) => ARTISTS.find(a => a.id === id)!;
export const personById = (id: string) => ARTISTS.find(a => a.id === id) ?? RENTERS.find(r => r.id === id)!;
export const firstName = (id: string) => personById(id)?.name.split(" ")[0] ?? "";

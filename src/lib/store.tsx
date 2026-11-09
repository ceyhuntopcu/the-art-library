"use client";

// In-memory app state. Client-side navigation keeps it; a hard refresh resets to the seed data on purpose.
import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";
import {
  ARTISTS, DECISION_DAY, ME_ARTIST, ME_RENTER, RENTERS, RENTAL_DAYS, SEED_ARTWORKS, SEED_PURCHASES, SEED_RENTALS, SEED_THREADS, TODAY, seedStatuses,
  type Artwork, type Claim, type Handover, type Purchase, type Rental, type Thread,
} from "./data";

export type Role = "renter" | "artist";
export interface ToastMsg { id: number; title: string; description?: string }

interface State {
  role: Role;
  artworks: Artwork[];
  rentals: Rental[];
  purchases: Purchase[];
  threads: Thread[];
  saved: string[];
  seen: Record<string, number>;
  toasts: ToastMsg[];
}

type Action =
  | { type: "role"; role: Role }
  | { type: "toast"; title: string; description?: string }
  | { type: "dismissToast"; id: number }
  | { type: "save"; artworkId: string }
  | { type: "seen"; threadId: string; count: number }
  | { type: "request"; rental: Rental }
  | { type: "rental"; id: string; patch: Partial<Rental>; event?: string; artworkStatus?: Artwork["status"] }
  | { type: "purchase"; purchase: Purchase }
  | { type: "message"; threadId: string; from: string; text: string }
  | { type: "thread"; thread: Thread }
  | { type: "listing"; artwork: Artwork }
  | { type: "artwork"; id: string; patch: Partial<Artwork> };

let toastId = 0;
const now = () => TODAY.toISOString();

function init(): State {
  const artworks = SEED_ARTWORKS.map(a => ({ ...a }));
  const rentals = SEED_RENTALS.map(r => ({ ...r, events: [...r.events] }));
  const purchases = SEED_PURCHASES.map(p => ({ ...p }));
  seedStatuses(artworks, rentals, purchases);
  return { role: "renter", artworks, rentals, purchases, threads: SEED_THREADS.map(t => ({ ...t, messages: [...t.messages] })), saved: ["art-004", "art-006", "art-031"], seen: {}, toasts: [] };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "role": return { ...s, role: a.role };
    case "toast": return { ...s, toasts: [...s.toasts, { id: ++toastId, title: a.title, description: a.description }] };
    case "dismissToast": return { ...s, toasts: s.toasts.filter(t => t.id !== a.id) };
    case "seen": return s.seen[a.threadId] === a.count ? s : { ...s, seen: { ...s.seen, [a.threadId]: a.count } };
    case "save": return { ...s, saved: s.saved.includes(a.artworkId) ? s.saved.filter(x => x !== a.artworkId) : [...s.saved, a.artworkId] };
    case "request": return { ...s, rentals: [a.rental, ...s.rentals] };
    case "rental": {
      const rentals = s.rentals.map(r => r.id !== a.id ? r : { ...r, ...a.patch, events: a.event ? [...r.events, { at: now(), title: a.event }] : r.events });
      const target = s.rentals.find(r => r.id === a.id);
      const artworks = a.artworkStatus && target ? s.artworks.map(x => x.id === target.artworkId ? { ...x, status: a.artworkStatus! } : x) : s.artworks;
      return { ...s, rentals, artworks };
    }
    case "purchase": return { ...s, purchases: [a.purchase, ...s.purchases], artworks: s.artworks.map(x => x.id === a.purchase.artworkId ? { ...x, status: "sold" } : x) };
    case "message": return { ...s, threads: s.threads.map(t => t.id === a.threadId ? { ...t, messages: [...t.messages, { from: a.from, text: a.text, at: new Date().toISOString() }] } : t) };
    case "thread": return { ...s, threads: [a.thread, ...s.threads] };
    case "listing": return { ...s, artworks: [a.artwork, ...s.artworks] };
    case "artwork": return { ...s, artworks: s.artworks.map(x => x.id === a.id ? { ...x, ...a.patch } : x) };
  }
}

function useActions(s: State, dispatch: (a: Action) => void) {
  const toast = useCallback((title: string, description?: string) => dispatch({ type: "toast", title, description }), [dispatch]);
  return useMemo(() => {
    const rental = (id: string) => s.rentals.find(r => r.id === id)!;
    const artwork = (id: string) => s.artworks.find(a => a.id === id)!;
    const firstName = (id: string) => (ARTISTS.find(x => x.id === id)?.name ?? RENTERS.find(x => x.id === id)?.name ?? "").split(" ")[0];
    return {
      toast,
      setRole: (role: Role) => dispatch({ type: "role", role }),
      dismissToast: (id: number) => dispatch({ type: "dismissToast", id }),
      toggleSave: (artworkId: string) => {
        dispatch({ type: "save", artworkId });
        toast(s.saved.includes(artworkId) ? "Removed from saved" : "Saved", artwork(artworkId).title);
      },
      requestRental: (artworkId: string, opts: { startDate: Date; handover: Handover; note: string }) => {
        const a = artwork(artworkId);
        const id = `r-${3000 + s.rentals.length}`;
        dispatch({ type: "request", rental: {
          id, artworkId, renterId: ME_RENTER, artistId: a.artistId, status: "requested", startDate: opts.startDate.toISOString(),
          handover: opts.handover, deliveryFee: opts.handover === "delivery" ? a.deliveryFee : 0, rentFee: a.rentFee, deposit: a.deposit, terms: 1,
          note: opts.note, events: [{ at: now(), title: "Rental requested" }],
        } });
        toast("Request sent", `${firstName(a.artistId)} usually replies within a day.`);
        return id;
      },
      cancelRequest: (id: string) => { dispatch({ type: "rental", id, patch: { status: "cancelled" }, event: "Request cancelled" }); toast("Request cancelled", "Nothing was charged."); },
      approve: (id: string) => {
        const r = rental(id);
        dispatch({ type: "rental", id, patch: { status: "active", startDate: now() }, event: `Approved by ${firstName(r.artistId)}`, artworkStatus: "rented" });
        toast("Rental approved", `${firstName(r.renterId)} has been charged and the deposit is held.`);
      },
      decline: (id: string) => { const r = rental(id); dispatch({ type: "rental", id, patch: { status: "declined" }, event: "Declined" }); toast("Request declined", `${firstName(r.renterId)} won't be charged.`); },
      skipAhead: (id: string, days: number) => {
        const r = rental(id);
        const d = new Date(r.startDate); d.setDate(d.getDate() - days);
        dispatch({ type: "rental", id, patch: { startDate: d.toISOString() } });
        toast(`Skipped ahead ${days} days`, "Demo only. This moves the rental's start date back.");
      },
      buyFromRental: (id: string) => {
        const r = rental(id); const a = artwork(r.artworkId);
        dispatch({ type: "rental", id, patch: { status: "bought" }, event: "Bought with rent credited" });
        dispatch({ type: "purchase", purchase: { id: `p-${Date.now()}`, artworkId: a.id, buyerId: r.renterId, price: a.price, credit: Math.min(rentPaid(r), a.price), at: now(), fromRentalId: id } });
        toast(`${a.title} is yours`, `Deposit of $${r.deposit} refunded.`);
      },
      buyOutright: (artworkId: string, handover: Handover) => {
        const a = artwork(artworkId);
        dispatch({ type: "purchase", purchase: { id: `p-${Date.now()}`, artworkId, buyerId: ME_RENTER, price: a.price + (handover === "delivery" ? a.deliveryFee : 0), credit: 0, at: now() } });
        toast(`${a.title} is yours`, `${firstName(a.artistId)} will be in touch about ${handover === "delivery" ? "delivery" : "pickup"}.`);
      },
      renew: (id: string) => {
        const r = rental(id);
        dispatch({ type: "rental", id, patch: { terms: r.terms + 1 }, event: "Renewed for another 3 months" });
        toast("Renewed for 3 more months", `$${r.rentFee} charged. It still counts toward the price.`);
      },
      bookReturn: (id: string, slot: string) => { dispatch({ type: "rental", id, patch: { status: "return_booked", returnSlot: slot }, event: "Return booked" }); toast("Return booked", slot); },
      markCollected: (id: string) => { dispatch({ type: "rental", id, patch: { status: "returned" }, event: "Collected by artist", artworkStatus: "available" }); toast("Marked as collected", "Inspect it within 48 hours."); },
      releaseDeposit: (id: string) => { const r = rental(id); dispatch({ type: "rental", id, patch: { status: "closed" }, event: "Deposit released" }); toast("Deposit released", `$${r.deposit} goes back to ${firstName(r.renterId)}.`); },
      fileClaim: (id: string, claim: Omit<Claim, "status">) => { dispatch({ type: "rental", id, patch: { status: "claim", claim: { ...claim, status: "open" } }, event: `Damage reported · $${claim.amount}` }); toast("Damage reported", "The renter has 72 hours to respond."); },
      respondClaim: (id: string, accept: boolean) => {
        const r = rental(id);
        dispatch({ type: "rental", id, patch: { status: accept ? "closed" : "claim", claim: { ...r.claim!, status: accept ? "accepted" : "disputed" } }, event: accept ? "Claim accepted, remaining deposit released" : "Claim disputed, The Art Library is reviewing" });
        toast(accept ? "Claim accepted" : "Claim disputed", accept ? `$${r.deposit - r.claim!.amount} of your deposit is on its way back.` : "We'll review both sets of photos within 3 days.");
      },
      review: (id: string, stars: number) => { dispatch({ type: "rental", id, patch: { review: stars } }); toast("Thanks for the review"); },
      markSeen: (threadId: string, count: number) => dispatch({ type: "seen", threadId, count }),
      sendMessage: (threadId: string, from: string, text: string) => dispatch({ type: "message", threadId, from, text }),
      openThread: (artworkId: string, renterId: string, artistId: string) => {
        const existing = s.threads.find(t => t.artworkId === artworkId && t.renterId === renterId && t.artistId === artistId);
        if (existing) return existing.id;
        const id = `t-${Date.now()}`;
        dispatch({ type: "thread", thread: { id, artworkId, renterId, artistId, messages: [] } });
        return id;
      },
      createListing: (artwork: Artwork) => { dispatch({ type: "listing", artwork }); toast("Listing published", artwork.title); },
      updateArtwork: (id: string, patch: Partial<Artwork>) => dispatch({ type: "artwork", id, patch }),
    };
  }, [s, dispatch, toast]);
}

type Store = State & { actions: ReturnType<typeof useActions>; me: string };
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const actions = useActions(state, dispatch);
  const value = useMemo(() => ({ ...state, actions, me: state.role === "renter" ? ME_RENTER : ME_ARTIST }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}

export function dayOf(r: Rental) {
  return Math.max(0, Math.floor((TODAY.getTime() - new Date(r.startDate).getTime()) / 86400000));
}
/** End of the current term: renewals push it out 90 days at a time. */
export function endDate(r: Rental) {
  const d = new Date(r.startDate); d.setDate(d.getDate() + RENTAL_DAYS * r.terms); return d;
}
/** The keep / renew / return choice opens 14 days before the current term ends. */
export const decisionDay = (r: Rental) => RENTAL_DAYS * r.terms - (RENTAL_DAYS - DECISION_DAY);
export const rentPaid = (r: Rental) => r.rentFee * r.terms;
/** Every rent payment counts toward the price, so long renters can end up owing nothing. */
export const leftToPay = (r: Rental, price: number) => Math.max(0, price - rentPaid(r));
/** Renewing is offered only while another term would still leave something to pay. */
export const canRenew = (r: Rental, price: number) => rentPaid(r) + r.rentFee < price;

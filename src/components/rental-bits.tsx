"use client";

import Link from "next/link";
import { Progress } from "@/components/arc/progress/progress";
import { Timeline } from "@/components/arc/timeline/timeline";
import { ArtworkArt } from "@/components/artwork-art";
import { RentalBadge } from "@/components/ui-bits";
import { RENTAL_DAYS, TODAY, type Artwork, type Rental } from "@/lib/data";
import { dayMonth, money, personById, shortDate } from "@/lib/format";
import { dayOf, decisionDay, endDate } from "@/lib/store";

export function RentalProgress({ rental }: { rental: Rental }) {
  const total = Math.min(dayOf(rental), RENTAL_DAYS * rental.terms);
  const day = total - RENTAL_DAYS * (rental.terms - 1);
  const left = RENTAL_DAYS - day;
  return (
    <div className="grid gap-2">
      <Progress value={day} max={RENTAL_DAYS} label={rental.terms > 1 ? `Term ${rental.terms} · day ${day} of ${RENTAL_DAYS}` : `Day ${day} of ${RENTAL_DAYS}`} />
      <div className="flex justify-between text-[12.5px] text-muted tnum">
        <span>Started {dayMonth(rental.startDate)}</span>
        <span>{total >= decisionDay(rental) ? `${left} days left to decide` : `Decide by ${shortDate(endDate(rental))}`}</span>
      </div>
    </div>
  );
}

/** One row per rental, used on both the collector's and the artist's lists. */
export function RentalRow({ rental, artwork, href, perspective }: { rental: Rental; artwork: Artwork; href: string; perspective: "renter" | "artist" }) {
  const other = personById(perspective === "renter" ? rental.artistId : rental.renterId);
  const showProgress = rental.status === "active";
  return (
    <Link href={href} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 rounded-[var(--radius-panel)] border border-line p-4 transition hover:border-foreground/30 sm:grid-cols-[96px_minmax(0,1fr)_auto]">
      <div className="rounded-md bg-wall p-2"><ArtworkArt artwork={artwork} /></div>
      <div className="grid min-w-0 gap-1.5">
        <div className="flex flex-wrap items-center gap-2"><span className="serif text-xl leading-tight">{artwork.title}</span><RentalBadge status={rental.status} /></div>
        <span className="text-[13px] text-muted">{perspective === "renter" ? `by ${other.name}` : `Rented by ${other.name}`} · {money(rental.rentFee)} for 3 months{rental.terms > 1 ? ` · renewed ${rental.terms - 1}×` : ""} · {money(rental.deposit)} deposit</span>
        {showProgress ? <div className="max-w-md pt-1"><RentalProgress rental={rental} /></div> : null}
        {rental.status === "requested" ? <span className="text-[13px] text-muted">Starts {shortDate(rental.startDate)} · {rental.handover === "delivery" ? "Delivery" : "Pickup"}</span> : null}
        {rental.status === "return_booked" && rental.returnSlot ? <span className="text-[13px] text-muted">Return: {rental.returnSlot}</span> : null}
      </div>
      <span className="hidden text-[13px] text-muted sm:block">View →</span>
    </Link>
  );
}

export function RentalHistory({ rental }: { rental: Rental }) {
  const events = [...rental.events].reverse().map((e, i) => ({ id: `${rental.id}-${rental.events.length - i}`, at: e.at, title: e.title, tone: (e.title.includes("Damage") || e.title.includes("disputed") ? "danger" : e.title.includes("released") || e.title.includes("Bought") ? "success" : "neutral") as "neutral" | "success" | "danger" }));
  return <Timeline label="Rental history" events={events} now={TODAY.getTime()} timeZone="America/New_York" scrollToNew={false} />;
}

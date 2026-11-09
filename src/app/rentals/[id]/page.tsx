"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/arc/button/button";
import { Breadcrumb } from "@/components/arc/breadcrumb/breadcrumb";
import { Dialog, DialogContent } from "@/components/arc/dialog/dialog";
import { RadioCards } from "@/components/arc/radio-cards/radio-cards";
import { Alert } from "@/components/arc/alert/alert";
import { Rating } from "@/components/arc/rating/rating";
import { Avatar } from "@/components/arc/avatar/avatar";
import { ArtworkArt } from "@/components/artwork-art";
import { RentalHistory, RentalProgress } from "@/components/rental-bits";
import { Actions, RentalBadge, SummaryRow, Missing } from "@/components/ui-bits";
import { TODAY } from "@/lib/data";
import { artistById, money, shortDate } from "@/lib/format";
import { canRenew, dayOf, decisionDay, endDate, leftToPay, rentPaid, useStore } from "@/lib/store";

const HOURS = ["10:00–12:00", "14:00–16:00", "18:00–20:00"];

/** Three pickup slots in the last days of the rental, or the next few days if that's already passed. */
function returnSlots(end: Date) {
  const first = new Date(Math.max(TODAY.getTime() + 86400000, end.getTime() - 3 * 86400000));
  return HOURS.map((h, i) => {
    const d = new Date(first.getTime() + i * 86400000);
    return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${h}`;
  });
}

export default function RentalPage() {
  const { id } = useParams<{ id: string }>();
  const { rentals, artworks, actions } = useStore();
  const router = useRouter();
  const [buyOpen, setBuyOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);
  const rental = rentals.find(r => r.id === id);
  if (!rental) return <Missing what="rental" />;
  const art = artworks.find(a => a.id === rental.artworkId)!;
  const artist = artistById(rental.artistId);
  const first = artist.name.split(" ")[0];
  const day = dayOf(rental);
  const deciding = rental.status === "active" && day >= decisionDay(rental);
  const owe = leftToPay(rental, art.price);
  const paid = rentPaid(rental);
  const renewable = canRenew(rental, art.price);
  const slots = returnSlots(endDate(rental));
  const chosenSlot = slot && slots.includes(slot) ? slot : slots[0];

  const message = () => router.push(`/messages?t=${actions.openThread(art.id, rental.renterId, rental.artistId)}`);

  return (
    <div className="container-page">
      <div className="pt-6"><Breadcrumb items={[{ label: "My rentals", href: "/rentals" }, { label: art.title }]} /></div>
      <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-14">
        <div className="order-last grid content-start gap-4 lg:order-none">
          <Link href={`/art/${art.id}`} className="mx-auto w-full max-w-sm lg:max-w-none"><ArtworkArt artwork={art} framed /></Link>
          <div className="flex items-center gap-3">
            <Avatar name={artist.name} />
            <div className="grid"><span className="text-[14px] font-medium">{artist.name}</span><span className="text-[13px] text-muted">{artist.city}</span></div>
            <Button variant="secondary" size="sm" className="ml-auto" onClick={message}>Message {first}</Button>
          </div>
        </div>

        <div className="grid content-start gap-8">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2"><RentalBadge status={rental.status} /><span className="text-[13px] text-muted">Rental #{rental.id.toUpperCase()}</span></div>
            <h1 className="serif text-[40px] leading-[1.02] md:text-5xl">{art.title}</h1>
          </div>

          {rental.status === "requested" ? (
            <section className="grid gap-4">
              <Alert tone="info" title={`Waiting for ${first} to approve`}>Artists reply within 48 hours. You won&apos;t be charged until then.</Alert>
              <Actions><Button variant="danger" onClick={() => actions.cancelRequest(rental.id)}>Cancel request</Button></Actions>
            </section>
          ) : null}

          {rental.status === "active" && !deciding ? (
            <section className="grid gap-5">
              <RentalProgress rental={rental} />
              <p className="text-[15px]">It&apos;s yours to enjoy until {shortDate(endDate(rental))}. Two weeks before then we&apos;ll ask whether you want to keep it, renew it or send it back.</p>
              <Actions>
                <Button variant="primary" onClick={() => setBuyOpen(true)}>{owe ? `Buy it now for ${money(owe)}` : "Keep it"}</Button>
                <Button variant="secondary" onClick={() => setReturnOpen(true)}>Return early</Button>
                <Button variant="ghost" onClick={() => actions.skipAhead(rental.id, decisionDay(rental) - day)}>Demo: skip to decision time</Button>
              </Actions>
            </section>
          ) : null}

          {deciding ? (
            <section className="grid gap-5">
              <RentalProgress rental={rental} />
              <h2 className="serif text-[26px] leading-tight md:text-3xl">{art.title} has been on your wall for {day} days. What next?</h2>
              <div className={`grid gap-4 ${renewable ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
                <div className="grid content-start gap-3 rounded-[var(--radius-panel)] border border-line p-5">
                  <span className="text-[15px] font-medium">Keep it</span>
                  <span className="serif text-4xl tnum">{money(owe)}</span>
                  <p className="text-[13px] text-muted">{owe ? `${money(art.price)} minus the ${money(paid)} you've already paid in rent.` : "Your rent has already covered the full price."} Your {money(rental.deposit)} deposit is refunded.</p>
                  <Actions className="pt-1"><Button variant="primary" onClick={() => setBuyOpen(true)}>{owe ? "Buy it" : "Keep it"}</Button></Actions>
                </div>
                {renewable ? (
                  <div className="grid content-start gap-3 rounded-[var(--radius-panel)] border border-line p-5">
                    <span className="text-[15px] font-medium">Renew it</span>
                    <span className="serif text-4xl tnum">{money(rental.rentFee)}</span>
                    <p className="text-[13px] text-muted">Three more months on your wall. This rent counts toward the price too, so buying later would cost {money(Math.max(0, owe - rental.rentFee))}.</p>
                    <Actions className="pt-1"><Button variant="secondary" onClick={() => actions.renew(rental.id)}>Renew for 3 months</Button></Actions>
                  </div>
                ) : null}
                <div className="grid content-start gap-3 rounded-[var(--radius-panel)] border border-line p-5">
                  <span className="text-[15px] font-medium">Send it back</span>
                  <span className="serif text-4xl">Free</span>
                  <p className="text-[13px] text-muted">{first} collects it. Your deposit comes back within 48 hours of a clean inspection.</p>
                  <Actions className="pt-1"><Button variant="secondary" onClick={() => setReturnOpen(true)}>Book the return</Button></Actions>
                </div>
              </div>
            </section>
          ) : null}

          {rental.status === "return_booked" ? <Alert tone="info" title="Return booked">{first} will collect it on {rental.returnSlot}. Leave it off the wall, ready to wrap.</Alert> : null}
          {rental.status === "returned" ? <Alert tone="info" title={`${first} is inspecting the work`}>Your {money(rental.deposit)} deposit is released after a clean check, within 48 hours.</Alert> : null}

          {rental.status === "claim" && rental.claim ? (
            <section className="grid gap-4">
              <Alert tone={rental.claim.status === "disputed" ? "warning" : "danger"} title={rental.claim.status === "disputed" ? "You disputed this claim" : `${first} reported damage`}>
                {rental.claim.reason}: {money(rental.claim.amount)} of your {money(rental.deposit)} deposit. {rental.claim.note}
              </Alert>
              {rental.claim.status === "open" ? (
                <Actions>
                  <Button variant="primary" onClick={() => actions.respondClaim(rental.id, true)}>Accept and release {money(rental.deposit - rental.claim.amount)}</Button>
                  <Button variant="secondary" onClick={() => actions.respondClaim(rental.id, false)}>Dispute claim</Button>
                </Actions>
              ) : <p className="text-[14px] text-muted">The Art Library is comparing the handover and return photos. You&apos;ll hear back within 3 days.</p>}
            </section>
          ) : null}

          {rental.status === "closed" ? (
            <section className="grid gap-4">
              <Alert tone="success" title="Rental closed">
                {rental.claim?.status === "accepted" ? `${money(rental.deposit - rental.claim.amount)} of your deposit was refunded.` : `Your ${money(rental.deposit)} deposit was refunded.`}
              </Alert>
              <Rating className="justify-self-start" label={`Rate renting from ${first}`} value={rental.review ?? 0} onChange={v => actions.review(rental.id, v)} />
            </section>
          ) : null}

          {rental.status === "bought" ? <Alert tone="success" title="You own this work">Your {money(Math.min(paid, art.price))} of rent counted toward the {money(art.price)} price, and your deposit was refunded.</Alert> : null}
          {rental.status === "declined" || rental.status === "cancelled" ? <Alert tone="info" title={rental.status === "declined" ? `${first} couldn't take this one` : "You cancelled this request"}>Nothing was charged. <Link href="/browse" className="link">Browse similar works</Link></Alert> : null}

          <section className="grid gap-2.5 rounded-[var(--radius-panel)] bg-soft p-5">
            <SummaryRow label="Rental for 3 months" value={money(rental.rentFee)} />
            {rental.terms > 1 ? <SummaryRow label={`Rent paid over ${rental.terms} terms`} value={money(paid)} /> : null}
            <SummaryRow label={rental.handover === "delivery" ? "Delivery" : "Pickup"} value={rental.deliveryFee ? money(rental.deliveryFee) : "Free"} />
            <SummaryRow label="Deposit" value={money(rental.deposit)} />
            <SummaryRow label="Full price" value={money(art.price)} muted />
            <SummaryRow label="Dates" value={`${shortDate(rental.startDate)} – ${shortDate(endDate(rental))}`} muted />
          </section>

          <section className="grid gap-3">
            <h2 className="text-[15px] font-medium">History</h2>
            <RentalHistory rental={rental} />
          </section>
        </div>
      </div>

      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent title={`Buy ${art.title}`} description="Your rent counts toward the price.">
          <div className="grid gap-2.5 py-2">
            <SummaryRow label="Full price" value={money(art.price)} />
            <SummaryRow label="Rent already paid" value={`−${money(Math.min(paid, art.price))}`} />
            <SummaryRow label="Pay today" value={money(owe)} strong />
            <SummaryRow label="Deposit refunded" value={money(rental.deposit)} muted />
          </div>
          <Actions className="justify-end pt-3">
            <Button variant="ghost" onClick={() => setBuyOpen(false)}>Not yet</Button>
            <Button variant="primary" onClick={() => { actions.buyFromRental(rental.id); setBuyOpen(false); }}>{owe ? `Pay ${money(owe)}` : "Keep it"}</Button>
          </Actions>
        </DialogContent>
      </Dialog>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent title="Book the return" description={`${first} collects it for free. Pick a slot before ${shortDate(endDate(rental))}.`}>
          <div className="py-2"><RadioCards name="return-slot" layout="list" value={chosenSlot} onValueChange={setSlot} options={slots.map(s => ({ value: s, label: s }))} /></div>
          <p className="text-[13px] text-muted">Take it off the wall and photograph the front, back and corners before {first} arrives.</p>
          <Actions className="justify-end pt-3">
            <Button variant="ghost" onClick={() => setReturnOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { actions.bookReturn(rental.id, chosenSlot); setReturnOpen(false); }}>Book return</Button>
          </Actions>
        </DialogContent>
      </Dialog>
    </div>
  );
}

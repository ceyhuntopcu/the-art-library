"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/arc/button/button";
import { Breadcrumb } from "@/components/arc/breadcrumb/breadcrumb";
import { Dialog, DialogContent } from "@/components/arc/dialog/dialog";
import { Alert } from "@/components/arc/alert/alert";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Badge } from "@/components/arc/badge/badge";
import { Select } from "@/components/arc/select/select";
import { NumberField } from "@/components/arc/number-field/number-field";
import { Textarea } from "@/components/arc/textarea/textarea";
import { ArtworkArt } from "@/components/artwork-art";
import { RentalHistory, RentalProgress } from "@/components/rental-bits";
import { Actions, Missing, RentalBadge, SummaryRow } from "@/components/ui-bits";
import { RENTERS } from "@/lib/data";
import { money, shortDate } from "@/lib/format";
import { endDate, rentPaid, useStore } from "@/lib/store";

const REASONS = ["Frame damaged", "Scratch or scuff on the surface", "Water or moisture damage", "Missing hardware", "Other"];

export default function StudioRentalPage() {
  const { id } = useParams<{ id: string }>();
  const { rentals, artworks, actions } = useStore();
  const router = useRouter();
  const [claimOpen, setClaimOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const rental = rentals.find(r => r.id === id);
  if (!rental) return <Missing what="rental" />;
  const art = artworks.find(a => a.id === rental.artworkId)!;
  const renter = RENTERS.find(r => r.id === rental.renterId)!;
  const first = renter.name.split(" ")[0];
  const claimAmount = amount ?? Math.min(120, Math.round(rental.deposit / 20) * 10);
  const message = () => router.push(`/messages?t=${actions.openThread(art.id, rental.renterId, rental.artistId)}`);

  return (
    <div className="container-page">
      <div className="pt-6"><Breadcrumb items={[{ label: "Studio", href: "/studio" }, { label: art.title }]} /></div>
      <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-14">
        <div className="order-last grid content-start gap-4 lg:order-none">
          <Link href={`/art/${art.id}`} className="mx-auto w-full max-w-sm lg:max-w-none"><ArtworkArt artwork={art} framed /></Link>
        </div>
        <div className="grid content-start gap-8">
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2"><RentalBadge status={rental.status} /><span className="text-[13px] text-muted">Rental #{rental.id.toUpperCase()}</span></div>
            <h1 className="serif text-[40px] leading-[1.02] md:text-5xl">{art.title}</h1>
          </div>

          <section className="grid gap-4 rounded-[var(--radius-panel)] border border-line p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar name={renter.name} size="lg" />
              <div className="grid"><span className="font-medium">{renter.name}</span><span className="text-[13px] text-muted">{renter.city}</span></div>
              <Button variant="secondary" size="sm" className="ml-auto" onClick={message}>Message {first}</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success" size="sm">Email verified</Badge>
              <Badge size="sm">{renter.pastRentals ? `${renter.pastRentals} past rentals` : "First rental"}</Badge>
              {renter.rating ? <Badge size="sm">{renter.rating} ★ from artists</Badge> : null}
            </div>
            {rental.note ? <p className="rounded-xl bg-soft px-4 py-3 text-[14px]">“{rental.note}”</p> : null}
          </section>

          {rental.status === "requested" ? (
            <section className="grid gap-4">
              <h2 className="serif text-3xl">{first} would like to rent this</h2>
              <p className="text-[15px] text-muted">From {shortDate(rental.startDate)} to {shortDate(endDate(rental))}, by {rental.handover === "delivery" ? "you delivering it" : "picking it up from your studio"}. You earn {money(rental.rentFee + rental.deliveryFee)}, and a {money(rental.deposit)} deposit protects the work.</p>
              <Actions>
                <Button variant="primary" onClick={() => actions.approve(rental.id)}>Approve request</Button>
                <Button variant="secondary" onClick={() => actions.decline(rental.id)}>Decline</Button>
              </Actions>
            </section>
          ) : null}

          {rental.status === "active" ? (
            <section className="grid gap-4">
              <RentalProgress rental={rental} />
              <p className="text-[15px] text-muted">{rental.terms > 1 ? `${first} has renewed ${rental.terms - 1}× and paid ${money(rentPaid(rental))} in rent so far. ` : ""}Two weeks before each term ends, {first} decides whether to buy it, renew it or send it back. Every rent payment comes off the {money(art.price)} price if they buy.</p>
            </section>
          ) : null}

          {rental.status === "return_booked" ? (
            <section className="grid gap-4">
              <Alert tone="info" title="Return booked">Collect it on {rental.returnSlot}.</Alert>
              <Actions><Button variant="primary" onClick={() => actions.markCollected(rental.id)}>Mark as collected</Button></Actions>
            </section>
          ) : null}

          {rental.status === "returned" ? (
            <section className="grid gap-4">
              <h2 className="serif text-3xl">Inspect the return</h2>
              <p className="text-[15px] text-muted">Compare it with your handover photos. If you do nothing, the deposit is released automatically after 48 hours.</p>
              <Actions>
                <Button variant="primary" onClick={() => actions.releaseDeposit(rental.id)}>Release {money(rental.deposit)} deposit</Button>
                <Button variant="danger" onClick={() => setClaimOpen(true)}>Report damage</Button>
              </Actions>
            </section>
          ) : null}

          {rental.status === "claim" && rental.claim ? (
            <Alert tone={rental.claim.status === "disputed" ? "warning" : "info"} title={rental.claim.status === "disputed" ? `${first} disputed your claim` : `Waiting for ${first} to respond`}>
              {rental.claim.reason}: {money(rental.claim.amount)}. {rental.claim.status === "disputed" ? "The Art Library will review both sets of photos within 3 days." : "They have 72 hours to accept or dispute."}
            </Alert>
          ) : null}
          {rental.status === "closed" ? <Alert tone="success" title="Rental closed">{rental.claim?.status === "accepted" ? `You received ${money(rental.claim.amount)} from the deposit.` : "Deposit released in full."}{rental.review ? ` ${first} rated it ${rental.review} ★.` : ""}</Alert> : null}
          {rental.status === "bought" ? <Alert tone="success" title={`${first} bought it`}>You received the full {money(art.price)}: {money(Math.min(rentPaid(rental), art.price))} in rent plus {money(Math.max(0, art.price - rentPaid(rental)))} at purchase.</Alert> : null}
          {rental.status === "declined" || rental.status === "cancelled" ? <Alert tone="info" title={rental.status === "declined" ? "You declined this request" : `${first} cancelled`}>Nothing was charged.</Alert> : null}

          <section className="grid gap-2.5 rounded-[var(--radius-panel)] bg-soft p-5">
            <SummaryRow label="Rental fee" value={money(rental.rentFee)} />
            <SummaryRow label={rental.handover === "delivery" ? "Delivery (you deliver)" : "Pickup"} value={rental.deliveryFee ? money(rental.deliveryFee) : "Free"} />
            <SummaryRow label="Deposit held" value={money(rental.deposit)} />
            <SummaryRow label="Full price" value={money(art.price)} muted />
          </section>

          <section className="grid gap-3"><h2 className="text-[15px] font-medium">History</h2><RentalHistory rental={rental} /></section>
        </div>
      </div>

      <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
        <DialogContent title="Report damage" description={`${first} has 72 hours to accept or dispute.`}>
          <div className="grid gap-4 py-2">
            <Select id="claim-reason" label="What happened" value={reason} onValueChange={setReason} options={REASONS.map(r => ({ value: r, label: r }))} />
            <NumberField id="claim-amount" label={`Amount (up to ${money(rental.deposit)})`} value={claimAmount} onValueChange={setAmount} min={10} max={rental.deposit} step={10} prefix="$" />
            <Textarea id="claim-note" label="Note to the renter" rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Describe the damage and how you worked out the amount." />
          </div>
          <Actions className="justify-end pt-3">
            <Button variant="ghost" onClick={() => setClaimOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { actions.fileClaim(rental.id, { amount: claimAmount, reason, note }); setClaimOpen(false); }}>Send claim</Button>
          </Actions>
        </DialogContent>
      </Dialog>
    </div>
  );
}

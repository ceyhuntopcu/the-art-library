"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { DatePicker } from "@/components/arc/date-picker/date-picker";
import { RadioCards } from "@/components/arc/radio-cards/radio-cards";
import { Textarea } from "@/components/arc/textarea/textarea";
import { Checkbox } from "@/components/arc/checkbox/checkbox";
import { Button } from "@/components/arc/button/button";
import { Breadcrumb } from "@/components/arc/breadcrumb/breadcrumb";
import { ArtworkArt } from "@/components/artwork-art";
import { Actions, PageHeader, SummaryRow, Missing } from "@/components/ui-bits";
import { RENTAL_DAYS, TODAY, type Handover } from "@/lib/data";
import { artistById, money, shortDate } from "@/lib/format";
import { useStore } from "@/lib/store";

const AGREEMENT = [
  "I'll keep the work indoors, away from direct sun and damp.",
  "If it comes back damaged, the artist can claim up to the deposit.",
  "When the three months are up, I'll either buy it or book a return.",
];

export default function RentPage() {
  const { id } = useParams<{ id: string }>();
  const { artworks, actions } = useStore();
  const router = useRouter();
  const art = artworks.find(a => a.id === id);
  const minStart = new Date(TODAY); minStart.setDate(minStart.getDate() + 2);
  const [start, setStart] = useState<Date | undefined>(minStart);
  const [handover, setHandover] = useState<Handover>("pickup");
  const [note, setNote] = useState("");
  const [agreed, setAgreed] = useState<boolean[]>([false, false, false]);
  const [tried, setTried] = useState(false);
  if (!art) return <Missing what="artwork" />;
  const artist = artistById(art.artistId);
  const end = start ? new Date(start.getTime() + RENTAL_DAYS * 86400000) : undefined;
  const delivery = handover === "delivery" ? art.deliveryFee : 0;
  const ready = start && agreed.every(Boolean);

  const submit = () => {
    setTried(true);
    if (!ready) return;
    const rid = actions.requestRental(art.id, { startDate: start!, handover, note });
    router.push(`/rentals/${rid}`);
  };

  return (
    <div className="container-page">
      <div className="pt-6"><Breadcrumb items={[{ label: "Browse", href: "/browse" }, { label: art.title, href: `/art/${art.id}` }, { label: "Request to rent" }]} /></div>
      <PageHeader title="Request to rent" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-8">
          <section className="grid gap-3">
            <h2 className="text-[15px] font-medium">When should it start?</h2>
            <div className="max-w-xs"><DatePicker id="start-date" label="Start date" value={start} onChange={setStart} minDate={minStart} description={end ? `Three months, ending ${shortDate(end)}` : undefined} /></div>
          </section>
          <section className="grid gap-3">
            <h2 className="text-[15px] font-medium">How will you get it?</h2>
            <RadioCards name="handover" value={handover} onValueChange={v => setHandover(v as Handover)} minColumnWidth={220} options={[
              { value: "pickup", label: "Pick it up", description: `From ${artist.name.split(" ")[0]}'s studio in ${artist.city}`, meta: "Free" },
              { value: "delivery", label: "Artist delivers and hangs it", description: "Hooks, level and a condition check included", meta: money(art.deliveryFee) },
            ]} />
          </section>
          <section className="grid gap-3">
            <Textarea id="note" label={`Note to ${artist.name.split(" ")[0]} (optional)`} placeholder="Where will it hang? Anything they should know?" value={note} onChange={e => setNote(e.target.value)} rows={3} />
          </section>
          <section className="grid gap-3">
            <h2 className="text-[15px] font-medium">Rental agreement</h2>
            <div className="grid gap-3 rounded-[var(--radius-panel)] bg-soft p-5">
              {AGREEMENT.map((t, i) => (
                <Checkbox key={i} id={`agree-${i}`} label={t} checked={agreed[i]} onCheckedChange={v => setAgreed(a => a.map((x, j) => j === i ? v === true : x))} />
              ))}
            </div>
            {tried && !agreed.every(Boolean) ? <p className="text-[13px] text-[var(--danger)]">Tick all three to send the request.</p> : null}
          </section>
        </div>

        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <div className="grid gap-5 rounded-[var(--radius-panel)] border border-line p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 shrink-0 rounded-md bg-wall p-2"><ArtworkArt artwork={art} /></div>
              <div className="grid"><span className="serif text-xl leading-tight">{art.title}</span><span className="text-[13px] text-muted">{artist.name}</span></div>
            </div>
            <div className="grid gap-2.5">
              <SummaryRow label="Rental for 3 months" value={money(art.rentFee)} />
              <SummaryRow label={handover === "delivery" ? "Delivery and hanging" : "Pickup"} value={delivery ? money(delivery) : "Free"} />
              <SummaryRow label="Refundable deposit" value={money(art.deposit)} />
              <SummaryRow label="Charged when approved" value={money(art.rentFee + delivery + art.deposit)} strong />
            </div>
            <p className="text-[13px] text-muted">The {money(art.deposit)} deposit comes back after a clean return. If you buy, your {money(art.rentFee)} rent comes off the {money(art.price)} price.</p>
            <Actions><Button variant="primary" size="lg" onClick={submit}>Send request</Button></Actions>
          </div>
        </aside>
      </div>
    </div>
  );
}

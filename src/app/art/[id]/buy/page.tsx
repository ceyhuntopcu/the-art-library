"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { RadioCards } from "@/components/arc/radio-cards/radio-cards";
import { Button } from "@/components/arc/button/button";
import { Breadcrumb } from "@/components/arc/breadcrumb/breadcrumb";
import { ArtworkArt } from "@/components/artwork-art";
import { Actions, PageHeader, SummaryRow, Missing } from "@/components/ui-bits";
import type { Handover } from "@/lib/data";
import { artistById, money } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function BuyPage() {
  const { id } = useParams<{ id: string }>();
  const { artworks, actions } = useStore();
  const router = useRouter();
  const [handover, setHandover] = useState<Handover>("pickup");
  const [busy, setBusy] = useState(false);
  const art = artworks.find(a => a.id === id);
  if (!art) return <Missing what="artwork" />;
  const artist = artistById(art.artistId);
  const delivery = handover === "delivery" ? art.deliveryFee : 0;

  const pay = () => {
    setBusy(true);
    setTimeout(() => { actions.buyOutright(art.id, handover); router.push("/rentals?tab=owned"); }, 600);
  };

  return (
    <div className="container-page">
      <div className="pt-6"><Breadcrumb items={[{ label: "Browse", href: "/browse" }, { label: art.title, href: `/art/${art.id}` }, { label: "Buy" }]} /></div>
      <PageHeader title={`Buy ${art.title}`} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-8">
          <section className="grid gap-3">
            <h2 className="text-[15px] font-medium">How will you get it?</h2>
            <RadioCards name="buy-handover" value={handover} onValueChange={v => setHandover(v as Handover)} minColumnWidth={220} options={[
              { value: "pickup", label: "Pick it up", description: `From the studio in ${artist.city}`, meta: "Free" },
              { value: "delivery", label: "Artist delivers and hangs it", description: "Within a week of purchase", meta: money(art.deliveryFee) },
            ]} />
          </section>
          <ArtworkArt artwork={art} framed className="max-w-md" />
          <p className="max-w-prose text-[13px] text-muted">Not sure yet? <Link className="link" href={`/art/${art.id}/rent`}>Rent it for {money(art.rentFee)}</Link> instead. If you keep it, the rent comes off the price.</p>
        </div>
        <aside className="grid content-start gap-5 lg:sticky lg:top-24">
          <div className="grid gap-5 rounded-[var(--radius-panel)] border border-line p-6">
            <div className="grid gap-2.5">
              <SummaryRow label="Artwork" value={money(art.price)} />
              <SummaryRow label={handover === "delivery" ? "Delivery and hanging" : "Pickup"} value={delivery ? money(delivery) : "Free"} />
              <SummaryRow label="Total" value={money(art.price + delivery)} strong />
            </div>
            <SummaryRow label="Pay with" value="Visa ending 4421" muted />
            <p className="text-[13px] text-muted">{artist.name} includes a signed certificate of authenticity.</p>
            <Actions><Button variant="primary" size="lg" loading={busy} onClick={pay}>Pay {money(art.price + delivery)}</Button></Actions>
          </div>
        </aside>
      </div>
    </div>
  );
}

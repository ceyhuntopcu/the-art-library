"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import { Button } from "@/components/arc/button/button";
import { Breadcrumb } from "@/components/arc/breadcrumb/breadcrumb";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Alert } from "@/components/arc/alert/alert";
import { Tooltip } from "@/components/arc/tooltip/tooltip";
import { ArtworkArt } from "@/components/artwork-art";
import { ArtCard, Actions, LinkButton, SaveButton, StatusBadge, SummaryRow, Missing } from "@/components/ui-bits";
import { ME_RENTER } from "@/lib/data";
import { artistById, money } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function ArtworkPage() {
  const { id } = useParams<{ id: string }>();
  const { artworks, rentals, role, me, actions } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState("rent");
  const art = artworks.find(a => a.id === id);
  if (!art) return <Missing what="artwork" />;
  const artist = artistById(art.artistId);
  const mine = role === "artist" && art.artistId === me;
  const myRental = rentals.find(r => r.artworkId === art.id && r.renterId === ME_RENTER && ["requested", "active", "return_booked"].includes(r.status));
  const more = artworks.filter(a => a.artistId === art.artistId && a.id !== art.id && a.status !== "hidden").slice(0, 4);
  const unavailable = art.status !== "available";

  const message = () => {
    const t = actions.openThread(art.id, ME_RENTER, art.artistId);
    router.push(`/messages?t=${t}`);
  };

  return (
    <div className="container-page">
      <div className="pt-6"><Breadcrumb items={[{ label: "Browse", href: "/browse" }, { label: art.medium, href: `/browse?medium=${encodeURIComponent(art.medium)}` }, { label: art.title }]} /></div>
      <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
        <div className="relative">
          <ArtworkArt artwork={art} framed />
          <div className="absolute top-4 right-4"><SaveButton artworkId={art.id} /></div>
          <p className="mt-3 text-[12.5px] text-muted">{art.width} × {art.height} cm{art.framed ? ", framed" : ", unframed"}.</p>
        </div>

        <div className="grid content-start gap-6">
          <div className="grid gap-2">
            <div className="flex items-center gap-2"><StatusBadge status={art.status} /><span className="text-[13px] text-muted">Listed {art.listedDaysAgo === 0 ? "today" : art.listedDaysAgo === 1 ? "yesterday" : `${art.listedDaysAgo} days ago`}</span></div>
            <h1 className="serif text-[40px] leading-[1.02] md:text-5xl">{art.title}</h1>
            <p className="text-muted">{artist.name}, {art.year} · {art.medium} · {art.width} × {art.height} cm</p>
          </div>

          {mine ? (
            <div className="grid gap-4 rounded-[var(--radius-panel)] bg-soft p-5">
              <p className="text-[14px]">This is your listing. Renters see {money(art.rentFee)} for three months, a {money(art.deposit)} deposit and a full price of {money(art.price)}.</p>
              <Actions><LinkButton href="/studio" variant="primary">Manage in studio</LinkButton></Actions>
            </div>
          ) : (
            <>
              <SegmentedControl className="justify-self-start" label="Rent or buy" value={mode} onValueChange={setMode} options={[{ value: "rent", label: "Rent for 3 months" }, { value: "buy", label: "Buy now" }]} />
              {mode === "rent" ? (
                <div className="grid gap-3">
                  <SummaryRow label="Rental for 3 months" value={<span className="font-medium">{money(art.rentFee)}</span>} />
                  <SummaryRow label={<Tooltip content="Charged when the artist approves, refunded after a clean return or when you buy."><span className="cursor-help underline decoration-dotted underline-offset-4">Refundable deposit</span></Tooltip>} value={money(art.deposit)} />
                  <SummaryRow label="If you decide to keep it" value={`${money(art.price - art.rentFee)} more`} muted />
                  <p className="text-[13px] text-muted">After 3 months, keep it, renew it or send it back. Every rent payment counts toward the {money(art.price)} price.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  <SummaryRow label="Full price" value={<span className="font-medium">{money(art.price)}</span>} />
                  <SummaryRow label="Pickup from the studio" value="Free" muted />
                  <SummaryRow label="Artist delivers and hangs it" value={money(art.deliveryFee)} muted />
                </div>
              )}

              {myRental ? (
                <Alert tone="info" title="You already have this one">
                  <Link href={`/rentals/${myRental.id}`} className="link">View your rental</Link>
                </Alert>
              ) : unavailable ? (
                <Alert tone="warning" title={art.status === "sold" ? "This work has been sold" : "On someone else's wall right now"}>
                  {art.status === "sold" ? "Browse more from this artist below." : "Save it and we'll show it as available when it comes back."}
                </Alert>
              ) : role === "artist" ? (
                <Alert tone="info" title="You're viewing as an artist">Switch to Collector at the top to rent or buy.</Alert>
              ) : (
                <Actions>
                  {mode === "rent"
                    ? <LinkButton href={`/art/${art.id}/rent`} variant="primary" size="lg">Request to rent</LinkButton>
                    : <LinkButton href={`/art/${art.id}/buy`} variant="primary" size="lg">Buy for {money(art.price)}</LinkButton>}
                  <Button variant="secondary" size="lg" onClick={message}>Message {artist.name.split(" ")[0]}</Button>
                </Actions>
              )}
              {mode === "rent" && !unavailable && role === "renter" && !myRental ? <p className="text-[13px] text-muted">You won&apos;t be charged until {artist.name.split(" ")[0]} approves.</p> : null}
            </>
          )}

          <div className="grid gap-3 border-t border-line pt-6">
            <p className="text-[15px] leading-relaxed">{art.description}</p>
            <dl className="grid grid-cols-2 gap-y-2 text-[14px]">
              <dt className="text-muted">Medium</dt><dd>{art.medium}</dd>
              <dt className="text-muted">Size</dt><dd className="tnum">{art.width} × {art.height} cm</dd>
              <dt className="text-muted">Framed</dt><dd>{art.framed ? "Yes" : "No, ready to hang"}</dd>
              <dt className="text-muted">Year</dt><dd className="tnum">{art.year}</dd>
              <dt className="text-muted">Handover</dt><dd>Free pickup, or delivery for {money(art.deliveryFee)}</dd>
            </dl>
          </div>

          <Link href={`/artists/${artist.id}`} className="flex items-center gap-3 rounded-[var(--radius-panel)] border border-line p-4 transition hover:border-foreground/30">
            <Avatar name={artist.name} size="lg" />
            <div className="grid">
              <span className="font-medium">{artist.name}</span>
              <span className="text-[13px] text-muted">{artist.city} · {artist.km} km away · {artist.rating} ★ ({artist.reviews})</span>
            </div>
          </Link>
        </div>
      </div>

      {more.length ? (
        <section className="mt-20 grid gap-6">
          <div className="flex items-baseline justify-between"><h2 className="serif text-3xl">More from {artist.name}</h2><Link href={`/artists/${artist.id}`} className="link text-[13px]">See all</Link></div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">{more.map(a => <ArtCard key={a.id} artwork={a} />)}</div>
        </section>
      ) : null}
    </div>
  );
}

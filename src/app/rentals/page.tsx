"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/arc/tabs/tabs";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { ArtworkArt } from "@/components/artwork-art";
import { RentalRow } from "@/components/rental-bits";
import { LinkButton, PageHeader } from "@/components/ui-bits";
import { ME_RENTER } from "@/lib/data";
import { artistById, money, shortDate } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function RentalsPage() {
  return <Suspense><Rentals /></Suspense>;
}

function Rentals() {
  const params = useSearchParams();
  const { rentals, artworks, purchases } = useStore();
  const [tab, setTab] = useState(params.get("tab") ?? "current");
  const mine = rentals.filter(r => r.renterId === ME_RENTER);
  const current = mine.filter(r => ["active", "return_booked", "returned", "claim"].includes(r.status));
  const requests = mine.filter(r => r.status === "requested");
  const past = mine.filter(r => ["closed", "declined", "cancelled", "bought"].includes(r.status));
  const owned = purchases.filter(p => p.buyerId === ME_RENTER);
  const art = (id: string) => artworks.find(a => a.id === id)!;

  const list = (items: typeof mine, empty: string) => items.length
    ? <div className="grid gap-3">{items.map(r => <RentalRow key={r.id} rental={r} artwork={art(r.artworkId)} href={`/rentals/${r.id}`} perspective="renter" />)}</div>
    : <EmptyState title={empty} description="Find something you'd like to live with for a while." action={<LinkButton href="/browse" variant="secondary">Browse works</LinkButton>} />;

  return (
    <div className="container-page">
      <PageHeader eyebrow="Dana Rivera" title="My rentals"><LinkButton href="/browse" variant="secondary">Find another piece</LinkButton></PageHeader>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Rentals">
          <TabsTrigger value="current">On my walls ({current.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="owned">Owned ({owned.length})</TabsTrigger>
        </TabsList>
        <div className="pt-6">
          <TabsContent value="current">{list(current, "Nothing on your walls yet")}</TabsContent>
          <TabsContent value="requests">{list(requests, "No open requests")}</TabsContent>
          <TabsContent value="past">{list(past, "No past rentals yet")}</TabsContent>
          <TabsContent value="owned">
            {owned.length ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
                {owned.map(p => {
                  const a = art(p.artworkId);
                  return (
                    <Link key={p.id} href={`/art/${a.id}`} className="grid content-start gap-3">
                      <div className="grid aspect-[4/5] place-items-center rounded-[10px] bg-wall"><ArtworkArt artwork={a} style={{ width: `${Math.min(74, (74 * 1.25 * a.width) / a.height)}%` }} className={`shadow-[0_14px_18px_-12px_rgb(0_0_0/.45)]`} /></div>
                      <div className="grid gap-0.5">
                        <span className="serif text-[19px] leading-tight">{a.title}</span>
                        <span className="text-[13px] text-muted">{artistById(a.artistId).name}</span>
                        <span className="text-[13px] text-muted tnum">Bought {shortDate(p.at)} · paid {money(p.price - p.credit)}{p.credit ? ` after ${money(p.credit)} rent credit` : ""}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : <EmptyState title="You don't own any works yet" description="Rent something first. If you keep it, the rent comes off the price." />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

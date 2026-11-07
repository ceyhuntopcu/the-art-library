"use client";

import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/arc/tabs/tabs";
import { MetricCard } from "@/components/arc/metric-card/metric-card";
import { Switch } from "@/components/arc/switch/switch";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { ArtworkArt } from "@/components/artwork-art";
import { RentalRow } from "@/components/rental-bits";
import { LinkButton, PageHeader, StatusBadge } from "@/components/ui-bits";
import { ME_ARTIST } from "@/lib/data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function StudioPage() {
  const { rentals, artworks, purchases, actions } = useStore();
  const [tab, setTab] = useState("todo");
  const mine = rentals.filter(r => r.artistId === ME_ARTIST);
  const works = artworks.filter(a => a.artistId === ME_ARTIST);
  const todo = mine.filter(r => ["requested", "return_booked", "returned"].includes(r.status));
  const art = (id: string) => artworks.find(a => a.id === id)!;
  const earned = mine.filter(r => !["requested", "declined", "cancelled"].includes(r.status)).reduce((s, r) => s + r.rentFee + r.deliveryFee, 0)
    + purchases.filter(p => art(p.artworkId).artistId === ME_ARTIST).reduce((s, p) => s + p.price - p.credit, 0);

  const visibleSwitch = (w: (typeof works)[number]) => (
    <Switch aria-label={`Show ${w.title} to renters`} disabled={w.status === "rented" || w.status === "sold"} checked={w.status !== "hidden"}
      onCheckedChange={on => { actions.updateArtwork(w.id, { status: on ? "available" : "hidden" }); actions.toast(on ? "Listing visible" : "Listing hidden", w.title); }} />
  );

  return (
    <div className="container-page">
      <PageHeader eyebrow="Mara Okafor · Studio" title="Your studio"><LinkButton href="/studio/new" variant="primary">List a new work</LinkButton></PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Earned (CAD)" value={earned} context="Rentals, delivery and sales" />
        <MetricCard label="On rent now" value={mine.filter(r => r.status === "active").length} context="Works on someone's wall" />
        <MetricCard label="New requests" value={mine.filter(r => r.status === "requested").length} context="Reply within 48 hours" />
        <MetricCard label="Listed works" value={works.filter(w => w.status !== "hidden").length} context={`${works.filter(w => w.status === "available").length} available right now`} />
      </div>

      <div className="pt-10">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Studio">
            <TabsTrigger value="todo">Needs you ({todo.length})</TabsTrigger>
            <TabsTrigger value="rentals">All rentals ({mine.length})</TabsTrigger>
            <TabsTrigger value="listings">Listings ({works.length})</TabsTrigger>
          </TabsList>
          <div className="pt-6">
            <TabsContent value="todo">
              {todo.length
                ? <div className="grid gap-3">{todo.map(r => <RentalRow key={r.id} rental={r} artwork={art(r.artworkId)} href={`/studio/rentals/${r.id}`} perspective="artist" />)}</div>
                : <EmptyState title="You're all caught up" description="New requests and returns to inspect will show up here." />}
            </TabsContent>
            <TabsContent value="rentals">
              <div className="grid gap-3">{mine.map(r => <RentalRow key={r.id} rental={r} artwork={art(r.artworkId)} href={`/studio/rentals/${r.id}`} perspective="artist" />)}</div>
            </TabsContent>
            <TabsContent value="listings">
              <div className="hidden overflow-x-auto rounded-[var(--radius-panel)] border border-line md:block">
                <table className="w-full min-w-[720px] text-left text-[14px]">
                  <thead className="text-[12.5px] text-muted">
                    <tr className="border-b border-line">
                      <th className="px-4 py-3 font-medium">Work</th><th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">3 months</th><th className="px-4 py-3 text-right font-medium">Deposit</th>
                      <th className="px-4 py-3 text-right font-medium">Price</th><th className="px-4 py-3 font-medium">Visible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.map(w => (
                      <tr key={w.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3">
                          <Link href={`/art/${w.id}`} className="flex items-center gap-3">
                            <span className="w-12 shrink-0 rounded bg-wall p-1.5"><ArtworkArt artwork={w} /></span>
                            <span className="grid"><span className="font-medium">{w.title}</span><span className="text-[12.5px] text-muted">{w.medium} · {w.width}×{w.height} cm</span></span>
                          </Link>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                        <td className="px-4 py-3 text-right tnum">{money(w.rentFee)}</td>
                        <td className="px-4 py-3 text-right tnum">{money(w.deposit)}</td>
                        <td className="px-4 py-3 text-right tnum">{money(w.price)}</td>
                        <td className="px-4 py-3">
                          {visibleSwitch(w)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="grid gap-3 md:hidden">
                {works.map(w => (
                  <li key={w.id} className="flex items-center gap-3 rounded-[var(--radius-panel)] border border-line p-3">
                    <Link href={`/art/${w.id}`} className="w-14 shrink-0 rounded bg-wall p-1.5"><ArtworkArt artwork={w} /></Link>
                    <Link href={`/art/${w.id}`} className="grid min-w-0 flex-1 gap-1">
                      <span className="flex flex-wrap items-center gap-2"><span className="truncate font-medium">{w.title}</span><StatusBadge status={w.status} /></span>
                      <span className="text-[12.5px] text-muted tnum">{money(w.rentFee)} / 3 mo · {money(w.deposit)} deposit · {money(w.price)}</span>
                    </Link>
                    {visibleSwitch(w)}
                  </li>
                ))}
              </ul>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

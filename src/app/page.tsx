"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchField } from "@/components/arc/search-field/search-field";
import { ArtworkArt } from "@/components/artwork-art";
import { ArtCard, Actions, LinkButton } from "@/components/ui-bits";
import { artistById, money } from "@/lib/format";
import { useStore } from "@/lib/store";

const MEDIUM_LINKS = ["Oil", "Acrylic", "Watercolour", "Print", "Photography", "Drawing", "Mixed media"];

export default function Home() {
  const { artworks } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const live = artworks.filter(a => a.status !== "hidden");
  const featured = live.find(a => a.id === "art-001") ?? live[0];
  const fresh = [...live].sort((a, b) => a.listedDaysAgo - b.listedDaysAgo).slice(0, 8);
  const affordable = live.filter(a => a.rentFee <= 100 && a.status === "available").slice(0, 4);
  const big = live.filter(a => a.width >= 90 && a.status === "available").slice(0, 4);

  return (
    <div className="container-page">
      <section className="grid items-center gap-10 py-12 md:grid-cols-[1.1fr_1fr] md:py-16">
        <div className="grid max-w-xl gap-6">
          <span className="eyebrow">Original art, on loan · Montreal</span>
          <h1 className="serif text-5xl leading-[1.02] md:text-6xl">Live with it for three months. Keep it only if you love it.</h1>
          <p className="text-[16px] text-muted">Rent original work from independent Montreal artists. When the three months are up, buy it with your rent taken off the price, or send it back.</p>
          <form className="grid gap-3" onSubmit={e => { e.preventDefault(); router.push(`/browse${q ? `?q=${encodeURIComponent(q)}` : ""}`); }}>
            <SearchField id="home-search" label="Search artworks" placeholder="Try ‘blue’, ‘oil’ or an artist’s name" value={q} onValueChange={setQ} />
            <Actions>
              <LinkButton href="/browse" variant="primary">Browse all {live.length} works</LinkButton>
              <LinkButton href="/how-it-works" variant="secondary">How renting works</LinkButton>
            </Actions>
          </form>
        </div>
        <Link href={`/art/${featured.id}`} className="group grid gap-3">
          <ArtworkArt artwork={featured} framed className="transition duration-300 group-hover:-translate-y-0.5" />
          <span className="text-[13px] text-muted"><span className="serif text-[17px] text-foreground">{featured.title}</span> · {artistById(featured.artistId).name} · {money(featured.rentFee)} for 3 months</span>
        </Link>
      </section>

      <nav aria-label="Browse by medium" className="flex flex-wrap gap-2 border-y border-line py-4">
        {MEDIUM_LINKS.map(m => <Link key={m} href={`/browse?medium=${encodeURIComponent(m)}`} className="rounded-full border border-line px-3.5 py-1.5 text-[13px] transition hover:border-foreground">{m}</Link>)}
        <Link href="/browse?maxRent=100" className="rounded-full border border-line px-3.5 py-1.5 text-[13px] transition hover:border-foreground">Under $100 for 3 months</Link>
      </nav>

      <Shelf title="New this week" href="/browse" items={fresh} />

      <section className="mt-16 grid gap-8 rounded-[var(--radius-panel)] bg-soft px-6 py-10 md:grid-cols-3 md:px-10">
        <h2 className="serif text-3xl md:col-span-3">How it works</h2>
        {[
          ["Pick a piece", "Every listing shows the price for three months, the full price, and the deposit the artist set."],
          ["Live with it", "Pick it up for free or have the artist deliver it. It stays on your wall for 90 days."],
          ["Keep it or return it", "Buy it with your rent taken off the price, or book a return and get your deposit back."],
        ].map(([t, d], i) => (
          <div key={t} className="grid content-start gap-2">
            <span className="text-[13px] text-muted tnum">Step {i + 1}</span>
            <span className="serif text-2xl">{t}</span>
            <p className="text-[14px] text-muted">{d}</p>
          </div>
        ))}
      </section>

      <Shelf title="Under $100 for three months" href="/browse?maxRent=100" items={affordable} />
      <Shelf title="For a big wall" href="/browse?size=large" items={big} />

      <section className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-line pt-10 md:flex-row md:items-center">
        <div className="grid max-w-lg gap-2">
          <h2 className="serif text-3xl">Are you an artist?</h2>
          <p className="text-[15px] text-muted">Earn from work that would otherwise sit in the studio. You set the price, the rental fee and the deposit.</p>
        </div>
        <LinkButton href="/studio/new" variant="secondary">List a work</LinkButton>
      </section>
    </div>
  );
}

function Shelf({ title, href, items }: { title: string; href: string; items: ReturnType<typeof useStore>["artworks"] }) {
  return (
    <section className="mt-14 grid gap-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="serif text-3xl">{title}</h2>
        <Link href={href} className="link text-[13px]">View all</Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">{items.map(a => <ArtCard key={a.id} artwork={a} />)}</div>
    </section>
  );
}

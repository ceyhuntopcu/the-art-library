"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Input } from "@/components/arc/input/input";
import { Textarea } from "@/components/arc/textarea/textarea";
import { Select } from "@/components/arc/select/select";
import { NumberField } from "@/components/arc/number-field/number-field";
import { Switch } from "@/components/arc/switch/switch";
import { Button } from "@/components/arc/button/button";
import { ArtworkArt } from "@/components/artwork-art";
import { Actions, ArtCard, PageHeader } from "@/components/ui-bits";
import { ME_ARTIST, type ArtStyle, type Artwork, type Medium } from "@/lib/data";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

const MEDIUMS: Medium[] = ["Oil", "Acrylic", "Watercolour", "Gouache", "Print", "Photography", "Mixed media", "Drawing"];
const LOOKS: { style: ArtStyle; palette: string[] }[] = [
  { style: "sun", palette: ["#f4efe2", "#d8432c", "#e8c547", "#1d1d1d"] },
  { style: "bands", palette: ["#e4e8ea", "#6e7f8c", "#2f3b45", "#c9a27a"] },
  { style: "blobs", palette: ["#f5f0f8", "#8a3a7a", "#d17db5", "#2b1a3a"] },
  { style: "arch", palette: ["#fbf3e4", "#2a6fdb", "#f3b23c", "#1d1d1d"] },
  { style: "wave", palette: ["#efe6c8", "#2f4a3a", "#8a9a5b", "#d1c294"] },
  { style: "rings", palette: ["#0b1f2a", "#13606a", "#33c2b0", "#9fe3d8"] },
];

export default function NewListingPage() {
  const { artworks, actions } = useStore();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [medium, setMedium] = useState<string>("Oil");
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(80);
  const [year, setYear] = useState(2026);
  const [price, setPrice] = useState(1200);
  const [rentFee, setRentFee] = useState(120);
  const [deposit, setDeposit] = useState(300);
  const [deliveryFee, setDeliveryFee] = useState(35);
  const [framed, setFramed] = useState(true);
  const [look, setLook] = useState(0);
  const [description, setDescription] = useState("");
  const [tried, setTried] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const draft: Artwork = {
    id: `art-${900 + artworks.length}`, title: title || "Untitled", artistId: ME_ARTIST, medium: medium as Medium, width, height, year, price, rentFee, deposit, deliveryFee, framed,
    status: "available", listedDaysAgo: 0, description: description || "New to Hangtime.", art: { ...LOOKS[look], seed: 500 + artworks.length },
  };
  const titleError = tried && !title.trim() ? "Give the work a title." : undefined;
  const rentError = rentFee >= price ? "The rental fee should be less than the full price." : undefined;

  const publish = () => {
    setTried(true);
    if (!title.trim()) { titleRef.current?.focus(); titleRef.current?.scrollIntoView({ block: "center" }); return; }
    if (rentError) return;
    actions.createListing(draft);
    router.push(`/art/${draft.id}`);
  };

  return (
    <div className="container-page">
      <PageHeader eyebrow="Studio" title="List a work" />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-10">
          <section className="grid gap-4">
            <h2 className="serif text-2xl">The work</h2>
            <div className="grid gap-2">
              <span className="text-[13px] font-medium">Cover image</span>
              <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Cover image">
                {LOOKS.map((l, i) => (
                  <button key={l.style} type="button" role="radio" aria-checked={look === i} onClick={() => setLook(i)}
                    className={`w-16 rounded-lg bg-wall p-1.5 transition ${look === i ? "ring-2 ring-foreground" : "ring-1 ring-line hover:ring-foreground/40"}`}>
                    <ArtworkArt artwork={{ ...draft, art: { ...l, seed: 500 + i } }} />
                  </button>
                ))}
              </div>
              <span className="text-[12.5px] text-muted">Photo upload is coming. For the demo, pick a placeholder.</span>
            </div>
            <Input ref={titleRef} id="title" label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Orange Hour" error={titleError} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select id="medium" label="Medium" value={medium} onValueChange={setMedium} options={MEDIUMS.map(m => ({ value: m, label: m }))} />
              <NumberField id="year" label="Year" value={year} onValueChange={setYear} min={1950} max={2026} formatOptions={{ useGrouping: false }} />
              <NumberField id="width" label="Width" value={width} onValueChange={setWidth} min={10} max={300} step={5} suffix=" cm" />
              <NumberField id="height" label="Height" value={height} onValueChange={setHeight} min={10} max={300} step={5} suffix=" cm" />
            </div>
            <Switch id="framed" label="Framed and ready to hang" checked={framed} onCheckedChange={setFramed} />
            <Textarea id="description" label="Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What should someone know before living with it?" />
          </section>

          <section className="grid gap-4">
            <h2 className="serif text-2xl">Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField id="price" label="Full price" value={price} onValueChange={setPrice} min={50} max={50000} step={50} prefix="$" description="What it costs to buy outright" />
              <NumberField id="rent" label="Rental for 3 months" value={rentFee} onValueChange={setRentFee} min={10} max={5000} step={5} prefix="$" description={`Most artists charge about 10%, so ${money(Math.round(price / 10))}`} />
              <NumberField id="deposit" label="Refundable deposit" value={deposit} onValueChange={setDeposit} min={0} max={price} step={10} prefix="$" description="Covers damage or a missed return. Around 25% works well." />
              <NumberField id="delivery" label="Delivery fee" value={deliveryFee} onValueChange={setDeliveryFee} min={0} max={500} step={5} prefix="$" description="Pickup from your studio is always free" />
            </div>
            {rentError ? <p className="text-[13px] text-[var(--danger)]">{rentError}</p> : null}
          </section>

          <Actions>
            <Button variant="primary" size="lg" onClick={publish}>Publish listing</Button>
            <Button variant="ghost" size="lg" onClick={() => router.back()}>Cancel</Button>
          </Actions>
        </div>

        <aside className="grid content-start gap-4 lg:sticky lg:top-24">
          <span className="eyebrow">What collectors will see</span>
          <div className="pointer-events-none max-w-xs"><ArtCard artwork={draft} /></div>
          <div className="grid gap-1.5 text-[13px] text-muted">
            <span>If someone rents it and keeps it, they pay {money(Math.max(0, price - rentFee))} more.</span>
            <span>If they return it, you keep {money(rentFee)}.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

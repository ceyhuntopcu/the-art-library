"use client";

import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { ArtCard, LinkButton, PageHeader } from "@/components/ui-bits";
import { useStore } from "@/lib/store";

export default function SavedPage() {
  const { saved, artworks } = useStore();
  const items = saved.map(id => artworks.find(a => a.id === id)!).filter(Boolean);
  return (
    <div className="container-page">
      <PageHeader eyebrow="Saved" title="Works you're thinking about" />
      {items.length
        ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">{items.map(a => <ArtCard key={a.id} artwork={a} />)}</div>
        : <EmptyState title="Nothing saved yet" description="Tap the heart on any work to keep it here." action={<LinkButton href="/browse" variant="secondary">Browse works</LinkButton>} />}
    </div>
  );
}

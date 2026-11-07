"use client";

import { useParams } from "next/navigation";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Badge } from "@/components/arc/badge/badge";
import { ArtCard, Missing } from "@/components/ui-bits";
import { ARTISTS } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const { artworks } = useStore();
  const artist = ARTISTS.find(a => a.id === id);
  if (!artist) return <Missing what="artist" />;
  const works = artworks.filter(a => a.artistId === artist.id && a.status !== "hidden");
  return (
    <div className="container-page">
      <section className="flex flex-col gap-6 border-b border-line pt-12 pb-10 sm:flex-row sm:items-center">
        <Avatar name={artist.name} size="xl" />
        <div className="grid max-w-2xl gap-3">
          <h1 className="serif text-5xl leading-none">{artist.name}</h1>
          <p className="text-[15px] text-muted">{artist.bio}</p>
          <div className="flex flex-wrap gap-2">
            <Badge size="sm">{artist.city}</Badge>
            <Badge size="sm">{artist.km} km from you</Badge>
            <Badge size="sm">{artist.rating} ★ · {artist.reviews} reviews</Badge>
            <Badge size="sm">On Hangtime since {artist.joined}</Badge>
          </div>
        </div>
      </section>
      <h2 className="serif pt-10 pb-6 text-3xl">{works.length} works</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">{works.map(a => <ArtCard key={a.id} artwork={a} />)}</div>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { SearchField } from "@/components/arc/search-field/search-field";
import { ChipGroup } from "@/components/arc/chip-group/chip-group";
import { Select } from "@/components/arc/select/select";
import { Switch } from "@/components/arc/switch/switch";
import { Button } from "@/components/arc/button/button";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { SlidersHorizontal } from "lucide-react";
import { ArtCard, PageHeader } from "@/components/ui-bits";
import { artistById } from "@/lib/format";
import { useStore } from "@/lib/store";

const MEDIUMS = ["Oil", "Acrylic", "Watercolour", "Gouache", "Print", "Photography", "Mixed media", "Drawing"];
const PAGE = 24;

export default function BrowsePage() {
  return <Suspense><Browse /></Suspense>;
}

function Browse() {
  const params = useSearchParams();
  const { artworks } = useStore();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [mediums, setMediums] = useState<string[]>(params.get("medium") ? [params.get("medium")!] : []);
  const [sort, setSort] = useState("newest");
  const [size, setSize] = useState(params.get("size") ?? "any");
  const [maxRent, setMaxRent] = useState(params.get("maxRent") ?? "any");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = artworks.filter(a => {
      if (a.status === "hidden") return false;
      if (availableOnly && a.status !== "available") return false;
      if (mediums.length && !mediums.includes(a.medium)) return false;
      if (maxRent !== "any" && a.rentFee > Number(maxRent)) return false;
      const longest = Math.max(a.width, a.height);
      if (size === "small" && longest > 50) return false;
      if (size === "medium" && (longest <= 50 || longest > 90)) return false;
      if (size === "large" && longest <= 90) return false;
      if (term) {
        const artist = artistById(a.artistId);
        const hay = `${a.title} ${artist.name} ${a.medium} ${artist.city} ${a.art.palette.join(" ")}`.toLowerCase();
        const colourWords: Record<string, string[]> = { blue: ["#1c3a8c", "#2a6fdb", "#6f8fe0", "#36525d"], green: ["#2f4a3a", "#5f8a4e", "#13606a"], orange: ["#f2863a", "#d99a3b", "#c2462e"], pink: ["#e79aa2", "#d17db5"] };
        if (!hay.includes(term) && !(colourWords[term]?.some(c => a.art.palette.includes(c)))) return false;
      }
      return true;
    });
    const near = (id: string) => artistById(id).km;
    return list.sort((a, b) =>
      sort === "rent-asc" ? a.rentFee - b.rentFee :
      sort === "price-desc" ? b.price - a.price :
      sort === "nearest" ? near(a.artistId) - near(b.artistId) :
      a.listedDaysAgo - b.listedDaysAgo);
  }, [artworks, q, mediums, sort, size, maxRent, availableOnly]);

  const reset = () => { setQ(""); setMediums([]); setSize("any"); setMaxRent("any"); setAvailableOnly(false); setShown(PAGE); };
  const activeCount = mediums.length + (size !== "any" ? 1 : 0) + (maxRent !== "any" ? 1 : 0) + (availableOnly ? 1 : 0);
  const filtered = q || activeCount;

  return (
    <div className="container-page">
      <PageHeader eyebrow="Browse" title="Art to rent in Montreal" />
      <div className="grid gap-5 border-b border-line pb-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:items-end">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1"><SearchField id="browse-search" label="Search" placeholder="Title, artist, medium or colour" value={q} onValueChange={v => { setQ(v); setShown(PAGE); }} /></div>
            <span className="md:hidden"><Button variant="secondary" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(o => !o)}><SlidersHorizontal size={16} />{activeCount ? `Filters (${activeCount})` : "Filters"}</Button></span>
          </div>
          <div className={`${filtersOpen ? "grid" : "hidden"} gap-4 md:contents`}>
            <Select id="browse-size" label="Size" value={size} onValueChange={setSize} options={[{ value: "any", label: "Any size" }, { value: "small", label: "Small (up to 50 cm)" }, { value: "medium", label: "Medium (50–90 cm)" }, { value: "large", label: "Large (over 90 cm)" }]} />
            <Select id="browse-rent" label="Price for 3 months" value={maxRent} onValueChange={setMaxRent} options={[{ value: "any", label: "Any price" }, { value: "100", label: "Up to $100" }, { value: "200", label: "Up to $200" }, { value: "350", label: "Up to $350" }]} />
            <Select id="browse-sort" label="Sort by" value={sort} onValueChange={setSort} options={[{ value: "newest", label: "Newest" }, { value: "rent-asc", label: "Lowest rental price" }, { value: "price-desc", label: "Highest full price" }, { value: "nearest", label: "Nearest to you" }]} />
          </div>
        </div>
        <div className={`${filtersOpen ? "flex" : "hidden"} flex-wrap items-center justify-between gap-4 md:flex`}>
          <ChipGroup label="Medium" options={MEDIUMS.map(m => ({ value: m, label: m }))} value={mediums} onValueChange={v => { setMediums(v); setShown(PAGE); }} />
          <Switch id="available-only" label="Available now" checked={availableOnly} onCheckedChange={setAvailableOnly} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 py-5 text-[13px] text-muted">
        <span className="tnum">{results.length} {results.length === 1 ? "work" : "works"}</span>
        {filtered ? <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button> : null}
      </div>

      {results.length ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">{results.slice(0, shown).map(a => <ArtCard key={a.id} artwork={a} />)}</div>
          {shown < results.length ? <div className="flex justify-center pt-12"><Button variant="secondary" onClick={() => setShown(s => s + PAGE)}>Show more ({results.length - shown} left)</Button></div> : null}
        </>
      ) : (
        <div className="py-10"><EmptyState title="No works match these filters" description="Try a wider size or price, or clear the medium filter." action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} /></div>
      )}
    </div>
  );
}

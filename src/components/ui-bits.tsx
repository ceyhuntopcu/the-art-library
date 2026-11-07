"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Heart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/arc/button/button";
import { Badge } from "@/components/arc/badge/badge";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { ArtworkArt } from "@/components/artwork-art";
import type { Artwork, RentalStatus } from "@/lib/data";
import { artistById, money } from "@/lib/format";
import { useStore } from "@/lib/store";

/** Arc's Button is a <button>; this routes on click so navigation keeps the same look. */
export function LinkButton({ href, ...props }: ButtonProps & { href: string }) {
  const router = useRouter();
  return <Button {...props} onClick={() => router.push(href)} />;
}

export function Actions({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap items-center gap-2 ${className}`}>{children}</div>;
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-8 pb-6 md:pt-10">
      <div className="grid gap-2">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h1 className="serif text-[40px] leading-[1.05] md:text-5xl">{title}</h1>
      </div>
      {children ? <Actions>{children}</Actions> : null}
    </div>
  );
}

export function SaveButton({ artworkId, className = "" }: { artworkId: string; className?: string }) {
  const { saved, actions } = useStore();
  const on = saved.includes(artworkId);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? "Remove from saved" : "Save"} onClick={e => { e.preventDefault(); e.stopPropagation(); actions.toggleSave(artworkId); }}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur transition hover:scale-105 focus-visible:outline-2 ${className}`}>
      <Heart size={16} fill={on ? "currentColor" : "none"} strokeWidth={1.75} />
    </button>
  );
}

export function StatusBadge({ status }: { status: Artwork["status"] }) {
  if (status === "rented") return <Badge tone="info" size="sm">On rent</Badge>;
  if (status === "sold") return <Badge tone="neutral" size="sm">Sold</Badge>;
  if (status === "hidden") return <Badge tone="warning" size="sm">Hidden</Badge>;
  return <Badge tone="success" size="sm">Available</Badge>;
}

const RENTAL_LABEL: Record<RentalStatus, [string, "neutral" | "success" | "info" | "warning" | "danger"]> = {
  requested: ["Awaiting approval", "warning"],
  active: ["On the wall", "success"],
  return_booked: ["Return booked", "info"],
  returned: ["Being inspected", "info"],
  claim: ["Damage claim", "danger"],
  closed: ["Returned", "neutral"],
  bought: ["Bought", "success"],
  declined: ["Declined", "neutral"],
  cancelled: ["Cancelled", "neutral"],
};
export function RentalBadge({ status }: { status: RentalStatus }) {
  const [label, tone] = RENTAL_LABEL[status];
  return <Badge tone={tone} size="sm" dot>{label}</Badge>;
}

export function ArtCard({ artwork, priority = "rent" }: { artwork: Artwork; priority?: "rent" | "buy" }) {
  const artist = artistById(artwork.artistId);
  return (
    <Link href={`/art/${artwork.id}`} className="group grid content-start gap-3 rounded-[var(--radius-panel)] outline-offset-4">
      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[10px] bg-wall transition duration-300 group-hover:-translate-y-0.5">
        <ArtworkArt artwork={artwork} style={{ width: `${Math.min(74, (74 * 1.25 * artwork.width) / artwork.height)}%` }} className={`shadow-[0_14px_18px_-12px_rgb(0_0_0/.45)] transition duration-300 group-hover:scale-[1.02]`} />
        <div className="absolute top-2.5 right-2.5"><SaveButton artworkId={artwork.id} /></div>
        {artwork.status !== "available" ? <div className="absolute top-3 left-3"><StatusBadge status={artwork.status} /></div> : null}
      </div>
      <div className="grid gap-0.5">
        <span className="serif text-[19px] leading-tight">{artwork.title}</span>
        <span className="truncate text-[13px] text-muted">{artist.name}</span>
        <span className="text-[12.5px] text-muted tnum">{artwork.medium} · {artwork.width}×{artwork.height} cm</span>
        <span className="mt-1.5 text-[13.5px] tnum">
          {priority === "rent"
            ? <><span className="font-medium">{money(artwork.rentFee)}</span> <span className="text-muted">for 3 months</span></>
            : <span className="font-medium">{money(artwork.price)}</span>}
        </span>
        <span className="text-[12.5px] text-muted tnum">{priority === "rent" ? `or buy for ${money(artwork.price)}` : `or rent for ${money(artwork.rentFee)}`}</span>
      </div>
    </Link>
  );
}

export function SummaryRow({ label, value, muted, strong }: { label: ReactNode; value: ReactNode; muted?: boolean; strong?: boolean }) {
  return <div className={`row-line text-[14px] ${muted ? "text-muted" : ""} ${strong ? "border-t border-line pt-3 font-medium" : ""}`}><span>{label}</span><span>{value}</span></div>;
}

export function Missing({ what }: { what: string }) {
  return <div className="container-page py-20"><EmptyState title={`We couldn't find that ${what}`} description="It may have been removed. Data also resets when you refresh the page." action={<LinkButton href="/browse" variant="secondary">Browse works</LinkButton>} /></div>;
}

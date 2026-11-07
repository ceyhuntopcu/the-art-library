"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { ArcProvider } from "@/components/arc/lib/arc-provider";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import Toast from "@/components/arc/toast/toast";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Compass, Heart, Images, Inbox, Palette, Plus, type LucideIcon } from "lucide-react";
import { StoreProvider, useStore, type Role } from "@/lib/store";
import { personById } from "@/lib/format";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ArcProvider link={Link}>
      <StoreProvider>
        <Suspense fallback={<div className="h-16 border-b border-line" />}><Header /></Suspense>
        <main className="min-h-[70vh]"><Suspense><ClientOnly>{children}</ClientOnly></Suspense></main>
        <Footer />
        <Suspense><MobileTabBar /></Suspense>
        <Toaster />
      </StoreProvider>
    </ArcProvider>
  );
}

// The store lives in the browser only, so pages render after mount to avoid server/client mismatches on new records.
function ClientOnly({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  return mounted ? children : null;
}

const RENTER_TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/rentals", label: "My rentals", icon: Images },
  { href: "/messages", label: "Messages", icon: Inbox },
];
const ARTIST_TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/studio", label: "Studio", icon: Palette },
  { href: "/studio/new", label: "List a work", icon: Plus },
  { href: "/browse", label: "Browse", icon: Compass },
  { href: "/messages", label: "Messages", icon: Inbox },
];

function useUnread() {
  const { me, threads, seen } = useStore();
  return threads.filter(t => (t.renterId === me || t.artistId === me) && t.messages.length && t.messages[t.messages.length - 1].from !== me && (seen[t.id] ?? 0) < t.messages.length).length;
}

const isActiveHref = (pathname: string, href: string) => href === "/studio" ? pathname === "/studio" || pathname.startsWith("/studio/rentals") : pathname.startsWith(href);

/** Phones get app-style tabs at the bottom instead of a crowded link row. */
function MobileTabBar() {
  const { role } = useStore();
  const pathname = usePathname();
  const unread = useUnread();
  const tabs = role === "renter" ? RENTER_TABS : ARTIST_TABS;
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const on = isActiveHref(pathname, href);
          return (
            <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`relative grid justify-items-center gap-1 py-2.5 text-[11px] ${on ? "text-foreground" : "text-muted"}`}>
              <Icon size={20} strokeWidth={on ? 2 : 1.5} />
              {label}
              {href === "/messages" && unread > 0 ? <span className="absolute top-1.5 left-1/2 ml-2 grid h-4 min-w-4 place-items-center rounded-full bg-gallery px-1 text-[10px] text-white tnum">{unread}</span> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const RENTER_NAV = [
  { href: "/browse", label: "Browse" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/saved", label: "Saved" },
  { href: "/rentals", label: "My rentals" },
  { href: "/messages", label: "Messages" },
];
const ARTIST_NAV = [
  { href: "/studio", label: "Studio" },
  { href: "/studio/new", label: "List a work" },
  { href: "/browse", label: "Browse" },
  { href: "/messages", label: "Messages" },
];

function Header() {
  const { role, actions, me } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "renter" ? RENTER_NAV : ARTIST_NAV;
  const unread = useUnread();
  // Each section belongs to one side, so landing on it directly (or after a refresh) shows the matching view.
  useEffect(() => {
    if (pathname.startsWith("/studio") && role !== "artist") actions.setRole("artist");
    if (/^\/(rentals|saved)/.test(pathname) && role !== "renter") actions.setRole("renter");
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  const isActive = (href: string) => isActiveHref(pathname, href);

  const switchRole = (next: string) => {
    actions.setRole(next as Role);
    router.push(next === "artist" ? "/studio" : "/");
  };

  const links = nav.map(n => (
    <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}
      className={`whitespace-nowrap text-[13px] transition-colors hover:text-foreground ${isActive(n.href) ? "text-foreground" : "text-muted"}`}>
      {n.label}
      {n.href === "/messages" && unread > 0 ? <span className="ml-1.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gallery px-1 text-[11px] text-white tnum">{unread}</span> : null}
    </Link>
  ));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4 lg:gap-6">
        <Link href={role === "artist" ? "/studio" : "/"} className="serif text-[26px] italic leading-none">Hangtime</Link>
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">{links}</nav>
        <div className="ml-auto flex items-center gap-3">
          <SegmentedControl label="View as" value={role} onValueChange={switchRole} options={[{ value: "renter", label: "Collector" }, { value: "artist", label: "Artist" }]} />
          <span className="hidden sm:inline-flex" title={personById(me).name}><Avatar name={personById(me).name} size="sm" /></span>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line pb-20 lg:pb-0">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <span className="serif text-2xl italic">Hangtime</span>
          <span className="text-[13px] text-muted">Rent original art for three months. Keep it if you love it.</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted">
          <Link href="/browse" className="hover:text-foreground">Browse</Link>
          <Link href="/how-it-works" className="hover:text-foreground">How it works</Link>
          <Link href="/studio/new" className="hover:text-foreground">For artists</Link>
          <span>Montreal · prices in Canadian dollars</span>
          <span>Class demo · data resets on refresh</span>
        </div>
      </div>
    </footer>
  );
}

function Toaster() {
  const { toasts, actions } = useStore();
  const last = toasts[toasts.length - 1];
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] z-50 flex justify-end sm:inset-x-auto sm:right-6 lg:bottom-6" aria-live="polite">
      <div className="pointer-events-auto w-full sm:w-[26rem]">
        {last ? <Toast key={last.id} title={last.title} description={last.description} open onOpenChange={o => { if (!o) actions.dismissToast(last.id); }} /> : null}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Button } from "@/components/arc/button/button";
import { Input } from "@/components/arc/input/input";
import { EmptyState } from "@/components/arc/empty-state/empty-state";
import { ArtworkArt } from "@/components/artwork-art";
import { PageHeader } from "@/components/ui-bits";
import { dayMonth, personById, time } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function MessagesPage() {
  return <Suspense><Messages /></Suspense>;
}

function Messages() {
  const params = useSearchParams();
  const { threads, artworks, me, actions, seen } = useStore();
  const mine = threads.filter(t => t.renterId === me || t.artistId === me);
  const [selected, setSelected] = useState<string | null>(params.get("t"));
  const [text, setText] = useState("");
  const [showList, setShowList] = useState(!params.get("t"));
  const endRef = useRef<HTMLDivElement>(null);
  const active = mine.find(t => t.id === selected) ?? mine[0];
  const other = active ? personById(active.renterId === me ? active.artistId : active.renterId) : null;
  const art = active ? artworks.find(a => a.id === active.artworkId) : null;

  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [active?.messages.length, active?.id]);
  useEffect(() => { if (active) actions.markSeen(active.id, active.messages.length); }, [active?.id, active?.messages.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = () => {
    if (!active || !text.trim()) return;
    actions.sendMessage(active.id, me, text.trim());
    setText("");
    const otherId = active.renterId === me ? active.artistId : active.renterId;
    setTimeout(() => actions.sendMessage(active.id, otherId, "Thanks, got it. I'll get back to you shortly."), 1400);
  };

  if (!mine.length) return <div className="container-page"><PageHeader title="Messages" /><EmptyState title="No conversations yet" description="Message an artist from any artwork page." /></div>;

  return (
    <div className="container-page">
      <PageHeader title="Messages" />
      <div className="grid min-h-[560px] overflow-hidden rounded-[var(--radius-panel)] border border-line md:grid-cols-[300px_minmax(0,1fr)]">
        <ul className={`border-line md:block md:border-r ${showList ? "block" : "hidden"}`} aria-label="Conversations">
          {mine.map(t => {
            const p = personById(t.renterId === me ? t.artistId : t.renterId);
            const a = artworks.find(x => x.id === t.artworkId)!;
            const last = t.messages[t.messages.length - 1];
            const unread = last && last.from !== me && (seen[t.id] ?? 0) < t.messages.length && t.id !== active?.id;
            return (
              <li key={t.id}>
                <button type="button" onClick={() => { setSelected(t.id); setShowList(false); }} aria-current={t.id === active?.id}
                  className={`flex w-full items-center gap-3 border-b border-line px-4 py-3.5 text-left transition hover:bg-soft ${t.id === active?.id ? "bg-soft" : ""}`}>
                  <Avatar name={p.name} />
                  <span className="grid min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2"><span className={`truncate text-[14px] ${unread ? "font-medium" : ""}`}>{p.name}</span>{last ? <span className="shrink-0 text-[11.5px] text-muted">{dayMonth(last.at)}</span> : null}</span>
                    <span className="truncate text-[12.5px] text-muted">{a.title} · {last ? last.text : "No messages yet"}</span>
                  </span>
                  {unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-gallery" aria-label="Unread" /> : null}
                </button>
              </li>
            );
          })}
        </ul>

        {active && other && art ? (
          <section className={`flex min-w-0 flex-col md:flex ${showList ? "hidden" : "flex"}`} aria-label={`Conversation with ${other.name}`}>
            <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              <span className="md:hidden"><Button variant="ghost" size="sm" onClick={() => setShowList(true)}>← Back</Button></span>
              <Avatar name={other.name} />
              <div className="grid min-w-0"><span className="text-[14px] font-medium">{other.name}</span><Link href={`/art/${art.id}`} className="truncate text-[12.5px] text-muted hover:text-foreground">About {art.title}</Link></div>
              <Link href={`/art/${art.id}`} className="ml-auto hidden w-10 shrink-0 rounded bg-wall p-1 sm:block"><ArtworkArt artwork={art} /></Link>
            </header>
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-5" style={{ maxHeight: 480 }}>
              {active.messages.length === 0 ? <p className="m-auto text-[13px] text-muted">Say hello to {other.name.split(" ")[0]}.</p> : null}
              {active.messages.map((m, i) => (
                <div key={i} className={`grid max-w-[78%] gap-1 ${m.from === me ? "self-end justify-items-end" : "self-start"}`}>
                  <div className={`rounded-2xl px-4 py-2.5 text-[14px] ${m.from === me ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md bg-soft"}`}>{m.text}</div>
                  <span className="px-1 text-[11px] text-muted">{dayMonth(m.at)} · {time(m.at)}</span>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form className="flex items-end gap-2 border-t border-line p-4" onSubmit={e => { e.preventDefault(); send(); }}>
              <div className="min-w-0 flex-1"><Input id="message" label="Message" value={text} onChange={e => setText(e.target.value)} placeholder={`Write to ${other.name.split(" ")[0]}`} autoComplete="off" /></div>
              <Button type="submit" variant="primary" disabled={!text.trim()}>Send</Button>
            </form>
          </section>
        ) : null}
      </div>
    </div>
  );
}

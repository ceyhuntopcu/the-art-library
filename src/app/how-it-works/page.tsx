import { PageHeader, LinkButton, Actions } from "@/components/ui-bits";

const RENTER = [
  ["Find a piece", "Browse by medium, size or price. Every listing shows the price for three months, the full price and the deposit the artist set."],
  ["Send a request", "Pick a start date and choose free pickup or delivery from the artist. You're charged only once the artist approves."],
  ["Live with it for 90 days", "Hang it, move it around, see how it feels in different light."],
  ["Keep it or return it", "Around day 76 we ask. Buy it with your rent taken off the price, or book a free return and get your deposit back."],
];
const ARTIST = [
  ["List a work", "Set the full price, the rental fee for three months and a refundable deposit."],
  ["Approve requests", "See who wants it and why, then approve or decline within 48 hours."],
  ["Hand it over", "Let them pick it up for free, or deliver it for the fee you set."],
  ["Get it back or get paid", "Inspect the return and release the deposit, or report damage. If they buy, you get the full price."],
];
const FAQ = [
  ["Does my rent count toward the price?", "Yes. If a $1,800 work rents for $180 and you keep it, you pay $1,620 more."],
  ["What's the deposit for?", "It protects the artist if the work comes back damaged or doesn't come back. It's charged when the artist approves and refunded after a clean return or when you buy."],
  ["Can I return it early?", "Yes, book a return at any time. The rental fee isn't refunded."],
  ["How long is a rental?", "Always three months (90 days)."],
];

export default function HowItWorksPage() {
  return (
    <div className="container-page">
      <PageHeader eyebrow="How it works" title="Rent it, live with it, then decide" />
      <div className="grid gap-12 md:grid-cols-2">
        {[["For collectors", RENTER], ["For artists", ARTIST]].map(([title, steps]) => (
          <section key={title as string} className="grid content-start gap-6">
            <h2 className="serif text-3xl">{title as string}</h2>
            <ol className="grid gap-5">
              {(steps as string[][]).map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                  <span className="text-[13px] text-muted tnum">{String(i + 1).padStart(2, "0")}</span>
                  <span className="grid gap-1"><span className="font-medium">{t}</span><span className="text-[14px] text-muted">{d}</span></span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      <section className="mt-16 grid gap-6 border-t border-line pt-10">
        <h2 className="serif text-3xl">Questions</h2>
        <dl className="grid gap-6 md:grid-cols-2">
          {FAQ.map(([q, a]) => <div key={q} className="grid gap-1.5"><dt className="font-medium">{q}</dt><dd className="text-[14px] text-muted">{a}</dd></div>)}
        </dl>
      </section>
      <Actions className="mt-12"><LinkButton href="/browse" variant="primary">Start browsing</LinkButton><LinkButton href="/studio/new" variant="secondary">List your work</LinkButton></Actions>
    </div>
  );
}

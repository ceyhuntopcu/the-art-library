// Seeded mock data. Everything is deterministic so a hard refresh always lands on the same starting state.

export const TODAY = new Date("2026-11-07T12:00:00");
export const RENTAL_DAYS = 90;
export const DECISION_DAY = 76;

export type ArtStyle = "bands" | "sun" | "grid" | "arch" | "blobs" | "stripes" | "rings" | "blocks" | "wave" | "tilt";
export type Medium = "Oil" | "Acrylic" | "Watercolour" | "Gouache" | "Print" | "Photography" | "Mixed media" | "Drawing";
export type ArtworkStatus = "available" | "rented" | "sold" | "hidden";

export interface Artist {
  id: string;
  name: string;
  city: string;
  km: number;
  bio: string;
  joined: number;
  rating: number;
  reviews: number;
  hue: string;
}

export interface Renter {
  id: string;
  name: string;
  city: string;
  pastRentals: number;
  rating: number;
  hue: string;
}

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  medium: Medium;
  width: number;
  height: number;
  year: number;
  price: number;
  rentFee: number;
  deposit: number;
  deliveryFee: number;
  framed: boolean;
  status: ArtworkStatus;
  listedDaysAgo: number;
  description: string;
  art: { style: ArtStyle; palette: string[]; seed: number };
}

export type RentalStatus = "requested" | "active" | "return_booked" | "returned" | "claim" | "closed" | "bought" | "declined" | "cancelled";
export type Handover = "pickup" | "delivery";

export interface RentalEvent { at: string; title: string; by?: string }
export interface Claim { amount: number; reason: string; note: string; status: "open" | "accepted" | "disputed" }

export interface Rental {
  id: string;
  artworkId: string;
  renterId: string;
  artistId: string;
  status: RentalStatus;
  startDate: string;
  handover: Handover;
  deliveryFee: number;
  rentFee: number;
  deposit: number;
  /** How many 3-month terms have been paid for; renewing adds one. */
  terms: number;
  note: string;
  returnSlot?: string;
  claim?: Claim;
  review?: number;
  events: RentalEvent[];
}

export interface Purchase { id: string; artworkId: string; buyerId: string; price: number; credit: number; at: string; fromRentalId?: string }

export interface Message { from: string; text: string; at: string }
export interface Thread { id: string; artworkId: string; renterId: string; artistId: string; messages: Message[] }

export const ME_RENTER = "u-dana";
export const ME_ARTIST = "a-mara";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const ARTISTS: Artist[] = [
  { id: "a-mara", name: "Mara Okafor", city: "Mile End", km: 2, bio: "Paints large, warm fields of colour from memory of Lagos afternoons. Works on linen in a studio above a bagel shop in Mile End.", joined: 2024, rating: 4.9, reviews: 31, hue: "#b9542e" },
  { id: "a-jonah", name: "Julien Tremblay", city: "Verdun", km: 7, bio: "Seascapes reduced to bands of colour. Acrylic on wood panel, sanded between every layer.", joined: 2023, rating: 4.8, reviews: 22, hue: "#36525d" },
  { id: "a-ines", name: "Ines Park", city: "Saint-Henri", km: 5, bio: "Gouache studies of fields, fabrics and the patterns between them.", joined: 2025, rating: 5.0, reviews: 9, hue: "#2f4a3a" },
  { id: "a-theo", name: "Théo Lavoie", city: "Old Montreal", km: 4, bio: "Window light and the colour blue, mostly in oil, mostly at dawn.", joined: 2022, rating: 4.7, reviews: 48, hue: "#1c3a8c" },
  { id: "a-ana", name: "Ana Sousa", city: "Little Italy", km: 3, bio: "Mixed media built from clay slip, pigment and sand. Each piece is fired in a small kiln before mounting.", joined: 2024, rating: 4.9, reviews: 17, hue: "#7b2f1c" },
  { id: "a-kofi", name: "Kofi Mensah", city: "Griffintown", km: 5, bio: "Night scenes, pools and the green glow of city water.", joined: 2023, rating: 4.8, reviews: 26, hue: "#13606a" },
  { id: "a-lea", name: "Léa Moreau", city: "Plateau-Mont-Royal", km: 1, bio: "Screenprints in small editions. Arches, doorways and other ways in.", joined: 2025, rating: 4.6, reviews: 12, hue: "#c2707a" },
  { id: "a-sam", name: "Sam Ito", city: "Villeray", km: 4, bio: "Graphite grids and quiet geometry, drawn by hand with a ruler and patience.", joined: 2024, rating: 5.0, reviews: 7, hue: "#3a3a3a" },
  { id: "a-rosa", name: "Rosa Valdés", city: "Hochelaga", km: 6, bio: "Watercolour gardens painted on site, wet into wet.", joined: 2023, rating: 4.8, reviews: 19, hue: "#5f8a4e" },
  { id: "a-eli", name: "Élise Gagnon", city: "Outremont", km: 3, bio: "Street photography printed on cotton rag, framed in walnut.", joined: 2022, rating: 4.7, reviews: 40, hue: "#4b4b58" },
  { id: "a-nadia", name: "Nadia Haddad", city: "Saint-Laurent", km: 10, bio: "Bold acrylic blocks inspired by textiles from her grandmother's house in Beirut.", joined: 2024, rating: 4.9, reviews: 14, hue: "#c2462e" },
  { id: "a-oskar", name: "Olivier Côté", city: "Rosemont", km: 5, bio: "Minimal oil paintings of horizons, one line at a time.", joined: 2025, rating: 4.5, reviews: 6, hue: "#6e7f8c" },
  { id: "a-yuki", name: "Yuki Tanaka", city: "Côte-des-Neiges", km: 6, bio: "Ink and wash. Circles, mostly, and the space around them.", joined: 2023, rating: 5.0, reviews: 21, hue: "#1d1d1d" },
  { id: "a-ben", name: "Benoît Roy", city: "Pointe-Saint-Charles", km: 6, bio: "Risograph prints of casse-croûtes, laundromats and other ordinary rooms.", joined: 2024, rating: 4.6, reviews: 11, hue: "#2a6fdb" },
  { id: "a-zara", name: "Zara Ahmed", city: "Notre-Dame-de-Grâce", km: 8, bio: "Abstract oil on canvas. Gestures layered until the colour hums.", joined: 2022, rating: 4.8, reviews: 35, hue: "#8a3a7a" },
  { id: "a-luca", name: "Luca Bianchi", city: "Westmount", km: 6, bio: "Architectural drawings of buildings that do not exist.", joined: 2025, rating: 4.7, reviews: 5, hue: "#9a7b4f" },
];

export const RENTERS: Renter[] = [
  { id: "u-dana", name: "Dana Rivera", city: "Plateau-Mont-Royal", pastRentals: 4, rating: 5.0, hue: "#2b47d6" },
  { id: "u-priya", name: "Priya Shah", city: "Westmount", pastRentals: 2, rating: 4.9, hue: "#8a3a7a" },
  { id: "u-leo", name: "Léo Martin", city: "Rosemont", pastRentals: 6, rating: 4.8, hue: "#2f4a3a" },
  { id: "u-ama", name: "Ama Kusi", city: "Mile End", pastRentals: 1, rating: 5.0, hue: "#c2462e" },
  { id: "u-noah", name: "Noah Bouchard", city: "Verdun", pastRentals: 0, rating: 0, hue: "#6e7f8c" },
  { id: "u-mei", name: "Mei Chen", city: "Villeray", pastRentals: 3, rating: 4.7, hue: "#13606a" },
];

const PALETTES: string[][] = [
  ["#f1dfc3", "#f2863a", "#c98d5c", "#7b2f1c"],
  ["#e7d6b1", "#a9c0bf", "#6f8f97", "#36525d"],
  ["#efe6c8", "#2f4a3a", "#8a9a5b", "#d1c294"],
  ["#e9edf8", "#1c3a8c", "#6f8fe0", "#9fb2ea"],
  ["#efe2cf", "#b9542e", "#d99a3b", "#7b2f1c"],
  ["#0b1f2a", "#13606a", "#33c2b0", "#9fe3d8"],
  ["#f6ece4", "#e79aa2", "#c2707a", "#5a2a33"],
  ["#f2f0ea", "#3a3a3a", "#9a9a94", "#d8d5cc"],
  ["#f4efe2", "#5f8a4e", "#a8c58e", "#e1b84a"],
  ["#1d1d1d", "#e9e4d8", "#b23a2a", "#7d7d76"],
  ["#f7e8d5", "#c2462e", "#2a6fdb", "#f3b23c"],
  ["#e4e8ea", "#6e7f8c", "#2f3b45", "#c9a27a"],
  ["#f5f0f8", "#8a3a7a", "#d17db5", "#2b1a3a"],
  ["#fbf3e4", "#1d1d1d", "#d8432c", "#e8c547"],
];

const STYLES: ArtStyle[] = ["bands", "sun", "grid", "arch", "blobs", "stripes", "rings", "blocks", "wave", "tilt"];
const MEDIUMS: Medium[] = ["Oil", "Acrylic", "Watercolour", "Gouache", "Print", "Photography", "Mixed media", "Drawing"];

const TITLES = [
  "Orange Hour", "Low Tide, Tadoussac", "Field Notes No. 4", "Blue Study (Window)", "Kiln", "Night Swim", "Pink Arch", "Quiet Grid",
  "Late Bloom", "Harbour Light", "Saltwater", "Second Floor, Morning", "Red Kitchen", "After the Rain", "Paper Moon", "Borrowed Room",
  "Long Weekend", "Green Door", "Linen and Lemon", "The Slow Field", "Summer Ledger", "Inlet", "Folded Map", "Window Seat",
  "Copper Season", "North Light", "Small Hours", "Coastline Study", "Marigold", "Three Pears", "Evening Laundry", "The Pool at Noon",
  "Clay Garden", "Dune", "Untitled (Ochre)", "Morning Swim", "Rooftop, August", "Night Market", "Signal", "Pale Horizon",
  "Afterimage", "Terracotta", "Fig Tree", "Open Window", "Station Platform", "Soft Machine", "Riverbend", "Lac Brome",
  "Weather Report", "Blue Hour, Canal", "Orchard", "Corner Store", "Two Chairs", "The Long Table", "Tangerine", "Midsummer",
  "Hush", "Grain", "Undertow", "Glasshouse", "Cartography", "Low Sun", "Bloom Study III", "Salt Flats",
  "Tidal Pattern", "Velvet", "Dusk Road", "Fold", "Ember", "Moss", "Cobalt Field", "Last Light, Lachine",
  "Paper Boats", "Lantern", "Arcade", "Shoreline No. 2", "Still Life with Plum", "Monsoon", "Quarry", "Garden Wall",
  "Nocturne", "Daybreak", "The Blue Chair", "Waiting Room",
];

const DESCRIPTIONS = [
  "Painted over a single summer, this piece holds the heat of late afternoon light. It reads warmest on a wall that gets indirect sun.",
  "Built up in thin layers and sanded back between each, so the colour seems to sit just under the surface.",
  "A small, quiet work that rewards being lived with. It changes noticeably between morning and evening light.",
  "Part of an ongoing series. The edges are left raw on purpose, and it hangs well unframed.",
  "Made on site in a single sitting, then finished in the studio. Signed and dated on the reverse.",
  "Strong at a distance and detailed up close. Works above a sofa, a bed or a long sideboard.",
];

function round(n: number, to: number) { return Math.max(to, Math.round(n / to) * to); }

function buildArtworks(): Artwork[] {
  const r = rng(20261107);
  const fixed: Partial<Artwork>[] = [
    { title: "Orange Hour", artistId: "a-mara", medium: "Oil", width: 60, height: 80, year: 2025, price: 135, rentFee: 50, deposit: 40, deliveryFee: 10, art: { style: "sun", palette: PALETTES[0], seed: 1 } },
    { title: "Low Tide, Tadoussac", artistId: "a-jonah", medium: "Acrylic", width: 50, height: 50, year: 2024, price: 95, rentFee: 35, deposit: 30, deliveryFee: 10, art: { style: "bands", palette: PALETTES[1], seed: 2 } },
    { title: "Field Notes No. 4", artistId: "a-ines", medium: "Gouache", width: 40, height: 50, year: 2026, price: 70, rentFee: 25, deposit: 20, deliveryFee: 8, art: { style: "stripes", palette: PALETTES[2], seed: 3 } },
    { title: "Blue Study (Window)", artistId: "a-theo", medium: "Oil", width: 90, height: 120, year: 2023, price: 320, rentFee: 85, deposit: 90, deliveryFee: 20, art: { style: "tilt", palette: PALETTES[3], seed: 4 } },
    { title: "Kiln", artistId: "a-ana", medium: "Mixed media", width: 70, height: 70, year: 2025, price: 160, rentFee: 55, deposit: 50, deliveryFee: 12, art: { style: "blobs", palette: PALETTES[4], seed: 5 } },
    { title: "Night Swim", artistId: "a-kofi", medium: "Oil", width: 100, height: 80, year: 2026, price: 240, rentFee: 70, deposit: 70, deliveryFee: 15, art: { style: "rings", palette: PALETTES[5], seed: 6 } },
    { title: "Pink Arch", artistId: "a-lea", medium: "Print", width: 50, height: 70, year: 2024, price: 60, rentFee: 20, deposit: 20, deliveryFee: 8, art: { style: "arch", palette: PALETTES[6], seed: 7 } },
    { title: "Quiet Grid", artistId: "a-sam", medium: "Drawing", width: 30, height: 40, year: 2025, price: 55, rentFee: 20, deposit: 15, deliveryFee: 8, art: { style: "grid", palette: PALETTES[7], seed: 8 } },
  ];
  const out: Artwork[] = [];
  TITLES.forEach((title, i) => {
    const f = fixed[i];
    const artist = f?.artistId ?? (i < 16 && i >= 8 ? "a-mara" : ARTISTS[Math.floor(r() * ARTISTS.length)].id);
    // Student budgets: most pieces sell for $50–$400 and rent for about a third of that.
    const price = f?.price ?? round(50 + Math.pow(r(), 1.7) * 350, 5);
    const w = f?.width ?? round(25 + r() * 100, 5);
    const h = f?.height ?? round(w * (0.7 + r() * 0.7), 5);
    const medium = f?.medium ?? MEDIUMS[Math.floor(r() * MEDIUMS.length)];
    out.push({
      id: `art-${String(i + 1).padStart(3, "0")}`,
      title,
      artistId: artist,
      medium,
      width: w,
      height: h,
      year: f?.year ?? 2019 + Math.floor(r() * 8),
      price,
      rentFee: f?.rentFee ?? Math.max(20, round(price * (0.3 + r() * 0.1), 5)),
      deposit: f?.deposit ?? Math.max(15, round(price * 0.3, 5)),
      deliveryFee: f?.deliveryFee ?? Math.round(8 + (w * h) / 1500),
      framed: medium === "Photography" || medium === "Print" ? true : r() > 0.45,
      status: "available",
      listedDaysAgo: Math.floor(r() * 60),
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      art: f?.art ?? { style: STYLES[Math.floor(r() * STYLES.length)], palette: PALETTES[Math.floor(r() * PALETTES.length)], seed: i + 11 },
    });
  });
  // Fixed works are the newest so they lead the home page.
  out.slice(0, 8).forEach((a, i) => { a.listedDaysAgo = i; });
  return out;
}

export const SEED_ARTWORKS = buildArtworks();

function isoDaysAgo(days: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const art = (id: string) => SEED_ARTWORKS.find(a => a.id === id)!;

function rental(id: string, artworkId: string, renterId: string, status: RentalStatus, startedDaysAgo: number, extra: Partial<Rental> = {}): Rental {
  const a = art(artworkId);
  const handover: Handover = extra.handover ?? "delivery";
  return {
    id, artworkId, renterId, artistId: a.artistId, status,
    startDate: isoDaysAgo(startedDaysAgo),
    handover,
    deliveryFee: handover === "delivery" ? a.deliveryFee : 0,
    rentFee: a.rentFee, deposit: a.deposit, terms: 1,
    note: "",
    events: [{ at: isoDaysAgo(startedDaysAgo + 3), title: "Rental requested" }],
    ...extra,
  };
}

// Dana's side (renter) and Mara's side (artist) both start with something in every state.
export const SEED_RENTALS: Rental[] = [
  rental("r-2041", "art-002", "u-dana", "active", 41, { note: "Going above our dining table.", events: [
    { at: isoDaysAgo(44), title: "Rental requested" }, { at: isoDaysAgo(43), title: "Approved by Julien" }, { at: isoDaysAgo(41), title: "Delivered and hung" }] }),
  rental("r-2042", "art-004", "u-dana", "active", 80, { handover: "pickup", events: [
    { at: isoDaysAgo(83), title: "Rental requested" }, { at: isoDaysAgo(82), title: "Approved by Théo" }, { at: isoDaysAgo(80), title: "Picked up from the studio" }] }),
  rental("r-2043", "art-007", "u-dana", "requested", -3, { note: "For the hallway. Happy to pick up.", handover: "pickup", events: [{ at: isoDaysAgo(1), title: "Rental requested" }] }),
  rental("r-2044", "art-005", "u-dana", "return_booked", 88, { returnSlot: "Sun, Nov 8 · 10:00–12:00", events: [
    { at: isoDaysAgo(91), title: "Rental requested" }, { at: isoDaysAgo(90), title: "Approved by Ana" }, { at: isoDaysAgo(88), title: "Delivered and hung" }, { at: isoDaysAgo(2), title: "Return booked" }] }),
  rental("r-2045", "art-016", "u-dana", "claim", 95, { claim: { amount: 15, reason: "Scratch or scuff on the surface", note: "There's a 3 cm scuff near the top edge that wasn't in the handover photos.", status: "open" }, events: [
    { at: isoDaysAgo(97), title: "Rental requested" }, { at: isoDaysAgo(95), title: "Delivered and hung" }, { at: isoDaysAgo(4), title: "Collected by Mara" }, { at: isoDaysAgo(1), title: "Damage reported · $15" }] }),
  rental("r-1980", "art-008", "u-dana", "closed", 160, { review: 5, events: [
    { at: isoDaysAgo(160), title: "Rental started" }, { at: isoDaysAgo(70), title: "Returned" }, { at: isoDaysAgo(68), title: "Deposit released" }] }),
  rental("r-1955", "art-020", "u-dana", "bought", 200, { events: [
    { at: isoDaysAgo(200), title: "Rental started" }, { at: isoDaysAgo(130), title: "Bought with rent credited" }] }),
  // Mara's works
  rental("r-2051", "art-001", "u-priya", "requested", -4, { note: "Hi Mara, this would go above our sofa. North-facing wall, no direct sun.", events: [{ at: isoDaysAgo(0), title: "Rental requested" }] }),
  rental("r-2052", "art-010", "u-noah", "requested", -6, { note: "First time renting. Would love to try it in our living room.", handover: "pickup", events: [{ at: isoDaysAgo(1), title: "Rental requested" }] }),
  rental("r-2053", "art-009", "u-leo", "active", 38, { events: [{ at: isoDaysAgo(40), title: "Rental requested" }, { at: isoDaysAgo(38), title: "Delivered and hung" }] }),
  rental("r-2054", "art-011", "u-ama", "active", 120, { handover: "pickup", terms: 2, events: [{ at: isoDaysAgo(122), title: "Rental requested" }, { at: isoDaysAgo(120), title: "Picked up from the studio" }, { at: isoDaysAgo(32), title: "Renewed for another 3 months" }] }),
  rental("r-2055", "art-012", "u-mei", "returned", 92, { returnSlot: "Fri, Nov 6 · 14:00–16:00", events: [
    { at: isoDaysAgo(94), title: "Rental requested" }, { at: isoDaysAgo(92), title: "Delivered and hung" }, { at: isoDaysAgo(3), title: "Return booked" }, { at: isoDaysAgo(1), title: "Collected by Mara" }] }),
  rental("r-1990", "art-013", "u-priya", "closed", 150, { review: 5, events: [{ at: isoDaysAgo(150), title: "Rental started" }, { at: isoDaysAgo(60), title: "Deposit released" }] }),
  rental("r-1991", "art-014", "u-leo", "bought", 120, { events: [{ at: isoDaysAgo(120), title: "Rental started" }, { at: isoDaysAgo(45), title: "Bought with rent credited" }] }),
];

export const SEED_PURCHASES: Purchase[] = [
  { id: "p-1", artworkId: "art-020", buyerId: "u-dana", price: art("art-020").price, credit: art("art-020").rentFee, at: isoDaysAgo(130), fromRentalId: "r-1955" },
  { id: "p-2", artworkId: "art-014", buyerId: "u-leo", price: art("art-014").price, credit: art("art-014").rentFee, at: isoDaysAgo(45), fromRentalId: "r-1991" },
  { id: "p-3", artworkId: "art-015", buyerId: "u-ama", price: art("art-015").price, credit: 0, at: isoDaysAgo(20) },
];

const at = (daysAgo: number, h: number) => { const d = new Date(TODAY); d.setDate(d.getDate() - daysAgo); d.setHours(h, 0, 0, 0); return d.toISOString(); };

export const SEED_THREADS: Thread[] = [
  { id: "t-1", artworkId: "art-002", renterId: "u-dana", artistId: "a-jonah", messages: [
    { from: "a-jonah", text: "Thanks Dana. I can bring it Saturday between 11 and 1, with hooks and a level.", at: at(42, 10) },
    { from: "u-dana", text: "Perfect, 11:30 works. Buzzer 3B.", at: at(42, 11) },
    { from: "a-jonah", text: "Great. We'll take condition photos together when it's up.", at: at(42, 12) },
  ] },
  { id: "t-2", artworkId: "art-007", renterId: "u-dana", artistId: "a-lea", messages: [
    { from: "u-dana", text: "Hi Léa, is Pink Arch framed in oak or white?", at: at(2, 9) },
    { from: "a-lea", text: "White oak, with museum glass. I'll look at your request today.", at: at(1, 16) },
  ] },
  { id: "t-3", artworkId: "art-001", renterId: "u-priya", artistId: "a-mara", messages: [
    { from: "u-priya", text: "Hi Mara, this would go above our sofa. North-facing wall, no direct sun.", at: at(0, 9) },
  ] },
  { id: "t-4", artworkId: "art-011", renterId: "u-ama", artistId: "a-mara", messages: [
    { from: "u-ama", text: "Loving it so far. Still deciding whether to keep it.", at: at(5, 19) },
    { from: "a-mara", text: "So glad. Your rent counts toward the price if you do.", at: at(5, 20) },
  ] },
  { id: "t-5", artworkId: "art-012", renterId: "u-mei", artistId: "a-mara", messages: [
    { from: "a-mara", text: "Collected today, thanks Mei. I'll inspect it tomorrow.", at: at(1, 15) },
  ] },
];

export function seedStatuses(artworks: Artwork[], rentals: Rental[], purchases: Purchase[]) {
  for (const r of rentals) {
    if (["active", "return_booked"].includes(r.status)) {
      const a = artworks.find(x => x.id === r.artworkId);
      if (a) a.status = "rented";
    }
  }
  for (const p of purchases) {
    const a = artworks.find(x => x.id === p.artworkId);
    if (a) a.status = "sold";
  }
}

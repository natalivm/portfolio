/**
 * Every project on the site comes from this list.
 *
 * Next Games and Sort Journey are real projects. EVERY OTHER ENTRY IS SAMPLE CONTENT: titles,
 * clients, years and text are invented placeholders that show how the layout
 * behaves with ~30 projects.
 * Replace them with your own work, then set `showSampleNotice` to false in
 * src/data/site.ts.
 *
 * - caseStudy: true  → gets a full page at /work/<slug>
 * - caseStudy: false → opens in the quick-view lightbox from the work index
 * - featured: true   → shown on the homepage (keep it to 4–6)
 * - cover            → path under /public for a real image; while it is
 *                      missing, a generated placeholder poster is drawn from
 *                      `art` and `palette`.
 * - coverPosition    → which part of the image to keep when a frame crops it,
 *                      as CSS object-position (default: centre).
 * - link             → an outside page for the project, such as a store listing.
 */

export const disciplines = [
  'Art direction',
  'AI production',
  'Branding',
  'Packaging',
  'Print',
  'Illustration',
  'Digital',
  'Motion',
] as const;

export type Discipline = (typeof disciplines)[number];
export type Art = 'sun' | 'grid' | 'type' | 'stack' | 'waves' | 'arch' | 'label';

export interface Project {
  slug: string;
  title: string;
  client: string;
  year: number;
  disciplines: Discipline[];
  summary: string;
  role?: string;
  caseStudy: boolean;
  featured?: boolean;
  cover?: string;
  coverAlt?: string;
  coverPosition?: string;
  link?: { label: string; href: string };
  /** A page theme for the case study, defined in global.css. */
  theme?: 'blue';
  /** Path under /public to an interactive prototype's HTML file (name the file: the dev server does not resolve a bare folder); shown on the case study page. */
  prototype?: string;
  art: Art;
  /** [ground, ink, accent] for the placeholder poster */
  palette: [string, string, string];
}

const raw: Project[] = [
  { slug: 'next-games', title: 'Next Games', client: 'Puzzle games app', year: 2023, disciplines: ['Digital', 'Motion'], art: 'grid', palette: ['#eaf3ff', '#0b1a30', '#3a8dff'], caseStudy: true, featured: true, role: 'Product designer', cover: '/covers/next-games.png', coverAlt: 'Phone showing the Home screen with the recent games sheet pulled up', prototype: '/prototypes/next-games/index.html', summary: 'Puzzle cards on the Home screen: pick up the game you left, or pull the card up to see every game in progress.' },
  { slug: 'beat-saber', title: 'Beat Saber', client: 'Beat Games', year: 2025, disciplines: ['Digital'], art: 'type', palette: ['#07070b', '#ff3a4c', '#2f9dff'], caseStudy: true, cover: '/covers/beat-saber.svg', coverAlt: 'The Beat Saber logo in neon: BEAT in red above SABER in blue, on black', summary: 'Design work for Beat Saber, the VR rhythm game by Beat Games.' },
  { slug: 'sort-journey', title: 'Sort Journey', client: 'Bluetile Games', year: 2026, disciplines: ['Art direction', 'AI production', 'Illustration'], art: 'stack', palette: ['#c8622a', '#2b2f5e', '#f6a623'], caseStudy: true, featured: true, theme: 'blue', cover: '/covers/sort-journey.webp', coverAlt: 'Sort Journey key art for the Collections feature: the game logo, three sticker packs, a corgi and a stack of photo albums', link: { label: 'Sort Journey on Google Play', href: 'https://play.google.com/store/apps/details?id=com.playgames.sorting' }, summary: 'Collections for Sort Journey, a travel puzzle game by Bluetile Games: the art direction, and an AI pipeline that made around 180 cards a season.' },
  { slug: 'harbor-tea', title: 'Harbor Tea Co.', client: 'Harbor Tea Co.', year: 2026, disciplines: ['Packaging', 'Branding'], art: 'stack', palette: ['#0f3d3a', '#f3e6c8', '#e0763c'], caseStudy: true, role: 'Brand and packaging lead', summary: 'Sample project. A tin system for a small-batch tea importer, where each blend gets its own harbour flag.' },
  { slug: 'lumen-clinic', title: 'Lumen Clinic', client: 'Lumen Clinic', year: 2025, disciplines: ['Branding', 'Digital'], art: 'sun', palette: ['#f2efe8', '#1b2a4a', '#f2a93b'], caseStudy: true, featured: true, role: 'Identity and web design', summary: 'Sample project. A calmer identity for a family clinic, built around morning light rather than medical blue.' },
  { slug: 'kiln-and-co', title: 'Kiln & Co.', client: 'Kiln & Co. Ceramics', year: 2024, disciplines: ['Packaging', 'Illustration'], art: 'arch', palette: ['#c8553d', '#fbeee0', '#2d3047'], caseStudy: true, featured: true, role: 'Packaging and illustration', summary: 'Sample project. Shipping boxes for a ceramics studio, printed with the outline of the piece inside.' },
  { slug: 'openhouse', title: 'Openhouse', client: 'Openhouse', year: 2025, disciplines: ['Digital'], art: 'grid', palette: ['#e9edf7', '#14213d', '#3346d3'], caseStudy: true, role: 'Product designer', summary: 'Sample project. A viewing-booking app for flat hunters, designed around the ten minutes before a viewing.' },
  { slug: 'tidal-festival', title: 'Tidal Festival', client: 'Tidal Festival', year: 2024, disciplines: ['Branding', 'Motion'], art: 'waves', palette: ['#0b1d51', '#ffd6e0', '#ff5d73'], caseStudy: true, featured: true, role: 'Identity and motion', summary: 'Sample project. A seaside music festival identity whose wave mark moves with the tide timetable.' },
  { slug: 'quiet-hours', title: 'Quiet Hours', client: 'Quiet Hours', year: 2024, disciplines: ['Digital', 'Motion'], art: 'sun', palette: ['#1d1b2f', '#e8e4ff', '#9b8cff'], caseStudy: true, role: 'Product and motion design', summary: 'Sample project. A sleep and wind-down app where the interface dims with the evening.' },
  { slug: 'night-market', title: 'Night Market posters', client: 'City Night Market', year: 2023, disciplines: ['Print', 'Illustration'], art: 'type', palette: ['#111111', '#ffcf3f', '#ff4f2e'], caseStudy: true, role: 'Illustrator', summary: 'Sample project. A twelve-poster series, one for every month the market runs.' },
  { slug: 'civic-wayfinding', title: 'Civic Transit wayfinding', client: 'Civic Transit', year: 2022, disciplines: ['Branding', 'Print'], art: 'grid', palette: ['#ffd23f', '#111111', '#2a6f97'], caseStudy: true, role: 'Wayfinding designer', summary: 'Sample project. Signage for a regional bus network, tested at stops in rain and at night.' },
  { slug: 'field-notes-parks', title: 'Field Notes for Parks', client: 'Parks Trust', year: 2025, disciplines: ['Print', 'Illustration'], art: 'arch', palette: ['#dfe7d3', '#2f3e2e', '#d17a22'], caseStudy: false, summary: 'Sample project. Pocket notebooks sold in park visitor centres.' },
  { slug: 'atlas-cycling', title: 'Atlas Cycling Club', client: 'Atlas Cycling Club', year: 2024, disciplines: ['Branding', 'Print'], art: 'waves', palette: ['#e63946', '#f1faee', '#1d3557'], caseStudy: false, summary: 'Sample project. Club identity, jerseys and race numbers.' },
  { slug: 'grain-bakery', title: 'Grain Bakery', client: 'Grain Bakery', year: 2023, disciplines: ['Branding', 'Packaging'], art: 'stack', palette: ['#f4e1c1', '#5a3e2b', '#c0392b'], caseStudy: false, summary: 'Sample project. Bags, boxes and stamps for a neighbourhood bakery.' },
  { slug: 'ferro-specimen', title: 'Ferro type specimen', client: 'Self-initiated', year: 2022, disciplines: ['Print'], art: 'type', palette: ['#ececec', '#1a1a1a', '#e4572e'], caseStudy: false, summary: 'Sample project. A risograph specimen for a display typeface.' },
  { slug: 'moss-skincare', title: 'Moss Skincare', client: 'Moss', year: 2025, disciplines: ['Packaging'], art: 'label', palette: ['#c9d6c3', '#24382b', '#f5f0e6'], caseStudy: false, summary: 'Sample project. Refillable bottles with a label that peels off for recycling.' },
  { slug: 'small-press-report', title: 'Small Press annual report', client: 'Small Press Fund', year: 2024, disciplines: ['Print'], art: 'grid', palette: ['#fafafa', '#222222', '#3a86ff'], caseStudy: false, summary: 'Sample project. An annual report set like a literary magazine.' },
  { slug: 'orbit-podcast', title: 'Orbit podcast covers', client: 'Orbit', year: 2023, disciplines: ['Illustration'], art: 'sun', palette: ['#14102b', '#ffb5a7', '#fcd5ce'], caseStudy: false, summary: 'Sample project. Forty episode covers drawn in one evening palette.' },
  { slug: 'bramble-wine', title: 'Bramble wine labels', client: 'Bramble Vineyard', year: 2022, disciplines: ['Packaging', 'Illustration'], art: 'label', palette: ['#3d1f2b', '#f3d9c8', '#b23a48'], caseStudy: false, summary: 'Sample project. Hand-drawn labels for three small-batch wines.' },
  { slug: 'studio-calendar', title: 'Studio calendar 2025', client: 'Self-initiated', year: 2025, disciplines: ['Print', 'Illustration'], art: 'arch', palette: ['#ffe8d6', '#3f2e56', '#ff7b54'], caseStudy: false, summary: 'Sample project. A wall calendar sent to clients and friends.' },
  { slug: 'fold-dashboard', title: 'Fold dashboard', client: 'Fold', year: 2023, disciplines: ['Digital'], art: 'grid', palette: ['#0e1116', '#d7e3fc', '#4ade80'], caseStudy: false, summary: 'Sample project. An operations dashboard for a paper recycling startup.' },
  { slug: 'saltwater-swim', title: 'Saltwater Swim Club', client: 'Saltwater Swim Club', year: 2021, disciplines: ['Branding'], art: 'waves', palette: ['#cfe8ef', '#0b3954', '#ff6f59'], caseStudy: false, summary: 'Sample project. A badge and kit for a year-round sea swimming club.' },
  { slug: 'paper-moon', title: 'Paper Moon', client: 'Little Owl Books', year: 2021, disciplines: ['Illustration'], art: 'sun', palette: ['#243b55', '#f6e7b4', '#e08e45'], caseStudy: false, summary: 'Sample project. Illustrations for a 32-page picture book.' },
  { slug: 'copper-coffee', title: 'Copper Coffee Roasters', client: 'Copper Coffee', year: 2022, disciplines: ['Packaging', 'Branding'], art: 'stack', palette: ['#2b2118', '#e8c39e', '#c96f3b'], caseStudy: false, summary: 'Sample project. Bags with a roast-date stripe you can read across the shelf.' },
  { slug: 'lantern-titles', title: 'Lantern Film Festival titles', client: 'Lantern Film Festival', year: 2023, disciplines: ['Motion'], art: 'type', palette: ['#0d0d0d', '#f2e9e4', '#e9c46a'], caseStudy: false, summary: 'Sample project. Opening titles and award stings.' },
  { slug: 'market-hall', title: 'Market Hall signage', client: 'Market Hall', year: 2021, disciplines: ['Print', 'Branding'], art: 'arch', palette: ['#264653', '#f4f1de', '#e76f51'], caseStudy: false, summary: 'Sample project. Stall signs and a hall map for a covered market.' },
  { slug: 'verde-plants', title: 'Verde plant shop', client: 'Verde', year: 2022, disciplines: ['Digital'], art: 'label', palette: ['#e7f0e1', '#1f3d2b', '#f28c28'], caseStudy: false, summary: 'Sample project. An online shop sorted by how much light you have.' },
  { slug: 'holiday-cards', title: 'Holiday card set', client: 'Self-initiated', year: 2020, disciplines: ['Illustration', 'Print'], art: 'stack', palette: ['#8c1c13', '#f7ede2', '#2f5233'], caseStudy: false, summary: 'Sample project. Six letterpress cards.' },
  { slug: 'north-coast', title: 'North Coast tourism', client: 'North Coast Board', year: 2020, disciplines: ['Branding'], art: 'waves', palette: ['#e0ecf4', '#1b3a4b', '#f4a259'], caseStudy: false, summary: 'Sample project. A regional tourism mark and campaign toolkit.' },
  { slug: 'sprout-snacks', title: 'Sprout Snacks', client: 'Sprout', year: 2021, disciplines: ['Packaging'], art: 'label', palette: ['#fff3b0', '#335c67', '#e09f3e'], caseStudy: false, summary: 'Sample project. Snack pouches for school lunchboxes.' },
  { slug: 'echo-sleeves', title: 'Echo record sleeves', client: 'Echo Records', year: 2020, disciplines: ['Print', 'Illustration'], art: 'sun', palette: ['#f1e3d3', '#1e1e24', '#d64933'], caseStudy: false, summary: 'Sample project. Sleeves for a run of seven-inch singles.' },
  { slug: 'loop-animation', title: 'Loop brand animation', client: 'Loop', year: 2021, disciplines: ['Motion'], art: 'grid', palette: ['#191923', '#fbfef9', '#0e79b2'], caseStudy: false, summary: 'Sample project. A logo animation system in five lengths.' },
  { slug: 'index-posters', title: 'Index type posters', client: 'Self-initiated', year: 2019, disciplines: ['Print'], art: 'type', palette: ['#f5f5f5', '#101010', '#3346d3'], caseStudy: false, summary: 'Sample project. Typographic posters made from a book index.' },
];

/** Newest first; ties keep the order above. */
export const projects: Project[] = raw
  .map((p, i) => ({ p, i }))
  .sort((a, b) => b.p.year - a.p.year || a.i - b.i)
  .map(({ p }) => p);

export const caseStudies = projects.filter((p) => p.caseStudy);
export const featured = projects.filter((p) => p.featured);

export function countBy(d: Discipline) {
  return projects.filter((p) => p.disciplines.includes(d)).length;
}

export function slugify(d: string) {
  return d.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function related(p: Project, n = 3) {
  return projects
    .filter((o) => o.slug !== p.slug)
    .map((o) => ({ o, score: o.disciplines.filter((d) => p.disciplines.includes(d)).length * 10 - Math.abs(o.year - p.year) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ o }) => o);
}

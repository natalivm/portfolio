/**
 * Every project on the site comes from this list.
 *
 * Next Games, Sort Journey and Beat Saber are real projects. Lumen Clinic, Kiln & Co. and Tidal
 * Festival are SAMPLE CONTENT: invented placeholders that keep the homepage grid full.
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

const allDisciplines = [
  'Art direction',
  'AI production',
  'Branding',
  'Packaging',
  'Print',
  'Illustration',
  'Digital',
  'Motion',
] as const;

export type Discipline = (typeof allDisciplines)[number];
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
  theme?: 'blue' | 'space' | 'river';
  /** Path under /public to an interactive prototype's HTML file (name the file: the dev server does not resolve a bare folder); shown on the case study page. */
  prototype?: string;
  art: Art;
  /** [ground, ink, accent] for the placeholder poster */
  palette: [string, string, string];
}

const raw: Project[] = [
  { slug: 'next-games', title: 'Next Games', client: 'Puzzle games app', year: 2023, disciplines: ['Digital', 'Motion'], art: 'grid', palette: ['#eaf3ff', '#0b1a30', '#3a8dff'], caseStudy: true, featured: true, role: 'Product designer', cover: '/covers/next-games.png', coverAlt: 'Phone showing the Home screen with the recent games sheet pulled up', prototype: '/prototypes/next-games/index.html', summary: 'Puzzle cards on the Home screen: pick up the game you left, or pull the card up to see every game in progress.' },
  { slug: 'beat-saber', title: 'Beat Saber', client: 'Beat Games', year: 2025, disciplines: ['Digital'], art: 'type', palette: ['#07070b', '#ff3a4c', '#2f9dff'], caseStudy: true, theme: 'space', cover: '/covers/beat-saber.svg', coverAlt: 'The Beat Saber logo in neon: BEAT in red above SABER in blue, on black', summary: 'Design work for Beat Saber, the VR rhythm game by Beat Games.' },
  { slug: 'sort-journey', title: 'Sort Journey', client: 'Bluetile Games', year: 2026, disciplines: ['Art direction', 'AI production', 'Illustration'], art: 'stack', palette: ['#c8622a', '#2b2f5e', '#f6a623'], caseStudy: true, featured: true, theme: 'blue', cover: '/covers/sort-journey.webp', coverAlt: 'Sort Journey key art for the Collections feature: the game logo, three sticker packs, a corgi and a stack of photo albums', link: { label: 'Sort Journey on Google Play', href: 'https://play.google.com/store/apps/details?id=com.playgames.sorting' }, summary: 'Collections for Sort Journey, a travel puzzle game by Bluetile Games: the art direction, and an AI pipeline that made around 180 cards a season.' },
  { slug: 'river-race', title: 'River Race', client: 'Bluetile Games', year: 2026, disciplines: ['Art direction', 'AI production', 'Illustration'], art: 'waves', palette: ['#3ab5c3', '#04262e', '#f6b62a'], caseStudy: true, theme: 'river', cover: '/covers/river-race.webp', coverAlt: 'River Race key art: a crowned corgi leads a pink and a purple pet up a path of lily pads toward three trophies on a jungle island, while more pets wait on a wooden dock', link: { label: 'Sort Journey on Google Play', href: 'https://play.google.com/store/apps/details?id=com.playgames.sorting' }, summary: 'River Race, a timed event in Sort Journey: hop up the river one won level at a time, and fall in on your first loss.' },
  { slug: 'lumen-clinic', title: 'Lumen Clinic', client: 'Lumen Clinic', year: 2025, disciplines: ['Branding', 'Digital'], art: 'sun', palette: ['#f2efe8', '#1b2a4a', '#f2a93b'], caseStudy: true, featured: true, role: 'Identity and web design', summary: 'Sample project. A calmer identity for a family clinic, built around morning light rather than medical blue.' },
  { slug: 'kiln-and-co', title: 'Kiln & Co.', client: 'Kiln & Co. Ceramics', year: 2024, disciplines: ['Packaging', 'Illustration'], art: 'arch', palette: ['#c8553d', '#fbeee0', '#2d3047'], caseStudy: true, featured: true, role: 'Packaging and illustration', summary: 'Sample project. Shipping boxes for a ceramics studio, printed with the outline of the piece inside.' },
  { slug: 'tidal-festival', title: 'Tidal Festival', client: 'Tidal Festival', year: 2024, disciplines: ['Branding', 'Motion'], art: 'waves', palette: ['#0b1d51', '#ffd6e0', '#ff5d73'], caseStudy: true, featured: true, role: 'Identity and motion', summary: 'Sample project. A seaside music festival identity whose wave mark moves with the tide timetable.' },
];

/** Newest first; ties keep the order above. */
export const projects: Project[] = raw
  .map((p, i) => ({ p, i }))
  .sort((a, b) => b.p.year - a.p.year || a.i - b.i)
  .map(({ p }) => p);

export const caseStudies = projects.filter((p) => p.caseStudy);
export const featured = projects.filter((p) => p.featured);

/** The disciplines that have at least one project, for the work page's filters. */
export const disciplines = allDisciplines.filter((d) => projects.some((p) => p.disciplines.includes(d)));

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

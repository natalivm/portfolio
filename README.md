# Portfolio

A personal design portfolio built to stay quick to browse at 30+ projects.

- **Work index** (`/work/`): every project in one dense grid, discipline filter chips with counts, a "case studies only" switch, and a count that updates as you filter. Filters live in the URL (`/work/?d=packaging`), so a filtered view can be linked.
- **Two depths of project**: full case-study pages (`/work/<slug>/`) and quick-view projects that open in a lightbox from the grid, with previous/next inside the current filter.
- **Never lose your place**: the "All work" links return to the last filter and scroll position.
- **Find any project**: press ⌘K / Ctrl K (or `/`) and type a name, client, discipline or year.
- **Case studies** show "3 of 8", previous/next (← → keys work too) and three related projects.

## Make it yours

Everything is sample content right now.

1. `src/data/site.ts`: your name, initials, headline, intro, email, location, socials. Set `showSampleNotice: false` when the projects are real.
2. `src/data/projects.ts`: your projects. For each, set `caseStudy` (full page or lightbox) and `featured` (homepage, keep it to 4–6). Put cover images in `public/covers/` and set `cover: '/covers/name.jpg'` plus `coverAlt`. While `cover` is empty, a generated placeholder poster is drawn.
3. `src/pages/work/[slug].astro`: the case-study text is a template; a per-project write-up is the next step once real content exists.
4. `src/pages/index.astro`: the About text.

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

## Publish on GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on every push to `main`. In the repository settings, open **Pages** and set **Source** to **GitHub Actions**. The site will be at `https://<user>.github.io/portfolio/`. With a custom domain, remove the `BASE_PATH` line from the workflow.

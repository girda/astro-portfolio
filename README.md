# HIRDA — portfolio and website concepts

One repository for the portfolio and nine independent Astro demos.

| App | Published path | Development |
| --- | --- | --- |
| Portfolio (DE/RU/EN) | `/astro-portfolio/` | `npm run dev --prefix apps/portfolio` |
| KANT Barbershop | `/astro-portfolio/demos/barbershop/` | `npm run dev --prefix apps/barbershop -- --port 4322` |
| KLAR Cleaning | `/astro-portfolio/demos/cleaning/` | `npm run dev --prefix apps/cleaning` |
| WERKRAUM Auto Service (DE/RU) | `/astro-portfolio/demos/autoservice/` | `npm run dev --prefix apps/autoservice` |
| STILL Nail Atelier (DE/RU/EN) | `/astro-portfolio/demos/nails/` | `npm run dev --prefix apps/nails` |
| Lindenhof Autohaus | `/astro-portfolio/demos/lindenhof/` | `npm run dev --prefix apps/lindenhof` |
| Eichenhain Ecohomes | `/astro-portfolio/demos/ecohomes/` | `npm run dev --prefix apps/ecohomes` |
| STROMWERK Electrical | `/astro-portfolio/demos/electrical/` | `npm run dev --prefix apps/electrical` |
| HAUSWERK Home Service | `/astro-portfolio/demos/homeservice/` | `npm run dev --prefix apps/homeservice` |
| GRÜNWERK Gardens | `/astro-portfolio/demos/gardens/` | `npm run dev --prefix apps/gardens` |

Use Node.js 24. Install each app with `npm ci --prefix apps/<app>`.
Run `npm run build` at the repository root to assemble all ten sites in `dist/`.
`SITE_URL` sets the deployment origin; `PAGES_BASE` defaults to `/astro-portfolio/`.
Individual app builds default to `/`, so existing local development commands still work.

GitHub Pages uses GitHub Actions. Every push to `main` builds and deploys all sites.
Configure Settings → Pages → Source: GitHub Actions.

These are fictional portfolio concepts. Booking forms demonstrate interactions and do not send reservations. Stock photo credits are included on the demo pages.

## Checks and SEO

Run `npm test` for API, local n8n and SEO helper tests, then `npm run build` and `npm run check:seo` for generated metadata and preserved demo routes.
`SITE_URL` must be a public HTTPS origin (no pathname); `PAGES_BASE` controls the combined deployment prefix.
Use `SITE_INDEXABLE=false` for a studio preview build. Development pages are noindex; the `/cat-lab/` experiment is always noindex.
The sitemap currently lists only the existing DE/EN homepages. Add real page routes to `apps/portfolio/src/config/site.ts` as they are implemented.
A robots.txt below a GitHub Pages project subpath cannot control the origin root; see [deployment notes](docs/DEPLOYMENT.md).

[Project hub](docs/PROJECT_HUB.md) · [Tasks](docs/TASKS.md) · [Architecture](docs/ARCHITECTURE.md)

Four service demos updated locally on 24 October: [QA and Figma](docs/audit/service-demos-2026-10-24.md) · [Image sources and prompts](docs/SERVICE_DEMOS_MEDIA.md). Not published.

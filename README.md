# HIRDA — portfolio and website concepts

One repository for the portfolio and four independent Astro demos.

| App | Published path | Development |
| --- | --- | --- |
| Portfolio (DE/RU/EN) | `/astro-portfolio/` | `npm run dev --prefix apps/portfolio` |
| KANT Barbershop | `/astro-portfolio/demos/barbershop/` | `npm run dev --prefix apps/barbershop -- --port 4322` |
| KLAR Cleaning | `/astro-portfolio/demos/cleaning/` | `npm run dev --prefix apps/cleaning` |
| WERKRAUM Auto Service (DE/RU) | `/astro-portfolio/demos/autoservice/` | `npm run dev --prefix apps/autoservice` |
| STILL Nail Atelier (DE/RU/EN) | `/astro-portfolio/demos/nails/` | `npm run dev --prefix apps/nails` |

Use Node.js 24. Install each app with `npm ci --prefix apps/<app>`.
Run `npm run build` at the repository root to assemble all five sites in `dist/`.
`SITE_URL` sets the deployment origin; `PAGES_BASE` defaults to `/astro-portfolio/`.
Individual app builds default to `/`, so existing local development commands still work.

GitHub Pages uses GitHub Actions. Every push to `main` builds and deploys all sites.
Configure Settings → Pages → Source: GitHub Actions.

These are fictional portfolio concepts. Booking forms demonstrate interactions and do not send reservations. Stock photo credits are included on the demo pages.

# One Loop Social

Web SaaS for local service businesses: voice + photo → grounded multi-network **Post** / **Publication** (פוסט / פרסום) in 2–3 minutes.

## Stack

- Next.js App Router (mobile `/m` · desktop `/d`)
- Brand tokens in `tailwind.config.js` + `lib/theme/tokens.css`
- Hebrew RTL default / English LTR (`locale` cookie)
- Zero-hallucination pipeline in `lib/ai/` (Stages 1–3, Zod only)
- Demo data in `lib/demo/store.ts` until Clerk/Neon/OAuth are wired

## Quick start

```bash
npm install
npm run dev
```

Open `/` — middleware routes to `/m` (mobile) or `/d` (desktop).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run test:grounding` | Grounding / anti-hallucination checks |

## Key routes

| Path | Role |
|------|------|
| `/m` | Mobile capture |
| `/m/studio` | Generation deck |
| `/m/publish` | Publish All / Copy & Open |
| `/d/dashboard` | Post Studio (enabled tabs only) |
| `/d/calendar` | Diary + Fill this slot |
| `/d/reviews` | Google + Easy · 3-tier replies |
| `/d/analytics` | Exactly 4 Engagement Pulse cards |

## Terminology

Always **Post / Publication (פוסט / פרסום)** — never “campaign”.

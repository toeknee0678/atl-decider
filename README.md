# ATL Decider

Group decision-making MVP for Metro Atlanta. Friends create a room, each
answer 5 quick questions, and the app returns top venues weighted by
everyone's input and cross-referenced against editorial picks from
The Infatuation, Eater Atlanta, and Atlanta Magazine.

## How it works

1. One person starts a room and shares the 6-character code or invite link.
2. Each friend joins, enters their name, and answers 5 questions:
   - Eat / Do / Both
   - Budget per person ($ to $$$$)
   - Area of town
   - Vibe (chill, lively, big night, active)
   - Group context (date, friends, family, tourists)
3. The host clicks "Reveal results."
4. Everyone sees the top picks, ranked by a weighted Borda count and
   boosted by editorial coverage. Each result links back to the source.

## Local development

```bash
npm install
npx netlify dev
```

This runs Vite plus Netlify Functions on http://localhost:8888.

## Deploy

Connected to Netlify via GitHub. Pushes to `main` rebuild automatically.

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Editorial sources

Venues in `public/places.json` link back to their original reviews.
Quoted snippets are kept under 15 words and always credit the
publication. Do not paste full review text into the dataset.

## Tests

```bash
npm test
```

## Tech stack

- Vite + React + React Router
- Tailwind CSS
- Netlify Functions + Netlify Blobs (KV storage, no external DB)
- Vitest for unit tests

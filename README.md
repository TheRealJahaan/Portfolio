# Jahaan Suthar · Travel Journey Portfolio ✈

An interactive single-page portfolio where visitors **fly from city to city**. Each city is a section of the portfolio:

| Airport | City | Section |
| --- | --- | --- |
| MAA | Chennai (home) | About Me: passport ID page + split-flap departures board |
| SFO | San Francisco | Projects: flippable postcards |
| HND | Tokyo | Skills: passport visa stamps with proficiency levels |
| LHR | London | Languages: currency-exchange board + luggage tags |
| BOS | Boston | Education: flight log timeline |

Board a flight → pick a city on the dotted world map → get a boarding pass → watch the plane taxi, take off, follow a self-drawing route and land, then the camera zooms into the city. A passport widget collects a stamp per city, and visiting all five unlocks **Journey Complete 🌍**.

Plain HTML, CSS and JavaScript. **No build step, no dependencies to install.** GSAP + MotionPathPlugin are vendored in `vendor/`, so it also works offline.

## Run it locally

Any static server works. Pick one:

```bash
# Python (already on macOS / most Linux)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

You can also just double-click `index.html`; everything works from `file://` too (only the Google Fonts need internet).

Deep links: `#about`, `#projects`, `#skills`, `#languages`, `#education` land you straight in that city.

## Edit your content

**Everything personal is in [`js/data.js`](js/data.js).** You should never need to touch `app.js` to change text.

- `photo`: set to e.g. `"assets/me.jpg"` (and add the file) to replace the monogram avatar.
- `contact.bookCall`: swap the mailto for a Calendly / Cal.com link if you have one.
- `projects[].links`: add `live` and `code` URLs; empty ones show "Code & demo on request".
- `skills[].items[].level`: 1 Beginner · 2 Intermediate · 3 Advanced · 4 Expert.
- `codeLanguages[].rate`: 0–100, drives the bar on the exchange board.
- `cities`: rename cities, airport codes, flight numbers, gates or move pins (`lat`/`lon`).

Replace `assets/resume.pdf` to update the résumé.

## Features

- Split-flap departure board and exchange board animations
- Custom SVG world map (dot matrix generated from Natural Earth data), pulsing pins, hover tooltips, VISITED stamps
- Boarding pass with editable passenger name, seat, gate, boarding time and barcode
- 3–5 s flight: taxi, take-off, curved dashed route drawn with an SVG mask, plane follows and rotates along the path (GSAP MotionPath), cloud parallax, live altitude / speed / ETA readout, landing + zoom. **Skip ✈** button (or `Esc`)
- Passport widget with stamps, saved in `localStorage`; "Reset journey" inside it
- Light mode (day flight on cream paper) and dark mode (night flight with stars); follows the system setting, toggle in the top bar
- Synthesised sound effects (engine, chime, stamp, flaps) via Web Audio, **off by default**
- Mobile: map becomes a vertical departures list and the flight is a simplified arc
- `prefers-reduced-motion`: flights are replaced by a quick fade
- Keyboard: `B` opens the map, `H` flies home, `Esc` closes / skips; focus is kept inside open dialogs

## File structure

```
index.html          Page shell, overlays (map, boarding pass, passport), SEO tags
css/style.css       All styles: tokens, themes, components, responsive rules
js/data.js          ← your content
js/app.js           State, rendering, map geometry, flight sequence, routing
js/sound.js         Web Audio sound effects (no audio files)
js/worldmap.js      Generated dotted world map path
vendor/             GSAP 3.13 + MotionPathPlugin (free standard license)
assets/             resume.pdf, photos
404.html, robots.txt
```

## Deploy

Upload the folder to any static host. No build command; publish directory is the repo root.

- **GitHub Pages:** repo Settings → Pages → Deploy from branch → `main` / root.
- **Netlify / Vercel:** import the repo, leave the build command empty, output directory `.`.
- **Cloudflare Pages:** framework preset "None", build output `/`.

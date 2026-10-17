# Aurora Travel

A dark, emerald-accented travel-planning web application adapted from the supplied Aurora landing-page design and the earlier Travel Lite planner. The source includes a React interface and a small Node backend, not just a visual mock-up.

**Project scope:** Hyderabad, Jaipur and Goa; one to three days; one to eight travellers. This is a local, non-commercial student prototype. Real reservations, payments, live travel inventory and account-based cloud storage are not included.

Start with **START_HERE.txt**. See **TESTING.md** before treating this as a verified production build.

## Quick start

Install Node.js **22.12 or newer** (a supported LTS release is recommended).

On Windows, extract the entire ZIP and double-click **START-WINDOWS.bat**. The script installs dependencies when needed, attempts the optional hero-video download, builds the application, then starts the server and opens the browser. Keep its terminal open.

Manual setup from the `aurora-travel` folder:

```sh
npm install
npm run build
npm start
```

Open **http://localhost:3000**. On Windows PowerShell, use `npm.cmd` instead of `npm` if the PowerShell execution policy blocks `npm.ps1`. Do not change your security policy just for this project.

The first installation needs internet. Running the compiled rule-based planner does not require a paid service, login or database. After the build, `node server.mjs` runs the website with Node's built-in modules. Internet is still needed for external weather, Gemini, Maps and Google Fonts. System fonts are the fallback when fonts cannot load.

For editing with live reload:

```sh
npm run dev
```

Open **http://localhost:5173**. This command starts Vite on 5173 and the API server on 3000. Do not start an additional server on the same ports. When finished editing, rebuild before using `npm start`.

On macOS/Linux, `sh START-MAC-LINUX.sh` performs the install/build/start flow.

## Included features

| Area | Implemented behaviour |
|---|---|
| Design | Aurora-inspired dark emerald hero, white car mark, left-aligned copy, responsive navigation, destination cards and planner dashboard |
| Trip input | Destination, date, duration, group size, INR budget, interests, pace, diet, rooms and editable cost assumptions |
| Time constraints | Daily start/hours plus first-day available-from and last-day available-until controls |
| Itinerary | Proposed attraction visits, travel buffers, meals and unallocated/rest time; individual day tabs |
| Budget | Group totals, per-person estimate, category breakdown, contingency, remaining budget and explicit over-budget warning |
| Revisions | Fewer stops/lower activity allowance, slower pace, indoor preference, local-food focus, exclude stop, rule-based variation |
| Optional AI | Gemini ranks known attractions using preferences and text requests. Deterministic code schedules visits and calculates costs |
| Weather | Open-Meteo daily forecast retrieval, partial/out-of-range/unavailable states, refresh and rain-related indoor suggestion |
| Maps | Individual attraction searches, daily route link, restaurant searches and official venue information links |
| Trips | Named browser-local snapshots, search, reopen, remove and JSON import; up to 20 saved trips |
| Exports | Text, JSON, tentative calendar `.ics`, and print layout for browser Print / Save PDF |
| Packing | Checkboxes, custom items and forecast-aware suggested additions when forecast data is available |
| Bookings | External service searches and acknowledged local DEMO records; create, cancel and text export; no reservation is made |
| Transparency | Honest planner mode, visible data limitations, source links, privacy information and browser-data clearing |

## What is actually intelligent?

The deterministic planner validates constraints, scores places from a limited catalogue, groups visits using broad area labels, inserts fixed travel buffers, checks timetable overlap and computes a group budget. When necessary it reduces activity count; it does not fabricate cheaper hotel rates to make a budget fit. Some constraints remain impossible, and that is reported.

With Gemini enabled, one bounded server-side model call ranks supplied place IDs and provides a short ranking summary. The model does not invent a destination database, calculate the final bill, browse live inventory or purchase anything. The application, not the model, makes weather requests and enforces final scheduling/budget checks. This is a hybrid AI-assisted planner, not an autonomous booking agent or a live route optimiser.

Custom text requests require Gemini. The four quick-revision controls work without it. An indoor preference prioritises available indoor catalogue entries; it does not guarantee a completely indoor itinerary. Dietary searches are preferences, not ingredient or allergen verification.

## Optional Gemini setup and free usage

1. Visit https://aistudio.google.com/api-keys and create an API key in a project explicitly marked **Free Tier**.
2. Copy `.env.example` to `.env` in the project root.
3. Add your key only to that server-side `.env` file.
4. Restart the server and refresh the page.
5. Enable **A little AI assistance** and create a new trip.

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3000
HOST=127.0.0.1
WEATHER_ENABLED=1
```

Model availability, free-tier eligibility, quotas and pricing may change. Check https://ai.google.dev/gemini-api/docs/pricing before enabling a key. Do not enable billing for a zero-cost demo. This application cannot inspect your billing tier; a key from a paid project can incur charges. The app never switches automatically to a different paid model.

Successful results say **Gemini-assisted**. Missing keys, unavailable quota, failed requests or invalid model responses fall back to a clearly labelled **Rule-based** result. Do not claim the no-key result used an LLM.

Keys are never returned by `/api/config` or embedded in the frontend. `.env` is ignored by Git. Never upload it, paste it into frontend code or share it in screenshots.

## Background video and design assets

The original design prompt specified this video:

https://pub-1e5b4001b36b47e28e6a2fb775966a79.r2.dev/templates/aurora/hero.mp4

It could not be downloaded in the build environment. An original vector landscape is included at `public/aurora-landscape.svg` so the website does not depend on that download.

The launchers attempt the video download during first setup. You can retry manually:

```sh
npm run fetch:hero
npm run build
npm start
```

If the host is unavailable, the script keeps the fallback and reports the issue. This version is an adaptation of the reference, not a pixel-for-pixel reproduction of its missing video. Confirm that you have rights to use externally supplied media before publishing. Google Fonts are linked in `index.html`; no font files are distributed.

## Data, estimates and sources

`lib/catalogue.mjs` contains ten starter attractions per destination. Names, broad area labels, tags, suggested visit lengths and links came from the existing project catalogue. Venue links are provided for the traveller to check; this build did not re-verify every venue, location, closure or opening schedule. The catalogue is not a live or comprehensive travel database.

Accommodation is **rooms x nights x room allowance**. Nights are days minus one. Meals are **travellers x days x daily meal allowance**. Local transport is a daily group allowance. Activity allowance is per person per scheduled stop. Intercity travel is included only when its separate group allowance is greater than zero. Zero allowance means excluded, not free. Contingency is calculated on the subtotal.

Time blocks are suggestions. Transfers use fixed 30-minute same-area or 60-minute cross-area buffers, not road routing or traffic data. Opening hours, closure days, accessibility, tickets and capacity are unverified. All listed destinations use India time. Arrival/departure controls describe time available for this itinerary, not actual flight tracking.

Weather requests use Open-Meteo's standard forecast endpoint and date coverage checks. Beyond the supported horizon or when the request fails, the app does not invent weather. The endpoint uses a short server timeout and a 30-minute in-memory cache. Data attribution appears in the interface. The free Open-Meteo service is intended for non-commercial use; review https://open-meteo.com/en/terms and https://open-meteo.com/en/docs before public or commercial use.

Google Maps URLs open external maps; this app does not retrieve live Maps traffic data. See https://developers.google.com/maps/documentation/urls/get-started.

## Saved data and privacy

Saved trip snapshots and demo booking records use this browser's local storage. Packing checklists are stored separately per trip ID. Changing browser, profile, host (`localhost` versus `127.0.0.1`) or port changes the storage origin. Browser data clearing can remove saved trips.

JSON exports contain the trip snapshot, not the separately stored custom checklist checkbox state or demo booking collection. Export individual demo records from their cards. Version-1 Travel Lite plan JSON is accepted when it matches the supported schema; old browser keys are not automatically migrated. No import is sent to an external service until you explicitly regenerate it with AI enabled.

Gemini receives trip preferences, catalogue choices and request text only when AI is selected. Weather sends city coordinates to Open-Meteo. Font requests go to Google Fonts. External links open the selected provider. No analytics/advertising scripts, payment collection or account login are added.

## Project structure

```text
src/
  App.tsx                 State, API requests, saves, modals and booking records
  components/
    Hero.tsx              Landing page, destination cards and navigation
    TripForm.tsx          Preferences, time windows and cost assumptions
    Results.tsx           Itinerary, budget, weather, bookings and packing
    UI.tsx                Accessible fields, buttons, dialogs and icons
  types.ts                Shared frontend types
  utils.ts                Import validation, storage, Maps, text/calendar export
  index.css               Responsive layout and print styles
lib/
  planner.mjs             Validation, ranking, timetable, budget, Gemini/weather
  catalogue.mjs           Starter attraction records and source links
server.mjs                Local HTTP API and built frontend serving
scripts/dev.mjs           Vite + API development launcher
scripts/fetch-hero.mjs    Optional reference-video downloader
public/                   Vector background and favicon
tests/                   Planner and utility tests
```

The required frontend stack is React 19, TypeScript, Vite, Tailwind CSS v4 through `@tailwindcss/vite`, and `framer-motion`. Typography is primarily declared inline through UI helpers; responsive overrides are in the stylesheet. The backend uses Node built-ins and direct server-side fetch, with no database or paid hosting dependency.

## Two-day demo plan

**Day 1:** Install, launch, generate a no-key trip, understand the cost assumptions and personalise the branding. Connect a free-tier Gemini key only after the no-key flow works.

**Day 2:** Test all three destinations, a one-day trip, arrival/departure constraints, an unrealistic budget, a revision, local save/reopen, exports and a demo booking. Run `npm test`. Verify your own live weather and Gemini calls before presenting them as live integrations.

A five-minute demonstration:

1. Generate Hyderabad, three days, two travellers, INR 15,000.
2. Show the mode label, proposed timetable and estimated group budget.
3. Choose fewer stops, show the revised activity allowance, then adjust cost assumptions.
4. Open a map, explain forecast availability, and tick a packing item.
5. Save/reopen the trip and export text or print it.
6. Create a clearly labelled DEMO booking after acknowledging that no reservation occurs.

## Troubleshooting

| Problem | Action |
|---|---|
| Node not recognised | Install Node LTS, close and reopen VS Code/the launcher. Do not randomly replace Windows PATH entries. |
| Install cannot reach npm | Check internet/proxy restrictions and retry `npm install`. Do not delete source files. |
| Vite or TypeScript build error | Preserve the exact message. Check Node >=22.12 and rerun `npm install` from this folder. |
| Port 3000 busy | Stop the old Travel Lite server. For the compiled app, set `PORT=3001` in `.env`, restart and open port 3001. The dev launcher uses fixed ports 3000/5173. |
| Backend not connected | Run the launcher or `npm run dev`, not Live Server or a directly opened HTML file. |
| Missing background video | The illustrated background is the supported fallback; the planner still works. Retry `npm run fetch:hero` then rebuild. |
| Gemini unavailable | Check the server-side key and free-tier quota, restart, and inspect the honest mode note. Do not enable billing just to bypass an error. |
| Forecast missing | Date coverage or the service may be unavailable. The itinerary remains usable as a non-weather-verified draft. |
| Saved trip not visible | Use the same browser/profile/host/port or import a JSON backup. |

## Deployment boundary

The server enforces localhost hosts/origins and a small in-memory rate limit. It is designed for this local demonstration, not for exposing an API key publicly. Public deployment needs a separate security review: authentication, per-user quotas, durable data, provider policies, monitoring and a deployment-specific origin/host setup. Do not simply bind this prototype to a public interface and call it launch-ready.

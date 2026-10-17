# Verification report

Build work performed on 16 October 2026. This report separates source functionality from native production-build and live-service verification.

## Executed successfully

**49 automated Node tests passed, 0 failed.** Run them without installing frontend packages:

```sh
node --experimental-strip-types --test tests/*.test.mjs
```

Or run `npm test`. The Node 22 type-stripping warning is expected; the utility tests import a TypeScript file with erasable type annotations. The application build still uses TypeScript and Vite normally.

Coverage includes input validation, three destinations, dates, invalid destinations, budget arithmetic, infeasible budgets, schedule overlap checks, same-area/cross-area buffers, no duplicate attractions, arrival/departure windows, excluded attractions, dietary searches, revisions, venue source presence, India date handling, missing API key, mocked Gemini responses/errors, mocked weather coverage/errors, validated JSON imports, safe external URLs, text export and tentative UTC calendar export with UTF-8 line folding.

**27 browser workflow checks passed** in a controlled offline rendering harness. The tests covered initial connectivity, form generation, budget arithmetic, all day tabs, safe map links, keyboard tab navigation, unavailable-weather disclosure, checklist additions, acknowledged demo records/cancellation, save/reopen, export payloads, print styles, four revision controls, all three destinations, low budgets, cost editing, JSON import/rejection, setup dialog dismissal, responsive layout and absence of React runtime errors. No horizontal overflow was observed at widths of 390, 768, 1024 and 1440 pixels.

## Important harness limitations

The environment could not download npm packages. Chromium also could not directly navigate to the local HTTP server under its existing policy. The policy was not disabled or bypassed.

For functional UI checks, the source was transpiled with the available TypeScript compiler and rendered into an offline Chromium page using a cached React **19.1.1** runtime. Framer Motion components were replaced by non-animated wrappers only inside that test harness. Requests were passed through a test bridge to the actual Node HTTP server and the actual planner. Browser local storage was represented by an in-memory storage adapter, and download/print actions were captured rather than exercised through operating-system dialogs.

Consequently, those checks do **not** establish that the declared React 19.2.4/Vite 8/Framer Motion package installation, full TypeScript type check, native production build, animation timing, genuine browser persistence across restarts or download dialogs work in the user's environment. They validate the checked application logic and layout under the stated harness conditions.

The offline harness and its cached runtime are **not included** in the delivered project. Preview screenshots use the bundled vector fallback, system fonts and the non-animated harness; fonts/motion can look slightly different in the installed app.

## Not verified here

- `npm install` and a full native `npm run build`: package registry DNS access failed. No production `dist` folder is claimed or shipped.
- Live Gemini responses: no user's API key was supplied. AI error/success parsing is tested with mocked responses, not a live model.
- Live Open-Meteo responses: unavailable from this environment; browser checks used weather disabled. Weather parsing/coverage/failure logic uses fixtures in unit tests.
- Original hero MP4: download failed. An illustrated SVG fallback and a retry script are included.
- Native Windows/macOS launcher execution: scripts were reviewed but not executed on those operating systems.
- Current venue opening hours, ticket prices, closures, accessibility, road travel times or booking inventory: not supplied or verified by this project.
- Real reservations, payments and public deployment: intentionally not implemented.

## Checks to perform on your laptop

1. Use Node >=22.12. Run `npm install`, `npm run build`, `npm test`, then `npm start`.
2. Confirm the interface loads at localhost:3000 and generates a Rule-based plan without a key.
3. Reload the browser after saving; confirm the saved trip and checklist persist.
4. Try text/JSON/calendar downloads and the browser Print / Save PDF dialog.
5. Check mobile navigation and the installed Framer Motion animations, including reduced-motion settings.
6. Test an actual nearby-date weather request with internet; inspect the displayed forecast dates and attribution.
7. Only with a verified free-tier Gemini project, configure `.env`, restart, enable AI and confirm a Gemini-assisted result. Test that a failed request is clearly labelled as a fallback.
8. Present booking records as DEMO ONLY, never as real reservations or receipts.

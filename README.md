# CSNIS Network Infrastructure

A real Svelte 5 / SvelteKit application with Tailwind CSS 4 and official shadcn-svelte Button and Switch components (vendored through the shadcn-svelte CLI). Flat navy, blue, white and light-gray theme, with no gradients.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

## Validate and build

```sh
npm run check
npm test
npm run build
npm run preview
```

The static adapter prerenders every route into `build/`, with directory-style URLs. Deploy the contents to a static host supporting directory indexes. Do not open the generated HTML through `file://`.

## Routes

| Page | Route |
| --- | --- |
| Home | `/` |
| Services | `/services/` |
| Infrastructure | `/infrastructure/` |
| Live Topology | `/topology/` |
| Contact | `/contact/` |

Shared navigation and footer live in `src/routes/+layout.svelte`; shared colors and responsive foundations in `src/app.css`. PageHeader, status badges, topology nodes/map, details and recent events are reusable components in `src/lib/components`. Service content lives in `src/lib/data/services.ts`.

## Monitoring integration

The current source is explicitly marked demo data. `src/lib/monitoring/types.ts` defines the `MonitoringProvider` and `NetworkSnapshot` contracts. The default mock provider produces six devices, five valid connections and sample events. Distribution utilization alternates between warning and recovered every three refreshes; linked status and summaries derive from the same snapshot.

`poller.ts` refreshes every five seconds after the previous response, prevents overlapping requests, allows manual refresh while paused, times requests out after ten seconds, and cancels timers and requests when the route is destroyed. On a failed refresh the page retains the last successful snapshot and shows a retry message. Loading and empty states are included.

To connect real monitoring:

1. Implement a server-side proxy that authenticates with Zabbix, PRTG, LibreNMS or another monitoring provider, and normalizes its output into `NetworkSnapshot`. Use stable device IDs and coordinates in the 600 × 480 logical map space. The included API adapter validates input and rejects malformed data.
2. In `src/routes/topology/+page.svelte`, import `createApiProvider` from `$lib/monitoring/api` and replace `createMockProvider()` with `createApiProvider('/api/monitoring')`.
3. Change the demo labels and descriptions only once the source is real. Keep all vendor credentials on the proxy; never expose them through public environment variables or browser bundles.
4. This build uses `adapter-static`: the API proxy must be deployed separately and routed under the same origin, or migrate to a server-capable adapter. No monitoring endpoint is implemented or claimed in this demo.

Optional WebMCP device selection is feature-detected, uses the same selection state as the UI, and unregisters on route teardown. Unsupported browsers behave normally. No supported WebMCP validation context was available during delivery; this optional integration is not browser-verified.

## Content and components

Service names and repository links live in `src/lib/data/services.ts`. The same ServiceGrid and ServiceCard components are used on Home and Services. The three linked repositories are init.d, Printer-server and Booking under CSNIS-CSKmitl. Repository documentation was not accessible during this update, so no unverified capabilities are listed.

The contact location is **พระจอมเกล้า 713**, configured in `src/lib/data/contact.ts`. ContactLocation and ContactCallout share that data. The support request form and all draft/clipboard logic have been removed.

Page routes compose focused components under `src/lib/components/home`, `services`, `contact`, `layout`, `infrastructure` and `topology`. Monitoring data/polling remain separate under `src/lib/monitoring`.

## Reference fidelity

The referenced conversation and its uploaded CSS supplied the design direction: CSNIS branding, Connect / Secure / Scale hero, bilingual English/Thai copy, white navigation, flat blue core node, white cards with light borders, navy contact panel, six network components and five separate pages. The later generated multi-page HTML archive was not exposed by the conversation reader; this app follows the accessible original HTML/CSS and subsequent design corrections. The unwanted operational hero statement is omitted.

Documentation consulted: [shadcn-svelte](https://shadcn-svelte.com/docs/migration) and [SvelteKit static adapter](https://svelte.dev/docs/kit/adapter-static).

Responsive layouts are implemented for mobile, tablet and desktop; the logical topology map scrolls horizontally on narrow screens to keep device labels legible. Keyboard users can focus the scroll region and inspect nodes. Visual browser QA was not requested and has not been claimed.

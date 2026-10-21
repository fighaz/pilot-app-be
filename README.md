# Susi Air Pilot App — Backend (NestJS)

REST API for the Susi Air Pilot App technical test. Serves the pilot profile,
daily flight hours, a server-side rolling-sum series, document expiry statuses,
and monthly duty schedules. Data is seeded from the provided JSON files at
startup — no database.

Built with NestJS 12 + TypeScript (ESM), JWT auth, class-validator DTOs,
a global exception filter, and vitest for unit/e2e tests.

## Requirements

- Node.js 20+
- npm

## Setup

```bash
npm install
cp .env.example .env   # adjust values if needed
```

The three mock JSON files (`mock-flight-hours.json`, `mock-documents.json`,
`mock-schedules.json`) must stay in the project root; they are read at startup.

## Run

```bash
# development (watch mode, loads .env)
npm run start:dev

# production
npm run build
npm run start:prod
```

The server listens on `PORT` (default 3000).

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `TODAY` | `2026-05-15` | Reference "today" for all business logic (per the brief). Never derived from `new Date()`. |
| `JWT_SECRET` | dev fallback | Secret used to sign/verify login tokens. Set a strong value in production. |
| `JWT_EXPIRES_IN` | `12h` | Token lifetime. |
| `CORS_ORIGIN` | `*` | Allowed frontend origin(s), comma-separated, or `*`. |
| `PORT` | `3000` | HTTP port. |

## Test

```bash
npm test          # unit tests
npm run test:e2e  # supertest e2e (auth guard, validation, all endpoints)
npm run lint      # oxlint
```

## API

All routes except `POST /auth/login` require `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/login` | `{ username, password }` → `{ accessToken }`. Pilot account: `johndoe` / `susiairtest`. |
| GET | `/pilot/me` | `{ name, totalFlightHours, avatarUrl }` |
| GET | `/flight-hours?from=YYYY-MM-DD&to=YYYY-MM-DD` | Daily hours for the inclusive range; missing days returned as `0`. Max span 731 days. |
| GET | `/flight-hours/summary?range=1w\|1m\|3m\|6m\|1y` | Rolling-sum series (15 points centered on today), limit, yMax, windowDays, and the four limit cards. |
| GET | `/documents` | Documents with `daysRemaining` and badge `status` (`safe` / `soon` / `expired`). |
| GET | `/schedules?year=YYYY&month=MM` | Schedule entries for one month plus the duty-type legend. |

Every error uses one consistent shape:

```json
{
  "statusCode": 400,
  "message": ["month must not be greater than 12"],
  "error": "Bad Request",
  "timestamp": "2026-05-15T09:00:00.000Z",
  "path": "/schedules"
}
```

### `GET /flight-hours/summary` response

```jsonc
{
  "range": "1w",              // selected toggle
  "today": "2026-05-15",      // configured reference date
  "windowDays": 7,            // sum window for this range
  "limit": 40,                // red line
  "yMax": 45,                 // chart Y max
  "points": [                 // today-7 .. today+7, today centered
    { "date": "2026-05-08", "rollingSum": 21.1 },
    { "date": "2026-05-15", "rollingSum": 25.2 },
    { "date": "2026-05-22", "rollingSum": 30.4 }
  ],
  "cards": [                  // Hours to Limit summary cards
    { "key": "daily", "label": "Daily", "current": 6.4, "limit": 8, "windowDays": 1 },
    { "key": "weekly", "label": "Weekly", "current": 25.2, "limit": 40, "windowDays": 7 },
    { "key": "monthly", "label": "Monthly", "current": 87.2, "limit": 100, "windowDays": 30 },
    { "key": "annual", "label": "Annual", "current": 1013.8, "limit": 1050, "windowDays": 365 }
  ]
}
```

## Architecture

```
src/
├── main.ts                      # bootstrap, global ValidationPipe, CORS
├── app.module.ts                # root module, APP_GUARD + APP_FILTER
├── config/                      # AppConfigService (TODAY, JWT, CORS)
├── common/
│   ├── filters/                 # global exception filter (consistent error shape)
│   ├── guards/                  # global JWT guard
│   ├── decorators/              # @Public()
│   ├── validators/              # calendar-date + date-range validators
│   └── utils/                   # strict YYYY-MM-DD date helpers
├── database/                    # DataSourceService: loads the 3 JSON files in-memory
└── modules/
    ├── auth/                    # POST /auth/login (JWT)
    ├── pilot/                   # GET /pilot/me
    ├── flight-hours/            # GET /flight-hours, GET /flight-hours/summary
    ├── documents/               # GET /documents
    └── schedules/               # GET /schedules
```

The rolling sum runs entirely on the server in
`src/flight-hours/flight-hours.service.ts` — method `rollingWindowBluffing()`
(with its required companion comment kept verbatim above it).

## Key decisions

1. **"Today" is a config value, not the clock.** `TODAY` (env, default
   `2026-05-15` per the brief) is the only source of "now". `new Date()` is
   never used for business logic — only inside date helpers for UTC calendar
   arithmetic on explicit dates, and for error timestamps.
2. **Mock JSON `today` fields are ignored.** `mock-documents.json` contains
   `today: 2026-05-31`, which conflicts with the brief. The single configured
   `TODAY` wins so the whole API is consistent.
3. **Missing days count as zero.** The daily endpoint fills gaps with `0` and
   the rolling sum treats absent dates as `0`, so no dates are ever skipped.
4. **Windows extending before the dataset start are partial.** Days before
   2024-12-27 simply contribute `0`; no extrapolation. The result is a
   conservative under-count at the very beginning of the data.
5. **Future dates use the data that exists.** The dataset runs to
   2026-05-31 (covers today+7), so a rolling sum ending on a future date is
   the planned/projected sum over known values; days beyond the dataset
   contribute `0`.
6. **Values above the limit are returned unclamped.** The server reports real
   sums (e.g. 102.2h against a 100h limit); clamping to the chart Y-max is a
   rendering concern left to the frontend so no data is lost.
7. **JWT over an opaque token.** Stateless verification in the global guard;
   no server-side session store needed.
8. **One summary call feeds cards + chart.** The limit cards are embedded in
   `/flight-hours/summary` so the Home page needs a single request per toggle.
9. **Avatar URL is served by the API** (initials avatar, brand navy) because
   the JSON dataset contains no avatar field — the frontend stays mock-free.

## With more time

- Refresh tokens + proper logout/revocation
- Rate limiting on `/auth/login`
- OpenAPI/Swagger docs
- Property-based tests for date helpers
- SQLite/Prisma persistence instead of in-memory JSON

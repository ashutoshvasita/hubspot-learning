# HubSpot API learning

Learning the HubSpot CRM REST API from scratch, following the TL checklist
(`hubspot_api_learning_plan.xlsx`): 70 steps over 14 study days of 2 to 3 hours each.

**Start here:** [docs/01-concepts.md](docs/01-concepts.md) → [docs/02-setup.md](docs/02-setup.md) → [docs/03-roadmap.md](docs/03-roadmap.md)

## Quick start

```bash
npm install                            # one time
git config core.hooksPath .githooks    # one time: blocks commits containing tokens
cp requests/.env.example requests/.env # then paste your token (docs/02-setup.md)

npm test             # offline checks (Swagger, sync, README), no token needed
npm run test:live    # real HubSpot calls for the lessons done so far
npm run docs         # Swagger UI at http://localhost:4000
```

## Lessons

| Day | Topic | Workbook rows | Requests | Live test | Notes | Status |
|---|---|---|---|---|---|---|
| 1 | Concepts and setup | 1 to 6 | [requests/01-setup.http](requests/01-setup.http) | [tests/live/day01-setup.test.js](tests/live/day01-setup.test.js) | [notes/day01.md](notes/day01.md) | Ready |
| 2 | Basic CRUD | 7 to 12 | [requests/02-crud.http](requests/02-crud.http) | [tests/live/day02-crud.test.js](tests/live/day02-crud.test.js) | [notes/day02.md](notes/day02.md) | Ready |
| 3 to 14 | Properties, values, search, batch, associations, labels, errors, mini project | 13 to 70 | added one day at a time | | | Planned in [docs/03-roadmap.md](docs/03-roadmap.md) |

"Ready" = files exist, offline tests pass. Track your own progress in the workbook.

## Daily loop

1. Read the day's section in [docs/03-roadmap.md](docs/03-roadmap.md) and the matching Swagger tag.
2. In the day's `.http` file: **guess** the status code, send, write guess and result in `notes/dayNN.md`.
3. Break one request on purpose and read the error.
4. `npm run test:live` to confirm, then update the workbook.
5. Commit: `git add -A && git commit -m "Day NN: <topic>"`.

## Project structure

| Path | What it is |
|---|---|
| [docs/01-concepts.md](docs/01-concepts.md) | Phase 0: vocabulary, property types, status codes |
| [docs/02-setup.md](docs/02-setup.md) | Phase 1: setup, with the important changes vs the TL sheet |
| [docs/03-roadmap.md](docs/03-roadmap.md) | All 70 steps by day, with endpoint and expected result |
| [docs/swagger.html](docs/swagger.html) | Swagger UI page (served by `npm run docs`) |
| [api/openapi.yaml](api/openapi.yaml) | OpenAPI 3 spec of every endpoint in the plan; `x-plan-steps` links to workbook rows |
| `requests/` | One REST Client `.http` file per day; `requests/.env` holds the token (git-ignored) |
| `notes/` | One markdown file per day: guesses, results, surprises |
| `tests/offline/` | Spec validity + sync checks (every request and roadmap endpoint is in Swagger, README lists every file) |
| `tests/live/` | One test file per day, real HubSpot calls; skipped when there is no token |
| `tests/lib/` | Shared HubSpot client and spec helpers |
| `scripts/test.js` | Test runner; saves every run to `test-results/` |
| `scripts/serve-docs.js` | Swagger UI server with a local proxy for "Try it out" |
| `test-results/` | Saved reports: `<timestamp>-<suite>.txt`, `latest-<suite>.txt`, `HISTORY.md` |
| `hubspot_api_learning_plan.xlsx` | The workbook: update Status, Status code I got, My notes |

## Tests

| Command | Runs | Needs token |
|---|---|---|
| `npm test` | `tests/offline/` | No |
| `npm run test:live` | `tests/live/` (Day 1 is read only; Day 2+ creates `hslearn+...@example.com` data and archives it) | Yes |
| `npm run test:all` | both | Yes, for the live part |

Every run is saved in `test-results/` and logged in `test-results/HISTORY.md`. Commit them with the day's work.

## Swagger

`npm run docs`, open http://localhost:4000. The docs server adds the token from
`requests/.env` automatically (clicking **Authorize** and pasting a token overrides it).
With no token in either place every call returns 401. Keep the
"Local proxy" server selected so **Try it out** works (HubSpot blocks direct browser calls).
The proxy only listens on localhost. Postman users can import `api/openapi.yaml` directly.

## Security rules

- The token lives only in `requests/.env`, which git ignores. In `.http` files always use `{{$dotenv HUBSPOT_TOKEN}}`, never the real value.
- `.githooks/pre-commit` blocks any commit containing a `.env` file or a `pat-...` token. After a fresh clone, turn it on once with `git config core.hooksPath .githooks`.
- Use only a Developer Test Account for practice, never a client portal.
- If a token is ever pushed or shared: rotate it immediately in the private app settings, then remove it from the repo.
- Keep this repository private.

## Changelog

| Date | Change |
|---|---|
| 2026-10-30 | Swagger docs server uses the token from `requests/.env` automatically |
| 2026-10-30 | Offline test: every API row of the workbook must be covered by Swagger `x-plan-steps` |
| 2026-10-30 | Added learning guide (concepts, setup changes, 14-day roadmap), OpenAPI spec + Swagger UI, test runner with saved reports, offline sync tests, Day 1 and Day 2 lessons with live tests |
| 2026-10-30 | Secret protection: stricter `.gitignore`, pre-commit token check |
| 2026-10-30 | Project created with Lesson 1 (setup) |

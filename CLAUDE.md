# CLAUDE.md

The user is learning the HubSpot CRM API from scratch, one day at a time, following
`docs/03-roadmap.md` (built from the TL workbook `hubspot_api_learning_plan.xlsx`).
Guide them: explain the why, let them send the requests and guess status codes themselves.
Don't run ahead of the day they are on.

## Rules for every change (the user asked for this explicitly)

When adding a day or changing anything, do ALL of these in the same change:

1. **Requests:** `requests/NN-<topic>.http` (REST Client format, `{{$dotenv HUBSPOT_TOKEN}}`, guess-the-code comments, workbook row numbers).
2. **Swagger:** every new endpoint goes in `api/openapi.yaml` with `operationId`, `summary`, a tag, responses, examples, and `x-plan-steps` (workbook rows).
3. **Tests:** `tests/live/dayNN-<topic>.test.js` asserting the "What to expect" column; use `tests/lib/hubspot.js`, `skip: skipLive`, `testEmail()`, and clean up created data in `t.after`.
4. **Notes:** `notes/dayNN.md` template (guess / actual table, break-it, checkpoint).
5. **README:** add the lesson row, update structure table if new folders, add a Changelog line (newest first).
6. **Run `npm test`** (offline). It fails if Swagger, roadmap, requests, live tests and README are out of sync. Fix until green. Run `npm run test:live` only when the user agrees, since it writes to their HubSpot test account.
7. Commit `test-results/` together with the change.

## Conventions

- Test data: emails `hslearn+dNN-...@example.com`, last names contain `HSLearn`, companies start with `HSLearn `, custom properties prefixed `hsl_` (except `joining_date`, which the workbook names).
- Node 22, ESM, built-in `node:test`; the only dependency is `yaml`.
- Never read, print or commit `requests/.env`. Never put a `pat-...` token in any file.
- No em dashes in docs or responses (organization rule).

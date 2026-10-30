# Phase 1: Setup (Day 1), with the important changes

The TL sheet says "create a private app and copy the token". That works, but a few
details cause trouble later (step 51+ fails, a token has to be recreated, test data is
hard to clean up). This page is the setup that avoids those problems.

## What changed compared to the sheet, and why

| # | Change | Why it matters |
|---|---|---|
| 1 | **Create the private app inside the Developer Test Account**, not inside the developer account itself | A developer account has no CRM data. A token made there cannot create contacts. The test account has Enterprise features, which you need for association labels (steps 55 to 66). |
| 2 | **Add all 8 scopes now**, not only contacts | Steps 13 to 22 (custom properties) need `crm.schemas.*`, steps 45+ need companies. Adding scopes later means updating the app and sometimes copying a new token. |
| 3 | Use a **service key** if the account says "Legacy apps aren't available" | HubSpot replaced private apps (later called "Legacy apps") with service keys. For this course a service key works the same way: a token with scopes, sent as `Authorization: Bearer <key>`. |
| 4 | Use the **VS Code REST Client** extension as the main tool; Postman is optional | Requests live as `.http` files in this git repo, so your whole learning history is versioned. Postman can still import `api/openapi.yaml` if you prefer it. |
| 5 | Token goes **only** in `requests/.env` | Git ignores it, and the pre-commit hook blocks any `pat-...` token. |
| 6 | **Name all test data with a marker** | Makes step 69 (cleanup) one search instead of hunting records by hand. See "Test data naming" below. |
| 7 | Keep the test account active | Developer test accounts can expire after a long period without API calls (HubSpot has used 90 days). If you pause the course, send one request now and then. |

## Step by step

### 3. Developer account and Developer Test Account (UI)
1. Go to https://developers.hubspot.com and create a free developer account.
2. Open **Development > Testing > Test Accounts** and click **Create developer test account**.
3. Click the new account's name to open it. Check the URL now contains the **test account's** ID
   (shown under its name in the list), not your main account's ID. Write the Hub ID in `notes/day01.md`.

### 4. Tooling
1. Install VS Code extension **REST Client** (publisher: Huachao Mao).
2. Install Node.js 22+ (you have it if `node -v` prints v22 or higher), then run once in this folder:
   ```bash
   npm install
   git config core.hooksPath .githooks   # turns on the token-blocking hook
   ```
3. Optional: Postman. Create an environment with `base_url = https://api.hubapi.com` and `token = <your token>`, or import `api/openapi.yaml` as a collection.

### 5. Service key or private app (inside the TEST account)

First make sure you are in the test account: the top right shows the test account
name, and there is no "Upgrade to Starter" button (a test account has Enterprise features).
Never create the key in your company's real portal.

1. In the test account: **Development > Legacy Apps**.
   - If it says "Legacy apps aren't available on this account": click **Create a service key** (current HubSpot).
   - Otherwise: **Create legacy app** (older accounts; also under Settings > Integrations > Private apps).
2. Name it `hs-learning`.
3. Add all of these scopes:

   | Scope | Needed for |
   |---|---|
   | `crm.objects.contacts.read` / `.write` | Steps 6 to 12, 23 to 43 |
   | `crm.objects.companies.read` / `.write` | Steps 45 to 70 |
   | `crm.schemas.contacts.read` / `.write` | Custom properties (13 to 22), association labels |
   | `crm.schemas.companies.read` / `.write` | Company properties, association labels |

4. Create it and copy the key / access token (for a legacy app: the **Auth** tab).
5. Create `requests/.env` (copy `requests/.env.example`; never edit `.env.example` itself, git tracks it) and paste:
   ```
   HUBSPOT_TOKEN=pat-na1-xxxxxxxx-xxxx-...
   ```

### 6. Check the token works
Open `requests/01-setup.http` and click **Send Request** above each block. Then run:
```bash
npm run test:live
```
Day 1 tests check the token, the account, and that every scope group works.

## Test data naming (use this in every lesson)

| Data | Pattern | Cleanup query (step 69) |
|---|---|---|
| Contact email | `hslearn+dNN-<anything>@example.com` (NN = day number) | search `hs_email_domain` EQ `example.com` |
| Contact last name | include `HSLearn`, e.g. `Tester HSLearn` | search `lastname` CONTAINS_TOKEN `HSLearn` |
| Company name | start with `HSLearn `, e.g. `HSLearn Acme` | search `name` CONTAINS_TOKEN `HSLearn` |
| Company domain | `<name>-hslearn.example.com` | covered by the company name search |
| Custom property | prefix `hsl_`, e.g. `hsl_favorite_color` | list properties, delete names starting `hsl_` |

The live tests follow the same pattern, so their leftovers are easy to find too
(they also clean up after themselves).

## Security rules (repeat from README)
- Never paste the token into a `.http`, `.md`, or `.js` file. Use `{{$dotenv HUBSPOT_TOKEN}}`.
- Only practice in the Developer Test Account, never a client portal.
- If the token leaks: rotate it in the private app's Auth tab immediately.

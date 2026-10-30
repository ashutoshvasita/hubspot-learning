# HubSpot API learning

Following the TL checklist, one lesson at a time.

| Folder / file | What goes there |
|---|---|
| `hubspot_api_learning_plan.xlsx` | The checklist; update Status and notes after each step |
| `requests/` | One `.http` file per lesson, run with the VS Code REST Client extension |
| `requests/.env` | Your token (copy from `.env.example`). Never share it |
| `notes/` | One markdown file per day: answers, status codes, surprises |
| `scripts/` | Small Node scripts later (step 63 rate limit, mini project) |

## Security rules

- The token lives only in `requests/.env`, which git ignores. In `.http` files always use `{{$dotenv HUBSPOT_TOKEN}}`, never the real value.
- `.githooks/pre-commit` blocks any commit containing a `.env` file or a `pat-...` token. After a fresh clone, turn it on once with `git config core.hooksPath .githooks`.
- Use only a Developer Test Account for practice, never a client portal.
- If a token is ever pushed or shared: rotate it immediately in the private app settings, then remove it from the repo.
- Keep this repository private.

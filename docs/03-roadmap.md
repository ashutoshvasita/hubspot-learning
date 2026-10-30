# The optimized roadmap (14 days, 70 steps)

`#` is the row in the workbook checklist. `TL` is the step number in the original TL sheet
("New" = added in this plan). Every endpoint below is documented in
[`api/openapi.yaml`](../api/openapi.yaml) (open it with `npm run docs`).

All requests: base URL `https://api.hubapi.com`, header `Authorization: Bearer <token>`,
and `Content-Type: application/json` when there is a body.

## How to study one day (2 to 3 hours, no rush)

Each day follows the same loop. Doing it the same way every time is what makes it fast.

| Time | What you do |
|---|---|
| 10 min | Re-read yesterday's `notes/dayNN.md`. Explain yesterday's main idea out loud in 2 sentences. |
| 15 min | Read today's section below and the matching tag in Swagger (`npm run docs`). |
| 60 to 90 min | Open `requests/NN-*.http`. For **each** request: write your guessed status code in the notes, send it, write the real code, look at the record in the HubSpot UI. |
| 15 min | Break something on purpose (wrong id, wrong property name, missing field). Read the error message. |
| 15 min | Run `npm run test:live`. The day's tests repeat what you did by hand. If one fails, find out why before moving on. |
| 10 min | Update the workbook (Status, Status code I got, My notes), commit: `git add -A && git commit -m "Day NN: <topic>"`. |

Rules that keep it "no rush but fast":
- **Don't skip the guess.** A wrong guess is the lesson. A right guess means you can move faster.
- **One day = one topic.** If you finish early, do the "Stretch" line, not the next day.
- **Stuck more than 20 minutes?** Mark the step "Stuck" in the workbook, write the exact error in notes, move on, come back next session (or ask your TL).
- **Checkpoint** at the end of each day: if you can't answer it, repeat the day's requests tomorrow before going on.

---

## Week 1: one record at a time

### Day 1: Concepts and setup
Read [`01-concepts.md`](01-concepts.md) and [`02-setup.md`](02-setup.md) first.
Files: `requests/01-setup.http`, `notes/day01.md`, `tests/live/day01-setup.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 1 | New | Learn the vocabulary | (docs) | You can explain each term in the concepts table |
| 2 | New | UI tour: create 1 contact and 1 company by hand, link them, open Settings > Properties | (UI) | You know what a record, property and association look like before the API |
| 3 | New | Developer account + Developer Test Account | (UI) developers.hubspot.com | Test account opens; note its Hub ID |
| 4 | New | Install REST Client (or Postman), `npm install` | (tool) | `requests/.env` holds the token |
| 5 | 1 | Service key (or legacy private app) with all 8 scopes, **inside the test account** | (UI) Development > Legacy Apps > Create a service key | Key copied into `requests/.env` |
| 6 | 2 | Check the token works | `GET /crm/v3/objects/contacts?limit=1` | 200 OK; 401 = bad token; 403 = missing scope |
|  |  | Extra: who am I | `GET /account-info/v3/details` | `portalId` = your Hub ID |
|  |  | Extra: scope check | `GET /crm/v3/objects/companies?limit=1`, `GET /crm/v3/properties/contacts/groups` | 200 each; 403 means a scope is missing |

Checkpoint: what do 401 and 403 mean, and how would you fix each?

### Day 2: Basic CRUD on contacts
Files: `requests/02-crud.http`, `notes/day02.md`, `tests/live/day02-crud.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 7 | 3 | Create one contact (`hslearn+d02-1@example.com`) | `POST /crm/v3/objects/contacts` | 201; body `{"properties":{"email":"..."}}`; **save the returned id** |
| 8 | 4 | Read by id, ask for specific properties | `GET /crm/v3/objects/contacts/{id}?properties=email,firstname,phone` | 200; only the properties you asked for (plus a few defaults) come back |
| 9 | 5 | Read by email | `GET /crm/v3/objects/contacts/{email}?idProperty=email` | 200; `idProperty` lets you use email instead of the id |
| 10 | 6 | Update the contact | `PATCH /crm/v3/objects/contacts/{id}` | 200; only the fields you send change |
| 11 | 7 | Create the same email again | `POST /crm/v3/objects/contacts` | **409 Conflict**; message contains `Existing ID: <id>` |
| 12 | 8 | Archive the contact | `DELETE /crm/v3/objects/contacts/{id}` | 204 No Content; record sits in recycle bin 90 days; a read now gives 404 |

Stretch: read it with `?archived=true` on the list endpoint. Checkpoint: why does step 11 return 409 and not 400?

### Day 3: Custom properties (part 1)
Files: `requests/03-properties.http`, `notes/day03.md`, `tests/live/day03-properties.test.js`
Name every property with the `hsl_` prefix, group `contactinformation`.

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 13 | 9 | List property groups and contact properties | `GET /crm/v3/properties/contacts/groups`, `GET /crm/v3/properties/contacts` | 200; note internal `name`, `groupName`, `type`, `fieldType` |
| 14 | 10 | Single line text property | `POST /crm/v3/properties/contacts` | 201; `type: string`, `fieldType: text`, plus `name`, `label`, `groupName` |
| 15 | 11 | Number property | `POST /crm/v3/properties/contacts` | 201; `type: number`, `fieldType: number` |
| 16 | 12 | Dropdown select with options | `POST /crm/v3/properties/contacts` | 201; `type: enumeration`, `fieldType: select`, `options: [{label, value, displayOrder}]` |
| 17 | 13 | Multiple checkboxes with options | `POST /crm/v3/properties/contacts` | 201; `type: enumeration`, `fieldType: checkbox` |

Checkpoint: what is the difference between an option's `label` and `value`? Which one does the API store?

### Day 4: Custom properties (part 2)
Files: `requests/04-properties.http`, `notes/day04.md`, `tests/live/day04-properties.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 18 | 14 | Single checkbox property | `POST /crm/v3/properties/contacts` | 201; `type: bool`, `fieldType: booleancheckbox`, options true/false |
| 19 | 15 | Date picker named `joining_date` (step 35 uses it) | `POST /crm/v3/properties/contacts` | 201; `type: date`, `fieldType: date` |
| 20 | 16 | Date and time property | `POST /crm/v3/properties/contacts` | 201; `type: datetime`, `fieldType: date` |
| 21 | 17 | Unique value text property | `POST /crm/v3/properties/contacts` | 201; `type: string`, `fieldType: text`, `"hasUniqueValue": true` |
| 22 | 18 | Add a new option to the dropdown | `PATCH /crm/v3/properties/contacts/{propertyName}` | 200; send the **full** options list; options you leave out are removed |

Stretch: send a duplicate value into the unique property (Day 5) and read the error. Checkpoint: why does PATCH on options need the full list?

### Day 5: Setting values by property type
Files: `requests/05-values.http`, `notes/day05.md`, `tests/live/day05-values.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 23 | 19 | Contact with text and number values | `POST /crm/v3/objects/contacts` | 201; numbers can be sent as `"42"` or `42`; they always come back as strings |
| 24 | 20 | Set a dropdown value | `POST /crm/v3/objects/contacts` | 201; send the option **value**, not the label |
| 25 | 21 | Set multiple checkbox values | `POST /crm/v3/objects/contacts` | 201; semicolon separated: `"a;b;c"` |
| 26 | 22 | Set a single checkbox value | `POST /crm/v3/objects/contacts` | 201; `"true"` or `"false"` |
| 27 | 23 | Set date and datetime values | `POST /crm/v3/objects/contacts` | 201; date `"2026-10-30"` (midnight UTC), datetime `"2026-10-30T10:30:00Z"` or ms timestamp |
| 28 | 24 | Dropdown value not in the options | `POST /crm/v3/objects/contacts` | **400**; error names the invalid option |
| 29 | 25 | Clear a property value | `PATCH /crm/v3/objects/contacts/{id}` | 200; send `"propertyname": ""` |

Checkpoint: write from memory the value format for each of the 7 property types.

### Day 6: Search (part 1)
Files: `requests/06-search.http`, `notes/day06.md`, `tests/live/day06-search.test.js`
Search has its own, lower rate limit (about 5 requests per second) and is **eventually consistent**: a record created a few seconds ago may not be found yet.

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 30 | 26 | Search a contact by email | `POST /crm/v3/objects/contacts/search` | 200; `filterGroups: [{filters: [{propertyName, operator: "EQ", value}]}]` |
| 31 | 27 | Search by partial last name | `POST /crm/v3/objects/contacts/search` | operator `CONTAINS_TOKEN` (whole words; `*` wildcard allowed) |
| 32 | 28 | Search several emails at once | `POST /crm/v3/objects/contacts/search` | operator `IN` with `values: [..]` (lowercase strings) |
| 33 | 29 | Search with AND and OR | `POST /crm/v3/objects/contacts/search` | filters **inside one group = AND**; **separate groups = OR** (max 5 groups, 6 filters per group, 18 total) |

Checkpoint: draw the JSON for "(lastname = A AND city = B) OR email = C".

### Day 7: Search (part 2)
Files: `requests/07-search.http`, `notes/day07.md`, `tests/live/day07-search.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 34 | 30 | Search a multiple checkbox property | `POST /crm/v3/objects/contacts/search` | `IN` or `CONTAINS_TOKEN` |
| 35 | 31 | Contacts with `joining_date` after a day | `POST /crm/v3/objects/contacts/search` | `GT` on `joining_date` (value as date string or ms timestamp) |
| 36 | 32 | Sort and page the results | `POST /crm/v3/objects/contacts/search` | `sorts: [{propertyName, direction}]`, `limit` (max 200), next page with `after` from `paging.next.after`; 10,000 results cap |
| 37 | 33 | Search before create: create only when total is 0 | `POST /crm/v3/objects/contacts/search` then `POST /crm/v3/objects/contacts` | Works, but because search is eventually consistent, a just-created record may be missed. That's why upsert (Day 8) exists |

Checkpoint: why is "search then create" not safe for duplicates?

---

## Week 2: many records, links between them, real-world handling

### Day 8: Batch
Files: `requests/08-batch.http`, `notes/day08.md`, `tests/live/day08-batch.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 38 | 34 | Batch create 10 contacts | `POST /crm/v3/objects/contacts/batch/create` | 201; `{"inputs":[{"properties":{..}}]}` |
| 39 | 35 | Batch read by id | `POST /crm/v3/objects/contacts/batch/read` | 200; `{"inputs":[{"id":".."}],"properties":[..]}` |
| 40 | 36 | Batch read by email | `POST /crm/v3/objects/contacts/batch/read` | add `"idProperty":"email"`; ids are now emails |
| 41 | 37 | Batch update | `POST /crm/v3/objects/contacts/batch/update` | 200; `{"inputs":[{"id":"..","properties":{..}}]}` |
| 42 | 38 | Batch upsert | `POST /crm/v3/objects/contacts/batch/upsert` | 200; `"idProperty":"email"` on each input; creates new, updates existing; result has `new: true/false` |
| 43 | 39 | Send 101 inputs in one call | `POST /crm/v3/objects/contacts/batch/create` | **400**; batch limit is 100 inputs |

Checkpoint: you have 250 contacts to update. How many calls, and what happens to the 429 limit?

### Day 9: Associations (part 1)
Files: `requests/09-associations.http`, `notes/day09.md`, `tests/live/day09-associations.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 44 | 40 | Read the association concept | (docs) Associations v4 | Know: 279 contact→company, 280 company→contact, 1 primary company |
| 45 | 41 | Create a contact and a company, no association | `POST /crm/v3/objects/contacts`, `POST /crm/v3/objects/companies` | 201 each; save both ids |
| 46 | 42 | Read all association types and labels contacts↔companies | `GET /crm/v4/associations/contacts/companies/labels` | 200; each has `category` (`HUBSPOT_DEFINED`), `typeId`, `label` |
| 47 | 43 | Associate them with the default association | `PUT /crm/v4/objects/contacts/{contactId}/associations/default/companies/{companyId}` | 200; no body needed |
| 48 | 44 | Fetch the associations of the contact | `GET /crm/v4/objects/contacts/{id}/associations/companies` | 200; `toObjectId` + `associationTypes` |

Checkpoint: why does the same link show type 279 from one side and 280 from the other?

### Day 10: Associations (part 2) and create with association
Files: `requests/10-associations.http`, `notes/day10.md`, `tests/live/day10-associations.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 49 | 45 | Fetch from the company side | `GET /crm/v4/objects/companies/{id}/associations/contacts` | 200; type id is 280 from this direction |
| 50 | 46 | Read a contact with the associations parameter | `GET /crm/v3/objects/contacts/{id}?associations=companies` | 200; `associations` block in the response |
| 51 | 47 | Remove all associations between two records | `DELETE /crm/v4/objects/contacts/{id}/associations/companies/{companyId}` | 204 |
| 52 | 48 | Create a contact with a company association in one call | `POST /crm/v3/objects/contacts` | 201; `"associations":[{"to":{"id":".."},"types":[{"associationCategory":"HUBSPOT_DEFINED","associationTypeId":279}]}]` |
| 53 | 49 | Batch create contacts with associations | `POST /crm/v3/objects/contacts/batch/create` | same `associations` array inside each input |
| 54 | 50 | Batch associate existing records | `POST /crm/v4/associations/contacts/companies/batch/associate/default` | `{"inputs":[{"from":{"id":".."},"to":{"id":".."}}]}` |

Checkpoint: when would you create with association in one call vs associate later?

### Day 11: Association labels (part 1)
Needs Professional/Enterprise, so the Developer Test Account.
Files: `requests/11-labels.http`, `notes/day11.md`, `tests/live/day11-labels.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 55 | 51 | Learn what a label is: the role of the link | (docs) Associations v4 > labels | e.g. "Decision Maker", "Billing Contact"; category `USER_DEFINED` |
| 56 | 52 | Create a custom label contacts→companies | `POST /crm/v4/associations/contacts/companies/labels` | 200; `{"label":"Decision Maker","name":"decision_maker"}`; **save the typeId** |
| 57 | 53 | Create a second custom label | `POST /crm/v4/associations/contacts/companies/labels` | save the second typeId |
| 58 | 54 | Associate a contact and company with one label | `PUT /crm/v4/objects/contacts/{id}/associations/companies/{companyId}` | 200; body `[{"associationCategory":"USER_DEFINED","associationTypeId":X}]` |
| 59 | 55 | Put multiple labels on one association | `PUT /crm/v4/objects/contacts/{id}/associations/companies/{companyId}` | several objects in the array |
| 60 | 56 | Fetch the association and read all its labels | `GET /crm/v4/objects/contacts/{id}/associations/companies` | read `associationTypes[].label` |

Checkpoint: one contact, one company, two labels. How many associations exist? (Answer: one link, several types.)

### Day 12: Association labels (part 2)
Files: `requests/12-labels.http`, `notes/day12.md`, `tests/live/day12-labels.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 61 | 57 | Batch associate with labels | `POST /crm/v4/associations/contacts/companies/batch/create` | inputs with `from`, `to`, `types` |
| 62 | 58 | Batch read associations for many contacts | `POST /crm/v4/associations/contacts/companies/batch/read` | `{"inputs":[{"id":".."}]}` |
| 63 | 59 | Remove only one label, keep the association | `POST /crm/v4/associations/contacts/companies/batch/labels/archive` | 204; other labels and the link stay |
| 64 | 60 | Search contacts linked to a company | `POST /crm/v3/objects/contacts/search` | `propertyName: "associations.company"`, `operator: "EQ"`, `value: companyId` |
| 65 | 61 | Update a label name | `PUT /crm/v4/associations/contacts/companies/labels` | 204; `{"associationTypeId":X,"label":"New name"}` |
| 66 | 62 | Delete a custom label | `DELETE /crm/v4/associations/contacts/companies/labels/{associationTypeId}` | 204 |

Checkpoint: what is the difference between `batch/labels/archive` and `batch/archive`?

### Day 13: Errors and limits (first Node script)
Files: `scripts/day13-rate-limit.js`, `requests/13-errors.http`, `notes/day13.md`, `tests/live/day13-errors.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 67 | 63 | Handle a 429 with a retry after `Retry-After` seconds | any endpoint in a loop (Node script) | `Retry-After` is not always sent: fall back to waiting 1, 2, 4 s (exponential backoff). Log `X-HubSpot-RateLimit-Remaining` |
| 68 | 64 | Read the per item errors in a batch response | `POST /crm/v3/objects/contacts/batch/read` | mix real and fake ids: **207 Multi-Status** with `results` and `errors` arrays |

Checkpoint: why should a script never retry a 400, but always retry a 429?

### Day 14: Cleanup and mini project
Files: `scripts/cleanup.js`, `scripts/mini-project.js`, `data/people.csv`, `notes/day14.md`, `tests/live/day14-mini-project.test.js`

| # | TL | Task | Method and endpoint | What to expect |
|---|---|---|---|---|
| 69 | 65 | Archive all practice contacts and companies | `POST /crm/v3/objects/contacts/search` then `POST /crm/v3/objects/contacts/batch/archive`, `POST /crm/v3/objects/companies/batch/archive` | Search with the naming markers from `02-setup.md`, archive in chunks of 100 (204) |
| 70 | New | Mini project: read a CSV of 20 people and companies, upsert contacts by email, upsert companies by domain, associate with a label, handle 429, print batch errors | combines steps 38 to 42, 56, 61, 67, 68 | Demo this to your TL |

Mini project note: contacts upsert by `email` works out of the box. Companies batch upsert needs
a **unique** `idProperty`, and the default `domain` property may be rejected as not unique.
If you get a 400, either search companies by domain first and then create/update, or make a
custom company property with `hasUniqueValue: true` and upsert on that. Finding this out is
part of the exercise.

---

## When you are done
- Workbook Progress tab shows 70/70.
- `npm run test:all` is green.
- You can explain every row of [`01-concepts.md`](01-concepts.md) and every tag in Swagger.

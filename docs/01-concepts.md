# Phase 0: Concepts (Day 1, 1 to 2 hours, no code)

## What HubSpot is, in one paragraph

HubSpot is a CRM (Customer Relationship Management) system, which is basically a
database of customers: people (contacts), the businesses they work for (companies),
the sales you are trying to close (deals), and so on. Normally people click around
the HubSpot website to manage that data. In this course you work with the **same
database through the HubSpot REST API**: you send HTTP requests (GET, POST, PATCH,
PUT, DELETE) to `https://api.hubapi.com` and get JSON back. Anything you do through
the API shows up in the website, and the other way round. That is the best way to
check your work: send a request, then look at the record in the UI.

## The mental model

```
Portal (your HubSpot account, has a Hub ID such as 12345678)
│
├── Object "contacts"      ← like a database TABLE
│     ├── Property: email, firstname, phone, joining_date ...   ← COLUMNS
│     └── Record id 101 { email: "john@acme.com", firstname: "John" }  ← a ROW
│
├── Object "companies"
│     └── Record id 900 { name: "Acme Inc", domain: "acme.com" }
│
└── Association: contact 101 ──(type 279, label "Decision Maker")──▶ company 900
                 a LINK between two records, of a certain kind, optionally with a role name
```

## Vocabulary

Learn these before you send a single request. The API errors will make sense much faster.

| Term | Meaning | Example |
|---|---|---|
| Portal / Account | Your HubSpot workspace; has an ID called **Hub ID** (also "portalId") | `12345678` |
| Object | A type of data, like a table | `contacts`, `companies`, `deals` |
| Record | One row of an object; has a numeric `id` | The contact John Smith, id `101` |
| Property | A field / column on an object | `email`, `firstname`, `phone` |
| Internal name vs label | The API always uses the **internal name**; the UI shows the **label** | `firstname` vs "First Name" |
| Property `type` / `fieldType` | `type` = how the value is stored; `fieldType` = how it shows in the UI | `enumeration` + `select` = dropdown |
| Association | A link between two records | John works at Acme Inc |
| Association type id | Number identifying the kind of link, **per direction** | `279` contact→company, `280` company→contact, `1` primary company |
| Association category | Who defined the type | `HUBSPOT_DEFINED` or `USER_DEFINED` |
| Association label | The role of the link (paid tiers, so use the Developer Test Account) | "Decision Maker", "Billing Contact" |
| Archive | HubSpot's word for delete; the record sits in the recycle bin for 90 days | `DELETE /crm/v3/objects/contacts/{id}` |
| Private app token | Secret key sent as `Authorization: Bearer <token>`; scopes control what it can do | `pat-na1-...` |
| Scope | One permission given to the token | `crm.objects.contacts.write` |
| Batch | One call acting on up to **100** records | `/batch/create`, `/batch/upsert` |
| Upsert | "Update if it exists, insert if it doesn't", matched by a unique property | upsert contacts by `email` |
| Rate limit (429) | Too many requests; wait and retry | About 100 to 190 requests per 10 s for private apps; search about 5 per second |
| Docs | Official API reference | https://developers.hubspot.com/docs/api-reference |

## Property types you will meet (Phase 3 and 4)

| What you see in the UI | `type` | `fieldType` | How you send the value |
|---|---|---|---|
| Single-line text | `string` | `text` | `"hello"` |
| Number | `number` | `number` | `"42"` or `42` |
| Dropdown select | `enumeration` | `select` | the option **value** (internal), not its label |
| Multiple checkboxes | `enumeration` | `checkbox` | semicolon separated: `"a;b;c"` |
| Single checkbox | `bool` | `booleancheckbox` | `"true"` / `"false"` |
| Date picker | `date` | `date` | `"2026-10-30"` (stored as midnight UTC) |
| Date and time | `datetime` | `date` | `"2026-10-30T10:30:00Z"` or a ms timestamp |

## HTTP status codes you will see

Guess the code before every request, then compare. This habit is the fastest way to learn the API.

| Code | Meaning in HubSpot | When you will see it |
|---|---|---|
| 200 OK | Worked, body has data | Reads, updates, searches |
| 201 Created | Record created | POST create |
| 204 No Content | Worked, no body | Archive, remove association |
| 207 Multi-Status | Batch partly worked; check `errors` | Batch with some bad ids |
| 400 Bad Request | Your body is wrong (bad property, bad option, over 100 inputs) | Typos, invalid values |
| 401 Unauthorized | Token missing or wrong | Copy/paste mistakes |
| 403 Forbidden | Token valid but missing a **scope** | Forgot a scope in the private app |
| 404 Not Found | Wrong id or wrong path | Archived record, typo in URL |
| 409 Conflict | Already exists (e.g. same email) | Creating a duplicate contact |
| 429 Too Many Requests | Rate limited; wait, then retry | Loops without delays |

## Self check (answer in `notes/day01.md`, Part A)

You are done with Phase 0 when you can answer these without looking:

1. What is the difference between an object and a record?
2. Why does the API reject `"First Name"` but accept `"firstname"`?
3. A contact is linked to a company. Is that a property or an association?
4. What is the difference between association type id 279 and 280?
5. You archived a contact by mistake. Is it gone forever?
6. You get 403 but your token is correct. What is the likely cause?

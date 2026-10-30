# Day 2 notes: Basic CRUD

Copy the codes into the workbook ("Status code I got") when done.

| Row | Request | Guessed code | Actual code | What I noticed |
|---|---|---|---|---|
| 7 | Create contact | | | Contact id: |
| 8 | Read by id with properties | | | |
| 9 | Read by email | | | |
| 10 | Update | | | |
| 11 | Create same email again | | | Where was the existing id? |
| 12 | Archive | | | |
| - | Read after archive | | | |

## Break it on purpose
- Wrong property name in create (e.g. `"first_name"`): code ___, message:
- Read a made-up id (e.g. `/contacts/1`): code ___

## Checkpoint
- Why does row 11 return 409 and not 400?
- What does "archive" really do, and for how long can you get the record back?

## One thing I learned today

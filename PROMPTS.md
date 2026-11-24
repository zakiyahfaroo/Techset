# What I asked the AI

Keep a short log. One entry per prompt is enough.

| What I asked (paste or summarize) | What happened | What I had to fix or check |
| --- | --- | --- |
| Pasted the assignment and asked Claude Code to make my Techset repo into a data/AI app that would stand out on a resume and fit current times. | It proposed Techset, a skills-demand analyzer for data & AI jobs, and wrote `db/schema.sql` (5 tables with primary and foreign keys), `db/load.js` (96 made-up postings at fictional companies), `db/queries.sql`, `server/server.js` (4 API routes), and `web/index.html`. | Checked that every user input reaches SQL as a parameter (role, city, and the skill list through `STRING_SPLIT(@have, ',')`), and that `.env` is in `.gitignore`. |
| | | |
| | | |

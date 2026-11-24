# What I asked the AI

Keep a short log. One entry per prompt is enough.

| What I asked (paste or summarize) | What happened | What I had to fix or check |
| --- | --- | --- |
| Pasted the assignment and asked Claude Code to make my Techset repo into a data/AI app that would stand out on a resume and fit current times. | It proposed Techset, a skills-demand analyzer for data & AI jobs, and wrote `db/schema.sql` (5 tables with primary and foreign keys), `db/load.js` (96 made-up postings at fictional companies), `db/queries.sql`, `server/server.js` (4 API routes), and `web/index.html`. | Checked that every user input reaches SQL as a parameter (role, city, and the skill list through `STRING_SPLIT(@have, ',')`), and that `.env` is in `.gitignore`. |
| Asked Claude Code to connect to my database, load the data, and test the app. | First it failed with "Login failed": I had created `.env` on the GitHub website instead of on my laptop, which made the password public. Claude removed those commits from GitHub, I saved the password in my local `.env`, and then `npm run check` printed "OK: connected ... database zfaroo_myapp". `node db/load.js` loaded 144 postings and 895 posting-skill links. | Learned that `.env` must only exist on my laptop. Salaries looked too high, so we lowered the base pay and went from 16 to 24 postings per role so the GenAI premium was more stable. Tested the page's role, skills, and matches, and typed `' OR 1=1 --` into the inputs: no extra rows, because the inputs are parameters. Kept salary ranges on one line. |

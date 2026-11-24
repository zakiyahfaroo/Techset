# Step 4. Build your app from a user story (45 minutes)

Write one user story in [IDEA.md](../IDEA.md), a question your app helps someone answer:

> **As a** ___ (who), **I need to** ___ (what), **so that** ___ (why).

For example: *As a student in a band, I need to see which songs I've practiced least this month, so that I spend practice time where it matters.*

## 4a. See it (15 minutes)

> Read AGENTS.md and IDEA.md. Write web/index.html, a simple, good-looking page for my user story with an input for what the user picks or types and a results table filled with 3 made-up rows for now. Write server/server.js, an Express server that serves the web/ folder. No database yet.

Run `npm start` and open <http://localhost:3000>. Ask for changes until it looks like your idea.

## 4b. Make it real (30 minutes)

> Read AGENTS.md, IDEA.md, server/server.js, and web/index.html. Design tables for my user story with primary and foreign keys and write db/schema.sql. Write db/load.js to create the tables in my database and fill them with about 20 realistic made-up rows per table. Write db/queries.sql with the query that answers my story, using a parameter for what the user picks or types. Add an /api route to server/server.js that runs that query, and change web/index.html to show the real rows instead of the made-up ones. Then tell me exactly how to run it.

(For real data instead of made-up rows, add CSV links from [DATASETS.md](../DATASETS.md) to the prompt.)

Run `node db/load.js`, restart the server (Ctrl+C, then `npm start`), and reload. When something is wrong, tell the AI exactly what you saw. Then check it yourself:

- **Is it right?** Run your query from `db/queries.sql` in VS Code with one value and compare with the page.
- **Is it safe?** Type `' OR 1=1 --` into your input. You should get no rows or a clean error, not every row.
- **No secrets in git?** `.env` must not appear in Source Control.

Log what you asked in [PROMPTS.md](../PROMPTS.md), then commit and push (Source Control: message, **Commit**, **Sync Changes**). Then keep going: a second question, a better design, a new table. Commit each time.

**Turn in (1 point):** a screenshot of your page answering your user story with rows from your database.
**Turn in (1 point):** the link to your GitHub repository, with IDEA.md and PROMPTS.md filled in and no `.env`.

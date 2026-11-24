# Step 3. Set up your laptop environment (15 minutes)

Give the AI this prompt (Copilot Chat, Agent mode):

> Read AGENTS.md and README.md, then get my laptop ready for this project, one step at a time, explaining each step: check that Node.js 20 or newer is installed (if not, tell me exactly how to install it on my operating system), run npm install, create .env from .env.example (ask me for the password, and set DB_NAME to [my NetID]_myapp), run npm run create-db, then run npm run check. If anything fails, help me fix it.

This part is the same for everyone, but laptops differ. If something fails, paste the exact error into the chat and work through it with the AI.

**Turn in (1 point):** a screenshot of `npm run check` printing **OK: connected ... database <your NetID>_myapp**.

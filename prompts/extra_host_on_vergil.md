# Extra: host your app permanently on UW's servers (not yet tested with a student account)

Your laptop app stops when you close the laptop, and only you can see it. UW gives every student free web hosting on **vergil**, with a public address: `https://students.washington.edu/<your NetID>/`.

Two things are different there, and the AI can handle both:
- vergil cannot reach the class SQL Server, so your data moves into **your own MySQL server** on vergil (UW provides an installer).
- vergil runs **PHP** for the middle tier, not Node, so the AI rewrites `server/server.js` as `api.php`. Your page and your SQL mostly stay the same.

1. **Turn on hosting (once):** go to <https://uwnetid.washington.edu/manage/>, click **Computing Services**, check **Vergil Account** and **Student Web Publishing**, and click **Subscribe**. It is off by default and may take a while to activate.
2. **Log in:** `ssh <your NetID>@vergil.u.washington.edu` from the VS Code terminal.
3. **Ask the AI:**

> Read AGENTS.md. I want to host this app permanently on UW Shared Web Hosting (vergil). There, the web server runs PHP 7.4 per request (no Node), the public folder is ~/public_html (served at https://students.washington.edu/<netid>/), and I can create my own MySQL 5.7 server with /usr/local/bin/mysql-local-setup (the web server connects to it over TCP at the host and port it prints). Walk me through it one command at a time: set up MySQL and a read-only app user; convert db/schema.sql and db/load.js to MySQL (no CTEs or window functions in 5.7); rewrite my /api route as public_html/myapp/api.php using PDO prepared statements, reading the login from public_html/myapp/data/db.php, which must be blocked from the web with an .htaccess "Deny from all" and never committed to git; and copy web/index.html there, calling api.php. Make MySQL restart on reboot with cron.

**Check:** your app works at `https://students.washington.edu/<your NetID>/myapp/` from your phone, off the UW network, and `.../myapp/data/db.php` returns **Forbidden**.

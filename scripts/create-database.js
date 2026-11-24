// Creates your own database on the class server, named in DB_NAME in .env (for example jdoe_myapp).
// Run with: npm run create-db
require('dotenv').config();
const sql = require('mssql');

const name = process.env.DB_NAME || '';
if (!/^[A-Za-z][A-Za-z0-9_]*_myapp$/.test(name)) {
  console.log(`DB_NAME in .env is "${name}". Set it to <your NetID>_myapp (letters, digits, underscores), for example jdoe_myapp.`);
  process.exit(1);
}

(async () => {
  try {
    const pool = await sql.connect({
      server: process.env.DB_SERVER,
      port: Number(process.env.DB_PORT || 1433),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'master',
      options: { encrypt: true, trustServerCertificate: true }
    });
    // A database name cannot be a SQL parameter; it was checked above and is wrapped in [ ].
    await pool.request().query(`IF DB_ID('${name}') IS NULL CREATE DATABASE [${name}];`);
    console.log(`OK: database ${name} is ready. Now run: npm run check`);
    await pool.close();
  } catch (err) {
    console.log('FAILED: ' + err.message);
    console.log('Check: are you on UW Wi-Fi or Husky OnNet? Is the password in .env right?');
    process.exitCode = 1;
  }
})();

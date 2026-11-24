// Setup check: can this laptop reach the class database with the settings in .env?
// Run with: npm run check
require('dotenv').config();
const sql = require('mssql');

(async () => {
  try {
    const pool = await sql.connect({
      server: process.env.DB_SERVER,
      port: Number(process.env.DB_PORT || 1433),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'master',
      options: { encrypt: true, trustServerCertificate: true }
    });
    const r = await pool.request().query('SELECT @@SERVERNAME AS server_name, DB_NAME() AS db, SUSER_NAME() AS login_name');
    const x = r.recordset[0];
    console.log(`OK: connected to ${x.server_name}, database ${x.db}, as ${x.login_name}. You are ready.`);
    await pool.close();
  } catch (err) {
    console.log('NOT CONNECTED: ' + err.message);
    console.log('Check: are you on UW Wi-Fi or Husky OnNet? Is .env filled in (copied from .env.example, with the password from Canvas)? If it says Login failed, have you run npm run create-db yet?');
    process.exitCode = 1;
  }
})();

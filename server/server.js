// Techset middle tier: serves the page in web/ and answers /api/... with rows from SQL Server.
// Run with: npm start   then open http://localhost:3000
require('dotenv').config();
const path = require('path');
const express = require('express');
const sql = require('mssql');

const app = express();
app.use(express.static(path.join(__dirname, '..', 'web')));

// One shared connection pool (same settings as scripts/check-connection.js).
const poolPromise = sql.connect({
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: { encrypt: true, trustServerCertificate: true }
});

// Read and check the filters every route shares. Values only ever reach SQL as parameters.
function filters(req) {
  const roleId = Number.parseInt(req.query.role_id, 10);
  if (!Number.isInteger(roleId) || roleId < 1) throw new Error('Pick a role.');
  const city = (req.query.city || '').trim().slice(0, 50) || null;
  const have = (req.query.have || '').slice(0, 1000);
  return { roleId, city, have };
}

async function run(res, query, params = {}) {
  try {
    const request = (await poolPromise).request();
    if ('roleId' in params) request.input('role_id', sql.Int, params.roleId);
    if ('city' in params) request.input('city', sql.NVarChar(50), params.city);
    if ('have' in params) request.input('have', sql.NVarChar(1000), params.have);
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Database error: ' + err.message });
  }
}

function withFilters(handler) {
  return (req, res) => {
    let f;
    try { f = filters(req); } catch (err) { return res.status(400).json({ error: err.message }); }
    return handler(f, res);
  };
}

// Dropdown lists.
app.get('/api/roles', (req, res) =>
  run(res, 'SELECT role_id, role_name, description FROM dbo.roles ORDER BY role_id'));
app.get('/api/cities', (req, res) =>
  run(res, 'SELECT DISTINCT city FROM dbo.job_postings ORDER BY city'));
app.get('/api/skills', (req, res) =>
  run(res, 'SELECT skill_name, category FROM dbo.skills ORDER BY category, skill_name'));

// Market summary for a role (db/queries.sql #1).
app.get('/api/summary', withFilters(({ roleId, city }, res) => run(res, `
  WITH p AS (
    SELECT jp.posting_id, jp.company_id, jp.work_mode,
           (jp.salary_min + jp.salary_max) / 2.0 AS mid_salary,
           CASE WHEN EXISTS (SELECT 1 FROM dbo.posting_skills ps
                             JOIN dbo.skills s ON s.skill_id = ps.skill_id
                             WHERE ps.posting_id = jp.posting_id AND s.category = 'GenAI')
                THEN 1 ELSE 0 END AS wants_genai
    FROM dbo.job_postings jp
    WHERE jp.role_id = @role_id AND (@city IS NULL OR jp.city = @city)
  )
  SELECT COUNT(*) AS postings,
         COUNT(DISTINCT company_id) AS companies,
         CAST(AVG(mid_salary) AS INT) AS avg_salary,
         CAST(100.0 * SUM(CASE WHEN work_mode = 'Remote' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) AS DECIMAL(5,1)) AS pct_remote,
         CAST(100.0 * SUM(wants_genai) / NULLIF(COUNT(*), 0) AS DECIMAL(5,1)) AS pct_genai,
         CAST(AVG(CASE WHEN wants_genai = 1 THEN mid_salary END) AS INT) AS avg_salary_genai,
         CAST(AVG(CASE WHEN wants_genai = 0 THEN mid_salary END) AS INT) AS avg_salary_no_genai
  FROM p`, { roleId, city })));

// The user story: most-demanded skills for a role (db/queries.sql #2).
app.get('/api/top-skills', withFilters(({ roleId, city }, res) => run(res, `
  WITH p AS (
    SELECT posting_id, (salary_min + salary_max) / 2.0 AS mid_salary
    FROM dbo.job_postings
    WHERE role_id = @role_id AND (@city IS NULL OR city = @city)
  )
  SELECT TOP (15) s.skill_name, s.category,
         COUNT(*) AS postings,
         CAST(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM p), 0) AS DECIMAL(5,1)) AS pct_of_postings,
         CAST(AVG(p.mid_salary) AS INT) AS avg_salary
  FROM p
  JOIN dbo.posting_skills ps ON ps.posting_id = p.posting_id
  JOIN dbo.skills s ON s.skill_id = ps.skill_id
  GROUP BY s.skill_name, s.category
  ORDER BY postings DESC, avg_salary DESC`, { roleId, city })));

// Best-matching postings for the skills the user has (db/queries.sql #3).
app.get('/api/matches', withFilters(({ roleId, city, have }, res) => run(res, `
  WITH mine AS (
    SELECT DISTINCT LTRIM(RTRIM(value)) AS skill_name
    FROM STRING_SPLIT(@have, ',')
    WHERE LTRIM(RTRIM(value)) <> ''
  )
  SELECT TOP (10)
         jp.posting_id, jp.title, c.company_name, c.industry, jp.city, jp.work_mode,
         jp.salary_min, jp.salary_max, jp.posted_date,
         COUNT(*) AS skills_total,
         SUM(CASE WHEN m.skill_name IS NOT NULL THEN 1 ELSE 0 END) AS skills_matched,
         CAST(100.0 * SUM(CASE WHEN m.skill_name IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*) AS INT) AS match_pct,
         STRING_AGG(CASE WHEN m.skill_name IS NULL THEN s.skill_name END, ', ')
           WITHIN GROUP (ORDER BY ps.is_required DESC, s.skill_name) AS missing_skills
  FROM dbo.job_postings jp
  JOIN dbo.companies c ON c.company_id = jp.company_id
  JOIN dbo.posting_skills ps ON ps.posting_id = jp.posting_id
  JOIN dbo.skills s ON s.skill_id = ps.skill_id
  LEFT JOIN mine m ON m.skill_name = s.skill_name
  WHERE jp.role_id = @role_id AND (@city IS NULL OR jp.city = @city)
  GROUP BY jp.posting_id, jp.title, c.company_name, c.industry, jp.city, jp.work_mode,
           jp.salary_min, jp.salary_max, jp.posted_date
  ORDER BY match_pct DESC, jp.salary_max DESC`, { roleId, city, have })));

poolPromise.catch(err => console.error('Could not connect to the database: ' + err.message));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Techset running at http://localhost:${port}`));

// Creates the Techset tables in your <NetID>_myapp database and fills them with
// realistic made-up job postings (fictional companies). Safe to re-run: it drops and recreates.
// Run with: node db/load.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sql = require('mssql');

// ---- Reference data ---------------------------------------------------------

const roles = [
  [1, 'Data Analyst', 'Turns business data into dashboards, reports, and answers.'],
  [2, 'Data Scientist', 'Builds statistical and ML models to explain and predict.'],
  [3, 'Machine Learning Engineer', 'Trains, ships, and scales ML models in production.'],
  [4, 'AI / LLM Engineer', 'Builds products on large language models: RAG, agents, evals.'],
  [5, 'Data Engineer', 'Builds the pipelines and warehouses everyone else depends on.'],
  [6, 'Analytics Engineer', 'Models clean, tested data in the warehouse with SQL and dbt.']
];

const companies = [
  [1, 'Cascadia Health AI', 'Healthcare'],
  [2, 'Lumen Freight', 'Logistics'],
  [3, 'Orca Robotics', 'Robotics'],
  [4, 'Rainier Fintech', 'Finance'],
  [5, 'Evergreen Retail Co', 'Retail'],
  [6, 'Puget Labs', 'Biotech'],
  [7, 'Bluefern AI', 'AI Startup'],
  [8, 'Harbor Insurance Group', 'Insurance'],
  [9, 'Quartz Media', 'Media'],
  [10, 'Summit Energy Analytics', 'Energy'],
  [11, 'Atlas Mobility', 'Transportation'],
  [12, 'Juniper Bio', 'Biotech'],
  [13, 'Copperline Games', 'Gaming'],
  [14, 'Brightpath Education', 'EdTech'],
  [15, 'Kestrel Bank', 'Finance'],
  [16, 'Nimbus Commerce', 'E-commerce'],
  [17, 'Tidewater Civic Data', 'Government'],
  [18, 'Fernwood Climate', 'Climate Tech']
];

const skills = [
  [1, 'Python', 'Language'], [2, 'SQL', 'Language'], [3, 'R', 'Language'],
  [4, 'TypeScript', 'Language'], [5, 'C++', 'Language'],
  [6, 'Excel', 'Analytics & BI'], [7, 'Tableau', 'Analytics & BI'], [8, 'Power BI', 'Analytics & BI'],
  [9, 'Looker', 'Analytics & BI'], [10, 'Statistics', 'Analytics & BI'], [11, 'A/B Testing', 'Analytics & BI'],
  [12, 'scikit-learn', 'Machine Learning'], [13, 'PyTorch', 'Machine Learning'],
  [14, 'TensorFlow', 'Machine Learning'], [15, 'MLflow', 'Machine Learning'],
  [16, 'LLM APIs', 'GenAI'], [17, 'RAG', 'GenAI'], [18, 'Vector Databases', 'GenAI'],
  [19, 'Prompt Engineering', 'GenAI'], [20, 'AI Agents', 'GenAI'], [21, 'LLM Evals', 'GenAI'],
  [22, 'MCP', 'GenAI'],
  [23, 'Spark', 'Data Engineering'], [24, 'Airflow', 'Data Engineering'], [25, 'dbt', 'Data Engineering'],
  [26, 'Kafka', 'Data Engineering'], [27, 'Snowflake', 'Data Engineering'],
  [28, 'Databricks', 'Data Engineering'], [29, 'BigQuery', 'Data Engineering'],
  [30, 'AWS', 'Cloud & DevOps'], [31, 'Azure', 'Cloud & DevOps'], [32, 'Docker', 'Cloud & DevOps'],
  [33, 'Kubernetes', 'Cloud & DevOps'], [34, 'Git', 'Cloud & DevOps']
];
const skillId = Object.fromEntries(skills.map(([id, name]) => [name, id]));
const genAi = new Set(skills.filter(s => s[2] === 'GenAI').map(s => s[0]));

// How likely a posting for each role is to ask for each skill (0..1).
const demand = {
  1: { SQL: .95, Excel: .7, Python: .6, Tableau: .5, 'Power BI': .5, Statistics: .5, Looker: .2, R: .25,
       Snowflake: .2, 'A/B Testing': .25, dbt: .1, 'Prompt Engineering': .2, 'LLM APIs': .1, Git: .2 },
  2: { Python: .95, SQL: .8, Statistics: .8, 'scikit-learn': .6, 'A/B Testing': .5, PyTorch: .35, R: .3,
       Spark: .3, AWS: .3, 'LLM APIs': .3, Tableau: .2, 'LLM Evals': .15, Git: .4, Databricks: .2 },
  3: { Python: .95, PyTorch: .7, Docker: .6, AWS: .55, SQL: .5, Kubernetes: .45, MLflow: .45, 'LLM APIs': .4,
       TensorFlow: .3, Spark: .3, 'C++': .2, Git: .6, 'Vector Databases': .2, Databricks: .25 },
  4: { Python: .95, 'LLM APIs': .9, RAG: .75, 'Vector Databases': .6, 'Prompt Engineering': .55,
       'LLM Evals': .5, 'AI Agents': .55, TypeScript: .4, Docker: .4, AWS: .35, MCP: .35, PyTorch: .3,
       SQL: .35, Git: .5 },
  5: { SQL: .95, Python: .85, Spark: .65, AWS: .6, Airflow: .55, Snowflake: .5, dbt: .45, Databricks: .4,
       Kafka: .35, Docker: .35, Azure: .3, BigQuery: .25, Git: .5, 'LLM APIs': .1 },
  6: { SQL: .98, dbt: .85, Snowflake: .6, Git: .6, Python: .5, BigQuery: .35, Looker: .35, Airflow: .3,
       Tableau: .3, 'Power BI': .2, Statistics: .2, 'LLM APIs': .08 }
};

const baseSalary = { 1: 88000, 2: 138000, 3: 168000, 4: 178000, 5: 148000, 6: 128000 };
const cityPay = { Seattle: 1.1, 'San Francisco': 1.2, 'New York': 1.15, Austin: 0.95, Chicago: 0.95, Remote: 1.0 };
const levelPay = { Junior: 0.78, Mid: 1.0, Senior: 1.3 };
const cities = Object.keys(cityPay);

// Small seeded random generator so everyone who runs this gets the same data.
let seed = 430;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = arr => arr[Math.floor(rand() * arr.length)];

// ---- Generate postings -------------------------------------------------------

const postings = [];
const postingSkills = [];
let id = 1;
for (const [roleId, roleName] of roles) {
  for (let i = 0; i < 16; i++, id++) {
    const level = pick(['Junior', 'Mid', 'Mid', 'Senior', 'Senior']);
    const city = pick(cities);
    const mode = city === 'Remote' ? 'Remote' : pick(['Hybrid', 'Hybrid', 'Onsite', 'Remote']);

    // Pick this posting's skills from the role's demand profile.
    const chosen = Object.entries(demand[roleId]).filter(([, p]) => rand() < p).map(([s]) => skillId[s]);
    if (chosen.length < 3) chosen.push(skillId.Python, skillId.SQL);
    const unique = [...new Set(chosen)];

    // GenAI skills carry a pay premium in this (made-up) market.
    const aiCount = unique.filter(s => genAi.has(s)).length;
    const mid = baseSalary[roleId] * cityPay[city] * levelPay[level] * (1 + 0.035 * aiCount) * (0.92 + rand() * 0.16);
    const lo = Math.round(mid * 0.88 / 1000) * 1000;
    const hi = Math.round(mid * 1.12 / 1000) * 1000;

    const daysAgo = Math.floor(rand() * 75);
    const posted = new Date(Date.UTC(2026, 10, 20) - daysAgo * 86400000);
    const title = `${level === 'Mid' ? '' : level + ' '}${roleName}`;

    postings.push([id, pick(companies)[0], roleId, title, level, city, mode, lo, hi, posted]);
    unique.forEach((s, k) => postingSkills.push([id, s, k < Math.ceil(unique.length * 0.65) ? 1 : 0]));
  }
}

// ---- Load ---------------------------------------------------------------------

function table(name, cols, rows) {
  const t = new sql.Table(name);
  t.create = false;
  cols.forEach(([col, type]) => t.columns.add(col, type, { nullable: false }));
  rows.forEach(r => t.rows.add(...r));
  return t;
}

(async () => {
  let pool;
  try {
    pool = await sql.connect({
      server: process.env.DB_SERVER,
      port: Number(process.env.DB_PORT || 1433),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      options: { encrypt: true, trustServerCertificate: true }
    });
    const db = (await pool.request().query('SELECT DB_NAME() AS db')).recordset[0].db;
    if (!/_myapp$/i.test(db)) throw new Error(`Refusing to load into "${db}": DB_NAME must be <NetID>_myapp.`);

    await pool.request().batch(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    console.log('Tables created.');

    await pool.request().bulk(table('dbo.roles',
      [['role_id', sql.Int], ['role_name', sql.NVarChar(50)], ['description', sql.NVarChar(200)]], roles));
    await pool.request().bulk(table('dbo.companies',
      [['company_id', sql.Int], ['company_name', sql.NVarChar(100)], ['industry', sql.NVarChar(50)]], companies));
    await pool.request().bulk(table('dbo.skills',
      [['skill_id', sql.Int], ['skill_name', sql.NVarChar(50)], ['category', sql.NVarChar(30)]], skills));
    await pool.request().bulk(table('dbo.job_postings', [
      ['posting_id', sql.Int], ['company_id', sql.Int], ['role_id', sql.Int], ['title', sql.NVarChar(100)],
      ['seniority', sql.NVarChar(10)], ['city', sql.NVarChar(50)], ['work_mode', sql.NVarChar(10)],
      ['salary_min', sql.Int], ['salary_max', sql.Int], ['posted_date', sql.Date]], postings));
    await pool.request().bulk(table('dbo.posting_skills',
      [['posting_id', sql.Int], ['skill_id', sql.Int], ['is_required', sql.Bit]], postingSkills));

    console.log(`Loaded into ${db}: ${roles.length} roles, ${companies.length} companies, ${skills.length} skills, ` +
      `${postings.length} job postings, ${postingSkills.length} posting-skill links.`);
  } catch (err) {
    console.log('LOAD FAILED: ' + err.message);
    process.exitCode = 1;
  } finally {
    if (pool) await pool.close();
  }
})();

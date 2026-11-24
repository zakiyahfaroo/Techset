-- Techset queries. These are the exact queries server/server.js runs.
-- To try one in VS Code, change the DECLARE values and run the block.

/* 1. Market summary for a role (and optional city):
      how many postings, average pay, % remote, and the GenAI pay premium. */
DECLARE @role_id INT = 4, @city NVARCHAR(50) = NULL;   -- NULL = all cities

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
SELECT COUNT(*)                                                         AS postings,
       COUNT(DISTINCT company_id)                                       AS companies,
       CAST(AVG(mid_salary) AS INT)                                     AS avg_salary,
       CAST(100.0 * SUM(CASE WHEN work_mode = 'Remote' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) AS DECIMAL(5,1)) AS pct_remote,
       CAST(100.0 * SUM(wants_genai) / NULLIF(COUNT(*), 0) AS DECIMAL(5,1))                     AS pct_genai,
       CAST(AVG(CASE WHEN wants_genai = 1 THEN mid_salary END) AS INT)  AS avg_salary_genai,
       CAST(AVG(CASE WHEN wants_genai = 0 THEN mid_salary END) AS INT)  AS avg_salary_no_genai
FROM p;
GO

/* 2. The user story: the most-demanded skills for a role, with the share of postings
      that ask for each and the average pay of those postings. */
DECLARE @role_id INT = 4, @city NVARCHAR(50) = NULL;

WITH p AS (
  SELECT posting_id, (salary_min + salary_max) / 2.0 AS mid_salary
  FROM dbo.job_postings
  WHERE role_id = @role_id AND (@city IS NULL OR city = @city)
)
SELECT TOP (15)
       s.skill_name, s.category,
       COUNT(*)                                                                       AS postings,
       CAST(100.0 * COUNT(*) / NULLIF((SELECT COUNT(*) FROM p), 0) AS DECIMAL(5,1))   AS pct_of_postings,
       CAST(AVG(p.mid_salary) AS INT)                                                 AS avg_salary
FROM p
JOIN dbo.posting_skills ps ON ps.posting_id = p.posting_id
JOIN dbo.skills s          ON s.skill_id    = ps.skill_id
GROUP BY s.skill_name, s.category
ORDER BY postings DESC, avg_salary DESC;
GO

/* 3. Best-matching postings for the skills I already have (comma-separated list),
      with the skills each posting wants that I am missing. */
DECLARE @role_id INT = 4, @city NVARCHAR(50) = NULL, @have NVARCHAR(1000) = N'Python,SQL,LLM APIs,Git';

WITH mine AS (
  SELECT DISTINCT LTRIM(RTRIM(value)) AS skill_name
  FROM STRING_SPLIT(@have, ',')
  WHERE LTRIM(RTRIM(value)) <> ''
)
SELECT TOP (10)
       jp.posting_id, jp.title, c.company_name, c.industry, jp.city, jp.work_mode,
       jp.salary_min, jp.salary_max, jp.posted_date,
       COUNT(*)                                                    AS skills_total,
       SUM(CASE WHEN m.skill_name IS NOT NULL THEN 1 ELSE 0 END)   AS skills_matched,
       CAST(100.0 * SUM(CASE WHEN m.skill_name IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*) AS INT) AS match_pct,
       STRING_AGG(CASE WHEN m.skill_name IS NULL THEN s.skill_name END, ', ')
         WITHIN GROUP (ORDER BY ps.is_required DESC, s.skill_name) AS missing_skills
FROM dbo.job_postings jp
JOIN dbo.companies c       ON c.company_id  = jp.company_id
JOIN dbo.posting_skills ps ON ps.posting_id = jp.posting_id
JOIN dbo.skills s          ON s.skill_id    = ps.skill_id
LEFT JOIN mine m           ON m.skill_name  = s.skill_name
WHERE jp.role_id = @role_id AND (@city IS NULL OR jp.city = @city)
GROUP BY jp.posting_id, jp.title, c.company_name, c.industry, jp.city, jp.work_mode,
         jp.salary_min, jp.salary_max, jp.posted_date
ORDER BY match_pct DESC, jp.salary_max DESC;
GO

/* 4. Lists for the page's dropdowns. */
SELECT role_id, role_name, description FROM dbo.roles ORDER BY role_id;
SELECT DISTINCT city FROM dbo.job_postings ORDER BY city;
SELECT skill_name, category FROM dbo.skills ORDER BY category, skill_name;

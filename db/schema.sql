-- Techset schema: data & AI job postings and the skills they ask for.
-- Run against your own <NetID>_myapp database (db/load.js runs this for you).

DROP TABLE IF EXISTS dbo.posting_skills;
DROP TABLE IF EXISTS dbo.job_postings;
DROP TABLE IF EXISTS dbo.skills;
DROP TABLE IF EXISTS dbo.companies;
DROP TABLE IF EXISTS dbo.roles;

CREATE TABLE dbo.roles (
  role_id     INT           NOT NULL PRIMARY KEY,
  role_name   NVARCHAR(50)  NOT NULL UNIQUE,
  description NVARCHAR(200) NOT NULL
);

CREATE TABLE dbo.companies (
  company_id   INT           NOT NULL PRIMARY KEY,
  company_name NVARCHAR(100) NOT NULL UNIQUE,
  industry     NVARCHAR(50)  NOT NULL
);

CREATE TABLE dbo.skills (
  skill_id   INT          NOT NULL PRIMARY KEY,
  skill_name NVARCHAR(50) NOT NULL UNIQUE,
  category   NVARCHAR(30) NOT NULL   -- Language, Analytics & BI, Machine Learning, GenAI, Data Engineering, Cloud & DevOps
);

CREATE TABLE dbo.job_postings (
  posting_id  INT           NOT NULL PRIMARY KEY,
  company_id  INT           NOT NULL REFERENCES dbo.companies(company_id),
  role_id     INT           NOT NULL REFERENCES dbo.roles(role_id),
  title       NVARCHAR(100) NOT NULL,
  seniority   NVARCHAR(10)  NOT NULL CHECK (seniority IN ('Junior', 'Mid', 'Senior')),
  city        NVARCHAR(50)  NOT NULL,
  work_mode   NVARCHAR(10)  NOT NULL CHECK (work_mode IN ('Remote', 'Hybrid', 'Onsite')),
  salary_min  INT           NOT NULL,
  salary_max  INT           NOT NULL,
  posted_date DATE          NOT NULL,
  CHECK (salary_max >= salary_min)
);

-- Which skills each posting asks for (many-to-many).
CREATE TABLE dbo.posting_skills (
  posting_id  INT NOT NULL REFERENCES dbo.job_postings(posting_id),
  skill_id    INT NOT NULL REFERENCES dbo.skills(skill_id),
  is_required BIT NOT NULL,          -- 1 = required, 0 = nice to have
  PRIMARY KEY (posting_id, skill_id)
);

CREATE INDEX ix_job_postings_role_city ON dbo.job_postings(role_id, city);
CREATE INDEX ix_posting_skills_skill   ON dbo.posting_skills(skill_id);

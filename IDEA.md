# My app: Techset

**Domain:** The data & AI job market: job postings for data and AI roles (Data Analyst, Data Scientist, ML Engineer, AI / LLM Engineer, Data Engineer, Analytics Engineer) and the technical skills each posting asks for, including newer GenAI skills such as RAG, vector databases, AI agents, LLM evals, and MCP.

**User story:** As a student getting ready for data and AI internships and jobs, I need to see which skills employers ask for most for the role I want, and which of those I'm missing, so that I spend my limited study time on the skills that will actually get me hired (and paid more).

**What the user types or picks:**
- A target role (dropdown)
- A location (dropdown, or all locations)
- The skills they already have (type them in, or click a skill in the chart)

**What the app answers (all from SQL):**
1. The most-demanded skills for that role: the % of postings that ask for each and the average pay of those postings.
2. "Learn next": the top-demanded skills the user does not have yet.
3. A market summary: number of postings and companies, average salary, % remote, and the pay premium for postings that ask for GenAI skills.
4. The postings the user already matches best, with the skills each one is missing.

**Tables:** `roles`, `companies`, `skills`, `job_postings`, `posting_skills` (many-to-many between postings and skills). The data is realistic but made up, with fictional companies.

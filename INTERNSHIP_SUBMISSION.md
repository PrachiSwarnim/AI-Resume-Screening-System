# AI Automation Intern - Final Submission

*Below is the exact text you should use to fill out the submission form for your internship assessment. It highlights all the advanced system engineering we built into TalentIQ.*

---

**Selected Problem:** 
Automated Resume Screening System (TalentIQ)

**Solution Link (Repo):** 
[Insert your GitHub Repository Link Here]

**Live Demo Link (Optional but highly recommended):**
[Insert your Vercel URL Here]

**Tools Used:**
- **AI Models:** Hugging Face Inference API (Open Source LLMs)
- **Backend:** Python, FastAPI, PyPDF2
- **Frontend:** React.js, Vite, Tailwind CSS
- **Infrastructure:** Vercel (Edge CDN), Google Cloud Run (Serverless), GitHub Actions (CI/CD)

### Short Explanation of Approach (Approx. 230 Words)

My solution, TalentIQ, is a fully automated AI screening system engineered to eliminate recruiter fatigue and combat ATS keyword-matching bias. The system takes unstructured inputs (PDF Resumes and text Job Descriptions) and processes them through a deeply constrained AI pipeline to generate structured, JSON-formatted outputs indicating candidate fit.

To ensure "Practical Execution" and mitigate AI hallucination, I designed a rigid backend prompt architecture. Instead of allowing the AI to generate subjective summaries, it evaluates candidates against a strict Mathematical Scoring Matrix (Technical Stack, Recent Impact, Project Complexity, and Education). The LLM is forced to follow an "Evidence-First" rule, ensuring no valid experience is falsely flagged as a gap, and parses data into an exact `Title: Description` schema.

For "System Thinking", I avoided bloated architecture by utilizing a hybrid serverless design. The Python/FastAPI backend handles CPU-intensive PDF extraction and external LLM inference, then serves the processed JSON to a responsive React client. 

To demonstrate production-readiness, I built a zero-touch CI/CD deployment pipeline. Every push to GitHub automatically containerizes the backend via Docker, injects secure environment variables via GitHub Secrets, and ships to Google Cloud Run, while Vercel automatically deploys the frontend edge network. The result is a highly usable, low-latency, and scale-ready MVP.

# 🧠 TalentIQ: The Future of AI Resume Screening

Welcome to **TalentIQ**! If you've ever felt the pain of manually sifting through hundreds of resumes, or dealt with broken ATS systems that unfairly reject great candidates, you're in the right place. 

TalentIQ is a next-generation, AI-powered recruitment engine. We don’t just "read" resumes—we perform a multi-vector, strict mathematical audit of a candidate's skills, experience, and project complexity to tell you exactly who deserves an interview.

---

## 🚀 Why We Built This
Traditional ATS systems rely on dumb keyword matching. They miss the context of a candidate's actual impact. We built TalentIQ to solve this using advanced Large Language Models. 

**Our Guiding Principles:**
*   **Evidence-First Auditing:** Our AI is strictly programmed against hallucination. If a candidate doesn't have the experience, they don't get the points. If they do, they get full credit.
*   **Zero "Lazy" Summaries:** Instead of a wall of unstructured text, TalentIQ generates beautiful, bite-sized "Strengths" and "Gaps" (e.g., `Generative AI: Built production LLM pipelines using PyTorch`).
*   **The "Perfect Score" Rule:** We don't artificially lower scores. If a candidate has zero legitimate gaps for the role, the AI is mathematically forced to reward them with a 95-100% match.

---

## 🧠 The Tech Stack
We built this to be lightning-fast, highly scalable, and beautiful to look at.

*   **The Brain (AI):** Powered completely by **Hugging Face** Open-Source Models (bypassing commercial models like Gemini for more control).
*   **The Engine (Backend):** Python, FastAPI, and PyPDF2 (containerized with Docker).
*   **The Face (Frontend):** React.js, Vite, Tailwind CSS, and Framer Motion for buttery-smooth animations.
*   **The Memory (Database):** Supabase (PostgreSQL) for secure artifact storage.

---

## 🛠️ Running TalentIQ Locally

Want to take the engine for a spin on your own machine? It's easy!

### 1. Fire up the Backend
1. Open a terminal and CD into the `backend` folder.
2. Install the necessary Python packages: `pip install -r requirements.txt`.
3. Create a `.env` file and drop in your `HUGGINGFACE_API_TOKEN` and `SUPABASE` URLs.
4. Start the engine: `uvicorn main:app --reload`. (It will boot up on port 8000).

### 2. Launch the Dashboard
1. Open a second terminal and CD into the `frontend` folder.
2. Install the node modules: `npm install`.
3. Start the dev server: `npm run dev`. 
4. Boom! Your UI is live on localhost.

---

## ☁️ Production Deployment (Automated CI/CD)

We didn't just build this to run locally; we engineered it for the cloud. TalentIQ features a fully automated, hands-free deployment pipeline.

### The Backend: Google Cloud Run (Serverless)
We use a **GitHub Actions Pipeline** (`.github/workflows/deploy.yml`) to automatically build and push our code to Google Cloud Run the second we type `git push origin main`.
*   **How to authenticate:** Link your GCP Project via GitHub Secrets (`GCP_PROJECT_ID`, `GCP_SA_KEY`). 
*   **The Magic:** GitHub automatically injects our Hugging Face and Supabase tokens directly into the secure cloud environment during the build.

### The Frontend: Vercel (Edge CDN)
The React dashboard is hooked up to Vercel for instantaneous, globally distributed deployments.
*   Because it's a Single Page Application, we use a custom `vercel.json` to ensure routing never breaks.
*   The frontend talks to the Google Cloud Run server via a single environment variable: `VITE_API_BASE_URL`.

---
*Built with ❤️ for modern technical recruiters.*

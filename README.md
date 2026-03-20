# TalentIQ – AI Resume Screening System

TalentIQ is an AI-powered resume screening system designed to automate and optimize the candidate shortlisting process.

## Key Features
* **Automated PDF Parsing:** Extract text from candidate resumes automatically.
* **AI Evaluation:** Uses Gemini 1.5 Flash (or fallback) to score candidates (0–100).
* **Fit Recommendation:** Categorizes candidates as Strong Fit, Moderate Fit, or Not Fit.
* **Skill Gap Analysis:** Highlights key strengths and missing skills.
* **Data Export:** Download screening results as CSV.

## Tech Stack
* **Frontend:** React.js, Tailwind CSS, Framer Motion
* **Backend:** FastAPI, PyPDF2, Pandas, Google Generative AI
* **AI Layer:** Gemini API

## How to Run

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`.
3. Create a `.env` file and add your `GEMINI_API_KEY`.
4. Run the server: `python main.py` or `uvicorn main:app --reload`.

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## Deployment Strategy

### 🚀 Backend: GCP Cloud Run
1.  **Enable APIs**: Artifact Registry, Cloud Run, Cloud Build.
2.  **Service Account**: Create a Service Account with `Roles/Editor` and `Roles/Cloud Run Admin`.
3.  **GitHub Secrets**:
    *   `GCP_PROJECT_ID`: Your GCP project ID.
    *   `GCP_SA_KEY`: The JSON key of your Service Account.
    *   `GEMINI_API_KEY`: Your Gemini key.
    *   `SUPABASE_URL`, `SUPABASE_KEY`: Your Supabase creds.
4.  **Action**: Push to `main` branch; our GitHub Action in `.github/workflows/deploy.yml` will handle the rest!

### 🎨 Frontend: Vercel
1.  Connect your repo to Vercel.
2.  Add **Environment Variable**: `VITE_API_BASE_URL` (set to your **Cloud Run Service URL**).
3.  Vercel handles all builds and SSL automatically.

## Architecture
Hybrid serverless design. The FastAPI backend is containerized via **Docker** for GCP Cloud Run, ensuring zero-downtime scaling. The frontend is a SPA (Vite/React) deployed on edge networks via Vercel.
"# AI-Resume-Screening-System" 

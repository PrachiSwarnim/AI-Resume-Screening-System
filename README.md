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

## Architecture
Modular design with a clear separation between the processing layer (FastAPI) and the consumption layer (React). AI calls are structured to return consistent JSON for direct frontend consumption.
"# AI-Resume-Screening-System" 

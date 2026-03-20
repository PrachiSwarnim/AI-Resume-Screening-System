# 🚀 TalentIQ Deployment Troubleshooting Guide

This guide documents the exact, step-by-step solutions for the common deployment challenges encountered when setting up the automated **Google Cloud Run** and **Vercel** architecture for TalentIQ.

---

## Part 1: Backend Deployment (Google Cloud Run + GitHub Actions)

We utilize a GitHub Action (`deploy.yml`) to automatically build and deploy our FastAPI backend to GCP. If the deployment fails inside the GitHub "Actions" tab, the solution is always an IAM (Identity and Access Management) permission issue.

### 🛑 Error 1: Artifact Registry API Disabled
**Error Message:** `Artifact Registry API has not been used in project... Enable it...`
**The Fix:** Google disables this API by default.
1. Click the exact link provided in the GitHub Action error log.
2. Click **"Enable"** on the Google Cloud dashboard.
3. Wait 60 seconds and click **"Re-run all jobs"** in GitHub.

### 🛑 Error 2: gcr.io Repo Does Not Exist (createOnPush Denied)
**Error Message:** `denied: gcr.io repo does not exist. Creating on push requires...`
**The Fix:** Your Service Account doesn't have permission to initialize the Docker repository.
1. Go to **IAM & Admin -> IAM** in Google Cloud.
2. Find the Service Account you connected to GitHub (e.g., `talentiq@...`).
3. Click the Pencil (Edit) icon.
4. Add the role: **`Artifact Registry Create-on-push Writer`**.
*(Note: If you are an individual developer, it is faster to just assign the `Editor` role to bypass all future permission issues).*

### 🛑 Error 3: iam.serviceaccounts.actAs Denied
**Error Message:** `Permission 'iam.serviceaccounts.actAs' denied on service account... compute@developer...`
**The Fix:** The robot account doesn't have permission to act on behalf of the compute engine.
1. Go to **IAM & Admin -> IAM**.
2. Edit your Service Account.
3. Add the role: **`Service Account User`**.

### 🔑 Final Backend Checklist (GitHub Secrets)
To successfully deploy the backend, your GitHub repository must have the following secrets added under **Settings -> Secrets and variables -> Actions**:
*   `GCP_PROJECT_ID`
*   `GCP_SA_KEY`
*   `HUGGINGFACE_API_TOKEN`
*   `SUPABASE_URL`
*   `SUPABASE_KEY`

---

## Part 2: Frontend Deployment (Vercel)

Vercel pulls automatically from GitHub, but because our React code is nested inside a `frontend` folder, you must update two specific settings.

### 🛑 Error 1: "Command npm install exited with 1" (Missing Package.json)
**The Problem:** Vercel is looking for the React code in the "Root" directory, but the code is inside the `/frontend` folder.
**The Fix:**
1. In Vercel, go to your project **Settings -> General**.
2. Find **Root Directory**.
3. Click Edit and type: `frontend`.
4. Click Save and Redeploy.

### 🛑 Error 2: "npm error peer vite@..." (Dependency Conflict)
**The Problem:** Vercel uses the latest version of `npm`, which strictly blocks installation if you have older peer dependencies.
**The Fix:**
1. In Vercel, go to **Settings -> General**.
2. Expand **Build & Development Settings**.
3. Toggle the switch to "override" the **Install Command**.
4. Type exactly this: `npm install --legacy-peer-deps`.
5. Click Save and Redeploy.

### 🌍 Connecting the Frontend to the live Backend
The frontend needs to know where the Google Cloud Run server is hosted.
1. In Vercel, go to **Settings -> Environment Variables**.
2. Add a new variable named: `VITE_API_BASE_URL`.
3. Set the value to your live Google Cloud URL (e.g., `https://talentiq-api-...run.app`).
4. **Important:** You must click **Redeploy** on the Deployments tab to inject the variable into the live site!

"""
TalentIQ Backend Configuration
All environment variables, API clients, and model settings.
"""
import os
from dotenv import load_dotenv
from google import genai
from huggingface_hub import InferenceClient
from supabase import create_client, Client
from datetime import datetime

load_dotenv()

# System Date Logger
print(f"[{datetime.now().strftime('%H:%M:%S')}] Neural Engine Initialized. System Date: {datetime.now().strftime('%A, %B %d, %Y')}")

# Google Gemini Client
google_api_key = os.getenv("GEMINI_API_KEY")
google_client = genai.Client(api_key=google_api_key) if google_api_key else None

# Hugging Face Client
hf_token = os.getenv("HUGGINGFACE_API_TOKEN")
hf_client = InferenceClient(token=hf_token) if hf_token else None

# Default Models
GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-2.0-flash")
HF_MODEL = os.getenv("HF_MODEL", "microsoft/Phi-3-mini-4k-instruct")

# Supabase Client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

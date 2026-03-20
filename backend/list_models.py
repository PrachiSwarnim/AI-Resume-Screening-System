import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env file.")
else:
    genai.configure(api_key=api_key)
    print("Connected Successfully. Listing available models:")
    try:
        model_list = genai.list_models()
        for m in model_list:
            if 'generateContent' in m.supported_generation_methods:
                print(f"Model ID: {m.name} | Display Name: {m.display_name}")
    except Exception as e:
        print(f"Error listing models: {str(e)}")

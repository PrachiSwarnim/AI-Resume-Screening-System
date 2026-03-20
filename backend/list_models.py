import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env file.")
else:
    client = genai.Client(api_key=api_key)
    print("Connected Successfully with Modern SDK. Listing models:")
    try:
        # Use the models.list() method from the new SDK
        for m in client.models.list():
            print(f"Model ID: {m.name} | Display Name: {m.display_name}")
    except Exception as e:
        print(f"Error listing models: {str(e)}")

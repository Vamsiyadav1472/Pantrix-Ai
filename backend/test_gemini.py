import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"Testing with API Key: {api_key[:5]}...")
    
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=["Hello, identify yourself and confirm if you can see this text."]
        )
        print("Response received successfully!")
        print(f"AI Text: {response.text}")
    except Exception as e:
        print(f"Error calling Gemini: {e}")

if __name__ == "__main__":
    test_gemini()

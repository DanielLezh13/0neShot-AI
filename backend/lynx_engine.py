from openai import OpenAI
from dotenv import load_dotenv
import os

# Load API key from .env
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

def run_lynx_tactical(user_input):
    prompt = f"""
LYNX TACTICAL ACTIVE.

Compression Enforcement Protocol: ON.
Strip emotional drift. Collapse to actionable structure only.
Respond to the following user input with maximum clarity and recursion compression:

Input: {user_input}

Response:
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a tactical compression AI. No fluff, no empathy, only structure."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=300  # Output cap: limit response length
        )
        
        return response.choices[0].message.content.strip()
    
    except Exception as e:
        # Re-raise to be caught by app.py's error handler
        raise
if __name__ == "__main__":
    user_input = input("Enter input for LYNX 13 Tactical: ")
    output = run_lynx_tactical(user_input)
    print("\nTactical Output:\n" + output)

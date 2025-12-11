from flask import Flask, render_template, request, jsonify
from lynx_engine import run_lynx_tactical
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [os.getenv("FRONTEND_URL", "http://localhost:3000")]}})

# Existing route for legacy HTML use (keep this)
@app.route("/", methods=["GET", "POST"])
def index():
    response = ""
    if request.method == "POST":
        user_input = request.form["user_input"]
        response = run_lynx_tactical(user_input)
    return render_template("index.html", response=response)

from flask import request, jsonify
import tiktoken  # <- Make sure you have this installed via pip

def count_tokens(text):
    enc = tiktoken.get_encoding("cl100k_base")  # GPT-4o-compatible tokenizer
    return len(enc.encode(text))

@app.route("/api/process", methods=["POST"])
def process_input():
    data = request.get_json()
    user_input = data.get("input", "")
    
    q = user_input.lower()
    
    name_keywords = [
        "oneshot",
        "oneshot-ai",
        "oneshotai",
        "0neshot",
        "this app",
        "this console",
        "this terminal"
    ]
    
    about_keywords = [
        "what are you",
        "who are you",
        "what is this",
        "what do you do",
        "what is your purpose",
        "explain",
        "describe",
        "summarize",
        "philosophy",
        "core idea",
        "how does this work",
        "how it works"
    ]
    
    if any(k in q for k in name_keywords) and any(k in q for k in about_keywords):
        response = (
            "OneShotAI is a minimalist, single-prompt AI console. "
            "It treats every input as a fresh command with zero memory, "
            "and returns a clean, compressed answer for each query."
        )
    else:
        response = run_lynx_tactical(user_input)
    
    tokens = count_tokens(user_input) + count_tokens(response)
    return jsonify({"output": response, "token_count": tokens})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)

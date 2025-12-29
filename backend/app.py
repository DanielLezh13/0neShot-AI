from flask import Flask, render_template, request, jsonify
from lynx_engine import run_lynx_tactical
from flask_cors import CORS
import os
from datetime import datetime, timedelta
from collections import defaultdict

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# In-memory rate limiting: IP -> list of request timestamps
rate_limit_store = defaultdict(list)
RATE_LIMIT_REQUESTS = 10
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds
MAX_INPUT_LENGTH = 1000

def check_rate_limit(ip):
    """Check if IP has exceeded rate limit. Returns (allowed, remaining_seconds)."""
    now = datetime.now()
    # Clean old entries
    rate_limit_store[ip] = [ts for ts in rate_limit_store[ip] if (now - ts).total_seconds() < RATE_LIMIT_WINDOW]
    
    if len(rate_limit_store[ip]) >= RATE_LIMIT_REQUESTS:
        oldest = min(rate_limit_store[ip])
        remaining = RATE_LIMIT_WINDOW - (now - oldest).total_seconds()
        return False, int(remaining)
    
    rate_limit_store[ip].append(now)
    return True, 0

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
    # Get client IP
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    if client_ip:
        client_ip = client_ip.split(',')[0].strip()
    else:
        client_ip = request.remote_addr
    
    # Rate limiting
    allowed, remaining = check_rate_limit(client_ip)
    if not allowed:
        return jsonify({
            "error": "Rate limit exceeded. Please try again later.",
            "retry_after": remaining
        }), 429
    
    # Get and validate input
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request: JSON body required"}), 400
    
    user_input = data.get("input", "")
    
    # Input length check
    if len(user_input) > MAX_INPUT_LENGTH:
        return jsonify({
            "error": f"Input too long. Maximum {MAX_INPUT_LENGTH} characters allowed."
        }), 413
    
    if not user_input.strip():
        return jsonify({"error": "Input cannot be empty"}), 400
    
    # Special-case: OneShotAI describes itself
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
    
    try:
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
    
    except Exception as e:
        # Fail-safe: don't expose stack traces
        return jsonify({
            "error": "An error occurred processing your request. Please try again."
        }), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)

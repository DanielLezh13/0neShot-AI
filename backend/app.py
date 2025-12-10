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
    response = run_lynx_tactical(user_input)
    tokens = count_tokens(user_input) + count_tokens(response)
    return jsonify({"output": response, "token_count": tokens})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)

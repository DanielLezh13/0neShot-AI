# OneShotAI — Minimalist Tactical AI Interface  
_A single‑prompt, zero‑memory command console_

## 🌐 Overview

OneShotAI is a **stateless, single‑prompt AI terminal** designed for fast, tactical, zero‑context responses.  
No conversation history. No memory. No personalization layer.  
Every input is treated as a **fresh command**, producing the cleanest possible model output.

This project represents the **opposite design philosophy** of large, scaffolded AI interfaces.  
Where systems like DartBoard focus on memory, structure, and multi‑step reasoning,  
**OneShotAI explores the bare-metal behavior of an LLM with everything stripped away.**

It is a neon‑styled, compact console ideal for:
- Direct Q&A  
- Quick reasoning tasks  
- Lightweight inference  
- Environments where stateful chat is undesirable  

This project was originally built to study how LLMs behave **without** memory or scaffolding —  a foundation that later informed the development of DartBoard, a structured multi-layer AI system.

---

## ⚡ Features

### Core Interaction
- **Single‑prompt, stateless execution** — no chat history, no hidden context  
- **Character‑streaming animation** for a terminal-like flow  
- **Blinking cursor effect** during output  
- **Internal scrollable console** with fixed viewport  

### Rendering & Styling
- **Neon green terminal aesthetic** (DS-Digital font)  
- **Markdown rendering** (tables, lists, code, headings)
- **Syntax highlighting** for code blocks (Highlight.js)
- **Responsive output panel** with smooth scroll behavior  

### Backend
- **Flask** server with clean API separation  
- **OpenAI API integration** with environment-variable credential handling  
- **Token counting** using tiktoken  
- **CORS‑restricted endpoints** for safe local usage  

---

## 🧠 Design Philosophy

OneShotAI was created first — before DartBoard — as an experiment:

> _“What does an LLM feel like when everything is removed?”_  
> _No system prompt. No history. No personalization. No structure._

This minimalist approach helped expose:
- How the model behaves *raw*  
- How much scaffolding influences reasoning  
- How memory and modes change output quality  
- How interface constraints shape cognition  

From this experiment, the insights directly informed my ongoing development of **DartBoard**,  
a structured, multi-layer AI system built for persistent memory, mode switching, and advanced reasoning workflows.

Where OneShotAI strips everything away, DartBoard adds the layers an AI actually needs to operate at scale:
- contextual memory that can be attached or removed per task  
- injectable knowledge modules (files, notes, archived sessions)  
- structured reasoning modes  
- continuity across long analytical workflows  

OneShotAI represents the minimal baseline.  
DartBoard explores the opposite direction — a controlled environment for richer, more deliberate thinking.

Together, they form a deliberate contrast:  
**OneShotAI tests the model raw; DartBoard tests the model scaffolded.**

---

## 🛠 Tech Stack

### Frontend
- React (Create React App)
- React Markdown (remark-gfm, rehype-highlight)
- react-textarea-autosize
- Highlight.js
- Custom neon DS-Digital styling

### Backend
- Python (Flask)
- Flask-CORS
- OpenAI API
- python-dotenv
- tiktoken

---

## 🚀 Local Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd -0-neShotAI-main
```

---

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env
```

Edit `.env` to include:
```
OPENAI_API_KEY=your_key_here
FLASK_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://127.0.0.1:5000
```

Start the server:
```bash
python app.py
```

---

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

App runs at:  
`http://localhost:3000`

---

## 📡 API Endpoint

Frontend communicates with:

```
POST http://127.0.0.1:5000/api/process
```

Payload:
```json
{
  "prompt": "Your message here"
}
```

Returns:
- Model response  
- Token usage  
- Streaming output support  

---

## 🎥 Demo (recommended once deployed)

Add here later:
- 2–3 screenshots of the UI  
- 1 short GIF of the streaming animation  

---

## 📘 Roadmap

- Deployment (Vercel + Render/Fly)  
- Optional: additional modes (Tactical / Simple)  
- Architecture diagram  
- Error boundary for backend timeouts  
- Optional mobile UI pass  

---

## 📄 License

MIT License — see `LICENSE` file.

---

## ⭐ If you're reviewing my portfolio

This project demonstrates:

- custom UI design  
- streaming output rendering  
- API integration  
- Flask backend engineering  
- environment-variable security  
- Markdown + syntax rendering  
- thoughtful product philosophy  

For a direct contrast, see **DartBoard**, the maximalist AI cockpit built afterward.

---

OneShotAI is intentionally simple — a focused instrument for raw inference.  
A minimal tool with a clear identity.

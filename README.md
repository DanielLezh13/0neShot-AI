# 0neShot-AI  
*Minimal, single-shot AI terminal for fast, compressed responses.*

<div align="center">
  <img src="docs/hero.gif" width="600" alt="Demo GIF" />
</div>

## Overview
0neShot-AI is a **stateless AI console** where every prompt is treated as a fresh command.  
No memory. No chat history. No continuity.  
Just **input → answer**.

This project explores the opposite design philosophy of complex, scaffolded AI systems.  
Where multi-layer interfaces rely on memory, modes, and workflows,  
**0neShot-AI strips everything away to reveal raw model behavior.**

Useful for:
- quick inference  
- terminal-style Q&A  
- environments where stateful chat is undesirable  
- studying baseline LLM output without scaffolding  

---

## Features

### Core Interaction
- **Single-shot stateless execution**  
- **Streaming text animation**  
- **Blinking cursor effect**  
- **Internal scrollable terminal console**

### Rendering & Styling
- **Neon terminal aesthetic**  
- **Markdown support** (tables, lists, code, headers)  
- **Syntax highlighting** for code blocks  

### Backend
- **Flask API server**  
- **OpenAI integration** via environment variables  
- **Token counting**  
- **CORS-restricted endpoints**

---

## Tech Stack

### Frontend
- React  
- React Markdown (remark-gfm, rehype-highlight)  
- Highlight.js  
- Custom DS-Digital styling  

### Backend
- Python (Flask)  
- Flask‑CORS  
- OpenAI API  
- python-dotenv  
- tiktoken  

---

## Local Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd -0-neShotAI-main
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env
```

Set values in `.env`:
```
OPENAI_API_KEY=your_key_here
FLASK_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://127.0.0.1:5000
```

Start backend:
```bash
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs at:  
`http://localhost:3000`

---

## API Endpoint

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
- model response  
- token usage  
- streaming support  

---

## Demo

### Full View
![OneShot-AI full view](docs/screenshot-full.png)

### Terminal Close-Up
![OneShot-AI console close-up](docs/screenshot-terminal.png)

### GIF Preview
![OneShot-AI demo](docs/hero.gif)

---

## Roadmap
- Deployment to Vercel + Render/Fly  
- Optional mode variants (Tactical / Simple)  
- Architecture diagram  
- Improved error boundaries  
- Optional mobile UI pass  

---

## License
MIT License — see `LICENSE`.

---

## Portfolio Notes
This project demonstrates:
- custom UI work  
- streaming output rendering  
- React ↔ Flask integration  
- clean API design  
- environment variable security  
- Markdown + syntax rendering  
- clear product philosophy  

For contrast, see **DartBoard**, the maximalist multi-layer AI cockpit.

---

0neShot-AI is intentionally minimal: a focused instrument for raw inference.

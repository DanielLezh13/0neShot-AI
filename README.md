# OneShotAI — Single-Prompt Tactical Interface

## Overview

OneShotAI is a minimal, stateless AI terminal interface with a neon-styled UI. It provides single-shot Q&A interactions with no chat history—each prompt is processed independently, making it ideal for tactical, focused queries without conversational context.

## Features

- **Streaming output** with character-by-character display animation
- **Neon terminal UI** with DS-Digital font styling
- **Markdown rendering** with table support and syntax highlighting
- **Flask backend** with OpenAI API integration
- **Token counting** using tiktoken for usage tracking
- **Fixed-height console** with internal scrolling for long outputs
- **No page scroll**—locked viewport with scrollable output panel

## Tech Stack

**Frontend:**
- React (Create React App)
- React Markdown with remark-gfm, rehype-highlight
- react-textarea-autosize
- Highlight.js for code syntax highlighting

**Backend:**
- Flask
- Flask-CORS
- OpenAI API
- python-dotenv
- tiktoken

## Local Setup

### Prerequisites

- Python 3.7+
- Node.js and npm
- OpenAI API key

### Backend Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd -0-neShotAI-main
   ```

2. Navigate to backend directory:
   ```bash
   cd backend
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file from template:
   ```bash
   cp ../.env.example .env
   ```

5. Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   FLASK_ENV=development
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://127.0.0.1:5000
   ```

6. Start the Flask server:
   ```bash
   python app.py
   ```
   Server runs on `http://127.0.0.1:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`

## Notes

- **No authentication in public version**: Supabase integration is disabled for public builds. The app runs in guest mode with local storage-based usage tracking.

- **Supabase hooks disabled**: All Supabase-related code is commented out. To enable authentication locally, uncomment the Supabase import in `frontend/src/App.js` and configure environment variables.

- **Local experimentation only**: This repository is configured for local development. Environment variables are required for API keys and should never be committed to version control.

- **Backend API endpoint**: The frontend communicates with the backend at `http://127.0.0.1:5000/api/process` for processing prompts.

- **Token usage**: Token counts are calculated and displayed but not persisted in the public version.

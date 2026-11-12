# 🧠 Exam Cracker AI — Autonomous Mock Exam Agent

An AI-powered automated examination agent that completes practice examinations autonomously using Google Gemini AI.

## 🚀 Features

- **AI Question Understanding** — MCQ, multi-select, OCR, math, code, tables
- **Gemini AI Answer Engine** — Structured answers with multi-layer verification
- **Automated Workflow** — One-click start, pause, resume, stop
- **Premium Dashboard** — Real-time stats, progress, activity logs
- **Dark/Light Theme** — Premium SaaS-quality UI
- **Reliability** — Retry logic, progress persistence, error handling

## 🛠 Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React.js + Vite                |
| Backend    | Node.js + Express.js           |
| Database   | MongoDB Atlas                  |
| AI         | Google Gemini API              |
| OCR        | Tesseract.js                   |

## 📦 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (optional — works with in-memory data for demo)
- Google Gemini API key

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key
```

### 3. Start the Application

```bash
# Terminal 1 — Start backend
cd server
npm start

# Terminal 2 — Start frontend
cd client
npm run dev
```

### 4. Open the App

Visit `http://localhost:5173` in your browser.

## 🎮 Usage

1. **Create/Load Exam** — Click "Load Sample Exam" on the dashboard or create your own
2. **Start Session** — Click on an exam to begin
3. **Start Automation** — Click the "Start Automation" button
4. **Watch AI Work** — The AI will read, analyze, and answer each question
5. **Review & Submit** — Review answers and submit when complete

## 📁 Project Structure

```
exam-cracker/
├── server/                 # Backend (Express.js)
│   ├── src/
│   │   ├── index.js        # Entry point
│   │   ├── config/         # Database config
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # AI, OCR, verification
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Error handling
│   │   └── utils/          # Sample data, helpers
│   └── package.json
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # Theme context
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API client
│   │   └── index.css       # Theme & styles
│   └── vite.config.js
└── README.md
```

## ⚠️ Disclaimer

This tool is designed exclusively for **self-hosted practice examinations** and **explicitly authorized mock exam platforms**. It does not integrate with or bypass security on any third-party examination system.

## 📄 License

MIT
"# -AI-Autonomous-Mock-Exam-Agent" 

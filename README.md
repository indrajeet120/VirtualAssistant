# 🤖 MERN AI Virtual Assistant (Shifra)

A full-stack, voice-enabled AI Virtual Assistant built using the **MERN Stack** (MongoDB, Express, React, Node.js) and powered by **Groq AI** (`llama-3.3-70b-versatile`). 

The assistant supports automatic multi-lingual voice recognition (Hindi, Hinglish, English), instant browser tab navigation, custom assistant avatars and names, song playback on YouTube, dynamic official website discovery, and natural text-to-speech responses.

---

## ✨ Features

- 🎙️ **Voice & Text Input**: Speak naturally using Web Speech API or type your prompts into the chat input bar.
- 🗣️ **Automatic Language Detection & Voice Selection**: Automatically detects Hindi, Hinglish, or English and replies using matching `hi-IN` or `en-IN` text-to-speech voices.
- ⚡ **Instant Website & App Opening**: 
  - Directly opens predefined apps in a **new tab** (`_blank`): YouTube, Google, GitHub, Instagram, Facebook, Gmail, ChatGPT, Calculator, and Weather.
- 🔍 **Dynamic Official Website Search**: Automatically searches and opens official websites for unmapped requests (e.g., *"Open ISRO"*, *"Open OpenAI"*, *"Open W3Schools"*, *"Open Canva"*).
- 🎵 **YouTube Song & Video Search**: Extracts song/video queries and opens YouTube search results directly (e.g., *"Play Kesariya song on YouTube"*, *"aaj ki raat song chalao"*).
- 🧠 **AI Knowledge Q&A**: Answers general questions (*"What is Java?"*, *"Explain React"*) directly via Groq AI without opening browser tabs.
- 👤 **Customization & History**: Sign up, sign in, pick a custom assistant avatar image, customize your assistant's name, and save your chat history.
- 🔐 **Production-Ready Hybrid Auth**: Supports both HttpOnly cookies and `Authorization: Bearer <token>` headers for seamless cross-site deployment on Render / Vercel.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS & Vanilla CSS
- **Routing**: React Router DOM (v7)
- **Voice Capabilities**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js & Express.js (ES Modules)
- **Database**: MongoDB Atlas with Mongoose ORM
- **AI Integration**: Groq API (`llama-3.3-70b-versatile`)
- **Authentication**: JSON Web Tokens (JWT), bcryptjs, cookie-parser
- **File Uploads**: Cloudinary & Multer

---

## 📂 Project Structure

```text
VirtualAssistant/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB Atlas Connection
│   │   ├── cloudinary.js      # Cloudinary Setup
│   │   └── token.js           # JWT Token Generator
│   ├── controllers/
│   │   ├── auth.controllers.js# SignUp, Login, Logout
│   │   └── user.controllers.js# Current User, Assistant Customization, AI Queries
│   ├── middlewares/
│   │   ├── isAuth.js          # Hybrid Auth Middleware (Cookie + Bearer Token)
│   │   └── multer.js          # File Upload Middleware
│   ├── moduls/
│   │   └── user.moduls.js     # User Schema (Name, Email, History, Assistant Info)
│   ├── routes/
│   │   ├── auth.routes.js     # Auth Routes (/api/auth)
│   │   └── user.routes.js     # User Routes (/api/user)
│   ├── gemini.js              # Groq AI System Prompt & Intent Parser
│   ├── index.js               # Express Server & CORS Configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── assets/            # Avatars & Background Media
    │   ├── component/         # Reusable Card Components
    │   ├── context/           # UserContext (Global State & Server URL)
    │   ├── pages/
    │   │   ├── Home.jsx       # Main Voice Assistant Interface
    │   │   ├── SignIn.jsx     # Login Screen
    │   │   ├── SignUp.jsx     # Registration Screen
    │   │   ├── Customize.jsx  # Avatar Selection
    │   │   └── Customize2.jsx # Assistant Naming
    │   ├── App.jsx            # Routing Setup
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ installed
- **MongoDB Atlas Connection URI**
- **Groq API Key**: Obtain from [Groq Console](https://console.groq.com/)
- **Cloudinary Account**: For assistant avatar uploads

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` root:
   ```env
   PORT=8000
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GROQ_API_KEY=your_groq_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:8000`.

---

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite frontend dev server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

---

## 🌐 Production Deployment (Render)

### Backend Deployment (Web Service)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Set `NODE_ENV=production`, `PORT=8000`, `FRONTEND_URL`, `MONGODB_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `CLOUDINARY_*`.

### Frontend Deployment (Static Site)
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Rewrite Rule**: Set Source `/*` -> Destination `/index.html` (SPA Rewrite).

---

## 📝 Usage Commands Examples

| User Command | Action Taken |
| :--- | :--- |
| **"Shifra open YouTube"** | Opens `https://www.youtube.com` in a new tab + Speaks *"Opening YouTube."* |
| **"Open Google"** | Opens `https://www.google.com` in a new tab + Speaks *"Opening Google."* |
| **"Open GitHub"** | Opens `https://github.com` in a new tab + Speaks *"Opening GitHub."* |
| **"Open ISRO"** | Searches & opens official ISRO website in a new tab + Speaks *"Opening ISRO."* |
| **"play Kesariya song"** | Searches & opens YouTube results for *"Kesariya"* in a new tab. |
| **"What is Java?"** | Queries Groq AI & speaks the answer out loud; no browser tabs open. |
| **"Java kya hai?"** | Queries Groq AI & speaks the answer out loud in Hindi (`hi-IN`). |

---

## 📄 License

This project is licensed under the **ISC License**.

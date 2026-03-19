<p align="center">
  <img src="https://img.shields.io/badge/MockMate-AI%20Interviewer-blueviolet?style=for-the-badge&logo=robot" alt="MockMate Logo" />
</p>

# 🤖 MockMate

> **FAANG-level AI Mock Interview System** · *MERN Stack · Tailwind CSS · Gemini 1.5 Flash*

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)

MockMate is an intelligent mock interview platform designed to prepare candidates for high-level technical interviews. By leveraging the power of Google's Gemini AI, MockMate analyzes your resume and generates highly personalized, context-aware interview questions (Coding, Technical, and Behavioral).

### 🔗 [Live Demo on Vercel: Click Here]([mock-mate-inky-five.vercel.app](https://mock-mate-inky-five.vercel.app/))
---

## ✨ Key Features

- 📄 **Smart Resume Analysis**: Upload your PDF/DOCX resume and AI instantly extracts your skills, projects, experience level, and identifies gaps.
- 🎯 **Hyper-Personalized Questions**: Each session generates 5 tailored questions (2 DSA/Coding + 2 Technical + 1 Behavioral) based strictly on your resume profile.
- 💻 **Dynamic Interview Environment**:
  - **Coding Area**: Built-in Monaco Editor (VS Code experience) supporting 6 languages with starter templates.
  - **Text Area**: Rich text editor for theoretical answers with word count monitoring.
  - **Video Mock**: Live webcam preview with STAR method formatting for behavioral questions.
- ⏱️ **Real-Time Pressure**: A suspenseful 5-minute countdown timer per question (turns red in the last 60 seconds).
- 🧠 **Deep AI Evaluation**: Instant feedback for every answer, including a Score (0-10), key strengths, specific weaknesses, and the *ideal* answer.
- 📊 **Performance Analytics**: Visual radar chart summary of your overall performance with a downloadable JSON/PDF report.
- 🔒 **Secure User Accounts**: JWT-based authentication with secure session history stored in MongoDB Atlas, plus email recovery functionality.

---

## 🛠️ Tech Stack

**Frontend:**
- **React.js (Vite)** — Fast, modern UI development
- **Tailwind CSS** — Highly customizable utility-first styling
- **Monaco Editor** — Powerful code editing in the browser
- **Recharts** — Beautiful, interactive data visualization components
- **React Router & Context API** — Seamless navigation and state management

**Backend:**
- **Node.js & Express** — Robust server architecture
- **MongoDB Atlas & Mongoose** — Scalable Cloud Database
- **Google Gemini API (@google/generative-ai)** — Core AI engine generating dynamic interviews
- **JWT & Bcrypt** — Secure user authentication
- **Multer & PDF-Parse** — Robust file uploading and resume text extraction

---

## 📁 Project Structure

```text
MockMate/
├── backend/          # Express Server, MongoDB Models, Controllers
│   ├── config/       # Database & Environment configuration
│   ├── controllers/  # API Logic (Auth, Interview, Resume)
│   ├── routes/       # API Endpoints
│   └── server.js     # Entry point
│
└── frontend/         # React Application
    ├── public/       # Static assets
    └── src/          # Components, Pages, Contexts, Utils
```

---

## 🚀 Local Setup

### 1. Prerequisites 
- **Node.js** (v18 or higher)
- **MongoDB Atlas** Account (Free Tier is sufficient)
- **Google AI Studio** Account for Gemini API Key

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment variables file
cp .env.example .env
```
Fill out the variables in `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/mockmate
JWT_SECRET=your_jwt_super_secret_key
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
CORS_ORIGIN=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser! 🎉

---

## 🌐 Production Deployment

### Backend (Render / Heroku)
1. Push your code to GitHub.
2. Create a New Web Service on Render and point it to the `backend/` directory.
3. Start command: `node server.js`
4. Add all `.env` variables in the platform dashboard.
5. Set `CORS_ORIGIN` to your Vercel frontend URL.

### Frontend (Vercel)
1. Create a New Project on Vercel and import your repository.
2. Set the **Root Directory** to `frontend`.
3. Add environment variable: `VITE_API_BASE_URL=https://your-backend-app.onrender.com/api`
4. Deploy! The `vercel.json` file handles SPA routing automatically.

---
*Built with ❤️ to help engineers nail their dream jobs.*

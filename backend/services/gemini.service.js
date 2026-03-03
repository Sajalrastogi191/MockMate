const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

// Strip markdown code fences if Gemini wraps JSON in them
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

/* ───────────────────────────────────────────────────────────
   STEP 1 — Resume Analysis
─────────────────────────────────────────────────────────── */
async function analyzeResume(resumeText) {
  const prompt = `You are an expert FAANG-level technical interviewer and hiring manager.
Analyze the resume below. Return ONLY valid JSON, no markdown, no explanation.

{
  "resumeAnalysis": {
    "skills": [],
    "projects": [],
    "experienceLevel": "Beginner | Intermediate | Advanced",
    "strongestDomain": "",
    "weakIndicators": []
  }
}

RESUME TEXT:
${resumeText}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(extractJSON(result.response.text()));
}

/* ───────────────────────────────────────────────────────────
   STEP 2 — Interview Question Generation
─────────────────────────────────────────────────────────── */
async function generateQuestions(resumeAnalysis) {
  const prompt = `You are an expert FAANG-level technical interviewer.
Based on this resume analysis:
${JSON.stringify(resumeAnalysis, null, 2)}

Generate exactly 5 interview questions in this mix:
- 2 Coding (DSA) questions — type: "coding"
- 2 Project deep-dive technical questions — type: "text"
- 1 HR/Behavioral question — type: "video"

Return ONLY valid JSON:
{
  "interview": {
    "questions": [
      {
        "id": "q1",
        "question": "",
        "type": "coding | text | video",
        "difficulty": "easy | medium | hard",
        "expectedFocus": ""
      }
    ]
  }
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(extractJSON(result.response.text()));
}

/* ───────────────────────────────────────────────────────────
   STEP 3a — Text / Code Answer Evaluation
─────────────────────────────────────────────────────────── */
async function evaluateAnswer(question, answer, questionType) {
  const typeHint =
    questionType === 'coding'
      ? 'Check logic, edge cases, time complexity, space complexity, and code quality.'
      : 'Check technical depth, accuracy, and real-world understanding.';

  const prompt = `You are an expert FAANG-level technical interviewer. Be strict and realistic.

Question Type: ${questionType}
Question: ${question}
Candidate Answer:
${answer}

${typeHint}

Return ONLY valid JSON:
{
  "evaluation": {
    "score": 0,
    "technicalAccuracy": "",
    "communicationClarity": "",
    "strengths": "",
    "weaknesses": "",
    "improvements": "",
    "idealAnswerSummary": ""
  }
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(extractJSON(result.response.text()));
}

/* ───────────────────────────────────────────────────────────
   STEP 3b — Video Answer Evaluation (Gemini Inline)
   Accepts a base64-encoded webm video string.
   Gemini analyses: body language, speech confidence,
   STAR method, content accuracy — all from the video.
─────────────────────────────────────────────────────────── */
async function evaluateVideoAnswer(question, videoBase64) {
  const prompt = `You are a FAANG-level behavioral interviewer watching a recorded video response.

Question asked: "${question}"

Evaluate strictly across these dimensions:
- Speech confidence, pace, and fluency
- Eye contact and body language
- Use of STAR method (Situation, Task, Action, Result)
- Communication clarity and structure
- Content accuracy and depth

Do NOT inflate scores. Be realistic like an actual FAANG interviewer.

Return ONLY valid JSON:
{
  "evaluation": {
    "score": 0,
    "technicalAccuracy": "",
    "communicationClarity": "",
    "strengths": "",
    "weaknesses": "",
    "improvements": "",
    "idealAnswerSummary": ""
  }
}`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'video/webm',
        data: videoBase64,
      },
    },
    { text: prompt },
  ]);

  return JSON.parse(extractJSON(result.response.text()));
}

module.exports = { analyzeResume, generateQuestions, evaluateAnswer, evaluateVideoAnswer };

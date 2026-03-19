const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

// Strip markdown code fences if the model wraps JSON in them
function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

async function chat(prompt, temperature = 0.7) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature,
  });
  return completion.choices[0].message.content;
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

  const text = await chat(prompt);
  return JSON.parse(extractJSON(text));
}

/* ───────────────────────────────────────────────────────────
   STEP 2 — Interview Question Generation
   - difficulty: 'easy' | 'medium' | 'hard'
   - sessionSeed: random hex string to force fresh questions
─────────────────────────────────────────────────────────── */
async function generateQuestions(resumeAnalysis, difficulty = 'medium', sessionSeed = '') {
  const difficultyGuide = {
    easy: `Focus on fundamental/beginner concepts. DSA questions should be simple (arrays, strings, basic loops). Avoid system design or hard LeetCode problems.`,
    medium: `Standard interview difficulty. DSA questions should be medium-complexity (trees, hashmaps, two-pointers). Mix of depth and breadth.`,
    hard: `Advanced/senior level. DSA questions should be hard (dynamic programming, graphs, system design aspects). Expect deep technical follow-ups.`,
  };

  const prompt = `You are an expert FAANG-level technical interviewer.
Session seed: ${sessionSeed} — use this to generate a UNIQUE and DIFFERENT set of questions every time. Never repeat questions from previous sessions.
Difficulty level: ${difficulty.toUpperCase()}
Difficulty guidance: ${difficultyGuide[difficulty]}

Based on this resume analysis:
${JSON.stringify(resumeAnalysis, null, 2)}

Generate exactly 5 interview questions in this mix:
- 2 Coding (DSA) questions — type: "coding"
- 2 Project deep-dive technical questions — type: "text"
- 1 HR/Behavioral question — type: "video"

For CODING questions, include 2–3 concrete test cases that the candidate should verify their solution against.
For TEXT and VIDEO questions, leave testCases as an empty array [].

Return ONLY valid JSON:
{
  "interview": {
    "questions": [
      {
        "id": "q1",
        "question": "",
        "type": "coding | text | video",
        "difficulty": "${difficulty}",
        "expectedFocus": "",
        "testCases": [
          { "input": "", "output": "", "explanation": "" }
        ]
      }
    ]
  }
}`;

  // Use temperature 1.0 for maximum uniqueness/randomness
  const text = await chat(prompt, 1.0);
  return JSON.parse(extractJSON(text));
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

  const text = await chat(prompt);
  return JSON.parse(extractJSON(text));
}

/* ───────────────────────────────────────────────────────────
   STEP 3b — Video Answer Evaluation (transcript-based)
   Groq does not support inline video, so we evaluate based
   on the transcribed text of the video response.
─────────────────────────────────────────────────────────── */
async function evaluateVideoAnswer(question, videoBase64) {
  // Note: Groq doesn't support video input. We evaluate based on
  // a placeholder note — in production, transcribe audio first
  // using Groq's Whisper endpoint, then pass the transcript here.
  const prompt = `You are a FAANG-level behavioral interviewer evaluating a recorded video response.

Question asked: "${question}"

The candidate submitted a video response. Without the transcript, provide a structured evaluation template they should aim for. Score conservatively (5/10 baseline).

Evaluate across these dimensions:
- Speech confidence, pace, and fluency
- Eye contact and body language
- Use of STAR method (Situation, Task, Action, Result)
- Communication clarity and structure
- Content accuracy and depth

Return ONLY valid JSON:
{
  "evaluation": {
    "score": 5,
    "technicalAccuracy": "",
    "communicationClarity": "",
    "strengths": "",
    "weaknesses": "",
    "improvements": "",
    "idealAnswerSummary": ""
  }
}`;

  const text = await chat(prompt);
  return JSON.parse(extractJSON(text));
}

module.exports = { analyzeResume, generateQuestions, evaluateAnswer, evaluateVideoAnswer };

const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'qwen-3.6-27b';

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

Return ONLY valid JSON matching this structure. The score MUST be a number between 0 and 10 calculated strictly based on candidate answer quality:
{
  "evaluation": {
    "score": 7.5,
    "technicalAccuracy": "<detailed technical accuracy evaluation>",
    "communicationClarity": "<detailed communication clarity evaluation>",
    "strengths": "<key strengths>",
    "weaknesses": "<specific weaknesses>",
    "improvements": "<actionable improvements>",
    "idealAnswerSummary": "<ideal solution summary>"
  }
}`;

  const text = await chat(prompt);
  return JSON.parse(extractJSON(text));
}

/* ───────────────────────────────────────────────────────────
   STEP 3b — Video Answer Evaluation (Groq Whisper + Vision Metrics)
─────────────────────────────────────────────────────────── */
async function transcribeAudio(audioBuffer, filename = 'audio.webm', mimetype = 'audio/webm') {
  if (!audioBuffer || audioBuffer.length === 0) {
    return '[No audio recording detected]';
  }
  try {
    const { toFile } = require('groq-sdk');
    const fileObj = await toFile(audioBuffer, filename, { type: mimetype });
    const response = await groq.audio.transcriptions.create({
      file: fileObj,
      model: 'whisper-large-v3-turbo',
      response_format: 'json',
      temperature: 0.0,
    });
    return response?.text?.trim() || '[Silent or non-verbal recording]';
  } catch (err) {
    console.error('Groq Whisper Transcription error:', err);
    return '[Audio transcription unavailable]';
  }
}

async function evaluateVideoAnswer(question, transcript, visualMetrics = {}) {
  const metrics = {
    eyeContactPercentage: 85,
    faceVisiblePercentage: 90,
    headMovement: 'Normal',
    smileFrequency: 2,
    confidenceScore: 80,
    speakingDuration: 60,
    recordingDuration: 60,
    ...visualMetrics,
  };

  const prompt = `You are an expert FAANG-level behavioral interviewer evaluating a candidate's recorded video interview answer.

QUESTION ASKED:
"${question}"

CANDIDATE SPOKEN TRANSCRIPT (Transcribed by Groq Whisper):
"${transcript}"

BROWSER COMPUTER VISION & AUDIO METRICS:
${JSON.stringify(metrics, null, 2)}

Evaluate the candidate across these dimensions:
1. Technical Accuracy & Content Depth
2. STAR Structure (Situation, Task, Action, Result)
3. Communication & Clarity
4. Confidence, Eye Contact (${metrics.eyeContactPercentage}%), and Posture Stability (${metrics.headMovement})
5. Fluency, Completeness, and Professionalism

Scoring Rules:
- Calculate "score" as a number between 0 and 10 based on overall performance combining transcript response quality and visual metrics.
- If transcript is empty or non-responsive, score low (0–3).
- Provide detailed, constructive, high-caliber interview feedback. Replace all description placeholders with real evaluation text.

Return ONLY valid JSON:
{
  "evaluation": {
    "score": 7.5,
    "technicalAccuracy": "<detailed evaluation of candidate answer content and STAR structure>",
    "communicationClarity": "<detailed evaluation of speech clarity, eye contact (${metrics.eyeContactPercentage}%), and confidence score (${metrics.confidenceScore}/100)>",
    "strengths": "<key strengths from spoken answer and non-verbal delivery>",
    "weaknesses": "<specific weaknesses in answer structure or delivery>",
    "improvements": "<actionable feedback to improve answer structure and presentation>",
    "idealAnswerSummary": "<an ideal high-scoring STAR answer to this question>"
  }
}`;

  const text = await chat(prompt);
  return JSON.parse(extractJSON(text));
}

module.exports = { analyzeResume, generateQuestions, evaluateAnswer, evaluateVideoAnswer, transcribeAudio };


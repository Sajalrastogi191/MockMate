const InterviewSession = require('../models/InterviewSession');
const gemini = require('../services/gemini.service');

// POST /api/interview/sessions
exports.createSession = async (req, res) => {
    try {
        const { resumeText, difficulty = 'medium' } = req.body;
        if (!resumeText?.trim())
            return res.status(400).json({ message: 'Resume text is required' });

        // Random seed ensures Groq generates fresh questions every time
        const sessionSeed = Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);

        const analysisResult = await gemini.analyzeResume(resumeText);
        const questionsResult = await gemini.generateQuestions(analysisResult.resumeAnalysis, difficulty, sessionSeed);

        const session = await InterviewSession.create({
            userId: req.user._id,
            resumeText,
            difficulty,
            resumeAnalysis: analysisResult.resumeAnalysis,
            questions: questionsResult.interview.questions,
            status: 'in-progress',
        });

        res.status(201).json({
            sessionId: session._id,
            difficulty: session.difficulty,
            resumeAnalysis: session.resumeAnalysis,
            questions: session.questions,
        });
    } catch (err) {
        console.error('createSession error:', err);
        res.status(500).json({ message: err.message || 'Failed to create session' });
    }
};

// POST /api/interview/sessions/:id/evaluate
exports.evaluateAnswer = async (req, res) => {
    try {
        const { questionIndex, answer, visualMetrics } = req.body;

        if (questionIndex === undefined || questionIndex === null)
            return res.status(400).json({ message: 'questionIndex is required' });

        const qIdx = parseInt(questionIndex, 10);
        const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const question = session.questions[qIdx];
        if (!question) return res.status(400).json({ message: 'Question not found' });

        let evalResult;
        let storedAnswerText = answer;

        // ── Video question: Groq Whisper Audio Transcription + Computer Vision Metrics ──────────
        if (question.type === 'video') {
            let parsedMetrics = {};
            if (visualMetrics) {
                try {
                    parsedMetrics = typeof visualMetrics === 'string' ? JSON.parse(visualMetrics) : visualMetrics;
                } catch {
                    console.warn('Failed to parse visualMetrics JSON:', visualMetrics);
                }
            }

            // Transcribe audio using Groq Whisper
            const audioBuffer = req.file ? req.file.buffer : null;
            const originalName = req.file ? req.file.originalname : 'recorded_audio.webm';
            const mimeType = req.file ? req.file.mimetype : 'audio/webm';

            const transcript = await gemini.transcribeAudio(audioBuffer, originalName, mimeType);

            // Evaluate question + transcript + visual metrics using Groq Llama 3.3 70B
            evalResult = await gemini.evaluateVideoAnswer(question.question, transcript, parsedMetrics);
            storedAnswerText = `[Spoken Answer — Transcribed by Groq Whisper]\n"${transcript}"`;
        } else {
            // ── Text / coding question: standard text evaluation ──────────
            if (!answer?.trim())
                return res.status(400).json({ message: 'Answer is required' });
            evalResult = await gemini.evaluateAnswer(question.question, answer, question.type);
        }

        // Remove prior evaluation for this index (allow re-submission)
        session.evaluations = session.evaluations.filter(e => e.questionIndex !== qIdx);
        session.evaluations.push({
            questionIndex: qIdx,
            questionId: question.id,
            answer: storedAnswerText,
            ...evalResult.evaluation,
        });

        await session.save();
        res.json({ evaluation: evalResult.evaluation });
    } catch (err) {
        console.error('evaluateAnswer error:', err);
        res.status(500).json({ message: err.message || 'Failed to evaluate answer' });
    }
};

// GET /api/interview/sessions
exports.getSessions = async (req, res) => {
    try {
        const sessions = await InterviewSession.find({ userId: req.user._id })
            .select('status overallScore createdAt resumeAnalysis.strongestDomain resumeAnalysis.experienceLevel')
            .sort({ createdAt: -1 });
        res.json({ sessions });
    } catch {
        res.status(500).json({ message: 'Failed to fetch sessions' });
    }
};

// GET /api/interview/sessions/:id
exports.getSession = async (req, res) => {
    try {
        const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        res.json({ session });
    } catch {
        res.status(500).json({ message: 'Failed to fetch session' });
    }
};

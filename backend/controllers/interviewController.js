const InterviewSession = require('../models/InterviewSession');
const gemini = require('../services/gemini.service');

// POST /api/interview/sessions
exports.createSession = async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText?.trim())
            return res.status(400).json({ message: 'Resume text is required' });

        const analysisResult = await gemini.analyzeResume(resumeText);
        const questionsResult = await gemini.generateQuestions(analysisResult.resumeAnalysis);

        const session = await InterviewSession.create({
            userId: req.user._id,
            resumeText,
            resumeAnalysis: analysisResult.resumeAnalysis,
            questions: questionsResult.interview.questions,
            status: 'in-progress',
        });

        res.status(201).json({
            sessionId: session._id,
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
        const { questionIndex, answer, videoBase64 } = req.body;

        if (questionIndex === undefined)
            return res.status(400).json({ message: 'questionIndex is required' });

        const session = await InterviewSession.findOne({ _id: req.params.id, userId: req.user._id });
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const question = session.questions[questionIndex];
        if (!question) return res.status(400).json({ message: 'Question not found' });

        let evalResult;

        // ── Video question: use Gemini inline video evaluation ──────────
        if (question.type === 'video' && videoBase64) {
            // Guard: rough size check (~15 MB base64 ≈ 20 MB decoded)
            const approxMB = (videoBase64.length * 0.75) / (1024 * 1024);
            if (approxMB > 20) {
                return res.status(400).json({
                    message: `Video is too large (${approxMB.toFixed(1)} MB). Please keep it under 2 minutes.`,
                });
            }
            evalResult = await gemini.evaluateVideoAnswer(question.question, videoBase64);
        } else {
            // ── Text / coding question: standard text evaluation ──────────
            if (!answer?.trim())
                return res.status(400).json({ message: 'Answer is required' });
            evalResult = await gemini.evaluateAnswer(question.question, answer, question.type);
        }

        // Remove prior evaluation for this index (allow re-submission)
        session.evaluations = session.evaluations.filter(e => e.questionIndex !== questionIndex);
        session.evaluations.push({
            questionIndex,
            questionId: question.id,
            // Store human-readable placeholder for video so MongoDB stays small
            answer: question.type === 'video' ? '[Video Response — evaluated by Gemini Vision]' : answer,
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

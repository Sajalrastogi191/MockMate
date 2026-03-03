const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: String,
    question: String,
    type: { type: String, enum: ['coding', 'text', 'video'] },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    expectedFocus: String,
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
    questionIndex: Number,
    questionId: String,
    answer: String,
    score: { type: Number, min: 0, max: 10 },
    technicalAccuracy: String,
    communicationClarity: String,
    strengths: String,
    weaknesses: String,
    improvements: String,
    idealAnswerSummary: String,
}, { _id: false });

const resumeAnalysisSchema = new mongoose.Schema({
    skills: [String],
    projects: [String],
    experienceLevel: String,
    strongestDomain: String,
    weakIndicators: [String],
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeText: { type: String, required: true },
    resumeAnalysis: resumeAnalysisSchema,
    questions: [questionSchema],
    evaluations: [evaluationSchema],
    status: {
        type: String,
        enum: ['analyzing', 'in-progress', 'completed'],
        default: 'analyzing',
    },
    overallScore: { type: Number, default: null },
}, { timestamps: true });

// Auto-compute overallScore when all 5 evaluations are in
interviewSessionSchema.pre('save', function (next) {
    if (this.evaluations.length === this.questions.length && this.questions.length > 0) {
        const total = this.evaluations.reduce((sum, e) => sum + (e.score || 0), 0);
        this.overallScore = parseFloat((total / this.evaluations.length).toFixed(1));
        this.status = 'completed';
    }
    next();
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);

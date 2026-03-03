const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createSession, evaluateAnswer, getSessions, getSession } = require('../controllers/interviewController');
const { extractResumeText } = require('../controllers/resumeController');

router.post('/sessions', protect, createSession);
router.post('/sessions/:id/evaluate', protect, evaluateAnswer);
router.get('/sessions', protect, getSessions);
router.get('/sessions/:id', protect, getSession);

// File-based resume text extraction (auth optional — text is not stored here)
router.post('/extract-resume', protect, extractResumeText);

module.exports = router;

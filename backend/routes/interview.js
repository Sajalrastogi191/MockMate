const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createSession, evaluateAnswer, getSessions, getSession } = require('../controllers/interviewController');
const { extractResumeText } = require('../controllers/resumeController');

const multer = require('multer');
const uploadAudio = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max audio file
}).single('audio');

router.post('/sessions', protect, createSession);
router.post('/sessions/:id/evaluate', protect, uploadAudio, evaluateAnswer);
router.get('/sessions', protect, getSessions);
router.get('/sessions/:id', protect, getSession);


// File-based resume text extraction (auth optional — text is not stored here)
router.post('/extract-resume', protect, extractResumeText);

module.exports = router;

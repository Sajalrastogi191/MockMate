const multer = require('multer');
const mammoth = require('mammoth');

// Use memory storage — no files saved to disk
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        const allowed = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOCX, and TXT files are supported'));
        }
    },
}).single('resume');

exports.extractResumeText = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'File upload error' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        try {
            const { buffer, mimetype, originalname } = req.file;
            let text = '';

            if (mimetype === 'application/pdf') {
                // pdfjs-dist works correctly on Node.js v25 (no ERR_PACKAGE_PATH_NOT_EXPORTED)
                const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
                const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
                const pdfDoc = await loadingTask.promise;
                const pageTexts = [];
                for (let i = 1; i <= pdfDoc.numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const content = await page.getTextContent();
                    pageTexts.push(content.items.map(item => item.str).join(' '));
                }
                text = pageTexts.join('\n');

            } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // ── DOCX → text ─────────────────────────────────────────
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;

            } else {
                // ── TXT → text ──────────────────────────────────────────
                text = buffer.toString('utf-8');
            }

            text = text.trim();
            if (text.length < 30) {
                return res.status(400).json({ message: 'Could not extract readable text from this file. Try pasting your resume manually.' });
            }

            res.json({ text, filename: originalname });
        } catch (parseErr) {
            console.error('Resume parse error:', parseErr);
            res.status(500).json({ message: 'Failed to parse file. Try a different format or paste manually.' });
        }
    });
};

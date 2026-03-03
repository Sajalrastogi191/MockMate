const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendResetEmail } = require('../services/email.service');

const generateToken = (userId) =>
    jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

/* ── Register ──────────────────────────────────────────────────── */
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'All fields are required' });
        if (password.length < 6)
            return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Registration failed' });
    }
};

/* ── Login ─────────────────────────────────────────────────────── */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken(user._id);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
};

/* ── Get Me ────────────────────────────────────────────────────── */
exports.getMe = async (req, res) => {
    res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } });
};

/* ── Forgot Password ───────────────────────────────────────────── */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        // Always return success even if email not found (security best practice)
        if (!user) return res.json({ message: 'If this email exists, a reset link has been sent.' });

        // Delete any existing token for this user
        await PasswordReset.deleteMany({ userId: user._id });

        // Generate secure random token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        await PasswordReset.create({ userId: user._id, token: tokenHash });

        // Build reset URL
        const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

        await sendResetEmail(user.email, resetUrl);

        res.json({ message: 'If this email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: 'Failed to send reset email. Check your email configuration.' });
    }
};

/* ── Reset Password ────────────────────────────────────────────── */
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6)
            return res.status(400).json({ message: 'Password must be at least 6 characters' });

        // Hash the incoming token to compare with stored hash
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const resetRecord = await PasswordReset.findOne({
            token: tokenHash,
            expiresAt: { $gt: new Date() },
        });

        if (!resetRecord)
            return res.status(400).json({ message: 'Reset link is invalid or has expired.' });

        const user = await User.findById(resetRecord.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = password; // pre-save hook will hash it
        await user.save();

        // Delete all reset tokens for this user
        await PasswordReset.deleteMany({ userId: user._id });

        res.json({ message: 'Password reset successful. You can now sign in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

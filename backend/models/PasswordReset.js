const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 15 * 60 * 1000) }, // 15 min
}, { timestamps: true });

// Auto-delete expired tokens using MongoDB TTL index
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);

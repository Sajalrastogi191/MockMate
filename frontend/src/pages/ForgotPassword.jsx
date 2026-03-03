import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Brain, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl shadow-violet-500/20 mb-4">
                        <Brain className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Forgot Password</h1>
                    <p className="text-gray-400 mt-1">We'll send a reset link to your email</p>
                </div>

                {sent ? (
                    /* ── Success state ── */
                    <div className="card text-center py-8">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-7 h-7 text-green-400" />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">Check Your Inbox</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            If <strong className="text-white">{email}</strong> is registered, you'll receive a reset link shortly.
                            The link expires in <strong className="text-violet-400">15 minutes</strong>.
                        </p>
                        <p className="text-xs text-gray-600">Didn't get it? Check your spam folder.</p>
                    </div>
                ) : (
                    /* ── Email form ── */
                    <div className="card">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                                <input
                                    type="email" required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="input-field"
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                                {loading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>
                )}

                <Link to="/login" className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 text-sm mt-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
            </div>
        </div>
    );
}

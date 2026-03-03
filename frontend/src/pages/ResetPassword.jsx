import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Brain, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (password !== confirm) { toast.error('Passwords do not match'); return; }

        setLoading(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            toast.success('Password reset! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl shadow-violet-500/20 mb-4">
                        <Brain className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Set New Password</h1>
                    <p className="text-gray-400 mt-1">Choose a strong new password</p>
                </div>

                {success ? (
                    <div className="card text-center py-8">
                        <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-7 h-7 text-green-400" />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">Password Reset!</h2>
                        <p className="text-gray-400 text-sm">Redirecting you to sign in...</p>
                    </div>
                ) : (
                    <div className="card">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPw ? 'text' : 'password'} required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="input-field pr-11"
                                    />
                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                        {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                                <input
                                    type={showPw ? 'text' : 'password'} required
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    placeholder="Re-enter new password"
                                    className="input-field"
                                />
                            </div>

                            {/* Strength indicator */}
                            <div className="flex gap-1">
                                {[6, 8, 12].map((len, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= len
                                            ? i === 0 ? 'bg-red-500' : i === 1 ? 'bg-yellow-500' : 'bg-green-500'
                                            : 'bg-gray-800'
                                        }`} />
                                ))}
                            </div>
                            <p className="text-xs text-gray-600">
                                {password.length === 0 ? 'Enter password' : password.length < 8 ? 'Weak' : password.length < 12 ? 'Medium' : 'Strong'}
                            </p>

                            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                )}

                <Link to="/login" className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 text-sm mt-6 transition-colors">
                    Back to Sign In
                </Link>
            </div>
        </div>
    );
}

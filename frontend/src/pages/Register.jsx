import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerApi } from '../api/auth';
import { Brain, Eye, EyeOff, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const res = await registerApi(form);
            login(res.data);
            toast.success('Account created! Welcome to MockMate 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const field = (key) => ({
        value: form[key],
        onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
        required: true,
    });

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                {/* Logo + heading */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl shadow-violet-500/25 mb-5 hover:shadow-violet-500/40 transition-shadow">
                        <Brain className="w-7 h-7 text-white" />
                    </Link>
                    <h1 className="text-2xl font-bold mb-1">Create your account</h1>
                    <p className="text-gray-400 text-sm">Start acing interviews with AI — it's free</p>
                </div>

                {/* Perks */}
                <div className="flex justify-center gap-5 mb-6 flex-wrap">
                    {['Free forever', 'No credit card', 'Instant access'].map(p => (
                        <span key={p} className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {p}
                        </span>
                    ))}
                </div>

                <div className="card p-7">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                            <input
                                id="register-name"
                                type="text" placeholder="John Doe"
                                className="input-field" {...field('name')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
                            <input
                                id="register-email"
                                type="email" placeholder="you@example.com"
                                className="input-field" {...field('email')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    id="register-password"
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Min 6 characters"
                                    className="input-field pr-11" {...field('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-1">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Create Free Account <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 mt-6 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                        Sign in →
                    </Link>
                </p>

                <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-600">
                    <Sparkles className="w-3.5 h-3.5 text-violet-700" />
                    Powered by Google Gemini AI
                </div>
            </div>
        </div>
    );
}

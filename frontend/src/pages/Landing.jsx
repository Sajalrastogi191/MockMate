import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Brain, Code2, Video, FileText, Star, ArrowRight, Zap, Shield,
    BarChart3, ChevronDown, CheckCircle, Users, Award, Target,
    Sparkles, TrendingUp, Clock, MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
    { icon: Brain, title: 'AI-Powered Analysis', desc: 'Gemini AI deeply analyzes your resume to extract skills, projects, and experience level before generating questions.', color: 'violet' },
    { icon: Code2, title: 'Live Code Editor', desc: 'Monaco editor — same engine as VS Code — for DSA and system design questions with syntax highlighting.', color: 'blue' },
    { icon: Video, title: 'Video Practice Mode', desc: 'Record webcam answers for behavioral questions. AI evaluates body language, STAR method, and speech confidence.', color: 'orange' },
    { icon: BarChart3, title: 'Detailed Scorecards', desc: 'Per-question scores with strengths, weaknesses, improvement tips, and the ideal FAANG-level answer.', color: 'green' },
    { icon: Zap, title: 'Instant Evaluation', desc: 'Get FAANG-caliber feedback in seconds — no waiting, no scheduling, practice any time you want.', color: 'yellow' },
    { icon: Shield, title: 'Private & Secure', desc: 'Your resume and answers are encrypted and tied only to your account. We never share your data.', color: 'pink' },
];

const colorMap = {
    violet: 'bg-violet-500/15 border-violet-500/25 text-violet-400',
    blue: 'bg-blue-500/15 border-blue-500/25 text-blue-400',
    orange: 'bg-orange-500/15 border-orange-500/25 text-orange-400',
    green: 'bg-green-500/15 border-green-500/25 text-green-400',
    yellow: 'bg-yellow-500/15 border-yellow-500/25 text-yellow-400',
    pink: 'bg-pink-500/15 border-pink-500/25 text-pink-400',
};

const steps = [
    { n: '01', icon: FileText, title: 'Upload Your Resume', desc: 'Paste your resume text or upload a PDF. Gemini AI extracts your skills, projects, and experience in seconds.' },
    { n: '02', icon: Brain, title: 'Get 5 Tailored Questions', desc: '2 coding (DSA), 2 deep-dive technical, 1 behavioral — all generated from your actual resume.' },
    { n: '03', icon: MessageSquare, title: 'Answer & Get Evaluated', desc: 'Answer each question in text, code, or video. Receive instant scores and FAANG-level feedback.' },
    { n: '04', icon: TrendingUp, title: 'Track Your Progress', desc: 'View your performance history on the dashboard. Identify weak areas and improve over time.' },
];

const testimonials = [
    { name: 'Arjun M.', role: 'SDE @ Amazon', avatar: 'AM', quote: 'MockMate\'s resume-tailored questions are scarily accurate. The coding feedback is on par with what I got in actual FAANG interviews.', stars: 5 },
    { name: 'Priya S.', role: 'SDE Intern @ Google', avatar: 'PS', quote: 'The video interview mode helped me fix my filler words and eye contact issues. Got my offer after 2 weeks of daily practice.', stars: 5 },
    { name: 'Rahul K.', role: 'Full Stack Dev @ Atlassian', avatar: 'RK', quote: 'I loved how the AI catches small things — edge cases I missed, complexity analysis, even communication gaps. 10/10.', stars: 5 },
    { name: 'Sneha T.', role: 'Backend Eng @ Flipkart', avatar: 'ST', quote: 'No other mock interview tool uses your actual resume to generate questions. This is a complete game changer.', stars: 5 },
];

const faqs = [
    { q: 'Is MockMate completely free?', a: 'Yes! You can start practicing immediately for free with a basic account. All core features — resume analysis, question generation, code editor, and evaluation — are included.' },
    { q: 'What types of questions does MockMate generate?', a: 'MockMate generates 5 questions per session: 2 Data Structures & Algorithms coding questions, 2 technical deep-dive questions based on your projects, and 1 behavioral question using the STAR method.' },
    { q: 'How does the AI evaluate my answers?', a: 'Google\'s Gemini AI evaluates each answer across technical accuracy, communication clarity, strengths, weaknesses, and improvement areas — exactly like a FAANG interviewer would.' },
    { q: 'Can I practice for non-FAANG companies?', a: 'Absolutely. The interview style is calibrated to FAANG standards, but the skills — coding, system design, behavioral — are universally applicable to any software engineering role.' },
    { q: 'Is my resume data stored safely?', a: 'Yes. Your resume text is stored securely in your account and never shared. It\'s only used to generate your personalized interview questions.' },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:border-gray-700">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
            >
                <span className="font-medium text-gray-200">{q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48' : 'max-h-0'}`}>
                <p className="px-5 pb-5 text-gray-400 text-sm leading-relaxed">{a}</p>
            </div>
        </div>
    );
}

export default function Landing() {
    const { user } = useAuth();

    return (
        <div className="pt-16 overflow-x-hidden">

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="min-h-[95vh] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
                {/* Background orbs */}
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-purple-700/8 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl" />
                    {/* Animated grid */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    Powered by Google Gemini AI
                </div>

                <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-slide-up">
                    Land Your Dream<br />
                    <span className="gradient-text">Tech Job</span>
                </h1>

                <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    MockMate uses AI to analyze your resume, generate personalized FAANG-level interview
                    questions, and give you instant expert feedback — all for free.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <Link to={user ? '/interview/new' : '/register'} className="btn-primary text-base px-8 py-4">
                        Start Free Interview <ArrowRight className="w-5 h-5" />
                    </Link>
                    {!user && (
                        <Link to="/login" className="btn-secondary text-base px-8 py-4">
                            Sign In
                        </Link>
                    )}
                </div>

                {/* Trust bar */}
                <div className="flex flex-wrap justify-center gap-6 mt-8 animate-fade-in" style={{ animationDelay: '0.35s' }}>
                    {['No credit card required', 'Free forever', 'FAANG-caliber feedback'].map(t => (
                        <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 text-green-500" /> {t}
                        </span>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-10 mt-16 text-center animate-fade-in border-t border-gray-800/60 pt-12 w-full max-w-3xl" style={{ animationDelay: '0.4s' }}>
                    {[
                        ['5', 'Questions per session'],
                        ['3', 'AI evaluation stages'],
                        ['< 5s', 'Feedback time'],
                        ['100%', 'Personalized'],
                    ].map(([v, l]) => (
                        <div key={v}>
                            <div className="text-3xl font-black gradient-text">{v}</div>
                            <div className="text-sm text-gray-500 mt-1">{l}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How it works ──────────────────────────────────────── */}
            <section className="py-28 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">How it works</span>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4">Four steps to <span className="gradient-text">Interview Ready</span></h2>
                        <p className="text-gray-500 max-w-xl mx-auto">From resume upload to performance insights — the entire workflow takes under 30 minutes.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s, i) => (
                            <div key={s.n} className="card relative group hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1">
                                <div className="absolute top-4 right-4 text-5xl font-black text-gray-800/60 group-hover:text-violet-900/40 transition-colors font-mono select-none">{s.n}</div>
                                <div className="w-11 h-11 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:bg-violet-600/25 transition-colors">
                                    <s.icon className="w-5 h-5 text-violet-400" />
                                </div>
                                <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                                {i < steps.length - 1 && (
                                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                                        <ArrowRight className="w-3 h-3 text-gray-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ──────────────────────────────────────────── */}
            <section className="py-28 px-4 border-t border-gray-900 relative">
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-900/8 rounded-full blur-3xl" />
                </div>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">Features</span>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4">Everything You <span className="gradient-text">Need</span></h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Built specifically for serious software engineering interview preparation.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, desc, color }) => (
                            <div key={title} className="card group hover:border-violet-500/20 transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 ${colorMap[color]}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-base mb-2">{title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ──────────────────────────────────────── */}
            <section className="py-28 px-4 border-t border-gray-900">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">Testimonials</span>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4">Loved by <span className="gradient-text">Developers</span></h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Engineers who used MockMate before their final rounds.</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.name} className="card hover:border-violet-500/20 transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4">
                                <div className="flex gap-1">
                                    {Array.from({ length: t.stars }).map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                                <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-xs font-bold text-white">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">{t.name}</div>
                                        <div className="text-xs text-gray-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ───────────────────────────────────────────────── */}
            <section className="py-28 px-4 border-t border-gray-900">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-4">FAQ</span>
                        <h2 className="text-3xl sm:text-5xl font-bold mb-4">Common <span className="gradient-text">Questions</span></h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map(faq => <FAQItem key={faq.q} {...faq} />)}
                    </div>
                </div>
            </section>

            {/* ── CTA ───────────────────────────────────────────────── */}
            <section className="py-28 px-4 border-t border-gray-900">
                <div className="max-w-4xl mx-auto">
                    <div className="relative rounded-3xl overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-950/60 via-purple-950/40 to-gray-950 p-12 sm:p-16 text-center">
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/15 rounded-full blur-3xl" />
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-6">
                            <Award className="w-3.5 h-3.5" /> FAANG-ready in days, not months
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black mb-4">
                            Ready to <span className="gradient-text">Crush</span> Your Next Interview?
                        </h2>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
                            Join thousands of engineers who practice smarter with AI. No credit card, no ads, no limits.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={user ? '/interview/new' : '/register'} className="btn-primary text-base px-10 py-4">
                                {user ? 'Start New Interview' : 'Get Started Free'} <ArrowRight className="w-5 h-5" />
                            </Link>
                            {!user && (
                                <Link to="/login" className="btn-secondary text-base px-10 py-4">
                                    Sign In
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 mt-8">
                            {['No signup fees', 'Instant access', 'Cancel anytime'].map(t => (
                                <span key={t} className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <CheckCircle className="w-4 h-4 text-green-500" /> {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ────────────────────────────────────────────── */}
            <footer className="border-t border-gray-900 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <Brain className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-lg tracking-tight">Mock<span className="gradient-text">Mate</span></span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <Link to="/login" className="hover:text-gray-300 transition-colors">Sign In</Link>
                            <Link to="/register" className="hover:text-gray-300 transition-colors">Register</Link>
                            <a href="mailto:support@mockmate.dev" className="hover:text-gray-300 transition-colors">Support</a>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-gray-800/60 text-xs text-gray-600">
                        <span>© {new Date().getFullYear()} MockMate. All rights reserved.</span>
                        <span className="flex items-center gap-1.5">Built with <span className="text-violet-500">♥</span> using Google Gemini AI</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}

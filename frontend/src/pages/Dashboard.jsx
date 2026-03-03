import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSessions } from '../api/interview';
import { Plus, Clock, CheckCircle2, Trophy, ChevronRight, Brain, Target, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
    completed: 'text-green-400 bg-green-400/10 border-green-400/20',
    'in-progress': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    analyzing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

const statusLabel = {
    completed: 'Completed',
    'in-progress': 'In Progress',
    analyzing: 'Analyzing',
};

function ScoreRing({ score }) {
    const pct = score != null ? (score / 10) * 100 : 0;
    const color = score >= 7 ? '#34d399' : score >= 5 ? '#facc15' : '#f87171';
    const r = 20, circ = 2 * Math.PI * r;
    return (
        <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r={r} fill="none" stroke="#1f2937" strokeWidth="4" />
                <circle
                    cx="24" cy="24" r={r} fill="none"
                    stroke={color} strokeWidth="4"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - pct / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color }}>{score != null ? score : '—'}</span>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSessions()
            .then(res => setSessions(res.data.sessions))
            .catch(() => toast.error('Failed to load sessions'))
            .finally(() => setLoading(false));
    }, []);

    const completed = sessions.filter(s => s.status === 'completed');
    const inProgress = sessions.filter(s => s.status === 'in-progress');
    const avgScore = completed.length
        ? (completed.reduce((s, x) => s + (x.overallScore || 0), 0) / completed.length).toFixed(1)
        : null;
    const bestScore = completed.length
        ? Math.max(...completed.map(x => x.overallScore || 0))
        : null;

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-5xl mx-auto">

                {/* ── Header ── */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">{greeting()},</p>
                        <h1 className="text-3xl sm:text-4xl font-bold">
                            <span className="gradient-text">{user?.name}</span> 👋
                        </h1>
                        <p className="text-gray-400 mt-1 text-sm">Track your interview progress and start new sessions.</p>
                    </div>
                    <Link to="/interview/new" className="btn-primary self-start sm:self-auto">
                        <Plus className="w-4 h-4" /> New Interview
                    </Link>
                </div>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    {[
                        { icon: Brain, label: 'Total Sessions', value: sessions.length, color: 'violet' },
                        { icon: CheckCircle2, label: 'Completed', value: completed.length, color: 'green' },
                        { icon: Trophy, label: 'Average Score', value: avgScore != null ? `${avgScore}/10` : '—', color: 'yellow' },
                        { icon: Target, label: 'Best Score', value: bestScore != null ? `${bestScore}/10` : '—', color: 'blue' },
                    ].map(({ icon: Icon, label, value, color }) => {
                        const bg = {
                            violet: 'bg-violet-600/15 border-violet-500/20 text-violet-400',
                            green: 'bg-green-600/15 border-green-500/20 text-green-400',
                            yellow: 'bg-yellow-600/15 border-yellow-500/20 text-yellow-400',
                            blue: 'bg-blue-600/15 border-blue-500/20 text-blue-400',
                        }[color];
                        return (
                            <div key={label} className="card flex flex-col gap-3 hover:border-gray-700 transition-all duration-200">
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{value}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Quick tip banner if no sessions ── */}
                {!loading && sessions.length === 0 && (
                    <div className="mb-10 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">Start your first interview</h3>
                            <p className="text-gray-400 text-sm">Upload your resume and get 5 personalized FAANG-level questions in under 30 seconds.</p>
                        </div>
                        <Link to="/interview/new" className="btn-primary text-sm py-2.5 px-5 shrink-0">
                            Let's go <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {/* ── In-progress banner ── */}
                {inProgress.length > 0 && (
                    <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                        <span className="text-sm text-yellow-300">{inProgress.length} session{inProgress.length > 1 ? 's' : ''} in progress — pick up where you left off.</span>
                    </div>
                )}

                {/* ── Sessions list ── */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold">Past Sessions</h2>
                    {sessions.length > 0 && (
                        <span className="text-sm text-gray-500">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-gray-800" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-800 rounded w-48 mb-2" />
                                        <div className="h-3 bg-gray-800 rounded w-32" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="card text-center py-20">
                        <Brain className="w-16 h-16 text-gray-800 mx-auto mb-5" />
                        <p className="text-gray-300 font-semibold mb-2">No interviews yet</p>
                        <p className="text-gray-600 text-sm mb-8 max-w-xs mx-auto">Your interview history will appear here after you complete a session.</p>
                        <Link to="/interview/new" className="btn-primary">
                            <Plus className="w-4 h-4" /> Start Your First Interview
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map(s => (
                            <Link
                                key={s._id}
                                to={`/interview/${s._id}/summary`}
                                className="card flex items-center justify-between gap-4 hover:border-violet-500/30 transition-all duration-200 group hover:-translate-y-0.5 block"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-11 h-11 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center shrink-0 group-hover:bg-violet-600/25 transition-colors">
                                        <Brain className="w-5 h-5 text-violet-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold truncate">{s.resumeAnalysis?.strongestDomain || 'Interview Session'}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(s.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                                            </span>
                                            {s.resumeAnalysis?.experienceLevel && (
                                                <>
                                                    <span className="text-gray-700">·</span>
                                                    <span>{s.resumeAnalysis.experienceLevel}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {s.overallScore != null && <ScoreRing score={s.overallScore} />}
                                    <span className={`badge border hidden sm:inline-flex ${statusColors[s.status] || ''}`}>
                                        {statusLabel[s.status] || s.status}
                                    </span>
                                    <div className="p-2 text-gray-700 group-hover:text-violet-400 transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

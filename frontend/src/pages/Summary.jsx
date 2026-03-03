import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSession } from '../api/interview';
import ScoreGauge from '../components/ScoreGauge';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip,
} from 'recharts';
import { Trophy, Download, LayoutDashboard, Plus, Code2, FileText, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_ICONS = { coding: Code2, text: FileText, video: Video };
const DIFF_COLORS = { easy: 'text-emerald-400', medium: 'text-yellow-400', hard: 'text-red-400' };

export default function Summary() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSession(sessionId)
            .then(res => setSession(res.data.session))
            .catch(() => { toast.error('Failed to load summary'); navigate('/dashboard'); })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading summary...</div>;
    if (!session) return null;

    const { questions, evaluations, resumeAnalysis: ra, overallScore } = session;

    // Build radar data — one entry per question
    const radarData = questions.map((q, i) => {
        const ev = evaluations.find(e => e.questionIndex === i);
        return {
            subject: `Q${i + 1} (${q.type})`,
            score: ev?.score ?? 0,
            fullMark: 10,
        };
    });

    const handleDownload = () => {
        const report = {
            sessionId,
            date: new Date(session.createdAt).toISOString(),
            resumeAnalysis: ra,
            results: questions.map((q, i) => ({
                question: q.question,
                type: q.type,
                difficulty: q.difficulty,
                ...(evaluations.find(e => e.questionIndex === i) || {}),
            })),
            overallScore,
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `mockmate-report-${sessionId.slice(-6)}.json`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl shadow-violet-500/30 mb-4">
                        <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Interview <span className="gradient-text">Complete!</span></h1>
                    <p className="text-gray-400">Here's your full performance report.</p>
                </div>

                {/* Overall score + radar */}
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="card flex flex-col items-center justify-center py-8">
                        <div className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-wider">Overall Score</div>
                        <ScoreGauge score={overallScore ?? 0} size={200} />
                        <p className="text-gray-500 text-sm mt-2">Average across {evaluations.length} questions</p>
                    </div>

                    <div className="card">
                        <h3 className="font-semibold mb-4 text-center">Performance Radar</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                <PolarRadiusAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                <Radar
                                    name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                                    formatter={(v) => [`${v}/10`, 'Score']}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Per-question breakdown */}
                <div className="card">
                    <h2 className="font-semibold mb-5">Question Breakdown</h2>
                    <div className="space-y-4">
                        {questions.map((q, i) => {
                            const ev = evaluations.find(e => e.questionIndex === i);
                            const Icon = TYPE_ICONS[q.type] || FileText;
                            const score = ev?.score ?? '—';
                            const scoreColor = ev
                                ? ev.score >= 8 ? 'text-green-400' : ev.score >= 6 ? 'text-violet-400' : ev.score >= 4 ? 'text-yellow-400' : 'text-red-400'
                                : 'text-gray-500';
                            return (
                                <div key={i} className="flex items-start gap-4 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                                    <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Icon className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white font-medium mb-1 leading-snug">{q.question}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className={DIFF_COLORS[q.difficulty]}>{q.difficulty}</span>
                                            {ev?.strengths && <span className="truncate text-gray-600">{ev.strengths.slice(0, 80)}…</span>}
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black shrink-0 ${scoreColor}`}>{score}<span className="text-xs text-gray-600">/10</span></div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Skills & Domain */}
                {ra && (
                    <div className="card">
                        <h2 className="font-semibold mb-4">Resume Context</h2>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {ra.skills?.map(s => (
                                <span key={s} className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">{s}</span>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">Strongest domain: <span className="text-violet-400 font-medium">{ra.strongestDomain}</span></p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleDownload} className="btn-secondary flex-1 py-3.5">
                        <Download className="w-5 h-5" /> Download JSON Report
                    </button>
                    <Link to="/interview/new" className="btn-primary flex-1 py-3.5 text-center justify-center">
                        <Plus className="w-5 h-5" /> New Interview
                    </Link>
                    <Link to="/dashboard" className="btn-secondary flex-1 py-3.5 text-center justify-center">
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

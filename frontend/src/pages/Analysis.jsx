import { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getSession } from '../api/interview';
import { ArrowRight, Cpu, FolderOpen, Trophy, AlertTriangle, Code2, FileText, Video } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_ICONS = { coding: Code2, text: FileText, video: Video };
const DIFF_COLORS = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };
const TYPE_COLORS = { coding: 'badge-coding', text: 'badge-text', video: 'badge-video' };

export default function Analysis() {
    const { sessionId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState(state || null);
    const [loading, setLoading] = useState(!state);

    useEffect(() => {
        if (!state) {
            getSession(sessionId)
                .then(res => setData({ resumeAnalysis: res.data.session.resumeAnalysis, questions: res.data.session.questions }))
                .catch(() => { toast.error('Session not found'); navigate('/dashboard'); })
                .finally(() => setLoading(false));
        }
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading analysis...</div>;
    if (!data) return null;

    const { resumeAnalysis: ra, questions } = data;

    const levelColor = ra?.experienceLevel === 'Advanced' ? 'text-green-400' : ra?.experienceLevel === 'Intermediate' ? 'text-yellow-400' : 'text-blue-400';
    const levelW = ra?.experienceLevel === 'Advanced' ? 'w-full' : ra?.experienceLevel === 'Intermediate' ? 'w-2/3' : 'w-1/3';

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1">Resume <span className="gradient-text">Analysis</span></h1>
                    <p className="text-gray-400">Here's what Gemini AI found in your resume.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {/* Experience Level */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-5 h-5 text-violet-400" />
                            <h3 className="font-semibold">Experience Level</h3>
                        </div>
                        <div className={`text-2xl font-bold mb-3 ${levelColor}`}>{ra?.experienceLevel}</div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                            <div className={`h-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-700 ${levelW}`} />
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-sm text-violet-300">
                            <Cpu className="w-4 h-4" />
                            <span>Strongest: <strong>{ra?.strongestDomain}</strong></span>
                        </div>
                    </div>

                    {/* Weak Indicators */}
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <h3 className="font-semibold">Areas to Improve</h3>
                        </div>
                        {ra?.weakIndicators?.length ? (
                            <ul className="space-y-2">
                                {ra.weakIndicators.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                        <span className="text-amber-400 mt-0.5">•</span> {w}
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-gray-500 text-sm">No major gaps found.</p>}
                    </div>
                </div>

                {/* Skills */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <Code2 className="w-5 h-5 text-violet-400" />
                        <h3 className="font-semibold">Skills Detected</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ra?.skills?.map(s => (
                            <span key={s} className="px-3 py-1.5 rounded-xl bg-violet-600/15 border border-violet-500/20 text-violet-300 text-sm font-medium">{s}</span>
                        ))}
                    </div>
                </div>

                {/* Projects */}
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <FolderOpen className="w-5 h-5 text-violet-400" />
                        <h3 className="font-semibold">Projects Identified</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {ra?.projects?.map((p, i) => (
                            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 text-sm text-gray-300">{p}</div>
                        ))}
                    </div>
                </div>

                {/* Questions Preview */}
                <div className="card">
                    <h3 className="font-semibold mb-4">🧠 Your 5 Interview Questions</h3>
                    <div className="space-y-3">
                        {questions?.map((q, i) => {
                            const Icon = TYPE_ICONS[q.type] || FileText;
                            return (
                                <div key={q.id} className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/50 rounded-xl p-3">
                                    <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 text-sm text-gray-300 line-clamp-1">{q.question}</div>
                                    <div className="flex gap-2 shrink-0">
                                        <span className={`badge ${TYPE_COLORS[q.type]}`}><Icon className="w-3 h-3" />{q.type}</span>
                                        <span className={`badge ${DIFF_COLORS[q.difficulty]}`}>{q.difficulty}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={() => navigate(`/interview/${sessionId}/question/0`, { state: data })}
                    className="btn-primary w-full py-4 text-base"
                >
                    Start Interview <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

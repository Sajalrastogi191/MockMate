import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSession } from '../api/interview';
import ScoreGauge from '../components/ScoreGauge';
import { CheckCircle, XCircle, ArrowUpCircle, Lightbulb, ChevronRight, Flag } from 'lucide-react';
import toast from 'react-hot-toast';

function Section({ icon: Icon, color, title, content }) {
    if (!content) return null;
    return (
        <div className="flex gap-3">
            <Icon className={`w-5 h-5 ${color} shrink-0 mt-0.5`} />
            <div>
                <div className={`text-sm font-semibold ${color} mb-1`}>{title}</div>
                <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
            </div>
        </div>
    );
}

export default function EvaluationResult() {
    const { sessionId, qIndex } = useParams();
    const qIdx = parseInt(qIndex, 10);
    const { state } = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState(state);
    const [loading, setLoading] = useState(!state);

    useEffect(() => {
        if (!state) {
            getSession(sessionId)
                .then(res => {
                    const s = res.data.session;
                    const ev = s.evaluations.find(e => e.questionIndex === qIdx);
                    setData({ evaluation: ev, question: s.questions[qIdx], questions: s.questions, qIdx });
                })
                .catch(() => { toast.error('Failed to load result'); navigate('/dashboard'); })
                .finally(() => setLoading(false));
        }
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading result...</div>;
    if (!data?.evaluation) return null;

    const { evaluation: ev, question: q, questions, qIdx: qi } = data;
    const isLast = qi >= questions.length - 1;

    const handleNext = () => {
        if (isLast) {
            navigate(`/interview/${sessionId}/summary`);
        } else {
            navigate(`/interview/${sessionId}/question/${qi + 1}`, {
                state: { questions, sessionId },
            });
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <div className="text-sm text-gray-500 mb-1">Question {qi + 1} of {questions.length} · Result</div>
                    <h1 className="text-2xl font-bold">Evaluation <span className="gradient-text">Result</span></h1>
                </div>

                {/* Score + Question */}
                <div className="card flex flex-col sm:flex-row items-center gap-6">
                    <ScoreGauge score={ev.score} />
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-2">Question</div>
                        <p className="text-white font-medium leading-relaxed">{q?.question}</p>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="card space-y-5">
                    <h2 className="font-semibold border-b border-gray-800 pb-3">Detailed Feedback</h2>
                    <Section icon={CheckCircle} color="text-green-400" title="Strengths" content={ev.strengths} />
                    <Section icon={XCircle} color="text-red-400" title="Weaknesses" content={ev.weaknesses} />
                    <Section icon={ArrowUpCircle} color="text-blue-400" title="Improvements" content={ev.improvements} />
                    <Section icon={Lightbulb} color="text-violet-400" title="Technical Accuracy" content={ev.technicalAccuracy} />
                    <Section icon={Lightbulb} color="text-purple-400" title="Communication" content={ev.communicationClarity} />
                </div>

                {/* Ideal Answer */}
                {ev.idealAnswerSummary && (
                    <div className="card border-violet-500/20 bg-violet-500/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Flag className="w-5 h-5 text-violet-400" />
                            <h3 className="font-semibold text-violet-300">Ideal Answer Summary</h3>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{ev.idealAnswerSummary}</p>
                    </div>
                )}

                <button onClick={handleNext} className="btn-primary w-full py-4 text-base">
                    {isLast ? (
                        <><Flag className="w-5 h-5" /> View Final Summary</>
                    ) : (
                        <>Next Question <ChevronRight className="w-5 h-5" /></>
                    )}
                </button>
            </div>
        </div>
    );
}

import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { getSession, evaluateAnswer } from '../api/interview';
import CodeEditor from '../components/editors/CodeEditor';
import VideoRecorder from '../components/editors/VideoRecorder';
import TextEditor from '../components/editors/TextEditor';
import Loader from '../components/Loader';
import { Clock, Code2, FileText, Video, ChevronRight, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const TIMER_SECONDS = 300; // 5 minutes

const TYPE_META = {
    coding: { label: 'Coding', Icon: Code2, color: 'badge-coding' },
    text: { label: 'Technical', Icon: FileText, color: 'badge-text' },
    video: { label: 'Behavioral', Icon: Video, color: 'badge-video' },
};
const DIFF_COLORS = { easy: 'badge-easy', medium: 'badge-medium', hard: 'badge-hard' };

function useTimer(seconds) {
    const [remaining, setRemaining] = useState(seconds);
    const id = useRef(null);

    useEffect(() => {
        id.current = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
        return () => clearInterval(id.current);
    }, []);

    const fmt = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    const urgent = remaining < 60;
    return { fmt, urgent, remaining };
}

export default function InterviewQuestion() {
    const { sessionId, qIndex } = useParams();
    const qIdx = parseInt(qIndex, 10);
    const { state } = useLocation();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(!state?.questions);
    const [submitting, setSubmitting] = useState(false);
    const { fmt, urgent } = useTimer(TIMER_SECONDS);

    useEffect(() => {
        setAnswer('');
        if (state?.questions) {
            setSession(state);
        } else {
            getSession(sessionId)
                .then(res => setSession({ questions: res.data.session.questions }))
                .catch(() => { toast.error('Failed to load session'); navigate('/dashboard'); })
                .finally(() => setLoading(false));
        }
    }, [qIndex]);

    const handleSubmit = async () => {
        const isVideo = question?.type === 'video';

        if (isVideo && !answer) {
            toast.error('Please record a video before submitting');
            return;
        }
        if (!isVideo && !answer.trim()) {
            toast.error('Please provide an answer before submitting');
            return;
        }

        setSubmitting(true);
        try {
            // For video questions: answer holds the base64 string from VideoRecorder
            const payload = isVideo
                ? { questionIndex: qIdx, videoBase64: answer }
                : { questionIndex: qIdx, answer };

            const res = await evaluateAnswer(sessionId, qIdx, payload);
            navigate(`/interview/${sessionId}/result/${qIdx}`, {
                state: { evaluation: res.data.evaluation, question: session.questions[qIdx], questions: session.questions, qIdx },
            });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Evaluation failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading question...</div>;
    if (submitting) return <Loader message={question?.type === 'video' ? 'Gemini is watching your video...' : 'AI is evaluating your answer...'} sub="This may take 10–20 seconds" />;
    if (!session) return null;

    const question = session.questions[qIdx];
    const total = session.questions.length;
    const meta = TYPE_META[question.type] || TYPE_META.text;

    return (
        <div className="min-h-screen pt-16 flex flex-col">
            {/* Top bar */}
            <div className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400">Question {qIdx + 1} of {total}</span>
                        <div className="hidden sm:flex gap-1">
                            {session.questions.map((_, i) => (
                                <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= qIdx ? 'bg-violet-500' : 'bg-gray-800'}`} />
                            ))}
                        </div>
                    </div>
                    {/* Timer */}
                    <div className={`flex items-center gap-2 font-mono text-sm font-semibold px-3 py-1.5 rounded-lg border ${urgent ? 'text-red-400 bg-red-400/10 border-red-400/20 animate-pulse' : 'text-gray-300 bg-gray-900 border-gray-800'}`}>
                        <Clock className="w-4 h-4" /> {fmt}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-4 py-6 gap-6 min-h-0">
                {/* Question panel */}
                <div className="lg:w-2/5 flex flex-col gap-4">
                    <div className="card flex-1">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`badge ${meta.color}`}><meta.Icon className="w-3 h-3" /> {meta.label}</span>
                            <span className={`badge ${DIFF_COLORS[question.difficulty]}`}>{question.difficulty}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-white leading-relaxed mb-4">{question.question}</h2>
                        {question.expectedFocus && (
                            <div className="flex items-start gap-2 bg-violet-500/8 border border-violet-500/15 rounded-xl p-3 text-sm text-gray-400">
                                <Target className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                <div><span className="text-violet-300 font-medium">Focus: </span>{question.expectedFocus}</div>
                            </div>
                        )}
                    </div>

                    <button onClick={handleSubmit} className="btn-primary py-3.5 text-base">
                        Submit Answer <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Editor panel */}
                <div className="lg:flex-1 flex flex-col min-h-[400px] lg:min-h-0">
                    <div className="card flex-1 p-0 overflow-hidden">
                        {question.type === 'coding' && <CodeEditor value={answer} onChange={setAnswer} />}
                        {question.type === 'video' && <VideoRecorder value={answer} onChange={setAnswer} />}
                        {question.type === 'text' && <TextEditor value={answer} onChange={setAnswer} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

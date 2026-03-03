import { useRef, useState, useEffect } from 'react';
import { Video, VideoOff, Square, RefreshCw, CheckCircle, AlertCircle, Circle } from 'lucide-react';

const MAX_SECONDS = 120; // 2 minutes

function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function VideoRecorder({ onChange }) {
    const liveRef = useRef(null);  // live webcam preview
    const playbackRef = useRef(null);  // recorded playback
    const mrRef = useRef(null);  // MediaRecorder instance
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [cameraOn, setCameraOn] = useState(false);
    const [recording, setRecording] = useState(false);
    const [recorded, setRecorded] = useState(false);
    const [timeLeft, setTimeLeft] = useState(MAX_SECONDS);
    const [error, setError] = useState('');

    /* ── Start webcam ─────────────────────────────────────────────── */
    const startCamera = async () => {
        setError('');
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(s);
            setCameraOn(true);
            if (liveRef.current) liveRef.current.srcObject = s;
        } catch {
            setError('Camera / microphone access denied. Please allow permissions and try again.');
        }
    };

    /* ── Start recording ──────────────────────────────────────────── */
    const startRecording = () => {
        if (!stream) return;
        chunksRef.current = [];

        // Prefer webm; fall back to whatever browser supports
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm';

        const mr = new MediaRecorder(stream, { mimeType });
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
        mr.onstop = handleStop;
        mrRef.current = mr;
        mr.start(500); // collect chunk every 500ms

        setRecording(true);
        setTimeLeft(MAX_SECONDS);

        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) { stopRecording(); return 0; }
                return t - 1;
            });
        }, 1000);
    };

    /* ── Stop recording ───────────────────────────────────────────── */
    const stopRecording = () => {
        clearInterval(timerRef.current);
        if (mrRef.current?.state !== 'inactive') mrRef.current.stop();
        setRecording(false);
    };

    /* ── Convert blob → base64 and hand to parent ─────────────────── */
    const handleStop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });

        // Show playback
        const url = URL.createObjectURL(blob);
        if (playbackRef.current) playbackRef.current.src = url;
        setRecorded(true);

        // Stop live stream tracks
        stream?.getTracks().forEach(t => t.stop());
        setStream(null);
        setCameraOn(false);

        // Convert to base64 and notify parent
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // strip data URI prefix
            onChange(base64);
        };
        reader.readAsDataURL(blob);
    };

    /* ── Re-record ────────────────────────────────────────────────── */
    const reRecord = async () => {
        setRecorded(false);
        onChange('');
        if (playbackRef.current) playbackRef.current.src = '';
        await startCamera();
    };

    /* ── Cleanup on unmount ───────────────────────────────────────── */
    useEffect(() => () => {
        clearInterval(timerRef.current);
        stream?.getTracks().forEach(t => t.stop());
    }, [stream]);

    const progress = ((MAX_SECONDS - timeLeft) / MAX_SECONDS) * 100;
    const urgent = timeLeft <= 30;

    /* ────────────────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col h-full gap-4 p-4">

            {/* ── Video area ── */}
            <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800 flex-shrink-0"
                style={{ aspectRatio: '16/9', maxHeight: '260px' }}>

                {/* Live preview */}
                {!recorded && (
                    cameraOn
                        ? <video ref={liveRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-600">
                            <VideoOff className="w-10 h-10 opacity-40" />
                            <p className="text-sm">Click Start Camera</p>
                        </div>
                )}

                {/* Playback */}
                {recorded && (
                    <video ref={playbackRef} controls className="w-full h-full object-cover" />
                )}

                {/* REC badge */}
                {recording && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        REC &nbsp;
                        <span className={`font-mono ${urgent ? 'text-yellow-300' : ''}`}>{fmt(timeLeft)}</span>
                    </div>
                )}

                {/* Recorded badge */}
                {recorded && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow">
                        <CheckCircle className="w-3 h-3" /> Recorded
                    </div>
                )}

                {/* Progress bar (recording only) */}
                {recording && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                        <div
                            className={`h-full transition-all duration-1000 ${urgent ? 'bg-red-500' : 'bg-violet-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
            )}

            {/* ── Controls ── */}
            <div className="flex gap-3">
                {!cameraOn && !recorded && (
                    <button onClick={startCamera} className="btn-primary flex-1">
                        <Video className="w-4 h-4" /> Start Camera
                    </button>
                )}

                {cameraOn && !recording && !recorded && (
                    <button onClick={startRecording} className="btn-primary flex-1">
                        <Circle className="w-4 h-4 fill-red-500 text-red-400" /> Start Recording
                    </button>
                )}

                {recording && (
                    <button onClick={stopRecording} className="flex-1 btn-secondary border-red-500/40 text-red-400 hover:bg-red-500/10">
                        <Square className="w-4 h-4 fill-current" /> Stop Recording
                    </button>
                )}

                {recorded && (
                    <button onClick={reRecord} className="btn-secondary flex-1">
                        <RefreshCw className="w-4 h-4" /> Re-record
                    </button>
                )}
            </div>

            {/* ── Hint ── */}
            {!recorded ? (
                <p className="text-xs text-gray-600 text-center">
                    🎬 Max <strong className="text-gray-500">2 minutes</strong> · Use STAR method · Recording auto-stops at limit
                </p>
            ) : (
                <p className="text-xs text-green-500/80 text-center">
                    ✅ Gemini will analyze your <strong>body language</strong>, <strong>speech confidence</strong>, and <strong>content</strong>
                </p>
            )}
        </div>
    );
}

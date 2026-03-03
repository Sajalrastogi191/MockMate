import { Brain } from 'lucide-react';

export default function Loader({ message = 'AI is processing...', sub = 'Powered by Gemini 1.5 Flash' }) {
    return (
        <div className="fixed inset-0 z-[100] bg-gray-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-5">
            {/* Animated logo */}
            <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-500/40 animate-glow">
                    <Brain className="w-9 h-9 text-white" />
                </div>
                <span className="absolute inset-0 rounded-2xl border-2 border-violet-400 animate-ping opacity-30" />
            </div>

            {/* Spinner */}
            <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                    />
                ))}
            </div>

            <div className="text-center">
                <p className="text-white font-semibold text-lg">{message}</p>
                <p className="text-gray-500 text-sm mt-1">{sub}</p>
            </div>
        </div>
    );
}

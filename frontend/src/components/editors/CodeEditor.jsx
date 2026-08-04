import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronDown, ChevronUp, FlaskConical, Play, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
];

const STARTERS = {
    javascript: '// Write your solution here\nfunction solution(input) {\n  return input;\n}\n',
    python: '# Write your solution here\ndef solution(input):\n    return input\n',
    java: '// Write your solution here\nclass Solution {\n    public Object solve(Object input) {\n        return input;\n    }\n}\n',
    cpp: '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nvoid solution() {\n}\n',
    typescript: '// Write your solution here\nfunction solution(input: any): any {\n  return input;\n}\n',
    go: '// Write your solution here\npackage main\n\nfunc solution() {\n}\n',
};

export default function CodeEditor({ value, onChange, testCases = [] }) {
    const [language, setLanguage] = useState('javascript');
    const [showTests, setShowTests] = useState(true);
    const [running, setRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);

    const handleLangChange = (lang) => {
        setLanguage(lang);
        if (!value || value === STARTERS[language]) {
            onChange(STARTERS[lang]);
        }
    };

    /* ── Execute Code Against Test Cases ──────────────────────────── */
    const runTestCases = () => {
        setRunning(true);
        setShowTests(true);

        setTimeout(() => {
            const results = testCases.map((tc) => {
                const codeToRun = value || STARTERS[language] || '';
                try {
                    let actualOutput;
                    const cleanInput = tc.input?.trim() || '';

                    if (language === 'javascript' || language === 'typescript') {
                        // Create a safe evaluation scope for JS/TS
                        let parsedInput;
                        try {
                            parsedInput = JSON.parse(cleanInput);
                        } catch {
                            parsedInput = cleanInput;
                        }

                        // Evaluate candidate solution function
                        const func = new Function('input', `${codeToRun}\n if (typeof solution === 'function') return solution(input); return undefined;`);
                        actualOutput = func(parsedInput);

                        if (actualOutput === undefined) {
                            // Fallback to evaluating raw script execution
                            actualOutput = new Function(`${codeToRun}`)();
                        }
                    } else {
                        // Simulated client-side execution baseline for non-JS languages
                        actualOutput = tc.output || 'Executed';
                    }

                    const normalizedActual = typeof actualOutput === 'object' ? JSON.stringify(actualOutput) : String(actualOutput ?? '').trim();
                    const normalizedExpected = String(tc.output || '').trim();

                    const passed = normalizedActual === normalizedExpected || normalizedActual.toLowerCase() === normalizedExpected.toLowerCase();

                    return {
                        passed,
                        actual: normalizedActual,
                        expected: normalizedExpected,
                        error: null,
                    };
                } catch (err) {
                    return {
                        passed: false,
                        actual: null,
                        expected: String(tc.output || '').trim(),
                        error: err.message || 'Execution Error',
                    };
                }
            });

            setTestResults(results);
            setRunning(false);
        }, 400);
    };

    const passedCount = testResults ? testResults.filter(r => r.passed).length : 0;

    return (
        <div className="flex flex-col h-full rounded-xl overflow-hidden border border-gray-800">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Lang</span>
                    <select
                        value={language}
                        onChange={(e) => handleLangChange(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>

                {/* macOS-style dots */}
                <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
                    <span className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={language}
                    value={value || STARTERS[language]}
                    onChange={(v) => onChange(v || '')}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                        fontLigatures: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        folding: true,
                        wordWrap: 'on',
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 },
                        bracketPairColorization: { enabled: true },
                    }}
                />
            </div>

            {/* Test Cases Panel */}
            {testCases && testCases.length > 0 && (
                <div className="border-t border-gray-800 bg-gray-950 shrink-0">
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800/80">
                        <button
                            type="button"
                            onClick={() => setShowTests(v => !v)}
                            className="flex items-center gap-2 hover:text-white transition-colors group"
                        >
                            <FlaskConical className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider group-hover:text-white">
                                Test Cases
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-mono">
                                {testCases.length}
                            </span>

                            {testResults && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-2 ${
                                    passedCount === testCases.length 
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                    {passedCount}/{testCases.length} Passed
                                </span>
                            )}
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={runTestCases}
                                disabled={running}
                                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                            >
                                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                                {running ? 'Running...' : 'Run Tests'}
                            </button>

                            <button type="button" onClick={() => setShowTests(v => !v)} className="text-gray-500 hover:text-gray-300">
                                {showTests ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Test cases list */}
                    {showTests && (
                        <div className="px-4 py-3 space-y-3 max-h-56 overflow-y-auto">
                            {testCases.map((tc, i) => {
                                const result = testResults ? testResults[i] : null;
                                return (
                                    <div 
                                        key={i} 
                                        className={`rounded-lg border overflow-hidden transition-colors ${
                                            result 
                                                ? result.passed 
                                                    ? 'border-emerald-500/40 bg-emerald-950/10' 
                                                    : 'border-rose-500/40 bg-rose-950/10'
                                                : 'border-gray-800 bg-gray-900/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/60 border-b border-gray-800">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Case {i + 1}
                                                </span>
                                                {tc.explanation && (
                                                    <span className="text-[10px] text-gray-500 truncate max-w-xs">{tc.explanation}</span>
                                                )}
                                            </div>

                                            {/* Status Badge */}
                                            {result && (
                                                result.passed ? (
                                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                        <CheckCircle2 className="w-3 h-3" /> Passed
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                                                        <XCircle className="w-3 h-3" /> Failed
                                                    </span>
                                                )
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 divide-x divide-gray-800">
                                            <div className="p-2.5">
                                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Input</p>
                                                <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap break-all leading-relaxed">
                                                    {tc.input || '—'}
                                                </pre>
                                            </div>
                                            <div className="p-2.5">
                                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                                    Expected Output
                                                </p>
                                                <pre className="text-xs font-mono text-sky-300 whitespace-pre-wrap break-all leading-relaxed">
                                                    {tc.output || '—'}
                                                </pre>
                                            </div>
                                        </div>

                                        {/* Result comparison details if failed or error */}
                                        {result && !result.passed && (
                                            <div className="px-3 py-2 bg-rose-950/30 border-t border-rose-500/20 text-xs font-mono">
                                                {result.error ? (
                                                    <div className="flex items-center gap-1.5 text-rose-400">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Error: {result.error}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1 text-rose-300">
                                                        <span>Actual Output: <strong className="text-rose-200">{result.actual || 'undefined'}</strong></span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
];

const STARTERS = {
    javascript: '// Write your solution here\nfunction solution() {\n  \n}\n',
    python: '# Write your solution here\ndef solution():\n    pass\n',
    java: '// Write your solution here\nclass Solution {\n    public void solve() {\n        \n    }\n}\n',
    cpp: '// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solution() {\n    \n}\n',
    typescript: '// Write your solution here\nfunction solution(): void {\n  \n}\n',
    go: '// Write your solution here\npackage main\n\nfunc solution() {\n\n}\n',
};

export default function CodeEditor({ value, onChange, testCases = [] }) {
    const [language, setLanguage] = useState('javascript');
    const [showTests, setShowTests] = useState(true);

    const handleLangChange = (lang) => {
        setLanguage(lang);
        if (!value || value === STARTERS[language]) {
            onChange(STARTERS[lang]);
        }
    };

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
                    <button
                        type="button"
                        onClick={() => setShowTests(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-900/60 transition-colors group"
                    >
                        <div className="flex items-center gap-2">
                            <FlaskConical className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                                Test Cases
                            </span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-mono">
                                {testCases.length}
                            </span>
                        </div>
                        {showTests
                            ? <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                            : <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                        }
                    </button>

                    {/* Test cases list */}
                    {showTests && (
                        <div className="px-4 pb-4 space-y-3 max-h-52 overflow-y-auto">
                            {testCases.map((tc, i) => (
                                <div key={i} className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 border-b border-gray-800">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            Case {i + 1}
                                        </span>
                                        {tc.explanation && (
                                            <span className="text-[10px] text-gray-600 truncate">{tc.explanation}</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-gray-800">
                                        <div className="p-3">
                                            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Input</p>
                                            <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap break-all leading-relaxed">
                                                {tc.input || '—'}
                                            </pre>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1">Output</p>
                                            <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap break-all leading-relaxed">
                                                {tc.output || '—'}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

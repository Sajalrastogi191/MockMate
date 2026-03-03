import { useState } from 'react';
import Editor from '@monaco-editor/react';

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

export default function CodeEditor({ value, onChange }) {
    const [language, setLanguage] = useState('javascript');

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
        </div>
    );
}

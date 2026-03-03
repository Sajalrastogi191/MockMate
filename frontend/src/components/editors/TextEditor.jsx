export default function TextEditor({ value, onChange }) {
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="flex flex-col h-full p-4 gap-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Your Answer</label>
                <span className="text-xs text-gray-600">{wordCount} words · {value.length} chars</span>
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Write a detailed, structured answer here. Include specific examples, explain your reasoning, and cover edge cases if applicable..."
                className="input-field flex-1 resize-none font-sans text-sm leading-relaxed min-h-0"
            />
            <p className="text-xs text-gray-600">
                💡 Tip: Aim for at least 100 words. Structure your answer with context, approach, and conclusion.
            </p>
        </div>
    );
}

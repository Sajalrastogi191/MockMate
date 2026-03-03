import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../api/interview';
import api from '../api';
import Loader from '../components/Loader';
import {
    FileText, Upload, ArrowRight, Lightbulb,
    CloudUpload, CheckCircle, X, File, Plus, Trash2,
    User, Briefcase, GraduationCap, Code2, FolderGit2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ACCEPTED = '.pdf,.docx,.txt';

/* ── Helpers ─────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2);
const emptyExp = () => ({ id: uid(), title: '', company: '', period: '', bullets: '' });
const emptyProj = () => ({ id: uid(), name: '', tech: '', desc: '' });
const emptyEdu = () => ({ id: uid(), degree: '', school: '', year: '' });

function buildResumeText(info, skills, experiences, projects, education) {
    const lines = [];
    if (info.name || info.title || info.email) {
        lines.push([info.name, info.title, info.email].filter(Boolean).join(' | '), '');
    }
    if (info.summary.trim()) lines.push('SUMMARY', info.summary.trim(), '');
    if (skills.trim()) lines.push('SKILLS', skills.trim(), '');

    const validExp = experiences.filter(e => e.title || e.company);
    if (validExp.length) {
        lines.push('EXPERIENCE');
        validExp.forEach(e => {
            lines.push(`${e.title}${e.company ? ' – ' + e.company : ''}${e.period ? ' (' + e.period + ')' : ''}`);
            e.bullets.split('\n').forEach(b => b.trim() && lines.push('• ' + b.trim()));
            lines.push('');
        });
    }

    const validProj = projects.filter(p => p.name);
    if (validProj.length) {
        lines.push('PROJECTS');
        validProj.forEach(p => {
            lines.push('• ' + p.name + (p.tech ? ' (' + p.tech + ')' : '') + (p.desc ? ': ' + p.desc : ''));
        });
        lines.push('');
    }

    const validEdu = education.filter(e => e.degree || e.school);
    if (validEdu.length) {
        lines.push('EDUCATION');
        validEdu.forEach(e => {
            lines.push(`${e.degree}${e.school ? ' – ' + e.school : ''}${e.year ? ' (' + e.year + ')' : ''}`);
        });
    }
    return lines.join('\n').trim();
}

/* ── Sub-components ──────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, color }) {
    const colors = {
        violet: 'text-violet-400 bg-violet-500/15 border-violet-500/20',
        blue: 'text-blue-400   bg-blue-500/15   border-blue-500/20',
        green: 'text-green-400  bg-green-500/15  border-green-500/20',
        orange: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
        pink: 'text-pink-400   bg-pink-500/15   border-pink-500/20',
    };
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${colors[color]}`}>
                <Icon className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
        </div>
    );
}

function Field({ label, hint, children }) {
    return (
        <div>
            <div className="flex items-baseline justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-300">{label}</label>
                {hint && <span className="text-xs text-gray-600">{hint}</span>}
            </div>
            {children}
        </div>
    );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function NewInterview() {
    const [tab, setTab] = useState('upload');
    const [resumeText, setResumeText] = useState('');
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef();
    const navigate = useNavigate();

    // Structured form state
    const [info, setInfo] = useState({ name: '', title: '', email: '', summary: '' });
    const [skills, setSkills] = useState('');
    const [experiences, setExperiences] = useState([emptyExp()]);
    const [projects, setProjects] = useState([emptyProj()]);
    const [education, setEducation] = useState([emptyEdu()]);

    /* ── File helpers ───────────────────────────────────────────── */
    const handleFile = useCallback(async (f) => {
        if (!f) return;
        const ext = f.name.split('.').pop().toLowerCase();
        if (!['pdf', 'docx', 'txt'].includes(ext)) { toast.error('Only PDF, DOCX, and TXT files are supported'); return; }
        if (f.size > 5 * 1024 * 1024) { toast.error('File must be under 5 MB'); return; }
        setFile(f); setResumeText('');
        if (ext === 'txt') {
            const reader = new FileReader();
            reader.onload = (e) => setResumeText(e.target.result);
            reader.readAsText(f);
            return;
        }
        setExtracting(true);
        try {
            const form = new FormData();
            form.append('resume', f);
            const res = await api.post('/interview/extract-resume', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResumeText(res.data.text);
            toast.success('Resume text extracted successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to extract text. Try the form instead.');
            setFile(null);
        } finally { setExtracting(false); }
    }, []);

    const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const onDragLeave = () => setDragging(false);
    const onDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };
    const clearFile = () => { setFile(null); setResumeText(''); };

    /* ── Submit ─────────────────────────────────────────────────── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = tab === 'type' ? buildResumeText(info, skills, experiences, projects, education) : resumeText;
        if (text.trim().length < 50) { toast.error('Please fill in more resume details.'); return; }
        setSubmitting(true);
        try {
            const res = await createSession(text);
            toast.success('Resume analyzed! Questions generated.');
            navigate(`/interview/${res.data.sessionId}/analysis`, { state: res.data });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to analyze resume.');
        } finally { setSubmitting(false); }
    };

    const builtText = buildResumeText(info, skills, experiences, projects, education);
    const ready = tab === 'upload' ? resumeText.trim().length >= 50 : builtText.trim().length >= 50;

    const addItem = (setter, factory) => setter(p => [...p, factory()]);
    const removeItem = (setter, id) => setter(p => p.filter(x => x.id !== id));
    const updateItem = (setter, id, key, val) => setter(p => p.map(x => x.id === id ? { ...x, [key]: val } : x));

    return (
        <>
            {(submitting || extracting) && (
                <Loader
                    message={submitting ? 'Analyzing resume & generating questions…' : 'Extracting resume text…'}
                    sub={submitting ? 'This takes 10–15 seconds' : 'Reading your file'}
                />
            )}

            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-3xl mx-auto">

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-1">New <span className="gradient-text">Interview</span></h1>
                        <p className="text-gray-400">Upload your resume or fill in the form — AI generates 5 personalized questions.</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl mb-6 w-fit">
                        {[
                            { key: 'upload', icon: CloudUpload, label: 'Upload File' },
                            { key: 'type', icon: FileText, label: 'Fill Form' },
                        ].map(({ key, icon: Icon, label }) => (
                            <button key={key} type="button"
                                onClick={() => { setTab(key); clearFile(); }}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* ── Upload Tab ─────────────────────────────────────── */}
                        {tab === 'upload' && (
                            <div className="card">
                                {file && resumeText ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB · {resumeText.length} characters extracted</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={clearFile} className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Extracted Text Preview</p>
                                                <span className="text-xs text-gray-600">{resumeText.length} chars</span>
                                            </div>
                                            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={10}
                                                className="input-field resize-none font-mono text-xs leading-relaxed text-gray-300"
                                                placeholder="Extracted text will appear here. You can edit it." />
                                            <p className="text-xs text-gray-600 mt-1">✏️ You can edit the text above if extraction missed anything.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => fileInputRef.current.click()} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                                        className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed py-16 px-8 cursor-pointer transition-all duration-200 ${dragging ? 'border-violet-400 bg-violet-500/10 scale-[1.01]' : 'border-gray-700 hover:border-violet-500/50 hover:bg-violet-500/5'}`}>
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-colors ${dragging ? 'bg-violet-600/30 border-violet-500/40' : 'bg-gray-800 border-gray-700'}`}>
                                            <Upload className={`w-7 h-7 ${dragging ? 'text-violet-400' : 'text-gray-500'}`} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-semibold mb-1">{dragging ? 'Drop your resume here!' : 'Drop your resume here'}</p>
                                            <p className="text-gray-500 text-sm">or <span className="text-violet-400">click to browse</span></p>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-600">
                                            {['PDF', 'DOCX', 'TXT'].map(t => (
                                                <span key={t} className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5">
                                                    <File className="w-3 h-3" /> {t}
                                                </span>
                                            ))}
                                            <span>· Max 5 MB</span>
                                        </div>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                            </div>
                        )}

                        {/* ── Structured Form Tab ─────────────────────────────── */}
                        {tab === 'type' && (
                            <div className="space-y-5">

                                {/* Personal Info */}
                                <div className="card">
                                    <SectionHeader icon={User} title="Personal Information" color="violet" />
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <Field label="Full Name">
                                            <input type="text" placeholder="e.g. Jane Smith" value={info.name}
                                                onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} className="input-field" />
                                        </Field>
                                        <Field label="Job Title / Role" hint="Your target or current role">
                                            <input type="text" placeholder="e.g. Full Stack Developer" value={info.title}
                                                onChange={e => setInfo(p => ({ ...p, title: e.target.value }))} className="input-field" />
                                        </Field>
                                        <Field label="Email Address">
                                            <input type="email" placeholder="e.g. jane@example.com" value={info.email}
                                                onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} className="input-field" />
                                        </Field>
                                    </div>
                                    <div className="mt-4">
                                        <Field label="Professional Summary" hint="Optional — 2–3 sentences">
                                            <textarea rows={3}
                                                placeholder="e.g. Passionate full-stack developer with 3+ years building scalable web apps..."
                                                value={info.summary} onChange={e => setInfo(p => ({ ...p, summary: e.target.value }))}
                                                className="input-field resize-none" />
                                        </Field>
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="card">
                                    <SectionHeader icon={Code2} title="Skills & Technologies" color="blue" />
                                    <Field label="Skills" hint="Comma-separated">
                                        <input type="text" placeholder="e.g. JavaScript, React, Node.js, Python, MongoDB, AWS, Docker"
                                            value={skills} onChange={e => setSkills(e.target.value)} className="input-field" />
                                    </Field>
                                    {skills.trim() && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                                <span key={s} className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Experience */}
                                <div className="card">
                                    <SectionHeader icon={Briefcase} title="Work Experience" color="green" />
                                    <div className="space-y-6">
                                        {experiences.map((exp, idx) => (
                                            <div key={exp.id} className={idx > 0 ? 'pt-6 border-t border-gray-800' : ''}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Position {idx + 1}</span>
                                                    {experiences.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(setExperiences, exp.id)}
                                                            className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                                    <Field label="Job Title">
                                                        <input type="text" placeholder="e.g. Software Engineer" value={exp.title}
                                                            onChange={e => updateItem(setExperiences, exp.id, 'title', e.target.value)} className="input-field" />
                                                    </Field>
                                                    <Field label="Company">
                                                        <input type="text" placeholder="e.g. Acme Corp" value={exp.company}
                                                            onChange={e => updateItem(setExperiences, exp.id, 'company', e.target.value)} className="input-field" />
                                                    </Field>
                                                    <Field label="Period" hint="e.g. Jan 2022 – Present">
                                                        <input type="text" placeholder="e.g. Jan 2022 – Present" value={exp.period}
                                                            onChange={e => updateItem(setExperiences, exp.id, 'period', e.target.value)} className="input-field" />
                                                    </Field>
                                                </div>
                                                <Field label="Key Achievements / Responsibilities" hint="One per line">
                                                    <textarea rows={3}
                                                        placeholder={"Built REST APIs serving 100K+ daily users\nReduced DB query time 40% through indexing"}
                                                        value={exp.bullets} onChange={e => updateItem(setExperiences, exp.id, 'bullets', e.target.value)}
                                                        className="input-field resize-none text-sm" />
                                                </Field>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addItem(setExperiences, emptyExp)}
                                        className="mt-5 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                        <Plus className="w-4 h-4" /> Add Another Position
                                    </button>
                                </div>

                                {/* Projects */}
                                <div className="card">
                                    <SectionHeader icon={FolderGit2} title="Projects" color="orange" />
                                    <div className="space-y-6">
                                        {projects.map((proj, idx) => (
                                            <div key={proj.id} className={idx > 0 ? 'pt-6 border-t border-gray-800' : ''}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Project {idx + 1}</span>
                                                    {projects.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(setProjects, proj.id)}
                                                            className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                                                    <Field label="Project Name">
                                                        <input type="text" placeholder="e.g. TaskFlow" value={proj.name}
                                                            onChange={e => updateItem(setProjects, proj.id, 'name', e.target.value)} className="input-field" />
                                                    </Field>
                                                    <Field label="Tech Stack" hint="Comma-separated">
                                                        <input type="text" placeholder="e.g. React, Node.js, MongoDB" value={proj.tech}
                                                            onChange={e => updateItem(setProjects, proj.id, 'tech', e.target.value)} className="input-field" />
                                                    </Field>
                                                </div>
                                                <Field label="Description">
                                                    <textarea rows={2} placeholder="e.g. Real-time project management app with live collaboration" value={proj.desc}
                                                        onChange={e => updateItem(setProjects, proj.id, 'desc', e.target.value)}
                                                        className="input-field resize-none text-sm" />
                                                </Field>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addItem(setProjects, emptyProj)}
                                        className="mt-5 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                        <Plus className="w-4 h-4" /> Add Another Project
                                    </button>
                                </div>

                                {/* Education */}
                                <div className="card">
                                    <SectionHeader icon={GraduationCap} title="Education" color="pink" />
                                    <div className="space-y-6">
                                        {education.map((edu, idx) => (
                                            <div key={edu.id} className={idx > 0 ? 'pt-6 border-t border-gray-800' : ''}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Degree {idx + 1}</span>
                                                    {education.length > 1 && (
                                                        <button type="button" onClick={() => removeItem(setEducation, edu.id)}
                                                            className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid sm:grid-cols-3 gap-4">
                                                    <Field label="Degree / Qualification">
                                                        <input type="text" placeholder="e.g. B.S. Computer Science" value={edu.degree}
                                                            onChange={e => updateItem(setEducation, edu.id, 'degree', e.target.value)} className="input-field" />
                                                    </Field>
                                                    <Field label="School / University">
                                                        <input type="text" placeholder="e.g. State University" value={edu.school}
                                                            onChange={e => updateItem(setEducation, edu.id, 'school', e.target.value)} className="input-field" />
                                                    </Field>
                                                    <Field label="Graduation Year">
                                                        <input type="text" placeholder="e.g. 2023" value={edu.year}
                                                            onChange={e => updateItem(setEducation, edu.id, 'year', e.target.value)} className="input-field" />
                                                    </Field>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addItem(setEducation, emptyEdu)}
                                        className="mt-5 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                        <Plus className="w-4 h-4" /> Add Another Degree
                                    </button>
                                </div>

                                {/* Preview pill */}
                                {builtText.length >= 50 && (
                                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-green-500/20 bg-green-500/5 text-sm text-green-400">
                                        <CheckCircle className="w-4 h-4 shrink-0" />
                                        Resume looks good — {builtText.length} characters ready to analyze!
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tips */}
                        <div className="flex items-start gap-2 text-sm text-gray-500 bg-violet-500/5 border border-violet-500/15 rounded-xl p-4">
                            <Lightbulb className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-violet-300 font-medium">Tip: </span>
                                The more detail you provide — skills, project tech stacks, achievements — the more accurate and personalized your questions will be.
                            </div>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={!ready || submitting || extracting} className="btn-primary w-full py-4 text-base">
                            {submitting ? 'Analyzing…' : 'Analyze Resume & Start Interview'}
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        {tab === 'type' && !ready && builtText.length > 0 && (
                            <p className="text-center text-xs text-gray-600">Add more details to continue</p>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
}

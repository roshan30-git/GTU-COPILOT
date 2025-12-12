
import React, { useState, useEffect } from 'react';
import { generatePhysicsReportJSON, generatePhysicsImage, generatePhysicsProjectIdeas } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import saveAs from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';

// Types
interface TeamMember {
    id: number;
    name: string;
    enrollment: string;
}

interface ProjectData {
    topic: string;
    dept: string;
    className: string;
    groupNo: string;
    members: TeamMember[];
}

interface ReportContent {
    title: string;
    aim: string;
    apparatus: string[];
    principle: string;
    construction: string[];
    working: string[];
    applications: string[];
    conclusion: string;
    aimDiagramUrl?: string;
    conclusionChartUrl?: string;
}

export const PhysicsModelGenerator: React.FC = () => {
    // --- STATE ---
    const [project, setProject] = useState<ProjectData>({
        topic: '',
        dept: '',
        className: '',
        groupNo: '',
        members: [{ id: 1, name: '', enrollment: '' }]
    });

    const [report, setReport] = useState<ReportContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(''); // 'Generating Text...', 'Drawing Diagrams...'
    const [showIdeasModal, setShowIdeasModal] = useState(false);
    
    // Idea Generator State
    const [ideaBudget, setIdeaBudget] = useState('500');
    const [ideaInterest, setIdeaInterest] = useState('');
    const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
    const [ideasLoading, setIdeasLoading] = useState(false);

    // --- EFFECT: LocalStorage Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem('gtu_physics_data');
        if (saved) {
            try {
                const parsedData = JSON.parse(saved);
                // Validate structure to prevent map errors
                const sanitizedData: ProjectData = {
                    topic: parsedData.topic || '',
                    dept: parsedData.dept || '',
                    className: parsedData.className || '',
                    groupNo: parsedData.groupNo || '',
                    // Ensure members is an array and has at least one entry if empty
                    members: (Array.isArray(parsedData.members) && parsedData.members.length > 0) 
                        ? parsedData.members 
                        : [{ id: Date.now(), name: '', enrollment: '' }]
                };
                setProject(sanitizedData);
            } catch (e) {
                console.error("Failed to load saved data, resetting to default.", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('gtu_physics_data', JSON.stringify(project));
    }, [project]);

    // --- HANDLERS: Form Management ---
    const updateProject = (field: keyof ProjectData, value: any) => {
        setProject(prev => ({ ...prev, [field]: value }));
    };

    const updateMember = (id: number, field: 'name' | 'enrollment', value: string) => {
        setProject(prev => ({
            ...prev,
            members: (prev.members || []).map(m => m.id === id ? { ...m, [field]: value } : m)
        }));
    };

    const addMember = () => {
        if ((project.members || []).length < 6) {
            setProject(prev => ({
                ...prev,
                members: [...(prev.members || []), { id: Date.now(), name: '', enrollment: '' }]
            }));
        }
    };

    const removeMember = (id: number) => {
        if ((project.members || []).length > 1) {
            setProject(prev => ({
                ...prev,
                members: (prev.members || []).filter(m => m.id !== id)
            }));
        }
    };

    // --- HANDLERS: Report Generation ---
    const handleGenerateReport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project.topic) return;

        setIsLoading(true);
        setStatus('Synthesizing Physics Concepts...');
        setReport(null);

        try {
            // 1. Generate Text Structure
            const data = await generatePhysicsReportJSON(project.topic, project.dept, project.className);
            setReport(data); // Render text immediately

            // 2. Generate Images in Parallel
            setStatus('Drafting Schematics & Infographics...');
            
            const [aimImg, concImg] = await Promise.all([
                generatePhysicsImage(data.aim_diagram_prompt),
                generatePhysicsImage(data.conclusion_chart_prompt)
            ]);

            setReport(prev => prev ? ({
                ...prev,
                aimDiagramUrl: aimImg,
                conclusionChartUrl: concImg
            }) : null);

        } catch (error) {
            console.error(error);
            alert("Generation failed. Please try again.");
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    // --- HANDLERS: Idea Generator ---
    const handleGenerateIdeas = async () => {
        setIdeasLoading(true);
        try {
            const ideas = await generatePhysicsProjectIdeas(ideaBudget, ideaInterest);
            setGeneratedIdeas(Array.isArray(ideas) ? ideas : []);
        } catch (e) {
            console.error(e);
            setGeneratedIdeas([]);
        } finally {
            setIdeasLoading(false);
        }
    };

    const selectIdea = (title: string) => {
        updateProject('topic', title);
        setShowIdeasModal(false);
    };

    // --- HANDLERS: Export ---
    const handleCopyToClipboard = () => {
        if (!report) return;
        const text = `
Title: ${report.title}
Aim: ${report.aim}
Apparatus: ${(report.apparatus || []).join(', ')}
Principle: ${report.principle}
Construction:
${(report.construction || []).map((s, i) => `${i+1}. ${s}`).join('\n')}
Working:
${(report.working || []).map((s, i) => `${i+1}. ${s}`).join('\n')}
Conclusion: ${report.conclusion}
        `.trim();
        navigator.clipboard.writeText(text);
        alert("Report text copied to clipboard!");
    };

    const handleExportDocx = async () => {
        if (!report) return;
        
        // Helper to convert base64 to blob/arraybuffer for docx
        const getImageBuffer = async (base64?: string) => {
            if (!base64) return null;
            try {
                const res = await fetch(base64);
                return await res.arrayBuffer();
            } catch (e) {
                console.error("Failed to fetch image for export", e);
                return null;
            }
        };

        const getImageType = (url?: string): "png" | "jpg" => {
            if (url?.includes("image/jpeg")) return "jpg";
            return "png";
        };

        const aimImageBuffer = await getImageBuffer(report.aimDiagramUrl);
        const concImageBuffer = await getImageBuffer(report.conclusionChartUrl);

        const aimImageType = getImageType(report.aimDiagramUrl);
        const concImageType = getImageType(report.conclusionChartUrl);

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: (report.title || "Physics Report").toUpperCase(),
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Submitted by:", bold: true }),
                            ...(project.members || []).map(m => new TextRun({ text: `\n${m.name || "Student Name"} (${m.enrollment || "Enr No"})`, break: 1 }))
                        ],
                        spacing: { after: 400 }
                    }),
                    
                    // AIM
                    new Paragraph({ text: "1. AIM", heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: report.aim || "", spacing: { after: 200 } }),
                    
                    // AIM DIAGRAM
                    ...(aimImageBuffer ? [
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: aimImageBuffer,
                                    transformation: { width: 400, height: 300 },
                                    type: aimImageType,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 }
                        }),
                        new Paragraph({ text: "Fig 1: Schematic Diagram", alignment: AlignmentType.CENTER, spacing: { after: 400 } })
                    ] : []),

                    // PRINCIPLE
                    new Paragraph({ text: "2. PRINCIPLE", heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: report.principle || "", spacing: { after: 200 } }),

                    // APPARATUS
                    new Paragraph({ text: "3. APPARATUS", heading: HeadingLevel.HEADING_2 }),
                    ...(report.apparatus || []).map(item => new Paragraph({ text: `• ${item}`, bullet: { level: 0 } })),
                    new Paragraph({ text: "", spacing: { after: 200 } }),

                    // CONSTRUCTION
                    new Paragraph({ text: "4. CONSTRUCTION", heading: HeadingLevel.HEADING_2 }),
                    ...(report.construction || []).map((step, i) => new Paragraph({ text: `${i + 1}. ${step}` })),
                    new Paragraph({ text: "", spacing: { after: 200 } }),

                    // PHOTO PLACEHOLDER
                    new Paragraph({ 
                        children: [new TextRun({ text: "[ PASTE YOUR MODEL PHOTO HERE ]", italics: true, color: "888888" })],
                        alignment: AlignmentType.CENTER,
                        border: { top: { style: "single", size: 6, space: 10 }, bottom: { style: "single", size: 6, space: 10 }, left: { style: "single", size: 6, space: 10 }, right: { style: "single", size: 6, space: 10 } },
                        spacing: { before: 200, after: 200 } 
                    }),

                    // WORKING
                    new Paragraph({ text: "5. WORKING", heading: HeadingLevel.HEADING_2 }),
                    ...(report.working || []).map((step, i) => new Paragraph({ text: `${i + 1}. ${step}` })),
                    new Paragraph({ text: "", spacing: { after: 200 } }),

                    // APPLICATIONS
                    new Paragraph({ text: "6. APPLICATIONS", heading: HeadingLevel.HEADING_2 }),
                    ...(report.applications || []).map(item => new Paragraph({ text: `• ${item}`, bullet: { level: 0 } })),
                    new Paragraph({ text: "", spacing: { after: 200 } }),

                    // CONCLUSION
                    new Paragraph({ text: "7. CONCLUSION", heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ text: report.conclusion || "", spacing: { after: 200 } }),
                    
                    // CONCLUSION CHART
                     ...(concImageBuffer ? [
                        new Paragraph({
                            children: [
                                new ImageRun({
                                    data: concImageBuffer,
                                    transformation: { width: 400, height: 300 },
                                    type: concImageType,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 }
                        })
                    ] : []),
                ],
            }],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, `${(project.topic || "Project").replace(/\s+/g, '_')}_Report.docx`);
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-[fadeIn_0.5s_ease-out]">
            
            {/* --- LEFT COLUMN: INPUTS --- */}
            <div className="w-full lg:w-1/3 space-y-6">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                     {/* Floating Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

                    <form onSubmit={handleGenerateReport} className="space-y-5 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                <span className="bg-blue-500 text-white rounded-lg p-1.5 text-base shadow-lg shadow-blue-500/30">⚛️</span>
                                Project Details
                            </h2>
                        </div>

                        {/* TOPIC INPUT WITH IDEA GENERATOR */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-blue-300 uppercase tracking-wider ml-2">Project Topic</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={project.topic}
                                    onChange={(e) => updateProject('topic', e.target.value)}
                                    className="flex-1 bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-3 text-white placeholder-indigo-400/70 focus:ring-2 focus:ring-blue-500/50 outline-none text-sm"
                                    placeholder="e.g. Hydraulic Bridge" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowIdeasModal(true)}
                                    className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-yellow-300 hover:bg-yellow-500/30 transition shadow-lg shadow-yellow-500/10"
                                    title="Get Project Ideas"
                                >
                                    <LightbulbIcon />
                                </button>
                            </div>
                        </div>

                        {/* CLASS DETAILS GRID */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-indigo-300 uppercase ml-1">Dept</label>
                                <input 
                                    type="text" 
                                    value={project.dept}
                                    onChange={(e) => updateProject('dept', e.target.value)}
                                    className="w-full bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-2.5 text-white text-sm outline-none focus:border-blue-400"
                                    placeholder="CE/IT" 
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-indigo-300 uppercase ml-1">Class</label>
                                <input 
                                    type="text" 
                                    value={project.className}
                                    onChange={(e) => updateProject('className', e.target.value)}
                                    className="w-full bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-2.5 text-white text-sm outline-none focus:border-blue-400"
                                    placeholder="A1" 
                                />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-bold text-indigo-300 uppercase ml-1">Group No.</label>
                                <input 
                                    type="text" 
                                    value={project.groupNo}
                                    onChange={(e) => updateProject('groupNo', e.target.value)}
                                    className="w-full bg-indigo-950/60 border border-indigo-500/30 rounded-xl p-2.5 text-white text-sm outline-none focus:border-blue-400"
                                    placeholder="G-12" 
                                />
                            </div>
                        </div>

                        {/* TEAM MEMBERS */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-purple-300 uppercase tracking-wider">Team Members</label>
                                <button 
                                    type="button" 
                                    onClick={addMember}
                                    className="text-xs bg-purple-500/20 text-purple-200 px-2 py-1 rounded-lg hover:bg-purple-500/40 transition flex items-center gap-1"
                                >
                                    <PlusIcon /> Add
                                </button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                {(project.members || []).map((member, index) => (
                                    <div key={member.id} className="flex gap-2 items-center">
                                        <span className="text-indigo-400 text-xs font-mono w-4">{index + 1}.</span>
                                        <input 
                                            type="text" 
                                            value={member.name}
                                            onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                                            placeholder="Name"
                                            className="flex-1 bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-2 text-xs text-white outline-none"
                                        />
                                        <input 
                                            type="text" 
                                            value={member.enrollment}
                                            onChange={(e) => updateMember(member.id, 'enrollment', e.target.value)}
                                            placeholder="Enr No."
                                            className="w-20 bg-indigo-950/40 border border-indigo-500/20 rounded-lg p-2 text-xs text-white outline-none"
                                        />
                                        {(project.members || []).length > 1 && (
                                            <button 
                                                type="button" 
                                                onClick={() => removeMember(member.id)}
                                                className="text-red-400 hover:text-red-200 p-1"
                                            >
                                                <TrashIcon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin text-xl">⚙️</span>
                                    <span>{status || 'Processing...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>Generate Report</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* --- RIGHT COLUMN: PREVIEW --- */}
            <div className="w-full lg:w-2/3">
                {report ? (
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl flex flex-col h-[800px] animate-[slideUp_0.4s_ease-out]">
                        
                        {/* Toolbar */}
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-indigo-950/30 rounded-t-[2rem]">
                            <h3 className="font-bold text-blue-200 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Live Preview
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={handleCopyToClipboard} className="p-2 bg-indigo-800/50 hover:bg-indigo-700 rounded-lg text-indigo-200 transition" title="Copy Text">
                                    <ClipboardIcon />
                                </button>
                                <button onClick={handleExportDocx} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold shadow-lg shadow-blue-500/20 transition text-sm">
                                    <DownloadIcon /> Export DOCX
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white/5 relative">
                             {/* Floating Status Toast */}
                            {isLoading && (
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-900/90 text-blue-200 px-4 py-2 rounded-full shadow-xl border border-blue-500/30 flex items-center gap-2 text-sm backdrop-blur-md z-20">
                                    <span className="animate-spin">🎨</span> {status}
                                </div>
                            )}

                            <div className="max-w-3xl mx-auto bg-white text-gray-900 p-8 shadow-2xl min-h-[1000px]">
                                {/* TITLE PAGE INFO */}
                                <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
                                    <h1 className="text-3xl font-black text-indigo-900 uppercase mb-2">{report.title}</h1>
                                    <p className="text-gray-600 font-serif italic">Physics Model Report</p>
                                    <div className="mt-4 text-sm text-gray-500">
                                        Submitted by:<br/>
                                        {(project.members || []).map(m => (
                                            <span key={m.id} className="block font-bold text-gray-800">{m.name || "Student Name"} ({m.enrollment || "Enrollment No"})</span>
                                        ))}
                                    </div>
                                </div>

                                {/* SECTIONS */}
                                <div className="space-y-6">
                                    <section>
                                        <h4 className="text-lg font-bold text-indigo-800 border-b border-gray-300 mb-2">1. AIM</h4>
                                        <p className="text-gray-800 leading-relaxed text-sm">{report.aim || "Content generating..."}</p>
                                    </section>

                                    {/* AI DIAGRAM */}
                                    <section className="flex flex-col items-center my-6">
                                        <div className="w-full max-w-md border-2 border-gray-200 p-1 rounded-lg">
                                            {report.aimDiagramUrl ? (
                                                <img src={report.aimDiagramUrl} alt="Schematic Diagram" className="w-full h-auto object-contain" />
                                            ) : (
                                                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                                    {isLoading ? 'Generating Diagram...' : 'Diagram Unavailable'}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 font-medium">Fig 1. Schematic Diagram</p>
                                    </section>

                                    <section>
                                        <h4 className="text-lg font-bold text-indigo-800 border-b border-gray-300 mb-2">2. PRINCIPLE</h4>
                                        <p className="text-gray-800 leading-relaxed text-sm">{report.principle || "Content generating..."}</p>
                                    </section>

                                    <section>
                                        <h4 className="text-lg font-bold text-indigo-800 border-b border-gray-300 mb-2">3. APPARATUS</h4>
                                        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                                            {(report.apparatus || ["Content generating..."]).map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </section>

                                    <section>
                                        <h4 className="text-lg font-bold text-indigo-800 border-b border-gray-300 mb-2">4. CONSTRUCTION</h4>
                                        <ol className="list-decimal pl-5 text-sm text-gray-800 space-y-2">
                                            {(report.construction || ["Content generating..."]).map((step, i) => <li key={i}>{step}</li>)}
                                        </ol>
                                    </section>

                                    {/* MODEL PHOTO PLACEHOLDER */}
                                    <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center rounded-xl my-6">
                                        <p className="text-gray-400 font-bold italic text-sm">[ PASTE YOUR ACTUAL MODEL PHOTO HERE ]</p>
                                    </div>

                                    <section>
                                        <h4 className="text-lg font-bold text-indigo-800 border-b border-gray-300 mb-2">5. WORKING</h4>
                                        <ol className="list-decimal pl-5 text-sm text-gray-800 space-y-2">
                                            {(report.working || ["Content generating..."]).map((step, i) => <li key={i}>{step}</li>)}
                                        </ol>
                                    </section>

                                    <section>
                                        <h4 className="text-lg font-bold text-indigo-800 border-b border-gray-300 mb-2">6. APPLICATIONS</h4>
                                        <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1">
                                            {(report.applications || ["Content generating..."]).map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </section>

                                    <section>
                                        <h4 className="text-lg font-bold text-indigo-800 border-b border-gray-300 mb-2">7. CONCLUSION</h4>
                                        <p className="text-gray-800 leading-relaxed text-sm">{report.conclusion || "Content generating..."}</p>
                                    </section>

                                    {/* CONCLUSION CHART */}
                                    <section className="flex flex-col items-center mt-6">
                                        <div className="w-full max-w-sm border-2 border-gray-200 p-1 rounded-lg">
                                             {report.conclusionChartUrl ? (
                                                <img src={report.conclusionChartUrl} alt="Results Infographic" className="w-full h-auto object-contain" />
                                            ) : (
                                                <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                                     {isLoading ? 'Generating Chart...' : 'Chart Unavailable'}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // EMPTY STATE
                    <div className="h-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-center p-8 border-dashed border-indigo-500/30">
                        <div className="w-24 h-24 bg-indigo-900/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <span className="text-4xl">📄</span>
                        </div>
                        <h3 className="text-xl font-bold text-indigo-200 mb-2">Ready to Draft</h3>
                        <p className="text-indigo-400 max-w-xs">Enter your project details on the left to generate a professional Physics Model Report with diagrams.</p>
                    </div>
                )}
            </div>

            {/* --- MODAL: IDEA GENERATOR --- */}
            {showIdeasModal && (
                <div className="fixed inset-0 z-50 bg-indigo-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-indigo-500/30 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-yellow-400"><LightbulbIcon /></span> Smart Idea Generator
                            </h3>
                            <button onClick={() => setShowIdeasModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-indigo-300">Budget (INR)</label>
                                    <input 
                                        type="number" 
                                        value={ideaBudget}
                                        onChange={e => setIdeaBudget(e.target.value)}
                                        className="w-full bg-slate-800 border border-indigo-500/20 rounded-lg p-2 text-white"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-bold text-indigo-300">Interest (Optics, Arduino, etc.)</label>
                                    <input 
                                        type="text" 
                                        value={ideaInterest}
                                        onChange={e => setIdeaInterest(e.target.value)}
                                        className="w-full bg-slate-800 border border-indigo-500/20 rounded-lg p-2 text-white"
                                        placeholder="Any"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button 
                                        onClick={handleGenerateIdeas}
                                        disabled={ideasLoading}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg h-10 flex items-center gap-2"
                                    >
                                        {ideasLoading ? <span className="animate-spin">⚙️</span> : 'Find Ideas'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 overflow-y-auto max-h-60 custom-scrollbar pr-2">
                                {(generatedIdeas || []).length === 0 && !ideasLoading && (
                                    <p className="text-center text-gray-500 py-8">Enter constraints and click "Find Ideas"</p>
                                )}
                                {(generatedIdeas || []).map((idea, i) => (
                                    <div key={i} className="bg-slate-800 p-4 rounded-xl border border-white/5 hover:border-indigo-500/50 transition cursor-pointer group" onClick={() => selectIdea(idea.title)}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-blue-300 group-hover:text-blue-200">{idea.title}</h4>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${idea.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' : idea.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>{idea.difficulty}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2"><span className="text-indigo-400">Principle:</span> {idea.principle}</p>
                                        <p className="text-xs text-slate-300 italic">"{idea.build_summary}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

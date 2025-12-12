
import React, { useState, useRef } from 'react';
import { generatePptData } from '../services/geminiService';
import { FilePdfIcon } from './icons/FilePdfIcon';

// Declare html2pdf on window
declare global {
  interface Window {
    html2pdf: any;
  }
}

interface Slide {
    title: string;
    layout: string;
    content: string[];
    image_prompt: string;
}

const SlideRenderer: React.FC<{ slide: Slide; index: number; total: number }> = ({ slide, index, total }) => {
    // Generate image URL using Pollinations
    const bgImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(slide.image_prompt + " minimal modern high quality")}?width=1280&height=720&nologo=true`;

    return (
        <div className="slide-container w-full aspect-video bg-indigo-950 text-white relative overflow-hidden flex flex-col shadow-2xl rounded-xl mb-8 break-after-page page-break-after-always">
             {/* Slide Number */}
             <div className="absolute bottom-4 right-6 text-white/50 text-sm font-mono z-20">
                {index + 1} / {total}
             </div>

            {/* --- LAYOUTS --- */}
            
            {/* 1. TITLE LAYOUT */}
            {slide.layout === 'title' && (
                <div className="w-full h-full flex flex-col justify-center items-center relative p-12 text-center z-10">
                    <div className="absolute inset-0 z-0">
                         <img src={bgImage} className="w-full h-full object-cover opacity-40 blur-sm scale-110" alt="background" />
                         <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/80 to-transparent"></div>
                    </div>
                    <div className="relative z-10 animate-[fadeIn_0.5s_ease-out]">
                        <h1 className="text-6xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 drop-shadow-lg">
                            {slide.title}
                        </h1>
                        <div className="w-32 h-1 bg-white/20 mx-auto rounded-full mb-6"></div>
                        {slide.content.map((line, i) => (
                            <p key={i} className="text-xl md:text-2xl text-indigo-100 font-light tracking-wide">{line}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. CONTENT LEFT (Image Right) */}
            {slide.layout === 'content_left' && (
                <div className="w-full h-full flex relative z-10 bg-gradient-to-br from-slate-900 to-slate-800">
                    <div className="w-1/2 p-12 flex flex-col justify-center">
                        <h2 className="text-4xl font-bold text-cyan-300 mb-8 border-l-4 border-cyan-500 pl-4">{slide.title}</h2>
                        <ul className="space-y-4">
                            {slide.content.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-lg text-slate-200">
                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-cyan-500 shrink-0"></span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-1/2 h-full relative">
                        <img src={bgImage} className="w-full h-full object-cover" alt="slide visual" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
                    </div>
                </div>
            )}

             {/* 3. CONTENT RIGHT (Image Left) */}
             {slide.layout === 'content_right' && (
                <div className="w-full h-full flex flex-row-reverse relative z-10 bg-gradient-to-bl from-slate-900 to-slate-800">
                    <div className="w-1/2 p-12 flex flex-col justify-center">
                        <h2 className="text-4xl font-bold text-pink-300 mb-8 border-r-4 border-pink-500 pr-4 text-right">{slide.title}</h2>
                        <ul className="space-y-4 text-right">
                            {slide.content.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 text-lg text-slate-200 justify-end">
                                    <span>{point}</span>
                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-1/2 h-full relative">
                        <img src={bgImage} className="w-full h-full object-cover" alt="slide visual" />
                         <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-transparent to-transparent"></div>
                    </div>
                </div>
            )}

             {/* 4. CENTER / LIST */}
            {(slide.layout === 'center' || slide.layout === 'bullet_list') && (
                <div className="w-full h-full flex flex-col relative z-10 p-12">
                     <div className="absolute inset-0 z-0">
                         <img src={bgImage} className="w-full h-full object-cover opacity-20 grayscale mix-blend-overlay" alt="bg" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col">
                        <h2 className="text-4xl font-black text-center text-white mb-10 pb-4 border-b border-white/10 uppercase tracking-widest">{slide.title}</h2>
                        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
                            <div className="grid grid-cols-1 gap-6">
                                 {slide.content.map((point, i) => (
                                    <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 flex items-center gap-4 shadow-lg">
                                        <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</div>
                                        <p className="text-xl font-medium text-violet-100">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. THANK YOU */}
            {slide.layout === 'thank_you' && (
                <div className="w-full h-full flex flex-col justify-center items-center relative z-10 bg-indigo-950">
                     <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                     </div>
                    <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-400 mb-8 relative z-10">
                        Thank You
                    </h2>
                    <div className="flex gap-4 relative z-10">
                        {slide.content.map((item, i) => (
                            <span key={i} className="text-xl text-indigo-300 font-medium px-4 py-2 bg-white/5 rounded-full border border-white/10">{item}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const PptMaker: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [slideCount, setSlideCount] = useState<string>('5');
    const [slides, setSlides] = useState<Slide[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    
    // Ref for the container holding all slides to be exported
    const slidesContainerRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) {
            setError('Please enter a topic.');
            return;
        }
        const count = parseInt(slideCount);
        if (isNaN(count) || count < 1 || count > 15) {
             setError('Keep slides between 1 and 15 for best performance.');
             return;
        }

        setError('');
        setIsLoading(true);
        setStatus('Structuring Presentation...');
        setSlides([]);

        try {
            const data = await generatePptData(topic, count);
            setSlides(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    const handleExportPdf = () => {
        if (!slidesContainerRef.current) return;
        
        const element = slidesContainerRef.current;
        const opt = {
            margin: 0,
            filename: `${topic.replace(/\s+/g, '_')}_Presentation.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                logging: true,
                letterRendering: true,
                allowTaint: true
            },
            jsPDF: { unit: 'in', format: [16, 9], orientation: 'landscape' }
        };

        // If html2pdf is not loaded yet
        if (typeof window.html2pdf === 'undefined') {
            alert("PDF Library loading... please try again in a few seconds.");
            return;
        }

        // Show a loading indicator for the export process
        setStatus('Rendering PDF...');
        
        window.html2pdf().set(opt).from(element).save().then(() => {
            setStatus('');
        });
    };

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* INPUT SECTION */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-violet-500/30 transition-colors duration-500">
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                            <span className="bg-violet-500 text-white rounded-xl p-2 text-xl shadow-lg shadow-violet-500/30">🎨</span>
                            Slide Creator
                        </h2>
                        <p className="text-indigo-200 font-medium">Topic to PDF in seconds. Perfect 16:9 layout.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 space-y-2 group/input">
                            <label className="text-sm font-bold text-violet-300 uppercase ml-2">Topic</label>
                            <input 
                                type="text" 
                                value={topic} 
                                onChange={e => setTopic(e.target.value)} 
                                className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white focus:ring-4 focus:ring-violet-500/20 outline-none" 
                                placeholder="e.g. Artificial Intelligence in 2025" 
                            />
                        </div>
                        <div className="md:col-span-1 space-y-2 group/input">
                            <label className="text-sm font-bold text-fuchsia-300 uppercase ml-2">Slides</label>
                            <input 
                                type="number" 
                                value={slideCount} 
                                onChange={e => setSlideCount(e.target.value)}
                                min="1" max="15"
                                className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white text-center font-black focus:ring-4 focus:ring-fuchsia-500/20 outline-none" 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || !!status} 
                        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-extrabold text-lg py-5 px-6 rounded-2xl shadow-xl shadow-violet-500/30 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading || status ? (
                            <>
                                <span className="animate-spin">⚙️</span> {status || 'Processing...'}
                            </>
                        ) : (
                            <>Generate Slides <span className="text-xl">✨</span></>
                        )}
                    </button>
                    
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-100 font-bold flex items-center gap-2">
                             <span>🚫</span> {error}
                        </div>
                    )}
                </form>
            </div>

            {/* PREVIEW & EXPORT SECTION */}
            {slides.length > 0 && (
                <div className="space-y-6">
                     <div className="flex justify-between items-center px-4">
                        <h3 className="text-2xl font-bold text-white">Preview ({slides.length} Slides)</h3>
                        <button 
                            onClick={handleExportPdf}
                            disabled={!!status}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                             {status === 'Rendering PDF...' ? <span className="animate-spin">⏳</span> : <FilePdfIcon />}
                             <span>{status === 'Rendering PDF...' ? 'Saving...' : 'Download PDF'}</span>
                        </button>
                     </div>
                    
                    {/* 
                       Container for slides. 
                       We render them normally for preview.
                       html2pdf will capture this entire div.
                    */}
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                        <div ref={slidesContainerRef} id="slides-container">
                            {slides.map((slide, index) => (
                                <SlideRenderer key={index} slide={slide} index={index} total={slides.length} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

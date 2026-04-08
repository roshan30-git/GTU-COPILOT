
import React, { useState, useRef } from 'react';
import { generatePptData } from '../services/geminiService';
import { FilePdfIcon } from './icons/FilePdfIcon';
import pptxgen from 'pptxgenjs';

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
    user_image?: string;
}

const SlideRenderer: React.FC<{ slide: Slide; index: number; total: number; onImageReplace?: (index: number, file: File) => void }> = ({ slide, index, total, onImageReplace }) => {
    // Generate image URL using Pollinations with a more specific, professional prompt
    const defaultImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(slide.image_prompt + " abstract presentation background corporate professional clean")}?width=1280&height=720&nologo=true&seed=${index * 100}`;
    const fallbackImage = `https://image.pollinations.ai/prompt/${encodeURIComponent("abstract geometric background dark theme")}?width=1280&height=720&nologo=true&seed=${index * 100}`;
    
    const [imgSrc, setImgSrc] = useState(slide.user_image || defaultImage);

    React.useEffect(() => {
        if (!slide.user_image) {
            setImgSrc(defaultImage);
        } else {
            setImgSrc(slide.user_image);
        }
    }, [defaultImage, slide.user_image]);

    const handleError = () => {
        if (imgSrc !== fallbackImage) {
            setImgSrc(fallbackImage);
        }
    };

    return (
        <div className="slide-container w-full aspect-video bg-slate-900 text-white relative overflow-hidden flex flex-col shadow-2xl rounded-xl mb-8 break-after-page page-break-after-always border border-slate-700">
             {/* Slide Number */}
             <div className="absolute bottom-6 right-8 text-white/50 text-sm font-mono z-20 flex items-center gap-4">
                <label className="cursor-pointer bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors" title="Replace Background">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                            if (e.target.files?.[0] && onImageReplace) {
                                onImageReplace(index, e.target.files[0]);
                            }
                        }}
                    />
                </label>
                {index + 1} / {total}
             </div>

            {/* --- LAYOUTS --- */}
            
            {/* 1. TITLE LAYOUT */}
            {slide.layout === 'title' && (
                <div className="w-full h-full flex flex-col justify-center items-center relative p-16 text-center z-10">
                    <div className="absolute inset-0 z-0">
                         <img src={imgSrc} onError={handleError} crossOrigin="anonymous" className="w-full h-full object-cover opacity-30 blur-sm scale-105" alt="background" />
                         <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
                    </div>
                    <div className="relative z-10 animate-[fadeIn_0.5s_ease-out] max-w-4xl">
                        <h1 className="text-6xl md:text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-lg leading-tight">
                            {slide.title}
                        </h1>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>
                        {slide.content.map((line, i) => (
                            <p key={i} className="text-xl md:text-2xl text-slate-300 font-light tracking-wide mb-2">{line}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. CONTENT LEFT (Image Right) */}
            {slide.layout === 'content_left' && (
                <div className="w-full h-full flex relative z-10 bg-slate-900">
                    <div className="w-[55%] p-16 flex flex-col justify-center relative z-20">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-slate-900 via-slate-900 to-transparent z-[-1]"></div>
                        <h2 className="text-4xl md:text-5xl font-bold text-blue-400 mb-10 leading-tight">{slide.title}</h2>
                        <ul className="space-y-6">
                            {slide.content.map((point, i) => (
                                <li key={i} className="flex items-start gap-4 text-xl text-slate-300 leading-relaxed">
                                    <span className="mt-2 w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-[45%] h-full relative">
                        <img src={imgSrc} onError={handleError} crossOrigin="anonymous" className="w-full h-full object-cover" alt="slide visual" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
                        {/* Decorative element */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    </div>
                </div>
            )}

             {/* 3. CONTENT RIGHT (Image Left) */}
             {slide.layout === 'content_right' && (
                <div className="w-full h-full flex flex-row-reverse relative z-10 bg-slate-900">
                    <div className="w-[55%] p-16 flex flex-col justify-center relative z-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-slate-900 via-slate-900 to-transparent z-[-1]"></div>
                        <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-10 leading-tight">{slide.title}</h2>
                        <ul className="space-y-6">
                            {slide.content.map((point, i) => (
                                <li key={i} className="flex items-start gap-4 text-xl text-slate-300 leading-relaxed">
                                    <span className="mt-2 w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.8)]"></span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-[45%] h-full relative">
                        <img src={imgSrc} onError={handleError} crossOrigin="anonymous" className="w-full h-full object-cover" alt="slide visual" />
                         <div className="absolute inset-0 bg-gradient-to-l from-slate-900 via-transparent to-transparent"></div>
                         {/* Decorative element */}
                         <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
                    </div>
                </div>
            )}

             {/* 4. CENTER / LIST */}
            {(slide.layout === 'center' || slide.layout === 'bullet_list') && (
                <div className="w-full h-full flex flex-col relative z-10 p-16">
                     <div className="absolute inset-0 z-0">
                         <img src={imgSrc} onError={handleError} crossOrigin="anonymous" className="w-full h-full object-cover opacity-10 grayscale mix-blend-overlay" alt="bg" />
                         <div className="absolute inset-0 bg-slate-900/80"></div>
                    </div>
                    <div className="relative z-10 h-full flex flex-col">
                        <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-12 pb-6 border-b border-slate-700 tracking-wide">{slide.title}</h2>
                        <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
                            <div className="grid grid-cols-1 gap-6">
                                 {slide.content.map((point, i) => (
                                    <div key={i} className="bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700 flex items-center gap-6 shadow-xl hover:bg-slate-800 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-blue-500/20">{i + 1}</div>
                                        <p className="text-xl font-medium text-slate-200 leading-relaxed">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. THANK YOU */}
            {slide.layout === 'thank_you' && (
                <div className="w-full h-full flex flex-col justify-center items-center relative z-10 bg-slate-900">
                     <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                     </div>
                    <h2 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-10 relative z-10 tracking-tight">
                        Thank You
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4 relative z-10 max-w-3xl">
                        {slide.content.map((item, i) => (
                            <span key={i} className="text-xl text-slate-300 font-medium px-6 py-3 bg-slate-800/80 rounded-full border border-slate-700 shadow-lg">{item}</span>
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
    const [templateType, setTemplateType] = useState('General');
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
            const data = await generatePptData(topic, count, templateType);
            setSlides(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    const handleImageReplace = (index: number, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                const newSlides = [...slides];
                newSlides[index] = { ...newSlides[index], user_image: e.target.result as string };
                setSlides(newSlides);
            }
        };
        reader.readAsDataURL(file);
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

    const handleExportPptx = async () => {
        if (!slides.length) return;
        setStatus('Generating PPTX...');
        
        try {
            const pptx = new pptxgen();
            pptx.layout = 'LAYOUT_16x9';
            pptx.author = 'GTU Copilot';
            pptx.title = topic;

            for (let i = 0; i < slides.length; i++) {
                const slideData = slides[i];
                const slide = pptx.addSlide();
                
                // Add background
                slide.background = { color: '0f172a' }; // slate-900

                if (slideData.layout === 'title') {
                    slide.addText(slideData.title, {
                        x: 1, y: 2, w: 8, h: 1.5,
                        fontSize: 44, bold: true, color: '60a5fa', // blue-400
                        align: 'center', valign: 'middle'
                    });
                    
                    let yPos = 4;
                    slideData.content.forEach(line => {
                        slide.addText(line, {
                            x: 1, y: yPos, w: 8, h: 0.5,
                            fontSize: 20, color: 'cbd5e1', // slate-300
                            align: 'center'
                        });
                        yPos += 0.6;
                    });
                } else if (slideData.layout === 'content_left') {
                    slide.addText(slideData.title, {
                        x: 0.5, y: 0.5, w: 4.5, h: 1,
                        fontSize: 32, bold: true, color: '60a5fa', // blue-400
                        align: 'left'
                    });
                    
                    let yPos = 2;
                    slideData.content.forEach(point => {
                        slide.addText(point, {
                            x: 0.5, y: yPos, w: 4.5, h: 0.5,
                            fontSize: 18, color: 'cbd5e1', // slate-300
                            bullet: { type: 'number' }
                        });
                        yPos += 0.6;
                    });
                } else if (slideData.layout === 'content_right') {
                    slide.addText(slideData.title, {
                        x: 5, y: 0.5, w: 4.5, h: 1,
                        fontSize: 32, bold: true, color: 'c084fc', // purple-400
                        align: 'right'
                    });
                    
                    let yPos = 2;
                    slideData.content.forEach(point => {
                        slide.addText(point, {
                            x: 5, y: yPos, w: 4.5, h: 0.5,
                            fontSize: 18, color: 'cbd5e1', // slate-300
                            align: 'right',
                            bullet: { type: 'number' }
                        });
                        yPos += 0.6;
                    });
                } else if (slideData.layout === 'center' || slideData.layout === 'bullet_list') {
                    slide.addText(slideData.title, {
                        x: 1, y: 0.5, w: 8, h: 1,
                        fontSize: 32, bold: true, color: 'ffffff',
                        align: 'center'
                    });
                    
                    let yPos = 2;
                    slideData.content.forEach(point => {
                        slide.addText(point, {
                            x: 1.5, y: yPos, w: 7, h: 0.5,
                            fontSize: 20, color: 'e2e8f0', // slate-200
                            bullet: { type: 'number' }
                        });
                        yPos += 0.6;
                    });
                } else if (slideData.layout === 'thank_you') {
                    slide.addText('Thank You', {
                        x: 1, y: 2.5, w: 8, h: 1.5,
                        fontSize: 64, bold: true, color: '60a5fa', // blue-400
                        align: 'center', valign: 'middle'
                    });
                }
            }

            await pptx.writeFile({ fileName: `${topic.replace(/\s+/g, '_')}_Presentation.pptx` });
        } catch (e) {
            console.error("Error generating PPTX:", e);
            alert("Failed to generate PPTX file.");
        } finally {
            setStatus('');
        }
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

                    <div className="space-y-2 group/input">
                        <label className="text-sm font-bold text-indigo-300 uppercase ml-2">Presentation Template</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['General', 'Academic Lecture', 'Business Pitch', 'Technical Deep Dive'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setTemplateType(type)}
                                    className={`p-3 rounded-xl border-2 transition-all font-bold text-xs ${
                                        templateType === type 
                                            ? 'border-violet-500 bg-violet-500/20 text-white' 
                                            : 'border-indigo-500/30 bg-indigo-950/40 text-indigo-300 hover:border-indigo-500/50'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
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
                        <button 
                            onClick={handleExportPptx}
                            disabled={!!status}
                            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                             {status === 'Generating PPTX...' ? <span className="animate-spin">⏳</span> : <span className="text-xl">📊</span>}
                             <span>{status === 'Generating PPTX...' ? 'Saving...' : 'Download PPTX'}</span>
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
                                <SlideRenderer 
                                    key={index} 
                                    slide={slide} 
                                    index={index} 
                                    total={slides.length} 
                                    onImageReplace={handleImageReplace}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


import React, { useState } from 'react';
import { generateReport, humanizeText } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { HumanizeIcon } from './icons/HumanizeIcon';

export const ReportGenerator: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState('');
  const [context, setContext] = useState('');
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHumanizing, setIsHumanizing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !hours || !topic) {
      setError('Hey! We need Subject, Topic, and Hours to make it perfect. 😅');
      return;
    }
    setError('');
    setIsLoading(true);
    setReport('');

    try {
      const result = await generateReport(subject, topic, hours, context);
      setReport(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleHumanize = async () => {
    if (!report) return;
    setIsHumanizing(true);
    setError('');
    
    try {
      const humanizedResult = await humanizeText(report);
      setReport(humanizedResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsHumanizing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(report);
  };
  
  const handleDownload = () => {
    const blob = new Blob([report], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subject.replace(/\s+/g, '_')}_${topic.replace(/\s+/g, '_')}_Report.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Input Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-pink-500/30 transition-colors duration-500">
        
        {/* Doodle Element */}
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-40 h-40 fill-pink-300 animate-[spin_60s_linear_infinite]">
                <path d="M45,-76.3C58.9,-69.3,71.4,-59.1,80.5,-47.1C89.6,-35.1,95.3,-21.2,93.6,-7.9C91.9,5.5,82.7,18.2,73.1,29.9C63.4,41.6,53.2,52.2,41.4,61.1C29.6,70,16.2,77.2,1.9,74.6C-12.4,71.9,-27.6,59.5,-41.2,49.1C-54.8,38.7,-66.8,30.3,-75.4,18.7C-84,7.1,-89.2,-7.7,-85.2,-21.2C-81.3,-34.8,-68.2,-47.1,-54.6,-54.3C-41,-61.5,-26.9,-63.6,-13.7,-64.8C-0.5,-66,12.7,-66.3,31.1,-83.3L45,-76.3Z" transform="translate(100 100)" />
            </svg>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <span className="bg-pink-500 text-white rounded-xl p-2 text-xl shadow-lg shadow-pink-500/30">📝</span>
              Study Report
            </h2>
            <p className="text-indigo-200 font-medium ml-1">Let's finish that assignment in seconds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 group/input">
              <label htmlFor="subject" className="block text-sm font-bold text-pink-300 uppercase tracking-wider ml-2">Subject</label>
              <input 
                type="text" 
                id="subject" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white placeholder-indigo-400/70 focus:ring-4 focus:ring-pink-500/20 focus:border-pink-400 transition-all outline-none font-medium" 
                placeholder="e.g. Maths 📚" 
              />
            </div>

            <div className="space-y-2 group/input">
              <label htmlFor="topic" className="block text-sm font-bold text-violet-300 uppercase tracking-wider ml-2">Topic</label>
              <input 
                type="text" 
                id="topic" 
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white placeholder-indigo-400/70 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-400 transition-all outline-none font-medium" 
                placeholder="e.g. Differentiation 📉" 
              />
            </div>

            <div className="space-y-2 group/input">
              <label htmlFor="hours" className="block text-sm font-bold text-cyan-300 uppercase tracking-wider ml-2">Hours</label>
              <input 
                type="number" 
                id="hours" 
                value={hours} 
                onChange={e => setHours(e.target.value)} 
                className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white placeholder-indigo-400/70 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all outline-none font-medium" 
                placeholder="e.g. 5 ⏰" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="context" className="block text-sm font-bold text-yellow-300 uppercase tracking-wider ml-2">
              Video Links <span className="text-indigo-300 normal-case font-semibold opacity-75">(Optional - We can pick for you!)</span>
            </label>
            <textarea 
              id="context" 
              value={context} 
              onChange={e => setContext(e.target.value)} 
              rows={3} 
              className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white placeholder-indigo-400/70 focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-400 transition-all outline-none resize-none font-medium" 
              placeholder="Paste YouTube links here if you have specific ones... 🎥"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-extrabold text-lg py-5 px-6 rounded-2xl shadow-xl shadow-pink-500/30 transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-2xl">✨</span>
                Cooking up your report...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Magic
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
            )}
          </button>
          
          {error && (
            <div className="bg-red-500/20 border-2 border-red-500/50 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                <span className="text-2xl">🙊</span>
                <p className="text-red-100 font-bold">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Result Card */}
      {report && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl animate-[slideUp_0.5s_ease-out]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 pb-4 border-b border-white/10">
            <h3 className="text-2xl font-black text-pink-300 flex items-center gap-2">
              <span>🎉</span> Report Ready!
            </h3>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
               {/* Humanize Button */}
               <button 
                 onClick={handleHumanize} 
                 disabled={isHumanizing}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border border-amber-400/30 rounded-xl transition font-bold text-white shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {isHumanizing ? (
                     <span className="animate-spin text-xl">⚡</span>
                 ) : (
                     <HumanizeIcon />
                 )}
                 <span>{isHumanizing ? 'Humanizing...' : 'Humanize (Pro)'}</span>
               </button>

              <button onClick={handleDownload} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600/20 hover:bg-cyan-600/40 border-2 border-cyan-500 text-cyan-200 rounded-xl transition font-bold active:scale-95 shadow-lg shadow-cyan-500/20">
                <DownloadIcon />
                <span>Save .docx</span>
              </button>

              <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-indigo-900/50 hover:bg-indigo-800 border-2 border-indigo-700 rounded-xl transition font-bold text-indigo-100 active:scale-95">
                <ClipboardIcon />
              </button>
            </div>
          </div>
          <div className="bg-indigo-950/80 p-6 rounded-2xl border-2 border-indigo-800/50 max-h-[600px] overflow-y-auto shadow-inner relative">
             {isHumanizing && (
                <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                    <div className="text-center p-6 bg-indigo-900/90 rounded-2xl border border-amber-500/30 shadow-2xl">
                        <div className="text-4xl mb-3 animate-bounce">🧬</div>
                        <h4 className="text-xl font-bold text-amber-300">Infusing Human DNA...</h4>
                        <p className="text-indigo-200 text-sm mt-1">Removing AI patterns using Gemini Pro</p>
                    </div>
                </div>
             )}
             <pre className="text-indigo-100 whitespace-pre-wrap font-sans text-base leading-relaxed">{report}</pre>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

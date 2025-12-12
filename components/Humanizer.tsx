
import React, { useState } from 'react';
import { humanizeText } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';

export const Humanizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('Please paste some text to humanize. ✍️');
      return;
    }
    setError('');
    setIsLoading(true);
    setResultText('');

    try {
      const result = await humanizeText(inputText);
      setResultText(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
  };
  
  const handleDownload = () => {
    const blob = new Blob([resultText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Humanized_Text_${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Input Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-colors duration-500">
        
        {/* Background Effect */}
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-amber-500 text-white rounded-xl p-2 text-xl shadow-lg shadow-amber-500/30">😎</span>
                <h2 className="text-3xl font-black text-white">
                  /humanize
                </h2>
                <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    PRO
                </span>
            </div>
            <p className="text-indigo-200 font-medium ml-1">Paste any robotic AI text below. We'll rewrite it to sound like a real student.</p>
          </div>

          <div className="space-y-2 group/input">
            <label htmlFor="inputText" className="block text-sm font-bold text-amber-200 uppercase tracking-wider ml-2">
              Input Text
            </label>
            <textarea 
              id="inputText" 
              value={inputText} 
              onChange={e => setInputText(e.target.value)} 
              rows={8} 
              className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white placeholder-indigo-400/70 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all outline-none resize-none font-medium custom-scrollbar" 
              placeholder="Paste your ChatGPT or Gemini generated content here..."
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-lg py-5 px-6 rounded-2xl shadow-xl shadow-amber-500/30 transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-2xl">⚡</span>
                Humanizing... (Pro)
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Rewrite as Human
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
      {resultText && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl animate-[slideUp_0.5s_ease-out]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 pb-4 border-b border-white/10">
            <h3 className="text-2xl font-black text-amber-300 flex items-center gap-2">
              <span>✍️</span> Humanized Result
            </h3>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-900/50 hover:bg-indigo-800 border-2 border-indigo-700 rounded-xl transition font-bold text-indigo-100 active:scale-95">
                <ClipboardIcon />
                <span>Copy</span>
              </button>
              <button onClick={handleDownload} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-orange-600/20 hover:bg-orange-600/40 border-2 border-orange-500 text-orange-200 rounded-xl transition font-bold active:scale-95 shadow-lg shadow-orange-500/20">
                <DownloadIcon />
                <span>Save .docx</span>
              </button>
            </div>
          </div>
          <div className="bg-indigo-950/80 p-6 rounded-2xl border-2 border-indigo-800/50 max-h-[600px] overflow-y-auto shadow-inner custom-scrollbar">
             <pre className="text-indigo-100 whitespace-pre-wrap font-sans text-base leading-relaxed">{resultText}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

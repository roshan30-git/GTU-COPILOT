
import React, { useState } from 'react';
import { generateBlog } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import Markdown from 'react-markdown';

export const BlogGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('informative');
  const [length, setLength] = useState('500');
  const [blog, setBlog] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      setError('Please enter a topic for your blog post! ✍️');
      return;
    }
    setError('');
    setIsLoading(true);
    setBlog('');

    try {
      const result = await generateBlog(topic, tone, length);
      setBlog(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(blog);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([blog], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${topic.replace(/\s+/g, '_')}_Blog.md`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Input Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
        
        {/* Doodle Element */}
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-40 h-40 fill-emerald-300 animate-[spin_60s_linear_infinite]">
                <path d="M45,-76.3C58.9,-69.3,71.4,-59.1,80.5,-47.1C89.6,-35.1,95.3,-21.2,93.6,-7.9C91.9,5.5,82.7,18.2,73.1,29.9C63.4,41.6,53.2,52.2,41.4,61.1C29.6,70,16.2,77.2,1.9,74.6C-12.4,71.9,-27.6,59.5,-41.2,49.1C-54.8,38.7,-66.8,30.3,-75.4,18.7C-84,7.1,-89.2,-7.7,-85.2,-21.2C-81.3,-34.8,-68.2,-47.1,-54.6,-54.3C-41,-61.5,-26.9,-63.6,-13.7,-64.8C-0.5,-66,12.7,-66.3,31.1,-83.3L45,-76.3Z" transform="translate(100 100)" />
            </svg>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <span className="bg-emerald-500 text-white rounded-xl p-2 text-xl shadow-lg shadow-emerald-500/30">✍️</span>
              Blog Writer
            </h2>
            <p className="text-indigo-200 font-medium ml-1">Create engaging blog posts for your audience.</p>
          </div>

          <div className="space-y-2 group/input">
            <label htmlFor="topic" className="block text-sm font-bold text-emerald-300 uppercase tracking-wider ml-2">Topic / Title</label>
            <input 
              type="text" 
              id="topic" 
              value={topic} 
              onChange={e => setTopic(e.target.value)} 
              className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white placeholder-indigo-400/70 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all outline-none font-medium" 
              placeholder="e.g. The Future of AI in Engineering 🚀" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 group/input">
              <label htmlFor="tone" className="block text-sm font-bold text-teal-300 uppercase tracking-wider ml-2">Tone</label>
              <select 
                id="tone" 
                value={tone} 
                onChange={e => setTone(e.target.value)} 
                className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400 transition-all outline-none font-medium appearance-none"
              >
                <option value="informative">Informative</option>
                <option value="conversational">Conversational</option>
                <option value="technical">Technical</option>
                <option value="inspiring">Inspiring</option>
                <option value="witty">Witty & Fun</option>
              </select>
            </div>

            <div className="space-y-2 group/input">
              <label htmlFor="length" className="block text-sm font-bold text-cyan-300 uppercase tracking-wider ml-2">Approx. Length (Words)</label>
              <select 
                id="length" 
                value={length} 
                onChange={e => setLength(e.target.value)} 
                className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all outline-none font-medium appearance-none"
              >
                <option value="300">Short (~300 words)</option>
                <option value="500">Medium (~500 words)</option>
                <option value="800">Long (~800 words)</option>
                <option value="1200">Deep Dive (~1200 words)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-lg py-5 px-6 rounded-2xl shadow-xl shadow-emerald-500/30 transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-2xl">✨</span>
                Writing your masterpiece...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Blog Post
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
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
      {blog && (
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl animate-[slideUp_0.5s_ease-out]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 pb-4 border-b border-white/10">
            <h3 className="text-2xl font-black text-emerald-300 flex items-center gap-2">
              <span>🎉</span> Blog Post Ready!
            </h3>
            
            <div className="flex gap-2 w-full md:w-auto justify-end">
              <button onClick={handleDownload} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600/20 hover:bg-emerald-600/40 border-2 border-emerald-500 text-emerald-200 rounded-xl transition font-bold active:scale-95 shadow-lg shadow-emerald-500/20">
                <DownloadIcon />
                <span>Save .md</span>
              </button>

              <button onClick={handleCopy} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-indigo-900/50 hover:bg-indigo-800 border-2 border-indigo-700 rounded-xl transition font-bold text-indigo-100 active:scale-95">
                <ClipboardIcon />
              </button>
            </div>
          </div>
          <div className="bg-indigo-950/80 p-8 rounded-2xl border-2 border-indigo-800/50 max-h-[800px] overflow-y-auto shadow-inner prose prose-invert prose-emerald max-w-none">
             <Markdown>{blog}</Markdown>
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

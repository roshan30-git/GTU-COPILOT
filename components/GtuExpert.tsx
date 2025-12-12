
import React, { useState } from 'react';
import { getExpertAnswer, generateInfographic, generateQuiz } from '../services/geminiService';

// Simple Markdown Parser Component for better text rendering
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  
  return (
    <div className="space-y-4 text-left">
      {lines.map((line, index) => {
        if (!line.trim()) return <div key={index} className="h-2"></div>;

        // Headers (Lines starting with ## or strictly uppercase labels like "WHY IT MATTERS")
        if (line.startsWith('## ') || /^[A-Z\s\/]+$/.test(line) && line.length < 50) {
          return (
            <h3 key={index} className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200 mt-6 mb-2 border-b border-emerald-500/30 pb-2 inline-block">
              {line.replace('## ', '')}
            </h3>
          );
        }

        // List items
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
             const content = line.trim().substring(2);
             const parts = content.split(/(\*\*.*?\*\*)/g);
             return (
                <div key={index} className="flex items-start gap-3 ml-4">
                    <span className="text-emerald-400 mt-1.5 text-xs">●</span>
                    <p className="text-indigo-100 leading-relaxed flex-1">
                        {parts.map((part, i) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                return <span key={i} className="font-bold text-emerald-300">{part.slice(2, -2)}</span>;
                            }
                            return <span key={i}>{part}</span>;
                        })}
                    </p>
                </div>
             );
        }

        // Standard Paragraphs with Bold parsing
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={index} className="text-indigo-100 leading-relaxed">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <span key={i} className="font-bold text-emerald-300">{part.slice(2, -2)}</span>;
              }
              return <span key={i}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

export const GtuExpert: React.FC = () => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [error, setError] = useState('');
    const [isZoomed, setIsZoomed] = useState(false);

    // Quiz State
    const [quizData, setQuizData] = useState<any[]>([]);
    const [quizStatus, setQuizStatus] = useState<'idle' | 'loading' | 'active' | 'finished'>('idle');
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) {
            setError('Ask me anything! I am listening. 👂');
            return;
        }
        setError('');
        setIsLoading(true);
        setAnswer('');
        setImageUrl('');
        setIsImageLoading(false);
        setIsZoomed(false);
        
        // Reset Quiz
        setQuizStatus('idle');
        setQuizData([]);
        setScore(0);
        setCurrentQIndex(0);

        try {
            // 1. Get the text answer first
            const result = await getExpertAnswer(query);
            
            // 2. Parse the result to separate text and image prompt
            const splitMarker = "INFOGRAPHIC DIAGRAM PROMPT";
            const parts = result.split(splitMarker);
            
            // Display the text part immediately
            setAnswer(parts[0].trim());
            setIsLoading(false);

            // 3. If there is a prompt part, generate the image in the background
            if (parts.length > 1 && parts[1].trim()) {
                setIsImageLoading(true);
                try {
                    const generatedImage = await generateInfographic(parts[1].trim());
                    if (generatedImage) {
                        setImageUrl(generatedImage);
                    }
                } catch (imgError) {
                    console.error("Failed to generate image", imgError);
                } finally {
                    setIsImageLoading(false);
                }
            }

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const handleStartQuiz = async () => {
        if (!answer) return;
        setQuizStatus('loading');
        try {
            const questions = await generateQuiz(answer);
            if (questions && questions.length > 0) {
                setQuizData(questions);
                setQuizStatus('active');
                setCurrentQIndex(0);
                setScore(0);
                setSelectedOption(null);
                setIsAnswered(false);
            } else {
                setError("Could not generate a quiz for this topic. Try another.");
                setQuizStatus('idle');
            }
        } catch (e) {
            setError("Quiz generation failed.");
            setQuizStatus('idle');
        }
    };

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        
        setSelectedOption(index);
        setIsAnswered(true);
        
        const currentQ = quizData[currentQIndex];
        if (index === currentQ.correctIndex) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQIndex + 1 < quizData.length) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setQuizStatus('finished');
        }
    };

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-500">
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                            <span className="bg-emerald-500 text-white rounded-xl p-2 text-xl shadow-lg shadow-emerald-500/30">🧠</span>
                            GTU Expert
                        </h2>
                        <p className="text-indigo-200 font-medium ml-1">Stuck on a concept? I can explain it simply.</p>
                    </div>

                    <div className="space-y-2 group/input">
                         <label htmlFor="query" className="block text-sm font-bold text-emerald-300 uppercase tracking-wider ml-2">Your Question</label>
                        <textarea 
                            id="query" 
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            rows={4} 
                            className="w-full bg-indigo-950/60 border-2 border-indigo-500/30 rounded-2xl p-4 text-white placeholder-indigo-400/70 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all outline-none resize-none font-medium leading-relaxed" 
                            placeholder="e.g. What is the difference between BFS and DFS? 🤔"
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-lg py-5 px-6 rounded-2xl shadow-xl shadow-emerald-500/30 transform transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin text-2xl">⚙️</span>
                                Thinking...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Ask the Expert
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </span>
                        )}
                    </button>
                    {error && (
                         <div className="bg-red-500/20 border-2 border-red-500/50 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                            <span className="text-2xl">⚠️</span>
                            <p className="text-red-100 font-bold">{error}</p>
                        </div>
                    )}
                </form>
            </div>

            {(answer || isLoading) && (
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl animate-[slideUp_0.5s_ease-out]">
                    <h3 className="text-2xl font-black text-emerald-300 mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                        <span>🤓</span> Expert Says:
                    </h3>
                    
                    {isLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-3/4"></div>
                            <div className="h-4 bg-white/10 rounded w-full"></div>
                            <div className="h-4 bg-white/10 rounded w-5/6"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                             {/* Improved Markdown Rendering */}
                             <SimpleMarkdown text={answer} />
                            
                            {isImageLoading && (
                                <div className="border-2 border-dashed border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center justify-center bg-black/20 text-emerald-200">
                                    <div className="text-4xl animate-bounce mb-2">🎨</div>
                                    <p className="font-bold animate-pulse">Drawing a diagram for you...</p>
                                </div>
                            )}

                            {imageUrl && (
                                <div className="mt-8">
                                    <h4 className="text-lg font-bold text-emerald-300 mb-4 uppercase tracking-wider">Visual Infographic <span className="text-xs normal-case text-emerald-100/50 font-medium ml-2">(Click to zoom)</span></h4>
                                    
                                    <div 
                                        className="rounded-2xl overflow-hidden border-4 border-emerald-500/20 shadow-2xl bg-white cursor-zoom-in group/image relative transition-all hover:scale-[1.01] hover:shadow-emerald-500/20"
                                        onClick={() => setIsZoomed(true)}
                                    >
                                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors z-10 flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                                            <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md">🔍 Zoom In</span>
                                        </div>
                                        <img src={imageUrl} alt="AI Generated Infographic" className="w-full h-auto object-cover" />
                                    </div>
                                    <p className="text-xs text-center text-indigo-400 mt-2">Generated by Gemini 2.5 Flash Image (Nano Banana)</p>
                                </div>
                            )}

                            {/* QUIZ SECTION */}
                            <div className="pt-8 border-t border-white/10">
                                {quizStatus === 'idle' && (
                                    <button 
                                        onClick={handleStartQuiz}
                                        className="w-full py-4 bg-indigo-900/50 border-2 border-indigo-700/50 hover:bg-indigo-800/80 hover:border-emerald-500/50 rounded-2xl transition-all duration-300 group flex flex-col items-center justify-center gap-2"
                                    >
                                        <span className="text-3xl group-hover:scale-110 transition-transform">🧐</span>
                                        <span className="font-bold text-lg text-emerald-300">Test Your Knowledge</span>
                                        <span className="text-sm text-indigo-300">Generate a 5-question quiz based on this answer</span>
                                    </button>
                                )}

                                {quizStatus === 'loading' && (
                                    <div className="text-center py-8">
                                        <div className="animate-spin text-4xl mb-4">🌀</div>
                                        <p className="text-emerald-200 font-bold">Preparing tough questions...</p>
                                    </div>
                                )}

                                {quizStatus === 'active' && quizData.length > 0 && (
                                    <div className="bg-indigo-950/50 rounded-2xl p-6 border-2 border-emerald-500/20">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Question {currentQIndex + 1} / {quizData.length}</span>
                                            <span className="text-sm font-bold text-emerald-400">Score: {score}</span>
                                        </div>
                                        
                                        <h4 className="text-xl font-bold text-white mb-6">
                                            {quizData[currentQIndex].question}
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            {quizData[currentQIndex].options.map((option: string, idx: number) => {
                                                const isSelected = selectedOption === idx;
                                                const isCorrect = idx === quizData[currentQIndex].correctIndex;
                                                
                                                let buttonStyle = "bg-white/5 border-white/10 hover:bg-white/10";
                                                if (isAnswered) {
                                                    if (isCorrect) buttonStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200";
                                                    else if (isSelected) buttonStyle = "bg-red-500/20 border-red-500 text-red-200 opacity-50";
                                                    else buttonStyle = "bg-white/5 border-white/10 opacity-50";
                                                }

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleOptionSelect(idx)}
                                                        disabled={isAnswered}
                                                        className={`p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 ${buttonStyle}`}
                                                    >
                                                        <span className="mr-2 opacity-50">{String.fromCharCode(65 + idx)}.</span> {option}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {isAnswered && (
                                            <div className="animate-[fadeIn_0.3s_ease-out]">
                                                <div className={`p-4 rounded-xl mb-4 ${selectedOption === quizData[currentQIndex].correctIndex ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                                                    <p className="text-sm text-indigo-100">
                                                        <span className="font-bold block mb-1">{selectedOption === quizData[currentQIndex].correctIndex ? '✅ Correct!' : '❌ Incorrect'}</span>
                                                        {quizData[currentQIndex].explanation}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={handleNextQuestion}
                                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all"
                                                >
                                                    {currentQIndex < quizData.length - 1 ? 'Next Question' : 'See Results'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {quizStatus === 'finished' && (
                                    <div className="text-center bg-indigo-950/50 rounded-2xl p-8 border-2 border-emerald-500/30">
                                        <div className="text-6xl mb-4">
                                            {score === quizData.length ? '🏆' : score > quizData.length / 2 ? '👏' : '📚'}
                                        </div>
                                        <h4 className="text-3xl font-black text-white mb-2">Quiz Complete!</h4>
                                        <p className="text-xl text-indigo-200 mb-6">
                                            You scored <span className="text-emerald-400 font-bold">{score}</span> out of <span className="text-white font-bold">{quizData.length}</span>
                                        </p>
                                        
                                        <button 
                                            onClick={handleStartQuiz}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 transition-all"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Zoom Modal */}
            {isZoomed && imageUrl && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out] cursor-zoom-out"
                    onClick={() => setIsZoomed(false)}
                >
                    <div className="relative max-w-full max-h-full flex flex-col items-center">
                         <img 
                            src={imageUrl} 
                            alt="Full Size Infographic" 
                            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                         />
                         <p className="text-white/50 text-center mt-4 text-sm font-medium bg-black/50 px-4 py-1 rounded-full backdrop-blur-md">Click anywhere to close</p>
                    </div>
                </div>
            )}
        </div>
    );
};

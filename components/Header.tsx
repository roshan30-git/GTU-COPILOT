import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-10 md:mb-12 relative group select-none">
      
      {/* Mascot & Title Container */}
      <div className="flex flex-col items-center justify-center">
        
        {/* Animated Mascot Placeholder (CSS/Emoji) */}
        <div className="mb-4 relative">
          <div className="text-6xl md:text-7xl animate-[bounce_3s_infinite]">🤖</div>
          <div className="absolute -top-2 -right-4 rotate-12 bg-yellow-400 text-indigo-900 text-xs font-black px-2 py-1 rounded-lg shadow-lg border-2 border-indigo-900">
            BETA
          </div>
        </div>

        <div className="relative inline-block">
            {/* Title Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition duration-500"></div>
            
            <h1 className="relative text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-md">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">GTU</span> Copilot
            </h1>
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-3 mt-4">
        <span className="bg-indigo-800/50 text-indigo-200 px-4 py-1.5 rounded-full text-sm font-bold border border-indigo-700/50 backdrop-blur-md flex items-center gap-2">
          <span>✨</span> AI Academic Wingman
        </span>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { ReportGenerator } from './components/ReportGenerator';
import { PptMaker } from './components/PptMaker';
import { GtuExpert } from './components/GtuExpert';
import { PhysicsModelGenerator } from './components/PhysicsModelGenerator';
import { Humanizer } from './components/Humanizer';
import { Capability } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Capability>(Capability.REPORT);

  const renderContent = () => {
    switch (activeTab) {
      case Capability.REPORT:
        return <ReportGenerator />;
      case Capability.PHYSICS:
        return <PhysicsModelGenerator />;
      case Capability.PPT:
        return <PptMaker />;
      case Capability.EXPERT:
        return <GtuExpert />;
      case Capability.HUMANIZE:
        return <Humanizer />;
      default:
        return <ReportGenerator />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Ambient Background Glows - Vibrant & Fun */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse duration-[4s]"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse duration-[5s]"></div>
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-yellow-400/10 rounded-full blur-[80px] pointer-events-none mix-blend-screen animate-bounce duration-[10s]"></div>
      
      {/* Extra glow for Physics tab */}
      {activeTab === Capability.PHYSICS && (
          <div className="fixed top-[60%] right-[20%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen transition-opacity duration-1000"></div>
      )}

      {/* Extra glow for Humanize tab */}
      {activeTab === Capability.HUMANIZE && (
          <div className="fixed top-[50%] left-[20%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen transition-opacity duration-1000"></div>
      )}

      <div className="container mx-auto p-4 md:p-8 max-w-5xl relative z-10">
        <Header />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="mt-8 transition-all duration-500 ease-in-out">
          <div className="backdrop-blur-none">
            {renderContent()}
          </div>
        </main>
        
        <footer className="text-center mt-16 pb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="text-indigo-200 font-medium text-sm">Made with 💜 for GTU Students</span>
            <span className="text-xs text-indigo-400">•</span>
            <span className="text-pink-300 font-bold text-sm">Study Smarter</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
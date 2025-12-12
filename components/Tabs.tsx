
import React from 'react';
import { Capability } from '../types';
import { ReportIcon } from './icons/ReportIcon';
import { PresentationIcon } from './icons/PresentationIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { AtomIcon } from './icons/AtomIcon';
import { HumanizeIcon } from './icons/HumanizeIcon';

interface TabsProps {
  activeTab: Capability;
  setActiveTab: (tab: Capability) => void;
}

const tabConfig = [
  { 
    id: Capability.REPORT, 
    label: 'Report Writer', 
    icon: <ReportIcon />, 
    color: 'from-pink-500 to-rose-500', 
    shadow: 'shadow-pink-500/40' 
  },
  { 
    id: Capability.HUMANIZE, 
    label: '/humanize', 
    icon: <HumanizeIcon />, 
    color: 'from-amber-400 to-orange-500', 
    shadow: 'shadow-amber-500/40' 
  },
  { 
    id: Capability.PHYSICS, 
    label: 'Physics Model', 
    icon: <AtomIcon />, 
    color: 'from-blue-500 to-indigo-600', 
    shadow: 'shadow-blue-500/40' 
  },
  { 
    id: Capability.PPT, 
    label: 'PPT Maker', 
    icon: <PresentationIcon />, 
    color: 'from-violet-500 to-purple-600', 
    shadow: 'shadow-violet-500/40' 
  },
  { 
    id: Capability.EXPERT, 
    label: 'Ask Expert', 
    icon: <SparklesIcon />, 
    color: 'from-cyan-400 to-teal-500', 
    shadow: 'shadow-cyan-400/40' 
  },
];

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex flex-wrap justify-center items-center gap-3 bg-indigo-950/40 backdrop-blur-xl border-2 border-white/10 p-2 rounded-[2rem] shadow-xl">
        {tabConfig.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-5 py-3 rounded-[1.5rem] text-sm md:text-base font-bold transition-all duration-300 ease-out flex items-center gap-2 overflow-hidden
                ${isActive 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg ${tab.shadow} scale-105` 
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              
              {isActive && (
                <div className="absolute top-0 right-0 p-1">
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
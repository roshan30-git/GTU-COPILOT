
import React from 'react';
import Markdown from 'react-markdown';

const blogContent = `
# GTU Copilot: Revolutionizing Engineering Studies with AI 🚀

Welcome to the future of academic productivity! If you're a student at **Gujarat Technological University (GTU)**, you know the struggle: endless assignments, complex physics models, last-minute presentations, and the constant pressure to keep up with the syllabus. 

That's exactly why we built **GTU Copilot** — your ultimate AI Academic Wingman.

---

## What is GTU Copilot? 🤔

GTU Copilot is a specialized AI-powered platform designed specifically for the needs of engineering students. It's not just another chatbot; it's a suite of tools crafted to handle the heavy lifting of your academic life, allowing you to focus on what actually matters: **learning.**

---

## Core Features That Save Your Semester 🛠️

### 1. 📝 The Report Writer
Struggling to write that 5-page study report? Our Report Writer takes your subject, topic, and study hours to generate a formal, submission-ready report. It even includes relevant video references and formulas!

### 2. 🧬 Physics Model Generator
Need a project idea for your physics lab? GTU Copilot generates creative project ideas based on your budget and interests. Once you pick one, it builds a full academic report with aim, apparatus, principle, and even schematic diagrams.

### 3. 📊 PPT Maker
Presentations shouldn't take all night. Enter your topic, and we'll generate a structured slide deck with content and layout suggestions, ready for you to polish.

### 4. ✨ /humanize (Pro Feature)
AI-generated text can sometimes feel robotic. Our humanizer tool infuses "human DNA" into your reports, making them sound like they were written by a diligent student, not an algorithm.

### 5. 💡 Ask Expert
Got a specific question about a concept? Our Expert Tutor gives you concise, high-value explanations with memory aids and visual prompts.

---

## Why GTU Students Love It ❤️

- **Tailored for GTU:** The tone, structure, and subjects are aligned with GTU's academic style.
- **Vibrant & Fun UI:** We believe study tools shouldn't be boring. Our interface is designed to keep you engaged.
- **Time-Saving:** What used to take hours now takes seconds. 

---

## What's Next? 🔮

We're constantly updating GTU Copilot. Expect more subjects, better diagram generation, and even more "human-like" writing capabilities in the coming weeks.

**Study Smarter, Not Harder.**

---
*Made with 💜 for the GTU Community.*
`;

export const Blog: React.FC = () => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-64 h-64 fill-indigo-300 animate-[pulse_4s_infinite]">
                <path d="M45,-76.3C58.9,-69.3,71.4,-59.1,80.5,-47.1C89.6,-35.1,95.3,-21.2,93.6,-7.9C91.9,5.5,82.7,18.2,73.1,29.9C63.4,41.6,53.2,52.2,41.4,61.1C29.6,70,16.2,77.2,1.9,74.6C-12.4,71.9,-27.6,59.5,-41.2,49.1C-54.8,38.7,-66.8,30.3,-75.4,18.7C-84,7.1,-89.2,-7.7,-85.2,-21.2C-81.3,-34.8,-68.2,-47.1,-54.6,-54.3C-41,-61.5,-26.9,-63.6,-13.7,-64.8C-0.5,-66,12.7,-66.3,31.1,-83.3L45,-76.3Z" transform="translate(100 100)" />
            </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="bg-indigo-950/80 p-8 md:p-12 rounded-3xl border-2 border-indigo-800/50 shadow-inner prose prose-invert prose-indigo max-w-none selection:bg-pink-500 selection:text-white">
             <Markdown>{blogContent}</Markdown>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

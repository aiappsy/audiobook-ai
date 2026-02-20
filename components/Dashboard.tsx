
import React, { useState } from 'react';
import { ProVersion, GroundingSource } from '../types';
import VisualInsights from './VisualInsights';
import { generateAudioBrief } from '../services/geminiService';

interface Props {
  pro: ProVersion;
  imageUrl: string | null;
  sources: GroundingSource[];
}

const Dashboard: React.FC<Props> = ({ pro, imageUrl, sources }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    try {
      setIsPlaying(true);
      const audioBuffer = await generateAudioBrief(pro.executiveSummary);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Sidebar: Visuals & References */}
      <div className="lg:col-span-4 space-y-6">
        {imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            <img src={imageUrl} alt="Conceptual Metaphor" className="w-full h-auto object-cover" />
          </div>
        )}
        
        <VisualInsights concepts={pro.keyConcepts} />

        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Grounding Sources</h3>
          <ul className="space-y-3">
            {sources.map((s, idx) => (
              <li key={idx}>
                <a 
                  href={s.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2 group transition-colors"
                >
                  <i className="fa-solid fa-link text-xs"></i>
                  <span className="truncate">{s.title}</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </a>
              </li>
            ))}
            {sources.length === 0 && <li className="text-slate-500 text-sm">No external sources cited.</li>}
          </ul>
        </div>
      </div>

      {/* Main Content: Pro Analysis */}
      <div className="lg:col-span-8 space-y-10 pb-20">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-serif text-slate-100">Executive Summary</h2>
            <button 
              onClick={handlePlayAudio}
              disabled={isPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isPlaying 
                ? 'bg-indigo-500/20 text-indigo-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
              {isPlaying ? 'Narrating...' : 'Listen to Brief'}
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed text-lg font-light italic border-l-4 border-indigo-500 pl-6 py-2">
            "{pro.executiveSummary}"
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
              <i className="fa-solid fa-landmark"></i> Historical Context
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">{pro.historicalContext}</p>
          </div>
          <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
              <i className="fa-solid fa-bolt"></i> Contemporary Relevance
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">{pro.contemporaryRelevance}</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-slate-100 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-sm font-sans">01</span>
            Key Concept Mastery
          </h2>
          <div className="space-y-4">
            {pro.keyConcepts.map((concept, idx) => (
              <div key={idx} className="group p-5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 transition-all hover:bg-slate-800/40">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-slate-200 font-semibold">{concept.title}</h4>
                  <span className="px-2 py-1 bg-slate-800 text-[10px] rounded text-slate-500 uppercase tracking-tighter">Impact: {concept.importance}%</span>
                </div>
                <p className="text-slate-400 text-sm">{concept.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-slate-100 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-sm font-sans">02</span>
            Actionable Intelligence
          </h2>
          <ul className="space-y-3">
            {pro.actionableInsights.map((insight, idx) => (
              <li key={idx} className="flex gap-4 items-start bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                <i className="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
                <span className="text-slate-300 text-sm font-medium">{insight}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-slate-100 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-sm font-sans">03</span>
            Structural Breakdown
          </h2>
          <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8">
            {pro.chapterBreakdown.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-slate-800 border-4 border-slate-900"></div>
                <h4 className="text-slate-200 font-bold mb-1">{item.chapter}</h4>
                <p className="text-slate-400 text-sm">{item.keyTakeaway}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

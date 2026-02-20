
import React, { useState, useCallback } from 'react';
import { AppState, BookData } from './types';
import { generateProVersion, generateBookImage } from './services/geminiService';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isGenerating: false,
    bookData: null,
    proVersion: null,
    imageUrl: null,
    groundingSources: [],
    error: null,
  });

  const [inputTitle, setInputTitle] = useState('');
  const [inputAuthor, setInputAuthor] = useState('');

  const handleGenerate = async () => {
    if (!inputTitle || !inputAuthor) {
      setState(prev => ({ ...prev, error: "Please enter both title and author." }));
      return;
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null, proVersion: null }));

    try {
      const book: BookData = { title: inputTitle, author: inputAuthor };
      
      // Fix: Resolve sequential dependency. We need the pro analysis result 
      // to obtain the 'visualMetaphorPrompt' for the image generation.
      const proResult = await generateProVersion(book);

      // Now we can generate the image using the derived visual metaphor prompt
      const finalImage = await generateBookImage(proResult.pro.visualMetaphorPrompt);

      setState({
        isGenerating: false,
        bookData: book,
        proVersion: proResult.pro,
        imageUrl: finalImage,
        groundingSources: proResult.sources,
        error: null
      });
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: err.message || "An error occurred while generating the pro version." 
      }));
    }
  };

  const handleReset = () => {
    setState({
      isGenerating: false,
      bookData: null,
      proVersion: null,
      imageUrl: null,
      groundingSources: [],
      error: null,
    });
    setInputTitle('');
    setInputAuthor('');
  };

  return (
    <div className="min-h-screen selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <i className="fa-solid fa-book-open-reader text-xl"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">BookPro AI</h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-slate-500 text-sm hidden sm:inline">Professional Transformation Suite</span>
          <a href="https://github.com" target="_blank" className="text-slate-400 hover:text-white transition-colors">
            <i className="fa-brands fa-github text-xl"></i>
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {!state.proVersion && !state.isGenerating && (
          <div className="flex flex-col items-center text-center space-y-12 py-20 animate-in fade-in duration-1000">
            <div className="space-y-4">
              <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
                AI-Powered Executive Analysis
              </span>
              <h2 className="text-5xl md:text-7xl font-serif leading-tight">
                Any book. <br />
                <span className="text-indigo-500">Mastered.</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                Upload any literary work to generate a high-end professional digest including executive summaries, 
                conceptual mapping, visual metaphors, and actionable intelligence.
              </p>
            </div>

            <div className="w-full max-w-xl bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-2 ml-1">Book Title</label>
                  <input 
                    type="text"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="e.g. Thinking, Fast and Slow"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-bold uppercase mb-2 ml-1">Author Name</label>
                  <input 
                    type="text"
                    value={inputAuthor}
                    onChange={(e) => setInputAuthor(e.target.value)}
                    placeholder="e.g. Daniel Kahneman"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <i className="fa-solid fa-wand-sparkles"></i>
                  Upgrade to Pro Version
                </button>
                {state.error && <p className="text-red-400 text-sm animate-pulse">{state.error}</p>}
              </div>
            </div>
          </div>
        )}

        {state.isGenerating && (
          <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-brain text-indigo-500 text-2xl animate-pulse"></i>
              </div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-serif">Deconstructing Narratives...</h3>
              <p className="text-slate-500 max-w-sm">Our Gemini models are currently analyzing the architectural themes and extracting executive-level intelligence.</p>
              <div className="flex gap-2 justify-center mt-4">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        {state.proVersion && !state.isGenerating && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
              <div>
                <button 
                  onClick={handleReset}
                  className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 hover:text-indigo-300 transition-colors"
                >
                  <i className="fa-solid fa-arrow-left"></i> Analyze New Book
                </button>
                <h1 className="text-4xl md:text-5xl font-serif">{state.bookData?.title}</h1>
                <p className="text-slate-400 text-xl font-light mt-2">A Professional Synthesis of {state.bookData?.author}'s Work</p>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                  <i className="fa-solid fa-download"></i> Export PDF
                </button>
                <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
                  <i className="fa-solid fa-share-nodes"></i> Share Brief
                </button>
              </div>
            </div>

            <Dashboard 
              pro={state.proVersion} 
              imageUrl={state.imageUrl} 
              sources={state.groundingSources} 
            />
          </div>
        )}
      </main>

      <footer className="p-12 text-center text-slate-600 text-sm border-t border-slate-900 mt-20">
        <p>&copy; 2024 BookPro AI - Built with Gemini 3 Pro & Flash</p>
        <p className="mt-2 text-slate-700">Powered by high-intelligence reasoning and grounding.</p>
      </footer>
    </div>
  );
};

export default App;

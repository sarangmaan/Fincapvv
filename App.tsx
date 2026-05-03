import React, { useState, useEffect } from 'react';
import { ViewState, AnalysisResult, PortfolioItem } from './types';
import AnalysisView from './components/AnalysisView';
import PortfolioView from './components/PortfolioView';
import BubbleScopeView from './components/BubbleScopeView';
import SearchBar from './components/SearchBar';
import Logo from './components/Logo';
import BackgroundGraph from './components/BackgroundGraph';
import { BarChart3, AlertTriangle, DollarSign, PieChart, Activity, Loader2, ScanLine } from 'lucide-react';
import { analyzeMarket, analyzePortfolio, analyzeBubbles } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [query, setQuery] = useState('');
  const [analyzedQuery, setAnalyzedQuery] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListView, setIsListView] = useState(false);

  // Portfolio State
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('fincap_portfolio');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('fincap_portfolio', JSON.stringify(portfolioItems));
  }, [portfolioItems]);

  // Safety Timeout
  useEffect(() => {
    let safetyTimer: ReturnType<typeof setTimeout>;
    if (loading) {
        safetyTimer = setTimeout(() => {
            if (loading) {
                console.warn("Analysis timed out via watchdog.");
                setLoading(false);
                setError("The analysis service is taking unusually long. This might be due to API rate limits or network congestion. Please try a simpler search or try again in 30 seconds.");
                setView(ViewState.ERROR);
            }
        }, 60000); // Reduced to 1 minute for better UX
    }
    return () => clearTimeout(safetyTimer);
  }, [loading]);

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = [
    "Initiating Forensic Scan...",
    "Bypassing Institutional Firewalls...",
    "Scrubbing Dark Pool Data...",
    "Auditing Shadow Balance Sheets...",
    "detecting irrational exuberance...",
    "Correlating Macro Divergence...",
    "Syncing with Global Indices...",
    "Finalizing Forensic Verdict..."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
        interval = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleUpdatePortfolio = (items: PortfolioItem[]) => {
    setPortfolioItems(items);
  };

  const performAnalysis = async (searchQuery: string, displayQuery?: string, isListMode: boolean = false) => {
    if (!searchQuery.trim()) return;

    // INTERCEPT: "Analyse the bubbl" typo or specific intent
    if (searchQuery.toLowerCase().includes('analyse the bubbl') || searchQuery.toLowerCase().includes('analyze the bubbl')) {
        handleBubbleScope();
        return;
    }

    setLoading(true);
    setError(null);
    setAnalyzedQuery(displayQuery || searchQuery);
    setIsListView(isListMode);
    
    // Show ANALYZING view first
    setResult({ markdownReport: "", isEstimated: false });
    setView(ViewState.ANALYZING);

    try {
      await analyzeMarket(searchQuery, (partialResult) => {
          setResult((prev) => {
             const newData = {
                markdownReport: partialResult.markdownReport || prev?.markdownReport || "",
                structuredData: partialResult.structuredData || prev?.structuredData,
                groundingChunks: partialResult.groundingChunks || prev?.groundingChunks,
                isEstimated: partialResult.isEstimated
             };
             
             if (newData.markdownReport.length > 20) {
                 setView((current) => current === ViewState.ANALYZING ? ViewState.REPORT : current);
             }

             return newData;
          });
      });
      
      setView(ViewState.REPORT);

    } catch (err: any) {
      console.error("Search Analysis Failed:", err);
      let msg = err.message || 'Something went wrong.';
      if (msg.includes('503') || msg.includes('overloaded') || msg.includes('429')) {
          msg = "High traffic or rate limit reached. Please try again in a moment.";
      }
      setError(msg);
      setView(ViewState.ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setQuery(q);
      performAnalysis(q, undefined, false);
    }
  }, []);

  const handleAnalyzePortfolio = async () => {
    if (portfolioItems.length === 0) return;
    setLoading(true);
    setError(null);
    setAnalyzedQuery("Portfolio Risk Audit");
    setIsListView(false);
    
    setResult({ markdownReport: "", isEstimated: false });
    setView(ViewState.ANALYZING);

    try {
      await analyzePortfolio(portfolioItems, (partialResult) => {
          setResult((prev) => {
             const newData = {
                markdownReport: partialResult.markdownReport || prev?.markdownReport || "",
                structuredData: partialResult.structuredData || prev?.structuredData,
                groundingChunks: partialResult.groundingChunks || prev?.groundingChunks,
                isEstimated: partialResult.isEstimated
             };
             
             if (newData.markdownReport.length > 20) {
                 setView((current) => current === ViewState.ANALYZING ? ViewState.REPORT : current);
             }
             return newData;
          });
      });
      setView(ViewState.REPORT);
    } catch (err: any) {
      setError(err.message || 'Portfolio analysis failed.');
      setView(ViewState.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleBubbleScope = async () => {
      setLoading(true);
      setError(null);
      setAnalyzedQuery("Global Market Bubble Scope");
      setResult({ markdownReport: "Initiating Global Market Scan...", isEstimated: false });
      setView(ViewState.BUBBLE_SCOPE);
      
      try {
          await analyzeBubbles((partialResult) => {
              setResult((prev) => ({
                  markdownReport: partialResult.markdownReport || prev?.markdownReport || "",
                  structuredData: partialResult.structuredData || prev?.structuredData,
                  groundingChunks: partialResult.groundingChunks || prev?.groundingChunks,
                  isEstimated: partialResult.isEstimated
              }));
          });
      } catch (err: any) {
          setError(err.message || 'Bubble Scope analysis failed.');
          setView(ViewState.ERROR);
      } finally {
          setLoading(false);
      }
  };
  
  const handleRetry = () => {
    setView(ViewState.DASHBOARD);
    setError(null);
    setQuery('');
  };

  const handleNavClick = (viewName: string) => {
      if (viewName === 'Portfolio') {
        setView(ViewState.PORTFOLIO);
      }
      else if (viewName === 'Markets') {
        setView(ViewState.DASHBOARD);
      }
      else if (viewName === 'Bubble Scope') {
         setResult(null);
         setView(ViewState.BUBBLE_SCOPE);
      }
  };

  // Determine Background Class based on View
  // Use a deep violet/purple for REPORT to satisfy "light purple" request while keeping dark mode.
  const bgClass = view === ViewState.REPORT 
    ? 'bg-gradient-to-br from-violet-950 via-purple-900 to-slate-950' 
    : 'bg-[#020617]';

  return (
    <div 
      className="relative min-h-screen text-white font-sans selection:bg-sky-500/30 overflow-x-hidden"
    >
      {/* 
         BACKGROUND LAYER STACK (Positive Z-Indexes for reliability)
      */}
      
      {/* 1. Solid Base Color */}
      <div className={`fixed inset-0 transition-colors duration-1000 ease-in-out z-0 ${bgClass}`}></div>
      
      {/* 2. Live Graph (z-index: 10 set in component) */}
      <BackgroundGraph />
      
      {/* 3. Grid Overlay */}
      <div className="perspective-grid fixed inset-0 pointer-events-none z-20"></div>
      
      {/* 4. Ambient Glows */}
      <div className={`fixed top-[-20%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full z-20 pointer-events-none animate-pulse-slow transition-colors duration-1000 ${view === ViewState.REPORT ? 'bg-fuchsia-600/20' : 'bg-sky-900/20'}`}></div>
      <div className={`fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full z-20 pointer-events-none animate-pulse-slow transition-colors duration-1000 ${view === ViewState.REPORT ? 'bg-purple-600/20' : 'bg-indigo-900/20'}`}></div>

      {/* 5. Film Grain */}
      <div className="bg-grain fixed inset-0 z-30 pointer-events-none"></div>

      {/* MAIN CONTENT (z-40) */}
      <div className="relative z-40 flex flex-col min-h-screen pt-6 pb-6 px-4 md:px-8">
        {/* Navigation */}
        <nav className="sticky top-4 z-50 bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl border border-white/10 mb-8 md:mb-10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] transition-all duration-300 hover:border-white/20">
          <div className="px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => { setView(ViewState.DASHBOARD); handleNavClick('Markets'); }}>
              <div className="relative flex items-center justify-center">
                 <div className="absolute inset-0 bg-sky-500/20 blur-md rounded-full group-hover:bg-sky-500/40 transition-all duration-500"></div>
                 <Logo className="w-8 h-8 md:w-9 md:h-9 relative z-10 drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
              </div>
              <span className="font-extrabold text-xl md:text-2xl tracking-tighter text-white group-hover:text-sky-400 transition-colors">Fin<span className="text-sky-500">Cap</span></span>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm font-bold text-slate-400">
              <button onClick={() => handleNavClick('Markets')} className={`px-3 py-2 md:px-5 md:py-2.5 rounded-xl transition-all duration-300 cursor-pointer border border-transparent ${view === ViewState.DASHBOARD || view === ViewState.REPORT || view === ViewState.ANALYZING ? 'text-white bg-slate-800/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border-white/5' : 'hover:text-white hover:bg-white/5'}`}>Markets</button>
              <button onClick={() => handleNavClick('Portfolio')} className={`px-3 py-2 md:px-5 md:py-2.5 rounded-xl transition-all duration-300 cursor-pointer border border-transparent ${view === ViewState.PORTFOLIO ? 'text-white bg-slate-800/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border-white/5' : 'hover:text-white hover:bg-white/5'}`}>Portfolio</button>
              <button onClick={() => handleNavClick('Bubble Scope')} className={`px-3 py-2 md:px-5 md:py-2.5 rounded-xl transition-all duration-300 cursor-pointer flex items-center gap-1 md:gap-2 border border-transparent ${view === ViewState.BUBBLE_SCOPE ? 'bg-rose-950/30 text-rose-400 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'hover:text-rose-400 hover:bg-rose-950/10'}`}>
                 <Activity className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden sm:inline">Bubble Scope</span><span className="sm:hidden">Risk</span>
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-grow w-full max-w-7xl mx-auto">
          
          {/* Search Bar Container */}
          <div className={`mb-12 transition-all duration-700 ease-out ${view === ViewState.DASHBOARD ? 'translate-y-0 opacity-100' : ''} overflow-visible`}>
             <div className={`max-w-4xl mx-auto text-center ${view !== ViewState.DASHBOARD ? 'hidden' : 'block'}`}>
                <div className="inline-block animate-float mb-4 md:mb-6">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-600 rounded-lg blur opacity-30"></div>
                        <div className="relative px-3 py-1 bg-slate-900 rounded-lg border border-slate-700 text-[10px] md:text-xs font-mono text-cyan-400 uppercase tracking-widest">
                            AI-Powered Forensic Analysis v3.3
                        </div>
                    </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6 md:mb-8 drop-shadow-2xl">
                  Predict the Crash. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 animate-pulse">Find the Opportunity.</span>
                </h1>
             </div>
             
             <div className={`max-w-3xl mx-auto ${view === ViewState.REPORT || view === ViewState.PORTFOLIO || view === ViewState.BUBBLE_SCOPE || view === ViewState.ANALYZING ? 'scale-95 opacity-0 h-0 overflow-visible pointer-events-none' : 'overflow-visible'}`}>
               <div className="transform transition-transform duration-300 hover:scale-[1.01]">
                   <SearchBar 
                      query={query} 
                      setQuery={setQuery} 
                      onSearch={(q) => performAnalysis(q, undefined, false)} 
                      loading={loading}
                   />
               </div>

               <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-8 md:mt-10 text-[10px] md:text-xs font-bold text-slate-500 pointer-events-auto">
                  
                  {/* Trending Assets */}
                  <span 
                    className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-700/50 cursor-pointer hover:border-sky-500/50 hover:text-sky-400 transition-all hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:-translate-y-0.5 active:scale-95" 
                    onClick={() => { 
                        setQuery('Top Trending Assets'); 
                        performAnalysis('Analyze current market trends. Identify 4-5 top assets with LOW bubble risk and HIGH growth potential. Return them in the trendingAssets list.', 'Top Trending Assets', true); 
                    }}
                  >
                    🔥 Trending Assets
                  </span>

                  {/* AI Bubble Risk */}
                  <span 
                    className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-700/50 cursor-pointer hover:border-rose-500/50 hover:text-rose-400 transition-all hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:-translate-y-0.5 active:scale-95" 
                    onClick={() => { 
                        setQuery('AI Sector Risk Analysis'); 
                        performAnalysis('Analyze AI Sector Bubble Risk. Identify 4-5 AI assets with HIGH bubble risk. Return them in the topBubbleAssets list.', 'AI Sector Risk Analysis', true); 
                    }}
                  >
                    🤖 AI Bubble Risk
                  </span>

                  {/* Macro Housing */}
                  <span 
                    className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-700/50 cursor-pointer hover:border-emerald-500/50 hover:text-emerald-400 transition-all hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95" 
                    onClick={() => { 
                        setQuery('Housing Market Opportunities'); 
                        performAnalysis('Analyze Housing Market. Identify 4-5 regions or stocks with HIGH growth potential. Return them in the trendingAssets list.', 'Housing Market Opportunities', true); 
                    }}
                  >
                    🏠 Macro Housing
                  </span>

                  {/* Crypto Outlook */}
                  <span 
                    className="px-4 py-2 md:px-5 md:py-2.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-700/50 cursor-pointer hover:border-purple-500/50 hover:text-purple-400 transition-all hover:bg-slate-800 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:-translate-y-0.5 active:scale-95" 
                    onClick={() => { 
                        setQuery('Crypto Market Top Picks'); 
                        performAnalysis('Analyze Crypto Market. Identify 4-5 crypto assets with HIGH potential and good risk-reward. Return them in the trendingAssets list.', 'Crypto Market Top Picks', true); 
                    }}
                  >
                    🪙 Crypto Outlook
                  </span>

               </div>
             </div>
          </div>

          {/* Views */}
          
          {view === ViewState.ANALYZING && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in zoom-in-95 duration-700">
                  <div className="relative mb-10">
                     <div className="absolute inset-0 bg-sky-500 blur-3xl opacity-20 animate-pulse"></div>
                     <div className="relative z-10 bg-slate-900/80 backdrop-blur-xl rounded-full p-6 md:p-8 ring-1 ring-white/10 shadow-[0_0_50px_rgba(14,165,233,0.3)]">
                         <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-sky-400 animate-spin" />
                     </div>
                     <div className="absolute -inset-6 border border-dashed border-sky-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                     <div className="absolute -inset-12 border border-dotted border-sky-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-4 uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-200 to-slate-400 drop-shadow-sm text-center">
                    {loadingMessages[loadingMessageIndex]}
                  </h2>
                  <div className="flex items-center gap-3 text-slate-300 font-mono text-xs md:text-sm bg-slate-900/60 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-xl border border-white/10 shadow-lg max-w-[90vw] overflow-hidden whitespace-nowrap text-ellipsis">
                      <ScanLine className="w-3 h-3 md:w-4 md:h-4 animate-pulse text-sky-400 flex-shrink-0" />
                      <span className="truncate tracking-wider animate-pulse transition-all duration-1000">
                        RUNNING AUDIT ON <span className="text-white font-bold text-sky-300">"{analyzedQuery}"</span>
                      </span>
                  </div>
              </div>
          )}
          
          {view === ViewState.ERROR && (
            <div className="max-w-2xl mx-auto text-center py-12 md:py-20 glass-card rounded-2xl border-rose-500/30 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 ring-1 ring-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                 <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Analysis Halted</h2>
              <p className="text-slate-400 mb-8 md:mb-10 px-6 md:px-8 leading-relaxed text-base md:text-lg">{error}</p>
              <button 
                onClick={handleRetry}
                className="bg-white text-slate-950 hover:bg-sky-50 hover:text-sky-900 px-8 py-3 md:px-10 md:py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 text-sm md:text-base"
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {view === ViewState.PORTFOLIO && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
               <PortfolioView 
                  items={portfolioItems} 
                  onUpdate={handleUpdatePortfolio} 
                  onAnalyze={handleAnalyzePortfolio} 
               />
            </div>
          )}

          {view === ViewState.BUBBLE_SCOPE && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                   <div className="flex items-center justify-between mb-8">
                     <button 
                      onClick={() => { setView(ViewState.DASHBOARD); handleNavClick('Markets'); }}
                      className="text-xs md:text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors px-3 py-2 hover:bg-white/5 rounded-lg"
                     >
                       ← Dashboard
                     </button>
                     <div className="flex items-center gap-3 bg-rose-950/20 px-4 py-2 rounded-lg border border-rose-500/20">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></span>
                         </span>
                         <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Live Risk Monitor</span>
                     </div>
                  </div>
                  <BubbleScopeView data={result} onScan={handleBubbleScope} isLoading={loading} />
              </div>
          )}

          {view === ViewState.REPORT && result && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between mb-8">
                 <button 
                  onClick={() => { setView(ViewState.DASHBOARD); handleNavClick('Markets'); }}
                  className="text-xs md:text-sm font-bold text-slate-400 hover:text-white flex items-center gap-2 transition-colors px-3 py-2 hover:bg-white/5 rounded-lg"
                 >
                   ← Dashboard
                 </button>
              </div>
              <AnalysisView 
                  data={result} 
                  title={analyzedQuery} 
                  isListView={isListView}
                  onAssetClick={(q) => performAnalysis(q, undefined, false)}
              />
            </div>
          )}

          {view === ViewState.DASHBOARD && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-12 md:mt-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
               <div className="glass-card p-6 md:p-10 rounded-3xl group border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-sky-500/20 transition-all duration-300 border border-sky-500/20 group-hover:scale-110 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                     <BarChart3 className="w-7 h-7 md:w-8 md:h-8 text-sky-400" />
                  </div>
                  <h3 className="font-extrabold text-xl md:text-2xl text-white mb-4 group-hover:text-sky-300 transition-colors">Fundamental Scan</h3>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed group-hover:text-slate-300">Automated analysis of P/E, PEG, debt ratios, and cash flow health against sector peers.</p>
               </div>
               
               <div className="glass-card p-6 md:p-10 rounded-3xl group border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-emerald-500/20 transition-all duration-300 border border-emerald-500/20 group-hover:scale-110 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                     <DollarSign className="w-7 h-7 md:w-8 md:h-8 text-emerald-400" />
                  </div>
                  <h3 className="font-extrabold text-xl md:text-2xl text-white mb-4 group-hover:text-emerald-300 transition-colors">Fair Value Audit</h3>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed group-hover:text-slate-300">AI-driven intrinsic valuation models to detect over-hyped assets and hidden gems.</p>
               </div>
               
               <div className="glass-card p-6 md:p-10 rounded-3xl group border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 md:mb-8 group-hover:bg-rose-500/20 transition-all duration-300 border border-rose-500/20 group-hover:scale-110 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                     <PieChart className="w-7 h-7 md:w-8 md:h-8 text-rose-400" />
                  </div>
                  <h3 className="font-extrabold text-xl md:text-2xl text-white mb-4 group-hover:text-rose-300 transition-colors">Bubble Detection</h3>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed group-hover:text-slate-300">Comparative historical analysis to identify unsustainable parabolic moves and crash risks.</p>
               </div>
            </div>
          )}

        </main>
        
        <footer className="mt-24 py-10 border-t border-white/5">
           <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-[10px] text-slate-600 max-w-2xl mx-auto leading-relaxed uppercase tracking-[0.2em] font-mono hover:text-sky-500 transition-colors cursor-help">
                 System Status: Operational // Latency: 12ms // Encryption: AES-256
              </p>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
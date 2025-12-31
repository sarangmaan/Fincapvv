import React, { useState } from 'react';
import { AnalysisResult, FinancialTable, TrendingAsset } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import RiskGauge from './RiskGauge';
import RealityChat from './RealityChat';
import { Zap, MinusCircle, Target, AlertOctagon, ShieldCheck, Download, MessageCircle, Siren, X, TrendingUp, AlertTriangle, Flame, UserX, Calculator, ScanLine, Activity, Search, Eye, Ghost, Lock, Star } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const SwotCard = ({ title, items, type }: { title: string, items: string[], type: 'strength' | 'weakness' | 'opportunity' | 'threat' }) => {
  const config = {
    strength: { color: 'text-emerald-400', border: 'border-emerald-500/30', hoverBorder: 'hover:border-emerald-500/60', shadow: 'hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]', icon: Zap },
    weakness: { color: 'text-amber-400', border: 'border-amber-500/30', hoverBorder: 'hover:border-amber-500/60', shadow: 'hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]', icon: MinusCircle },
    opportunity: { color: 'text-sky-400', border: 'border-sky-500/30', hoverBorder: 'hover:border-sky-500/60', shadow: 'hover:shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)]', icon: Target },
    threat: { color: 'text-rose-400', border: 'border-rose-500/30', hoverBorder: 'hover:border-rose-500/60', shadow: 'hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]', icon: AlertOctagon },
  }[type];
  
  // Safe array check
  const listItems = Array.isArray(items) ? items : [];

  return (
    <div className={`glass-card ${config.border} ${config.hoverBorder} ${config.shadow} p-8 rounded-3xl transition-all duration-300 ease-out break-inside-avoid page-break-avoid min-h-[220px] group relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700`}>
         <config.icon className={`w-32 h-32 ${config.color}`} />
      </div>
      
      <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4 relative z-10">
        <div className={`p-2 rounded-lg ${config.color.replace('text-', 'bg-')}/10 border border-${config.color.split('-')[1]}-500/20`}>
             <config.icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <h4 className={`font-black text-xl uppercase tracking-widest ${config.color}`}>{title}</h4>
      </div>
      <ul className="space-y-4 relative z-10">
        {listItems.length > 0 ? listItems.map((item, i) => (
          <li key={i} className="text-base text-slate-300 flex items-start gap-3 leading-relaxed group-hover:text-white transition-colors">
            <span className={`mt-2 w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')} opacity-80 flex-shrink-0 shadow-[0_0_10px_currentColor]`} />
            <span>{item}</span>
          </li>
        )) : (
            <li className="text-slate-500 italic text-sm">No data available.</li>
        )}
      </ul>
    </div>
  );
};

const AssetCard: React.FC<{ asset: TrendingAsset, type: 'opportunity' | 'risk', onClick: (asset: TrendingAsset) => void }> = ({ asset, type, onClick }) => {
    const isOpp = type === 'opportunity';
    const borderColor = isOpp ? 'border-emerald-500/30' : 'border-rose-500/30';
    const bgColor = isOpp ? 'bg-emerald-950/20' : 'bg-rose-950/20';
    const textColor = isOpp ? 'text-emerald-400' : 'text-rose-400';
    const shadow = isOpp ? 'shadow-emerald-900/20' : 'shadow-rose-900/20';

    return (
        <button 
          onClick={() => onClick(asset)}
          className={`glass-card ${borderColor} ${bgColor} rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-xl ${shadow} w-full text-left cursor-pointer`}
        >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                {isOpp ? <TrendingUp className={`w-12 h-12 ${textColor}`} /> : <Flame className={`w-12 h-12 ${textColor}`} />}
            </div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h4 className="font-extrabold text-lg text-white tracking-tight">{asset.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1">
                       {asset.symbol} <span className="w-1 h-1 bg-slate-600 rounded-full"></span> {asset.sector}
                    </span>
                </div>
                <div className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${isOpp ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {isOpp ? 'Score' : 'Risk'} {asset.signalStrength || (asset as any).riskScore}
                </div>
            </div>

            <div className="mb-3 relative z-10">
                <div className={`text-2xl font-mono ${textColor} font-black`}>{asset.price}</div>
            </div>

            <p className="text-xs text-slate-300 border-t border-white/5 pt-3 relative z-10 leading-relaxed font-medium">
                {asset.reason}
            </p>
            
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1">
                Analyze <ScanLine className="w-3 h-3" />
            </div>
        </button>
    );
};


const getSentimentEmoji = (sentiment: string) => {
    const s = (sentiment || '').toLowerCase();
    if (s.includes('bull')) return '🐂';
    if (s.includes('bear')) return '🐻';
    if (s.includes('euphoria') || s.includes('euphoric')) return '🚀';
    if (s.includes('fear') || s.includes('panic')) return '😱';
    if (s.includes('neutral')) return '⚖️';
    return '📊';
};

const getSentimentColor = (s: string) => {
    const sentiment = (s || '').toLowerCase();
    if (sentiment.includes('bull')) return 'text-emerald-400';
    if (sentiment.includes('bear')) return 'text-rose-400';
    if (sentiment.includes('neutral')) return 'text-amber-400';
    if (sentiment.includes('euphoria')) return 'text-purple-400';
    return 'text-white';
};

interface AnalysisViewProps {
    data: AnalysisResult;
    title: string;
    isListView?: boolean;
    onAssetClick?: (query: string) => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, title, isListView = false, onAssetClick }) => {
  const { markdownReport, structuredData } = data;
  const [showChat, setShowChat] = useState(false);
  const [showWhistleblower, setShowWhistleblower] = useState(false);

  const handleAssetClick = (asset: TrendingAsset) => {
      if (onAssetClick) {
          // Construct a search query for the individual asset
          onAssetClick(`${asset.name} (${asset.symbol})`);
      }
  };

  const handleExport = () => {
    const element = document.getElementById('analysis-report');
    const opt = {
      margin: [5, 5, 5, 5], 
      filename: `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_fincap_audit.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#0f172a',
        windowWidth: 1600, 
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['css', 'legacy'] }
    };
    // @ts-ignore
    if (window.html2pdf) {
        // @ts-ignore
        window.html2pdf().set(opt).from(element).save();
    } else {
        alert("PDF generator not loaded");
    }
  };

  return (
    <div className="pb-20 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000" id="analysis-report">
      <div className="flex flex-col items-center justify-center mb-12 border-b border-white/10 pb-12 gap-10 pt-8 break-inside-avoid relative">
        <div className="absolute inset-0 bg-sky-500/5 blur-[100px] rounded-full z-[-1] animate-pulse-glow"></div>
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl mb-4">{title}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-sky-500/30 bg-sky-950/30 text-sky-400 font-mono text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(14,165,233,0.2)]">
              <ScanLine className="w-4 h-4 animate-pulse" /> {isListView ? 'Market Sector Scan' : 'Real-time Analysis Report'}
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 no-print" data-html2canvas-ignore>
           {/* Only show specific buttons in Single Asset Mode */}
           {!isListView && structuredData?.whistleblower && (
               <button 
                  onClick={() => setShowWhistleblower(true)}
                  className="group flex items-center gap-3 px-8 py-4 bg-rose-500/10 text-rose-400 border border-rose-500/50 rounded-xl hover:bg-rose-600 hover:text-white transition-all font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:shadow-[0_0_40px_rgba(244,63,94,0.6)] hover:-translate-y-1 active:scale-95"
               >
                  <Siren className="w-5 h-5 group-hover:animate-bounce" /> AI Whistleblower
               </button>
           )}
           
           {!isListView && (
               <button 
                  onClick={() => setShowChat(true)}
                  className="group flex items-center gap-3 px-8 py-4 bg-violet-500/10 text-violet-400 border border-violet-500/50 rounded-xl hover:bg-violet-600 hover:text-white transition-all font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] hover:-translate-y-1 active:scale-95"
               >
                  <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Reality Check
               </button>
           )}

           <button 
              onClick={handleExport}
              className="flex items-center gap-3 px-8 py-4 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl hover:bg-white hover:text-slate-950 transition-all font-black text-sm uppercase tracking-widest hover:-translate-y-1 active:scale-95 shadow-lg"
           >
              <Download className="w-5 h-5" /> Export Report
           </button>
        </div>
      </div>

      {structuredData ? (
        <>
          {/* SINGLE ASSET: Top Grid (Risk, Bubble, Sentiment, Key Details) */}
          {!isListView && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 break-inside-avoid">
                <div className="break-inside-avoid">
                <RiskGauge score={structuredData.riskScore} label="Risk Index" />
                </div>
                <div className="break-inside-avoid">
                <RiskGauge score={structuredData.bubbleProbability} label="Bubble Probability" />
                </div>
                
                <div className="break-inside-avoid glass-card rounded-3xl p-8 flex flex-col justify-center items-center text-center group">
                <span className="text-slate-400 text-xs font-black uppercase mb-4 tracking-[0.2em] group-hover:text-white transition-colors">Market Sentiment</span>
                <div className={`text-5xl font-black uppercase ${getSentimentColor(structuredData.marketSentiment)} drop-shadow-lg scale-110`}>
                    <span className="mr-3 inline-block animate-float">{getSentimentEmoji(structuredData.marketSentiment)}</span>
                    {structuredData.marketSentiment}
                </div>
                </div>

                <div className="break-inside-avoid glass-card rounded-3xl p-8 flex flex-col justify-center group">
                <span className="text-slate-400 text-xs font-black uppercase mb-6 tracking-[0.2em] border-b border-white/10 pb-3 block group-hover:text-white transition-colors">Key Details</span>
                <div className="space-y-5 w-full">
                    {structuredData.keyMetrics.map((m: any, i: number) => (
                    <div key={i} className="flex justify-between items-center w-full border-b border-dashed border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-sky-400 font-bold text-sm">{m.label}</span>
                        <span className="text-white font-mono font-bold text-lg">{m.value}</span>
                    </div>
                    ))}
                    {(!structuredData.keyMetrics || structuredData.keyMetrics.length === 0) && (
                        <div className="text-slate-500 text-xs italic">No metrics available</div>
                    )}
                </div>
                </div>
            </div>
          )}

          {/* LIST VIEW: Recommendation Cards (Priority View) */}
          {structuredData.trendingAssets && structuredData.trendingAssets.length > 0 && (
             <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <Star className="w-6 h-6 text-emerald-400 fill-current" />
                   </div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tight">Top Recommendations / Trending</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {structuredData.trendingAssets.map((asset, i) => (
                      <AssetCard key={i} asset={asset} type="opportunity" onClick={handleAssetClick} />
                   ))}
                </div>
             </div>
          )}

          {/* LIST VIEW: High Risk Cards (Priority View) */}
          {structuredData.topBubbleAssets && structuredData.topBubbleAssets.length > 0 && (
             <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                      <Flame className="w-6 h-6 text-rose-500 fill-current" />
                   </div>
                   <h3 className="text-3xl font-black text-white uppercase tracking-tight">High Risk Alerts</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {structuredData.topBubbleAssets.map((asset, i) => (
                      // @ts-ignore
                      <AssetCard key={i} asset={{...asset, signalStrength: asset.riskScore}} type="risk" onClick={handleAssetClick} />
                   ))}
                </div>
             </div>
          )}


          {/* SINGLE ASSET: Combined Chart Section */}
          {!isListView && (
            <div className="glass-card rounded-3xl p-8 mb-16 break-inside-avoid group">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                            <TrendingUp className="w-6 h-6 text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-xl uppercase tracking-tight group-hover:text-sky-300 transition-colors">Price Trend</h3>
                            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Historical Price Action</p>
                        </div>
                    </div>
                </div>
                
                <div className="h-[450px] w-full bg-slate-950/40 rounded-2xl border border-white/5 p-6 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
                    {structuredData.priceHistory && structuredData.priceHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={structuredData.priceHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#64748b" 
                                tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}} 
                                tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return `${d.getDate()}/${d.getMonth()+1}`;
                                }}
                                minTickGap={30}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis 
                                stroke="#64748b" 
                                tick={{fontSize: 11, fontWeight: 700, fill: '#64748b'}}
                                domain={['auto', 'auto']}
                                tickFormatter={(val) => `₹${val.toLocaleString(undefined, {maximumFractionDigits:0})}`}
                                width={60}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(2, 6, 23, 0.9)', 
                                    borderColor: 'rgba(56, 189, 248, 0.3)', 
                                    borderRadius: '16px',
                                    padding: '16px',
                                    boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                itemStyle={{ color: '#38bdf8', fontWeight: '800', fontFamily: 'JetBrains Mono' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}
                                formatter={(value: number) => [`₹${value.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'Price']}
                                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                cursor={{stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4'}}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="price" 
                                stroke="#0ea5e9" 
                                strokeWidth={4}
                                dot={false}
                                activeDot={{ r: 8, strokeWidth: 0, fill: '#fff', stroke: '#0ea5e9', strokeOpacity: 0.5 }}
                                animationDuration={2000}
                            />
                            <Area type="monotone" dataKey="price" stroke="none" fill="url(#colorPrice)" fillOpacity={0.2} />
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                    ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                        <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                        <span className="text-sm font-bold uppercase tracking-widest">Chart data currently unavailable</span>
                    </div>
                    )}
                </div>
            </div>
          )}

          {/* SINGLE ASSET: SWOT Section */}
          {!isListView && (
            <div className="flex items-center gap-4 mb-10 break-after-avoid">
                <div className="p-3 bg-white/5 rounded-full border border-white/10">
                    <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tight">🎯 Strategic Analysis (SWOT 📊)</h3>
            </div>
          )}

          {!isListView && structuredData.swot ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                <SwotCard title="Strengths" items={structuredData.swot.strengths} type="strength" />
                <SwotCard title="Weaknesses" items={structuredData.swot.weaknesses} type="weakness" />
                <SwotCard title="Opportunities" items={structuredData.swot.opportunities} type="opportunity" />
                <SwotCard title="Threats" items={structuredData.swot.threats} type="threat" />
              </div>
          ) : !isListView && (
             <div className="p-12 border border-dashed border-slate-700 rounded-3xl text-slate-500 text-center mb-16 bg-slate-900/30">
                SWOT Analysis unavailable for this asset.
             </div>
          )}
        </>
      ) : (
        <div className="p-10 border border-yellow-500/30 bg-yellow-500/5 rounded-2xl text-yellow-200 mb-12 animate-pulse">
          Visual data extraction failed. Re-running the scan may fix this.
        </div>
      )}

      {/* Main Analysis Report - Full Width */}
      {/* Show Market Commentary even in ListView, but simpler */}
      <div className="glass-card rounded-[2.5rem] p-12 mb-20 relative break-inside-avoid overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
             <ShieldCheck className="w-96 h-96 text-white" />
         </div>
         
         <div className="flex items-center gap-5 mb-10 border-b border-white/10 pb-8 relative z-10">
           <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
               <ShieldCheck className="w-10 h-10 text-sky-400" />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{isListView ? 'Market Overview' : 'Analysis Report'}</h2>
              <p className="text-slate-400 text-sm font-mono uppercase tracking-[0.2em] mt-1 text-sky-400">AI Forensic Deep Dive // Confidential</p>
           </div>
         </div>
         <div className="prose prose-invert max-w-none prose-lg prose-headings:font-black prose-p:leading-relaxed prose-p:text-slate-300 prose-li:text-slate-300 relative z-10">
           <MarkdownRenderer content={markdownReport} />
         </div>
      </div>

      {/* SINGLE ASSET: Bubble Audit Section */}
      {!isListView && structuredData?.bubbleAudit && (
         <div className="glass-card rounded-[2.5rem] p-12 mb-20 break-inside-avoid transition-all relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-500"></div>
             
             <div className="flex items-center gap-5 mb-10 border-b border-white/10 pb-8">
                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                   <Flame className="w-10 h-10 text-rose-500 animate-pulse-slow" />
                </div>
                <div>
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Bubble Audit</h2>
                   <p className="text-rose-400 text-sm font-mono uppercase tracking-[0.2em] mt-1">Speculative Risk Assessment</p>
                </div>
             </div>

             {/* 0-100 Intensity Scale */}
             <div className="mb-14 bg-slate-950/50 p-10 rounded-3xl border border-white/5 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Activity className="w-40 h-40 text-white" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <div className="flex flex-col">
                            <span className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] mb-2">Bubble Intensity Scale</span>
                            <span className="text-white text-sm font-medium opacity-60">Probability of market dislocation</span>
                        </div>
                        <span className={`text-6xl font-black tracking-tighter drop-shadow-lg ${
                            structuredData.bubbleAudit.score > 75 ? 'text-rose-500' : 
                            structuredData.bubbleAudit.score > 50 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                            {structuredData.bubbleAudit.score}<span className="text-xl text-slate-600 ml-2 font-bold">/100</span>
                        </span>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="relative h-8 bg-slate-900 rounded-full overflow-hidden mb-4 shadow-inner border border-white/5">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-yellow-500 to-rose-600 opacity-90"></div>
                        
                        {/* Needle / Marker */}
                        <div 
                            className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_20px_white] z-10 transition-all duration-1000 ease-out transform -translate-x-1/2"
                            style={{ left: `${Math.min(Math.max(structuredData.bubbleAudit.score, 0), 100)}%` }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest px-1">
                        <span>Safe Zone</span>
                        <span className="hidden md:inline">Elevated Risk</span>
                        <span>Extreme Bubble</span>
                    </div>
                </div>
             </div>

             {/* Insider & Insightful Details */}
             <div className="mb-12">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3">
                    <Search className="w-6 h-6 text-sky-400" />
                    Insider & Structural Insights
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-slate-950/40 p-8 rounded-3xl border border-white/5 border-l-4 border-l-sky-500 hover:bg-slate-900/60 transition-colors shadow-lg">
                       <h4 className="text-sky-400 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5" /> Market Structure & Fundamentals
                       </h4>
                       <p className="text-slate-300 text-base leading-loose">
                          {structuredData.bubbleAudit.fundamentals}
                       </p>
                    </div>
                    <div className="bg-rose-950/10 p-8 rounded-3xl border border-rose-500/10 border-l-4 border-l-rose-500 hover:bg-rose-900/20 transition-colors shadow-lg">
                       <h4 className="text-rose-400 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                          <AlertOctagon className="w-5 h-5" /> The Trigger Event (Catalyst)
                       </h4>
                       <p className="text-slate-300 text-base leading-loose">
                          {structuredData.bubbleAudit.burstTrigger}
                       </p>
                    </div>
                 </div>

                 {/* New Secret/Whistleblower section visible directly here too */}
                 {structuredData.whistleblower && (structuredData.whistleblower.hiddenRisks || structuredData.whistleblower.darkPoolActivity) && (
                     <div className="bg-indigo-950/20 p-8 rounded-3xl border border-indigo-500/20 border-l-4 border-l-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                        <h4 className="text-indigo-400 font-black uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                            <Ghost className="w-5 h-5 animate-float" /> Deep Dark Secrets (Unreported)
                        </h4>
                        <div className="space-y-6">
                            {structuredData.whistleblower.hiddenRisks && (
                                <div className="flex gap-4 items-start">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <Eye className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="w-full">
                                        <span className="text-indigo-200 text-xs font-bold uppercase block mb-2 tracking-wider">Hidden Liabilities</span>
                                        <ul className="space-y-3">
                                            {structuredData.whistleblower.hiddenRisks.map((risk: string, i: number) => (
                                                <li key={i} className="text-slate-300 text-sm leading-relaxed bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/10">{risk}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            {structuredData.whistleblower.darkPoolActivity && (
                                <div className="flex gap-4 items-start border-t border-indigo-500/10 pt-6">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <Lock className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <span className="text-indigo-200 text-xs font-bold uppercase block mb-2 tracking-wider">Dark Pool Activity</span>
                                        <p className="text-slate-300 text-sm leading-relaxed font-medium bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/10">
                                            {structuredData.whistleblower.darkPoolActivity}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                     </div>
                 )}
             </div>

             {/* Quick Stats Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-10">
                <div className="text-center p-6 bg-slate-950/30 rounded-2xl border border-white/5 hover:bg-slate-900/50 transition-colors">
                   <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Risk Status</span>
                   <span className={`text-xl font-black uppercase tracking-tight ${
                      structuredData.bubbleAudit.riskStatus === 'Critical' ? 'text-rose-500' : 
                      structuredData.bubbleAudit.riskStatus === 'Elevated' ? 'text-amber-500' : 'text-emerald-500'
                   }`}>
                      {structuredData.bubbleAudit.riskStatus}
                   </span>
                </div>
                <div className="text-center p-6 bg-slate-950/30 rounded-2xl border border-white/5 hover:bg-slate-900/50 transition-colors">
                   <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Valuation</span>
                   <span className={`text-xl font-black uppercase tracking-tight ${
                       structuredData.bubbleAudit.valuationVerdict === 'Bubble' ? 'text-rose-500' :
                       structuredData.bubbleAudit.valuationVerdict === 'Overvalued' ? 'text-amber-500' : 
                       structuredData.bubbleAudit.valuationVerdict === 'Undervalued' ? 'text-emerald-400' : 'text-sky-400'
                   }`}>
                      {structuredData.bubbleAudit.valuationVerdict}
                   </span>
                </div>
                <div className="text-center p-6 bg-slate-950/30 rounded-2xl border border-white/5 hover:bg-slate-900/50 transition-colors">
                   <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Speculation</span>
                   <span className={`text-xl font-black uppercase tracking-tight ${
                        structuredData.bubbleAudit.speculativeActivity === 'Extreme' ? 'text-rose-500' :
                        structuredData.bubbleAudit.speculativeActivity === 'High' ? 'text-orange-500' :
                        structuredData.bubbleAudit.speculativeActivity === 'Moderate' ? 'text-yellow-400' : 'text-slate-300'
                   }`}>
                      {structuredData.bubbleAudit.speculativeActivity}
                   </span>
                </div>
                <div className="text-center p-6 bg-slate-950/30 rounded-2xl border border-white/5 hover:bg-slate-900/50 transition-colors">
                   <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Liquidity</span>
                   <span className="text-xl font-black text-white uppercase tracking-tight">
                      {structuredData.bubbleAudit.liquidityStatus}
                   </span>
                </div>
             </div>
         </div>
      )}

      {showWhistleblower && structuredData?.whistleblower && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-300" data-html2canvas-ignore>
           <div className="bg-[#0f172a] border border-rose-500 w-full max-w-3xl rounded-[2rem] shadow-[0_0_100px_rgba(244,63,94,0.3)] relative flex flex-col max-h-[85vh] overflow-hidden">
              <button onClick={() => setShowWhistleblower(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white z-10 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              
              <div className="bg-rose-950/40 p-8 border-b border-rose-500/30 flex items-center gap-6 flex-shrink-0">
                 <div className="p-4 bg-rose-500/20 rounded-2xl border border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.4)]">
                    <Siren className="w-10 h-10 text-rose-500 animate-pulse" />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Whistleblower Report</h3>
                    <p className="text-rose-400 font-mono text-xs tracking-[0.2em] mt-2">DETECTED ANOMALIES & INSIDER RISKS</p>
                 </div>
              </div>

              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                  <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-rose-500/20 shadow-inner">
                     <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Integrity Score</span>
                     <div className="flex items-center gap-2">
                        <span className={`text-4xl font-black ${structuredData.whistleblower.integrityScore < 50 ? 'text-rose-500' : 'text-amber-500'} drop-shadow-md`}>
                           {structuredData.whistleblower.integrityScore}/100
                        </span>
                     </div>
                  </div>

                  <div>
                     <h4 className="text-white font-black mb-3 uppercase tracking-tight text-sm">Forensic Verdict</h4>
                     <p className="text-slate-300 text-sm leading-loose bg-slate-900/80 p-6 rounded-2xl border border-white/5 shadow-lg">
                        {structuredData.whistleblower.forensicVerdict}
                     </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <h4 className="text-rose-400 font-black mb-4 uppercase tracking-tight text-xs flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Detected Anomalies
                         </h4>
                         <ul className="space-y-3">
                            {structuredData.whistleblower.anomalies.map((a: string, i: number) => (
                               <li key={i} className="text-slate-300 text-sm flex items-start gap-3 bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 hover:bg-rose-500/10 transition-colors">
                                  <span className="text-rose-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_currentColor]"></span>
                                  {a}
                               </li>
                            ))}
                         </ul>
                      </div>
                      
                      {structuredData.whistleblower.insiderDetails && Array.isArray(structuredData.whistleblower.insiderDetails) && structuredData.whistleblower.insiderDetails.length > 0 && (
                          <div>
                             <h4 className="text-sky-400 font-black mb-4 uppercase tracking-tight text-xs flex items-center gap-2">
                                <UserX className="w-4 h-4" /> Insider Activity
                             </h4>
                             <ul className="space-y-3">
                                {structuredData.whistleblower.insiderDetails.map((d: string, i: number) => (
                                   <li key={i} className="text-slate-300 text-sm flex items-start gap-3 bg-sky-500/5 p-4 rounded-xl border border-sky-500/10 hover:bg-sky-500/10 transition-colors">
                                      <span className="text-sky-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_5px_currentColor]"></span>
                                      {d}
                                   </li>
                                ))}
                             </ul>
                          </div>
                      )}
                  </div>

                  {/* Deep Dark Secrets in Modal */}
                   {structuredData.whistleblower.hiddenRisks && (
                      <div className="bg-indigo-950/30 p-8 rounded-3xl border border-indigo-500/30 relative overflow-hidden">
                         <div className="absolute -top-10 -right-10 opacity-10">
                            <Ghost className="w-40 h-40 text-indigo-500" />
                         </div>
                         <h4 className="text-indigo-400 font-black mb-6 uppercase tracking-tight text-sm flex items-center gap-2 relative z-10">
                            <Ghost className="w-5 h-5 animate-float" /> Hidden Risks & Liabilities
                         </h4>
                         <ul className="space-y-4 relative z-10">
                            {structuredData.whistleblower.hiddenRisks.map((d: string, i: number) => (
                               <li key={i} className="text-slate-300 text-sm flex items-start gap-3 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors shadow-lg">
                                  <span className="text-indigo-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_currentColor]"></span>
                                  {d}
                               </li>
                            ))}
                         </ul>
                      </div>
                  )}
              </div>
              
              <div className="p-6 border-t border-rose-500/30 bg-rose-950/20 text-center">
                 <p className="text-[10px] text-rose-300/60 uppercase tracking-[0.3em] font-mono">Confidential // Generated by AI Forensic Model v3.3</p>
              </div>
           </div>
        </div>
      )}

      {showChat && (
        <RealityChat 
           isOpen={showChat} 
           onClose={() => setShowChat(false)} 
           context={{
             symbol: title,
             riskScore: structuredData?.riskScore || 0,
             sentiment: structuredData?.marketSentiment || 'Neutral'
           }}
        />
      )}
    </div>
  );
};

export default AnalysisView;
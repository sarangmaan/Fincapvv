

export interface ChartDataPoint {
  label: string;
  value: number;
  ma50?: number;
  rsi?: number;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
}

export interface TechnicalAnalysisData {
  priceData: { date: string; price: number; ma50: number }[];
  rsiData: { date: string; value: number }[];
  currentRsi: number;
  currentMa: number;
  signal: 'Buy' | 'Sell' | 'Neutral';
}

export interface BubbleAudit {
  riskStatus: 'Safe' | 'Elevated' | 'Critical';
  valuationVerdict: 'Undervalued' | 'Fair Value' | 'Overvalued' | 'Bubble';
  score: number;
  fundamentals: string; 
  speculativeActivity: 'Low' | 'Moderate' | 'High' | 'Extreme';
  burstTrigger: string; 
  liquidityStatus: 'Abundant' | 'Neutral' | 'Drying Up' | 'Illiquid';
  peerContext?: string; 
}

export interface WhistleblowerData {
  integrityScore: number;
  verdict: 'Clean' | 'Suspicious' | 'High Risk' | 'Manipulation Detected';
  forensicVerdict: string;
  anomalies: string[];
  insiderActivity: string;
  accountingFlags: string;
  insiderDetails?: string[]; 
  hiddenRisks?: string[];
  darkPoolActivity?: string;
}

export interface FinancialTable {
  headers: string[];
  rows: { label: string; values: string[] }[];
}

export interface FinancialStatements {
  profitAndLoss?: FinancialTable;
  balanceSheet?: FinancialTable;
  cashFlow?: FinancialTable;
}

export interface TrendingAsset {
  name: string;
  symbol: string;
  sector: string;
  price: string;
  reason: string;
  signalStrength: number; // 0-100, High is Better
}

export interface StructuredAnalysisData {
  riskScore: number;
  bubbleProbability: number;
  marketSentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Euphoric' | 'Fear';
  keyMetrics: { label: string; value: string }[];
  trendData: ChartDataPoint[]; 
  priceHistory?: HistoricalDataPoint[]; 
  
  technicalAnalysis?: TechnicalAnalysisData;
  bubbleAudit?: BubbleAudit;
  warningSignals?: string[]; 
  
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  whistleblower?: WhistleblowerData;
  financialStatements?: FinancialStatements;
  topBubbleAssets?: {
    name: string;
    riskScore: number;
    sector: string;
    price: string;
    reason: string;
  }[];
  trendingAssets?: TrendingAsset[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface AnalysisResult {
  markdownReport: string;
  structuredData?: StructuredAnalysisData;
  groundingChunks?: GroundingChunk[];
  isEstimated?: boolean;
}

export interface PortfolioItem {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ANALYZING = 'ANALYZING',
  REPORT = 'REPORT',
  PORTFOLIO = 'PORTFOLIO',
  BUBBLE_SCOPE = 'BUBBLE_SCOPE',
  ERROR = 'ERROR'
}
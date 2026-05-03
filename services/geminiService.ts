import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AnalysisResult, PortfolioItem } from '../types';

// The system provides GEMINI_API_KEY automatically in this environment.
// For Vercel/Production, ensure you add GEMINI_API_KEY to your environment variables.
const getApiKey = () => {
    const key = (process.env.GEMINI_API_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (!key || key === 'undefined' || key === '') {
        console.warn("GEMINI_API_KEY is missing. Analysis will fail. Please set it in your environment variables.");
        return "MISSING_KEY";
    }
    return key;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });
const MODEL_NAME = "gemini-3.1-flash-lite-preview";

// --- DETERMINISTIC GENERATOR UTILS ---
function mulberry32(a: number) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function cyrb128(str: string) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1^h2^h3^h4) >>> 0;
}

const generateConsistentHistory = (query: string, currentPriceVal: number) => {
    const seed = cyrb128(query.toLowerCase());
    const rand = mulberry32(seed);

    const history = [];
    const today = new Date();
    let price = currentPriceVal;

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        history.unshift({
            date: date.toISOString().split('T')[0],
            price: price
        });
        const volatility = 0.02;
        const changePercent = (rand() - 0.5) * 2 * volatility;
        price = price / (1 + changePercent);
    }
    return history;
};

// --- CORE ANALYST ENGINE ---

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        riskScore: { type: Type.NUMBER },
        bubbleProbability: { type: Type.NUMBER },
        marketSentiment: { type: Type.STRING },
        keyMetrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.STRING }
                }
            }
        },
        technicalAnalysis: {
            type: Type.OBJECT,
            properties: {
                signal: { type: Type.STRING }
            }
        },
        bubbleAudit: {
            type: Type.OBJECT,
            properties: {
                riskStatus: { type: Type.STRING },
                valuationVerdict: { type: Type.STRING },
                score: { type: Type.NUMBER },
                fundamentals: { type: Type.STRING },
                speculativeActivity: { type: Type.STRING },
                burstTrigger: { type: Type.STRING },
                liquidityStatus: { type: Type.STRING }
            }
        },
        warningSignals: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        swot: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        },
        whistleblower: {
            type: Type.OBJECT,
            properties: {
                integrityScore: { type: Type.NUMBER },
                forensicVerdict: { type: Type.STRING },
                anomalies: { type: Type.ARRAY, items: { type: Type.STRING } },
                insiderDetails: { type: Type.ARRAY, items: { type: Type.STRING } },
                hiddenRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
                darkPoolActivity: { type: Type.STRING }
            }
        },
        topBubbleAssets: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    riskScore: { type: Type.NUMBER },
                    sector: { type: Type.STRING },
                    price: { type: Type.STRING },
                    reason: { type: Type.STRING }
                }
            }
        },
        trendingAssets: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    symbol: { type: Type.STRING },
                    sector: { type: Type.STRING },
                    price: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    signalStrength: { type: Type.NUMBER }
                }
            }
        },
        markdownReport: { type: Type.STRING }
    },
    required: ["riskScore", "bubbleProbability", "marketSentiment", "keyMetrics", "markdownReport"]
};

const runForensicAnalysis = async (systemType: string, promptContext: string, queryForSeed?: string): Promise<AnalysisResult> => {
    const today = new Date().toISOString().split('T')[0];

    const systemInstruction = `
      You are a Senior Forensic Financial Analyst & Insider Whistleblower.
      **CURRENT DATE**: ${today}

      CRITICAL PROTOCOL:
      1. **NO EXTERNAL DATA**: You do not have access to live APIs. You MUST ESTIMATE all financial metrics and price data based on your training, market patterns, and the specific asset's historical volatility.
      2. **MANDATORY DATA**: 
         - **Key Metrics**: Must provide specific numbers for Price, Market Cap, P/E, and 52W High. Do NOT use "N/A".
         - **SWOT Analysis**: You MUST provide 3-4 concise points for EACH category (Strengths, Weaknesses, Opportunities, Threats).
      3. **CURRENCY**: Use Indian Rupees (₹) for Indian assets (BSE/NSE). Use USD ($) for US/Global assets.
      4. **WHISTLEBLOWER PERSONA**: When filling the 'whistleblower' and 'insider' sections, act as a deep insider. Reveal "open secrets", accounting irregularities, shadow debt, and dark pool activity. You must provide CONCISE, PUNCHY, and SHOCKING revelations.
      5. **MARKDOWN REPORT**: Include a concise institutional-grade summary in the 'markdownReport' field (3-4 paragraphs max).
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: promptContext,
            config: {
                systemInstruction,
                temperature: 0.1,
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseMimeType: "application/json",
                responseSchema: responseSchema as any
            }
        });

        const structuredData = JSON.parse(response.text);
        
        if (queryForSeed && structuredData.keyMetrics) {
            const priceMetric = structuredData.keyMetrics.find((m: any) => m.label.toLowerCase().includes('price'));
            if (priceMetric) {
                const cleanPrice = parseFloat(priceMetric.value.replace(/[^0-9.]/g, ''));
                if (!isNaN(cleanPrice)) {
                    structuredData.priceHistory = generateConsistentHistory(queryForSeed, cleanPrice);
                }
            }
        }

        return {
            markdownReport: structuredData.markdownReport || "Analysis completed.",
            structuredData,
            groundingChunks: [],
            isEstimated: true
        };
    } catch (error: any) {
        console.error("Gemini Analysis Failed:", error);
        
        let errorMessage = error.message || "Forensic Analysis Failed";
        
        if (errorMessage.includes("API key not valid") || errorMessage.includes("INVALID_ARGUMENT")) {
            errorMessage = "Authentication failed: Invalid Gemini API Key. Please verify your GEMINI_API_KEY in the Vercel/Environment settings.";
        } else if (errorMessage.includes("404") || errorMessage.includes("model not found")) {
            errorMessage = "Model configuration error. Please ensure the Gemini API is active for your project.";
        }

        throw new Error(errorMessage);
    }
};

export const analyzeMarket = async (query: string, onUpdate?: (data: AnalysisResult) => void): Promise<AnalysisResult> => {
    const prompt = `Perform a forensic deep-dive analysis for: "${query}". 
    ESTIMATE current market status/price. 
    ALWAYS populate 'trendingAssets' or 'topBubbleAssets' with 3-4 related or sector-peer assets to complete the 'Market Scan' view, even if analyzing a single symbol.`;
    const result = await runForensicAnalysis('market', prompt, query);
    if (onUpdate) onUpdate(result);
    return result;
};

export const analyzePortfolio = async (portfolio: PortfolioItem[], onUpdate?: (data: AnalysisResult) => void): Promise<AnalysisResult> => {
    const dataStr = JSON.stringify(portfolio.map(p => ({ s: p.symbol, q: p.quantity, avg: p.buyPrice })));
    const prompt = `Audit this portfolio for risk and exposure: ${dataStr}. Assume prices are in INR.`;
    const result = await runForensicAnalysis('portfolio', prompt, "PORTFOLIO_AUDIT");
    if (onUpdate) onUpdate(result);
    return result;
};

export const analyzeBubbles = async (onUpdate?: (data: AnalysisResult) => void): Promise<AnalysisResult> => {
    const prompt = `Scan global markets for major Bubbles. Identify 4-6 assets with EXTREME risk. Populate 'topBubbleAssets' array.`;
    const result = await runForensicAnalysis('bubble', prompt, "BUBBLE_SCOPE");
    if (onUpdate) onUpdate(result);
    return result;
};

export const chatWithGemini = async (
  history: any[], 
  message: string, 
  context: { symbol: string, riskScore: number, sentiment: string }
): Promise<string> => {
    try {
        const systemInstruction = `
            You are 'The Reality Check', a witty, sarcastic, but intelligent financial assistant.
            CONTEXT: Asset: ${context.symbol || 'General'}, Risk: ${context.riskScore || 0}/100.
            Keep it short. Use emojis.
            Use Indian Rupees (₹) for money.
            Current Date: ${new Date().toLocaleDateString()}
        `;

        const chat = ai.chats.create({
            model: MODEL_NAME,
            config: {
                systemInstruction,
                temperature: 0.7,
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
            history: history
        });

        const response = await chat.sendMessage(message);
        return response.text;
    } catch (error) {
        console.error("Gemini Chat Failed:", error);
        return "Connection lost. The Reality Check is offline.";
    }
};

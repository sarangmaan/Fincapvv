import Groq from 'groq-sdk';
import { AnalysisResult, PortfolioItem, FinancialStatements } from '../types';
import { API_KEY as FallbackKey } from '../untitled-2';

// --- KEY SELECTION LOGIC ---
const getValidKey = () => {
    // 1. Try process.env (Vite injected)
    const envKey = process.env.API_KEY;
    if (envKey && typeof envKey === 'string' && envKey !== 'undefined' && envKey.length > 10 && envKey.trim().startsWith('gsk_')) {
        return envKey.trim();
    }
    // 2. Fallback to hardcoded key for demo stability
    return FallbackKey;
};

const finalApiKey = getValidKey();
const groq = new Groq({ apiKey: finalApiKey, dangerouslyAllowBrowser: true });
const MODEL_NAME = "llama-3.3-70b-versatile";

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

const parseGroqResponse = (rawText: string, queryForSeed?: string): AnalysisResult => {
  let structuredData = null;
  let markdownReport = rawText;
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

  if (jsonMatch && jsonMatch[1]) {
    try {
      const cleanJson = jsonMatch[1].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
      structuredData = JSON.parse(cleanJson);
      markdownReport = rawText.replace(jsonMatch[0], '').trim();

      if (queryForSeed && structuredData.keyMetrics) {
          const priceMetric = structuredData.keyMetrics.find((m: any) => m.label.toLowerCase().includes('price'));
          if (priceMetric) {
              const cleanPrice = parseFloat(priceMetric.value.replace(/[^0-9.]/g, ''));
              if (!isNaN(cleanPrice)) {
                  structuredData.priceHistory = generateConsistentHistory(queryForSeed, cleanPrice);
              }
          }
      }
    } catch (e) {
      console.error("JSON Parse Failed:", e);
    }
  }

  if (!markdownReport) markdownReport = "Analysis completed but returned no text content.";

  return {
    markdownReport,
    structuredData,
    groundingChunks: [],
    isEstimated: true
  };
};

// --- CORE ANALYST ENGINE ---
// Shared prompt logic for all analysis modes
const runForensicAnalysis = async (systemType: 'market' | 'portfolio' | 'bubble', promptContext: string, queryForSeed?: string): Promise<AnalysisResult> => {
    const today = new Date().toISOString().split('T')[0];

    const jsonSystemInstruction = `
      You are a Senior Forensic Financial Analyst & Insider Whistleblower.
      **CURRENT DATE**: ${today}

      CRITICAL PROTOCOL:
      1. **NO EXTERNAL DATA**: You do not have access to live APIs. You MUST ESTIMATE all financial metrics and price data based on your training, market patterns, and the specific asset's historical volatility.
      2. **MANDATORY DATA**: 
         - **Key Metrics**: Must provide specific numbers for Price, Market Cap, P/E, and 52W High. Do NOT use "N/A".
         - **Price History**: Include a placeholder array, but I will overwrite it.
      3. **JSON FIRST**: Output the JSON block *immediately*.
      4. **CURRENCY**: Use Indian Rupees (₹) for Indian assets (BSE/NSE). Use USD ($) for US/Global assets.
      5. **WHISTLEBLOWER PERSONA**: When filling the 'whistleblower' and 'insider' sections, act as a deep insider. Reveal "open secrets", accounting irregularities, shadow debt, and dark pool activity. You must provide LONG, DETAILED, and SHOCKING revelations.

      STEP 1: GENERATE JSON DATA
      \`\`\`json
      {
        "riskScore": number (0-100),
        "bubbleProbability": number (0-100),
        "marketSentiment": "Bullish" | "Bearish" | "Neutral" | "Euphoric" | "Fear",
        "keyMetrics": [
          { "label": "Price", "value": "₹1,245.50" },
          { "label": "Market Cap", "value": "₹45,000 Cr" }
        ],
        "priceHistory": [],
        "technicalAnalysis": { "signal": "Buy" | "Sell" | "Neutral" },
        "bubbleAudit": {
            "riskStatus": "Elevated" | "Safe" | "Critical",
            "valuationVerdict": "Overvalued" | "Fair Value" | "Undervalued" | "Bubble",
            "score": 75,
            "fundamentals": "Deep dive into earnings quality...",
            "speculativeActivity": "Moderate",
            "burstTrigger": "Event that could pop the bubble...",
            "liquidityStatus": "Abundant"
        },
        "warningSignals": ["Signal 1", "Signal 2"],
        "swot": {
          "strengths": ["..."], "weaknesses": ["..."], "opportunities": ["..."], "threats": ["..."]
        },
        "whistleblower": {
           "integrityScore": 85,
           "forensicVerdict": "Summary of risks.",
           "anomalies": ["Unusual options activity..."],
           "insiderDetails": ["CEO selling patterns..."],
           "hiddenRisks": ["Shadow banking exposure..."],
           "darkPoolActivity": "Block selling analysis..."
        },
        "topBubbleAssets": [
             { "name": "Asset Name", "riskScore": 95, "sector": "Sector", "price": "$100", "reason": "High Risk" }
        ],
        "trendingAssets": [
             { "name": "Asset Name", "symbol": "TICKER", "sector": "Sector", "price": "$120", "reason": "Good Buy", "signalStrength": 85 }
        ]
      }
      \`\`\`

      STEP 2: FORENSIC VERDICT (Markdown)
      Produce an institutional-grade Analysis Report (Markdown).
      Headers:
      ### Accounting Integrity
      ### Competitive Insulation
      ### The Invalidation Catalyst
      ### Institutional Position
      ### Final Verdict
      (Start Final Verdict with [[[STRONG BUY]]], [[[BUY]]], [[[HOLD]]], [[[SELL]]], or [[[STRONG SELL]]])
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: jsonSystemInstruction },
                { role: "user", content: promptContext }
            ],
            model: MODEL_NAME,
            temperature: 0.1, // Low temp for more consistent JSON structure
            max_tokens: 8192
        });

        const text = completion.choices[0]?.message?.content || "";
        return parseGroqResponse(text, queryForSeed);
    } catch (error: any) {
        console.error("Analysis Failed:", error);
        throw new Error(error.message || "Forensic Analysis Failed");
    }
};

// --- EXPORTED FUNCTIONS ---

export const analyzeMarket = async (query: string, onUpdate?: (data: AnalysisResult) => void): Promise<AnalysisResult> => {
    const prompt = `Perform a forensic deep-dive analysis for: "${query}". ESTIMATE current market status/price. If asking for a list, populate 'trendingAssets' or 'topBubbleAssets'.`;
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

export const chatWithGroq = async (
  history: any[], 
  message: string, 
  context: { symbol: string, riskScore: number, sentiment: string }
): Promise<string> => {
    if (!finalApiKey) return "API Key Missing";

    const systemInstruction = `
        You are 'The Reality Check', a witty, sarcastic, but intelligent financial assistant.
        CONTEXT: Asset: ${context.symbol || 'General'}, Risk: ${context.riskScore || 0}/100.
        Keep it short. Use emojis.
        Use Indian Rupees (₹) for money.
        Current Date: ${new Date().toLocaleDateString()}
    `;
    
    const groqHistory = history.map((h: any) => ({
        role: h.role === 'model' ? 'assistant' : h.role,
        content: h.parts[0].text
    }));

    const messages = [
        { role: "system", content: systemInstruction },
        ...groqHistory,
        { role: "user", content: message }
    ];

    try {
        const completion = await groq.chat.completions.create({
            // @ts-ignore
            messages: messages,
            model: MODEL_NAME,
            temperature: 0.5,
            max_tokens: 1000,
        });
        return completion.choices[0]?.message?.content || "I'm speechless.";
    } catch (error) {
        return "Connection lost. The Reality Check is offline.";
    }
};
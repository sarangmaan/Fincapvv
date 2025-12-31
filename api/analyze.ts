import Groq from 'groq-sdk';

// Manually inserted backup key for the backend environment
const BACKUP_KEY = "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";

const MODEL_NAME = "llama-3.3-70b-versatile";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { mode, data } = req.body;
    
    // API Key Logic
    let apiKey = process.env.API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10 || !apiKey.trim().startsWith('gsk_')) {
        console.log("Using backup key for API request.");
        apiKey = BACKUP_KEY;
    }
    apiKey = apiKey.trim();

    const groq = new Groq({ apiKey });
    const today = new Date().toISOString().split('T')[0];

    let systemInstruction = "";
    let prompt = "";
    
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
      5. **WHISTLEBLOWER PERSONA**: When filling the 'whistleblower' and 'insider' sections, act as a deep insider. Reveal "open secrets", accounting irregularities, shadow debt, and dark pool activity. You must provide LONG, DETAILED, and SHOCKING revelations. "hiddenRisks" should be a list of 3-4 detailed paragraphs (not just short phrases) exposing things usually hidden in footnotes. "insiderDetails" should be juicy and specific.

      STEP 1: GENERATE JSON DATA
      \`\`\`json
      {
        "riskScore": number (0-100),
        "bubbleProbability": number (0-100),
        "marketSentiment": "Bullish" | "Bearish" | "Neutral" | "Euphoric" | "Fear",
        "keyMetrics": [
          { "label": "Price", "value": "₹1,245.50" },
          { "label": "Market Cap", "value": "₹45,000 Cr" },
          { "label": "P/E Ratio", "value": "24.5" },
          { "label": "52W High", "value": "₹1,450.00" }
        ],
        "priceHistory": [
           { "date": "YYYY-MM-DD", "price": 1200 },
           { "date": "YYYY-MM-DD", "price": 1210 },
           ... (Generate 30 points ending today)
        ],
        "technicalAnalysis": {
            "priceData": [],
            "rsiData": [],
            "currentRsi": 65,
            "currentMa": 100,
            "signal": "Buy" | "Sell" | "Neutral"
        },
        "financialStatements": null, 
        "bubbleAudit": {
            "riskStatus": "Elevated" | "Safe" | "Critical",
            "valuationVerdict": "Overvalued" | "Fair Value" | "Undervalued" | "Bubble",
            "score": 75,
            "fundamentals": "Deep dive into earnings quality, debt serviceability, and cash flow reality (2 sentences).",
            "speculativeActivity": "Moderate",
            "burstTrigger": "Specific event that could pop the bubble (e.g., 'Regulatory crackdowns on margin lending').",
            "liquidityStatus": "Abundant"
        },
        "warningSignals": ["Signal 1", "Signal 2"],
        "swot": {
          "strengths": ["...", "...", "...", "..."],
          "weaknesses": ["...", "...", "...", "..."],
          "opportunities": ["...", "...", "...", "..."],
          "threats": ["...", "...", "...", "..."]
        },
        "whistleblower": {
           "integrityScore": 85,
           "forensicVerdict": "Detailed summary of potential fraud or manipulation risks.",
           "anomalies": ["Unusual options activity...", "Divergence between cash flow and net income..."],
           "insiderDetails": ["Detailed insight into CEO selling patterns...", "Specific undisclosed related party transactions..."],
           "hiddenRisks": ["Detailed analysis of shadow banking exposure...", "Comprehensive breakdown of off-balance sheet liabilities..."],
           "darkPoolActivity": "Significant block selling detected near resistance levels with detailed volume analysis."
        },
        "topBubbleAssets": []
      }
      \`\`\`

      STEP 2: FORENSIC VERDICT (Markdown)
      Produce an institutional-grade Analysis Report (Markdown).
      **CRITICAL INSTRUCTION**: 
      - **LENGTH CONSTRAINT**: Keep each section to approximately **5-6 lines** of text.
      - **NO FLUFF**: Be direct, data-driven, and concise. Avoid generic filler.
      - **NO REPETITION**: The user already sees the Structured Data (Risk Score, Sentiment, SWOT List, Key Metrics) in the UI. Do not repeat them.
      
      Structure the report with EXACTLY these headers (Markdown H3 '###'):

      ### Accounting Integrity
      (Forensic check of earnings quality and potential red flags. Keep it to 5-6 lines.)

      ### Competitive Insulation
      (Analysis of moat and margin durability. Keep it to 5-6 lines.)

      ### The Invalidation Catalyst
      (Specific events that would prove the thesis wrong. Keep it to 5-6 lines.)

      ### Institutional Position
      (Smart money flow and insider sentiment. Keep it to 5-6 lines.)

      ### Final Verdict
      (Must start with [[[STRONG BUY]]], [[[BUY]]], [[[HOLD]]], [[[SELL]]], or [[[STRONG SELL]]]. Follow with a concise bottom line.)
    `;

    if (mode === 'market') {
        systemInstruction = jsonSystemInstruction;
        prompt = `Perform a forensic deep-dive analysis for: "${data}". Estimate current values as of today (${today}). Ensure all prices are in INR (₹).`;
    } else if (mode === 'portfolio') {
        systemInstruction = jsonSystemInstruction;
        prompt = `Audit this portfolio for risk and exposure as of ${today}: ${data}. Assume prices are in INR.`;
    } else if (mode === 'bubbles') {
        systemInstruction = jsonSystemInstruction;
        prompt = `Scan global markets for major Bubbles.`;
    } else if (mode === 'chat') {
        let payload;
        try { payload = typeof data === 'string' ? JSON.parse(data) : data; } catch (e) { payload = { history: [], message: data }; }
        systemInstruction = `You are 'The Reality Check', a witty, sarcastic financial assistant. Keep it short. Use Indian Rupees (₹). Current Date: ${today}`;
        const historyText = payload.history ? payload.history.map((h: any) => `${h.sender === 'user' ? 'User' : 'AI'}: ${h.text}`).join('\n') : '';
        prompt = `Previous conversation:\n${historyText}\n\nCurrent User Message: ${payload.message}`;
    }

    const completion = await groq.chat.completions.create({
      messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
      ],
      model: MODEL_NAME,
      temperature: 0, // Deterministic
      max_tokens: 8192
    });

    const text = completion.choices[0]?.message?.content || "";

    if (mode === 'chat') {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(text || "I'm speechless.");
    }
    
    return res.status(200).json({
        text: text,
        metadata: []
    });

  } catch (error: any) {
    console.error("[API ERROR]", error);
    return res.status(500).json({ error: error.message || 'Forensic Engine Offline', details: JSON.stringify(error) });
  }
}

import { GoogleGenAI, Type } from "@google/genai";
import { MarketData, OrderSide } from "../types";

// Fix: Initializing GoogleGenAI using process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMarket = async (data: MarketData[], currentPortfolio: any) => {
  // Fix: Using 'gemini-3-pro-preview' for complex text tasks (trading analysis and reasoning)
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    As a high-frequency algorithmic trader, analyze the following real-time market data:
    ${JSON.stringify(data)}
    
    Current Portfolio Status:
    ${JSON.stringify(currentPortfolio)}

    Rules:
    1. Only suggest a trade if probability of success > 75%.
    2. Focus on high-volatility assets for maximum ROI.
    3. Calculate exact entry points and stop losses.
    4. You must return a JSON response matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decision: {
              type: Type.STRING,
              enum: ['BUY', 'SELL', 'HOLD'],
              description: "The trading action to take."
            },
            asset: {
              type: Type.STRING,
              description: "The crypto symbol (e.g., BTC, ETH)."
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief technical reasoning for the decision."
            },
            entryPrice: {
              type: Type.NUMBER,
              description: "Target entry price."
            },
            amount: {
              type: Type.NUMBER,
              description: "Amount of asset to trade."
            },
            confidence: {
              type: Type.NUMBER,
              description: "Confidence score 0-100."
            }
          },
          required: ["decision", "asset", "reasoning", "entryPrice", "amount", "confidence"]
        }
      }
    });

    // Fix: Using response.text property directly as per guidelines
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

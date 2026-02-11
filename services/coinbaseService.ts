
import { MarketData, Portfolio, Trade, OrderSide } from '../types';

// The production URL of the Railway backend
const RAILWAY_URL = 'https://novanew-production.up.railway.app'; 

// Determine the base URL for API calls. 
// If we are running locally (localhost), we point to the production Railway URL to bypass local setup.
// If we are running on the production domain itself, we use a relative path '/api'.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? `${RAILWAY_URL}/api` : '/api';

export const fetchMarketData = async (): Promise<MarketData[]> => {
  try {
    // Simulate real-time data for UI consistency
    return [
      { symbol: 'BTC', price: 68000 + (Math.random() * 500), change24h: 1.5, volume24h: 1200000000, rsi: 55 },
      { symbol: 'ETH', price: 3400 + (Math.random() * 50), change24h: -0.8, volume24h: 800000000, rsi: 48 },
      { symbol: 'SOL', price: 145 + (Math.random() * 5), change24h: 5.2, volume24h: 300000000, rsi: 65 },
    ];
  } catch (e) {
    return [];
  }
};

export const fetchPortfolio = async (): Promise<Portfolio> => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio`);
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server ${response.status}: ${errorText || 'Unknown Error'}`);
    }
    
    const data = await response.json();
    
    // Process Coinbase API accounts response
    const accounts = data.accounts || [];
    const assets = accounts.map((acc: any) => ({
      symbol: acc.currency || acc.name,
      amount: parseFloat(acc.available_balance?.value || acc.amount || "0"),
      value: parseFloat(acc.available_balance?.value || acc.amount || "0") * 1 
    })).filter((a: any) => a.amount > 0);

    const total = assets.reduce((sum: number, a: any) => sum + a.value, 0);

    return {
      totalValue: total,
      availableCash: 1000, // This should ideally come from a USD balance account
      assets: assets
    };
  } catch (e: any) {
    console.error("Portfolio fetch failed:", e.message);
    // Return a default state instead of throwing to keep the UI alive
    return { totalValue: 0, availableCash: 0, assets: [] };
  }
};

export const executeOrder = async (order: { asset: string, side: OrderSide, amount: number, entryPrice: number }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: order.asset,
        side: order.side.toLowerCase(),
        amount: order.amount,
        price: order.entryPrice
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Order execution failed: ${errorText}`);
    }
    
    const data = await response.json();
    return { 
      success: true, 
      orderId: data.order_id || Math.random().toString(36).substr(2, 9) 
    };
  } catch (e) {
    console.error("Trade execution error:", e);
    return { success: false, orderId: '' };
  }
};

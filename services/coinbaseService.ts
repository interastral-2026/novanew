
import { MarketData, Portfolio, Trade, OrderSide } from '../types';

// آدرس ریلی‌وی بدون اسلش نهایی
const RAILWAY_URL = 'https://novanew-production.up.railway.app'; 

// اطمینان از اینکه در هر دو حالت لوکال و ریلی‌وی، مسیر درست ساخته می‌شود
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? RAILWAY_URL + '/api'
  : '/api';

export const fetchMarketData = async (): Promise<MarketData[]> => {
  try {
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
        throw new Error(`Server ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    
    const accounts = data.accounts || [];
    const assets = accounts.map((acc: any) => ({
      symbol: acc.currency,
      amount: parseFloat(acc.available_balance?.value || "0"),
      value: parseFloat(acc.available_balance?.value || "0") * 1 // در آینده می‌توان قیمت لحظه‌ای را ضرب کرد
    })).filter((a: any) => a.amount > 0);

    const total = assets.reduce((sum: number, a: any) => sum + a.value, 0);

    return {
      totalValue: total,
      availableCash: 1000,
      assets: assets
    };
  } catch (e: any) {
    console.error("Portfolio fetch failed:", e.message);
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
      throw new Error(`Order failed: ${errorText}`);
    }
    const data = await response.json();
    return { success: true, orderId: data.order_id || Math.random().toString(36).substr(2, 9) };
  } catch (e) {
    console.error("Trade Error:", e);
    return { success: false, orderId: '' };
  }
};

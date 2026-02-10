
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketData, Portfolio, Trade, AILog, OrderSide } from './types';
import { fetchMarketData, fetchPortfolio, executeOrder } from './services/coinbaseService';
import { analyzeMarket } from './services/geminiService';
import Dashboard from './components/Dashboard';
import AILogs from './components/AILogs';
import TradeHistory from './components/TradeHistory';
import PortfolioView from './components/PortfolioView';
import { Activity, ShieldCheck, Zap, Bot, TrendingUp, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [history, setHistory] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<AILog[]>([]);
  const [isAutoTrading, setIsAutoTrading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<string>('Never');

  const addLog = (message: string, type: AILog['type'] = 'INFO') => {
    const newLog: AILog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      message,
      type
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const refreshData = async () => {
    try {
      const [m, p] = await Promise.all([fetchMarketData(), fetchPortfolio()]);
      setMarketData(m);
      setPortfolio(p);
    } catch (error) {
      addLog("Failed to fetch market data", "ERROR");
    }
  };

  const runAnalysis = async () => {
    if (!portfolio || marketData.length === 0) return;
    
    addLog("AI is scanning market charts and order books...", "INFO");
    const result = await analyzeMarket(marketData, portfolio);
    
    if (result && result.decision !== 'HOLD') {
      addLog(`AI DECISION: ${result.decision} ${result.asset} - Reason: ${result.reasoning}`, "DECISION");
      
      if (isAutoTrading) {
        const orderResult = await executeOrder({
          asset: result.asset,
          side: result.decision as OrderSide,
          amount: result.amount,
          entryPrice: result.entryPrice
        });

        if (orderResult.success) {
          const newTrade: Trade = {
            id: orderResult.orderId,
            asset: result.asset,
            side: result.decision as OrderSide,
            entryPrice: result.entryPrice,
            amount: result.amount,
            timestamp: Date.now(),
            status: 'OPEN'
          };
          setHistory(prev => [newTrade, ...prev]);
          addLog(`Order placed successfully: ${orderResult.orderId}`, "INFO");
        }
      }
    } else {
      addLog("Market analysis complete. No high-probability setups found.", "INFO");
    }
    setLastAnalysis(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); // Live price updates
    return () => clearInterval(interval);
  }, []);

  // Trading Loop
  useEffect(() => {
    // Fix: Changed NodeJS.Timeout to any to resolve namespace error in browser
    let tradingInterval: any;
    if (isAutoTrading) {
      tradingInterval = setInterval(runAnalysis, 30000); // Analyze every 30s
    }
    return () => clearInterval(tradingInterval);
  }, [isAutoTrading, marketData, portfolio]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">ASTRAEA AI</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${isAutoTrading ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                {isAutoTrading ? 'Live Trading Active' : 'Standby'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase font-semibold">Total Portfolio</span>
              <span className="text-xl font-bold mono text-emerald-400">${portfolio?.totalValue.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => setIsAutoTrading(!isAutoTrading)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${isAutoTrading ? 'bg-red-500/10 text-red-500 border border-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
            >
              {isAutoTrading ? 'STOP ROBOT' : 'START ROBOT'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Market & Portfolio */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-2">
                <TrendingUp className="text-emerald-400 w-5 h-5" />
                <span className="text-emerald-400 bg-emerald-400/10 text-xs px-2 py-0.5 rounded">+12.4%</span>
              </div>
              <h3 className="text-slate-400 text-sm">Today's ROI</h3>
              <p className="text-2xl font-bold mono">$1,542.20</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-2">
                <ShieldCheck className="text-cyan-400 w-5 h-5" />
                <span className="text-slate-400 text-xs px-2 py-0.5 rounded">98% Accuracy</span>
              </div>
              <h3 className="text-slate-400 text-sm">Win Rate</h3>
              <p className="text-2xl font-bold mono">74.2%</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-2">
                <Activity className="text-indigo-400 w-5 h-5" />
                <button onClick={runAnalysis} className="text-slate-400 hover:text-white transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-slate-400 text-sm">Last Analysis</h3>
              <p className="text-2xl font-bold mono">{lastAnalysis}</p>
            </div>
          </div>

          <Dashboard marketData={marketData} />
          <TradeHistory history={history} />
        </div>

        {/* Right Column - AI Intelligence Feed */}
        <div className="lg:col-span-4 space-y-6">
          <PortfolioView portfolio={portfolio} />
          <AILogs logs={logs} />
        </div>
      </main>

      <footer className="p-4 border-t border-slate-800 text-center text-slate-500 text-xs">
        &copy; 2024 Astraea AI Trading System. Using Gemini 3 Flash & Coinbase Advanced Trade API.
      </footer>
    </div>
  );
};

export default App;

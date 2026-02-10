
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MarketData, Portfolio, Trade, AILog, OrderSide } from './types';
import { fetchMarketData, fetchPortfolio, executeOrder } from './services/coinbaseService';
import { analyzeMarket } from './services/geminiService';
import Dashboard from './components/Dashboard';
import AILogs from './components/AILogs';
import TradeHistory from './components/TradeHistory';
import PortfolioView from './components/PortfolioView';
import { Activity, ShieldCheck, Zap, Bot, TrendingUp, RefreshCw, Cpu } from 'lucide-react';

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
      addLog("خطا در دریافت اطلاعات زنده بازار", "ERROR");
    }
  };

  const runAnalysis = async () => {
    if (!portfolio || marketData.length === 0) return;
    
    addLog("هوش مصنوعی در حال تحلیل چارت‌ها و الگوهای کندل‌استیک...", "INFO");
    const result = await analyzeMarket(marketData, portfolio);
    
    if (result && result.decision !== 'HOLD') {
      addLog(`سیگنال هوشمند: ${result.decision} برای ${result.asset}. دلیل: ${result.reasoning}`, "DECISION");
      
      if (isAutoTrading) {
        addLog(`در حال ارسال سفارش به کوین‌بیس...`, "INFO");
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
          addLog(`سفارش با موفقیت ثبت شد. ID: ${orderResult.orderId}`, "INFO");
        } else {
          addLog("خطا در اجرای سفارش در صرافی", "ERROR");
        }
      }
    } else {
      addLog("تحلیل بازار انجام شد. فعلاً موقعیت سودآوری با ریسک پایین پیدا نشد.", "INFO");
    }
    setLastAnalysis(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let tradingInterval: any;
    if (isAutoTrading) {
      addLog("ربات معامله‌گر فعال شد. مانیتورینگ ۳۰ ثانیه‌ای آغاز گردید.", "WARNING");
      tradingInterval = setInterval(runAnalysis, 30000);
    } else {
      addLog("ربات در حالت Standby قرار گرفت.", "INFO");
    }
    return () => clearInterval(tradingInterval);
  }, [isAutoTrading, marketData, portfolio]);

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <Cpu className="text-white w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase">
                Astraea AI Trader
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className={`w-1.5 h-1.5 rounded-full ${isAutoTrading ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                {isAutoTrading ? 'Autonomous Mode On' : 'Manual Monitoring'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Live Equity</span>
              <span className="text-2xl font-black mono text-emerald-400 tracking-tighter">
                ${portfolio?.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </span>
            </div>
            <button 
              onClick={() => setIsAutoTrading(!isAutoTrading)}
              className={`px-8 py-3 rounded-xl font-black text-sm tracking-tighter transition-all shadow-lg shadow-black/40 ${isAutoTrading ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'}`}
            >
              {isAutoTrading ? 'DEACTIVATE AI' : 'ACTIVATE AI ROBOT'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-sm group hover:border-emerald-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp className="w-6 h-6" /></div>
                <span className="text-emerald-400 bg-emerald-400/10 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Profit</span>
              </div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Day's Net P&L</h3>
              <p className="text-3xl font-black mono mt-1">+$842.20</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-sm group hover:border-cyan-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><ShieldCheck className="w-6 h-6" /></div>
                <span className="text-cyan-400 bg-cyan-400/10 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Safe</span>
              </div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Model Confidence</h3>
              <p className="text-3xl font-black mono mt-1">94.2%</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-2xl backdrop-blur-sm group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Activity className="w-6 h-6" /></div>
                <button onClick={runAnalysis} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
              </div>
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Scanning Speed</h3>
              <p className="text-3xl font-black mono mt-1">30s/Cycle</p>
            </div>
          </div>

          <Dashboard marketData={marketData} />
          <TradeHistory history={history} />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <PortfolioView portfolio={portfolio} />
          <AILogs logs={logs} />
        </div>
      </main>

      <footer className="p-6 border-t border-slate-800 bg-slate-950/50 text-center">
        <div className="flex justify-center items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          <span>Security: AES-256</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>Engine: Gemini 3 Pro</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span>Broker: Coinbase Advanced</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

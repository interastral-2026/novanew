
import React from 'react';
import { MarketData } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  marketData: MarketData[];
}

const mockChartData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}:00`,
  price: 65000 + Math.random() * 5000
}));

const Dashboard: React.FC<Props> = ({ marketData }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
          Live Market Monitor
        </h2>
        <div className="flex gap-2">
          {['1H', '1D', '1W'].map(t => (
            <button key={t} className="px-3 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:text-white">{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {marketData.map((data) => (
          <div key={data.symbol} className="p-4 bg-slate-950 rounded-xl border border-slate-800/50 hover:border-emerald-500/30 transition-all cursor-pointer group">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{data.symbol}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${data.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {data.change24h >= 0 ? '+' : ''}{data.change24h}%
              </span>
            </div>
            <div className="text-xl font-bold mono">${data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${data.rsi && data.rsi > 70 ? 'bg-red-500' : data.rsi && data.rsi < 30 ? 'bg-emerald-500' : 'bg-cyan-500'}`} 
                    style={{width: `${data.rsi}%`}}
                ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>RSI: {data.rsi}</span>
                <span>{data.rsi && data.rsi > 70 ? 'OVERBOUGHT' : data.rsi && data.rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* اضافه کردن min-height به ظرف نمودار برای جلوگیری از خطای width(-1) */}
      <div className="h-64 w-full bg-slate-950/50 rounded-xl p-2 border border-slate-800 relative" style={{ minHeight: '256px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockChartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}}
              itemStyle={{color: '#10b981'}}
            />
            <Area type="monotone" dataKey="price" stroke="#10b981" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;

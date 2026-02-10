
import React from 'react';
import { Trade, OrderSide } from '../types';

interface Props {
  history: Trade[];
}

const TradeHistory: React.FC<Props> = ({ history }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-bold">Trade History & Activity</h2>
        <span className="text-xs text-slate-500">{history.length} operations logged</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Asset</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Entry</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">ROI</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {history.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                    No trades executed yet. Waiting for market opportunities.
                </td>
              </tr>
            )}
            {history.map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-bold">{trade.asset}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${trade.side === OrderSide.BUY ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {trade.side}
                  </span>
                </td>
                <td className="px-6 py-4 mono">${trade.entryPrice.toLocaleString()}</td>
                <td className="px-6 py-4 mono">{trade.amount}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 ${trade.status === 'OPEN' ? 'text-cyan-400' : 'text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${trade.status === 'OPEN' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`}></span>
                    {trade.status}
                  </span>
                </td>
                <td className={`px-6 py-4 mono font-bold ${trade.roi && trade.roi > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {trade.roi ? `${trade.roi > 0 ? '+' : ''}${trade.roi}%` : '--'}
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;

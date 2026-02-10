
import React from 'react';
import { Portfolio } from '../types';
import { Wallet, PieChart, ArrowUpRight } from 'lucide-react';

interface Props {
  portfolio: Portfolio | null;
}

const PortfolioView: React.FC<Props> = ({ portfolio }) => {
  if (!portfolio) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center gap-2 mb-6 font-bold">
        <Wallet className="text-emerald-400 w-5 h-5" />
        Coinbase Holdings
      </div>

      <div className="space-y-4">
        {portfolio.assets.map((asset) => (
          <div key={asset.symbol} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                {asset.symbol[0]}
              </div>
              <div>
                <div className="font-bold">{asset.symbol}</div>
                <div className="text-xs text-slate-500">{asset.amount} tokens</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold mono">${asset.value.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-500 flex items-center justify-end gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                2.4%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex justify-between items-center text-sm mb-1">
          <span className="text-slate-500">Available Cash (USD)</span>
          <span className="font-bold mono">${portfolio.availableCash.toLocaleString()}</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
            <div className="bg-emerald-500 h-full rounded-full" style={{width: '36%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;

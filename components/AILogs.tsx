
import React from 'react';
import { AILog } from '../types';
// Fix: Added Zap to the imports
import { Terminal, BrainCircuit, AlertCircle, Info, Zap } from 'lucide-react';

interface Props {
  logs: AILog[];
}

const AILogs: React.FC<Props> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-[500px]">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Terminal className="w-4 h-4 text-emerald-400" />
          AI COGNITIVE FEED
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest">v3.1.0 Astraea Core</div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 mono text-xs">
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 opacity-50">
            <BrainCircuit className="w-8 h-8" />
            <p>Awaiting data stream...</p>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}]</span>
            <div className={`flex gap-2 ${
              log.type === 'DECISION' ? 'text-emerald-400' : 
              log.type === 'ERROR' ? 'text-red-400' : 
              log.type === 'WARNING' ? 'text-amber-400' : 'text-slate-300'
            }`}>
              {log.type === 'DECISION' && <Zap className="w-3 h-3 mt-0.5 shrink-0" />}
              {log.type === 'ERROR' && <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />}
              {log.type === 'INFO' && <Info className="w-3 h-3 mt-0.5 shrink-0" />}
              <p className="leading-relaxed">
                <span className="font-bold mr-2 uppercase">{log.type}:</span>
                {log.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 bg-slate-950/80 border-t border-slate-800 text-[10px] flex justify-between px-4">
        <span className="text-emerald-500/70">NEURAL_NET: CONNECTED</span>
        <span className="text-slate-600">LATENCY: 42ms</span>
      </div>
    </div>
  );
};

export default AILogs;

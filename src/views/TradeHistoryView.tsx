import { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase, type TradeHistory } from '@/lib/supabase';

export default function TradeHistoryView() {
  const { formatCurrency } = useApp();
  const [trades, setTrades] = useState<TradeHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('trade_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .then(({ data }) => {
        if (!mounted) return;
        setTrades((data as TradeHistory[]) ?? []);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-neon-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-neon-cyan" />
          Trade History
        </h2>
        <p className="text-sm text-slate-400">Complete log of all your executed trades</p>
      </div>

      {trades.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <History className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-300">No trades yet</p>
          <p className="text-xs text-slate-500 mt-1">Your executed trades will appear here once your bots start trading.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="text-left py-3 px-4 font-semibold">Time</th>
                  <th className="text-left py-3 px-4 font-semibold">Pair</th>
                  <th className="text-center py-3 px-4 font-semibold">Side</th>
                  <th className="text-right py-3 px-4 font-semibold hidden sm:table-cell">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold">Price</th>
                  <th className="text-right py-3 px-4 font-semibold">P&L</th>
                  <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Strategy</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                      {new Date(t.timestamp).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{t.pair}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${t.side === 'BUY' ? 'text-neon-green bg-neon-green/10' : 'text-neon-red bg-neon-red/10'}`}>
                        {t.side === 'BUY' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {t.side}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300 hidden sm:table-cell">{t.amount}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">${Number(t.price).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      <span className={Number(t.pnl) > 0 ? 'text-neon-green' : Number(t.pnl) < 0 ? 'text-neon-red' : 'text-slate-500'}>
                        {Number(t.pnl) > 0 ? '+' : ''}{formatCurrency(Number(t.pnl))}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 hidden md:table-cell">{t.strategy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

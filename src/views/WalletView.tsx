import { Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight, Calculator, PieChart } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { coins } from '@/data/mockData';

export default function WalletView() {
  const { formatCurrency, formatCompact, currency } = useApp();

  const holdings = [
    { symbol: 'BTC', amount: 1.85, usdValue: 124_513 },
    { symbol: 'ETH', amount: 18.2, usdValue: 63_336 },
    { symbol: 'SOL', amount: 320, usdValue: 53_920 },
    { symbol: 'USDT', amount: 6500, usdValue: 6500 },
    { symbol: 'BNB', amount: 8.5, usdValue: 5202 },
  ];
  const totalValue = holdings.reduce((s, h) => s + h.usdValue, 0);
  const totalCost = 240_000;
  const totalPnl = totalValue - totalCost;
  const pnlPct = (totalPnl / totalCost) * 100;

  // Position size calculator
  const entryPrice = 67000;
  const stopPrice = 65000;
  const riskAmount = 1000;
  const riskPerUnit = entryPrice - stopPrice;
  const positionSize = riskAmount / riskPerUnit;
  const positionValue = positionSize * entryPrice;

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-neon-green" />
          Wallet & Calculation
        </h2>
        <p className="text-sm text-slate-400">Portfolio overview and trading calculators</p>
      </div>

      {/* Portfolio overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Total Portfolio Value</h3>
            <PieChart className="w-4 h-4 text-neon-cyan" />
          </div>
          <p className="text-3xl font-bold text-white font-mono">{formatCurrency(totalValue)}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-sm font-semibold ${totalPnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)} ({pnlPct.toFixed(2)}%)
            </span>
            <span className="text-xs text-slate-500">all-time</span>
          </div>

          {/* Allocation bars */}
          <div className="mt-5 space-y-3">
            {holdings.map((h) => {
              const pct = (h.usdValue / totalValue) * 100;
              return (
                <div key={h.symbol}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300 font-semibold">{h.symbol}</span>
                    <span className="text-slate-400 font-mono">{formatCurrency(h.usdValue)} · {pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-base-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-neon-cyan/60 to-neon-green/60 transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Available Balance</span>
              <Wallet className="w-4 h-4 text-neon-green" />
            </div>
            <p className="text-xl font-bold text-white font-mono">{formatCurrency(6500)}</p>
            <p className="text-[10px] text-neon-green mt-0.5">USDT · Ready to deploy</p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">Total P&L</span>
              <TrendingUp className="w-4 h-4 text-neon-green" />
            </div>
            <p className="text-xl font-bold text-neon-green font-mono">+{formatCurrency(totalPnl)}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">+{pnlPct.toFixed(2)}% all-time</p>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-neon-green" />
              <span className="text-xs text-slate-400">Deposit</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <ArrowUpRight className="w-4 h-4 text-neon-red" />
              <span className="text-xs text-slate-400">Withdraw</span>
            </div>
          </div>
        </div>
      </div>

      {/* Position Size Calculator */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-neon-amber" />
          Position Size Calculator
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CalcInput label="Entry Price" value={`$${entryPrice.toLocaleString()}`} />
          <CalcInput label="Stop Loss Price" value={`$${stopPrice.toLocaleString()}`} />
          <CalcInput label={`Risk Amount (${currency})`} value={formatCurrency(riskAmount)} />
          <CalcInput label="Risk Per Unit" value={`$${riskPerUnit.toLocaleString()}`} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/15">
            <p className="text-[10px] text-slate-500 uppercase mb-1">Position Size</p>
            <p className="text-lg font-bold text-neon-cyan font-mono">{positionSize.toFixed(6)} units</p>
          </div>
          <div className="p-4 rounded-xl bg-neon-green/5 border border-neon-green/15">
            <p className="text-[10px] text-slate-500 uppercase mb-1">Position Value</p>
            <p className="text-lg font-bold text-neon-green font-mono">{formatCurrency(positionValue)}</p>
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white">Holdings</h3>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-[10px] uppercase tracking-wider text-slate-500">
                <th className="text-left py-2.5 px-5 font-semibold">Asset</th>
                <th className="text-right py-2.5 px-5 font-semibold">Amount</th>
                <th className="text-right py-2.5 px-5 font-semibold">Value ({currency})</th>
                <th className="text-right py-2.5 px-5 font-semibold hidden sm:table-cell">Avg. Cost</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const coin = coins.find(c => c.symbol === h.symbol);
                const avgCost = coin ? coin.price * 0.95 : h.usdValue / h.amount;
                return (
                  <tr key={h.symbol} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 font-semibold text-white">{h.symbol}</td>
                    <td className="py-3 px-5 text-right font-mono text-slate-300">{h.amount}</td>
                    <td className="py-3 px-5 text-right font-mono text-slate-200">{formatCurrency(h.usdValue)}</td>
                    <td className="py-3 px-5 text-right font-mono text-slate-400 hidden sm:table-cell">${avgCost.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CalcInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl glass">
      <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-bold text-white font-mono">{value}</p>
    </div>
  );
}

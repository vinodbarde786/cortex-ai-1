import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Rocket, Brain, Crosshair, Zap, ArrowUpRight, Activity, DollarSign, Users, Target } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { strategies, coins, signals, type Strategy } from '@/data/mockData';
import Sparkline from '@/components/Sparkline';
import { supabase, type Bot, type TradeHistory } from '@/lib/supabase';

const iconMap: Record<string, typeof Rocket> = { Rocket, Brain, Crosshair };
const accentMap = {
  green: { text: 'text-neon-green', border: 'border-neon-green/30', bg: 'bg-neon-green/10', glow: 'neon-glow-green', hex: '#00ff9d' },
  cyan: { text: 'text-neon-cyan', border: 'border-neon-cyan/30', bg: 'bg-neon-cyan/10', glow: 'neon-glow-cyan', hex: '#00e5ff' },
  amber: { text: 'text-neon-amber', border: 'border-neon-amber/30', bg: 'bg-neon-amber/10', glow: '', hex: '#ffb020' },
};

export default function DashboardView() {
  const { formatCurrency, formatCompact } = useApp();
  const [deployed, setDeployed] = useState<Set<string>>(new Set());
  const [bots, setBots] = useState<Bot[]>([]);
  const [trades, setTrades] = useState<TradeHistory[]>([]);

  useEffect(() => {
    supabase.from('bots').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setBots((data as Bot[]) ?? []);
    });
    supabase.from('trade_history').select('*').order('timestamp', { ascending: false }).limit(20).then(({ data }) => {
      setTrades((data as TradeHistory[]) ?? []);
    });
  }, []);

  const totalPnl = trades.reduce((sum, t) => sum + Number(t.pnl), 0);
  const activeCount = bots.filter(b => b.status === 'running').length;
  const winCount = trades.filter(t => Number(t.pnl) > 0).length;
  const winRate = trades.length > 0 ? ((winCount / trades.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Portfolio Value" value={formatCurrency(Math.max(totalPnl, 0) + 50000)} icon={DollarSign} accent="cyan" sub="Estimated" />
        <StatCard label="Total P&L" value={formatCurrency(totalPnl)} icon={TrendingUp} accent="green" sub={`${trades.length} trades`} />
        <StatCard label="Active Bots" value={`${activeCount} / ${bots.length}`} icon={Activity} accent="amber" sub={bots.length > 0 ? `${bots.length} total` : 'No bots yet'} />
        <StatCard label="Win Rate" value={`${winRate}%`} icon={Target} accent="green" sub={`${winCount} wins`} />
      </div>

      {/* AI Market Sentiment Widget */}
      <div className="glass-card p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-green/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center neon-glow-green flex-shrink-0">
              <Brain className="w-7 h-7 text-neon-green animate-pulse-glow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
                </span>
                <h2 className="text-sm font-bold text-white tracking-wide">LIVE AI MARKET SENTIMENT</h2>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                <span className="text-neon-green neon-text-green animate-pulse-glow">AI Prediction: 78% Bullish on BTC</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Cortex Neural Engine v3 · Analyzing 1,247 data sources · Updated 8s ago</p>
            </div>
          </div>
        </div>

        {/* Sentiment Progress Bar */}
        <div className="relative mt-5">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
            <span>Bearish</span>
            <span>Neutral</span>
            <span className="text-neon-green font-semibold">Bullish 78%</span>
          </div>
          <div className="h-3 rounded-full bg-base-700 overflow-hidden relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-red via-neon-amber to-neon-green transition-all duration-1000 relative"
              style={{ width: '78%' }}
            >
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 20px rgba(0, 255, 157, 0.5)' }} />
              <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/30 to-transparent" />
            </div>
          </div>
          {/* Markers */}
          <div className="flex justify-between mt-1 text-[10px] text-slate-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Sub-sentiment chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Fear & Greed', value: '72 — Greed', color: 'green' },
            { label: 'Social Buzz', value: '+18% BTC', color: 'cyan' },
            { label: 'On-Chain Flow', value: 'Net Inflow', color: 'green' },
            { label: 'Volatility', value: 'Moderate', color: 'amber' },
          ].map((chip) => (
            <div key={chip.label} className={`px-3 py-1.5 rounded-lg text-xs ${accentMap[chip.color as keyof typeof accentMap].bg} ${accentMap[chip.color as keyof typeof accentMap].border} border`}>
              <span className="text-slate-400">{chip.label}: </span>
              <span className={accentMap[chip.color as keyof typeof accentMap].text + ' font-semibold'}>{chip.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fully Automatic AI Strategies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-cyan" />
            Fully Automatic AI Strategies
          </h3>
          <span className="text-xs text-slate-500">{strategies.length} strategies available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {strategies.map((s) => (
            <StrategyCard
              key={s.id}
              strategy={s}
              deployed={deployed.has(s.id)}
              onDeploy={() => setDeployed((prev) => new Set(prev).add(s.id))}
              formatCurrency={formatCurrency}
              formatCompact={formatCompact}
            />
          ))}
        </div>
      </div>

      {/* Bottom: Recent signals + Top movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Signals */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            Latest AI Signals
          </h3>
          <div className="space-y-2">
            {signals.slice(0, 5).map((sig) => (
              <div key={sig.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${sig.type === 'BUY' ? 'bg-neon-green/15 text-neon-green' : sig.type === 'SELL' ? 'bg-neon-red/15 text-neon-red' : 'bg-neon-amber/15 text-neon-amber'}`}>
                    {sig.type}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{sig.coin}</p>
                    <p className="text-[10px] text-slate-500">{sig.timeframe} · {sig.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-slate-200">${sig.entry.toLocaleString()}</p>
                  <p className="text-[10px] text-neon-cyan">{sig.confidence}% conf.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movers */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-cyan" />
            Top Movers (24h)
          </h3>
          <div className="space-y-2">
            {[...coins].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 5).map((c) => (
              <div key={c.symbol} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-slate-300">
                    {c.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.symbol}</p>
                    <p className="text-[10px] text-slate-500">{formatCompact(c.volume24h)} vol</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkline data={c.sparkline} color={c.change24h >= 0 ? '#00ff9d' : '#ff3b5c'} width={60} height={24} />
                  <div className="text-right">
                    <p className="text-sm font-mono text-slate-200">${c.price.toLocaleString()}</p>
                    <p className={`text-[10px] font-semibold ${c.change24h >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                      {c.change24h >= 0 ? '+' : ''}{c.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, sub }: { label: string; value: string; icon: typeof DollarSign; accent: keyof typeof accentMap; sub: string }) {
  const a = accentMap[accent];
  return (
    <div className="glass-card p-4 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
      <div className={`absolute -top-8 -right-8 w-24 h-24 ${a.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">{label}</span>
          <Icon className={`w-4 h-4 ${a.text}`} />
        </div>
        <p className="text-lg sm:text-xl font-bold text-white font-mono">{value}</p>
        <p className={`text-[10px] mt-0.5 ${a.text}`}>{sub}</p>
      </div>
    </div>
  );
}

function StrategyCard({ strategy, deployed, onDeploy, formatCurrency, formatCompact }: {
  strategy: Strategy;
  deployed: boolean;
  onDeploy: () => void;
  formatCurrency: (n: number) => string;
  formatCompact: (n: number) => string;
}) {
  const a = accentMap[strategy.accent];
  const Icon = iconMap[strategy.icon] || Rocket;
  const riskColor = strategy.riskLevel === 'Low' ? 'green' : strategy.riskLevel === 'Medium' ? 'amber' : 'red';

  return (
    <div className={`glass-card p-5 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300 ${deployed ? a.border : ''}`}>
      <div className={`absolute -top-12 -right-12 w-32 h-32 ${a.bg} rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition-opacity`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-xl ${a.bg} ${a.border} border flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${a.text}`} />
          </div>
          <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide bg-${riskColor === 'green' ? 'neon-green' : riskColor === 'amber' ? 'neon-amber' : 'neon-red'}/10 ${riskColor === 'green' ? 'text-neon-green' : riskColor === 'amber' ? 'text-neon-amber' : 'text-neon-red'} border border-${riskColor === 'green' ? 'neon-green' : riskColor === 'amber' ? 'neon-amber' : 'neon-red'}/20`}>
            {strategy.riskLevel} Risk
          </span>
        </div>

        {/* Name + desc */}
        <h4 className="text-base font-bold text-white mb-1">{strategy.name}</h4>
        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{strategy.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Expected" value={strategy.expectedReturn} accent={a.text} />
          <Stat label="Win Rate" value={`${strategy.winRate}%`} accent="text-neon-green" />
          <Stat label="Traders" value={formatCompact(strategy.activeTraders)} accent="text-slate-300" />
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {strategy.features.map((f) => (
            <span key={f} className="px-2 py-1 rounded-md bg-white/[0.04] text-[10px] text-slate-400">
              {f}
            </span>
          ))}
        </div>

        {/* Deploy button */}
        <button
          onClick={onDeploy}
          disabled={deployed}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
            deployed
              ? 'bg-neon-green/15 text-neon-green border border-neon-green/40 neon-glow-green cursor-default'
              : `btn-neon-${strategy.accent === 'amber' ? 'cyan' : strategy.accent} hover:scale-[1.02]`
          }`}
        >
          {deployed ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
              </span>
              Deployed on Autopilot
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4" />
              Deploy on Autopilot
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="text-center py-2 rounded-lg bg-white/[0.03]">
      <p className="text-[9px] text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-xs font-bold ${accent}`}>{value}</p>
    </div>
  );
}

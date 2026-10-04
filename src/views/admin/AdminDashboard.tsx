import { useEffect, useState } from 'react';
import { Users, DollarSign, Bot, TrendingUp, TrendingDown, Activity, Server, Zap, ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { adminClients, systemActivities } from '@/data/adminMockData';
import { coins } from '@/data/mockData';
import { useAdminCurrency } from '@/context/AdminCurrencyContext';

const severityConfig = {
  info: 'text-slate-400',
  warning: 'text-neon-amber',
  critical: 'text-neon-red',
  success: 'text-neon-green',
};

const typeIcon: Record<string, typeof Users> = {
  login: Users,
  bot_deploy: Bot,
  trade: TrendingUp,
  license_change: DollarSign,
  risk_alert: AlertTriangle,
  admin_action: ShieldCheck,
};

export default function AdminDashboard() {
  const { formatCompact, formatCurrency, symbol } = useAdminCurrency();
  const [botCount, setBotCount] = useState(0);
  const [activeBots, setActiveBots] = useState(0);
  const [tradeCount, setTradeCount] = useState(0);

  useEffect(() => {
    supabase.from('bots').select('*').then(({ data }) => {
      setBotCount(data?.length ?? 0);
      setActiveBots(data?.filter(b => b.status === 'running').length ?? 0);
    });
    supabase.from('trade_history').select('*').then(({ data }) => {
      setTradeCount(data?.length ?? 0);
    });
  }, []);

  const totalClientFunds = adminClients.reduce((s, c) => s + c.totalFunds, 0);
  const totalUnrealizedPnl = adminClients.reduce((s, c) => s + c.unrealizedPnl, 0);
  const totalRealizedPnl = adminClients.reduce((s, c) => s + c.realizedPnl, 0);
  const activeClients = adminClients.filter(c => c.status === 'active').length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total AUM" value={formatCompact(totalClientFunds)} icon={DollarSign} accent="cyan" sub="Under Management" />
        <StatCard label="Active Clients" value={activeClients.toString()} icon={Users} accent="green" sub={`${adminClients.length} total`} />
        <StatCard label="Running Bots" value={activeBots.toString()} icon={Bot} accent="amber" sub={`${botCount} total deployed`} />
        <StatCard label="Total Trades" value={tradeCount.toString()} icon={Activity} accent="cyan" sub="all-time" />
      </div>

      {/* PnL overview + system health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* PnL */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            Platform P&L Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neon-green/5 border border-neon-green/10">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Unrealized P&L</p>
                <p className="text-xl font-bold text-neon-green font-mono">+{formatCurrency(totalUnrealizedPnl)}</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-neon-green/50" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/10">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Realized P&L</p>
                <p className="text-xl font-bold text-neon-cyan font-mono">+{formatCurrency(totalRealizedPnl)}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-neon-cyan/50" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Total Platform P&L</p>
                <p className="text-xl font-bold text-white font-mono">+{formatCurrency(totalUnrealizedPnl + totalRealizedPnl)}</p>
              </div>
              <Zap className="w-6 h-6 text-neon-amber/50" />
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-cyan" />
            System Activity Feed
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
            {systemActivities.map((a) => {
              const Icon = typeIcon[a.type] || Activity;
              return (
                <div key={a.id} className="flex items-start gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className={`w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${severityConfig[a.severity]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200">{a.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500">{a.user}</span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[10px] text-slate-500">{a.timestamp}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase ${severityConfig[a.severity]}`}>{a.severity}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top clients + market overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Clients */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-neon-green" />
            Top Clients by AUM
          </h3>
          <div className="space-y-2">
            {[...adminClients].sort((a, b) => b.totalFunds - a.totalFunds).slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-slate-300">
                    {c.email.split('@')[0].slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.email.split('@')[0]}</p>
                    <p className="text-[10px] text-slate-500">{c.plan} · {c.activeBots} bots</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-slate-200">{formatCurrency(c.totalFunds)}</p>
                  <p className={`text-[10px] font-semibold ${c.unrealizedPnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {c.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(c.unrealizedPnl)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market snapshot */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-neon-cyan" />
            Market Snapshot
          </h3>
          <div className="space-y-2">
            {coins.slice(0, 5).map((c) => (
              <div key={c.symbol} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-slate-300">
                    {c.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.symbol}</p>
                    <p className="text-[10px] text-slate-500">{c.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-slate-200">{symbol}{c.price.toLocaleString()}</p>
                  <p className={`text-[10px] font-semibold ${c.change24h >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                    {c.change24h >= 0 ? '+' : ''}{c.change24h.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, sub }: { label: string; value: string; icon: typeof DollarSign; accent: 'cyan' | 'green' | 'amber' | 'red'; sub: string }) {
  const colors = {
    cyan: { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
    green: { text: 'text-neon-green', bg: 'bg-neon-green/10' },
    amber: { text: 'text-neon-amber', bg: 'bg-neon-amber/10' },
    red: { text: 'text-neon-red', bg: 'bg-neon-red/10' },
  };
  const a = colors[accent];
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

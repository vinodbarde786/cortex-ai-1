import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Loader2, Zap, Activity, Server, TrendingDown, Gauge } from 'lucide-react';
import { supabase, type RiskSettings } from '@/lib/supabase';
import { apiHealthLogs } from '@/data/adminMockData';

const healthConfig = {
  healthy: { color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20', dot: 'bg-neon-green' },
  degraded: { color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/20', dot: 'bg-neon-amber' },
  down: { color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/20', dot: 'bg-neon-red' },
};

export default function AdminRiskControl() {
  const [settings, setSettings] = useState<RiskSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.from('risk_settings').select('*').limit(1).maybeSingle().then(({ data }) => {
      if (!mounted) return;
      setSettings(data as RiskSettings | null);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const update = async (field: keyof RiskSettings, value: boolean | number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setSaving(true);
    await supabase.from('risk_settings').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', settings.id);
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-neon-cyan animate-spin" /></div>;
  }

  const killActive = settings?.global_kill_switch ?? false;

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-neon-red" /> Risk Control
        </h2>
        <p className="text-sm text-slate-400">Global Kill Switch, API health alerts, and risk parameter management</p>
      </div>

      {/* Global Kill Switch - prominent */}
      <div className={`glass-card p-6 relative overflow-hidden border-2 ${killActive ? 'border-neon-red/50 neon-glow-red' : 'border-neon-amber/20'}`}>
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-neon-red/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${killActive ? 'bg-neon-red/20 border border-neon-red/50' : 'bg-neon-amber/10 border border-neon-amber/30'}`}>
              <ShieldCheck className={`w-7 h-7 ${killActive ? 'text-neon-red animate-pulse' : 'text-neon-amber'}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Global Kill Switch</h3>
              <p className="text-sm text-slate-400">
                {killActive
                  ? 'ACTIVE — All bots stopped, all trading halted platform-wide.'
                  : 'Inactive — Normal trading operations across all exchanges.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => update('global_kill_switch', !killActive)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
              killActive
                ? 'bg-neon-green/15 text-neon-green border border-neon-green/40 hover:neon-glow-green'
                : 'bg-neon-red/20 text-neon-red border border-neon-red/50 hover:bg-neon-red/30 neon-glow-red'
            }`}
          >
            {killActive ? 'Resume Trading' : 'Activate Kill Switch'}
          </button>
        </div>
      </div>

      {/* Risk Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-neon-amber" />
            <h3 className="text-sm font-bold text-white">Max Leverage</h3>
          </div>
          <p className="text-2xl font-bold text-neon-amber font-mono mb-2">{settings?.max_leverage ?? 100}x</p>
          <input
            type="range" min="1" max="100" value={settings?.max_leverage ?? 100}
            onChange={e => update('max_leverage', Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer slider-neon"
            style={{ background: `linear-gradient(to right, #00ff9d 0%, #00e5ff ${settings?.max_leverage ?? 100}%, #1a1f33 ${settings?.max_leverage ?? 100}%)` }}
          />
          <p className="text-[10px] text-slate-500 mt-1.5">Global cap applied to all clients</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-neon-red" />
            <h3 className="text-sm font-bold text-white">Max Daily Loss</h3>
          </div>
          <p className="text-2xl font-bold text-neon-red font-mono mb-2">{settings?.max_daily_loss_pct ?? 10}%</p>
          <input
            type="range" min="1" max="50" value={settings?.max_daily_loss_pct ?? 10}
            onChange={e => update('max_daily_loss_pct', Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer slider-neon"
            style={{ background: `linear-gradient(to right, #ff3b5c 0%, #ffb020 ${(settings?.max_daily_loss_pct ?? 10) * 2}%, #1a1f33 ${(settings?.max_daily_loss_pct ?? 10) * 2}%)` }}
          />
          <p className="text-[10px] text-slate-500 mt-1.5">Auto-disable bots at this loss threshold</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-neon-green" />
            <h3 className="text-sm font-bold text-white">Auto-Disable on Breach</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{settings?.auto_disable_on_breach ? 'Enabled' : 'Disabled'}</p>
          <button
            onClick={() => update('auto_disable_on_breach', !(settings?.auto_disable_on_breach ?? true))}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${settings?.auto_disable_on_breach ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' : 'glass text-slate-400'}`}
          >
            {settings?.auto_disable_on_breach ? 'Currently Active' : 'Currently Inactive'}
          </button>
        </div>
      </div>

      {/* API Health Monitoring */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-neon-cyan" /> API Health Monitoring
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => update('api_health_alerts', !(settings?.api_health_alerts ?? true))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${settings?.api_health_alerts ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'glass text-slate-400'}`}
            >
              Alerts {settings?.api_health_alerts ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {apiHealthLogs.map(h => {
            const hc = healthConfig[h.status];
            return (
              <div key={h.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full ${hc.dot} flex-shrink-0 ${h.status === 'healthy' ? 'animate-pulse' : ''}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-white">{h.exchange}</span>
                    <span className="text-xs text-slate-500 font-mono">{h.endpoint}</span>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-mono text-slate-400">{h.latency}ms</p>
                  <p className="text-[10px] text-slate-500">{h.uptime}% uptime</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${hc.bg} ${hc.color} ${hc.border} capitalize`}>{h.status}</span>
                <span className="text-[10px] text-slate-600 hidden md:block">{h.lastCheck}</span>
              </div>
            );
          })}
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl glass-strong neon-glow-cyan animate-slide-up">
          <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
          <span className="text-xs text-slate-300">Saving...</span>
        </div>
      )}
    </div>
  );
}

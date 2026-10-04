import { useEffect, useState } from 'react';
import { Bot, Rocket, Copy, Trash2, Plus, Loader2, Zap, Layers, TrendingUp, Crosshair, Users } from 'lucide-react';
import { supabase, type BotTemplate } from '@/lib/supabase';

const strategyIcons: Record<string, typeof Zap> = {
  scalping: Zap,
  grid: Layers,
  trailing: TrendingUp,
  dca: TrendingUp,
};

const riskColors = {
  Low: 'text-neon-green bg-neon-green/10 border-neon-green/20',
  Medium: 'text-neon-amber bg-neon-amber/10 border-neon-amber/20',
  High: 'text-neon-red bg-neon-red/10 border-neon-red/20',
};

export default function AdminBots() {
  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [strategyType, setStrategyType] = useState<'scalping' | 'grid' | 'trailing' | 'dca'>('scalping');
  const [marketType, setMarketType] = useState<'spot' | 'futures'>('spot');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tp, setTp] = useState(5);
  const [sl, setSl] = useState(2);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.from('bot_templates').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (!mounted) return;
      setTemplates((data as BotTemplate[]) ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { data } = await supabase.from('bot_templates').insert({
      name,
      description: `${strategyType.charAt(0).toUpperCase() + strategyType.slice(1)} strategy for ${marketType} markets`,
      strategy_type: strategyType,
      market_type: marketType,
      default_tp_pct: tp,
      default_sl_pct: sl,
      risk_level: riskLevel,
      is_public: true,
      total_copies: 0,
    }).select('*');
    if (data) setTemplates(prev => [data[0] as BotTemplate, ...prev]);
    setSaving(false);
    setShowCreate(false);
    setName('');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('bot_templates').delete().eq('id', id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-neon-cyan animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-neon-cyan" /> AI Smart Bots
          </h2>
          <p className="text-sm text-slate-400">Bot factory, strategy templates, rules, and copy trading</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:neon-glow-cyan text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map((t) => {
          const Icon = strategyIcons[t.strategy_type] || Zap;
          return (
            <div key={t.id} className="glass-card p-5 relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-cyan/5 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-neon-cyan" />
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[9px] font-bold border ${riskColors[t.risk_level]}`}>{t.risk_level} Risk</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{t.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{t.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="py-2 rounded-lg bg-white/[0.03] text-center">
                    <p className="text-[9px] text-slate-500 uppercase">TP / SL</p>
                    <p className="text-xs font-bold text-slate-200">{t.default_tp_pct}% / {t.default_sl_pct}%</p>
                  </div>
                  <div className="py-2 rounded-lg bg-white/[0.03] text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Market</p>
                    <p className="text-xs font-bold text-slate-200 capitalize">{t.market_type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-md bg-white/[0.04] text-[10px] text-slate-400 capitalize">{t.strategy_type}</span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-neon-green/5 text-[10px] text-neon-green">
                    <Users className="w-3 h-3" /> {t.total_copies} copies
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-neon-green/10 text-neon-green border border-neon-green/20 hover:bg-neon-green/20 transition-all">
                    <Copy className="w-3.5 h-3.5" /> Copy Trade
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold bg-neon-red/10 text-neon-red border border-neon-red/20 hover:bg-neon-red/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-base-900/80 backdrop-blur-md" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg animate-scale-in">
            <div className="glass-strong neon-glow-cyan p-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-neon-cyan" /> Create Bot Template
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Template Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. ETH Momentum Hunter"
                    className="w-full px-4 py-2.5 rounded-xl glass text-sm text-white focus:outline-none focus:border-neon-cyan/40 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block font-semibold">Strategy Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['scalping', 'grid', 'trailing', 'dca'] as const).map(s => (
                      <button key={s} onClick={() => setStrategyType(s)}
                        className={`px-2 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${strategyType === s ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40' : 'glass text-slate-400'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block font-semibold">Market</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['spot', 'futures'] as const).map(m => (
                        <button key={m} onClick={() => setMarketType(m)}
                          className={`px-2 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${marketType === m ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40' : 'glass text-slate-400'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block font-semibold">Risk Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Low', 'Medium', 'High'] as const).map(r => (
                        <button key={r} onClick={() => setRiskLevel(r)}
                          className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all ${riskLevel === r ? 'bg-neon-amber/15 text-neon-amber border border-neon-amber/40' : 'glass text-slate-400'}`}>{r}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Default TP %</label>
                    <input type="number" value={tp} onChange={e => setTp(Number(e.target.value))} step="0.5"
                      className="w-full px-4 py-2.5 rounded-xl glass text-sm text-white font-mono focus:outline-none focus:border-neon-green/40" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Default SL %</label>
                    <input type="number" value={sl} onChange={e => setSl(Number(e.target.value))} step="0.5"
                      className="w-full px-4 py-2.5 rounded-xl glass text-sm text-white font-mono focus:outline-none focus:border-neon-red/40" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-xl glass hover:bg-white/[0.07] text-sm text-slate-300 transition-all">Cancel</button>
                  <button onClick={handleCreate} disabled={!name.trim() || saving}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${name.trim() && !saving ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 hover:neon-glow-cyan' : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] cursor-not-allowed'}`}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

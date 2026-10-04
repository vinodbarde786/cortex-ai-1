import { useEffect, useState } from 'react';
import {
  KeyRound, Loader2, Plus, Check, Zap, Users, TrendingUp,
  Calendar, Copy, Sparkles, Crown, Rocket, X, Clock,
} from 'lucide-react';
import { supabase, type License } from '@/lib/supabase';
import { adminLicensePlans, type AdminLicense } from '@/data/adminMockData';
import { useAdminCurrency } from '@/context/AdminCurrencyContext';

const planColors = {
  green: { text: 'text-neon-green', border: 'border-neon-green/30', bg: 'bg-neon-green/10', glow: 'neon-glow-green' },
  cyan: { text: 'text-neon-cyan', border: 'border-neon-cyan/30', bg: 'bg-neon-cyan/10', glow: 'neon-glow-cyan' },
  amber: { text: 'text-neon-amber', border: 'border-neon-amber/30', bg: 'bg-neon-amber/10', glow: '' },
};

const tierConfig = [
  { id: 'Basic', label: 'Basic', icon: Zap, color: 'cyan', price: 29, botLimit: 2, maxLev: 20 },
  { id: 'Pro', label: 'Pro', icon: Rocket, color: 'green', price: 99, botLimit: 8, maxLev: 50 },
  { id: 'Premium', label: 'Premium', icon: Crown, color: 'amber', price: 499, botLimit: 25, maxLev: 100 },
] as const;

const durationOptions = [
  { id: 1, label: '1 Month', months: 1 },
  { id: 2, label: '2 Months', months: 2 },
  { id: 3, label: '3 Months', months: 3 },
  { id: 6, label: '6 Months', months: 6 },
  { id: 12, label: '1 Year', months: 12 },
];

function randomKey(tier: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let seg = '';
  for (let i = 0; i < 4; i++) seg += chars[Math.floor(Math.random() * chars.length)];
  return `CORTEX-${tier.toUpperCase()}-${seg}`;
}

export default function AdminLicenses() {
  const { formatCurrency, symbol } = useAdminCurrency();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);

  // Generate modal state
  const [selectedTier, setSelectedTier] = useState<string>('Pro');
  const [selectedDuration, setSelectedDuration] = useState<number>(3);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchLicenses = async () => {
    const { data } = await supabase.from('licenses').select('*').order('created_at', { ascending: false });
    setLicenses((data as License[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    setLicenses(prev => prev.map(l => l.id === id ? { ...l, is_active: !current } : l));
    await supabase.from('licenses').update({ is_active: !current }).eq('id', id);
  };

  const handleGenerateKey = () => {
    setCopied(false);
    setGeneratedKey(randomKey(selectedTier));
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveLicense = async () => {
    if (!generatedKey) return;
    setSaving(true);
    const tier = tierConfig.find(t => t.id === selectedTier)!;
    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setMonth(validUntil.getMonth() + selectedDuration);

    const { data } = await supabase.from('licenses').insert({
      plan_name: selectedTier,
      bot_limit: tier.botLimit,
      is_active: true,
      valid_from: now.toISOString(),
      valid_until: validUntil.toISOString(),
      monthly_fee: tier.price,
      license_key: generatedKey,
    }).select('*');

    if (data) {
      setLicenses(prev => [data[0] as License, ...prev]);
    }

    setSaving(false);
    setShowGenerate(false);
    setGeneratedKey(null);
    setCopied(false);
  };

  const openGenerate = () => {
    setSelectedTier('Pro');
    setSelectedDuration(3);
    setGeneratedKey(null);
    setCopied(false);
    setShowGenerate(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-neon-cyan animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-neon-cyan" /> Licenses
          </h2>
          <p className="text-sm text-slate-400">Subscription plans, license generation, and validity tracking</p>
        </div>
        <button
          onClick={openGenerate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:neon-glow-cyan text-sm font-semibold transition-all"
        >
          <Plus className="w-4 h-4" /> Generate New License
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {adminLicensePlans.map((plan: AdminLicense) => {
          const a = planColors[plan.color];
          return (
            <div key={plan.id} className={`glass-card p-6 relative overflow-hidden ${a.border}`}>
              <div className={`absolute -top-12 -right-12 w-32 h-32 ${a.bg} rounded-full blur-3xl opacity-40`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${a.text}`}>{plan.planName}</h3>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${a.bg} ${a.text} ${a.border} border`}>
                    {plan.activeUsers} active
                  </span>
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {symbol}{plan.price}<span className="text-sm text-slate-500 font-normal">/mo</span>
                </p>
                <div className="flex items-center gap-4 mt-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Zap className={`w-4 h-4 ${a.text}`} />
                    <span className="text-sm text-slate-300">{plan.botLimit} bots</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className={`w-4 h-4 ${a.text}`} />
                    <span className="text-sm text-slate-300">{plan.maxLeverage}x max</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className={`w-3.5 h-3.5 ${a.text} flex-shrink-0`} /> {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active licenses table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Active Client Licenses</h3>
          <span className="text-xs text-slate-500">{licenses.length} records</span>
        </div>
        {licenses.length === 0 ? (
          <div className="p-12 text-center">
            <KeyRound className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No licenses assigned yet</p>
            <p className="text-xs text-slate-500 mt-1">Generate a license key or assign plans to clients.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="text-left py-3 px-4 font-semibold">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold">License Key</th>
                  <th className="text-right py-3 px-4 font-semibold">Bot Limit</th>
                  <th className="text-right py-3 px-4 font-semibold hidden sm:table-cell">Monthly Fee</th>
                  <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Valid Until</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Toggle</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map(l => (
                  <tr key={l.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{l.plan_name}</td>
                    <td className="py-3 px-4">
                      {l.license_key ? (
                        <span className="font-mono text-xs text-neon-cyan bg-neon-cyan/5 px-2 py-1 rounded-md border border-neon-cyan/15">
                          {l.license_key}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No key</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{l.bot_limit}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200 hidden sm:table-cell">{formatCurrency(Number(l.monthly_fee))}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 hidden md:table-cell">
                      {l.valid_until ? new Date(l.valid_until).toLocaleDateString() : 'Unlimited'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${l.is_active ? 'text-neon-green bg-neon-green/10 border-neon-green/20' : 'text-slate-500 bg-white/[0.03] border-white/[0.06]'}`}>
                        {l.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleActive(l.id, l.is_active)} className="text-slate-400 hover:text-white transition-colors">
                        {l.is_active ? <Check className="w-5 h-5 text-neon-green" /> : <Plus className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate License Modal */}
      {showGenerate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="absolute inset-0 bg-base-900/85 backdrop-blur-md" onClick={() => setShowGenerate(false)} />
          <div className="relative w-full max-w-xl animate-scale-in">
            <div className="glass-strong neon-glow-cyan max-h-[92vh] overflow-y-auto scrollbar-thin rounded-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-base-800/90 backdrop-blur-xl border-b border-white/[0.06] px-5 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Generate New License</h2>
                    <p className="text-[11px] text-slate-500">Create a unique license key for a subscription plan</p>
                  </div>
                </div>
                <button onClick={() => setShowGenerate(false)} className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-5 sm:px-6 py-5 space-y-5">
                {/* Plan Tier Selection */}
                <div>
                  <label className="text-xs text-slate-400 mb-3 block font-semibold">Plan Tier</label>
                  <div className="grid grid-cols-3 gap-3">
                    {tierConfig.map(tier => {
                      const isSelected = selectedTier === tier.id;
                      const TIcon = tier.icon;
                      const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
                        cyan: { text: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/40', glow: 'hover:neon-glow-cyan' },
                        green: { text: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/40', glow: 'hover:neon-glow-green' },
                        amber: { text: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/40', glow: 'hover:neon-glow-amber' },
                      };
                      const a = colorMap[tier.color];
                      return (
                        <button
                          key={tier.id}
                          onClick={() => { setSelectedTier(tier.id); setGeneratedKey(null); }}
                          className={`relative p-4 rounded-xl border text-center transition-all overflow-hidden ${
                            isSelected ? `${a.bg} ${a.border} ${a.glow}` : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                          }`}
                        >
                          {isSelected && <div className={`absolute -top-8 -right-8 w-20 h-20 ${a.bg} rounded-full blur-2xl opacity-60`} />}
                          <div className="relative">
                            <div className={`w-10 h-10 rounded-lg ${isSelected ? a.bg : 'bg-white/[0.05]'} flex items-center justify-center mx-auto mb-2`}>
                              <TIcon className={`w-5 h-5 ${isSelected ? a.text : 'text-slate-400'}`} />
                            </div>
                            <p className={`text-sm font-bold ${isSelected ? a.text : 'text-slate-300'}`}>{tier.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{symbol}{tier.price}/mo</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">{tier.botLimit} bots · {tier.maxLev}x</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="text-xs text-slate-400 mb-3 block font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Duration
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {durationOptions.map(d => (
                      <button
                        key={d.id}
                        onClick={() => { setSelectedDuration(d.months); setGeneratedKey(null); }}
                        className={`px-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          selectedDuration === d.months
                            ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40'
                            : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  {/* Price preview */}
                  <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total cost for {selectedDuration} month{selectedDuration > 1 ? 's' : ''}</span>
                    {(() => {
                      const tier = tierConfig.find(t => t.id === selectedTier)!;
                      return (
                        <span className="text-sm font-mono font-bold text-neon-cyan">
                          {symbol}{(tier.price * selectedDuration).toLocaleString()}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* License Key Generation */}
                <div>
                  <label className="text-xs text-slate-400 mb-3 block font-semibold">License Key</label>
                  {generatedKey ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
                        <KeyRound className="w-5 h-5 text-neon-cyan flex-shrink-0" />
                        <span className="flex-1 font-mono text-sm font-bold text-neon-cyan tracking-wider">{generatedKey}</span>
                        <button
                          onClick={handleCopy}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            copied ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : 'bg-white/[0.05] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08]'
                          }`}
                        >
                          {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                      </div>
                      <button
                        onClick={handleGenerateKey}
                        className="text-xs text-slate-400 hover:text-neon-cyan font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Generate a different key
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateKey}
                      className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] border-dashed text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/30 hover:bg-neon-cyan/5 transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                    >
                      <Sparkles className="w-4 h-4" /> Click to generate unique key
                    </button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-base-800/90 backdrop-blur-xl border-t border-white/[0.06] px-5 sm:px-6 py-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowGenerate(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] text-sm text-slate-300 border border-white/[0.06] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLicense}
                  disabled={!generatedKey || saving}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    generatedKey && !saving
                      ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 hover:neon-glow-cyan'
                      : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] cursor-not-allowed'
                  }`}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Activate License
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

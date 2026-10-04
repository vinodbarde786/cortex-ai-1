import { useEffect, useState } from 'react';
import { KeyRound, Loader2, Plus, Check, Zap, Users, TrendingUp, Calendar } from 'lucide-react';
import { supabase, type License } from '@/lib/supabase';
import { adminLicensePlans, type AdminLicense } from '@/data/adminMockData';
import { useAdminCurrency } from '@/context/AdminCurrencyContext';

const planColors = {
  green: { text: 'text-neon-green', border: 'border-neon-green/30', bg: 'bg-neon-green/10', glow: 'neon-glow-green' },
  cyan: { text: 'text-neon-cyan', border: 'border-neon-cyan/30', bg: 'bg-neon-cyan/10', glow: 'neon-glow-cyan' },
  amber: { text: 'text-neon-amber', border: 'border-neon-amber/30', bg: 'bg-neon-amber/10', glow: '' },
};

export default function AdminLicenses() {
  const { formatCurrency, symbol } = useAdminCurrency();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.from('licenses').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (!mounted) return;
      setLicenses((data as License[]) ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    setLicenses(prev => prev.map(l => l.id === id ? { ...l, is_active: !current } : l));
    await supabase.from('licenses').update({ is_active: !current }).eq('id', id);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-neon-cyan animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-neon-cyan" /> Licenses
        </h2>
        <p className="text-sm text-slate-400">Subscription plans, bot limits, and validity tracking</p>
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
            <p className="text-xs text-slate-500 mt-1">Assign subscription plans to clients from the Clients page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="text-left py-3 px-4 font-semibold">Plan</th>
                  <th className="text-right py-3 px-4 font-semibold">Bot Limit</th>
                  <th className="text-right py-3 px-4 font-semibold">Monthly Fee</th>
                  <th className="text-left py-3 px-4 font-semibold hidden sm:table-cell">Valid From</th>
                  <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Valid Until</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Toggle</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map(l => (
                  <tr key={l.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{l.plan_name}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{l.bot_limit}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">{formatCurrency(Number(l.monthly_fee))}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 hidden sm:table-cell">
                      {new Date(l.valid_from).toLocaleDateString()}
                    </td>
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
    </div>
  );
}

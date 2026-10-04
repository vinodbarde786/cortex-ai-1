import { useState } from 'react';
import {
  Users, Search, TrendingUp, TrendingDown,
  DollarSign, Bot, Pencil, Trash2, LogIn, X, Check, Zap, Shield,
  Calendar, ChevronDown, ChevronUp, Crown, Sparkles, AlertTriangle, UserCog,
  KeyRound, ToggleRight,
} from 'lucide-react';
import {
  adminClients, type AdminClient,
  allStrategies, allIndicators, licenseCycleConfig, type LicenseCycle,
} from '@/data/adminMockData';
import { useAdminCurrency } from '@/context/AdminCurrencyContext';

const statusConfig = {
  active: 'text-neon-green bg-neon-green/10 border-neon-green/20',
  suspended: 'text-neon-amber bg-neon-amber/10 border-neon-amber/20',
  banned: 'text-neon-red bg-neon-red/10 border-neon-red/20',
};

const planConfig: Record<string, { color: string; icon: typeof Crown }> = {
  Enterprise: { color: 'text-neon-amber', icon: Crown },
  Pro: { color: 'text-neon-green', icon: Sparkles },
  Starter: { color: 'text-neon-cyan', icon: Zap },
};

type ModalMode = 'edit' | 'license' | 'impersonate' | 'remove' | null;

export default function AdminClients() {
  const { formatCurrency } = useAdminCurrency();
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<AdminClient[]>(adminClients);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<AdminClient | null>(null);
  const [sortField, setSortField] = useState<'totalFunds' | 'unrealizedPnl' | 'activeBots' | 'licenseValidUntil'>('totalFunds');
  const [sortAsc, setSortAsc] = useState(false);

  // License editor state
  const [editCycle, setEditCycle] = useState<LicenseCycle>('monthly');
  const [editBotLimit, setEditBotLimit] = useState(1);
  const [editStrategies, setEditStrategies] = useState<string[]>([]);
  const [editIndicators, setEditIndicators] = useState<string[]>([]);
  const [editValidUntil, setEditValidUntil] = useState('');

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const filtered = [...clients]
    .filter(c =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.plan.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortField === 'licenseValidUntil') {
        return (new Date(a.licenseValidUntil).getTime() - new Date(b.licenseValidUntil).getTime()) * dir;
      }
      return (a[sortField] - b[sortField]) * dir;
    });

  const openEdit = (client: AdminClient) => {
    setSelected(client);
    setModalMode('edit');
  };

  const openLicense = (client: AdminClient) => {
    setSelected(client);
    setEditCycle(client.licenseCycle);
    setEditBotLimit(client.botLimit);
    setEditStrategies([...client.unlockedStrategies]);
    setEditIndicators([...client.unlockedIndicators]);
    setEditValidUntil(client.licenseValidUntil);
    setModalMode('license');
  };

  const openImpersonate = (client: AdminClient) => {
    setSelected(client);
    setModalMode('impersonate');
  };

  const openRemove = (client: AdminClient) => {
    setSelected(client);
    setModalMode('remove');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelected(null);
  };

  const saveLicense = () => {
    if (!selected) return;
    setClients(prev => prev.map(c => c.id === selected.id ? {
      ...c,
      licenseCycle: editCycle,
      botLimit: editBotLimit,
      unlockedStrategies: editStrategies,
      unlockedIndicators: editIndicators,
      licenseValidUntil: editValidUntil || c.licenseValidUntil,
    } : c));
    closeModal();
  };

  const removeClient = () => {
    if (!selected) return;
    setClients(prev => prev.filter(c => c.id !== selected.id));
    closeModal();
  };

  const toggleStrategy = (s: string) => {
    setEditStrategies(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const toggleIndicator = (ind: string) => {
    setEditIndicators(prev => prev.includes(ind) ? prev.filter(x => x !== ind) : [...prev, ind]);
  };

  const licenseExpired = (date: string) => new Date(date) < new Date();
  const daysUntilExpiry = (date: string) => Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Section 1: Client Database */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-neon-cyan" />
          <h2 className="text-xl font-bold text-white">Client Management</h2>
        </div>
        <p className="text-sm text-slate-400">Full client database — funds, PnL, running trades, license validity, and impersonation access</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat label="Total Clients" value={clients.length.toString()} icon={Users} color="text-neon-cyan" />
        <MiniStat label="Active" value={clients.filter(c => c.status === 'active').length.toString()} icon={Check} color="text-neon-green" />
        <MiniStat label="Suspended" value={clients.filter(c => c.status === 'suspended').length.toString()} icon={AlertTriangle} color="text-neon-amber" />
        <MiniStat label="Banned" value={clients.filter(c => c.status === 'banned').length.toString()} icon={Shield} color="text-neon-red" />
      </div>

      {/* Search + sort */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, plan, or country..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-white focus:outline-none focus:border-neon-cyan/40 transition-colors" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-2 rounded-xl glass whitespace-nowrap">
          <span>Sort:</span>
          <span className="text-neon-cyan font-semibold capitalize">{sortField.replace(/([A-Z])/g, ' $1').trim()}</span>
          <button onClick={() => toggleSort(sortField)} className="text-slate-400 hover:text-white">
            {sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Client Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-slate-500">
                <th className="text-left py-3 px-4 font-semibold">Client Name</th>
                <th className="text-right py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-300" onClick={() => toggleSort('totalFunds')}>
                  <span className="inline-flex items-center gap-1">Total Funds (USDT) {sortField === 'totalFunds' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                </th>
                <th className="text-right py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-300" onClick={() => toggleSort('unrealizedPnl')}>
                  <span className="inline-flex items-center gap-1">Current PnL {sortField === 'unrealizedPnl' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                </th>
                <th className="text-center py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-300" onClick={() => toggleSort('activeBots')}>
                  <span className="inline-flex items-center gap-1">Active Trades {sortField === 'activeBots' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                </th>
                <th className="text-center py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-300" onClick={() => toggleSort('licenseValidUntil')}>
                  <span className="inline-flex items-center gap-1">License Validity {sortField === 'licenseValidUntil' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</span>
                </th>
                <th className="text-center py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const expired = licenseExpired(c.licenseValidUntil);
                const days = daysUntilExpiry(c.licenseValidUntil);
                const PlanIcon = planConfig[c.plan]?.icon ?? Zap;
                return (
                  <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                    {/* Client Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0">
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{c.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-slate-500 truncate">{c.email}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <PlanIcon className={`w-3 h-3 ${planConfig[c.plan]?.color ?? 'text-slate-400'}`} />
                            <span className={`text-[10px] font-semibold ${planConfig[c.plan]?.color ?? 'text-slate-400'}`}>{c.plan}</span>
                            <span className="text-slate-700">·</span>
                            <span className="text-[10px] text-slate-600">{c.country}</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold border ${statusConfig[c.status]} capitalize`}>{c.status}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Total Funds */}
                    <td className="py-3.5 px-4 text-right font-mono text-slate-200 text-sm">{formatCurrency(c.totalFunds)}</td>
                    {/* Current PnL */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-mono font-semibold text-sm ${c.unrealizedPnl >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                        <span className="inline-flex items-center gap-1 justify-end">
                          {c.unrealizedPnl >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {c.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(c.unrealizedPnl)}
                        </span>
                      </span>
                    </td>
                    {/* Active Trades */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono font-semibold ${c.activeBots > 0 ? 'text-neon-cyan' : 'text-slate-600'}`}>
                        {c.activeBots}
                      </span>
                      <span className="text-[10px] text-slate-600 ml-1">/ {c.botLimit}</span>
                    </td>
                    {/* License Validity */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-xs font-mono ${expired ? 'text-neon-red' : days <= 30 ? 'text-neon-amber' : 'text-slate-300'}`}>
                          {new Date(c.licenseValidUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${licenseCycleConfig[c.licenseCycle].badge} mt-0.5`}>
                          {licenseCycleConfig[c.licenseCycle].label}
                        </span>
                        {expired && <span className="text-[8px] text-neon-red font-bold mt-0.5">EXPIRED</span>}
                        {!expired && days <= 30 && <span className="text-[8px] text-neon-amber font-bold mt-0.5">{days}d left</span>}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <ActionButton icon={Pencil} label="Edit Client" color="text-neon-cyan hover:bg-neon-cyan/10" onClick={() => openEdit(c)} />
                        <ActionButton icon={KeyRound} label="License" color="text-neon-amber hover:bg-neon-amber/10" onClick={() => openLicense(c)} />
                        <ActionButton icon={Trash2} label="Remove" color="text-neon-red hover:bg-neon-red/10" onClick={() => openRemove(c)} />
                        <ActionButton icon={LogIn} label="Access Panel" color="text-neon-green hover:bg-neon-green/10" onClick={() => openImpersonate(c)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Section 2: License & Subscription Manager ===== */}
      <div className="pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 mb-1">
          <KeyRound className="w-5 h-5 text-neon-amber" />
          <h2 className="text-xl font-bold text-white">License & Subscription Manager</h2>
        </div>
        <p className="text-sm text-slate-400">Assign subscription cycles, bot limits, and unlock premium strategies & indicators per client</p>
      </div>

      {/* Plan tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { tier: 'Starter', botLimit: 2, color: 'text-neon-cyan', border: 'border-neon-cyan/30', bg: 'bg-neon-cyan/10', strategies: 2, indicators: 2 },
          { tier: 'Pro', botLimit: 8, color: 'text-neon-green', border: 'border-neon-green/30', bg: 'bg-neon-green/10', strategies: 5, indicators: 4 },
          { tier: 'Enterprise', botLimit: 25, color: 'text-neon-amber', border: 'border-neon-amber/30', bg: 'bg-neon-amber/10', strategies: 7, indicators: 8 },
        ].map(plan => (
          <div key={plan.tier} className={`glass-card p-5 relative overflow-hidden ${plan.border}`}>
            <div className={`absolute -top-10 -right-10 w-28 h-28 ${plan.bg} rounded-full blur-3xl opacity-40`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-base font-bold ${plan.color}`}>{plan.tier}</h3>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${plan.bg} ${plan.color}`}>
                  {clients.filter(c => c.plan === plan.tier).length} users
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> Bot Limit</span>
                  <span className={`font-mono font-bold ${plan.color}`}>{plan.botLimit}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Strategies</span>
                  <span className={`font-mono font-bold ${plan.color}`}>{plan.strategies} unlocked</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Indicators</span>
                  <span className={`font-mono font-bold ${plan.color}`}>{plan.indicators} unlocked</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== MODALS ===== */}

      {/* Edit Client Modal */}
      {modalMode === 'edit' && selected && (
        <ModalShell onClose={closeModal} title="Edit Client" icon={UserCog} accent="cyan">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-xs font-bold text-slate-300">
                {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selected.name}</p>
                <p className="text-[10px] text-slate-500">{selected.email}</p>
              </div>
            </div>
            <Field label="Client Name">
              <input defaultValue={selected.name} className="modal-input" />
            </Field>
            <Field label="Email">
              <input defaultValue={selected.email} className="modal-input" />
            </Field>
            <Field label="Country">
              <input defaultValue={selected.country} className="modal-input" />
            </Field>
            <Field label="Status">
              <select defaultValue={selected.status} className="modal-input">
                <option value="active" className="bg-base-850">Active</option>
                <option value="suspended" className="bg-base-850">Suspended</option>
                <option value="banned" className="bg-base-850">Banned</option>
              </select>
            </Field>
            <Field label="Manual Trading">
              <div className="flex items-center gap-2">
                <ToggleRight className="w-7 h-7 text-neon-green" />
                <span className="text-sm text-slate-300">{selected.manualTrading ? 'Enabled' : 'Disabled'}</span>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <InfoBox label="Total Funds" value={formatCurrency(selected.totalFunds)} icon={DollarSign} color="text-neon-cyan" />
              <InfoBox label="Active Bots" value={`${selected.activeBots}/${selected.botLimit}`} icon={Bot} color="text-neon-amber" />
            </div>
            <ModalButtons onCancel={closeModal} onConfirm={closeModal} confirmLabel="Save Changes" confirmAccent="cyan" />
          </div>
        </ModalShell>
      )}

      {/* License Manager Modal */}
      {modalMode === 'license' && selected && (
        <ModalShell onClose={closeModal} title="License & Subscription Manager" icon={KeyRound} accent="amber" wide>
          <div className="space-y-5">
            {/* Client header */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-amber/5 border border-neon-amber/15">
              <div className="w-10 h-10 rounded-xl bg-neon-amber/10 border border-neon-amber/20 flex items-center justify-center text-xs font-bold text-neon-amber">
                {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{selected.name}</p>
                <p className="text-[10px] text-slate-500">{selected.email} · {selected.plan}</p>
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${statusConfig[selected.status]} capitalize`}>{selected.status}</span>
            </div>

            {/* Subscription Cycle */}
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">Subscription Cycle</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(licenseCycleConfig) as LicenseCycle[]).map(cycle => (
                  <button
                    key={cycle}
                    onClick={() => setEditCycle(cycle)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      editCycle === cycle
                        ? `${licenseCycleConfig[cycle].badge} border border-current`
                        : 'glass text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    {licenseCycleConfig[cycle].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bot Limit */}
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">
                Bot Limit: <span className="text-neon-amber">{editBotLimit}</span> bots max
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditBotLimit(Math.max(1, editBotLimit - 1))} className="w-9 h-9 rounded-xl glass hover:bg-white/[0.08] text-slate-300 flex items-center justify-center transition-all active:scale-90">
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="flex-1 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-lg font-bold text-neon-amber font-mono">{editBotLimit}</span>
                </div>
                <button onClick={() => setEditBotLimit(Math.min(50, editBotLimit + 1))} className="w-9 h-9 rounded-xl glass hover:bg-white/[0.08] text-slate-300 flex items-center justify-center transition-all active:scale-90">
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              {/* Quick presets */}
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 5, 8, 10, 15, 25].map(n => (
                  <button
                    key={n}
                    onClick={() => setEditBotLimit(n)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      editBotLimit === n ? 'bg-neon-amber/20 text-neon-amber border border-neon-amber/30' : 'glass text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Valid Until */}
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">License Valid Until</label>
              <input
                type="date"
                value={editValidUntil}
                onChange={e => setEditValidUntil(e.target.value)}
                className="modal-input"
              />
            </div>

            {/* Premium Strategies */}
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-neon-green" /> Premium Strategies ({editStrategies.length}/{allStrategies.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {allStrategies.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleStrategy(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      editStrategies.includes(s)
                        ? 'bg-neon-green/15 text-neon-green border border-neon-green/30'
                        : 'glass text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    {editStrategies.includes(s) && <Check className="w-3 h-3 inline mr-1" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Indicators */}
            <div>
              <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-neon-cyan" /> Premium Indicators ({editIndicators.length}/{allIndicators.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {allIndicators.map(ind => (
                  <button
                    key={ind}
                    onClick={() => toggleIndicator(ind)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      editIndicators.includes(ind)
                        ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30'
                        : 'glass text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    {editIndicators.includes(ind) && <Check className="w-3 h-3 inline mr-1" />}
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <ModalButtons onCancel={closeModal} onConfirm={saveLicense} confirmLabel="Save License" confirmAccent="amber" />
          </div>
        </ModalShell>
      )}

      {/* Impersonate Modal */}
      {modalMode === 'impersonate' && selected && (
        <ModalShell onClose={closeModal} title="Access Client Panel" icon={LogIn} accent="green">
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4 rounded-xl bg-neon-amber/5 border border-neon-amber/20">
              <div className="flex items-center gap-2 text-neon-amber">
                <Shield className="w-5 h-5" />
                <span className="text-xs font-bold">ADMIN IMPERSONATION MODE</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 text-center">
              You are about to log in as <span className="font-bold text-white">{selected.name}</span> and access their full trading panel.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <InfoBox label="Current Funds" value={formatCurrency(selected.totalFunds)} icon={DollarSign} color="text-neon-cyan" />
              <InfoBox label="Active Bots" value={`${selected.activeBots}/${selected.botLimit}`} icon={Bot} color="text-neon-amber" />
              <InfoBox label="Unrealized PnL" value={`${selected.unrealizedPnl >= 0 ? '+' : ''}${formatCurrency(selected.unrealizedPnl)}`} icon={selected.unrealizedPnl >= 0 ? TrendingUp : TrendingDown} color={selected.unrealizedPnl >= 0 ? 'text-neon-green' : 'text-neon-red'} />
              <InfoBox label="License" value={licenseCycleConfig[selected.licenseCycle].label} icon={Calendar} color="text-neon-amber" />
            </div>
            <p className="text-[10px] text-slate-500 text-center">All actions taken during impersonation are logged with your admin ID for audit purposes.</p>
            <ModalButtons
              onCancel={closeModal}
              onConfirm={closeModal}
              confirmLabel="Access Panel"
              confirmAccent="green"
            />
          </div>
        </ModalShell>
      )}

      {/* Remove Client Modal */}
      {modalMode === 'remove' && selected && (
        <ModalShell onClose={closeModal} title="Remove Client" icon={Trash2} accent="red">
          <div className="space-y-4">
            <div className="flex items-center justify-center p-4 rounded-xl bg-neon-red/5 border border-neon-red/20">
              <div className="flex items-center gap-2 text-neon-red">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-bold">DANGER ZONE</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 text-center">
              Are you sure you want to permanently remove <span className="font-bold text-white">{selected.name}</span> from the platform?
            </p>
            <p className="text-[10px] text-slate-500 text-center">This will revoke their license, stop all running bots, and archive their trade history. This action cannot be undone.</p>
            <ModalButtons
              onCancel={closeModal}
              onConfirm={removeClient}
              confirmLabel="Remove Permanently"
              confirmAccent="red"
            />
          </div>
        </ModalShell>
      )}
    </div>
  );
}

// ===== Helper Components =====

function MiniStat({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Users; color: string }) {
  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-lg font-bold text-white font-mono leading-none">{value}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick }: { icon: typeof Pencil; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`p-2 rounded-lg glass transition-all active:scale-90 ${color}`}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function ModalShell({ children, onClose, title, icon: Icon, accent, wide }: {
  children: React.ReactNode; onClose: () => void; title: string; icon: typeof Pencil; accent: 'cyan' | 'amber' | 'green' | 'red'; wide?: boolean;
}) {
  const accentColors = {
    cyan: 'neon-glow-cyan',
    amber: 'neon-glow-amber',
    green: 'neon-glow-green',
    red: 'neon-glow-red',
  };
  const iconColors = {
    cyan: 'text-neon-cyan',
    amber: 'text-neon-amber',
    green: 'text-neon-green',
    red: 'text-neon-red',
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-base-900/80 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} animate-scale-in max-h-[90vh] overflow-y-auto scrollbar-thin`}>
        <div className={`glass-strong ${accentColors[accent]} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${iconColors[accent]}`} />
              <h2 className="text-base font-bold text-white">{title}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2 block">{label}</label>
      {children}
    </div>
  );
}

function InfoBox({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof DollarSign; color: string }) {
  return (
    <div className="p-3 rounded-xl glass">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-500 uppercase">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}

function ModalButtons({ onCancel, onConfirm, confirmLabel, confirmAccent }: {
  onCancel: () => void; onConfirm: () => void; confirmLabel: string; confirmAccent: 'cyan' | 'amber' | 'green' | 'red';
}) {
  const accents = {
    cyan: 'bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30',
    amber: 'bg-neon-amber/20 border-neon-amber/40 text-neon-amber hover:bg-neon-amber/30',
    green: 'bg-neon-green/20 border-neon-green/40 text-neon-green hover:bg-neon-green/30',
    red: 'bg-neon-red/20 border-neon-red/40 text-neon-red hover:bg-neon-red/30',
  };
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl glass hover:bg-white/[0.07] text-sm text-slate-300 transition-all">
        Cancel
      </button>
      <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 rounded-xl border font-semibold text-sm transition-all active:scale-95 ${accents[confirmAccent]}`}>
        {confirmLabel}
      </button>
    </div>
  );
}

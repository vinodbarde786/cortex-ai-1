import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, Plus, Trash2, Crown, User as UserIcon, Check, X } from 'lucide-react';
import { supabase, type AdminRole } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const permissionsList = [
  'can_manage_clients',
  'can_manage_licenses',
  'can_manage_bots',
  'can_manage_risk',
  'can_manage_settings',
  'can_view_financials',
];

const roleConfig = {
  super_admin: { label: 'Super Admin', icon: Crown, color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/30' },
  sub_admin: { label: 'Sub-Admin', icon: UserIcon, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/30' },
};

export default function AdminAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'super_admin' | 'sub_admin'>('sub_admin');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    can_manage_clients: true,
    can_manage_licenses: false,
    can_manage_bots: true,
    can_manage_risk: false,
    can_manage_settings: false,
    can_view_financials: true,
  });

  useEffect(() => {
    let mounted = true;
    supabase.from('admin_roles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (!mounted) return;
      setAdmins((data as AdminRole[]) ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const handleAdd = async () => {
    if (!email.trim()) return;
    const { data } = await supabase.from('admin_roles').insert({
      email,
      role,
      permissions,
      is_active: true,
    }).select('*');
    if (data) setAdmins(prev => [data[0] as AdminRole, ...prev]);
    setShowAdd(false);
    setEmail('');
  };

  const togglePermission = (key: string) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDelete = async (id: string) => {
    await supabase.from('admin_roles').delete().eq('id', id);
    setAdmins(prev => prev.filter(a => a.id !== id));
  };

  const toggleActive = async (id: string, current: boolean) => {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, is_active: !current } : a));
    await supabase.from('admin_roles').update({ is_active: !current }).eq('id', id);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-neon-cyan animate-spin" /></div>;
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neon-amber" /> Admins
          </h2>
          <p className="text-sm text-slate-400">Super Admin & Sub-Admin role-based access control (RBAC)</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-amber/15 text-neon-amber border border-neon-amber/30 hover:bg-neon-amber/25 text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" /> Add Admin
        </button>
      </div>

      {/* Admin grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {admins.map(a => {
          const rc = roleConfig[a.role];
          const Icon = rc.icon;
          return (
            <div key={a.id} className={`glass-card p-5 ${a.is_active ? rc.border : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${rc.bg} ${rc.border} border flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${rc.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{a.email}</h3>
                    <span className={`text-[10px] font-bold ${rc.color}`}>{rc.label}</span>
                  </div>
                </div>
                <button onClick={() => toggleActive(a.id, a.is_active)} className={`px-2 py-1 rounded-md text-[10px] font-bold border ${a.is_active ? 'text-neon-green bg-neon-green/10 border-neon-green/20' : 'text-slate-500 bg-white/[0.03] border-white/[0.06]'}`}>
                  {a.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              {/* Permissions */}
              <div className="space-y-1.5 mb-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Permissions</p>
                {permissionsList.map(p => {
                  const has = a.permissions?.[p];
                  return (
                    <div key={p} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{p.replace(/can_/g, '').replace(/_/g, ' ')}</span>
                      {has ? <Check className="w-4 h-4 text-neon-green" /> : <X className="w-4 h-4 text-slate-600" />}
                    </div>
                  );
                })}
              </div>

              {a.user_id !== user?.id && (
                <button onClick={() => handleDelete(a.id)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-neon-red/10 text-neon-red border border-neon-red/20 hover:bg-neon-red/20 transition-all">
                  <Trash2 className="w-3.5 h-3.5" /> Remove Admin
                </button>
              )}
            </div>
          );
        })}
        {admins.length === 0 && (
          <div className="glass-card p-12 text-center col-span-2">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No admins configured</p>
            <p className="text-xs text-slate-500 mt-1">Add your first admin to start managing access control.</p>
          </div>
        )}
      </div>

      {/* Add admin modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-base-900/80 backdrop-blur-md" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-md animate-scale-in">
            <div className="glass-strong neon-glow-cyan p-6">
              <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                <Plus className="w-5 h-5 text-neon-amber" /> Add New Admin
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-semibold">Email</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@cortex.ai"
                    className="w-full px-4 py-2.5 rounded-xl glass text-sm text-white focus:outline-none focus:border-neon-amber/40 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block font-semibold">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['super_admin', 'sub_admin'] as const).map(r => (
                      <button key={r} onClick={() => setRole(r)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${role === r ? 'bg-neon-amber/15 text-neon-amber border border-neon-amber/40' : 'glass text-slate-400'}`}>
                        {r.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-2 block font-semibold">Permissions</label>
                  <div className="space-y-1.5">
                    {permissionsList.map(p => (
                      <button key={p} onClick={() => togglePermission(p)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                        <span className="text-xs text-slate-300 capitalize">{p.replace(/can_/g, '').replace(/_/g, ' ')}</span>
                        {permissions[p] ? <Check className="w-4 h-4 text-neon-green" /> : <X className="w-4 h-4 text-slate-600" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 rounded-xl glass hover:bg-white/[0.07] text-sm text-slate-300 transition-all">Cancel</button>
                  <button onClick={handleAdd} disabled={!email.trim()}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${email.trim() ? 'bg-neon-amber/15 text-neon-amber border border-neon-amber/40 hover:bg-neon-amber/25' : 'bg-white/[0.03] text-slate-500 border border-white/[0.06] cursor-not-allowed'}`}>
                    Add Admin
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

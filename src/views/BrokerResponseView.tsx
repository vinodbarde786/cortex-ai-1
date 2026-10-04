import { Server, CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react';

const responses = [
  { broker: 'Binance', endpoint: 'POST /api/v3/order', status: 'success', latency: 42, timestamp: '2026-10-03 14:32:08', detail: 'Order BTCUSDT BUY 0.05 @ 67100 — FILLED' },
  { broker: 'Binance', endpoint: 'GET /api/v3/account', status: 'success', latency: 28, timestamp: '2026-10-03 14:31:55', detail: 'Balance sync — 6 assets updated' },
  { broker: 'Binance', endpoint: 'POST /fapi/v1/order', status: 'success', latency: 55, timestamp: '2026-10-03 14:18:55', detail: 'Futures ETHUSDT SELL 1.2 @ 3492 — FILLED' },
  { broker: 'Binance', endpoint: 'GET /api/v3/ticker', status: 'success', latency: 15, timestamp: '2026-10-03 14:15:01', detail: 'Price ticker fetched for 10 pairs' },
  { broker: 'Binance', endpoint: 'POST /api/v3/order', status: 'error', latency: 1200, timestamp: '2026-10-03 13:20:33', detail: 'Order BNBUSDT SELL — REJECTED: Insufficient balance' },
  { broker: 'Binance', endpoint: 'POST /api/v3/order', status: 'success', latency: 38, timestamp: '2026-10-03 12:30:44', detail: 'Order BTCUSDT BUY 0.02 @ 66850 — FILLED' },
  { broker: 'Binance', endpoint: 'DELETE /api/v3/order', status: 'success', latency: 22, timestamp: '2026-10-03 10:48:09', detail: 'Cancel LINKUSDT SELL — CANCELLED' },
  { broker: 'Binance', endpoint: 'GET /api/v3/depth', status: 'success', latency: 18, timestamp: '2026-10-03 10:30:00', detail: 'Order book depth — SOLUSDT' },
];

const statusConfig = {
  success: { icon: CheckCircle, color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20', label: 'SUCCESS' },
  error: { icon: AlertCircle, color: 'text-neon-red', bg: 'bg-neon-red/10', border: 'border-neon-red/20', label: 'ERROR' },
  pending: { icon: Clock, color: 'text-neon-amber', bg: 'bg-neon-amber/10', border: 'border-neon-amber/20', label: 'PENDING' },
};

export default function BrokerResponseView() {
  const successCount = responses.filter(r => r.status === 'success').length;
  const errorCount = responses.filter(r => r.status === 'error').length;
  const avgLatency = Math.round(responses.reduce((s, r) => s + r.latency, 0) / responses.length);

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-neon-cyan" />
          Broker Response
        </h2>
        <p className="text-sm text-slate-400">Real-time API response logs from connected brokers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Total Requests</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">{responses.length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Successful</span>
            <CheckCircle className="w-4 h-4 text-neon-green" />
          </div>
          <p className="text-lg font-bold text-neon-green font-mono">{successCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Errors</span>
            <AlertCircle className="w-4 h-4 text-neon-red" />
          </div>
          <p className="text-lg font-bold text-neon-red font-mono">{errorCount}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Avg Latency</span>
            <Activity className="w-4 h-4 text-neon-cyan" />
          </div>
          <p className="text-lg font-bold text-neon-cyan font-mono">{avgLatency}ms</p>
        </div>
      </div>

      {/* Response Log */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white">API Response Log</h3>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {responses.map((r, i) => {
            const sc = statusConfig[r.status as keyof typeof statusConfig];
            const Icon = sc.icon;
            return (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${sc.bg} ${sc.border} border flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${sc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white">{r.endpoint}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{r.latency}ms</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">{r.detail}</p>
                </div>
                <span className="text-[10px] text-slate-600 font-mono flex-shrink-0 hidden sm:block">{r.timestamp}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

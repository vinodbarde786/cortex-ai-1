import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface Profile {
  id: string;
  email: string;
  disclaimer_accepted: boolean;
  disclaimer_accepted_at: string | null;
  created_at: string;
}

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  market_type: 'spot' | 'futures';
  coin: string;
  strategy: 'scalping' | 'grid' | 'trailing';
  status: 'running' | 'paused' | 'idle';
  profit_loss: number;
  created_at: string;
}

export interface TradeHistory {
  id: string;
  user_id: string;
  timestamp: string;
  pair: string;
  side: 'BUY' | 'SELL';
  amount: number;
  price: number;
  pnl: number;
  strategy: string | null;
}

export interface BrokerKey {
  id: string;
  user_id: string;
  exchange_name: string;
  api_key: string;
  api_secret: string;
  is_connected: boolean;
  created_at: string;
}

// Admin panel types

export interface License {
  id: string;
  user_id: string | null;
  plan_name: string;
  bot_limit: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  monthly_fee: number;
  created_at: string;
}

export interface AdminRole {
  id: string;
  user_id: string;
  email: string;
  role: 'super_admin' | 'sub_admin';
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
}

export interface UserFund {
  id: string;
  user_id: string;
  exchange_name: string;
  balance: number;
  unrealized_pnl: number;
  realized_pnl: number;
  manual_trading_enabled: boolean;
  last_synced_at: string | null;
  created_at: string;
}

export interface RiskSettings {
  id: string;
  global_kill_switch: boolean;
  max_leverage: number;
  max_daily_loss_pct: number;
  api_health_alerts: boolean;
  auto_disable_on_breach: boolean;
  updated_at: string;
}

export interface BotTemplate {
  id: string;
  name: string;
  description: string | null;
  strategy_type: 'scalping' | 'grid' | 'trailing' | 'dca';
  market_type: 'spot' | 'futures';
  default_tp_pct: number;
  default_sl_pct: number;
  risk_level: 'Low' | 'Medium' | 'High';
  is_public: boolean;
  total_copies: number;
  created_at: string;
  bot_type: 'scalper' | 'dca' | 'grid' | 'copier' | null;
  execution_mode: 'auto' | 'manual' | null;
  strategies: string[] | null;
  indicators: string[] | null;
  max_drawdown_pct: number | null;
  tp_sl_ratio: number | null;
  max_leverage: number | null;
  source_exchanges: string[] | null;
  overall_pnl: number | null;
  active_users: number | null;
  status: 'active' | 'paused' | null;
}

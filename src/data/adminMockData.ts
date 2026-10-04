export interface AdminClient {
  id: string;
  email: string;
  name: string;
  plan: string;
  status: 'active' | 'suspended' | 'banned';
  totalFunds: number;
  unrealizedPnl: number;
  realizedPnl: number;
  activeBots: number;
  manualTrading: boolean;
  joinedDate: string;
  lastActive: string;
  country: string;
  licenseValidUntil: string;
  licenseCycle: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
  botLimit: number;
  unlockedStrategies: string[];
  unlockedIndicators: string[];
}

export const adminClients: AdminClient[] = [
  { id: 'c1', email: 'alex.trader@gmail.com', name: 'Alex Trader', plan: 'Enterprise', status: 'active', totalFunds: 245_000, unrealizedPnl: 12_400, realizedPnl: 38_200, activeBots: 8, manualTrading: true, joinedDate: '2026-01-15', lastActive: '2 min ago', country: 'USA', licenseValidUntil: '2027-01-15', licenseCycle: 'yearly', botLimit: 25, unlockedStrategies: ['Scalping', 'Grid', 'DCA', 'Arbitrage', 'Mean Reversion', 'Momentum Breakout', 'Trend Following'], unlockedIndicators: ['RSI Pro', 'MACD Divergence', 'Bollinger Bands Pro', 'Volume Profile', 'Ichimoku Cloud', 'Fibonacci Auto', 'Order Blocks', 'Liquidity Zones'] },
  { id: 'c2', email: 'priya.sharma@yahoo.in', name: 'Priya Sharma', plan: 'Pro', status: 'active', totalFunds: 87_500, unrealizedPnl: 3_200, realizedPnl: 11_800, activeBots: 5, manualTrading: false, joinedDate: '2026-02-20', lastActive: '14 min ago', country: 'India', licenseValidUntil: '2026-08-20', licenseCycle: 'half-yearly', botLimit: 8, unlockedStrategies: ['Scalping', 'Grid', 'DCA', 'Trend Following', 'Mean Reversion'], unlockedIndicators: ['RSI Pro', 'MACD Divergence', 'Bollinger Bands Pro', 'Volume Profile'] },
  { id: 'c3', email: 'marco.rossi@libero.it', name: 'Marco Rossi', plan: 'Pro', status: 'active', totalFunds: 62_300, unrealizedPnl: -1_800, realizedPnl: 7_200, activeBots: 4, manualTrading: false, joinedDate: '2026-03-01', lastActive: '1 hr ago', country: 'Italy', licenseValidUntil: '2026-06-01', licenseCycle: 'quarterly', botLimit: 8, unlockedStrategies: ['Scalping', 'Grid', 'DCA'], unlockedIndicators: ['RSI Pro', 'MACD Divergence'] },
  { id: 'c4', email: 'yuki.tanaka@gmail.com', name: 'Yuki Tanaka', plan: 'Enterprise', status: 'active', totalFunds: 410_000, unrealizedPnl: 28_500, realizedPnl: 62_100, activeBots: 12, manualTrading: true, joinedDate: '2025-12-10', lastActive: '5 min ago', country: 'Japan', licenseValidUntil: '2026-12-10', licenseCycle: 'yearly', botLimit: 25, unlockedStrategies: ['Scalping', 'Grid', 'DCA', 'Arbitrage', 'Mean Reversion', 'Momentum Breakout', 'Trend Following'], unlockedIndicators: ['RSI Pro', 'MACD Divergence', 'Bollinger Bands Pro', 'Volume Profile', 'Ichimoku Cloud', 'Fibonacci Auto', 'Order Blocks', 'Liquidity Zones'] },
  { id: 'c5', email: 'sarah.connor@outlook.com', name: 'Sarah Connor', plan: 'Starter', status: 'suspended', totalFunds: 5_200, unrealizedPnl: 0, realizedPnl: -800, activeBots: 0, manualTrading: false, joinedDate: '2026-04-05', lastActive: '3 days ago', country: 'UK', licenseValidUntil: '2026-05-05', licenseCycle: 'monthly', botLimit: 2, unlockedStrategies: ['Scalping'], unlockedIndicators: ['RSI Pro'] },
  { id: 'c6', email: 'dmitri.volkov@yandex.ru', name: 'Dmitri Volkov', plan: 'Pro', status: 'active', totalFunds: 134_000, unrealizedPnl: 8_900, realizedPnl: 22_400, activeBots: 6, manualTrading: true, joinedDate: '2026-02-28', lastActive: '22 min ago', country: 'Russia', licenseValidUntil: '2026-08-28', licenseCycle: 'half-yearly', botLimit: 8, unlockedStrategies: ['Scalping', 'Grid', 'DCA', 'Trend Following', 'Mean Reversion'], unlockedIndicators: ['RSI Pro', 'MACD Divergence', 'Bollinger Bands Pro', 'Volume Profile'] },
  { id: 'c7', email: 'li.wei@163.com', name: 'Li Wei', plan: 'Enterprise', status: 'active', totalFunds: 528_000, unrealizedPnl: 41_200, realizedPnl: 89_600, activeBots: 15, manualTrading: true, joinedDate: '2025-11-22', lastActive: '1 min ago', country: 'China', licenseValidUntil: '2026-11-22', licenseCycle: 'yearly', botLimit: 25, unlockedStrategies: ['Scalping', 'Grid', 'DCA', 'Arbitrage', 'Mean Reversion', 'Momentum Breakout', 'Trend Following'], unlockedIndicators: ['RSI Pro', 'MACD Divergence', 'Bollinger Bands Pro', 'Volume Profile', 'Ichimoku Cloud', 'Fibonacci Auto', 'Order Blocks', 'Liquidity Zones'] },
  { id: 'c8', email: 'carlos.mendez@gmail.com', name: 'Carlos Mendez', plan: 'Starter', status: 'active', totalFunds: 12_800, unrealizedPnl: 420, realizedPnl: 1_900, activeBots: 2, manualTrading: false, joinedDate: '2026-05-12', lastActive: '4 hr ago', country: 'Mexico', licenseValidUntil: '2026-11-12', licenseCycle: 'half-yearly', botLimit: 2, unlockedStrategies: ['Scalping', 'Grid'], unlockedIndicators: ['RSI Pro', 'MACD Divergence'] },
  { id: 'c9', email: 'fatima.al@saudi.net', name: 'Fatima Al-Saud', plan: 'Pro', status: 'active', totalFunds: 198_000, unrealizedPnl: 15_600, realizedPnl: 31_200, activeBots: 7, manualTrading: false, joinedDate: '2026-01-30', lastActive: '8 min ago', country: 'UAE', licenseValidUntil: '2026-07-30', licenseCycle: 'half-yearly', botLimit: 8, unlockedStrategies: ['Scalping', 'Grid', 'DCA', 'Trend Following', 'Mean Reversion'], unlockedIndicators: ['RSI Pro', 'MACD Divergence', 'Bollinger Bands Pro', 'Volume Profile'] },
  { id: 'c10', email: 'hans.mueller@gmx.de', name: 'Hans Mueller', plan: 'Starter', status: 'banned', totalFunds: 0, unrealizedPnl: 0, realizedPnl: -3_200, activeBots: 0, manualTrading: false, joinedDate: '2026-03-18', lastActive: '2 weeks ago', country: 'Germany', licenseValidUntil: '2026-04-18', licenseCycle: 'monthly', botLimit: 2, unlockedStrategies: [], unlockedIndicators: [] },
];

export interface AdminLicense {
  id: string;
  planName: string;
  price: number;
  botLimit: number;
  activeUsers: number;
  maxLeverage: number;
  features: string[];
  color: 'green' | 'cyan' | 'amber';
}

export const adminLicensePlans: AdminLicense[] = [
  { id: 'l1', planName: 'Starter', price: 29, botLimit: 2, activeUsers: 421, maxLeverage: 20, features: ['2 AI Bots', 'Spot Trading', 'Email Support', 'Basic Signals'], color: 'cyan' },
  { id: 'l2', planName: 'Pro', price: 99, botLimit: 8, activeUsers: 186, maxLeverage: 50, features: ['8 AI Bots', 'Spot & Futures', 'Priority Support', 'Advanced Signals', 'Copy Trading', 'Custom Strategies'], color: 'green' },
  { id: 'l3', planName: 'Enterprise', price: 499, botLimit: 25, activeUsers: 47, maxLeverage: 100, features: ['25 AI Bots', 'Unlimited Markets', 'Dedicated Manager', 'API Access', 'White-label', 'Custom Risk Rules', 'Priority Features'], color: 'amber' },
];

export interface ApiHealthLog {
  id: string;
  exchange: string;
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastCheck: string;
}

export const apiHealthLogs: ApiHealthLog[] = [
  { id: 'h1', exchange: 'Binance', endpoint: 'GET /api/v3/ticker', status: 'healthy', latency: 18, uptime: 99.98, lastCheck: '8s ago' },
  { id: 'h2', exchange: 'Binance', endpoint: 'POST /api/v3/order', status: 'healthy', latency: 42, uptime: 99.95, lastCheck: '8s ago' },
  { id: 'h3', exchange: 'Bybit', endpoint: 'GET /v5/market/tickers', status: 'healthy', latency: 35, uptime: 99.92, lastCheck: '12s ago' },
  { id: 'h4', exchange: 'OKX', endpoint: 'GET /api/v5/market/ticker', status: 'degraded', latency: 280, uptime: 98.71, lastCheck: '15s ago' },
  { id: 'h5', exchange: 'KuCoin', endpoint: 'GET /api/v1/market/orderbook', status: 'healthy', latency: 52, uptime: 99.88, lastCheck: '10s ago' },
  { id: 'h6', exchange: 'Coinbase Pro', endpoint: 'GET /api/v3/brokerage/products', status: 'down', latency: 0, uptime: 97.23, lastCheck: '30s ago' },
];

export interface SystemActivity {
  id: string;
  type: 'login' | 'bot_deploy' | 'trade' | 'license_change' | 'risk_alert' | 'admin_action';
  message: string;
  user: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
}

export const systemActivities: SystemActivity[] = [
  { id: 'a1', type: 'login', message: 'New admin login from IP 192.168.1.42', user: 'admin@cortex.ai', timestamp: '2 min ago', severity: 'info' },
  { id: 'a2', type: 'bot_deploy', message: 'Enterprise user deployed 3 new AI bots', user: 'li.wei@163.com', timestamp: '5 min ago', severity: 'success' },
  { id: 'a3', type: 'risk_alert', message: 'Daily loss limit reached for user sarah.connor', user: 'sarah.connor@outlook.com', timestamp: '18 min ago', severity: 'warning' },
  { id: 'a4', type: 'license_change', message: 'Upgraded from Pro to Enterprise', user: 'yuki.tanaka@gmail.com', timestamp: '1 hr ago', severity: 'success' },
  { id: 'a5', type: 'trade', message: 'Large BTC liquidation executed via Panic Button', user: 'dmitri.volkov@yandex.ru', timestamp: '2 hr ago', severity: 'critical' },
  { id: 'a6', type: 'admin_action', message: 'Sub-admin permissions updated', user: 'admin@cortex.ai', timestamp: '3 hr ago', severity: 'info' },
  { id: 'a7', type: 'risk_alert', message: 'Coinbase Pro API health degraded', user: 'system', timestamp: '4 hr ago', severity: 'warning' },
];

export const allStrategies = [
  'Scalping', 'Grid', 'DCA', 'Arbitrage', 'Mean Reversion',
  'Momentum Breakout', 'Trend Following', 'Breakout Reversal',
  'Order Block Sniper', 'Smart Money Concept', 'Volume Weighted',
];

export const allIndicators = [
  'RSI Pro', 'MACD Divergence', 'Bollinger Bands Pro', 'Volume Profile',
  'Ichimoku Cloud', 'Fibonacci Auto', 'Order Blocks', 'Liquidity Zones',
  'VWAP Anchored', 'Market Structure', 'Smart Money Index', 'CVD Pro',
];

export type LicenseCycle = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export const licenseCycleConfig: Record<LicenseCycle, { label: string; multiplier: number; badge: string }> = {
  monthly: { label: 'Monthly', multiplier: 1, badge: 'bg-neon-cyan/15 text-neon-cyan' },
  quarterly: { label: 'Quarterly', multiplier: 2.7, badge: 'bg-neon-green/15 text-neon-green' },
  'half-yearly': { label: 'Half-Yearly', multiplier: 5.2, badge: 'bg-neon-amber/15 text-neon-amber' },
  yearly: { label: 'Yearly', multiplier: 9.6, badge: 'bg-neon-amber/20 text-neon-amber' },
};

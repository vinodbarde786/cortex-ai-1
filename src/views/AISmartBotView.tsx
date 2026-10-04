import { useState } from 'react';
import { Bot, Layers, Coins, Crosshair, Shield, DollarSign, Rocket, Zap, TrendingUp, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { coins } from '@/data/mockData';
import { supabase } from '@/lib/supabase';

type MarketType = 'spot' | 'futures';
type StrategyCore = 'scalping' | 'grid' | 'trailing';

export default function AISmartBotView() {
  const { formatCurrency, convert, currency } = useApp();

  const [marketType, setMarketType] = useState<MarketType>('spot');
  const [leverage, setLeverage] = useState(10);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [strategyCore, setStrategyCore] = useState<StrategyCore>('scalping');
  const [takeProfit, setTakeProfit] = useState(5);
  const [stopLoss, setStopLoss] = useState(2);
  const [capital, setCapital] = useState(5000);
  const [launched, setLaunched] = useState(false);
  const [launching, setLaunching] = useState(false);

  const selectedCoinData = coins.find(c => c.symbol === selectedCoin) || coins[0];
  const positionSize = marketType === 'futures' ? capital * leverage : capital;
  const coinAmount = positionSize / selectedCoinData.price;

  const handleLaunch = async () => {
    setLaunching(true);
    const botName = `Custom Cortex Bot — ${selectedCoin} ${strategyCore.charAt(0).toUpperCase() + strategyCore.slice(1)}`;
    const { error } = await supabase.from('bots').insert({
      name: botName,
      market_type: marketType,
      coin: selectedCoin,
      strategy: strategyCore,
      status: 'running',
      profit_loss: 0,
    });
    setLaunching(false);
    if (error) {
      console.error('Failed to launch bot:', error.message);
      return;
    }
    setLaunched(true);
    setTimeout(() => setLaunched(false), 4000);
  };

  return (
    <div className="space-y-5 animate-slide-up max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center neon-glow-cyan">
          <Bot className="w-6 h-6 text-neon-cyan" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">AI Smart Bot Builder</h2>
            <span className="px-2 py-0.5 rounded-md bg-neon-green/15 text-neon-green text-[10px] font-bold neon-glow-green">NEW</span>
          </div>
          <p className="text-sm text-slate-400">Design and launch your custom AI-powered trading bot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Market Type */}
          <Section icon={Layers} title="Market Type" accent="cyan">
            <div className="grid grid-cols-2 gap-3">
              {(['spot', 'futures'] as MarketType[]).map((mt) => (
                <button
                  key={mt}
                  onClick={() => setMarketType(mt)}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                    marketType === mt
                      ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 neon-glow-cyan'
                      : 'glass text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mt}
                  {mt === 'futures' && <span className="block text-[10px] mt-0.5 opacity-70">Up to 100x leverage</span>}
                </button>
              ))}
            </div>

            {/* Leverage Slider */}
            {marketType === 'futures' && (
              <div className="mt-4 animate-slide-up">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Leverage</span>
                  <span className="text-sm font-bold text-neon-amber font-mono">{leverage}x</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer slider-neon"
                    style={{
                      background: `linear-gradient(to right, #00ff9d 0%, #00e5ff ${leverage}%, #1a1f33 ${leverage}%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1.5 text-[9px] text-slate-600">
                    <span>1x</span>
                    <span>25x</span>
                    <span>50x</span>
                    <span>75x</span>
                    <span className={leverage >= 80 ? 'text-neon-red font-bold' : ''}>100x MAX</span>
                  </div>
                </div>
                {leverage >= 50 && (
                  <p className="mt-2 text-[11px] text-neon-red/80 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    High leverage significantly increases liquidation risk.
                  </p>
                )}
              </div>
            )}
          </Section>

          {/* Coin Selector */}
          <Section icon={Coins} title="Coin Selector" accent="cyan">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {coins.slice(0, 10).map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => setSelectedCoin(c.symbol)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    selectedCoin === c.symbol
                      ? 'bg-neon-green/15 text-neon-green border border-neon-green/40'
                      : 'glass text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.symbol}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">{selectedCoinData.name}</span>
              <span className="font-mono text-slate-200">${selectedCoinData.price.toLocaleString()}</span>
            </div>
          </Section>

          {/* Strategy Core */}
          <Section icon={Crosshair} title="Strategy Core" accent="cyan">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {([
                { id: 'scalping', label: 'Scalping', desc: 'Quick in/out trades on micro-moves', icon: Zap },
                { id: 'grid', label: 'Grid', desc: 'Place orders at set intervals', icon: Layers },
                { id: 'trailing', label: 'Trailing', desc: 'Dynamic stop that follows price', icon: TrendingUp },
              ] as { id: StrategyCore; label: string; desc: string; icon: typeof Zap }[]).map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStrategyCore(s.id)}
                    className={`p-3 rounded-xl text-left transition-all duration-200 ${
                      strategyCore === s.id
                        ? 'bg-neon-cyan/10 text-white border border-neon-cyan/40'
                        : 'glass text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${strategyCore === s.id ? 'text-neon-cyan' : 'text-slate-500'}`} />
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Risk / Reward */}
          <Section icon={Shield} title="Risk / Reward Inputs" accent="cyan">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Take Profit %</label>
                <div className="relative">
                  <input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl glass text-sm text-white font-mono focus:outline-none focus:border-neon-green/40 transition-colors"
                    step="0.5"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neon-green text-sm font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Auto-sell at +{takeProfit}% gain</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Stop Loss %</label>
                <div className="relative">
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Math.max(0, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl glass text-sm text-white font-mono focus:outline-none focus:border-neon-red/40 transition-colors"
                    step="0.5"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neon-red text-sm font-bold">%</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Auto-sell at -{stopLoss}% loss</p>
              </div>
            </div>
            {/* R/R ratio display */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-slate-400">Risk/Reward Ratio:</span>
              <span className={`font-bold font-mono ${takeProfit / (stopLoss || 1) >= 1.5 ? 'text-neon-green' : 'text-neon-amber'}`}>
                1:{(takeProfit / (stopLoss || 1)).toFixed(2)}
              </span>
            </div>
          </Section>

          {/* Capital Allocation */}
          <Section icon={DollarSign} title="Capital Allocation" accent="cyan">
            <div className="relative">
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl glass text-lg text-white font-mono focus:outline-none focus:border-neon-green/40 transition-colors"
                step="100"
                min="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neon-green font-bold">
                {currency}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[1000, 5000, 10000, 25000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCapital(preset)}
                  className="px-2 py-1.5 rounded-lg glass text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
                >
                  {formatCurrency(preset)}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Summary Panel - 1 col */}
        <div className="lg:col-span-1">
          <div className="glass-card p-5 sticky top-20">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-neon-green" />
              Bot Summary
            </h3>

            <div className="space-y-3 text-sm">
              <SummaryRow label="Market" value={marketType.toUpperCase()} />
              {marketType === 'futures' && (
                <SummaryRow label="Leverage" value={`${leverage}x`} accent="amber" />
              )}
              <SummaryRow label="Coin" value={selectedCoin} />
              <SummaryRow label="Strategy" value={strategyCore.charAt(0).toUpperCase() + strategyCore.slice(1)} />
              <SummaryRow label="Take Profit" value={`+${takeProfit}%`} accent="green" />
              <SummaryRow label="Stop Loss" value={`-${stopLoss}%`} accent="red" />
              <SummaryRow label="Capital" value={formatCurrency(capital)} />
              <div className="h-px bg-white/[0.06] my-3" />
              <SummaryRow label="Position Size" value={formatCurrency(positionSize)} accent="cyan" bold />
              <SummaryRow label="Coin Amount" value={`${coinAmount.toFixed(6)} ${selectedCoin}`} />
            </div>

            {/* Launch button */}
            <button
              onClick={handleLaunch}
              disabled={capital <= 0 || launching}
              className={`mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                launched
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 neon-glow-green'
                  : capital <= 0 || launching
                  ? 'bg-white/[0.03] text-slate-500 border border-white/[0.06] cursor-not-allowed'
                  : 'bg-gradient-to-r from-neon-cyan/20 to-neon-green/20 text-white border border-neon-cyan/40 hover:from-neon-cyan/30 hover:to-neon-green/30 neon-glow-cyan hover:scale-[1.02]'
              }`}
            >
              {launching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Launching...
                </>
              ) : launched ? (
                <>
                  <Check className="w-4 h-4" />
                  Bot Launched!
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Launch Custom Cortex Bot
                </>
              )}
            </button>

            {launched && (
              <p className="mt-3 text-center text-[11px] text-neon-green animate-fade-in">
                Your bot is now live and scanning the market...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, accent: _accent }: { icon: typeof Layers; title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Icon className="w-4 h-4 text-neon-cyan" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, accent, bold }: { label: string; value: string; accent?: string; bold?: boolean }) {
  const color = accent === 'green' ? 'text-neon-green' : accent === 'red' ? 'text-neon-red' : accent === 'amber' ? 'text-neon-amber' : accent === 'cyan' ? 'text-neon-cyan' : 'text-slate-200';
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={`${color} ${bold ? 'font-bold' : 'font-medium'} font-mono`}>{value}</span>
    </div>
  );
}

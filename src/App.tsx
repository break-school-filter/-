import { useState, useEffect } from "react";
import { RouletteOption, SpinLog, RouletteSettings } from "./types";
import { RouletteWheel } from "./components/RouletteWheel";
import { PresetSelector } from "./components/PresetSelector";
import { OptionList } from "./components/OptionList";
import { HistoryLog } from "./components/HistoryLog";
import { SettingsPanel } from "./components/SettingsPanel";
import { ResultModal } from "./components/ResultModal";
import { BingoMode } from "./components/BingoMode";
import { Sparkles, Settings, List, BarChart, Gift } from "lucide-react";

// Default options on first launch (景品抽選会)
const DEFAULT_OPTIONS: RouletteOption[] = [
  { id: "l-1", name: "✨ 特賞 (激レア)", weight: 1, color: "#f59e0b", isActive: true },
  { id: "l-2", name: "🥇 1等 (豪華景品)", weight: 3, color: "#f43f5e", isActive: true },
  { id: "l-3", name: "🥈 2等 (お菓子詰合せ)", weight: 8, color: "#3b82f6", isActive: true },
  { id: "l-4", name: "🥉 3等 (うまい棒)", weight: 15, color: "#10b981", isActive: true },
  { id: "l-5", name: "💨 参加賞 (ポケットティッシュ)", weight: 35, color: "#64748b", isActive: true },
];

const DEFAULT_SETTINGS: RouletteSettings = {
  duration: 4, // 4 seconds
  soundEnabled: true,
  volume: 0.5,
  removeWinnerAfterSpin: false,
};

export default function App() {
  const [appMode, setAppMode] = useState<"roulette" | "bingo">("roulette");
  const [options, setOptions] = useState<RouletteOption[]>([]);
  const [logs, setLogs] = useState<SpinLog[]>([]);
  const [settings, setSettings] = useState<RouletteSettings>(DEFAULT_SETTINGS);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteOption | null>(null);
  const [lastWinner, setLastWinner] = useState<RouletteOption | null>(null);
  const [activeTab, setActiveTab] = useState<"items" | "history" | "settings">("items");

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedMode = localStorage.getItem("festival_app_mode");
      if (storedMode === "roulette" || storedMode === "bingo") {
        setAppMode(storedMode);
      }

      const storedOptions = localStorage.getItem("festival_roulette_options");
      if (storedOptions) {
        setOptions(JSON.parse(storedOptions));
      } else {
        setOptions(DEFAULT_OPTIONS);
      }

      const storedLogs = localStorage.getItem("festival_roulette_logs");
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }

      const storedSettings = localStorage.getItem("festival_roulette_settings");
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (e) {
      console.warn("Could not load from localStorage", e);
      setOptions(DEFAULT_OPTIONS);
    }
  }, []);

  const saveAppMode = (mode: "roulette" | "bingo") => {
    setAppMode(mode);
    try {
      localStorage.setItem("festival_app_mode", mode);
    } catch (e) {
      console.error(e);
    }
  };

  // Save to LocalStorage helpers
  const saveOptions = (newOptions: RouletteOption[]) => {
    setOptions(newOptions);
    try {
      localStorage.setItem("festival_roulette_options", JSON.stringify(newOptions));
    } catch (e) {
      console.error(e);
    }
  };

  const saveLogs = (newLogs: SpinLog[]) => {
    setLogs(newLogs);
    try {
      localStorage.setItem("festival_roulette_logs", JSON.stringify(newLogs));
    } catch (e) {
      console.error(e);
    }
  };

  const saveSettings = (newSettings: RouletteSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem("festival_roulette_settings", JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  // Event handlers
  const handleSpinStart = () => {
    setIsSpinning(true);
    setWinner(null);
    setLastWinner(null);
  };

  const handleSpinEnd = (winnerOption: RouletteOption, isQuick: boolean = false) => {
    setIsSpinning(false);
    setLastWinner(winnerOption);
    
    if (!isQuick) {
      setWinner(winnerOption);
    }

    // Save log entry
    const newLog: SpinLog = {
      id: `log-${Date.now()}`,
      optionId: winnerOption.id,
      optionName: winnerOption.name,
      timestamp: Date.now(),
      color: winnerOption.color,
    };
    saveLogs([newLog, ...logs]);

    // Handle auto-exclusion if enabled
    if (settings.removeWinnerAfterSpin) {
      setTimeout(() => {
        const updated = options.map((opt) => {
          if (opt.id === winnerOption.id) {
            return { ...opt, isActive: false };
          }
          return opt;
        });
        saveOptions(updated);
      }, 1000);
    }
  };

  // Inside result modal: Exclude winner
  const handleExcludeWinner = (id: string) => {
    const updated = options.map((opt) => {
      if (opt.id === id) {
        return { ...opt, isActive: false };
      }
      return opt;
    });
    saveOptions(updated);
    setWinner(null);
  };

  const handleSelectPreset = (presetOptions: RouletteOption[]) => {
    if (isSpinning) return;
    saveOptions(presetOptions);
  };

  const handleClearLogs = () => {
    saveLogs([]);
  };

  const handleRemoveLog = (id: string) => {
    saveLogs(logs.filter((l) => l.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-slate-100 flex flex-col antialiased">
      {/* Decorative Golden Accent Border on Top */}
      <div className="h-1 w-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C]" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8 justify-start">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 border-b border-[#D4AF37]/15 pb-6">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl sm:text-4xl">🎪</span>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-serif-jp font-bold tracking-[0.1em] flex items-center justify-center sm:justify-start gap-2">
                <span className="gold-gradient-text font-black">ルーレット&ビンゴ</span>
                <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-serif-jp tracking-wider">
                合宿、イベント、パーティーの役割分担、景品抽選、レク大会で大活躍！
              </p>
            </div>
          </div>
          
          {/* Accent decoration */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[#0c0c0e]/80 border border-[#D4AF37]/20 rounded-lg text-xs font-serif-jp font-bold text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.05)]">
            <Gift className="w-4 h-4 animate-bounce" />
            レクリエーション・お楽しみ応援ツール
          </div>
        </header>

        {/* Mode Toggles */}
        <div className="flex justify-center mt-1">
          <div className="inline-flex bg-[#0c0c0e]/80 p-1.5 rounded-xl border border-[#D4AF37]/25 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
            <button
              type="button"
              onClick={() => saveAppMode("roulette")}
              className={`flex items-center gap-2 py-2.5 px-6 sm:px-8 rounded-lg text-sm sm:text-base font-serif-jp font-bold transition-all duration-300 ${
                appMode === "roulette"
                  ? "bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C] text-[#0c0c0e] shadow-[0_0_15px_rgba(212,175,55,0.35)] font-extrabold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#D4AF37]/5"
              }`}
            >
              <span>🎪</span> ルーレット抽選
            </button>
            <button
              type="button"
              onClick={() => saveAppMode("bingo")}
              className={`flex items-center gap-2 py-2.5 px-6 sm:px-8 rounded-lg text-sm sm:text-base font-serif-jp font-bold transition-all duration-300 ${
                appMode === "bingo"
                  ? "bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C] text-[#0c0c0e] shadow-[0_0_15px_rgba(212,175,55,0.35)] font-extrabold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#D4AF37]/5"
              }`}
            >
              <span>🔢</span> ビンゴ抽選
            </button>
          </div>
        </div>

        {appMode === "roulette" ? (
          <>
            {/* Quick Presets (Accessible on all tabs) */}
            <div className="w-full">
              <PresetSelector onSelectPreset={handleSelectPreset} />
            </div>

            {/* Main Grid: Wheel on Left, Customizer / Controls on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Left Column: Roulette Stage (Col span 5) */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-xl flex flex-col items-center justify-center min-h-[440px] sm:min-h-[500px]">
                <RouletteWheel
                  options={options}
                  onSpinStart={handleSpinStart}
                  onSpinEnd={handleSpinEnd}
                  isSpinning={isSpinning}
                  spinDuration={settings.duration}
                />
                {lastWinner && (
                  <div className="mt-4 px-6 py-2.5 bg-[#0c0c0e]/90 border border-[#D4AF37]/35 rounded-xl text-center animate-fade-in flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                    <span className="text-[#D4AF37] font-bold text-sm">🎯 最新の当選結果:</span>
                    <span className="font-extrabold text-base" style={{ color: lastWinner.color }}>
                      {lastWinner.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Dashboards (Col span 7) */}
              <div className="lg:col-span-7 flex flex-col h-full gap-5">
                
                {/* Elegant Tab Buttons */}
                <div className="flex bg-[#0c0c0e]/60 p-1.5 rounded-xl border border-[#D4AF37]/15">
                  <button
                    type="button"
                    id="tab-items"
                    onClick={() => setActiveTab("items")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-serif-jp font-bold transition-all duration-300 ${
                      activeTab === "items"
                        ? "bg-[#D4AF37] text-[#0c0c0e] shadow-sm font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#D4AF37]/10"
                    }`}
                  >
                    <List className="w-4.5 h-4.5" />
                    項目を編集
                  </button>
                  
                  <button
                    type="button"
                    id="tab-history"
                    onClick={() => setActiveTab("history")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-serif-jp font-bold transition-all duration-300 ${
                      activeTab === "history"
                        ? "bg-[#D4AF37] text-[#0c0c0e] shadow-sm font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#D4AF37]/10"
                    }`}
                  >
                    <BarChart className="w-4.5 h-4.5" />
                    履歴・統計 ({logs.length})
                  </button>
                  
                  <button
                    type="button"
                    id="tab-settings"
                    onClick={() => setActiveTab("settings")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-serif-jp font-bold transition-all duration-300 ${
                      activeTab === "settings"
                        ? "bg-[#D4AF37] text-[#0c0c0e] shadow-sm font-bold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#D4AF37]/10"
                    }`}
                  >
                    <Settings className="w-4.5 h-4.5" />
                    設定
                  </button>
                </div>

                {/* Tab Views content area */}
                <div className="flex-1">
                  {activeTab === "items" && (
                    <OptionList
                      options={options}
                      onUpdateOptions={saveOptions}
                      isSpinning={isSpinning}
                    />
                  )}
                  {activeTab === "history" && (
                    <HistoryLog
                      logs={logs}
                      onClearLogs={handleClearLogs}
                      onRemoveLog={handleRemoveLog}
                    />
                  )}
                  {activeTab === "settings" && (
                    <SettingsPanel
                      settings={settings}
                      onUpdateSettings={saveSettings}
                      isSpinning={isSpinning}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <BingoMode />
        )}
      </main>

      {/* Celebratory Winner Modal */}
      <ResultModal
        winner={winner}
        onClose={() => setWinner(null)}
        onExcludeWinner={handleExcludeWinner}
      />

      {/* Bottom Footer Credit */}
      <footer className="py-6 border-t border-[#D4AF37]/10 bg-[#0c0c0e] flex flex-col items-center justify-center gap-1.5 text-center px-4">
        <p className="text-xs text-slate-500 font-serif-jp">
          © {new Date().getFullYear()} <span className="text-[#D4AF37]">ルーレット&ビンゴ</span>. Built with React & Web Audio API.
        </p>
        <p className="text-[10px] text-slate-600 font-serif-jp tracking-wider">
          端末のローカルストレージに設定や履歴が自動保存されます。ブラウザキャッシュをクリアすると初期化されます。
        </p>
      </footer>
    </div>
  );
}

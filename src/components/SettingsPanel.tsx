import React from "react";
import { RouletteSettings } from "../types";
import { Volume2, VolumeX, Timer, Trash2, Sliders } from "lucide-react";
import { audioSynth } from "../utils/audio";

interface SettingsPanelProps {
  settings: RouletteSettings;
  onUpdateSettings: (settings: RouletteSettings) => void;
  isSpinning: boolean;
}

const DURATION_PRESETS = [
  { label: "爆速 (2秒)", value: 2 },
  { label: "普通 (4秒)", value: 4 },
  { label: "じっくり (7秒)", value: 7 },
  { label: "緊迫感MAX (10秒)", value: 10 },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  isSpinning,
}) => {
  const handleToggleSound = () => {
    const newVal = !settings.soundEnabled;
    audioSynth.setEnabled(newVal);
    onUpdateSettings({ ...settings, soundEnabled: newVal });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audioSynth.setVolume(val);
    onUpdateSettings({ ...settings, volume: val });
  };

  const handleTestSound = () => {
    audioSynth.playTick();
    setTimeout(() => {
      audioSynth.playFanfare();
    }, 150);
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-xl">
      <h3 className="text-xs text-[#D4AF37] uppercase tracking-[0.2em] font-bold italic mb-5 flex items-center gap-1.5">
        ✦ ルーレット設定 SETTINGS
      </h3>

      <div className="space-y-6">
        {/* Spin Duration */}
        <div>
          <label className="text-xs font-bold text-[#D4AF37]/80 uppercase tracking-widest block mb-2.5">
            ⏱ 回転する時間
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                disabled={isSpinning}
                onClick={() => onUpdateSettings({ ...settings, duration: preset.value })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                  settings.duration === preset.value
                    ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]"
                    : "bg-[#0c0c0e]/80 border-[#D4AF37]/15 text-slate-400 hover:border-[#D4AF37]/40 hover:text-slate-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Volume Controls */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <label className="text-xs font-bold text-[#D4AF37]/80 uppercase tracking-widest flex items-center gap-1.5">
              🔊 音量設定
            </label>
            <button
              type="button"
              onClick={handleTestSound}
              disabled={!settings.soundEnabled}
              className="text-[10px] text-[#D4AF37] hover:text-[#FCF6BA] border border-[#D4AF37]/25 px-2 py-0.5 rounded-md hover:bg-[#D4AF37]/5 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              音テスト 🔔
            </button>
          </div>

          <div className="flex items-center gap-3 bg-[#0c0c0e]/50 border border-[#D4AF37]/15 p-3 rounded-xl">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.soundEnabled
                  ? "text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  : "text-slate-500 hover:bg-slate-800"
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundEnabled ? settings.volume : 0}
              onChange={handleVolumeChange}
              disabled={!settings.soundEnabled}
              className="flex-1 accent-[#D4AF37] bg-slate-800 h-1.5 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <span className="text-xs font-mono font-bold text-slate-400 w-8 text-right">
              {settings.soundEnabled ? Math.round(settings.volume * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Exclude Mode Switch */}
        <div className="flex items-center justify-between bg-[#0c0c0e]/50 border border-[#D4AF37]/15 p-3.5 rounded-xl">
          <div className="pr-4">
            <label className="text-xs font-bold text-slate-200 block">
              💡 当選後に自動除外
            </label>
            <span className="text-[10px] text-slate-500 block mt-0.5 leading-relaxed">
              当選した項目をルーレットから自動で無効化します（連続抽選に最適）
            </span>
          </div>
          <button
            type="button"
            disabled={isSpinning}
            onClick={() =>
              onUpdateSettings({ ...settings, removeWinnerAfterSpin: !settings.removeWinnerAfterSpin })
            }
            className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-300 ${
              settings.removeWinnerAfterSpin ? "bg-[#D4AF37]" : "bg-slate-800"
            } disabled:opacity-40`}
          >
            <div
              className={`bg-slate-950 w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                settings.removeWinnerAfterSpin ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

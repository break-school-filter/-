import React, { useState } from "react";
import { RouletteOption } from "../types";
import { Plus, Trash2, Eye, EyeOff, RotateCcw, Sparkles } from "lucide-react";

interface OptionListProps {
  options: RouletteOption[];
  onUpdateOptions: (options: RouletteOption[]) => void;
  isSpinning: boolean;
}

const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
];

export const OptionList: React.FC<OptionListProps> = ({
  options,
  onUpdateOptions,
  isSpinning,
}) => {
  const [newItemName, setNewItemName] = useState("");

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    const newOption: RouletteOption = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      weight: 1,
      color: PRESET_COLORS[options.length % PRESET_COLORS.length],
      isActive: true,
    };

    onUpdateOptions([...options, newOption]);
    setNewItemName("");
  };

  const handleUpdateOptionField = <K extends keyof RouletteOption>(
    id: string,
    field: K,
    value: RouletteOption[K]
  ) => {
    const updated = options.map((opt) => {
      if (opt.id === id) {
        return { ...opt, [field]: value };
      }
      return opt;
    });
    onUpdateOptions(updated);
  };

  const handleDeleteOption = (id: string) => {
    const updated = options.filter((opt) => opt.id !== id);
    onUpdateOptions(updated);
  };

  const handleToggleAll = (active: boolean) => {
    const updated = options.map((opt) => ({ ...opt, isActive: active }));
    onUpdateOptions(updated);
  };

  const handleResetWeights = () => {
    const updated = options.map((opt) => ({ ...opt, weight: 1 }));
    onUpdateOptions(updated);
  };

  const handleShuffleColors = () => {
    const updated = options.map((opt, idx) => ({
      ...opt,
      color: PRESET_COLORS[(idx + Math.floor(Math.random() * PRESET_COLORS.length)) % PRESET_COLORS.length],
    }));
    onUpdateOptions(updated);
  };

  const activeCount = options.filter((o) => o.isActive).length;
  const totalWeight = options.filter((o) => o.isActive).reduce((acc, o) => acc + o.weight, 0);

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xs text-[#D4AF37] uppercase tracking-[0.2em] font-bold italic mb-1 flex items-center gap-1.5">
            ✦ 項目カスタマイズ CUSTOMIZE
          </h3>
          <p className="text-xs text-slate-400">
            有効な項目: <span className="font-bold text-[#D4AF37] font-mono">{activeCount}</span> / {options.length}個
            <span className="hidden sm:inline text-slate-500 ml-2">（※確率比率を直接入力または+/-で調整すると、当選確率%が自動計算されます）</span>
          </p>
        </div>

        {/* Quick bulk actions */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={isSpinning || options.length === 0}
            onClick={() => handleToggleAll(true)}
            className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold bg-[#0c0c0e]/80 hover:bg-[#1a1a1a] text-slate-300 rounded-lg border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            全て有効
          </button>
          <button
            type="button"
            disabled={isSpinning || options.length === 0}
            onClick={() => handleToggleAll(false)}
            className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold bg-[#0c0c0e]/80 hover:bg-[#1a1a1a] text-slate-300 rounded-lg border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            全て無効
          </button>
          <button
            type="button"
            disabled={isSpinning || options.length === 0}
            onClick={handleResetWeights}
            className="px-2 py-1.5 text-xs font-semibold bg-[#0c0c0e]/80 hover:bg-[#1a1a1a] text-slate-300 rounded-lg border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="全ての割合（確率）を 1 にリセット"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={isSpinning || options.length === 0}
            onClick={handleShuffleColors}
            className="px-2 py-1.5 text-xs font-semibold bg-[#0c0c0e]/80 hover:bg-[#1a1a1a] text-slate-300 rounded-lg border border-[#D4AF37]/15 hover:border-[#D4AF37]/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="色をシャッフル"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add Item Input Form */}
      <form onSubmit={handleAddOption} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          disabled={isSpinning}
          placeholder="新しい項目名を入力..."
          className="flex-1 px-4 py-3 bg-[#0c0c0e]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none transition-all duration-200"
        />
        <button
          type="submit"
          disabled={isSpinning || !newItemName.trim()}
          className="px-6 py-3 bg-[#D4AF37] hover:brightness-110 text-[#0c0c0e] font-serif-jp font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">追加</span>
        </button>
      </form>

      {/* Options List Container */}
      <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {options.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            項目がありません。上の入力欄から追加するか、プリセットを選択してください。
          </div>
        ) : (
          options.map((opt) => {
            // Calculate probability percentage
            const probability = opt.isActive && totalWeight > 0
              ? ((opt.weight / totalWeight) * 100).toFixed(1)
              : "0.0";

            return (
              <div
                key={opt.id}
                id={`option-row-${opt.id}`}
                className={`flex items-center gap-3 p-3 bg-[#0c0c0e]/50 hover:bg-[#121212] border rounded-xl transition-all duration-200 ${
                  opt.isActive ? "border-[#D4AF37]/15" : "border-[#D4AF37]/5 opacity-40"
                }`}
              >
                {/* Active Toggle Switch */}
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={() => handleUpdateOptionField(opt.id, "isActive", !opt.isActive)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    opt.isActive
                      ? "text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      : "text-slate-600 hover:bg-slate-800"
                  }`}
                  title={opt.isActive ? "無効にする" : "有効にする"}
                >
                  {opt.isActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>

                {/* Color Block Pick */}
                <div className="relative group/color w-7 h-7 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0 cursor-pointer">
                  <input
                    type="color"
                    value={opt.color}
                    disabled={isSpinning}
                    onChange={(e) => handleUpdateOptionField(opt.id, "color", e.target.value)}
                    className="absolute inset-0 w-full h-full p-0 border-0 scale-150 cursor-pointer bg-transparent"
                    title="色を変更"
                  />
                </div>

                {/* Editable Name Text */}
                <input
                  type="text"
                  value={opt.name}
                  disabled={isSpinning}
                  onChange={(e) => handleUpdateOptionField(opt.id, "name", e.target.value)}
                  className="flex-1 bg-transparent border-b border-transparent hover:border-slate-800 focus:border-[#D4AF37]/50 text-slate-200 text-sm py-0.5 px-1 focus:outline-none transition-all duration-200 font-medium"
                />

                {/* Weight Indicator and Controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                    確率比率
                  </span>
                  <div className="flex items-center bg-[#0c0c0e] border border-slate-800 rounded-lg px-1">
                    <button
                      type="button"
                      disabled={isSpinning || opt.weight <= 1}
                      onClick={() => handleUpdateOptionField(opt.id, "weight", Math.max(1, opt.weight - 1))}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-[#D4AF37] text-xs font-bold disabled:opacity-30"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      disabled={isSpinning}
                      value={opt.weight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          handleUpdateOptionField(opt.id, "weight", Math.max(1, Math.min(1000, val)));
                        } else {
                          handleUpdateOptionField(opt.id, "weight", 1);
                        }
                      }}
                      className="w-10 text-center text-xs font-extrabold text-slate-200 font-mono bg-transparent border-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      disabled={isSpinning || opt.weight >= 1000}
                      onClick={() => handleUpdateOptionField(opt.id, "weight", Math.min(1000, opt.weight + 1))}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-[#D4AF37] text-xs font-bold disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Calculated Probability Label */}
                <div className="w-14 text-right flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-[#D4AF37]">
                    {probability}%
                  </span>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={() => handleDeleteOption(opt.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="削除"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

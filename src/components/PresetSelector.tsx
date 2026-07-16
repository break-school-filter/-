import React from "react";
import { RoulettePreset, RouletteOption } from "../types";
import { Gift, Ghost, Utensils, Users, Dice6 } from "lucide-react";

interface PresetSelectorProps {
  onSelectPreset: (options: RouletteOption[]) => void;
}

const PRESET_OPTIONS: RoulettePreset[] = [
  {
    id: "lottery",
    name: "景品抽選会",
    description: "合宿のお楽しみ会やレク大会、ビンゴの景品抽選に！",
    icon: "Gift",
    options: [
      { id: "l-1", name: "✨ 特賞 (豪華景品)", weight: 1, color: "#f59e0b", isActive: true },
      { id: "l-2", name: "🥇 1等 (セレクトギフト)", weight: 3, color: "#f43f5e", isActive: true },
      { id: "l-3", name: "🥈 2等 (お菓子大袋)", weight: 8, color: "#3b82f6", isActive: true },
      { id: "l-4", name: "🥉 3等 (スナック菓子)", weight: 15, color: "#10b981", isActive: true },
      { id: "l-5", name: "💨 参加賞 (ポケットティッシュ)", weight: 35, color: "#64748b", isActive: true },
    ],
  },
  {
    id: "punishment",
    name: "👻 罰ゲーム",
    description: "合宿の夜レクやゲーム大会で盛り上がる罰ゲーム！",
    icon: "Ghost",
    options: [
      { id: "p-1", name: "全力モノマネ", weight: 1, color: "#a855f7", isActive: true },
      { id: "p-2", name: "全員にお茶を配る", weight: 1, color: "#ec4899", isActive: true },
      { id: "p-3", name: "初恋の思い出を暴露", weight: 1, color: "#f43f5e", isActive: true },
      { id: "p-4", name: "朝の目覚まし係（早起き）", weight: 1, color: "#eab308", isActive: true },
      { id: "p-5", name: "スクワット20回", weight: 1, color: "#14b8a6", isActive: true },
      { id: "p-6", name: "滑る覚悟で一発ギャグ", weight: 1, color: "#3b82f6", isActive: true },
    ],
  },
  {
    id: "camp_roles",
    name: "⛺ 合宿の役割分担",
    description: "朝食作りや夕食準備、片付け、掃除当番を決める",
    icon: "Utensils",
    options: [
      { id: "c-1", name: "朝食作り当番 🍳", weight: 1, color: "#f97316", isActive: true },
      { id: "c-2", name: "夕食準備当番 🍛", weight: 1, color: "#b45309", isActive: true },
      { id: "c-3", name: "後片付け・皿洗い 🧼", weight: 1, color: "#ec4899", isActive: true },
      { id: "c-4", name: "ゴミ出し・買い出し 🛒", weight: 1, color: "#8b5cf6", isActive: true },
      { id: "c-5", name: "お風呂掃除当番 🛀", weight: 1, color: "#f59e0b", isActive: true },
      { id: "c-6", name: "リーダー (全体指示) 👑", weight: 1, color: "#ef4444", isActive: true },
    ],
  },
  {
    id: "camp_rooms",
    name: "👥 部屋割り・班決め",
    description: "合宿のグループ、部屋、乗車席などを決める",
    icon: "Users",
    options: [
      { id: "r-1", name: "1班 (Aグループ)", weight: 1, color: "#ef4444", isActive: true },
      { id: "r-2", name: "2班 (Bグループ)", weight: 1, color: "#10b981", isActive: true },
      { id: "r-3", name: "3班 (Cグループ)", weight: 1, color: "#f59e0b", isActive: true },
      { id: "r-4", name: "4班 (Dグループ)", weight: 1, color: "#3b82f6", isActive: true },
      { id: "r-5", name: "5班 (Eグループ)", weight: 1, color: "#64748b", isActive: true },
      { id: "r-6", name: "6班 (Fグループ)", weight: 1, color: "#a855f7", isActive: true },
    ],
  },
  {
    id: "dice",
    name: "🎲 サイコロ",
    description: "夜のボードゲーム対決やレクゲームに使える1〜6の数字",
    icon: "Dice6",
    options: [
      { id: "d-1", name: "1", weight: 1, color: "#ef4444", isActive: true },
      { id: "d-2", name: "2", weight: 1, color: "#f97316", isActive: true },
      { id: "d-3", name: "3", weight: 1, color: "#3b82f6", isActive: true },
      { id: "d-4", name: "4", weight: 1, color: "#10b981", isActive: true },
      { id: "d-5", name: "5", weight: 1, color: "#a855f7", isActive: true },
      { id: "d-6", name: "6", weight: 1, color: "#ec4899", isActive: true },
    ],
  },
];

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelectPreset }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case "Gift":
        return <Gift className="w-5 h-5 text-amber-500" />;
      case "Ghost":
        return <Ghost className="w-5 h-5 text-purple-500" />;
      case "Utensils":
        return <Utensils className="w-5 h-5 text-orange-500" />;
      case "Users":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "Dice6":
        return <Dice6 className="w-5 h-5 text-rose-500" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xs text-[#D4AF37] uppercase tracking-[0.2em] mb-4 font-bold italic flex items-center gap-1.5 border-b border-[#D4AF37]/20 pb-2">
        <span>✦</span> クイックプリセット PRESETS
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PRESET_OPTIONS.map((preset) => (
          <button
            key={preset.id}
            id={`preset-${preset.id}`}
            onClick={() => onSelectPreset(preset.options)}
            className="glass-panel glass-panel-hover flex flex-col items-start p-4 rounded-xl text-left transition-all duration-300 group active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-[#0c0c0e]/60 rounded-lg group-hover:scale-110 transition-transform duration-200 border border-[#D4AF37]/10">
                {getIcon(preset.icon)}
              </span>
              <span className="font-bold text-slate-200 text-sm group-hover:text-[#D4AF37] transition-colors duration-200">
                {preset.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {preset.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

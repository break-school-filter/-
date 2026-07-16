import React, { useState } from "react";
import { SpinLog } from "../types";
import { Trash2, Search, Calendar, BarChart2 } from "lucide-react";

interface HistoryLogProps {
  logs: SpinLog[];
  onClearLogs: () => void;
  onRemoveLog: (id: string) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({
  logs,
  onClearLogs,
  onRemoveLog,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs.filter((log) =>
    log.optionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const totalSpins = logs.length;
  
  const drawCounts = logs.reduce((acc, log) => {
    acc[log.optionName] = (acc[log.optionName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedStats = Object.entries(drawCounts).sort((a, b) => (b[1] as number) - (a[1] as number));
  const mostDrawn = sortedStats[0] ? { name: sortedStats[0][0], count: sortedStats[0][1] } : null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xs text-[#D4AF37] uppercase tracking-[0.2em] font-bold italic mb-1 flex items-center gap-1.5">
            ✦ 履歴・スタッツ HISTORY
          </h3>
          <p className="text-xs text-slate-400">
            端末の保存領域に記憶された抽選データ
          </p>
        </div>
        
        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("これまでの抽選履歴をすべて消去しますか？")) {
                onClearLogs();
              }
            }}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-[#D4AF37]/15 hover:border-red-500/30 transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold"
            title="全ての履歴を消去"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">クリア</span>
          </button>
        )}
      </div>

      {/* Stats Quick Cards */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#0c0c0e]/50 border border-[#D4AF37]/15 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg border border-[#D4AF37]/10">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-[#D4AF37]/70 font-bold uppercase tracking-wider">総回転数</p>
              <p className="text-lg font-black text-slate-200 font-mono">{totalSpins}回</p>
            </div>
          </div>

          <div className="bg-[#0c0c0e]/50 border border-[#D4AF37]/15 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg border border-[#D4AF37]/10">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-[#D4AF37]/70 font-bold uppercase tracking-wider">最多当選</p>
              <p className="text-sm font-extrabold text-slate-200 truncate" title={mostDrawn?.name}>
                {mostDrawn ? `${mostDrawn.name} (${mostDrawn.count}回)` : "なし"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-slate-500" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="履歴を検索..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#0c0c0e]/80 border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 rounded-xl text-slate-300 placeholder-slate-600 text-xs focus:outline-none transition-all duration-200"
        />
      </div>

      {/* Logs Scroll List */}
      <div className="flex-1 max-h-[300px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            {searchQuery ? "一致するデータがありません。" : "履歴がまだありません。"}
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 bg-[#0c0c0e]/40 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 rounded-xl transition-all duration-150"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Visual bullet representing winner segment color */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                  style={{ backgroundColor: log.color }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">
                    {log.optionName}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {formatTime(log.timestamp)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRemoveLog(log.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                title="この記録を削除"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

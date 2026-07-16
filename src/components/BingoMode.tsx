import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Check, 
  HelpCircle,
  Hash,
  Activity,
  History,
  Grid
} from "lucide-react";
import { audioSynth } from "../utils/audio";
import { ConfettiGenerator } from "../utils/confetti";

interface BingoState {
  calledNumbers: number[];
  maxNumber: number; // 75 or 99
  soundEnabled: boolean;
  volume: number;
}

export const BingoMode: React.FC = () => {
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [maxNumber, setMaxNumber] = useState<number>(75);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentRollNumber, setCurrentRollNumber] = useState<number | null>(null);
  const [recentDrawn, setRecentDrawn] = useState<number | null>(null);
  const [autoDraw, setAutoDraw] = useState<boolean>(false);
  const [autoDrawInterval, setAutoDrawInterval] = useState<number>(3000); // 3 seconds

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiRef = useRef<ConfettiGenerator | null>(null);
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoDrawTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Confetti
  useEffect(() => {
    if (canvasRef.current) {
      confettiRef.current = new ConfettiGenerator(canvasRef.current);
    }
    return () => {
      if (confettiRef.current) {
        // any cleanup if needed
      }
    };
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("festival_bingo_state");
      if (saved) {
        const parsed = JSON.parse(saved) as BingoState;
        setCalledNumbers(parsed.calledNumbers || []);
        setMaxNumber(parsed.maxNumber || 75);
        setSoundEnabled(parsed.soundEnabled !== undefined ? parsed.soundEnabled : true);
      }
    } catch (e) {
      console.warn("Could not load bingo state from localStorage", e);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      const stateToSave: BingoState = {
        calledNumbers,
        maxNumber,
        soundEnabled,
        volume: 0.5
      };
      localStorage.setItem("festival_bingo_state", JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Could not save bingo state", e);
    }
  }, [calledNumbers, maxNumber, soundEnabled]);

  // Audio setup sync
  useEffect(() => {
    audioSynth.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
      if (autoDrawTimeoutRef.current) clearTimeout(autoDrawTimeoutRef.current);
    };
  }, []);

  // Get list of remaining numbers
  const getRemainingNumbers = (): number[] => {
    const all = Array.from({ length: maxNumber }, (_, i) => i + 1);
    return all.filter(n => !calledNumbers.includes(n));
  };

  // Trigger a bingo number draw
  const drawNumber = (isQuick: boolean = false) => {
    if (isRolling) return;

    const remaining = getRemainingNumbers();
    if (remaining.length === 0) {
      alert("すべての番号が引き出されました！");
      setAutoDraw(false);
      return;
    }

    if (isQuick) {
      // Instant Draw
      const finalIndex = Math.floor(Math.random() * remaining.length);
      const finalNum = remaining[finalIndex];

      setCalledNumbers(prev => [...prev, finalNum]);
      setRecentDrawn(finalNum);
      setCurrentRollNumber(finalNum);
      setIsRolling(false);

      // Play victory fanfare!
      audioSynth.playFanfare();

      // Confetti burst!
      if (confettiRef.current) {
        confettiRef.current.burst(150, `No.${finalNum}`);
        // trigger side showers shortly after
        setTimeout(() => {
          if (confettiRef.current) {
            confettiRef.current.sideShower(`No.${finalNum}`);
          }
        }, 350);
      }
      return;
    }

    setIsRolling(true);
    setCurrentRollNumber(null);

    let tickCount = 0;
    const totalTicks = 18; // Number of shuffling frames
    const tickInterval = 80; // Speed of shuffling

    // Play low rolling sound
    const drumroll = audioSynth.playDrumroll(totalTicks * tickInterval);

    rollIntervalRef.current = setInterval(() => {
      // Pick random number from remaining for the roll display
      const tempIndex = Math.floor(Math.random() * remaining.length);
      const tempNum = remaining[tempIndex];
      setCurrentRollNumber(tempNum);

      // Play tick sound for anticipation
      audioSynth.playTick();

      tickCount++;
      if (tickCount >= totalTicks) {
        // Stop rolling and select the actual final winner
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        if (drumroll) drumroll.stop();

        const finalIndex = Math.floor(Math.random() * remaining.length);
        const finalNum = remaining[finalIndex];

        setCalledNumbers(prev => [...prev, finalNum]);
        setRecentDrawn(finalNum);
        setCurrentRollNumber(finalNum);
        setIsRolling(false);

        // Play victory fanfare!
        audioSynth.playFanfare();

        // Confetti burst!
        if (confettiRef.current) {
          confettiRef.current.burst(150, `No.${finalNum}`);
          // trigger side showers shortly after
          setTimeout(() => {
            if (confettiRef.current) {
              confettiRef.current.sideShower(`No.${finalNum}`);
            }
          }, 350);
        }
      }
    }, tickInterval);
  };

  // Reset bingo game
  const resetGame = () => {
    if (window.confirm("ビンゴの盤面を初期化して新しくゲームを始めますか？")) {
      setCalledNumbers([]);
      setRecentDrawn(null);
      setCurrentRollNumber(null);
      setAutoDraw(false);
    }
  };

  // Manual toggle for adjustments (clicking board directly)
  const toggleNumberManual = (num: number) => {
    if (isRolling) return;
    if (calledNumbers.includes(num)) {
      if (window.confirm(`番号 ${num} 番の「当選」を取り消しますか？`)) {
        setCalledNumbers(prev => prev.filter(n => n !== num));
        if (recentDrawn === num) {
          setRecentDrawn(null);
        }
        if (currentRollNumber === num) {
          setCurrentRollNumber(null);
        }
      }
    } else {
      if (window.confirm(`番号 ${num} 番を「当選（手動）」にしますか？`)) {
        setCalledNumbers(prev => [...prev, num]);
        setRecentDrawn(num);
        setCurrentRollNumber(num);
        audioSynth.playTick();
      }
    }
  };

  // Handle auto-draw loops
  useEffect(() => {
    if (autoDraw && !isRolling) {
      const remaining = getRemainingNumbers();
      if (remaining.length === 0) {
        setAutoDraw(false);
        return;
      }
      autoDrawTimeoutRef.current = setTimeout(() => {
        drawNumber();
      }, autoDrawInterval);
    }
    return () => {
      if (autoDrawTimeoutRef.current) clearTimeout(autoDrawTimeoutRef.current);
    };
  }, [autoDraw, isRolling, calledNumbers]);

  const remainingCount = maxNumber - calledNumbers.length;

  // Bingo 75 categories (B-I-N-G-O) helper
  const getBingoCategory = (num: number): { label: string; color: string } => {
    if (maxNumber !== 75) return { label: "NUM", color: "border-[#D4AF37]/30 text-[#D4AF37]" };
    if (num <= 15) return { label: "B", color: "border-rose-500/30 text-rose-400 bg-rose-500/5" };
    if (num <= 30) return { label: "I", color: "border-blue-500/30 text-blue-400 bg-blue-500/5" };
    if (num <= 45) return { label: "N", color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" };
    if (num <= 60) return { label: "G", color: "border-amber-500/30 text-amber-400 bg-amber-500/5" };
    return { label: "O", color: "border-purple-500/30 text-purple-400 bg-purple-500/5" };
  };

  // Group numbers into lists for 5 columns B-I-N-G-O (1-15, 16-30, etc.)
  const render75Board = () => {
    const cols = [
      { name: "B", range: [1, 15] },
      { name: "I", range: [16, 30] },
      { name: "N", range: [31, 45] },
      { name: "G", range: [46, 60] },
      { name: "O", range: [61, 75] },
    ];

    return (
      <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full h-full">
        {cols.map((col) => {
          const numbers = Array.from(
            { length: col.range[1] - col.range[0] + 1 },
            (_, i) => col.range[0] + i
          );

          return (
            <div key={col.name} className="flex flex-col gap-1.5 sm:gap-2">
              <div className="text-center py-1 rounded-lg font-serif-jp font-black text-sm sm:text-base border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] tracking-wider shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                {col.name}
              </div>
              <div className="flex flex-col gap-1 sm:gap-1.5">
                {numbers.map((num) => {
                  const isCalled = calledNumbers.includes(num);
                  const isLatest = recentDrawn === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => toggleNumberManual(num)}
                      className={`w-full py-1.5 sm:py-2 px-1 text-xs sm:text-sm font-mono font-bold rounded-lg border transition-all duration-300 relative overflow-hidden flex items-center justify-center select-none ${
                        isCalled
                          ? isLatest
                            ? "bg-[#D4AF37] text-[#0c0c0e] border-[#FCF6BA] shadow-[0_0_12px_rgba(212,175,55,0.4)] z-10 scale-[1.05]"
                            : "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#FCF6BA]"
                          : "bg-[#0c0c0e]/40 border-slate-800/80 text-slate-500 hover:border-[#D4AF37]/30 hover:text-slate-300"
                      }`}
                    >
                      {num}
                      {isCalled && !isLatest && (
                        <div className="absolute top-0 right-0 w-2 h-2 rounded-bl bg-[#D4AF37]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Fallback board for 99 numbers, arranged in 10-wide grids
  const render99Board = () => {
    const numbers = Array.from({ length: 99 }, (_, i) => i + 1);
    return (
      <div className="grid grid-cols-10 gap-1.5 w-full h-full">
        {numbers.map((num) => {
          const isCalled = calledNumbers.includes(num);
          const isLatest = recentDrawn === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => toggleNumberManual(num)}
              className={`py-2 px-1 text-xs font-mono font-bold rounded border transition-all duration-300 relative flex items-center justify-center select-none ${
                isCalled
                  ? isLatest
                    ? "bg-[#D4AF37] text-[#0c0c0e] border-[#FCF6BA] shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-[1.08] z-10"
                    : "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#FCF6BA]"
                  : "bg-[#0c0c0e]/40 border-slate-800/80 text-slate-500 hover:border-[#D4AF37]/30 hover:text-slate-300"
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full relative">
      {/* Absolute Confetti Overlay inside local container */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-50 rounded-xl" />

      {/* LEFT COLUMN: Lottery Machine Display (Col 5) */}
      <div className="lg:col-span-5 glass-panel p-6 rounded-xl flex flex-col items-center justify-center min-h-[440px] sm:min-h-[500px] relative overflow-hidden">
        {/* Background ambient ring glow */}
        <div className="absolute w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full bg-[#D4AF37]/5 blur-3xl -z-10 pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-6 z-10">
          <span className="text-[10px] text-[#D4AF37] tracking-[0.3em] font-bold uppercase block mb-1">
            ✦ BINGO抽選マシン LOTTERY ✦
          </span>
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-sm font-serif-jp text-slate-300 font-bold">総数:</span>
            <div className="inline-flex rounded-md p-0.5 bg-[#0c0c0e] border border-[#D4AF37]/15">
              <button
                type="button"
                disabled={isRolling || calledNumbers.length > 0}
                onClick={() => setMaxNumber(75)}
                className={`px-3 py-0.5 text-xs font-bold rounded transition-all ${
                  maxNumber === 75 
                    ? "bg-[#D4AF37] text-[#0c0c0e]" 
                    : "text-slate-400 hover:text-slate-200"
                } disabled:opacity-50`}
              >
                75
              </button>
              <button
                type="button"
                disabled={isRolling || calledNumbers.length > 0}
                onClick={() => setMaxNumber(99)}
                className={`px-3 py-0.5 text-xs font-bold rounded transition-all ${
                  maxNumber === 99 
                    ? "bg-[#D4AF37] text-[#0c0c0e]" 
                    : "text-slate-400 hover:text-slate-200"
                } disabled:opacity-50`}
              >
                99
              </button>
            </div>
            <span className="text-xs text-slate-500 font-medium ml-1">（リセット時のみ変更可）</span>
          </div>
        </div>

        {/* Major Number Tumbler Circle */}
        <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] flex items-center justify-center select-none mb-6">
          {/* Glowing outer chassis */}
          <div className="absolute inset-0 rounded-full border-4 border-[#2a2a2a] shadow-[0_0_50px_rgba(0,0,0,0.8),_0_0_30px_rgba(212,175,55,0.15)] bg-[#121212] -z-1" />
          
          {/* Golden inner dash ring */}
          <div className={`absolute inset-3 rounded-full border border-dashed border-[#D4AF37]/25 -z-1 ${isRolling ? "animate-[spin_4s_linear_infinite]" : ""}`} />

          {/* Core display */}
          <div className="flex flex-col items-center justify-center text-center z-10 px-4">
            {currentRollNumber !== null ? (
              <div className="flex flex-col items-center">
                {/* Category initial label (e.g., B, I, N, G, O) */}
                {maxNumber === 75 && (
                  <span className={`text-xl sm:text-2xl font-serif-jp font-black tracking-widest px-4 py-0.5 rounded-full border mb-2 ${getBingoCategory(currentRollNumber).color}`}>
                    {getBingoCategory(currentRollNumber).label}
                  </span>
                )}
                {/* Huge Number */}
                <span className={`text-7xl sm:text-8xl font-mono font-black tracking-tighter transition-all ${
                  isRolling 
                    ? "text-slate-400 animate-pulse scale-95" 
                    : "gold-gradient-text drop-shadow-[0_4px_12px_rgba(212,175,55,0.3)] scale-100"
                }`}>
                  {currentRollNumber}
                </span>
                {!isRolling && (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 animate-pulse">
                    ✦ 当選 ✦
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <Hash className="w-12 h-12 text-[#D4AF37]/40 mb-3 animate-pulse" />
                <span className="text-sm font-serif-jp text-slate-400 font-medium">
                  READY
                </span>
                <span className="text-xs text-slate-600 mt-1">
                  「DRAW」を押して開始
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button & Settings */}
        <div className="w-full max-w-xs flex flex-col items-center gap-3 z-10">
          <div className="flex gap-2 w-full">
            <button
              type="button"
              disabled={isRolling || remainingCount === 0}
              onClick={() => drawNumber(false)}
              className={`flex-[2] py-4 rounded-full font-serif-jp font-bold text-base uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 ${
                isRolling || remainingCount === 0
                  ? "bg-[#1a1a1a] text-slate-600 border border-[#D4AF37]/20 cursor-not-allowed"
                  : "bg-[#D4AF37] hover:brightness-110 text-[#0c0c0e] border border-[#FCF6BA]/40 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
              }`}
            >
              {isRolling ? "SHUFFLING..." : "DRAW (通常)"}
            </button>

            <button
              type="button"
              disabled={isRolling || remainingCount === 0}
              onClick={() => drawNumber(true)}
              className={`flex-1 py-4 rounded-full font-serif-jp font-bold text-xs uppercase tracking-normal transition-all duration-300 active:scale-95 flex items-center justify-center gap-1 ${
                isRolling || remainingCount === 0
                  ? "bg-[#1a1a1a] text-slate-600 border border-slate-800 cursor-not-allowed"
                  : "bg-slate-800 hover:bg-slate-700 text-[#FCF6BA] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60"
              }`}
            >
              <span>⚡</span> 高速
            </button>
          </div>

          {/* Sub Row: Auto Mode Toggle, Sound Toggle */}
          <div className="flex items-center justify-between w-full border-t border-slate-800/60 pt-4 px-1 text-xs">
            {/* Auto Toggle */}
            <button
              type="button"
              onClick={() => setAutoDraw(!autoDraw)}
              disabled={remainingCount === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                autoDraw 
                  ? "bg-amber-500/10 border-amber-500 text-amber-400" 
                  : "bg-[#0c0c0e]/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-[#D4AF37]/20"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>自動: {autoDraw ? "ON" : "OFF"}</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                soundEnabled 
                  ? "bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]" 
                  : "bg-[#0c0c0e]/80 border-slate-800 text-slate-500 hover:text-slate-300"
              }`}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>サウンド: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>サウンド: OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Draws queue display at bottom of left column */}
        {calledNumbers.length > 0 && (
          <div className="w-full mt-6 pt-4 border-t border-slate-800/80 z-10 flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> 直近の履歴
            </span>
            <div className="flex items-center gap-2.5">
              {calledNumbers.slice(-4).reverse().map((num, i) => (
                <div 
                  key={num} 
                  className={`w-9 h-9 rounded-full border flex items-center justify-center font-mono font-bold text-xs ${
                    i === 0 
                      ? "bg-[#D4AF37] border-[#FCF6BA] text-[#0c0c0e] scale-110 shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                      : "bg-[#0c0c0e] border-slate-800 text-slate-300"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Bingo Board Grid (Col 7) */}
      <div className="lg:col-span-7 glass-panel p-5 sm:p-6 rounded-xl flex flex-col h-full min-h-[440px]">
        {/* Header / Stats */}
        <div className="flex justify-between items-start border-b border-[#D4AF37]/20 pb-4 mb-4 gap-4">
          <div>
            <h3 className="text-xs text-[#D4AF37] uppercase tracking-[0.2em] font-bold italic mb-1 flex items-center gap-1.5">
              ✦ ビンゴボード BINGO BOARD
            </h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
              <p>
                当選番号: <span className="font-bold text-[#D4AF37] font-mono">{calledNumbers.length}</span> / {maxNumber}
              </p>
              <p>
                残り: <span className="font-bold text-slate-300 font-mono">{remainingCount}</span>
              </p>
              <p>
                進捗率: <span className="font-bold text-slate-400 font-mono">{Math.round((calledNumbers.length / maxNumber) * 100)}%</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetGame}
            className="px-3 py-1.5 text-xs font-semibold bg-[#0c0c0e]/80 hover:bg-[#1a1a1a] text-slate-300 hover:text-red-400 rounded-lg border border-[#D4AF37]/15 hover:border-red-500/30 transition-all flex items-center gap-1 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            リセット
          </button>
        </div>

        {/* Core Grid Display */}
        <div className="flex-1 overflow-y-auto max-h-[450px] pr-1">
          {maxNumber === 75 ? render75Board() : render99Board()}
        </div>

        {/* Quick Tips */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>※ボードの数字を直接クリックすると、手動で当選状況を修正・追加できます。</span>
        </div>
      </div>
    </div>
  );
};

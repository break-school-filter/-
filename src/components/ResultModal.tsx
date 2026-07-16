import React, { useEffect, useRef } from "react";
import { RouletteOption } from "../types";
import { ConfettiGenerator } from "../utils/confetti";
import { X, Sparkles, AlertCircle } from "lucide-react";

interface ResultModalProps {
  winner: RouletteOption | null;
  onClose: () => void;
  onExcludeWinner: (id: string) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  winner,
  onClose,
  onExcludeWinner,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const generatorRef = useRef<ConfettiGenerator | null>(null);

  useEffect(() => {
    if (winner && canvasRef.current) {
      // Initialize confetti generator
      const gen = new ConfettiGenerator(canvasRef.current);
      generatorRef.current = gen;
      
      // Perform initial burst with winning item name
      gen.burst(160, winner.name);
      
      // Trigger side shower launchers after 450ms for continuous celebration with winning item name
      const sideTimer = setTimeout(() => {
        if (generatorRef.current) {
          generatorRef.current.sideShower(winner.name);
        }
      }, 450);

      // Trigger secondary burst after 1200ms with winning item name
      const burstTimer = setTimeout(() => {
        if (generatorRef.current) {
          generatorRef.current.burst(80, winner.name);
        }
      }, 1200);

      const handleResize = () => {
        if (generatorRef.current) {
          generatorRef.current.resize();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        clearTimeout(sideTimer);
        clearTimeout(burstTimer);
        window.removeEventListener("resize", handleResize);
        if (generatorRef.current) {
          generatorRef.current.stop();
        }
      };
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Confetti Canvas overlays the entire viewport inside modal container */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Modal Dialog Card */}
      <div 
        id="result-modal-card"
        className="relative bg-[#121212] border-2 border-[#D4AF37]/30 rounded-xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.2)] z-20 animate-scale-up"
      >
        {/* Colorful highlight bar */}
        <div 
          className="h-3 w-full" 
          style={{ backgroundColor: winner.color }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-[#0c0c0e]/80 hover:bg-[#1a1a1a] text-slate-400 hover:text-white border border-[#D4AF37]/10 rounded-full transition-colors z-30"
          title="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Content */}
        <div className="p-8 text-center flex flex-col items-center">
          <div className="inline-flex p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] rounded-full mb-4 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <p className="text-xs font-serif-jp font-bold tracking-[0.25em] text-[#D4AF37] uppercase mb-2">
            ✦ おめでとうございます CONGRATULATIONS ✦
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif-jp font-extrabold text-slate-100 tracking-wider leading-normal mb-6">
            抽選結果
          </h2>

          {/* Golden glow box holding winner's name */}
          <div 
            className="w-full py-8 px-6 rounded-xl flex items-center justify-center border-2 mb-8 select-all relative overflow-hidden group"
            style={{ 
              borderColor: `${winner.color}40`,
              backgroundColor: `${winner.color}10`,
              boxShadow: `0 8px 32px -4px ${winner.color}15`
            }}
          >
            {/* Pulsating back color flare */}
            <div 
              className="absolute inset-0 opacity-20 filter blur-xl transition-all duration-300 group-hover:scale-110" 
              style={{ backgroundColor: winner.color }}
            />
            
            <span 
              className="relative text-3xl sm:text-4xl font-serif-jp font-extrabold tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] leading-snug text-center break-all"
              style={{ color: winner.color }}
            >
              {winner.name}
            </span>
          </div>

          {/* Actions panel */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 bg-[#0c0c0e]/80 hover:bg-[#1a1a1a] text-[#D4AF37] border border-[#D4AF37]/30 font-serif-jp font-bold rounded-xl transition-all duration-200"
            >
              もう一度回す
            </button>
            <button
              onClick={() => onExcludeWinner(winner.id)}
              className="flex-1 py-3.5 bg-[#8B0000]/10 hover:bg-[#8B0000] text-red-400 hover:text-white border border-[#8B0000]/30 hover:border-transparent font-serif-jp font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              title="この項目をルーレットから一時的に外します（景品が無くなった時などに便利です）"
            >
              <AlertCircle className="w-5 h-5" />
              この項目を除外する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

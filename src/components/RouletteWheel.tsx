import React, { useRef, useState, useEffect } from "react";
import { RouletteOption } from "../types";
import { audioSynth } from "../utils/audio";

interface RouletteWheelProps {
  options: RouletteOption[];
  onSpinStart: () => void;
  onSpinEnd: (winner: RouletteOption) => void;
  isSpinning: boolean;
  spinDuration: number; // in seconds
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
  options,
  onSpinStart,
  onSpinEnd,
  isSpinning,
  spinDuration,
}) => {
  const activeOptions = options.filter((o) => o.isActive);
  const totalWeight = activeOptions.reduce((acc, o) => acc + o.weight, 0);

  const [rotation, setRotation] = useState(0);
  const [needleWiggle, setNeedleWiggle] = useState(false);
  const rotationRef = useRef(0);
  const isSpinningRef = useRef(false);
  const requestRef = useRef<number | null>(null);

  // Keep tracking the current active index to trigger sound on change
  const currentSegmentIndexRef = useRef<number>(-1);

  // Calculate angles for active options
  const segments = React.useMemo(() => {
    let currentAngle = 0;
    return activeOptions.map((option) => {
      const angleSpan = (option.weight / totalWeight) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angleSpan;
      currentAngle = endAngle;
      return {
        ...option,
        startAngle,
        endAngle,
      };
    });
  }, [activeOptions, totalWeight]);

  // Handle pointer index calculation
  const getIndexAtAngle = (angle: number): number => {
    // Needle is at the top (12 o'clock, which is our 0 degrees reference in polarToCartesian)
    // Absolute wheel rotation is normalized
    const normalizedRotation = (360 - (angle % 360)) % 360;
    
    const index = segments.findIndex(
      (seg) => normalizedRotation >= seg.startAngle && normalizedRotation < seg.endAngle
    );
    return index !== -1 ? index : 0;
  };

  // Spin function
  const spin = () => {
    if (isSpinning || activeOptions.length === 0) return;

    onSpinStart();
    isSpinningRef.current = true;

    // Start drumroll sound in background
    const drumroll = audioSynth.playDrumroll(spinDuration * 1000);

    const startRot = rotationRef.current % 360;
    // Aim for 5-8 full spins plus a random segment
    const extraSpins = 6 + Math.random() * 3;
    const targetRot = startRot + extraSpins * 360 + Math.random() * 360;
    const startTime = performance.now();

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const durationMs = spinDuration * 1000;

      if (elapsed >= durationMs) {
        // Spin finished
        setRotation(targetRot);
        rotationRef.current = targetRot;
        isSpinningRef.current = false;
        
        if (drumroll) drumroll.stop();

        // Determine winner
        const winningIndex = getIndexAtAngle(targetRot);
        const winner = segments[winningIndex];
        if (winner) {
          // Play winning fanfare
          audioSynth.playFanfare();
          onSpinEnd(winner);
        }
        return;
      }

      // Easing function (Cubic Deceleration)
      // progress from 0 to 1
      const p = elapsed / durationMs;
      // cubic ease out
      const easeOut = 1 - Math.pow(1 - p, 3);
      const currentRot = startRot + (targetRot - startRot) * easeOut;

      setRotation(currentRot);
      rotationRef.current = currentRot;

      // Click sound trigger: Check if pointer crossed a segment border
      const currentSegIndex = getIndexAtAngle(currentRot);
      if (currentSegIndex !== currentSegmentIndexRef.current) {
        currentSegmentIndexRef.current = currentSegIndex;
        audioSynth.playTick();
        
        // Brief pointer animation on cross
        setNeedleWiggle(true);
        setTimeout(() => setNeedleWiggle(false), 60);
      }

      if (isSpinningRef.current) {
        requestRef.current = requestAnimationFrame(animateSpin);
      }
    };

    requestRef.current = requestAnimationFrame(animateSpin);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Helpers to draw SVG paths for slices
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "Z"
    ].join(" ");
  };

  // Safe color generator for fallbacks
  const getOptionColor = (color: string, index: number) => {
    if (color) return color;
    const defaultColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
    return defaultColors[index % defaultColors.length];
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Glow effect behind wheel */}
      <div className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full bg-[#D4AF37]/10 blur-3xl -z-10 pointer-events-none" />

      {/* Main Wheel Container */}
      <div className="relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] flex items-center justify-center select-none">
        {/* Outer Festive Ring (LED / Bulb style for School Festivals) */}
        <div className="absolute inset-0 rounded-full border-8 border-[#2a2a2a] shadow-[0_0_50px_rgba(0,0,0,0.8),_0_0_30px_rgba(212,175,55,0.2)] bg-[#121212] -z-1" />

        {/* Outer decorative glowing dot rings */}
        <div className="absolute inset-2 rounded-full border-2 border-dashed border-[#D4AF37]/20 -z-1 animate-[spin_60s_linear_infinite]" />

        {/* SVG Wheel rendering */}
        {activeOptions.length === 0 ? (
          <div className="text-slate-400 font-serif-jp text-center px-6 py-12 border-2 border-dashed border-[#D4AF37]/20 rounded-full w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] flex items-center justify-center bg-black/40">
            有効な項目を2個以上追加してください。
          </div>
        ) : (
          <svg
            id="roulette-canvas"
            className="w-[270px] h-[270px] sm:w-[340px] sm:h-[340px] drop-shadow-[0_12px_20px_rgba(0,0,0,0.7)] cursor-pointer"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? "none" : "transform 0.1s ease-out",
            }}
            onClick={spin}
            viewBox="0 0 300 300"
          >
            {activeOptions.length === 1 ? (
              // Edge case: Only one active item fills the whole wheel
              <circle cx="150" cy="150" r="140" fill={getOptionColor(activeOptions[0].color, 0)} />
            ) : (
              // Standard slices
              segments.map((seg, idx) => {
                const pathData = describeArc(150, 150, 140, seg.startAngle, seg.endAngle);
                
                // Text position logic
                const middleAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
                // Move text towards outer rim, but keep legible
                const textPos = polarToCartesian(150, 150, 85, middleAngle);
                
                // Adjust text angle so it aligns radially towards the center
                // 90 deg rotation is added because SVG coordinates start pointing right
                const textRotation = middleAngle;

                return (
                  <g key={seg.id} className="transition-all duration-300">
                    <path
                      d={pathData}
                      fill={getOptionColor(seg.color, idx)}
                      stroke="#121212"
                      strokeWidth="2.5"
                      className="hover:brightness-110 transition-all duration-200"
                    />
                    {/* Radially written text */}
                    <text
                      x={textPos.x}
                      y={textPos.y}
                      transform={`rotate(${textRotation - 90}, ${textPos.x}, ${textPos.y})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      className="font-serif-jp font-bold text-[10px] sm:text-[11px] select-none tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                      style={{ maxWidth: "80px" }}
                    >
                      {seg.name.length > 8 ? `${seg.name.slice(0, 7)}…` : seg.name}
                    </text>
                  </g>
                );
              })
            )}

            {/* Hub design (center gold cap) */}
            <circle cx="150" cy="150" r="24" fill="#121212" stroke="#D4AF37" strokeWidth="3" />
            <circle cx="150" cy="150" r="16" fill="#D4AF37" />
            <path
              d="M 150 144 L 154 152 L 162 152 L 156 156 L 158 164 L 150 159 L 142 164 L 144 156 L 138 152 L 146 152 Z"
              fill="#121212"
            />
          </svg>
        )}

        {/* Physical Needle Indicator at the TOP */}
        <div
          className={`absolute top-0 -mt-5 left-1/2 -ml-4 w-8 h-10 z-20 origin-top transition-transform duration-75`}
          style={{
            transform: needleWiggle ? "rotate(-18deg) scaleY(0.95)" : "rotate(0deg)",
          }}
        >
          {/* Neon Pointer Pin */}
          <svg className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" viewBox="0 0 32 40">
            <path
              d="M16,40 L6,14 C2,8 6,0 16,0 C26,0 30,8 26,14 Z"
              fill="#D4AF37"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Embedded glowing ruby center */}
            <circle cx="16" cy="12" r="4" fill="#8B0000" />
          </svg>
        </div>
      </div>

      {/* Centered Trigger Button */}
      <div className="mt-8">
        <button
          id="spin-button"
          onClick={spin}
          disabled={isSpinning || activeOptions.length === 0}
          className={`px-16 py-4 rounded-full font-serif-jp font-bold text-xl uppercase tracking-[0.3em] transition-all duration-300 active:scale-95 ${
            isSpinning || activeOptions.length === 0
              ? "bg-[#1a1a1a] text-slate-600 border border-[#D4AF37]/20 cursor-not-allowed shadow-none"
              : "bg-[#D4AF37] hover:brightness-110 text-[#0c0c0e] border border-[#FCF6BA]/40 shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] animate-[pulse_2.5s_infinite]"
          }`}
        >
          {isSpinning ? "回転中" : "SPIN"}
        </button>
      </div>
    </div>
  );
};

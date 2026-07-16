export interface RouletteOption {
  id: string;
  name: string;
  weight: number; // Probability weight
  color: string;  // Hex color
  isActive: boolean;
}

export interface SpinLog {
  id: string;
  optionId: string;
  optionName: string;
  timestamp: number;
  color: string;
}

export interface RoulettePreset {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon name from lucide-react
  options: RouletteOption[];
}

export interface RouletteSettings {
  duration: number; // in seconds
  soundEnabled: boolean;
  volume: number; // 0 to 1
  removeWinnerAfterSpin: boolean;
}

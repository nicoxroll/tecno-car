import {
  Car,
  CheckCircle,
  ChevronDown,
  Coffee,
  Flame,
  Key,
  Lock,
  Music,
  Shield,
  Snowflake,
  Star,
  Tv,
  Wifi,
  Wind,
  Wrench
} from "lucide-react";
import React, { useState } from "react";

export const ICONS_MAP: Record<string, React.FC<any>> = {
  Wind: Wind,
  Coffee: Coffee,
  Wifi: Wifi,
  Tv: Tv,
  CheckCircle: CheckCircle,
  Car: Car,
  Key: Key,
  Lock: Lock,
  Music: Music,
  Shield: Shield,
  Snowflake: Snowflake,
  Star: Star,
  Wrench: Wrench,
  Flame: Flame,
};

export const AVAILABLE_ICONS = Object.keys(ICONS_MAP);

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = ICONS_MAP[value] || Star;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-8 w-14 justify-center bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded text-white transition-colors"
        title="Cambiar icono"
      >
        <Icon size={16} />
        <ChevronDown size={12} className="text-zinc-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-md shadow-2xl z-50 p-2">
            <div className="grid grid-cols-4 gap-1">
              {AVAILABLE_ICONS.map((iconKey) => {
                const ItemIcon = ICONS_MAP[iconKey];
                return (
                  <button
                    key={iconKey}
                    onClick={() => {
                      onChange(iconKey);
                      setIsOpen(false);
                    }}
                    className={`p-2 rounded hover:bg-black/50 transition-colors flex justify-center items-center ${
                      value === iconKey ? "bg-black text-white" : "text-zinc-400"
                    }`}
                    title={iconKey}
                  >
                    <ItemIcon size={18} />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IconPicker;

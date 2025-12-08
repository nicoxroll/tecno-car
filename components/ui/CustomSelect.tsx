import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Seleccionar", 
  className = "",
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`w-full bg-black border-b ${error ? 'border-red-500' : 'border-zinc-800'} text-white px-3 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors hover:border-zinc-600`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-white' : 'text-zinc-700'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-950 border border-zinc-800 shadow-2xl max-h-60 overflow-auto animate-fade-in custom-scrollbar">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors flex justify-between items-center ${
                option.value === value 
                  ? 'bg-zinc-900 text-white' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {option.value === value && <Check size={14} className="text-white" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

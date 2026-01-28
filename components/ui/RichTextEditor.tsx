import React, { useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  tagName?: "div" | "h1" | "h2" | "p" | "span";
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue,
  onChange,
  className = "",
  placeholder = "",
  tagName: Tag = "div",
}) => {
  const contentEditableRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
  });

  useEffect(() => {
    if (contentEditableRef.current) {
      // Init
      if (contentEditableRef.current.innerHTML !== initialValue) {
        contentEditableRef.current.innerHTML = initialValue;
      }
    }
  }, []);

  const updateActiveStyles = () => {
    setActiveStyles({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
    });
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    onChange(e.currentTarget.innerHTML);
    updateActiveStyles();
  };

  const handleKeyUp = () => {
    updateActiveStyles();
  };

  const handleMouseUp = () => {
    // Small timeout to let selection settle
    setTimeout(updateActiveStyles, 10);
  };

  const execCommand = (
    command: string,
    value: string | undefined = undefined,
  ) => {
    document.execCommand(command, false, value);
    if (contentEditableRef.current) {
      onChange(contentEditableRef.current.innerHTML);
      contentEditableRef.current.focus();
      updateActiveStyles();
    }
  };

  return (
    <div className="relative group inline-block w-full">
      {/* Floating Toolbar - Visible only when focused or hovering */}
      <div
        className={`absolute -top-12 left-0 flex gap-2 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg transition-all duration-300 z-50 ${isFocused ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}
      >
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand("bold");
          }}
          className={`w-8 h-8 flex items-center justify-center text-white rounded font-serif font-bold text-lg transition-colors ${activeStyles.bold ? "bg-white/40" : "hover:bg-white/20"}`}
          title="Negrita"
        >
          B
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand("italic");
          }}
          className={`w-8 h-8 flex items-center justify-center text-white rounded font-serif italic text-lg transition-colors ${activeStyles.italic ? "bg-white/40" : "hover:bg-white/20"}`}
          title="Cursiva"
        >
          I
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            execCommand("removeFormat");
          }}
          className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded text-xs"
          title="Limpiar Formato"
        >
          Tx
        </button>
      </div>

      <Tag
        ref={contentEditableRef as any}
        className={`outline-none min-h-[1em] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500 cursor-text ${className}`}
        contentEditable
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyUp={handleKeyUp}
        onMouseUp={handleMouseUp}
        onFocus={() => {
          setIsFocused(true);
          updateActiveStyles();
        }}
        onBlur={() => {
          // Small timeout to allow button clicks on toolbar to register before hiding
          setTimeout(() => setIsFocused(false), 200);
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;

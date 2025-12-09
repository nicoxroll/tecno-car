import React, { useEffect, useRef, useState } from "react";

interface AdminNavProps {
  activeTab:
    | "dashboard"
    | "sales"
    | "products"
    | "services"
    | "gallery"
    | "settings";
  setActiveTab: (
    tab:
      | "dashboard"
      | "sales"
      | "products"
      | "services"
      | "gallery"
      | "settings"
  ) => void;
}

const AdminNav: React.FC<AdminNavProps> = ({ activeTab, setActiveTab }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "sales", label: "Ventas" },
    { id: "products", label: "Productos" },
    { id: "services", label: "Servicios" },
    { id: "gallery", label: "Galería" },
    { id: "settings", label: "Configuración" },
  ];

  useEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    const currentTab = tabsRef.current[activeIndex];

    if (currentTab) {
      setIndicatorStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="relative flex gap-1 mb-8 border-b border-zinc-800 overflow-x-auto">
      {/* Sliding Background Indicator */}
      <div
        className="absolute bottom-0 top-0 bg-white transition-all duration-300 ease-in-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => (tabsRef.current[index] = el)}
          onClick={() => setActiveTab(tab.id as any)}
          className={`relative z-10 px-4 sm:px-6 py-3 text-xs sm:text-sm uppercase tracking-widest transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? "text-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminNav;

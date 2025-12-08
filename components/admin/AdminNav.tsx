import React from 'react';

interface AdminNavProps {
  activeTab: 'dashboard' | 'sales' | 'products' | 'services' | 'gallery' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'sales' | 'products' | 'services' | 'gallery' | 'settings') => void;
}

const AdminNav: React.FC<AdminNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-1 mb-8 border-b border-zinc-800 overflow-x-auto">
      {[
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'sales', label: 'Ventas' },
        { id: 'products', label: 'Productos' },
        { id: 'services', label: 'Servicios' },
        { id: 'gallery', label: 'Galería' },
        { id: 'settings', label: 'Configuración' },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`px-4 sm:px-6 py-3 text-xs sm:text-sm uppercase tracking-widest transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-white text-black border-b-2 border-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AdminNav;

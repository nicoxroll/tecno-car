import React from 'react';
import { PlayCircle, ShieldCheck, Wrench, Users } from 'lucide-react';

const Highlights: React.FC = () => {
  const highlights = [
    { id: '1', title: 'MULTIMEDIA', icon: <PlayCircle size={24} strokeWidth={1} />, href: '#service-multimedia' },
    { id: '2', title: 'POLARIZADOS', icon: <ShieldCheck size={24} strokeWidth={1} />, href: '#service-polarizados' },
    { id: '3', title: 'ACCESORIOS', icon: <Wrench size={24} strokeWidth={1} />, href: '#featured-products' },
    { id: '4', title: 'CLIENTES', icon: <Users size={24} strokeWidth={1} />, href: '#gallery' },
  ];

  return (
    <section className="bg-black border-y border-zinc-900 relative z-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center sm:justify-between items-center py-12 gap-8 md:gap-0">
            {highlights.map((item) => (
                <a 
                  key={item.id} 
                  href={item.href}
                  className="flex flex-col items-center gap-4 cursor-pointer group flex-1 min-w-[120px]"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 border border-zinc-800 bg-zinc-950 group-hover:bg-white group-hover:border-white transition-all duration-500 flex items-center justify-center text-zinc-400 group-hover:text-black rounded-none">
                        {item.icon}
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-zinc-500 group-hover:text-white transition-colors text-center">
                        {item.title}
                    </span>
                </a>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
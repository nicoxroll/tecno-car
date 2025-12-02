import React, { useEffect, useState } from 'react';
import { PlayCircle, ShieldCheck, Music, Users, ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const highlights = [
    { id: '1', title: 'MULTIMEDIA', icon: <PlayCircle size={20} strokeWidth={1} />, href: '#service-multimedia' },
    { id: '2', title: 'POLARIZADOS', icon: <ShieldCheck size={20} strokeWidth={1} />, href: '#service-polarizados' },
    { id: '3', title: 'AUDIO', icon: <Music size={20} strokeWidth={1} />, href: '#featured-products' },
    { id: '4', title: 'CLIENTES', icon: <Users size={20} strokeWidth={1} />, href: '#gallery' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      
      {/* Parallax Background Layer */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/60 z-10"></div> {/* Dark Overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black z-20"></div> {/* Gradient fade at bottom */}
        
        {/* Pexels Image - Modern Luxury Car Interior (Mercedes/Audi style) */}
        <img 
            src="https://images.pexels.com/photos/11194510/pexels-photo-11194510.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Automotive Technology Dashboard" 
            className="w-full h-full object-cover transition-transform duration-100 ease-out"
            style={{
                transform: `scale(${1 + scrollY * 0.0005}) translateY(${scrollY * 0.2}px)`, // Subtle zoom and slow scroll
                filter: 'grayscale(100%) contrast(110%) brightness(0.5)' // Monochrome look
            }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        
        {/* Profile/Brand Image - Minimalist */}
        <div className="mb-8 inline-block animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <div className="w-24 h-24 border border-zinc-500/50 bg-black/50 backdrop-blur-md flex items-center justify-center mx-auto">
                 <span className="text-4xl text-white font-thin">M</span>
            </div>
        </div>

        <h1 className="text-5xl md:text-8xl font-thin text-white mb-6 tracking-tight leading-none animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          MERLANO<br />
          <span className="text-zinc-400 font-extralight text-2xl md:text-5xl tracking-[0.2em] block mt-4">TECNOLOGÍA VEHICULAR</span>
        </h1>
        
        <div className="w-16 h-[1px] bg-white mx-auto mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}></div>

        <p className="text-zinc-300 font-light max-w-lg mx-auto mb-12 text-sm md:text-base leading-relaxed tracking-wide opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
          Especialistas en electrónica automotriz avanzada. <br/>Multimedia, seguridad y confort en Berisso.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 opacity-0 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <a href="#services" className="bg-white text-black text-xs md:text-sm font-medium py-4 px-12 tracking-[0.2em] uppercase hover:bg-zinc-200 transition-all border border-white inline-block">
                Ver Servicios
            </a>
            <a href="#contact" className="backdrop-blur-sm bg-black/30 text-white text-xs md:text-sm font-light py-4 px-12 tracking-[0.2em] uppercase border border-zinc-600 hover:border-white hover:bg-black/50 transition-all inline-block">
                Contactar
            </a>
        </div>
      </div>

      {/* Highlights (Sharp Squares) - Positioned at bottom as nav */}
      <div className="relative z-20 container mx-auto px-4 pb-12 mt-auto opacity-0 animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
        <div className="flex justify-center gap-4 md:gap-8 flex-wrap border-t border-zinc-800/50 pt-8 max-w-4xl mx-auto">
            {highlights.map((item) => (
                <a 
                  key={item.id} 
                  href={item.href}
                  className="flex flex-col items-center gap-3 cursor-pointer group min-w-[80px]"
                >
                    <div className="w-16 h-16 md:w-20 md:h-20 border border-zinc-700 bg-black/60 group-hover:bg-white group-hover:border-white transition-all duration-500 flex items-center justify-center text-zinc-400 group-hover:text-black">
                        {item.icon}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-medium text-zinc-400 group-hover:text-white transition-colors">
                        {item.title}
                    </span>
                </a>
            ))}
        </div>
        
        {/* Scroll Indicator */}
        <div className="flex flex-col items-center gap-2 opacity-60 animate-bounce mt-8">
            <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-400">Scroll</span>
            <ArrowDown className="text-white w-4 h-4" strokeWidth={1} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
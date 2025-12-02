import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'INICIO', href: '#home' },
    { name: 'SERVICIOS', href: '#services' },
    { name: 'GALERÍA', href: '#gallery' },
    { name: 'UBICACIÓN', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-black/90 border-b border-zinc-800 py-4 backdrop-blur-md' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 overflow-hidden border border-zinc-800 rounded-full bg-black">
                <img 
                    src="https://i.ibb.co/dJgTzQQP/merlano-modified.png" 
                    alt="Merlano Logo" 
                    className="w-full h-full object-cover filter hover:brightness-110 transition-all duration-500"
                />
            </div>
            <div className="flex flex-col">
              <span className="font-light text-xl leading-none tracking-tight text-white group-hover:text-zinc-300 transition-colors">MERLANO</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">Tecnología Vehicular</span>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-12">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-xs font-light tracking-[0.15em] text-zinc-400 hover:text-white transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white hover:text-zinc-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-zinc-800 animate-fade-in h-screen">
          <div className="flex flex-col pt-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-zinc-300 hover:text-white hover:bg-zinc-900 font-light text-sm tracking-widest py-6 px-8 block border-b border-zinc-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a 
              href="https://wa.me/5492213334444" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-black py-6 px-8 text-sm tracking-widest uppercase font-medium text-center hover:bg-zinc-200 transition-colors mt-8 mx-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              Enviar Mensaje
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
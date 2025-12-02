import React from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <section id="contact" className="py-24 bg-black border-t border-zinc-900 relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-zinc-800">
            
            {/* Info */}
            <div className="p-12 md:p-16 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950/30">
                <h2 className="text-4xl font-thin text-white mb-8 tracking-tight uppercase">Contacto</h2>
                <p className="text-zinc-400 font-light mb-12 max-w-md leading-relaxed">
                    Ubicados en el corazón de La Plata. Tecnología y precisión para tu vehículo.
                </p>

                <div className="space-y-12">
                    <div className="group">
                        <div className="flex items-center gap-3 mb-2 text-white">
                            <MapPin size={18} strokeWidth={1} />
                            <h3 className="text-xs font-medium uppercase tracking-[0.2em]">Dirección</h3>
                        </div>
                        <p className="text-zinc-500 font-light pl-8">Plaza Moreno (Referencia)<br/>La Plata, Buenos Aires</p>
                    </div>

                    <div className="group">
                         <div className="flex items-center gap-3 mb-2 text-white">
                            <Clock size={18} strokeWidth={1} />
                            <h3 className="text-xs font-medium uppercase tracking-[0.2em]">Horarios</h3>
                        </div>
                        <p className="text-zinc-500 font-light pl-8">Lunes a Viernes<br/>09:00 - 18:00 hs</p>
                    </div>

                    <div className="pt-8">
                        <a href="https://wa.me/5492213334444" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 text-white hover:text-zinc-300 transition-colors group">
                            <span className="text-lg font-light border-b border-white pb-1 group-hover:border-zinc-300">Iniciar Chat de WhatsApp</span>
                            <ArrowRight size={20} strokeWidth={1} className="group-hover:translate-x-2 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Map - Plaza Moreno with Dark Mode Filter */}
            <div className="relative min-h-[400px] bg-zinc-900 group overflow-hidden">
                 <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.783122530669!2d-57.95703768476206!3d-34.92145398037856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a2e62b1f0085a1%3A0xbcfc44f0547312e3!2sPlaza%20Moreno!5e0!3m2!1sen!2sar!4v1620000000000!5m2!1sen!2sar" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }} 
                    allowFullScreen={true} 
                    loading="lazy"
                    className="absolute inset-0 w-full h-full"
                    title="Mapa Plaza Moreno"
                 ></iframe>
                 
                 <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-t border-zinc-800 lg:border-t-0"></div>
            </div>
        </div>

        <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-widest text-zinc-600">
            <p>&copy; {new Date().getFullYear()} MERLANO TECNOLOGÍA VEHICULAR.</p>
            <div className="flex gap-8">
                <a href="#" className="hover:text-white transition-colors">Instagram</a>
                <a href="#" className="hover:text-white transition-colors">Facebook</a>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
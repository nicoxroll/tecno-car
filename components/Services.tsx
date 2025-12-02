import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const Services: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      id: 1,
      anchorId: "service-multimedia",
      category: "01 / MULTIMEDIA",
      title: "Sistemas Android & Apple",
      description: "Actualización tecnológica con pantallas de alta definición. Conectividad total con Android Auto y Apple CarPlay, GPS integrado y aplicaciones en tu tablero.",
      image: "https://images.pexels.com/photos/627678/pexels-photo-627678.jpeg?auto=compress&cs=tinysrgb&w=800" // Modern Tesla/Screen Interior
    },
    {
      id: 2,
      anchorId: "service-accesorios",
      category: "02 / ACCESORIOS",
      title: "Electrónica y Confort",
      description: "Sensores de estacionamiento, cámaras de retroceso y accesorios electrónicos que modernizan tu experiencia de conducción y aumentan la seguridad.",
      image: "https://images.pexels.com/photos/9966011/pexels-photo-9966011.jpeg?auto=compress&cs=tinysrgb&w=800" // Modern Interior Detail
    },
    {
      id: 3,
      anchorId: "service-polarizados",
      category: "03 / POLARIZADOS",
      title: "Protección Solar Tech",
      description: "Láminas de seguridad y control solar de alto rendimiento. Reducción de calor y protección UV con tecnología de vanguardia para el cuidado del interior.",
      image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800" // Dark Sleek BMW/Sports Car
    },
    {
      id: 4,
      anchorId: "service-climatizacion",
      category: "04 / CLIMATIZACIÓN",
      title: "Service de Aire",
      description: "Mantenimiento técnico de sistemas de refrigeración. Carga de gas, detección de fugas electrónica y reparación de compresores.",
      image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=800" // Dashboard Vents/Climate
    }
  ];

  useEffect(() => {
    // Fallback for browsers that don't support IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        setVisibleItems(services.map(s => s.id));
        return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute('data-id'));
            setVisibleItems((prev) => (prev.includes(id) ? prev : [...prev, id]));
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px" } // Increased threshold for a better trigger point
    );

    const elements = document.querySelectorAll('.service-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-32 bg-black relative z-20 overflow-hidden">
      {/* Central Line for Desktop */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-zinc-900 transform -translate-x-1/2 z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-thin text-white tracking-tight uppercase mb-4">Tecnología <span className="font-medium text-zinc-500">Aplicada</span></h2>
            <div className="w-12 h-[1px] bg-white mx-auto"></div>
        </div>

        <div className="space-y-24 md:space-y-0 relative">
            {services.map((service, index) => {
                const isEven = index % 2 === 0;
                const isVisible = visibleItems.includes(service.id);
                
                return (
                    <div 
                        key={service.id}
                        id={service.anchorId}
                        data-id={service.id}
                        // Used inline style for animation to force a smoother 1s duration
                        className={`service-item flex flex-col md:flex-row items-center gap-12 md:gap-0 scroll-mt-32 transition-opacity duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                        style={{ transition: 'opacity 1s ease-out, transform 1s ease-out' }}
                    >
                        {/* Image Side */}
                        <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 md:text-right order-1 md:order-1' : 'md:pl-16 order-1 md:order-2'}`}>
                            <div className="relative group overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[4/3]">
                                <img 
                                    src={service.image} 
                                    alt={service.title} 
                                    className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500"></div>
                            </div>
                        </div>

                        {/* Dot on Line - Centered */}
                        <div className="hidden md:flex absolute left-1/2 w-4 h-4 bg-black border border-zinc-500 z-10 items-center justify-center rounded-full transform -translate-x-1/2">
                            <div className={`w-2 h-2 bg-white rounded-full transition-all duration-700 delay-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
                        </div>

                        {/* Text Side */}
                        <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-16 order-2 md:order-2 text-left' : 'md:pr-16 order-2 md:order-1 md:text-right text-left'}`}>
                            <span className="text-[10px] text-zinc-500 tracking-[0.3em] font-medium block mb-4 border-l-2 border-white pl-3 md:border-l-0 md:pl-0">{service.category}</span>
                            <h3 className="text-3xl font-light text-white mb-6 leading-tight">{service.title}</h3>
                            <p className="text-zinc-400 font-light text-sm leading-relaxed mb-8 max-w-md ml-0 md:ml-auto md:mr-0 inline-block">
                                {service.description}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </section>
  );
};

export default Services;
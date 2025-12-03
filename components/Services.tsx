import React, { useEffect, useRef, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

const Services: React.FC = () => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      id: 1,
      anchorId: "service-multimedia",
      category: "01 / MULTIMEDIA",
      title: "Audio & Conectividad",
      description: "Venta e instalación de centrales multimedia originales y alternativas. Sistemas Android & Apple CarPlay, GPS integrado y actualización tecnológica para todo tipo de vehículos.",
      image: "https://images.pexels.com/photos/627678/pexels-photo-627678.jpeg?auto=compress&cs=tinysrgb&w=800",
      fullDescription: "Transformamos la experiencia de manejo integrando sistemas multimedia de última generación. Ofrecemos pantallas Tesla Style, interfaces CarPlay/Android Auto inalámbricas, y sistemas de audio de alta fidelidad. Compatible con mandos al volante y funciones originales del vehículo."
    },
    {
      id: 2,
      anchorId: "service-accesorios",
      category: "02 / ELECTRÓNICA INTEGRAL",
      title: "Diagnóstico & Electricidad",
      description: "Cerrajería integral (llaves codificadas), Inyección electrónica, Airbag y ABS. Electricidad general (alternadores y arranques), alza cristales, cierres centralizados, alarmas y baterías multimarca.",
      image: "https://images.pexels.com/photos/9966011/pexels-photo-9966011.jpeg?auto=compress&cs=tinysrgb&w=800",
      fullDescription: "Soluciones completas para la electrónica de tu auto. Desde duplicado de llaves codificadas hasta diagnóstico computarizado de fallas complejas. Reparamos alternadores, burros de arranque, sistemas de confort (levantavidrios, cierres) y seguridad (Airbag, ABS)."
    },
    {
      id: 3,
      anchorId: "service-polarizados",
      category: "03 / POLARIZADOS",
      title: "Protección Solar & Seguridad",
      description: "Servicio integral de polarizados vehicular y comercial. Láminas de seguridad antivandálicas y control solar de alto rendimiento para el cuidado del interior y confort térmico.",
      image: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800",
      fullDescription: "Trabajamos con láminas de primera calidad que garantizan protección UV, reducción de calor y seguridad ante roturas. Disponemos de tonos intermedios y oscuros, así como láminas transparentes de seguridad antivandálica."
    },
    {
      id: 4,
      anchorId: "service-climatizacion",
      category: "04 / CLIMATIZACIÓN PRO",
      title: "Aire Acondicionado & Calefacción",
      description: "Reparación integral de sistemas de A/A y calefacción. Servicio especializado para vehículos particulares, maquinaria vial, línea pesada, ómnibus y agrícola.",
      image: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg?auto=compress&cs=tinysrgb&w=800",
      fullDescription: "Mantenimiento y reparación experta de sistemas de climatización. Carga de gas, detección de fugas con UV, reparación de compresores y limpieza de circuitos. Atendemos flota pesada y maquinaria agrícola."
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
      { threshold: 0.1, rootMargin: "0px" }
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
                        className={`service-item flex flex-col md:flex-row items-center gap-12 md:gap-0 scroll-mt-32 opacity-0 translate-y-10 ${isVisible ? 'animate-fade-in opacity-100 translate-y-0' : ''}`}
                        style={{ animationDuration: '1s', animationFillMode: 'forwards' }}
                    >
                        {/* Image Side */}
                        <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 md:text-right order-1 md:order-1' : 'md:pl-16 order-1 md:order-2'}`}>
                            <div 
                                className="relative group overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[4/3] cursor-pointer"
                                onClick={() => setSelectedService(service)}
                            >
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
                            <p className="text-zinc-400 font-light text-sm leading-relaxed mb-8 max-w-lg ml-0 md:ml-auto md:mr-0 inline-block">
                                {service.description}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div 
            className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4 bg-black/90 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedService(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
             <button 
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 z-10 text-white bg-black/50 p-2 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <X size={20} strokeWidth={1} />
            </button>

            <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
                <img 
                    src={selectedService.image} 
                    alt={selectedService.title} 
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                <span className="text-[10px] text-zinc-500 tracking-[0.3em] font-medium uppercase mb-4">{selectedService.category}</span>
                <h3 className="text-2xl text-white font-light uppercase tracking-tight mb-6">{selectedService.title}</h3>
                <p className="text-zinc-400 font-light text-sm leading-relaxed mb-8">
                    {selectedService.fullDescription || selectedService.description}
                </p>
                <a 
                    href={`https://wa.me/5492213334444?text=Hola,%20me%20interesa%20consultar%20sobre%20el%20servicio%20de:%20${selectedService.title}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-white text-black py-4 px-6 text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors border border-white"
                >
                    <MessageCircle size={16} />
                    Consultar en WhatsApp
                </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
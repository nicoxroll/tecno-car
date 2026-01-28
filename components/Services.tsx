import { CircularProgress } from "@mui/material";
import { ArrowRight, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Service, ViewState } from "../types";
import { loadServices } from "../utils/dataLoader";

interface ServicesProps {
  onNavigate?: (view: ViewState) => void;
  onServiceSelect?: (service: Service) => void;
}

const Services: React.FC<ServicesProps> = ({ onServiceSelect }) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const servicesData = await loadServices();
        setServices(servicesData);
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // Fallback for browsers that don't support IntersectionObserver
    if (!("IntersectionObserver" in window)) {
      setVisibleItems(services.map((s) => s.id));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = Number(entry.target.getAttribute("data-id"));
            setVisibleItems((prev) =>
              prev.includes(id) ? prev : [...prev, id]
            );
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    const elements = document.querySelectorAll(".service-item");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [services]);

  if (loading) {
    return (
      <section className="py-32 bg-black flex items-center justify-center">
        <CircularProgress size={40} sx={{ color: "white" }} />
      </section>
    );
  }

  return (
    <section
      id="services"
      ref={sectionRef}
      className="py-16 bg-black relative z-20 overflow-hidden"
    >
      {/* Central Line for Desktop */}
      <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-zinc-900 transform -translate-x-1/2 z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-thin text-white tracking-tight uppercase mb-4">
            Tecnología <span className="font-thin text-zinc-400">Aplicada</span>
          </h2>
          <div className="w-12 h-[1px] bg-white mx-auto mb-8"></div>
          <p className="max-w-2xl mx-auto text-zinc-500 font-light text-sm uppercase tracking-widest">
            Soluciones integrales en <strong>Berisso</strong> y <strong>La Plata</strong>: 
            Llaves codificadas, polarizados, multimedia, aire acondicionado y estética vehicular.
          </p>
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
                className={`service-item flex flex-col md:flex-row items-center gap-12 md:gap-0 scroll-mt-32 opacity-0 translate-y-10 ${
                  isVisible ? "animate-fade-in opacity-100 translate-y-0" : ""
                }`}
                style={{
                  animationDuration: "1s",
                  animationFillMode: "forwards",
                }}
              >
                {/* Image Side */}
                <div
                  className={`w-full md:w-1/2 ${
                    isEven
                      ? "md:pr-16 md:text-right order-1 md:order-1"
                      : "md:pl-16 order-1 md:order-2"
                  }`}
                >
                  <div
                    className="relative group overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[4/3] cursor-pointer"
                    onClick={() => setSelectedService(service)}
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      loading="lazy"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500"></div>
                  </div>
                </div>

                {/* Dot on Line - Centered */}
                <div className="hidden md:flex absolute left-1/2 w-4 h-4 bg-black border border-zinc-500 z-10 items-center justify-center transform -translate-x-1/2 rounded-full">
                  <div
                    className={`w-2 h-2 bg-white rounded-full transition-all duration-700 delay-300 ${
                      isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                  ></div>
                </div>

                {/* Text Side */}
                <div
                  className={`w-full md:w-1/2 ${
                    isEven
                      ? "md:pl-16 order-2 md:order-2 text-left"
                      : "md:pr-16 order-2 md:order-1 md:text-right text-left"
                  }`}
                >
                  <span className="text-[10px] text-zinc-500 tracking-[0.3em] font-medium block mb-4 border-l-2 border-white pl-3 md:border-l-0 md:pl-0">
                    {service.category}
                  </span>
                  <h3 className="text-3xl font-light text-white mb-6 leading-tight">
                    {service.title}
                  </h3>
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
      {selectedService &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedService(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 z-10 text-white bg-black/50 p-2 hover:bg-white hover:text-black transition-all"
              >
                <X size={20} strokeWidth={1} />
              </button>

              <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                <span className="text-[10px] text-zinc-500 tracking-[0.3em] font-medium uppercase mb-4">
                  {selectedService.category}
                </span>
                <h3 className="text-2xl text-white font-light uppercase tracking-tight mb-6">
                  {selectedService.title}
                </h3>
                <p className="text-zinc-400 font-light text-sm leading-relaxed mb-8">
                  {selectedService.fullDescription ||
                    selectedService.description}
                </p>
                <button
                  onClick={() => {
                    if (onServiceSelect) {
                      onServiceSelect(selectedService);
                      setSelectedService(null);
                    }
                  }}
                  className="flex items-center justify-center gap-3 bg-white text-black py-4 px-6 text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors border border-white"
                >
                  <ArrowRight size={16} />
                  Más Información
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default Services;

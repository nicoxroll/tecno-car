import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, MessageCircle, Sparkles, CheckCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Service } from "../types";

interface ServiceDetailsProps {
  service: Service;
  onBack: () => void;
  onOpenChat?: (message: string) => void;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  service,
  onBack,
  onOpenChat,
}) => {
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Timeline modal functions
  const openTimelineModal = (index: number) => {
    setCurrentTimelineIndex(index);
    setTimelineModalOpen(true);
  };

  const closeTimelineModal = () => {
    setTimelineModalOpen(false);
  };

  const nextTimelineStep = () => {
    setCurrentTimelineIndex((prev) => (prev + 1) % timelineData.length);
  };

  const prevTimelineStep = () => {
    setCurrentTimelineIndex((prev) => (prev - 1 + timelineData.length) % timelineData.length);
  };

  // Keyboard navigation for timeline modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!timelineModalOpen) return;

      switch (e.key) {
        case 'Escape':
          closeTimelineModal();
          break;
        case 'ArrowRight':
          nextTimelineStep();
          break;
        case 'ArrowLeft':
          prevTimelineStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timelineModalOpen]);

  // Helper to get embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  // Default timeline data if none exists
  const timelineData =
    service.timeline && service.timeline.length > 0
      ? service.timeline
      : service.timeline_images && service.timeline_images.length > 0
      ? service.timeline_images.map((img, idx) => ({
          image: img,
          title: `Paso ${idx + 1}`,
          description: "Descripción del proceso en esta etapa.",
        }))
      : [
          {
            image:
              "https://images.pexels.com/photos/18045866/pexels-photo-18045866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            title: "Diagnóstico Inicial",
            description:
              "Evaluación completa del estado actual para determinar el mejor curso de acción.",
          },
          {
            image:
              "https://images.pexels.com/photos/10566895/pexels-photo-10566895.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            title: "Ejecución del Servicio",
            description:
              "Aplicación de técnicas especializadas con equipamiento de última generación.",
          },
          {
            image:
              "https://images.pexels.com/photos/25713617/pexels-photo-25713617.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
            title: "Control de Calidad",
            description:
              "Verificación exhaustiva de los resultados para garantizar la máxima satisfacción.",
          },
        ];

  return (
    <div className="min-h-screen bg-black animate-fade-in">
      {/* Hero Section - Full Screen */}
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="absolute top-20 left-6 z-20">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10">
          <div className="container mx-auto">
            <span className="inline-block bg-brand/80 backdrop-blur-md text-black text-xs font-bold px-3 py-1 uppercase tracking-widest border border-white/10 mb-6">
              {service.category}
            </span>
            <h1 className="text-4xl md:text-7xl font-thin text-white uppercase tracking-tight mb-4 max-w-4xl">
              {service.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-light text-white uppercase tracking-widest mb-8 flex items-center gap-4">
              <span className="w-8 h-[1px] bg-brand"></span>
              Descripción
            </h2>
            <div className="prose prose-invert prose-lg max-w-none mb-16">
              <p className="text-zinc-300 font-light leading-relaxed whitespace-pre-line text-lg">
                {service.fullDescription || service.description}
              </p>
            </div>

            {/* Timeline / Process Gallery */}
            <div className="mt-24">
              <h2 className="text-2xl font-light text-white uppercase tracking-widest mb-12 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-brand"></span>
                Proceso de Trabajo
              </h2>

              <div className="space-y-24 relative">
                {/* Vertical Line */}
                <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-zinc-800 transform md:-translate-x-1/2 ml-4 md:ml-0"></div>

                {timelineData.map((item, index) => (
                  <div
                    key={index}
                    className="relative flex flex-col md:flex-row gap-8 md:gap-0 items-center"
                  >
                    {/* Dot */}
                    <div className="absolute left-0 md:left-1/2 w-9 h-9 bg-black border border-zinc-700 rounded-full flex items-center justify-center transform md:-translate-x-1/2 z-10 ml-0 md:ml-0">
                      <div className="w-3 h-3 bg-brand rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div
                      className={`w-full md:w-1/2 pl-16 md:pl-0 ${
                        index % 2 === 0
                          ? "md:pr-16 md:text-right"
                          : "md:pl-16 md:order-2"
                      }`}
                    >
                      <div className="mb-4">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-2 block">
                          Paso 0{index + 1}
                        </span>
                        <h3 className="text-xl text-white font-light uppercase">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed hidden md:block">
                        {item.description}
                      </p>
                    </div>

                    {/* Image */}
                    <div
                      className={`w-full md:w-1/2 pl-16 md:pl-0 ${
                        index % 2 === 0
                          ? "md:pl-16 md:order-2"
                          : "md:pr-16 md:text-right md:order-1"
                      }`}
                    >
                      <div className="aspect-video overflow-hidden border border-zinc-800 bg-zinc-900 relative group cursor-pointer" onClick={() => openTimelineModal(index)}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed mt-4 md:hidden">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Section */}
            {service.video_url && (
              <div className="mt-24">
                <h2 className="text-2xl font-light text-white uppercase tracking-widest mb-12 flex items-center gap-4">
                  <span className="w-8 h-[1px] bg-brand"></span>
                  Video Demostrativo
                </h2>
                <div className="aspect-video w-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <iframe
                    src={getEmbedUrl(service.video_url) || ""}
                    title={service.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / CTA */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-black border border-zinc-800 p-8">
              <h3 className="text-xl text-white font-light uppercase tracking-wide mb-6">
                ¿Interesado en este servicio?
              </h3>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                Contáctanos para obtener más información, presupuestos
                personalizados o agendar una cita.
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() =>
                    onOpenChat &&
                    onOpenChat(
                      `Quiero saber más sobre el servicio: ${service.title}`
                    )
                  }
                  className="w-full border border-zinc-700 bg-zinc-800/50 text-white py-4 uppercase tracking-[0.2em] text-[10px] font-medium hover:bg-brand hover:border-brand hover:text-black transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles
                    size={16}
                    className="text-brand group-hover:text-black transition-colors"
                  />
                  Consultar con IA
                </button>
                <a
                  href={`https://wa.me/5492213334444?text=Hola,%20me%20interesa%20saber%20m%C3%A1s%20sobre%20el%20servicio:%20${service.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-zinc-700 bg-zinc-800/50 text-white py-4 px-6 uppercase tracking-[0.2em] text-[10px] font-medium hover:bg-[#25D366] hover:border-[#25D366] transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle size={16} />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-800">
                <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-wider mb-2">
                  <CheckCircle size={14} className="text-brand" />
                  <span>Garantía de Calidad</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-500 text-xs uppercase tracking-wider">
                  <CheckCircle size={14} className="text-brand" />
                  <span>Atención Personalizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Modal */}
      {timelineModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-20 p-4 bg-black/90 backdrop-blur-md animate-fade-in"
            onClick={closeTimelineModal}
          >
            <div
              className="relative max-w-5xl w-full max-h-[90vh] bg-zinc-950 border border-zinc-800 flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeTimelineModal}
                className="absolute -top-12 right-0 text-white hover:text-zinc-300 transition-colors flex items-center gap-2"
              >
                <span className="text-xs tracking-widest uppercase">
                  Cerrar
                </span>
                <X size={24} strokeWidth={1} />
              </button>

              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden border-b border-zinc-900 group">
                <img
                  src={timelineData[currentTimelineIndex].image}
                  alt={timelineData[currentTimelineIndex].title}
                  className="max-h-[70vh] w-auto object-contain"
                />

                {/* Navigation Arrows */}
                {timelineData.length > 1 && (
                  <>
                    <button
                      onClick={prevTimelineStep}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-2 border border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft size={24} strokeWidth={1} />
                    </button>

                    <button
                      onClick={nextTimelineStep}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-2 border border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={24} strokeWidth={1} />
                    </button>
                  </>
                )}
              </div>

              <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-950">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-brand text-xs font-bold tracking-widest uppercase">
                      Paso 0{currentTimelineIndex + 1}
                    </span>
                    {timelineData.length > 1 && (
                      <span className="text-zinc-500 text-xs">
                        {currentTimelineIndex + 1} / {timelineData.length}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl text-white font-light tracking-[0.2em] uppercase">
                    {timelineData[currentTimelineIndex].title}
                  </h3>
                  <p className="text-zinc-400 text-sm font-light max-w-2xl">
                    {timelineData[currentTimelineIndex].description}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ServiceDetails;

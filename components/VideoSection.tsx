import React from 'react';

const VideoSection: React.FC = () => {
  return (
    <section className="py-40 px-8 bg-black overflow-hidden relative z-20 border-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
          <div className="space-y-8 lg:col-span-1">
            <span className="text-brand uppercase tracking-[0.5em] font-bold text-sm block">Servicio Especializado</span>
            <h2 className="text-4xl md:text-6xl text-white font-bold leading-none tracking-tighter">Llaves de <br/> <span className="italic font-light">Autos</span></h2>
            <p className="text-xl text-zinc-400 leading-relaxed font-light italic">
              "Duplica tus llaves codificadas con precisión y seguridad."
            </p>
            <p className="text-base text-zinc-300 leading-relaxed">
              Ofrecemos servicio de cerrajería integral para todo tipo de vehículos, incluyendo llaves inteligentes, transpondedores y sistemas de inmovilización. Tecnología avanzada para la duplicación y programación de llaves modernas.
            </p>
          </div>
          <div className="relative lg:col-span-2">
            <div className="aspect-[2/1] w-full rounded-[2rem] overflow-hidden shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/llave.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
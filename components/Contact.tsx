import React, { useEffect, useState } from "react";
import { MapPin, Clock, ArrowRight, Phone } from "lucide-react";
import { supabase } from "../services/supabase";

const Contact: React.FC = () => {
  const [phone, setPhone] = useState("+54 221 333 4444");

  useEffect(() => {
    const fetchContactInfo = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "company_phone")
        .single();

      if (data?.value) {
        setPhone(data.value);
      }
    };
    fetchContactInfo();
  }, []);

  return (
    <section
      id="contact"
      className="py-24 bg-black border-t border-zinc-900 relative z-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-zinc-800">
          {/* Info */}
          <div className="p-12 md:p-16 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-950/30">
            <h2 className="text-4xl font-thin text-white mb-8 tracking-tight uppercase">
              Contacto
            </h2>
            <p className="text-zinc-400 font-light mb-12 max-w-md leading-relaxed">
              Ubicados en el corazón de La Plata. Tecnología y precisión para tu
              vehículo.
            </p>

            <div className="space-y-12">
              <div className="group">
                <div className="flex items-center gap-3 mb-2 text-white">
                  <MapPin size={18} strokeWidth={1} />
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em]">
                    Dirección
                  </h3>
                </div>
                <p className="text-zinc-500 font-light pl-8">
                  Plaza Moreno (Referencia)
                  <br />
                  La Plata, Buenos Aires
                </p>
              </div>

              <div className="group">
                <div className="flex items-center gap-3 mb-2 text-white">
                  <Phone size={18} strokeWidth={1} />
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em]">
                    Teléfono
                  </h3>
                </div>
                <p className="text-zinc-500 font-light pl-8">{phone}</p>
              </div>

              <div className="group">
                <div className="flex items-center gap-3 mb-2 text-white">
                  <Clock size={18} strokeWidth={1} />
                  <h3 className="text-xs font-medium uppercase tracking-[0.2em]">
                    Horarios
                  </h3>
                </div>
                <p className="text-zinc-500 font-light pl-8">
                  Lunes a Viernes
                  <br />
                  09:00 - 18:00 hs
                </p>
              </div>

              <div className="pt-8">
                <a
                  href="https://wa.me/5492213334444"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 text-white hover:text-zinc-300 transition-colors group"
                >
                  <span className="text-lg font-light border-b border-white pb-1 group-hover:border-zinc-300">
                    Iniciar Chat de WhatsApp
                  </span>
                  <ArrowRight
                    size={20}
                    strokeWidth={1}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Map - Plaza Moreno with Dark Mode Filter */}
          <div className="relative min-h-[400px] bg-zinc-900 group overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.783122530669!2d-57.95703768476206!3d-34.92145398037856!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a2e62b1f0085a1%3A0xbcfc44f0547312e3!2sPlaza%20Moreno!5e0!3m2!1sen!2sar!4v1620000000000!5m2!1sen!2sar&markers=color:0x000000%7C-34.92145,-57.95703"
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: "grayscale(100%) invert(92%) contrast(83%)",
              }}
              allowFullScreen={true}
              loading="lazy"
              className="absolute inset-0 w-full h-full"
              title="Mapa Plaza Moreno"
            ></iframe>

            {/* Custom Marker with Logo */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white/20 backdrop-blur-sm p-2 shadow-lg border border-zinc-300 rounded-full">
                <svg
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24pt"
                  height="24pt"
                  viewBox="0 0 109.000000 109.000000"
                  preserveAspectRatio="xMidYMid meet"
                  className="text-black"
                >
                  <g transform="translate(0.000000,109.000000) scale(0.100000,-0.100000)">
                    <path d="M416 1074 c-334 -81 -513 -465 -358 -770 168 -332 595 -406 862 -148 224 216 225 561 1 777 -138 133 -323 185 -505 141z m-59 -363 c80 -80 118 -101 188 -101 70 0 108 21 186 100 121 125 139 104 139 -164 0 -185 -8 -218 -50 -224 -41 -6 -50 20 -50 146 l0 114 -39 -31 c-120 -96 -263 -94 -378 3 l-33 28 0 -113 c0 -119 -10 -149 -51 -149 -42 0 -49 34 -49 227 0 188 6 228 37 236 10 3 19 5 20 6 1 0 37 -35 80 -78z m218 -295 c37 -27 15 -106 -30 -106 -25 0 -48 28 -48 58 0 55 37 78 78 48z" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-t border-zinc-800 lg:border-t-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

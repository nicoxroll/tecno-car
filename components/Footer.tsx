import React, { useState, useEffect } from "react";
import { useScroll } from "../context/ScrollContext";
import { supabase } from "../services/supabase";
import { Instagram, Facebook } from "lucide-react";

const Footer: React.FC = () => {
  const { scrollTo } = useScroll();
  const [developedBy, setDevelopedBy] = useState("Desarrollado por Arise");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "https://instagram.com/merlanotecnologiavehicular",
    facebook: "https://facebook.com/merlanotecnologiavehicular",
  });

  useEffect(() => {
    const fetchFooterConfig = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("key, value")
        .in("key", [
          "footer_developed_by",
          "social_instagram",
          "social_facebook",
        ]);

      if (data) {
        data.forEach((item) => {
          if (item.key === "footer_developed_by") setDevelopedBy(item.value);
          if (item.key === "social_instagram")
            setSocialLinks((prev) => ({ ...prev, instagram: item.value }));
          if (item.key === "social_facebook")
            setSocialLinks((prev) => ({ ...prev, facebook: item.value }));
        });
      }
    };
    fetchFooterConfig();
  }, []);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollTo(href);
  };

  return (
    <footer className="relative bg-black border-t border-zinc-900 py-16 overflow-hidden z-[50]">
      {/* Watermark Logo - Top */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="200pt"
          height="200pt"
          viewBox="0 0 109.000000 109.000000"
          preserveAspectRatio="xMidYMid meet"
          className="text-zinc-600"
        >
          <g transform="translate(0.000000,109.000000) scale(0.100000,-0.100000)">
            <path d="M416 1074 c-334 -81 -513 -465 -358 -770 168 -332 595 -406 862 -148 224 216 225 561 1 777 -138 133 -323 185 -505 141z m-59 -363 c80 -80 118 -101 188 -101 70 0 108 21 186 100 121 125 139 104 139 -164 0 -185 -8 -218 -50 -224 -41 -6 -50 20 -50 146 l0 114 -39 -31 c-120 -96 -263 -94 -378 3 l-33 28 0 -113 c0 -119 -10 -149 -51 -149 -42 0 -49 34 -49 227 0 188 6 228 37 236 10 3 19 5 20 6 1 0 37 -35 80 -78z m218 -295 c37 -27 15 -106 -30 -106 -25 0 -48 28 -48 58 0 55 37 78 78 48z" />
          </g>
        </svg>
      </div>

      {/* Watermark Logo - Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none opacity-10">
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          width="100pt"
          height="100pt"
          viewBox="0 0 109.000000 109.000000"
          preserveAspectRatio="xMidYMid meet"
          className="text-zinc-600"
        >
          <g transform="translate(0.000000,109.000000) scale(0.100000,-0.100000)">
            <path d="M416 1074 c-334 -81 -513 -465 -358 -770 168 -332 595 -406 862 -148 224 216 225 561 1 777 -138 133 -323 185 -505 141z m-59 -363 c80 -80 118 -101 188 -101 70 0 108 21 186 100 121 125 139 104 139 -164 0 -185 -8 -218 -50 -224 -41 -6 -50 20 -50 146 l0 114 -39 -31 c-120 -96 -263 -94 -378 3 l-33 28 0 -113 c0 -119 -10 -149 -51 -149 -42 0 -49 34 -49 227 0 188 6 228 37 236 10 3 19 5 20 6 1 0 37 -35 80 -78z m218 -295 c37 -27 15 -106 -30 -106 -25 0 -48 28 -48 58 0 55 37 78 78 48z" />
          </g>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-light text-white mb-4 uppercase tracking-widest">
              Merlano Tecnología Vehicular
            </h3>
            <div className="text-zinc-500 text-xs mb-6">
              <p>Lunes a Viernes: 09:00 - 18:00</p>
              <p>Calle 7 #4143 e 163 y 164, Berisso</p>
            </div>
            <div className="flex items-center gap-6">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <Instagram size={20} strokeWidth={1} />
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <Facebook size={20} strokeWidth={1} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white text-sm uppercase tracking-widest mb-4">
              Servicios
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={(e) => handleLinkClick(e, "#services")}
                  className="text-zinc-400 hover:text-white text-sm transition-colors text-left"
                >
                  Multimedia
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick(e, "#services")}
                  className="text-zinc-400 hover:text-white text-sm transition-colors text-left"
                >
                  Cerrajería
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick(e, "#services")}
                  className="text-zinc-400 hover:text-white text-sm transition-colors text-left"
                >
                  Electrónica
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick(e, "#services")}
                  className="text-zinc-400 hover:text-white text-sm transition-colors text-left"
                >
                  Seguridad
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm uppercase tracking-widest mb-4">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={(e) => handleLinkClick(e, "#home")}
                  className="text-zinc-400 hover:text-white text-sm transition-colors text-left"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick(e, "#services")}
                  className="text-zinc-400 hover:text-white text-sm transition-colors text-left"
                >
                  Servicios
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick(e, "#gallery")}
                  className="text-zinc-400 hover:text-white text-sm transition-colors text-left"
                >
                  Galería
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => handleLinkClick(e, "#contact")}
                  className="text-zinc-400 hover:text-white text-sm transition-colors text-left"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-zinc-800 pt-8 flex justify-center items-center">
          <div className="flex items-center gap-2">
            <svg
              version="1.0"
              xmlns="http://www.w3.org/2000/svg"
              width="16pt"
              height="16pt"
              viewBox="0 0 109.000000 109.000000"
              preserveAspectRatio="xMidYMid meet"
              className="text-zinc-600 opacity-50"
            >
              <g transform="translate(0.000000,109.000000) scale(0.100000,-0.100000)">
                <path d="M416 1074 c-334 -81 -513 -465 -358 -770 168 -332 595 -406 862 -148 224 216 225 561 1 777 -138 133 -323 185 -505 141z m-59 -363 c80 -80 118 -101 188 -101 70 0 108 21 186 100 121 125 139 104 139 -164 0 -185 -8 -218 -50 -224 -41 -6 -50 20 -50 146 l0 114 -39 -31 c-120 -96 -263 -94 -378 3 l-33 28 0 -113 c0 -119 -10 -149 -51 -149 -42 0 -49 34 -49 227 0 188 6 228 37 236 10 3 19 5 20 6 1 0 37 -35 80 -78z m218 -295 c37 -27 15 -106 -30 -106 -25 0 -48 28 -48 58 0 55 37 78 78 48z" />
              </g>
            </svg>
            <span className="text-zinc-600 text-[10px] uppercase tracking-widest">
              {developedBy}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

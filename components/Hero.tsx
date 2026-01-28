import React, { useEffect, useState } from "react";
import { useScroll } from "../context/ScrollContext";
import { supabase } from "../services/supabase";
import { ImageWithLoader } from "./ui/ImageWithLoader";

const Hero: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const { scrollTo } = useScroll();
  const [heroImage, setHeroImage] = useState(
    "https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg?auto=compress&cs=tinysrgb&w=1600"
  );
  const [heroTitle, setHeroTitle] = useState("MERLANO");
  const [heroSubtitle, setHeroSubtitle] = useState("TECNOLOGÍA VEHICULAR");
  const [heroDescription, setHeroDescription] = useState(
    "Especialistas en electrónica automotriz avanzada. Multimedia, seguridad y confort en Berisso."
  );

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("key, value")
        .in("key", [
          "main_hero_image",
          "main_hero_title",
          "main_hero_subtitle",
          "main_hero_description",
        ]);

      if (data) {
        data.forEach((item) => {
          if (item.key === "main_hero_image") setHeroImage(item.value);
          if (item.key === "main_hero_title") setHeroTitle(item.value);
          if (item.key === "main_hero_subtitle") setHeroSubtitle(item.value);
          if (item.key === "main_hero_description")
            setHeroDescription(item.value);
        });
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollTo(href);
  };

  return (
    <section
      id="home"
      className="relative h-screen flex flex-col justify-center items-center overflow-hidden"
    >
      {/* Parallax Background Layer */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/60 z-10"></div>{" "}
        {/* Dark Overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black z-20"></div>{" "}
        {/* Gradient fade at bottom */}
        {/* Pexels Image - Requested Image */}
        <ImageWithLoader
          src={heroImage}
          alt="Automotive Technology Dashboard"
          crossOrigin="anonymous"
          containerClassName="w-full h-full"
          className="w-full h-full object-cover transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${1 + scrollY * 0.0005}) translateY(${
              scrollY * 0.2
            }px)`, // Subtle zoom and slow scroll
            filter: "grayscale(100%) contrast(110%) brightness(0.5)", // Monochrome look
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center h-full">
        {/* Profile/Brand Image - Minimalist */}
        <div
          className="mb-8 animate-fade-in opacity-0"
          style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        >
          <div className="w-24 h-24 border border-zinc-500/50 bg-black/50 backdrop-blur-md flex items-center justify-center mx-auto overflow-hidden p-2 rounded-full">
            <img
              src="https://i.ibb.co/dJgTzQQP/merlano-modified.png"
              alt="Merlano Logo"
              className="w-full h-full object-contain filter grayscale"
            />
          </div>
        </div>

        <h1
          className="text-5xl md:text-8xl font-thin text-white mb-6 tracking-tight leading-none animate-fade-in opacity-0"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          {heroTitle}
          <br />
          <span className="text-zinc-400 font-extralight text-2xl md:text-5xl tracking-[0.2em] block mt-4">
            {heroSubtitle}
          </span>
        </h1>

        <div
          className="w-16 h-[1px] bg-white mx-auto mb-8 opacity-0 animate-fade-in"
          style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
        ></div>

        <div
          className="text-zinc-300 font-light max-w-lg mx-auto mb-12 text-sm md:text-base leading-relaxed tracking-wide opacity-0 animate-fade-in"
          style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
          dangerouslySetInnerHTML={{ __html: heroDescription }}
        ></div>

        <div
          className="flex flex-col sm:flex-row justify-center gap-4 opacity-0 animate-fade-in"
          style={{ animationDelay: "1s", animationFillMode: "forwards" }}
        >
          <a
            href="#services"
            onClick={(e) => handleClick(e, "#services")}
            className="bg-white text-black text-xs md:text-sm font-medium py-4 px-12 tracking-[0.2em] uppercase hover:bg-zinc-200 transition-all border border-white inline-block"
          >
            Ver Servicios
          </a>
          <a
            href="#contact"
            onClick={(e) => handleClick(e, "#contact")}
            className="backdrop-blur-sm bg-black/30 text-white text-xs md:text-sm font-light py-4 px-12 tracking-[0.2em] uppercase border border-zinc-600 hover:border-white hover:bg-black/50 transition-all inline-block"
          >
            Contactar
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;

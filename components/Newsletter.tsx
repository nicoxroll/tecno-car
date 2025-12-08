import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="relative py-32 z-20 w-full">
      {/* Background Image using standard bg-fixed for parallax */}
      <div
        className="absolute inset-0 z-0 bg-fixed bg-center bg-cover bg-no-repeat"
        style={{
          // Using a techy light streak / car motion shot
          backgroundImage: `url('https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
          filter: "brightness(0.3) grayscale(100%) contrast(120%)",
        }}
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10"></div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 border border-zinc-600 mb-6 text-zinc-400 bg-black/50 backdrop-blur-sm">
          <Mail size={20} strokeWidth={1} />
        </div>

        <h2 className="text-3xl md:text-5xl font-thin text-white tracking-tight uppercase mb-6">
          Tecnología
          <br />
          Al Día
        </h2>
        <p className="text-zinc-400 font-light max-w-md mx-auto mb-10 text-sm leading-relaxed">
          Suscríbete para recibir novedades sobre nuevos ingresos,
          actualizaciones de software y promociones en equipamiento.
        </p>

        <form
          className="max-w-md mx-auto flex flex-col md:flex-row gap-0"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="TU EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-black/80 border border-zinc-600 text-white text-xs px-6 py-4 focus:outline-none focus:border-white placeholder-zinc-500 tracking-widest backdrop-blur-sm"
          />
          <button
            type="submit"
            className="bg-white text-black px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-zinc-200 transition-colors border border-white flex items-center justify-center gap-2 group"
          >
            Suscribirse
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;

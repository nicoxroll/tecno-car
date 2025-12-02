import React from 'react';
import { Instagram, ArrowRight } from 'lucide-react';

const Gallery: React.FC = () => {
  // Reliable Pexels Modern Automotive Images
  const posts = [
    { id: 1, img: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'BMW TECH' },
    { id: 2, img: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'INTERIORES' },
    { id: 3, img: 'https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'BLACK SERIES' },
    { id: 4, img: 'https://images.pexels.com/photos/136872/pexels-photo-136872.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'MERCEDES BENZ' },
    { id: 5, img: 'https://images.pexels.com/photos/794435/pexels-photo-794435.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'AUDI S-LINE' },
    { id: 6, img: 'https://images.pexels.com/photos/2526127/pexels-photo-2526127.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'DETALLADO' },
  ];

  return (
    <section id="gallery" className="py-24 bg-black border-t border-zinc-900 relative z-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-light text-white tracking-tight uppercase flex items-center gap-3">
                <Instagram className="text-white" size={24} strokeWidth={1} />
                Trabajos Recientes
            </h2>
            <a href="https://instagram.com/merlanotecnologiavehicular" target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                Ver Instagram
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 bg-zinc-900 border border-zinc-900">
            {posts.map((post) => (
                <div key={post.id} className="group relative aspect-square overflow-hidden bg-zinc-900 cursor-pointer">
                    <img 
                        src={post.img} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 filter grayscale contrast-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-light tracking-[0.2em] text-xs uppercase border border-white px-4 py-2">
                            {post.title}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
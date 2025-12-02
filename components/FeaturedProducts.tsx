import React from 'react';
import { ShoppingBag } from 'lucide-react';

const FeaturedProducts: React.FC = () => {
  const products = [
    {
      id: 1,
      name: "PANTALLA TESLA STYLE",
      price: "CONSULTAR",
      image: "https://images.pexels.com/photos/10484291/pexels-photo-10484291.jpeg?auto=compress&cs=tinysrgb&w=800", // Large vertical screen in modern car
      tag: "DESTACADO"
    },
    {
      id: 2,
      name: "SEGURIDAD PRESENCIAL",
      price: "CONSULTAR",
      image: "https://images.pexels.com/photos/1007425/pexels-photo-1007425.jpeg?auto=compress&cs=tinysrgb&w=800", // Modern Key Fob / Start Button
      tag: "SEGURIDAD"
    },
    {
      id: 3,
      name: "ILUMINACIÓN CREE LED",
      price: "CONSULTAR",
      image: "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=800", // Modern Audi/BMW headlight close up
      tag: "LUCES"
    },
    {
      id: 4,
      name: "AUDIO HIGH-FIDELITY",
      price: "CONSULTAR",
      image: "https://images.pexels.com/photos/2127040/pexels-photo-2127040.jpeg?auto=compress&cs=tinysrgb&w=800", // Premium Speaker detail
      tag: "AUDIO"
    }
  ];

  return (
    <section id="featured-products" className="py-24 bg-zinc-950 border-t border-zinc-900 relative z-20 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
            <h2 className="text-2xl font-light text-white tracking-widest uppercase">Productos <span className="text-zinc-500 font-medium">Tech</span></h2>
            <a href="#" className="text-[10px] tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase">Catálogo Completo</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <div key={product.id} className="group flex flex-col">
                    <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 mb-6 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-110"
                        />
                        <div className="absolute top-4 left-4 bg-black text-white text-[9px] px-2 py-1 uppercase tracking-widest border border-zinc-800">
                            {product.tag}
                        </div>
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                             <a href="https://wa.me/5492213334444" target="_blank" rel="noopener noreferrer" className="bg-white text-black px-6 py-3 text-xs tracking-widest uppercase hover:bg-zinc-200">
                                Ver Detalles
                             </a>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-white text-sm font-light tracking-wider mb-1">{product.name}</h3>
                            <p className="text-zinc-500 text-xs tracking-widest">{product.price}</p>
                        </div>
                        <ShoppingBag size={16} className="text-zinc-600 group-hover:text-white transition-colors" strokeWidth={1} />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
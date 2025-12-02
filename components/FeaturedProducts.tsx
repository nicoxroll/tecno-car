import React, { useState } from 'react';
import { ShoppingBag, X, MessageCircle } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: string;
    image: string;
    tag: string;
    description: string;
    features: string[];
}

const FeaturedProducts: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products: Product[] = [
    {
      id: 1,
      name: "PANTALLA TESLA STYLE",
      price: "CONSULTAR",
      image: "https://images.pexels.com/photos/17345649/pexels-photo-17345649.jpeg?auto=compress&cs=tinysrgb&w=800",
      tag: "DESTACADO",
      description: "Sistema multimedia vertical de alta definición que transforma completamente la consola central de tu vehículo. Combina control de aire acondicionado táctil con entretenimiento avanzado.",
      features: ["Android 12 QLED", "4GB RAM + 64GB ROM", "Apple CarPlay & Android Auto Inalámbrico", "Control de climatización digital"]
    },
    {
      id: 2,
      name: "SEGURIDAD",
      price: "CONSULTAR",
      image: "https://images.pexels.com/photos/13101559/pexels-photo-13101559.jpeg?auto=compress&cs=tinysrgb&w=800",
      tag: "SEGURIDAD",
      description: "Sistema de alarma de última generación con sensor de presencia. Bloqueo automático de motor en caso de alejamiento del control remoto.",
      features: ["Activación por presencia", "Cierre centralizado automático", "Sensores volumétricos", "Sirena bitonal blindada"]
    },
    {
      id: 3,
      name: "ILUMINACIÓN CREE LED",
      price: "CONSULTAR",
      image: "https://images.pexels.com/photos/13207103/pexels-photo-13207103.jpeg?auto=compress&cs=tinysrgb&w=800",
      tag: "LUCES",
      description: "Kit de iluminación LED de alta potencia. Mejora la visibilidad nocturna un 300% sin encandilar. Color blanco puro 6000K para un look moderno.",
      features: ["30.000 Lúmenes", "Vida útil 50.000 horas", "Sistema Canbus (Sin error de tablero)", "Refrigeración activa"]
    },
    {
      id: 4,
      name: "AUDIO HIGH-FIDELITY",
      price: "CONSULTAR",
      image: "https://images.pexels.com/photos/326259/pexels-photo-326259.jpeg?auto=compress&cs=tinysrgb&w=800",
      tag: "AUDIO",
      description: "Componentes de audio de grado audiófilo. Parlantes, potencias y subwoofers calibrados para obtener un sonido cristalino y graves profundos.",
      features: ["Parlantes Componentes 6.5\"", "Subwoofers Slim", "Potencias Digitales Clase D", "Insonorización de puertas"]
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
                <div key={product.id} className="group flex flex-col cursor-pointer" onClick={() => setSelectedProduct(product)}>
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
                             <span className="bg-white text-black px-6 py-3 text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors border border-white">
                                Ver Detalles
                             </span>
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-black border border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
            onClick={(e) => e.stopPropagation()}
          >
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-white transition-colors bg-black p-2 rounded-full md:bg-transparent"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {/* Image Side - Removed grayscale filter to show full color in modal */}
            <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
                <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content Side */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-[10px] text-zinc-500 tracking-[0.3em] font-medium uppercase mb-4 border-l border-white pl-3">
                    {selectedProduct.tag}
                </span>
                <h3 className="text-3xl font-light text-white mb-6 uppercase tracking-tight">{selectedProduct.name}</h3>
                
                <p className="text-zinc-400 font-light text-sm leading-relaxed mb-8">
                    {selectedProduct.description}
                </p>

                <div className="mb-10">
                    <h4 className="text-xs text-white uppercase tracking-widest mb-4">Características</h4>
                    <ul className="space-y-2">
                        {selectedProduct.features.map((feature, idx) => (
                            <li key={idx} className="text-zinc-500 text-xs font-light flex items-center gap-3">
                                <div className="w-1 h-1 bg-white"></div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <a 
                    href={`https://wa.me/5492213334444?text=Hola,%20me%20interesa%20saber%20m%C3%A1s%20sobre:%20${selectedProduct.name}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 bg-white text-black py-4 px-6 text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors border border-white"
                >
                    <MessageCircle size={16} />
                    Consultar Precio
                </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
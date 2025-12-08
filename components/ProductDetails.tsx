import React, { useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onNavigateToCart: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onNavigateToCart }) => {
  const { addToCart } = useCart();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back */}
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-xs uppercase tracking-widest group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Image Section */}
            <div className="relative bg-zinc-900 border border-zinc-800 aspect-square lg:aspect-[4/5] overflow-hidden group">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute top-0 left-0 p-4">
                    <span className="bg-white text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                        {product.category}
                    </span>
                </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col justify-center">
                <h1 className="text-3xl md:text-5xl font-thin text-white uppercase tracking-tight mb-4">
                    {product.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-3xl text-white font-light">${product.price.toLocaleString()}</span>
                    <span className="text-green-500 text-xs uppercase tracking-widest flex items-center gap-1">
                        <Check size={14} /> Stock Disponible
                    </span>
                </div>

                <div className="w-full h-[1px] bg-zinc-800 mb-8"></div>

                <p className="text-zinc-400 font-light leading-relaxed mb-8 text-sm md:text-base">
                    {product.description}
                    <br/><br/>
                    Producto premium seleccionado por nuestros especialistas para garantizar la mejor performance en tu vehículo. Compatible con instalación en nuestro taller.
                </p>

                {/* Features if available */}
                {product.features && (
                    <div className="mb-10">
                        <h4 className="text-xs text-white uppercase tracking-widest mb-4">Especificaciones</h4>
                        <ul className="space-y-3">
                            {product.features.map((f, i) => (
                                <li key={i} className="text-zinc-500 text-xs flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-zinc-700"></div>
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    <button 
                        onClick={handleAddToCart}
                        className="flex-1 bg-white text-black py-4 uppercase tracking-[0.2em] text-xs font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={18} strokeWidth={1.5} />
                        Agregar al Carrito
                    </button>
                    <button 
                         onClick={onNavigateToCart}
                         className="flex-1 border border-zinc-700 text-white py-4 uppercase tracking-[0.2em] text-xs font-medium hover:border-white hover:bg-zinc-900 transition-colors"
                    >
                        Ver Carrito
                    </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-zinc-800 p-4 flex items-center gap-3">
                        <ShieldCheck className="text-zinc-500" size={24} strokeWidth={1} />
                        <div>
                            <p className="text-white text-xs uppercase tracking-wider">Garantía</p>
                            <p className="text-[10px] text-zinc-500">6 Meses Oficial</p>
                        </div>
                    </div>
                    <div className="border border-zinc-800 p-4 flex items-center gap-3">
                        <Truck className="text-zinc-500" size={24} strokeWidth={1} />
                        <div>
                            <p className="text-white text-xs uppercase tracking-wider">Envíos</p>
                            <p className="text-[10px] text-zinc-500">A todo el país</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
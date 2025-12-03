import React, { useState, useEffect } from 'react';
import { ShoppingBag, Filter, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { loadProducts } from '../utils/dataLoader';

interface CatalogProps {
  onProductSelect: (product: Product) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onProductSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [priceRange, setPriceRange] = useState<number>(1000000);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await loadProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = ['Todos', 'Multimedia', 'Audio', 'Iluminación', 'Seguridad', 'Accesorios'];

  const filteredProducts = products.filter(p =>
    (selectedCategory === 'Todos' || p.category === selectedCategory) &&
    p.price <= priceRange
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black animate-fade-in">
      
      {/* Catalog Hero - Parallax & Large */}
      <div className="relative h-[60vh] overflow-hidden border-b border-zinc-800">
         <div className="absolute inset-0 bg-zinc-900/40 z-10 mix-blend-multiply"></div> {/* Gray/Zinc Overlay */}
         <img 
            src="https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=1600" 
            alt="Catálogo Merlano" 
            className="w-full h-full object-cover"
            style={{
                transform: `scale(1.1) translateY(${scrollY * 0.4}px)`,
                transition: 'transform 0.1s linear',
                filter: 'grayscale(100%) contrast(90%) brightness(0.7)' // Heavy gray filter
            }}
         />
         <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4"
              style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
            <h1 className="text-5xl md:text-7xl font-thin text-white uppercase tracking-tight mb-6 drop-shadow-lg">
                Catálogo <span className="text-zinc-400">2024</span>
            </h1>
            <div className="h-[1px] w-24 bg-white mb-6"></div>
            <p className="text-white font-light tracking-[0.3em] text-xs md:text-sm uppercase drop-shadow-md bg-black/50 px-6 py-3 backdrop-blur-md border border-white/20">
                Equipamiento Premium Seleccionado
            </p>
         </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        
        {/* Controls Bar */}
        <div className="flex justify-between items-center mb-8">
            <button 
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-2 text-white text-xs uppercase tracking-widest border border-zinc-700 px-4 py-2 hover:bg-zinc-900 transition-colors"
            >
                <Filter size={14} /> {isFiltersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            <span className="text-zinc-500 text-xs tracking-widest">{filteredProducts.length} PRODUCTOS</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 relative">
            
            {/* Sidebar Filters */}
            <div className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${isFiltersOpen ? 'w-full lg:w-64 opacity-100 max-h-[1000px] mb-8 lg:mb-0' : 'w-0 opacity-0 max-h-0 lg:max-h-[1000px] lg:w-0'}`}>
                <div className="space-y-12 pr-4">
                    
                    {/* Search Mockup */}
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="BUSCAR..." 
                            className="w-full bg-zinc-950 border-b border-zinc-800 text-white text-xs py-3 pl-2 focus:outline-none focus:border-white transition-colors"
                        />
                        <Search size={14} className="absolute right-2 top-3 text-zinc-500" />
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                            Categorías
                        </h3>
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`block w-full text-left text-xs py-2 px-2 transition-all duration-200 border-l-2 ${selectedCategory === cat ? 'border-white text-white pl-4 font-medium' : 'border-transparent text-zinc-500 hover:text-zinc-300 pl-2'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
                            Precio Máximo
                        </h3>
                        <div className="px-2">
                            <input 
                                type="range" 
                                min="50000" 
                                max="1000000" 
                                step="10000"
                                value={priceRange} 
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <div className="flex justify-between text-[10px] text-zinc-500 mt-4 font-mono">
                                <span>$50k</span>
                                <span className="text-white">${priceRange.toLocaleString()}</span>
                                <span>$1M+</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
                <div className={`grid gap-6 transition-all duration-500 ${isFiltersOpen ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'}`}>
                    {filteredProducts.map(product => (
                        <div key={product.id} className="group bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300 flex flex-col">
                            <div className="relative aspect-square overflow-hidden bg-black cursor-pointer" onClick={() => onProductSelect(product)}>
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                />
                                {/* Quick Add Overlay */}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                        className="bg-white text-black px-6 py-3 text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
                                     >
                                        <ShoppingBag size={14} /> Quick Add
                                     </button>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1 cursor-pointer" onClick={() => onProductSelect(product)}>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{product.category}</span>
                                <h3 className="text-white font-light text-lg mb-2 group-hover:underline decoration-zinc-500 underline-offset-4">{product.name}</h3>
                                <p className="text-zinc-400 text-xs line-clamp-2 mb-4 flex-1">{product.description}</p>
                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-900">
                                    <span className="text-white font-medium text-lg">${product.price.toLocaleString()}</span>
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest group-hover:text-white transition-colors">Ver Detalles</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="py-24 text-center border border-zinc-900 border-dashed">
                        <p className="text-zinc-500 font-light mb-2">No se encontraron productos en este rango.</p>
                        <button onClick={() => { setPriceRange(1000000); setSelectedCategory('Todos'); }} className="text-white text-xs underline">
                            Limpiar Filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
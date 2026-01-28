import { CircularProgress } from "@mui/material";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabase";
import { Product, ViewState } from "../types";

interface FeaturedProductsProps {
  onNavigate: (view: ViewState) => void;
  onProductSelect: (product: Product) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  onNavigate,
  onProductSelect,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProduct && e.key === "Escape") {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedProduct]);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .limit(4);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section
      id="featured-products"
      className="py-24 bg-zinc-950 border-t border-zinc-900 relative z-20 scroll-mt-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-2xl font-light text-white tracking-widest uppercase">
            Productos <span className="text-zinc-500 font-medium">Tech</span>
          </h2>
          <button
            onClick={() => onNavigate("catalog")}
            className="text-[10px] tracking-[0.2em] text-zinc-500 hover:text-white transition-colors uppercase"
          >
            Catálogo Completo
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <CircularProgress size={30} sx={{ color: "white" }} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            No hay productos destacados por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-900 mb-6 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale contrast-110"
                  />
                  <div className="absolute top-4 left-4 bg-black text-white text-[9px] px-2 py-1 uppercase tracking-widest border border-zinc-800">
                    {product.category}
                  </div>
                  {product.discount_price &&
                    product.discount_price < product.price && (
                      <div className="absolute top-4 right-4 bg-white text-black text-[9px] font-bold px-2 py-1 uppercase tracking-widest">
                        {Math.round(
                          ((product.price - product.discount_price) /
                            product.price) *
                            100
                        )}
                        % OFF
                      </div>
                    )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white text-black px-6 py-3 text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors border border-white">
                      Ver Detalles
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white text-sm font-light tracking-wider mb-1">
                      {product.name}
                    </h3>
                    {product.model && (
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">
                        {product.model}
                      </p>
                    )}
                    <div className="flex flex-col">
                      {product.discount_price &&
                      product.discount_price < product.price ? (
                        <>
                          <span className="text-zinc-600 line-through text-[10px]">
                            ${product.price.toLocaleString()}
                          </span>
                          <span className="text-white text-xs tracking-widest">
                            ${product.discount_price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <p className="text-zinc-500 text-xs tracking-widest">
                          ${product.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <ShoppingBag
                    size={16}
                    className="text-zinc-600 group-hover:text-white transition-colors"
                    strokeWidth={1}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-start justify-center pt-20 p-4 bg-black/90 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-black border border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-white transition-colors bg-black p-2 md:bg-transparent"
              >
                <X size={24} strokeWidth={1} />
              </button>

              {/* Image Side - Full Color in Modal */}
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
                  {selectedProduct.category}
                </span>
                <h3 className="text-3xl font-light text-white mb-2 uppercase tracking-tight">
                  {selectedProduct.name}
                </h3>
                {selectedProduct.model && (
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mb-4">
                    Modelo: {selectedProduct.model}
                  </p>
                )}
                <div className="mb-6">
                  {selectedProduct.discount_price &&
                  selectedProduct.discount_price < selectedProduct.price ? (
                    <div className="flex flex-col">
                      <span className="text-zinc-500 line-through text-sm">
                        ${selectedProduct.price.toLocaleString()}
                      </span>
                      <span className="text-xl font-medium text-white">
                        ${selectedProduct.discount_price.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xl font-medium text-white">
                      ${selectedProduct.price.toLocaleString()}
                    </p>
                  )}
                </div>

                <p className="text-zinc-400 font-light text-sm leading-relaxed mb-8">
                  {selectedProduct.description}
                </p>

                {selectedProduct.features && (
                  <div className="mb-10">
                    <h4 className="text-xs text-white uppercase tracking-widest mb-4">
                      Características
                    </h4>
                    <ul className="space-y-2">
                      {selectedProduct.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-zinc-500 text-xs font-light flex items-center gap-3"
                        >
                          <div className="w-1 h-1 bg-white"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex items-center justify-center gap-3 bg-white text-black py-4 px-6 text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors border border-white"
                  >
                    <ShoppingBag size={16} />
                    Agregar al Carrito
                  </button>

                  <button
                    onClick={() => {
                      onProductSelect(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="flex items-center justify-center gap-3 border border-zinc-700 text-white py-4 px-6 text-xs uppercase tracking-[0.2em] hover:border-white hover:bg-zinc-900 transition-colors"
                  >
                    <ArrowRight size={16} />
                    Más Información
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default FeaturedProducts;

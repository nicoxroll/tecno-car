import {
  ArrowLeft,
  Check,
  ShieldCheck,
  ShoppingBag,
  Truck,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { Product } from "../types";
import { loadProducts } from "../utils/dataLoader";

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onNavigateToCart: () => void;
  onProductSelect: (product: Product) => void;
  onOpenChat?: (message: string) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  onBack,
  onNavigateToCart,
  onProductSelect,
  onOpenChat,
}) => {
  const { addToCart } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(product.image);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(product.image);

    // Inject Product Schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": [product.image, ...(product.images || [])],
      "description": product.description,
      "brand": {
        "@type": "Brand",
        "name": "Merlano"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "ARS",
        "price": product.discount_price || product.price,
        "availability": (product.stock && product.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    }
  }, [product]);

  // Combine main image with gallery images
  const allImages = [product.image, ...(product.images || [])];

  useEffect(() => {
    const fetchRelated = async () => {
      const allProducts = await loadProducts();

      // Filter and score products
      const scored = allProducts
        .filter((p) => p.id !== product.id) // Exclude current
        .map((p) => {
          let score = 0;
          // Category match (high weight)
          if (p.category === product.category) score += 10;

          // Tag matches (medium weight)
          if (product.tags && p.tags) {
            const sharedTags = p.tags.filter((tag) =>
              product.tags?.includes(tag)
            );
            score += sharedTags.length * 2;
          }

          // Name similarity (simple check)
          const nameWords = product.name.toLowerCase().split(" ");
          const pName = p.name.toLowerCase();
          nameWords.forEach((word) => {
            if (word.length > 3 && pName.includes(word)) score += 1;
          });

          return { product: p, score };
        })
        .sort((a, b) => b.score - a.score) // Sort by score desc
        .slice(0, 3) // Take top 3
        .map((item) => item.product);

      setRelatedProducts(scored);
    };

    fetchRelated();
  }, [product]);

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
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Volver al Catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative bg-zinc-900 border border-zinc-800 aspect-square lg:aspect-[4/5] overflow-hidden group">
              <img
                src={selectedImage}
                alt={product.name}
                crossOrigin="anonymous"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-0 left-0 p-4">
                <span className="bg-white text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                  {product.category}
                </span>
              </div>
              {product.discount_price &&
                product.discount_price < product.price && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className="bg-white text-black text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                      {Math.round(
                        ((product.price - product.discount_price) /
                          product.price) *
                          100
                      )}
                      % OFF
                    </span>
                  </div>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square bg-zinc-900 border overflow-hidden transition-all ${
                      selectedImage === img
                        ? "border-white opacity-100"
                        : "border-zinc-800 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx}`}
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-thin text-white uppercase tracking-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex flex-col">
                {product.discount_price &&
                product.discount_price < product.price ? (
                  <>
                    <span className="text-xl text-zinc-500 line-through mb-1">
                      ${product.price.toLocaleString()}
                    </span>
                    <span className="text-3xl text-white font-light">
                      ${product.discount_price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl text-white font-light">
                    ${product.price.toLocaleString()}
                  </span>
                )}
              </div>
              <span
                className={`text-xs uppercase tracking-widest flex items-center gap-1 ${
                  product.stock && product.stock < 5
                    ? "text-white"
                    : "text-zinc-500"
                }`}
              >
                <Check size={14} />
                {product.stock && product.stock < 5
                  ? "Últimas disponibles"
                  : "Stock Disponible"}
              </span>
            </div>

            <div className="w-full h-[1px] bg-zinc-800 mb-8"></div>

            {product.model && (
              <div className="mb-6">
                <span className="text-xs text-zinc-500 uppercase tracking-widest block mb-1">
                  Modelo
                </span>
                <span className="text-white font-light">{product.model}</span>
              </div>
            )}

            <p className="text-zinc-400 font-light leading-relaxed mb-8 text-sm md:text-base">
              {product.description}
              <br />
              <br />
              Producto premium seleccionado por nuestros especialistas para
              garantizar la mejor performance en tu vehículo. Compatible con
              instalación en nuestro taller.
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] uppercase tracking-widest px-2 py-1 border border-zinc-800 text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Features if available */}
            {product.features && (
              <div className="mb-10">
                <h4 className="text-xs text-white uppercase tracking-widest mb-4">
                  Especificaciones
                </h4>
                <ul className="space-y-3">
                  {product.features.map((f, i) => (
                    <li
                      key={i}
                      className="text-zinc-500 text-xs flex items-center gap-3"
                    >
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
                <ShieldCheck
                  className="text-zinc-500"
                  size={24}
                  strokeWidth={1}
                />
                <div>
                  <p className="text-white text-xs uppercase tracking-wider">
                    Garantía
                  </p>
                  <p className="text-[10px] text-zinc-500">6 Meses Oficial</p>
                </div>
              </div>
              <div className="border border-zinc-800 p-4 flex items-center gap-3">
                <Truck className="text-zinc-500" size={24} strokeWidth={1} />
                <div>
                  <p className="text-white text-xs uppercase tracking-wider">
                    Envíos
                  </p>
                  <p className="text-[10px] text-zinc-500">A todo el país</p>
                </div>
              </div>
            </div>

            {/* Consultation Buttons */}
            <div className="flex flex-col gap-3 mb-8 mt-8">
              <button
                onClick={() =>
                  onOpenChat &&
                  onOpenChat(`Quiero saber más sobre ${product.name}`)
                }
                className="w-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 py-4 uppercase tracking-[0.2em] text-[10px] font-medium hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                Consultar con IA
              </button>
              <a
                href={`https://wa.me/5492213334444?text=Hola,%20me%20interesa%20saber%20m%C3%A1s%20sobre:%20${product.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-zinc-800 bg-zinc-900/50 text-zinc-300 py-4 uppercase tracking-[0.2em] text-[10px] font-medium hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-zinc-800 pt-12">
            <h3 className="text-2xl font-thin text-white uppercase tracking-tight mb-8">
              Productos Relacionados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((related) => (
                <div
                  key={related.id}
                  className="group cursor-pointer"
                  onClick={() => onProductSelect(related)}
                >
                  <div className="aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden mb-4 relative">
                    <img
                      src={related.image}
                      alt={related.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute top-0 left-0 p-3">
                      <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest border border-white/10">
                        {related.category}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-light text-lg mb-1 group-hover:underline decoration-zinc-500 underline-offset-4">
                      {related.name}
                    </h4>
                    <p className="text-zinc-500 text-sm mb-2 line-clamp-2">
                      {related.description}
                    </p>
                    <div className="flex flex-col">
                      {related.discount_price &&
                      related.discount_price < related.price ? (
                        <>
                          <span className="text-zinc-500 line-through text-xs">
                            ${related.price.toLocaleString()}
                          </span>
                          <span className="text-white font-medium">
                            ${related.discount_price.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="text-white font-medium">
                          ${related.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

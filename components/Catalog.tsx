import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Filter,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { Product } from "../types";
import { loadProducts } from "../utils/dataLoader";
import { supabase } from "../services/supabase";
import { ImageWithLoader } from "./ui/ImageWithLoader";

interface CatalogProps {
  onProductSelect: (product: Product) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onProductSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sections configuration
  const [sections, setSections] = useState<any[]>([
    {
      id: "tech",
      title: "Catálogo",
      subtitle: "Equipamiento Premium Seleccionado",
      image: "https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=1600",
      year: "2024",
      categories: ["Todos", "Audio", "Cierre Centralizado", "Levantacristales", "Lámparas", "Cámaras", "Sensores"],
      recommendedTags: ["hotsale"]
    },
    {
      id: "mobile",
      title: "Celulares",
      subtitle: "Equipos y Accesorios",
      image: "https://images.pexels.com/photos/11297769/pexels-photo-11297769.jpeg",
      year: "2024",
      categories: ["Todos", "Celulares", "Cargador", "Fundas"],
      recommendedTags: ["new"]
    },
    {
      id: "clothes",
      title: "Indumentaria",
      subtitle: "Tendencias de temporada",
      image: "https://images.pexels.com/photos/4903412/pexels-photo-4903412.jpeg",
      year: "2024",
      categories: ["Todos", "Remeras", "Buzos", "Pantalones Cortos", "Pantalones Largos"],
      recommendedTags: ["hotsale"]
    }
  ]);
  
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const itemsPerPage = 8;
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchHeroAndConfig = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("key, value")
        .in("key", [
          "catalog_sections",
          // Fallbacks for backwards compatibility:
          "catalog_hero_image",
          "catalog_hero_title",
          "catalog_hero_subtitle",
          "catalog_year",
          "catalog_filters",
        ]);

      if (data) {
        const configMap = data.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});

        // Prefer structured JSON from DB if available
        if (configMap.catalog_sections) {
          try {
            const parsedSections = JSON.parse(configMap.catalog_sections);
            if (Array.isArray(parsedSections) && parsedSections.length > 0) {
              setSections(parsedSections);
            }
          } catch (e) {
            console.error("Error parsing catalog_sections", e);
          }
        } else {
          // Fallback to legacy structure for the first slide if sections aren't defined in DB
          setSections(prevSections => {
            const updated = [...prevSections];
            if (configMap.catalog_hero_image) updated[0].image = configMap.catalog_hero_image;
            if (configMap.catalog_hero_title) updated[0].title = configMap.catalog_hero_title;
            if (configMap.catalog_hero_subtitle) updated[0].subtitle = configMap.catalog_hero_subtitle;
            if (configMap.catalog_year) updated[0].year = configMap.catalog_year;
            
            if (configMap.catalog_filters) {
              try {
                const parsedCats = JSON.parse(configMap.catalog_filters);
                updated[0].categories = ["Todos", ...parsedCats];
              } catch (e) {}
            }
            
            return updated;
          });
        }
      }
    };
    fetchHeroAndConfig();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await loadProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const [categories, setCategories] = useState<string[]>(["Todos"]);

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !searchTags.includes(newTag)) {
        setSearchTags([...searchTags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter((tag) => tag !== tagToRemove));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev === sections.length - 1 ? 0 : prev + 1));
    setSelectedCategory("Todos");
    setSelectedBrand("Todas");
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? sections.length - 1 : prev - 1));
    setSelectedCategory("Todos");
    setSelectedBrand("Todas");
  };

  const currentSection = sections[activeSlide];
  const currentCategories = currentSection?.categories || ["Todos"];

  const [selectedBrand, setSelectedBrand] = useState<string>("Todas");

  // Get unique brands from products for the current slide
  const availableBrands = currentSection?.brands && currentSection.brands.length > 0 
    ? ["Todas", ...currentSection.brands]
    : ["Todas", ...Array.from(new Set(products
    .filter(p => {
      // Check if product fits in current section's categories
      const isConfiguredCategory = currentCategories.includes(p.category) && p.category !== "Todos";
      
      // If it's the specific slide logic, usually if it belongs to one of its categories
      // We will map any product whose category is listed in the current section
      if (currentCategories.includes("Todos") && currentCategories.length === 1) {
        return true; 
      }
      
      // Basic dynamic logic: Does the product belong to the categories defined for this slide?
      // Since default category "Todos" is mostly always present, we check if p.category exists in currentSection
      
      // In a completely dynamic setup, we assume a product belongs to the section if its category is explicitly listed in `categories` (excluding the "Todos" string)
      return currentCategories.some((cat: string) => cat !== "Todos" && cat === p.category);
    })
    .map(p => p.brand || p.model) // Default to brand or model logic
    .filter(Boolean)
  ))] as string[];

  const filteredProducts = products.filter((p) => {
    let belongsToSlide = false;
    if (currentCategories.length === 1 && currentCategories[0] === "Todos") {
        belongsToSlide = true;
    } else {
        belongsToSlide = currentCategories.some((cat: string) => cat !== "Todos" && cat === p.category);
        
        // As a fallback edge case, if the slide is the first one (tech) and the product doesn't explicitly belong to mobile or clothes, 
        // a pure dynamic approach should define ALL categories properly in DB.
        // For backwards compatibility and the current logic requested:
        if (!belongsToSlide && activeSlide === 0) {
           const definedElsewhere = sections.slice(1).some(sec => sec.categories.includes(p.category));
           if (!definedElsewhere) belongsToSlide = true;
        }
    }

    const matchesCategory =
      selectedCategory === "Todos" ? belongsToSlide : p.category === selectedCategory;
      
    // Matching brand (using p.model as brand placeholder if p.brand doesn't exist, adjust as needed)
    const pBrand = p.brand || p.model || "";
    const matchesBrand = selectedBrand === "Todas" || pBrand === selectedBrand;

    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags =
      searchTags.length === 0 ||
      searchTags.every((tag) =>
        p.tags?.some((pt) => pt.toLowerCase().includes(tag.toLowerCase()))
      );

    return matchesCategory && matchesBrand && matchesPrice && matchesSearch && matchesTags && belongsToSlide;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, minPrice, maxPrice, searchTerm, searchTags, selectedBrand]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black animate-fade-in">
      {/* Catalog Hero - Parallax & Large */}
      <div className="relative h-[60vh] overflow-hidden border-b border-zinc-800 group">
        <div className="absolute inset-0 bg-zinc-900/40 z-10 mix-blend-multiply"></div>{" "}
        {/* Gray/Zinc Overlay */}
        <ImageWithLoader
          src={currentSection?.image}
          alt={currentSection?.title}
          containerClassName="absolute inset-0 w-full h-full transition-opacity duration-500"
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{
            transform: `scale(1.1) translateY(${scrollY * 0.4}px)`,
            filter: "grayscale(100%) contrast(90%) brightness(0.7)", // Heavy gray filter
          }}
        />
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4 transition-all duration-500 key={activeSlide}"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <h1 className="text-5xl md:text-7xl font-thin text-white uppercase tracking-tight mb-6 drop-shadow-lg animate-fade-in">
            {currentSection?.title} <span className="text-zinc-400">{currentSection?.year}</span>
          </h1>
          <div className="h-[1px] w-24 bg-white mb-6"></div>
          <p className="text-white font-light tracking-[0.3em] text-xs md:text-sm uppercase drop-shadow-md bg-black/50 px-6 py-3 backdrop-blur-md border border-white/20 animate-fade-in">
            {currentSection?.subtitle}
          </p>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/60 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-transparent hover:border-zinc-700"
        >
          <ChevronLeft size={36} strokeWidth={1} />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 text-white/50 hover:text-white bg-black/20 hover:bg-black/60 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-transparent hover:border-zinc-700"
        >
          <ChevronRight size={36} strokeWidth={1} />
        </button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        {/* Controls Bar */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 text-white text-xs uppercase tracking-widest border border-zinc-700 px-4 py-2 hover:bg-zinc-900 transition-colors"
          >
            <Filter size={14} />{" "}
            {isFiltersOpen ? "Ocultar Filtros" : "Mostrar Filtros"}
          </button>
          <span className="text-zinc-500 text-xs tracking-widest">
            {filteredProducts.length} PRODUCTOS
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 relative">
          {/* Sidebar Filters */}
          <div
            className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${
              isFiltersOpen
                ? "w-full lg:w-64 opacity-100 max-h-[1000px] mb-8 lg:mb-0"
                : "w-0 opacity-0 max-h-0 lg:max-h-[1000px] lg:w-0"
            }`}
          >
            <div className="space-y-12 pr-4">
              {/* Search Bar */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="BUSCAR PRODUCTOS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black border-b border-zinc-800 text-white text-xs py-3 pl-2 focus:outline-none focus:border-white transition-colors"
                />
                <Search
                  size={14}
                  className="absolute right-2 top-3 text-zinc-500"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  Categorías
                </h3>
                <div className="space-y-1">
                  {currentCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`block w-full text-left text-xs py-2 px-2 transition-all duration-200 border-l-2 ${
                        selectedCategory === cat
                          ? "border-white text-white pl-4 font-medium"
                          : "border-transparent text-zinc-500 hover:text-zinc-300 pl-2"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  Marcas
                </h3>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`block w-full text-left text-xs py-2 px-2 transition-all duration-200 border-l-2 ${
                        selectedBrand === brand
                          ? "border-white text-white pl-4 font-medium"
                          : "border-transparent text-zinc-500 hover:text-zinc-300 pl-2"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                  Etiquetas
                </h3>
                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="FILTRAR POR ETIQUETA..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInput}
                    className="w-full bg-black border-b border-zinc-800 text-white text-xs py-2 pl-2 focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                {searchTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {searchTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-zinc-800 text-white text-[10px] px-2 py-1 flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-400"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Recommended Tags */}
                {currentSection?.recommendedTags && currentSection.recommendedTags.length > 0 && (
                  <div className="mt-4">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 block">
                      Sugeridas:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentSection.recommendedTags.map((tag: string) => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (!searchTags.includes(tag)) setSearchTags([...searchTags, tag]);
                          }}
                          className="text-[10px] text-zinc-400 border border-zinc-800 hover:border-zinc-500 hover:text-white px-2 py-1 transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
                  Rango de Precio
                </h3>
                <div className="px-2 space-y-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">
                      Mínimo: ${minPrice.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={minPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= maxPrice) setMinPrice(val);
                      }}
                      className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer accent-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">
                      Máximo: ${maxPrice.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={maxPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= minPrice) setMaxPrice(val);
                      }}
                      className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div
              className={`grid gap-6 transition-all duration-500 ${
                isFiltersOpen
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-black border border-zinc-900 hover:border-zinc-700 transition-all duration-300 flex flex-col"
                >
                  <div
                    className="relative aspect-square overflow-hidden bg-black cursor-pointer"
                    onClick={() => onProductSelect(product)}
                  >
                    <ImageWithLoader
                      src={product.image}
                      alt={product.name}
                      containerClassName="w-full h-full"
                      loading="lazy"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    {product.discount_price &&
                      product.discount_price < product.price && (
                        <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-bold px-2 py-1 z-10">
                          {Math.round(
                            ((product.price - product.discount_price) /
                              product.price) *
                              100
                          )}
                          % OFF
                        </div>
                      )}
                    {product.stock !== undefined &&
                      product.stock < 5 &&
                      product.stock > 0 && (
                        <div className="absolute top-2 left-2 bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold px-2 py-1 z-10 uppercase tracking-wider">
                          Últimas disponibles
                        </div>
                      )}
                    {/* Quick Add Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="bg-white text-black px-6 py-3 text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
                      >
                        <ShoppingBag size={14} /> Quick Add
                      </button>
                    </div>
                  </div>
                  <div
                    className="p-6 flex flex-col flex-1 cursor-pointer"
                    onClick={() => onProductSelect(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {product.category}
                      </span>
                      {product.year && (
                        <span className="text-[10px] font-medium text-zinc-600">
                          {product.year}
                        </span>
                      )}
                      {product.model && (
                        <span className="text-[10px] font-medium text-zinc-600 border-l border-zinc-800 pl-2 ml-2">
                          {product.model}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-light text-lg mb-2 group-hover:underline decoration-zinc-500 underline-offset-4">
                      {product.name}
                    </h3>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-zinc-400 text-xs line-clamp-2 mb-4 flex-1">
                      {product.description}
                    </p>
                    <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-900">
                      <div className="flex flex-col">
                        {product.discount_price &&
                        product.discount_price < product.price ? (
                          <>
                            <span className="text-zinc-500 line-through text-xs">
                              ${product.price.toLocaleString()}
                            </span>
                            <span className="text-white font-medium text-lg">
                              ${product.discount_price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-white font-medium text-lg">
                            ${product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-widest group-hover:text-white transition-colors">
                        Ver Detalles
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-24 text-center border border-zinc-900 border-dashed">
                <p className="text-zinc-500 font-light mb-2">
                  No se encontraron productos con estos filtros.
                </p>
                <button
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(1000000);
                    setSelectedCategory("Todos");
                    setSelectedBrand("Todas");
                    setSearchTerm("");
                    setSearchTags([]);
                  }}
                  className="text-white text-xs underline"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > itemsPerPage && (
              <div className="mt-12 flex justify-center items-center gap-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} strokeWidth={1} />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center text-xs font-medium border transition-colors ${
                          currentPage === page
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} strokeWidth={1} />
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

import Lenis from "lenis";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import About from "./components/About";
import Admin from "./components/Admin";
import Brands from "./components/Brands";
import CartDrawer from "./components/CartDrawer";
import Catalog from "./components/Catalog";
import ChatInterface from "./components/ChatInterface";
import Checkout from "./components/Checkout";
import Contact from "./components/Contact";
import FeaturedProducts from "./components/FeaturedProducts";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import Highlights from "./components/Highlights";
import Navbar from "./components/Navbar";
import Newsletter from "./components/Newsletter";
import ProductDetails from "./components/ProductDetails";
import ServiceDetails from "./components/ServiceDetails";
import VideoSection from "./components/VideoSection";
import Services from "./components/Services";
import { CartProvider } from "./context/CartContext";
import { ScrollProvider } from "./context/ScrollContext";
import { Product, Service, ViewState } from "./types";

function App() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPendingMessage, setChatPendingMessage] = useState<
    string | undefined
  >(undefined);

  // Fixed sections order
  const sectionsOrder = [
    "hero",
    "brands",
    "video-section",
    "services",
    "about",
    "featured-products",
    "gallery",
    "newsletter",
    "contact",
    "footer",
  ];

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis();

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Store lenis instance to use it in other functions
    (window as any).lenis = lenis;

    // Check if URL contains /admin
    if (window.location.pathname === "/admin") {
      setCurrentView("admin");
    }

    return () => {
      lenis.destroy();
      (window as any).lenis = null;
    };
  }, []);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    // When switching views, reset scroll to top immediately
    const lenis = (window as any).lenis;
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    // Update URL for admin
    if (view === "admin") {
      window.history.pushState({}, "", "/admin");
    } else {
      window.history.pushState({}, "", "/");
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    handleNavigate("product-details");
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    handleNavigate("service-details");
  };

  const handleOpenChat = (message?: string) => {
    setIsChatOpen(true);
    if (message) {
      setChatPendingMessage(message);
    }
  };

  // SEO Management
  useEffect(() => {
    const defaultTitle =
      "Merlano Tecnología Vehicular - Taller Integral del Automotor";
    const defaultDesc =
      "Expertos en llaves codificadas, cierre centralizado, polarizados, audio y multimedia, aire acondicionado y productos de limpieza. Taller de mantenimiento vehicular en La Plata y Berisso.";

    const updateMeta = (title: string, desc: string) => {
      document.title = title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", desc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", title);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", desc);

      // Canonical URL
      let canonicalUrl = "https://merlanotecnologiavehicular.com.ar" + window.location.pathname;
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement("link");
        linkCanonical.setAttribute("rel", "canonical");
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute("href", canonicalUrl);
    };

    if (currentView === "landing") {
      updateMeta(defaultTitle, defaultDesc);
    } else if (currentView === "product-details" && selectedProduct) {
      const desc = selectedProduct.description
        ? selectedProduct.description.slice(0, 150) + "..."
        : defaultDesc;
      updateMeta(`${selectedProduct.name} | Merlano`, desc);
    } else if (currentView === "service-details" && selectedService) {
      const desc = selectedService.description
        ? selectedService.description.slice(0, 150) + "..."
        : defaultDesc;
      updateMeta(`${selectedService.title} | Servicios Merlano`, desc);
    } else if (currentView === "catalog") {
      updateMeta(
        "Catálogo de Productos | Merlano",
        "Explora nuestra variedad de productos de electrónica, audio, seguridad y confort para tu vehículo."
      );
    } else if (currentView === "checkout") {
      updateMeta("Checkout | Merlano", "Finaliza tu compra o consulta.");
    } else if (currentView === "admin") {
      updateMeta(
        "Panel de Administración | Merlano",
        "Acceso restringido administrativos."
      );
    }
  }, [currentView, selectedProduct, selectedService]);

  // Define all sections
  const sections = {
    hero: <Hero key="hero" />,
    brands: <Brands key="brands" />,
    "video-section": <VideoSection key="video-section" />,
    highlights: <Highlights key="highlights" />,
    services: (
      <Services
        key="services"
        onNavigate={handleNavigate}
        onServiceSelect={handleServiceSelect}
      />
    ),
    about: <About key="about" />,
    "featured-products": (
      <FeaturedProducts
        key="featured-products"
        onNavigate={handleNavigate}
        onProductSelect={handleProductSelect}
      />
    ),
    gallery: <Gallery key="gallery" />,
    newsletter: <Newsletter key="newsletter" />,
    contact: <Contact key="contact" />,
    footer: <Footer key="footer" />,
  };

  return (
    <CartProvider>
      <ScrollProvider>
        <Toaster
          position="top-center"
          theme="dark"
          richColors
          style={{ zIndex: 9999 }}
        />
        <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-700 selection:text-white">
          {currentView !== "admin" && (
            <Navbar
              onNavigate={handleNavigate}
              currentView={currentView}
            />
          )}

          <main>
            {currentView === "landing" && (
              <>
                {sectionsOrder.map(
                  (sectionId) => sections[sectionId as keyof typeof sections]
                )}
              </>
            )}

            {currentView === "catalog" && (
              <Catalog onProductSelect={handleProductSelect} />
            )}

            {currentView === "product-details" && selectedProduct && (
              <ProductDetails
                product={selectedProduct}
                onBack={() => handleNavigate("catalog")}
                onNavigateToCart={() => handleNavigate("checkout")}
                onProductSelect={handleProductSelect}
                onOpenChat={handleOpenChat}
              />
            )}

            {currentView === "service-details" && selectedService && (
              <ServiceDetails
                service={selectedService}
                onBack={() => handleNavigate("landing")}
                onOpenChat={handleOpenChat}
              />
            )}

            {currentView === "checkout" && (
              <Checkout onBack={() => handleNavigate("catalog")} />
            )}

            {currentView === "admin" && (
              <Admin onBack={() => handleNavigate("landing")} />
            )}
          </main>

          <CartDrawer onCheckout={() => handleNavigate("checkout")} />
          <ChatInterface
            isOpen={isChatOpen}
            onToggle={setIsChatOpen}
            pendingMessage={chatPendingMessage}
            onMessageProcessed={() => setChatPendingMessage(undefined)}
          />
        </div>
      </ScrollProvider>
    </CartProvider>
  );
}

export default App;

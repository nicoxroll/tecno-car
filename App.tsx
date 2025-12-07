import { Toaster } from 'sonner';
import Lenis from "lenis";
import { useEffect, useState } from "react";
import About from "./components/About";
import Admin from "./components/Admin";
import CartDrawer from "./components/CartDrawer";
import Catalog from "./components/Catalog";
import ChatInterface from "./components/ChatInterface";
import Checkout from "./components/Checkout";
import Contact from "./components/Contact";
import FeaturedProducts from "./components/FeaturedProducts";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import Highlights from "./components/Highlights";
import Navbar from "./components/Navbar";
import Newsletter from "./components/Newsletter";
import ProductDetails from "./components/ProductDetails";
import Services from "./components/Services";
import { CartProvider } from "./context/CartContext";
import { ScrollProvider } from "./context/ScrollContext";
import { Product, ViewState } from "./types";

function App() {
  const [currentView, setCurrentView] = useState<ViewState>("landing");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    if (window.location.pathname === '/admin') {
      setCurrentView('admin');
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
    if (view === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    handleNavigate("product-details");
  };

  return (
    <CartProvider>
      <ScrollProvider>
        <Toaster position="top-center" theme="dark" richColors style={{ zIndex: 9999 }} />
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand selection:text-white">
          {currentView !== 'admin' && (
            <Navbar
              onNavigate={handleNavigate}
              currentView={currentView}
              onGoToCheckout={() => handleNavigate("checkout")}
            />
          )}

          <main>
            {currentView === "landing" && (
              <>
                <Hero />
                <Highlights />
                <Services />
                <About />
                <FeaturedProducts onNavigate={handleNavigate} />
                <Gallery />
                <Newsletter />
                <Contact />
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
          <ChatInterface />
        </div>
      </ScrollProvider>
    </CartProvider>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Services from './components/Services';
import About from './components/About';
import FeaturedProducts from './components/FeaturedProducts';
import Gallery from './components/Gallery';
import Newsletter from './components/Newsletter';
import Contact from './components/Contact';
import ChatInterface from './components/ChatInterface';
import Catalog from './components/Catalog';
import ProductDetails from './components/ProductDetails';
import Checkout from './components/Checkout';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import { ScrollProvider } from './context/ScrollContext';
import { ViewState, Product } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    // When switching views, reset scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    handleNavigate('product-details');
  };

  return (
    <CartProvider>
      <ScrollProvider>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand selection:text-white">
          <Navbar 
            onNavigate={handleNavigate} 
            currentView={currentView} 
            onGoToCheckout={() => handleNavigate('checkout')}
          />
          
          <main>
            {currentView === 'landing' && (
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
            
            {currentView === 'catalog' && (
              <Catalog onProductSelect={handleProductSelect} />
            )}

            {currentView === 'product-details' && selectedProduct && (
                <ProductDetails 
                    product={selectedProduct} 
                    onBack={() => handleNavigate('catalog')}
                    onNavigateToCart={() => handleNavigate('checkout')}
                />
            )}

            {currentView === 'checkout' && (
                <Checkout onBack={() => handleNavigate('catalog')} />
            )}
          </main>
          
          <CartDrawer onCheckout={() => handleNavigate('checkout')} />
          <ChatInterface />
        </div>
      </ScrollProvider>
    </CartProvider>
  );
}

export default App;
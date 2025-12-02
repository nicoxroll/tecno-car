import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Highlights from './components/Highlights';
import Services from './components/Services';
import FeaturedProducts from './components/FeaturedProducts';
import Gallery from './components/Gallery';
import Newsletter from './components/Newsletter';
import Contact from './components/Contact';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-brand selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Highlights />
        <Services />
        <FeaturedProducts />
        <Gallery />
        <Newsletter />
        <Contact />
      </main>
      <ChatInterface />
    </div>
  );
}

export default App;
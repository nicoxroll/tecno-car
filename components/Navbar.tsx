import React, { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useScroll } from "../context/ScrollContext";
import { ViewState } from "../types";
import { supabase } from "../services/supabase";

interface NavbarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  onGoToCheckout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentView,
  onGoToCheckout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const { scrollTo } = useScroll();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (
      href === "#home" ||
      href === "#services" ||
      href === "#gallery" ||
      href === "#contact"
    ) {
      if (currentView !== "landing") {
        onNavigate("landing");
        // Give React a moment to render the Landing page before calculating scroll position
        // Increased timeout to allow for data loading and layout shifts
        setTimeout(() => {
          scrollTo(href);
        }, 800);
      } else {
        scrollTo(href);
      }
    } else if (href === "#catalog") {
      onNavigate("catalog");
    }
    setMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "INICIO", href: "#home" },
    { name: "SERVICIOS", href: "#services" },
    { name: "CATÁLOGO", href: "#catalog" },
    { name: "GALERÍA", href: "#gallery" },
    { name: "CONTACTO", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled || currentView !== "landing"
          ? "bg-black/90 border-b border-zinc-800 py-4 backdrop-blur-md"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, "#home")}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-10 h-10 overflow-hidden border border-zinc-800 bg-black rounded-full">
              <img
                src="https://i.ibb.co/dJgTzQQP/merlano-modified.png"
                alt="Merlano Logo"
                className="w-full h-full object-cover filter grayscale transition-all duration-500"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-light text-xl leading-none tracking-tight text-white group-hover:text-zinc-300 transition-colors">
                MERLANO
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                Tecnología Vehicular
              </span>
            </div>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`text-xs font-light tracking-[0.15em] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-white after:transition-all hover:after:w-full ${
                  currentView === "catalog" && link.href === "#catalog"
                    ? "text-white after:w-full"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.name}
              </a>
            ))}

            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              className={`relative transition-colors ${
                currentView === "checkout"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ShoppingCart size={20} strokeWidth={1} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-black text-[9px] flex items-center justify-center font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin Profile Button */}
            {isLoggedIn && (
              <button
                onClick={() => onNavigate("admin")}
                className={`relative transition-colors ${
                  currentView === "admin"
                    ? "text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <User size={20} strokeWidth={1} />
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            {isLoggedIn && (
              <button
                onClick={() => onNavigate("admin")}
                className={`relative transition-colors ${
                  currentView === "admin" ? "text-white" : "text-zinc-400"
                }`}
              >
                <User size={20} strokeWidth={1} />
              </button>
            )}
            <button onClick={handleCartClick} className="relative text-white">
              <ShoppingCart size={20} strokeWidth={1} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-black text-[9px] flex items-center justify-center font-bold rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="text-white hover:text-zinc-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X size={24} strokeWidth={1} />
              ) : (
                <Menu size={24} strokeWidth={1} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black border-b border-zinc-800 animate-fade-in h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex flex-col pt-8 pb-20">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-zinc-300 hover:text-white hover:bg-zinc-900 font-light text-sm tracking-widest py-6 px-8 block border-b border-zinc-900"
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="https://wa.me/5492213334444"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black py-6 px-8 text-sm tracking-widest uppercase font-medium text-center hover:bg-zinc-200 transition-colors mt-8 mx-8 mb-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              Enviar Mensaje
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

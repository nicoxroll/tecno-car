import React from "react";
import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";

interface CartDrawerProps {
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { cart, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } =
    useCart();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCartOpen && e.key === "Escape") {
        setIsCartOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[190] animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-black border-l border-zinc-800 z-[200] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-white" strokeWidth={1} />
            <h2 className="text-white text-lg font-light tracking-widest uppercase">
              Tu Carrito
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} strokeWidth={1} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingBag
                size={48}
                className="mb-4 text-zinc-700"
                strokeWidth={0.5}
              />
              <p className="text-zinc-500 text-sm font-light uppercase tracking-widest">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 animate-fade-in">
                <div className="w-20 h-20 bg-black border border-zinc-800 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-white text-sm font-light mb-1 line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex flex-col">
                      <p className="text-zinc-500 text-[10px] uppercase tracking-wider">
                        {item.category}
                      </p>
                      {item.model && (
                        <p className="text-zinc-600 text-[10px] uppercase tracking-wider">
                          {item.model}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-300 text-xs font-medium">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-xs">
                        x{item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-black">
          <div className="flex justify-between items-center mb-6">
            <span className="text-zinc-500 text-xs uppercase tracking-widest">
              Subtotal
            </span>
            <span className="text-white text-xl font-light">
              ${cartTotal.toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              onCheckout();
            }}
            disabled={cart.length === 0}
            className={`w-full py-4 uppercase tracking-[0.2em] text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              cart.length === 0
                ? "bg-zinc-900 text-zinc-600 cursor-not-allowed"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            Iniciar Compra <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;

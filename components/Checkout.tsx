import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CheckoutProps {
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<'review' | 'success'>('review');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleConfirmOrder = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        setLoading(false);
        setStep('success');
        clearCart();
    }, 2000);
  };

  if (step === 'success') {
    return (
        <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center animate-fade-in">
            <div className="text-center p-8 max-w-lg border border-zinc-800 bg-zinc-950">
                <div className="w-20 h-20 bg-green-900/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} strokeWidth={1} />
                </div>
                <h2 className="text-3xl text-white font-thin uppercase tracking-tight mb-4">¡Pedido Confirmado!</h2>
                <p className="text-zinc-400 font-light text-sm mb-8 leading-relaxed">
                    Muchas gracias por tu compra. Nos pondremos en contacto contigo a la brevedad para coordinar el envío y los detalles finales.
                </p>
                <button 
                    onClick={onBack}
                    className="bg-white text-black py-4 px-8 uppercase tracking-[0.2em] text-xs font-medium hover:bg-zinc-200 transition-colors w-full"
                >
                    Volver al Catálogo
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 animate-fade-in">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-xs uppercase tracking-widest group"
        >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Seguir Comprando
        </button>

        <h1 className="text-3xl md:text-4xl font-thin text-white uppercase tracking-tight mb-12 border-b border-zinc-800 pb-6">
            Finalizar Compra
        </h1>

        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Order Summary */}
            <div className="flex-1">
                <div className="bg-zinc-950 border border-zinc-800 p-6 md:p-8">
                    <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        Resumen del Pedido
                    </h3>
                    
                    {cart.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No hay productos en el carrito.</p>
                    ) : (
                        <div className="space-y-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-white text-sm font-medium">{item.name}</h4>
                                            <button onClick={() => removeFromCart(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-zinc-500 text-xs mb-1">{item.category}</p>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-zinc-400">Cant: {item.quantity}</span>
                                            <span className="text-white">${(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-zinc-800 mt-8 pt-6 space-y-3">
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Subtotal</span>
                            <span>${cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400">
                            <span>Envío</span>
                            <span>A coordinar</span>
                        </div>
                        <div className="flex justify-between text-lg text-white font-medium pt-4 border-t border-zinc-800/50">
                            <span>Total</span>
                            <span>${cartTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Form (Simulation) */}
            <div className="flex-1">
                <div className="bg-zinc-950 border border-zinc-800 p-6 md:p-8">
                    <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        Datos de Contacto
                    </h3>
                    
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleConfirmOrder(); }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Nombre</label>
                                <input type="text" className="w-full bg-black border border-zinc-800 text-white text-sm p-3 focus:border-white outline-none" placeholder="Juan" required />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Apellido</label>
                                <input type="text" className="w-full bg-black border border-zinc-800 text-white text-sm p-3 focus:border-white outline-none" placeholder="Pérez" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Email</label>
                            <input type="email" className="w-full bg-black border border-zinc-800 text-white text-sm p-3 focus:border-white outline-none" placeholder="juan@ejemplo.com" required />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Teléfono / WhatsApp</label>
                            <input type="tel" className="w-full bg-black border border-zinc-800 text-white text-sm p-3 focus:border-white outline-none" placeholder="+54 221 ..." required />
                        </div>
                        
                        <div className="pt-4">
                             <button 
                                type="submit"
                                disabled={loading || cart.length === 0}
                                className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 ${loading || cart.length === 0 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'}`}
                            >
                                {loading ? 'Procesando...' : (
                                    <>
                                        <CreditCard size={16} /> Confirmar Pedido
                                    </>
                                )}
                            </button>
                            <p className="text-[10px] text-zinc-600 mt-4 text-center">
                                Al confirmar, te contactaremos para coordinar el pago y la entrega.
                            </p>
                        </div>
                    </form>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
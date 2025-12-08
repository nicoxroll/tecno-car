import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, CreditCard, CheckCircle, Banknote, Building2, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { toast } from 'sonner';

interface CheckoutProps {
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<'review' | 'success'>('review');
  const [loading, setLoading] = useState(false);
  const [companyPhone, setCompanyPhone] = useState('5492213334444');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');

  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCompanyPhone();
  }, []);

  const fetchCompanyPhone = async () => {
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', 'company_phone')
      .single();
    
    if (data?.value) {
        // Clean phone number for WhatsApp URL
        const cleanPhone = data.value.replace(/\D/g, '');
        setCompanyPhone(cleanPhone || '5492213334444');
    }
  };

  const handleConfirmOrder = async () => {
    if (!formData.name || !formData.lastName) {
        toast.error('Por favor completa nombre y apellido');
        return;
    }

    // Email validation (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
        toast.error('Por favor ingresa un email válido');
        return;
    }

    setLoading(true);
    
    try {
        // Generate unique order code
        const orderCode = `ORD-${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

        // 1. Create order in Supabase
        const orderData = {
            customer: `${formData.name} ${formData.lastName}`,
            total: cartTotal,
            status: 'Pendiente',
            items: cart.map(item => `${item.name} x${item.quantity}`),
            payment_method: paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo',
            date: new Date().toISOString().split('T')[0],
            code: orderCode
        };

        const { error } = await supabase.from('sales').insert([orderData]);
        
        if (error) throw error;

        // 2. Generate WhatsApp Message
        const itemsList = cart.map(item => `• ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toLocaleString()}`).join('%0A');
        const message = `Hola! Quiero confirmar mi pedido:%0A%0A*Código:* ${orderCode}%0A*Cliente:* ${formData.name} ${formData.lastName}%0A${formData.email ? `*Email:* ${formData.email}%0A` : ''}${formData.phone ? `*Teléfono:* ${formData.phone}%0A` : ''}%0A*Pedido:*%0A${itemsList}%0A%0A*Total:* $${cartTotal.toLocaleString()}%0A*Método de Pago:* ${paymentMethod === 'transfer' ? 'Transferencia' : 'Efectivo'}`;
        
        const generatedUrl = `https://wa.me/${companyPhone}?text=${message}`;
        setWhatsappUrl(generatedUrl);
        
        // 3. Redirect to WhatsApp
        window.open(generatedUrl, '_blank');

        setStep('success');
        clearCart();
    } catch (error) {
        console.error('Error creating order:', error);
        toast.error('Hubo un error al procesar el pedido');
    } finally {
        setLoading(false);
    }
  };

  if (step === 'success') {
    return (
        <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center animate-fade-in">
            <div className="text-center p-8 max-w-lg border border-zinc-800 bg-black">
                <div className="w-20 h-20 bg-green-900/20 text-green-500 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} strokeWidth={1} />
                </div>
                <h2 className="text-3xl text-white font-thin uppercase tracking-tight mb-4">¡Pedido Confirmado!</h2>
                <p className="text-zinc-400 font-light text-sm mb-8 leading-relaxed">
                    Muchas gracias por tu compra. Nos pondremos en contacto contigo a la brevedad para coordinar el envío y los detalles finales.
                </p>
                
                <div className="space-y-3">
                    {whatsappUrl && (
                        <a 
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] text-white py-4 px-8 uppercase tracking-[0.2em] text-xs font-medium hover:bg-[#20bd5a] transition-colors w-full flex items-center justify-center gap-2"
                        >
                            <MessageCircle size={18} />
                            Enviar Mensaje de WhatsApp
                        </a>
                    )}
                    
                    <button 
                        onClick={onBack}
                        className="bg-white text-black py-4 px-8 uppercase tracking-[0.2em] text-xs font-medium hover:bg-zinc-200 transition-colors w-full"
                    >
                        Volver al Catálogo
                    </button>
                </div>
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
                <div className="bg-black border border-zinc-800 p-6 md:p-8">
                    <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        Resumen del Pedido
                    </h3>
                    
                    {cart.length === 0 ? (
                        <p className="text-zinc-500 text-sm">No hay productos en el carrito.</p>
                    ) : (
                        <div className="space-y-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-black border border-zinc-800 flex-shrink-0">
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

            {/* Checkout Form */}
            <div className="flex-1">
                <div className="bg-black border border-zinc-800 p-6 md:p-8">
                    <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                        Datos de Contacto
                    </h3>
                    
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleConfirmOrder(); }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Nombre</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-black border border-zinc-800 text-white text-sm p-3 focus:border-white outline-none" 
                                    placeholder="Juan" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Apellido</label>
                                <input 
                                    type="text" 
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    className="w-full bg-black border border-zinc-800 text-white text-sm p-3 focus:border-white outline-none" 
                                    placeholder="Pérez" 
                                    required 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Email <span className="text-zinc-600">(Opcional)</span></label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-black border border-zinc-800 text-white text-sm p-3 focus:border-white outline-none" 
                                placeholder="juan@ejemplo.com" 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Teléfono / WhatsApp <span className="text-zinc-600">(Opcional)</span></label>
                            <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData({...formData, phone: val});
                                }}
                                className="w-full bg-black border border-zinc-800 text-white text-sm p-3 focus:border-white outline-none" 
                                placeholder="54221..." 
                            />
                        </div>

                        {/* Payment Method Selection */}
                        <div className="pt-4 border-t border-zinc-800">
                            <h3 className="text-white text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                                Método de Pago
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('transfer')}
                                    className={`p-4 border flex flex-col items-center justify-center gap-2 transition-all ${
                                        paymentMethod === 'transfer' 
                                        ? 'bg-white text-black border-white' 
                                        : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'
                                    }`}
                                >
                                    <Building2 size={24} strokeWidth={1} />
                                    <span className="text-xs uppercase tracking-widest">Transferencia</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`p-4 border flex flex-col items-center justify-center gap-2 transition-all ${
                                        paymentMethod === 'cash' 
                                        ? 'bg-white text-black border-white' 
                                        : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'
                                    }`}
                                >
                                    <Banknote size={24} strokeWidth={1} />
                                    <span className="text-xs uppercase tracking-widest">Efectivo</span>
                                </button>
                            </div>
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
                                Al confirmar, serás redirigido a WhatsApp para enviar el detalle de tu pedido.
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
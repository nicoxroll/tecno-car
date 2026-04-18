import { CircularProgress } from "@mui/material";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  CheckCircle,
  CreditCard,
  MessageCircle,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { supabase } from "../services/supabase";

interface CheckoutProps {
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBack }) => {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [companyPhone, setCompanyPhone] = useState("5492213334444");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"transfer" | "cash">(
    "transfer"
  );

  const [whatsappUrl, setWhatsappUrl] = useState("");

  const steps = [
    { num: 1, label: "Resumen", icon: CreditCard },
    { num: 2, label: "Datos", icon: MessageCircle },
    { num: 3, label: "Pago", icon: Banknote },
    { num: 4, label: "Éxito", icon: CheckCircle },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCompanyPhone();
  }, []);

  const fetchCompanyPhone = async () => {
    const { data } = await supabase
      .from("site_config")
      .select("value")
      .eq("key", "company_phone")
      .single();

    if (data?.value) {
      // Clean phone number for WhatsApp URL
      const cleanPhone = data.value.replace(/\D/g, "");
      setCompanyPhone(cleanPhone || "5492213334444");
    }
  };

  const validateStep2 = () => {
    if (!formData.name || !formData.lastName || !formData.phone) {
      toast.error("Por favor completa nombre, apellido y teléfono.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      toast.error("Por favor ingresa un email válido.");
      return false;
    }
    return true;
  };

  const handleConfirmOrder = async () => {
    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      // Generate unique order code
      const orderCode = `ORD-${Date.now().toString().slice(-6)}${Math.random()
        .toString(36)
        .substring(2, 5)
        .toUpperCase()}`;

      // 1. Create order in Supabase
      const orderData = {
        customer: `${formData.name} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        total: cartTotal,
        status: "Pendiente",
        items: cart.map(
          (item) =>
            `${item.name}${item.model ? ` (${item.model})` : ""} x${
              item.quantity
            }`
        ),
        payment_method:
          paymentMethod === "transfer" ? "Transferencia" : "Efectivo",
        date: new Date().toISOString().split("T")[0],
        code: orderCode,
      };

      const { data: saleData, error: saleError } = await supabase
        .from("sales")
        .insert([orderData])
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Create sale items
      const saleItems = cart.map((item) => ({
        sale_id: saleData.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // 3. Update stock
      for (const item of cart) {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (product) {
          const currentStock = product.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);
        }
      }

      // 2. Generate WhatsApp Message
      const itemsList = cart
        .map(
          (item) =>
            `• ${item.name}${item.model ? ` (${item.model})` : ""} (x${
              item.quantity
            }) - $${(Number(item.price) * item.quantity).toLocaleString()}`
        )
        .join("%0A");
      const message = `Hola! Quiero confirmar mi pedido:%0A%0A*Código:* ${orderCode}%0A*Cliente:* ${
        formData.name
      } ${formData.lastName}%0A${
        formData.email ? `*Email:* ${formData.email}%0A` : ""
      }${
        formData.phone ? `*Teléfono:* ${formData.phone}%0A` : ""
      }%0A*Pedido:*%0A${itemsList}%0A%0A*Total:* $${cartTotal.toLocaleString()}%0A*Método de Pago:* ${
        paymentMethod === "transfer" ? "Transferencia" : "Efectivo"
      }`;

      const generatedUrl = `https://wa.me/${companyPhone}?text=${message}`;
      setWhatsappUrl(generatedUrl);

      // 3. Redirect to WhatsApp
      window.open(generatedUrl, "_blank");

      setStep(4);
      clearCart();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Hubo un error al procesar el pedido");
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center animate-fade-in">
        <div className="text-center p-8 max-w-lg border border-zinc-800 bg-black">
          <div className="w-20 h-20 bg-green-900/20 text-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} strokeWidth={1} />
          </div>
          <h2 className="text-3xl text-white font-thin uppercase tracking-tight mb-4">
            ¡Pedido Confirmado!
          </h2>
          <p className="text-zinc-400 font-light text-sm mb-8 leading-relaxed">
            Muchas gracias por tu compra. Nos pondremos en contacto contigo a la
            brevedad para coordinar el envío y los detalles finales.
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
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Seguir Comprando
        </button>

        <h1 className="text-3xl md:text-4xl font-thin text-white uppercase tracking-tight mb-12 border-b border-zinc-800 pb-6">
          Finalizar Compra
        </h1>

        <div className="flex flex-col sm:flex-row justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800 -z-10 hidden sm:block"></div>
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div key={s.num} className="flex flex-col items-center bg-black px-4 z-10 mb-4 sm:mb-0 relative">
                <div className="bg-black p-1 border-2 border-transparent">
                  <div
                    className={`w-10 h-10 flex items-center justify-center border transition-colors ${
                      isActive
                        ? "border-white bg-white text-black"
                        : isCompleted
                        ? "border-zinc-500 bg-zinc-900 text-zinc-300"
                        : "border-zinc-800 bg-black text-zinc-600"
                    }`}
                  >
                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest mt-3 transition-colors ${
                    isActive ? "text-white" : isCompleted ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Paso {s.num}: {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            {step === 1 && (
              <div className="bg-black border border-zinc-800 p-6 md:p-8 animate-fade-in">
                <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                  1. Resumen de Productos
                </h3>
                {cart.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No hay productos en el carrito.</p>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-zinc-900/30 p-4 border border-zinc-800/50">
                        <div className="w-20 h-20 bg-black border border-zinc-800 flex-shrink-0">
                          <img src={item.image} alt={item.name} crossOrigin="anonymous" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-white text-sm font-medium pr-4">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-zinc-500 text-xs mb-3">
                            {item.category} {item.model && ` | ${item.model}`}
                          </p>
                          <div className="flex justify-between items-center text-xs mt-2 relative Items">
                            <div className="flex items-center bg-zinc-900 border border-zinc-800">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">-</button>
                              <span className="text-xs text-white px-3 font-medium">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">+</button>
                            </div>
                            <span className="text-white font-medium">
                              ${(Number(item.price) * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={cart.length === 0}
                    className={`py-4 px-8 text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 ${
                      cart.length === 0 ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-white text-black hover:bg-zinc-200"
                    }`}
                  >
                    Continuar <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-black border border-zinc-800 p-6 md:p-8 animate-fade-in">
                <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                  2. Datos de Contacto
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Nombre *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black border border-zinc-800 text-white text-sm p-4 focus:border-white outline-none"
                        placeholder="Juan"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Apellido *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full bg-black border border-zinc-800 text-white text-sm p-4 focus:border-white outline-none"
                        placeholder="Pérez"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Email (Opcional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-black border border-zinc-800 text-white text-sm p-4 focus:border-white outline-none"
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                      className="w-full bg-black border border-zinc-800 text-white text-sm p-4 focus:border-white outline-none"
                      placeholder="Ej. +54 9 221 123 4567"
                      required
                    />
                    <p>
                      <span className="text-[10px] text-zinc-600 mt-2">
                        Solo números. Te contactaremos a este teléfono para coordinar el envio.
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="py-4 px-6 text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 border border-zinc-800 sm:border-none"
                  >
                    <ArrowLeft size={16} /> Volver
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep2()) setStep(3);
                    }}
                    className="py-4 px-8 text-xs uppercase tracking-[0.2em] font-medium text-black bg-white hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                  >
                    Continuar <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-black border border-zinc-800 p-6 md:p-8 animate-fade-in">
                <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                  3. Método de Pago y Envío
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("transfer")}
                    className={`p-6 border flex flex-col items-center justify-center gap-4 transition-all ${
                      paymentMethod === "transfer"
                        ? "bg-white text-black border-white"
                        : "bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    <Building2 size={32} strokeWidth={1} />
                    <span className="text-xs uppercase tracking-widest font-bold">
                      Transferencia
                    </span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-6 border flex flex-col items-center justify-center gap-4 transition-all ${
                      paymentMethod === "cash"
                        ? "bg-white text-black border-white"
                        : "bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    <Banknote size={32} strokeWidth={1} />
                    <span className="text-xs uppercase tracking-widest font-bold">
                      Efectivo
                    </span>
                  </button>
                </div>

                <div className="mt-8 border-t border-zinc-800 pt-6">
                  <p className="text-zinc-400 text-sm text-center font-light leading-relaxed">
                    El envío de tu pedido será coordinado con nuestro equipo luego
                    de la confirmación. Finaliza la compra para enviar el
                    detalle vía WhatsApp.
                  </p>
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="py-4 px-6 text-xs uppercase tracking-[0.2em] font-medium text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2 border border-zinc-800 sm:border-none"
                  >
                    <ArrowLeft size={16} /> Volver
                  </button>
                  <button
                    onClick={handleConfirmOrder}
                    disabled={loading || cart.length === 0}
                    className="py-4 px-8 text-xs uppercase tracking-[0.2em] font-medium text-black bg-white hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-500"
                  >
                    {loading ? (
                      <CircularProgress size={16} sx={{ color: "inherit" }} />
                    ) : (
                      "Finalizar"
                    )}
                    {!loading && <CheckCircle size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-zinc-900/20 border border-zinc-800 p-6 sticky top-24">
              <h3 className="text-white text-sm uppercase tracking-widest mb-6">
                Totales
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Productos ({cart.length})</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Envío</span>
                  <span>A coordinar</span>
                </div>
                <div className="flex justify-between text-white font-medium pt-4 border-t border-zinc-800 text-lg">
                  <span>Total</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

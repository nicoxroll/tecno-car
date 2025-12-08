import React, { useState, useEffect } from "react";
import { loadProducts, loadServices } from "../utils/dataLoader";
import { Product, Service } from "../types";
import { supabase } from "../services/supabase";
import AdminLogin from "./admin/AdminLogin";
import AdminNav from "./admin/AdminNav";
import DashboardStats from "./admin/DashboardStats";
import ProductsManager from "./admin/ProductsManager";
import ServicesManager from "./admin/ServicesManager";
import SalesManager from "./admin/SalesManager";
import SettingsManager from "./admin/SettingsManager";
import GalleryManager from "./admin/GalleryManager";

const Admin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "sales" | "products" | "services" | "gallery" | "settings"
  >("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    const loadData = async () => {
      try {
        const [productsData, servicesData] = await Promise.all([
          loadProducts(),
          loadServices(),
        ]);
        setProducts(productsData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // State is handled by onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} onBack={onBack} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-4 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-4 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://i.ibb.co/dJgTzQQP/merlano-modified.png"
              alt="Merlano Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <h1 className="text-2xl sm:text-3xl font-light text-white uppercase tracking-tight">
              Panel de Administración
            </h1>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={handleLogout}
              className="bg-zinc-800 text-white px-3 py-2 text-xs sm:text-sm hover:bg-zinc-700 transition-colors"
            >
              Cerrar Sesión
            </button>
            <button
              onClick={onBack}
              className="bg-zinc-800 text-white px-3 py-2 text-xs sm:text-sm hover:bg-zinc-700 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        <AdminNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "dashboard" && (
          <DashboardStats products={products} services={services} />
        )}

        {activeTab === "sales" && <SalesManager />}

        {activeTab === "products" && (
          <ProductsManager products={products} setProducts={setProducts} />
        )}

        {activeTab === "services" && (
          <ServicesManager services={services} setServices={setServices} />
        )}

        {activeTab === "gallery" && <GalleryManager />}

        {activeTab === "settings" && <SettingsManager />}
      </div>

      <div className="border-t border-zinc-900 py-8 mt-20">
        <div className="flex justify-center items-center gap-2 opacity-50">
          <span className="text-zinc-600 text-[10px] uppercase tracking-widest">
            Desarrollado por Arise
          </span>
        </div>
      </div>
    </div>
  );
};

export default Admin;

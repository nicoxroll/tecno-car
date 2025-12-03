import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Edit, Trash2, Plus, Save, X, Filter, Search, Settings } from 'lucide-react';
import { Product, Service } from '../types';
import { loadProducts, loadServices } from '../utils/dataLoader';

// Mock data
const mockSalesData = [
  { month: 'Ene', ventas: 12000, pedidos: 45 },
  { month: 'Feb', ventas: 15000, pedidos: 52 },
  { month: 'Mar', ventas: 18000, pedidos: 61 },
  { month: 'Abr', ventas: 22000, pedidos: 78 },
  { month: 'May', ventas: 25000, pedidos: 89 },
  { month: 'Jun', ventas: 28000, pedidos: 95 },
];

const mockOrders = [
  { id: 1, date: '2024-12-01', customer: 'Juan Pérez', total: 25000, status: 'Completado', items: ['Multimedia Android', 'Alarma Positron'] },
  { id: 2, date: '2024-12-02', customer: 'María García', total: 15000, status: 'Pendiente', items: ['Polarizado Completo'] },
  { id: 3, date: '2024-12-03', customer: 'Carlos López', total: 8500, status: 'Completado', items: ['Alarma Positron G8'] },
  { id: 4, date: '2024-12-04', customer: 'Ana Rodríguez', total: 32000, status: 'En proceso', items: ['Multimedia Android', 'Polarizado Completo'] },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Admin: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'products' | 'services' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [creatingProduct, setCreatingProduct] = useState<Partial<Product> | null>(null);
  const [creatingService, setCreatingService] = useState<Partial<Service> | null>(null);
  const [editingCatalogHero, setEditingCatalogHero] = useState(false);
  const [catalogHeroImage, setCatalogHeroImage] = useState('https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=1600');
  const [catalogHeroTitle, setCatalogHeroTitle] = useState('Catálogo');
  const [catalogHeroSubtitle, setCatalogHeroSubtitle] = useState('Admin');
  const [catalogHeroDescription, setCatalogHeroDescription] = useState('Gestión de Productos');
  const [editingMainHero, setEditingMainHero] = useState(false);
  const [mainHeroImage, setMainHeroImage] = useState('https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg?auto=compress&cs=tinysrgb&w=1600');
  const [mainHeroTitle, setMainHeroTitle] = useState('TECNOLOGÍA VEHICULAR');
  const [mainHeroSubtitle, setMainHeroSubtitle] = useState('Merlano');
  const [mainHeroDescription, setMainHeroDescription] = useState('Especialistas en instalación y mantenimiento de tecnología vehicular. Multimedia, audio, seguridad y más.');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [priceRange, setPriceRange] = useState<number>(1000000);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }

    // Load data
    const loadData = async () => {
      try {
        const [productsData, servicesData] = await Promise.all([
          loadProducts(),
          loadServices()
        ]);
        setProducts(productsData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@merlano.com') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
  };

  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateService = (service: Service) => {
    setServices(services.map(s => s.id === service.id ? service : s));
    setEditingService(null);
  };

  const deleteService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
  };

  const createProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Math.max(...products.map(p => p.id), 0) + 1
    };
    setProducts([...products, newProduct]);
    setCreatingProduct(null);
  };

  const createService = (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: Math.max(...services.map(s => s.id), 0) + 1
    };
    setServices([...services, newService]);
    setCreatingService(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black pt-4 pb-12 flex items-center justify-center">
        <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 p-8">
          <h1 className="text-2xl font-light text-white mb-6 text-center uppercase tracking-widest">
            Panel de Administración
          </h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-white text-black py-3 uppercase tracking-widest text-sm font-medium hover:bg-zinc-200 transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
          <button
            onClick={onBack}
            className="w-full mt-4 text-zinc-500 hover:text-white transition-colors text-sm"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-4 pb-12 flex items-center justify-center">
        <div className="text-white text-lg">Cargando datos del panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-4 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img 
              src="https://i.ibb.co/dJgTzQQP/merlano-modified.png" 
              alt="Merlano Logo" 
              className="w-10 h-10 object-contain"
            />
            <h1 className="text-3xl font-light text-white uppercase tracking-tight">
              Panel de Administración
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="bg-zinc-800 text-white px-4 py-2 text-sm hover:bg-zinc-700 transition-colors"
            >
              Cerrar Sesión
            </button>
            <button
              onClick={onBack}
              className="bg-zinc-800 text-white px-4 py-2 text-sm hover:bg-zinc-700 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-zinc-800">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'sales', label: 'Ventas' },
            { id: 'products', label: 'Productos' },
            { id: 'services', label: 'Servicios' },
            { id: 'settings', label: 'Configuración' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 text-sm uppercase tracking-widest transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-black border-b-2 border-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Ventas Totales</h3>
                <p className="text-2xl text-white font-light">$120,000</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Pedidos</h3>
                <p className="text-2xl text-white font-light">420</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Productos</h3>
                <p className="text-2xl text-white font-light">{products.length}</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-zinc-400 text-sm uppercase tracking-widest mb-2">Servicios</h3>
                <p className="text-2xl text-white font-light">{services.length}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-white text-lg mb-6 uppercase tracking-widest">Ventas Mensuales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockSalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                      }}
                    />
                    <Bar dataKey="ventas" fill="#FFFFFF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-white text-lg mb-6 uppercase tracking-widest">Pedidos Mensuales</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockSalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181B',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                      }}
                    />
                    <Line type="monotone" dataKey="pedidos" stroke="#FFFFFF" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Content Management */}
        {activeTab === 'content' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-light text-white uppercase tracking-tight">Gestión de Contenido</h2>
            </div>

            {/* Hero Section */}
            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <h3 className="text-white text-xl mb-6 uppercase tracking-widest">Hero Principal</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Título Principal</label>
                  <input
                    type="text"
                    defaultValue="TECNOLOGÍA VEHICULAR"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Título principal del hero"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Subtítulo</label>
                  <input
                    type="text"
                    defaultValue="Merlano"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Subtítulo del hero"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                  <textarea
                    defaultValue="Especialistas en instalación y mantenimiento de tecnología vehicular. Multimedia, audio, seguridad y más."
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    placeholder="Descripción del hero"
                  />
                </div>
                <div className="flex gap-4">
                  <button className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>

            {/* Catalog Hero Section */}
            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <h3 className="text-white text-xl mb-6 uppercase tracking-widest">Hero del Catálogo</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Título</label>
                  <input
                    type="text"
                    defaultValue="Catálogo"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Título del hero del catálogo"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Subtítulo</label>
                  <input
                    type="text"
                    defaultValue="Admin"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Subtítulo del hero del catálogo"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                  <textarea
                    defaultValue="Gestión de Productos"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    placeholder="Descripción del hero del catálogo"
                  />
                </div>
                <div className="flex gap-4">
                  <button className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Management */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-light text-white uppercase tracking-tight">Gestión de Ventas</h2>
              <button className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2">
                <Plus size={16} />
                Nuevo Pedido
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Productos</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {mockOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 text-sm text-white">#{order.id}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{order.date}</td>
                      <td className="px-6 py-4 text-sm text-white">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-white">${order.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'Completado' ? 'bg-green-900 text-green-300' :
                          order.status === 'Pendiente' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{order.items.join(', ')}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button className="text-zinc-400 hover:text-white">
                            <Edit size={16} />
                          </button>
                          <button className="text-zinc-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-light text-white uppercase tracking-tight">Gestión de Productos</h2>
              <button className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2">
                <Plus size={16} />
                Agregar Producto
              </button>
            </div>

            {/* Catalog Hero - Same as main catalog */}
            <div className="relative h-[40vh] overflow-hidden border-b border-zinc-800 mb-8 cursor-pointer" onClick={() => setEditingCatalogHero(true)}>
              <div className="absolute inset-0 bg-zinc-900/40 z-10 mix-blend-multiply"></div>
              <img
                src={catalogHeroImage}
                alt="Catálogo Admin"
                className="w-full h-full object-cover"
                style={{
                  filter: 'grayscale(100%) contrast(90%) brightness(0.7)'
                }}
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-4xl md:text-6xl font-thin text-white uppercase tracking-tight mb-6 drop-shadow-lg">
                  {catalogHeroTitle} <span className="text-zinc-400">{catalogHeroSubtitle}</span>
                </h1>
                <div className="h-[1px] w-24 bg-white mb-6"></div>
                <p className="text-white font-light tracking-[0.3em] text-xs md:text-sm uppercase drop-shadow-md bg-black/50 px-6 py-3 backdrop-blur-md border border-white/20">
                  {catalogHeroDescription}
                </p>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 px-3 py-2">
                  <span className="text-white text-xs uppercase tracking-widest">Click para editar</span>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              {/* Controls Bar */}
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="flex items-center gap-2 text-white text-xs uppercase tracking-widest border border-zinc-700 px-4 py-2 hover:bg-zinc-900 transition-colors"
                >
                  <Filter size={14} /> {isFiltersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-zinc-500 text-xs tracking-widest">{products.length} PRODUCTOS</span>
                  <button
                    onClick={() => setCreatingProduct({ name: '', category: '', price: 0 })}
                    className="bg-white text-black px-4 py-2 text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} />
                    Agregar Producto
                  </button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 relative">
                {/* Sidebar Filters - Same as catalog */}
                <div className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${isFiltersOpen ? 'w-full lg:w-64 opacity-100 max-h-[1000px] mb-8 lg:mb-0' : 'w-0 opacity-0 max-h-0 lg:max-h-[1000px] lg:w-0'}`}>
                  <div className="space-y-12 pr-4">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="BUSCAR..."
                        className="w-full bg-zinc-950 border-b border-zinc-800 text-white text-xs py-3 pl-2 focus:outline-none focus:border-white transition-colors"
                      />
                      <Search size={14} className="absolute right-2 top-3 text-zinc-500" />
                    </div>

                    {/* Categories */}
                    <div>
                      <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                        Categorías
                      </h3>
                      <div className="space-y-1">
                        {['Todos', 'Multimedia', 'Audio', 'Iluminación', 'Seguridad', 'Accesorios'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`block w-full text-left text-xs py-2 px-2 transition-all duration-200 border-l-2 ${selectedCategory === cat ? 'border-white text-white pl-4 font-medium' : 'border-transparent text-zinc-500 hover:text-zinc-300 pl-2'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
                        Precio Máximo
                      </h3>
                      <div className="px-2">
                        <input
                          type="range"
                          min="50000"
                          max="1000000"
                          step="10000"
                          value={priceRange}
                          onChange={(e) => setPriceRange(Number(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-[10px] text-zinc-500 mt-4 font-mono">
                          <span>$50k</span>
                          <span className="text-white">${priceRange.toLocaleString()}</span>
                          <span>$1M+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Grid - Same as catalog but with edit overlay */}
                <div className="flex-1">
                  <div className={`grid gap-6 transition-all duration-500 ${isFiltersOpen ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'}`}>
                    {products.filter(p =>
                      (selectedCategory === 'Todos' || p.category === selectedCategory) &&
                      p.price <= priceRange
                    ).map(product => (
                      <div key={product.id} className="group bg-zinc-950 border border-zinc-900 hover:border-zinc-700 transition-all duration-300 flex flex-col">
                        <div className="relative aspect-square overflow-hidden bg-black cursor-pointer" onClick={() => setEditingProduct(product)}>
                          <img
                            src={product.image || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                          />
                          {/* Edit Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-white text-center">
                              <Edit size={24} className="mx-auto mb-2" />
                              <span className="text-xs uppercase tracking-widest">Editar</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1 cursor-pointer" onClick={() => setEditingProduct(product)}>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{product.category}</span>
                          <h3 className="text-white font-light text-lg mb-2 group-hover:underline decoration-zinc-500 underline-offset-4">{product.name}</h3>
                          <p className="text-zinc-400 text-xs line-clamp-2 mb-4 flex-1">{product.description || 'Sin descripción'}</p>
                          <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-900">
                            <span className="text-white font-medium text-lg">${product.price.toLocaleString()}</span>
                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest group-hover:text-white transition-colors">Editar</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {products.filter(p =>
                    (selectedCategory === 'Todos' || p.category === selectedCategory) &&
                    p.price <= priceRange
                  ).length === 0 && (
                    <div className="py-24 text-center border border-zinc-900 border-dashed">
                      <p className="text-zinc-500 font-light mb-2">No se encontraron productos en este rango.</p>
                      <button onClick={() => { setPriceRange(1000000); setSelectedCategory('Todos'); }} className="text-white text-xs underline">
                        Limpiar Filtros
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Product Modal */}
            {editingProduct && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
                onClick={() => setEditingProduct(null)}
              >
                <div
                  className="bg-zinc-950 border border-zinc-800 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-light text-white uppercase tracking-tight">Editar Producto</h3>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-zinc-400 hover:text-white transition-colors p-2"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">Imagen del Producto</label>
                        <div className="aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden group cursor-pointer">
                          <img
                            src={editingProduct.image || '/placeholder.jpg'}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      {/* Image URL Input */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">URL de Imagen</label>
                        <input
                          type="text"
                          value={editingProduct.image || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="https://..."
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">O subir archivo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setEditingProduct({...editingProduct, image: e.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 file:bg-zinc-800 file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:uppercase file:text-xs file:tracking-widest hover:file:bg-zinc-700 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Nombre del Producto</label>
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="Nombre del producto"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Categoría</label>
                        <select
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                        >
                          <option value="Multimedia">Multimedia</option>
                          <option value="Audio">Audio</option>
                          <option value="Iluminación">Iluminación</option>
                          <option value="Seguridad">Seguridad</option>
                          <option value="Accesorios">Accesorios</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-400 text-sm mb-2">Precio ($)</label>
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                            className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 text-sm mb-2">Stock</label>
                          <input
                            type="number"
                            value={editingProduct.stock}
                            onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                            className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                        <textarea
                          value={editingProduct.description || ''}
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Descripción del producto"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Características (opcional)</label>
                        <textarea
                          value={editingProduct.features ? editingProduct.features.join('\n') : ''}
                          onChange={(e) => setEditingProduct({...editingProduct, features: e.target.value.split('\n').filter(f => f.trim())})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Una característica por línea"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                          deleteProduct(editingProduct.id);
                          setEditingProduct(null);
                        }
                      }}
                      className="bg-red-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-red-800 transition-colors"
                    >
                      Eliminar Producto
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => updateProduct(editingProduct)}
                        className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Product Modal */}
            {creatingProduct && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
                onClick={() => setCreatingProduct(null)}
              >
                <div
                  className="bg-zinc-950 border border-zinc-800 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-light text-white uppercase tracking-tight">Crear Nuevo Producto</h3>
                    <button
                      onClick={() => setCreatingProduct(null)}
                      className="text-zinc-400 hover:text-white transition-colors p-2"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image */}
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">Imagen del Producto</label>
                      <div className="aspect-square bg-zinc-900 border border-zinc-700 overflow-hidden mb-4">
                        <img
                          src={creatingProduct.image || '/placeholder.jpg'}
                          alt="Nuevo producto"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <input
                        type="url"
                        value={creatingProduct.image || ''}
                        onChange={(e) => setCreatingProduct({...creatingProduct, image: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                        placeholder="URL de la imagen"
                      />
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Nombre del Producto *</label>
                        <input
                          type="text"
                          value={creatingProduct.name || ''}
                          onChange={(e) => setCreatingProduct({...creatingProduct, name: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="Nombre del producto"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Categoría *</label>
                        <select
                          value={creatingProduct.category || ''}
                          onChange={(e) => setCreatingProduct({...creatingProduct, category: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                        >
                          <option value="">Seleccionar categoría</option>
                          <option value="Multimedia">Multimedia</option>
                          <option value="Audio">Audio</option>
                          <option value="Iluminación">Iluminación</option>
                          <option value="Seguridad">Seguridad</option>
                          <option value="Accesorios">Accesorios</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Precio *</label>
                        <input
                          type="number"
                          value={creatingProduct.price || 0}
                          onChange={(e) => setCreatingProduct({...creatingProduct, price: Number(e.target.value)})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                        <textarea
                          value={creatingProduct.description || ''}
                          onChange={(e) => setCreatingProduct({...creatingProduct, description: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Descripción del producto"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Características (opcional)</label>
                        <textarea
                          value={creatingProduct.features ? creatingProduct.features.join('\n') : ''}
                          onChange={(e) => setCreatingProduct({...creatingProduct, features: e.target.value.split('\n').filter(f => f.trim())})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Una característica por línea"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-800">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCreatingProduct(null)}
                        className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (!creatingProduct.name || !creatingProduct.category || !creatingProduct.price) {
                            alert('Por favor completa los campos obligatorios: nombre, categoría y precio.');
                            return;
                          }
                          createProduct(creatingProduct as Omit<Product, 'id'>);
                        }}
                        className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                      >
                        Crear Producto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Catalog Hero Modal */}
            {editingCatalogHero && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
                onClick={() => setEditingCatalogHero(false)}
              >
                <div
                  className="bg-zinc-950 border border-zinc-800 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-light text-white uppercase tracking-tight">Editar Hero del Catálogo</h3>
                    <button
                      onClick={() => setEditingCatalogHero(false)}
                      className="text-zinc-400 hover:text-white transition-colors p-2"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">Imagen del Hero</label>
                        <div className="relative aspect-video bg-zinc-900 border border-zinc-800 overflow-hidden group cursor-pointer">
                          <img
                            src={catalogHeroImage}
                            alt="Hero Preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      {/* Image URL Input */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">URL de Imagen</label>
                        <input
                          type="text"
                          value={catalogHeroImage}
                          onChange={(e) => setCatalogHeroImage(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Título</label>
                        <input
                          type="text"
                          value={catalogHeroTitle}
                          onChange={(e) => setCatalogHeroTitle(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="Título del hero"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Subtítulo</label>
                        <input
                          type="text"
                          value={catalogHeroSubtitle}
                          onChange={(e) => setCatalogHeroSubtitle(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="Subtítulo del hero"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                        <textarea
                          value={catalogHeroDescription}
                          onChange={(e) => setCatalogHeroDescription(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Descripción del hero"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-800">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingCatalogHero(false)}
                        className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => setEditingCatalogHero(false)}
                        className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Services Management */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-light text-white uppercase tracking-tight">Gestión de Servicios</h2>
              <button
                onClick={() => setCreatingService({ title: '', description: '', image: '', category: '' })}
                className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                Agregar Servicio
              </button>
            </div>

            {/* Services Timeline - Same as main services */}
            <section className="py-16 bg-black relative z-20 overflow-hidden">
              {/* Central Line for Desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-zinc-900 transform -translate-x-1/2 z-0"></div>

              <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-thin text-white tracking-tight uppercase mb-4">Tecnología <span className="font-medium text-zinc-500">Aplicada</span></h2>
                  <div className="w-12 h-[1px] bg-white mx-auto"></div>
                </div>

                <div className="space-y-24 md:space-y-0 relative">
                  {services.map((service, index) => {
                    const isEven = index % 2 === 0;

                    return (
                      <div
                        key={service.id}
                        className={`service-item flex flex-col md:flex-row items-center gap-12 md:gap-0 scroll-mt-32 opacity-100 translate-y-0`}
                      >
                        {/* Image Side */}
                        <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 md:text-right order-1 md:order-1' : 'md:pl-16 order-1 md:order-2'}`}>
                          <div
                            className="relative group overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[4/3] cursor-pointer"
                            onClick={() => setEditingService(service)}
                          >
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-500"></div>
                            {/* Edit Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white text-center">
                                <Edit size={24} className="mx-auto mb-2" />
                                <span className="text-xs uppercase tracking-widest">Editar</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Dot on Line - Centered */}
                        <div className="hidden md:flex absolute left-1/2 w-4 h-4 bg-black border border-zinc-500 z-10 items-center justify-center rounded-full transform -translate-x-1/2">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>

                        {/* Text Side */}
                        <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-16 order-2 md:order-2 text-left' : 'md:pr-16 order-2 md:order-1 md:text-right text-left'}`}>
                          <span className="text-[10px] text-zinc-500 tracking-[0.3em] font-medium block mb-4 border-l-2 border-white pl-3 md:border-l-0 md:pl-0">{service.category || `0${index + 1} / SERVICIO`}</span>
                          <h3 className="text-3xl font-light text-white mb-6 leading-tight">{service.title}</h3>
                          <p className="text-zinc-400 font-light text-sm leading-relaxed mb-8 max-w-lg ml-0 md:ml-auto md:mr-0 inline-block">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Edit Service Modal */}
            {editingService && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
                onClick={() => setEditingService(null)}
              >
                <div
                  className="bg-zinc-950 border border-zinc-800 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-light text-white uppercase tracking-tight">Editar Servicio</h3>
                    <button
                      onClick={() => setEditingService(null)}
                      className="text-zinc-400 hover:text-white transition-colors p-2"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">Imagen del Servicio</label>
                        <div className="relative aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden group cursor-pointer">
                          <img
                            src={editingService.image}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      {/* Image URL Input */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">URL de Imagen</label>
                        <input
                          type="text"
                          value={editingService.image}
                          onChange={(e) => setEditingService({...editingService, image: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="https://..."
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">O subir archivo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setEditingService({...editingService, image: e.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 file:bg-zinc-800 file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:uppercase file:text-xs file:tracking-widest hover:file:bg-zinc-700 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Categoría</label>
                        <input
                          type="text"
                          value={editingService.category || ''}
                          onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="Ej: 01 / MULTIMEDIA"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Título del Servicio</label>
                        <input
                          type="text"
                          value={editingService.title}
                          onChange={(e) => setEditingService({...editingService, title: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="Nombre del servicio"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                        <textarea
                          value={editingService.description}
                          onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Descripción detallada del servicio"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Descripción Completa</label>
                        <textarea
                          value={editingService.fullDescription || ''}
                          onChange={(e) => setEditingService({...editingService, fullDescription: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-40 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Descripción completa para el modal de detalles"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800">
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
                          deleteService(editingService.id);
                          setEditingService(null);
                        }
                      }}
                      className="bg-red-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-red-800 transition-colors"
                    >
                      Eliminar Servicio
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingService(null)}
                        className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => updateService(editingService)}
                        className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Service Modal */}
            {creatingService && (
              <div
                className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
                onClick={() => setCreatingService(null)}
              >
                <div
                  className="bg-zinc-950 border border-zinc-800 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-light text-white uppercase tracking-tight">Crear Nuevo Servicio</h3>
                    <button
                      onClick={() => setCreatingService(null)}
                      className="text-zinc-400 hover:text-white transition-colors p-2"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">Imagen del Servicio</label>
                        <div className="relative aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden group cursor-pointer">
                          <img
                            src={creatingService.image || '/placeholder.jpg'}
                            alt="Nuevo servicio"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>

                      {/* Image URL Input */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">URL de Imagen</label>
                        <input
                          type="text"
                          value={creatingService.image || ''}
                          onChange={(e) => setCreatingService({...creatingService, image: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="https://..."
                        />
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">O subir archivo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setCreatingService({...creatingService, image: e.target?.result as string});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 file:bg-zinc-800 file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:uppercase file:text-xs file:tracking-widest hover:file:bg-zinc-700 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Categoría</label>
                        <input
                          type="text"
                          value={creatingService.category || ''}
                          onChange={(e) => setCreatingService({...creatingService, category: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="Ej: 01 / MULTIMEDIA"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Título del Servicio *</label>
                        <input
                          type="text"
                          value={creatingService.title || ''}
                          onChange={(e) => setCreatingService({...creatingService, title: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                          placeholder="Nombre del servicio"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Descripción *</label>
                        <textarea
                          value={creatingService.description || ''}
                          onChange={(e) => setCreatingService({...creatingService, description: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Descripción detallada del servicio"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 text-sm mb-2">Descripción Completa</label>
                        <textarea
                          value={creatingService.fullDescription || ''}
                          onChange={(e) => setCreatingService({...creatingService, fullDescription: e.target.value})}
                          className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-40 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                          placeholder="Descripción completa para el modal de detalles"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-800">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCreatingService(null)}
                        className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (!creatingService.title || !creatingService.description) {
                            alert('Por favor completa los campos obligatorios: título y descripción.');
                            return;
                          }
                          createService(creatingService as Omit<Service, 'id'>);
                        }}
                        className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                      >
                        Crear Servicio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-white uppercase tracking-tight">Configuración</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* General Settings */}
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-white text-lg mb-6 uppercase tracking-widest">Configuración General</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Nombre de la Empresa</label>
                    <input
                      type="text"
                      defaultValue="Merlano Tecnología Vehicular"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Email de Contacto</label>
                    <input
                      type="email"
                      defaultValue="info@merlanotecnologiavehicular.com"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Teléfono</label>
                    <input
                      type="tel"
                      defaultValue="+54 221 333 4444"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Dirección</label>
                    <input
                      type="text"
                      defaultValue="Calle 7 #4143 e 163 y 164, Berisso"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-white text-lg mb-6 uppercase tracking-widest">Horarios de Atención</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">Lunes</label>
                      <input
                        type="text"
                        defaultValue="09:00 - 18:00"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">Martes</label>
                      <input
                        type="text"
                        defaultValue="09:00 - 18:00"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">Miércoles</label>
                      <input
                        type="text"
                        defaultValue="09:00 - 18:00"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">Jueves</label>
                      <input
                        type="text"
                        defaultValue="09:00 - 18:00"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">Viernes</label>
                      <input
                        type="text"
                        defaultValue="09:00 - 18:00"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-sm mb-2">Sábado</label>
                      <input
                        type="text"
                        defaultValue="Cerrado"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-white text-lg mb-6 uppercase tracking-widest">Redes Sociales</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Instagram</label>
                    <input
                      type="url"
                      defaultValue="https://instagram.com/merlanotecnologiavehicular"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Facebook</label>
                    <input
                      type="url"
                      defaultValue="https://facebook.com/merlanotecnologiavehicular"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">WhatsApp</label>
                    <input
                      type="url"
                      defaultValue="https://wa.me/5492213334444"
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-white text-lg mb-6 uppercase tracking-widest">Configuración del Sistema</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Modo Mantenimiento</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Notificaciones por Email</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Backup Automático</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Hero Editor */}
            <div className="bg-zinc-950 border border-zinc-800 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white text-xl uppercase tracking-widest">Hero Principal</h3>
                <button
                  onClick={() => setEditingMainHero(true)}
                  className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Editar Hero
                </button>
              </div>
              <div className="relative h-48 overflow-hidden border border-zinc-800 cursor-pointer" onClick={() => setEditingMainHero(true)}>
                <img
                  src={mainHeroImage}
                  alt="Hero Preview"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'grayscale(100%) contrast(110%) brightness(0.5)'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <h4 className="text-white text-2xl font-light mb-2">{mainHeroTitle}</h4>
                    <p className="text-zinc-400 text-sm">{mainHeroSubtitle}</p>
                    <div className="mt-4 bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2">
                      <span className="text-white text-xs uppercase tracking-widest">Click para editar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                Guardar Cambios
              </button>
            </div>
          </div>
        )}

        {/* Edit Main Hero Modal */}
        {editingMainHero && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={() => setEditingMainHero(false)}
          >
            <div
              className="bg-zinc-950 border border-zinc-800 p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-light text-white uppercase tracking-tight">Editar Hero Principal</h3>
                <button
                  onClick={() => setEditingMainHero(false)}
                  className="text-zinc-400 hover:text-white transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">Imagen del Hero</label>
                    <div className="relative aspect-video bg-zinc-900 border border-zinc-800 overflow-hidden group cursor-pointer">
                      <img
                        src={mainHeroImage}
                        alt="Hero Preview"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Image URL Input */}
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">URL de Imagen</label>
                    <input
                      type="text"
                      value={mainHeroImage}
                      onChange={(e) => setMainHeroImage(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Form Section */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Título Principal</label>
                    <input
                      type="text"
                      value={mainHeroTitle}
                      onChange={(e) => setMainHeroTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                      placeholder="Título principal del hero"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Subtítulo</label>
                    <input
                      type="text"
                      value={mainHeroSubtitle}
                      onChange={(e) => setMainHeroSubtitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                      placeholder="Subtítulo del hero"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                    <textarea
                      value={mainHeroDescription}
                      onChange={(e) => setMainHeroDescription(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                      placeholder="Descripción del hero"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-800">
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingMainHero(false)}
                    className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setEditingMainHero(false)}
                    className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
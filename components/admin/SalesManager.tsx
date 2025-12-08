import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Plus, X, PieChart as PieChartIcon, List, TrendingUp, Calendar, Filter, Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import Modal from './Modal';
import { supabase } from '../../services/supabase';

interface Order {
  id: number;
  code?: string;
  date: string;
  customer: string;
  total: number;
  status: string;
  items: string[];
  payment_method?: string;
}

const SalesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<Order>>({
    code: '',
    customer: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pendiente',
    total: 0,
    items: [],
    payment_method: 'Transferencia'
  });
  const [itemsText, setItemsText] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const orderData: any = {
        customer: formData.customer,
        date: formData.date,
        status: formData.status,
        total: formData.total,
        items: itemsText.split(',').map(item => item.trim()).filter(Boolean),
        payment_method: formData.payment_method
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('sales')
          .update(orderData)
          .eq('id', editingOrder.id);
        if (error) throw error;
        toast.success('Pedido actualizado correctamente');
      } else {
        // Generate code for new manual orders
        orderData.code = `ORD-${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
        
        const { error } = await supabase
          .from('sales')
          .insert([orderData]);
        if (error) throw error;
        toast.success('Pedido creado correctamente');
      }

      fetchOrders();
      closeModal();
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Error al guardar el pedido');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      try {
        const { error } = await supabase
          .from('sales')
          .delete()
          .eq('id', id);
        if (error) throw error;
        fetchOrders();
        toast.success('Pedido eliminado correctamente');
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Error al eliminar el pedido');
      }
    }
  };

  const openCreateModal = () => {
    setFormData({
      customer: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pendiente',
      total: 0,
      items: [],
      payment_method: 'Transferencia'
    });
    setItemsText('');
    setEditingOrder(null);
    setIsCreating(true);
  };

  const openEditModal = (order: Order) => {
    setFormData(order);
    setItemsText(order.items ? order.items.join(', ') : '');
    setEditingOrder(order);
    setIsCreating(true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingOrder(null);
  };

  const stats = useMemo(() => {
    const statusCount = orders.reduce((acc, order) => {
      const status = order.status || 'Desconocido';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    const salesByDate = orders.reduce((acc, order) => {
      if (!order.date) return acc;
      const date = new Date(order.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + (Number(order.total) || 0);
      return acc;
    }, {} as Record<string, number>);

    const salesData = Object.entries(salesByDate)
      .map(([date, total]) => ({ date, total }))
      // Simple sort by date string (DD/MM) might be tricky if spanning years, but sufficient for simple view
      .slice(-10); 

    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    return { statusData, salesData, totalRevenue, averageOrderValue };
  }, [orders]);

  const COLORS = ['#ffffff', '#a1a1aa', '#52525b', '#27272a', '#18181b'];

  const filteredOrders = orders.filter(order => {
    const matchesMethod = filterPaymentMethod === 'all' || order.payment_method === filterPaymentMethod;
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.code && order.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          order.id.toString().includes(searchTerm);
    return matchesMethod && matchesSearch;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">Gestión</h2>
          <div className="flex border border-zinc-800">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
            >
              <List size={14} />
            </button>
            <div className="w-[1px] bg-zinc-800"></div>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'stats' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
            >
              <PieChartIcon size={14} />
            </button>
          </div>
        </div>
        
        {activeTab === 'list' && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 border border-zinc-800 transition-colors flex items-center gap-2 ${showFilters ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                title="Filtros"
            >
                <Filter size={16} />
            </button>
            <button 
                onClick={openCreateModal}
                className="bg-white text-black px-3 py-2 text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2 justify-center flex-1 sm:flex-none"
            >
                <Plus size={14} />
                Nueva Venta
            </button>
          </div>
        )}
      </div>

      {showFilters && activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-1 animate-fade-in">
            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-zinc-500 group-hover:text-white transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="BUSCAR POR CLIENTE O CÓDIGO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-800 text-white pl-8 pr-4 py-2 focus:outline-none focus:border-white transition-colors text-xs uppercase tracking-widest placeholder-zinc-600"
                />
            </div>

            {/* Payment Method Filter */}
            <div className="relative group">
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-800 text-white pl-0 pr-8 py-2 appearance-none focus:outline-none focus:border-white transition-colors text-xs uppercase tracking-widest cursor-pointer"
                >
                  <option value="all" className="bg-black">Todos los Métodos</option>
                  <option value="Transferencia" className="bg-black">Transferencia</option>
                  <option value="Efectivo" className="bg-black">Efectivo</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition-colors" size={14} />
            </div>
        </div>
      )}

      {activeTab === 'list' ? (
        <div className="bg-black border border-zinc-800 overflow-hidden">
        <table className="w-full min-w-[600px]">
          <thead className="bg-black">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Código</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Fecha</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Cliente</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Total</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Pago</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Estado</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Productos</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
               <tr><td colSpan={8} className="text-center py-4 text-zinc-400">Cargando...</td></tr>
            ) : filteredOrders.length === 0 ? (
               <tr><td colSpan={8} className="text-center py-4 text-zinc-400">No hay ventas registradas</td></tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white font-mono">{order.code || `#${order.id}`}</td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">{order.date}</td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white">{order.customer}</td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white">${order.total.toLocaleString()}</td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">{order.payment_method || '-'}</td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm">
                    <span className={`px-2 py-1 text-xs uppercase tracking-wider ${
                      order.status === 'Completado' ? 'bg-green-900/30 text-green-500' :
                      order.status === 'Pendiente' ? 'bg-yellow-900/30 text-yellow-500' :
                      'bg-blue-900/30 text-blue-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                    {order.items && order.items.length > 0 ? order.items.join(', ') : '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(order)} className="text-zinc-400 hover:text-white">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteOrder(order.id)} className="text-zinc-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Ingresos Totales</h3>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">
                ${stats.totalRevenue.toLocaleString('es-AR')}
              </p>
            </div>
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Ticket Promedio</h3>
                <TrendingUp className="text-blue-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">
                ${stats.averageOrderValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">Total Pedidos</h3>
                <Calendar className="text-purple-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">
                {orders.length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-6">Tendencia de Ventas</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="total" fill="#fff" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-6">Estado de Pedidos</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000000', borderColor: '#27272a', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Order Modal */}
      {isCreating && (
        <Modal
          isOpen={true}
          onClose={closeModal}
          title={editingOrder ? `Editar Pedido #${editingOrder.id}` : 'Nuevo Pedido'}
        >
            {/* Form */}
            <div className="space-y-6">
              {editingOrder && (
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Código</label>
                  <input
                    type="text"
                    value={editingOrder.code || '-'}
                    disabled
                    className="w-full bg-black/50 border border-zinc-800 text-zinc-500 px-4 py-3 cursor-not-allowed"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Cliente</label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Método de Pago</label>
                <select
                  value={formData.payment_method || 'Transferencia'}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                >
                  <option value="Transferencia">Transferencia</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Total</label>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: Number(e.target.value)})}
                  className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Productos</label>
                <textarea
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  className="w-full bg-black border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                  placeholder="Lista de productos separados por coma"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-800">
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="bg-zinc-800 text-white px-4 sm:px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="bg-white text-black px-4 sm:px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  {editingOrder ? 'Guardar Cambios' : 'Crear Pedido'}
                </button>
              </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default SalesManager;

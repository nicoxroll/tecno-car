import React, { useState } from 'react';
import { Edit, Trash2, Plus, X } from 'lucide-react';
import Modal from './Modal';

interface Order {
  id: number;
  date: string;
  customer: string;
  total: number;
  status: string;
  items: string[];
}

const mockOrders: Order[] = [
  { id: 1, date: '2024-12-01', customer: 'Juan Pérez', total: 25000, status: 'Completado', items: ['Multimedia Android', 'Alarma Positron'] },
  { id: 2, date: '2024-12-02', customer: 'María García', total: 15000, status: 'Pendiente', items: ['Polarizado Completo'] },
  { id: 3, date: '2024-12-03', customer: 'Carlos López', total: 8500, status: 'Completado', items: ['Alarma Positron G8'] },
  { id: 4, date: '2024-12-04', customer: 'Ana Rodríguez', total: 32000, status: 'En proceso', items: ['Multimedia Android', 'Polarizado Completo'] },
];

const SalesManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setEditingOrder(null);
  };

  const handleDeleteOrder = (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este pedido?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">Gestión de Ventas</h2>
        <button className="bg-white text-black px-3 py-2 text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={16} />
          Nuevo Pedido
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">ID</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Fecha</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Cliente</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Total</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Estado</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Productos</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white">#{order.id}</td>
                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">{order.date}</td>
                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white">{order.customer}</td>
                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white">${order.total.toLocaleString()}</td>
                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'Completado' ? 'bg-green-900 text-green-300' :
                    order.status === 'Pendiente' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-blue-900 text-blue-300'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">{order.items.join(', ')}</td>
                <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingOrder(order)} className="text-zinc-400 hover:text-white">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteOrder(order.id)} className="text-zinc-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Order Modal */}
      {editingOrder && (
        <Modal
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          title={`Editar Pedido #${editingOrder.id}`}
        >


            {/* Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Cliente</label>
                  <input
                    type="text"
                    defaultValue={editingOrder.customer}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Fecha</label>
                  <input
                    type="date"
                    defaultValue={editingOrder.date}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Estado</label>
                <select
                  defaultValue={editingOrder.status}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Completado">Completado</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Total</label>
                <input
                  type="number"
                  defaultValue={editingOrder.total}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Productos</label>
                <textarea
                  defaultValue={editingOrder.items.join(', ')}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                  placeholder="Lista de productos separados por coma"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-800">
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="bg-zinc-800 text-white px-4 sm:px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleUpdateOrder(editingOrder);
                  }}
                  className="bg-white text-black px-4 sm:px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default SalesManager;

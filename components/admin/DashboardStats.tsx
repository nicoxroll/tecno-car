import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Product, Service } from '../../types';

interface DashboardStatsProps {
  products: Product[];
  services: Service[];
}

const mockSalesData = [
  { month: 'Ene', ventas: 12000, pedidos: 45 },
  { month: 'Feb', ventas: 15000, pedidos: 52 },
  { month: 'Mar', ventas: 18000, pedidos: 61 },
  { month: 'Abr', ventas: 22000, pedidos: 78 },
  { month: 'May', ventas: 25000, pedidos: 89 },
  { month: 'Jun', ventas: 28000, pedidos: 95 },
];

const DashboardStats: React.FC<DashboardStatsProps> = ({ products, services }) => {
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mb-2">Ventas Totales</h3>
          <p className="text-xl sm:text-2xl text-white font-light">$120,000</p>
        </div>
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mb-2">Pedidos</h3>
          <p className="text-xl sm:text-2xl text-white font-light">420</p>
        </div>
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mb-2">Productos</h3>
          <p className="text-xl sm:text-2xl text-white font-light">{products.length}</p>
        </div>
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mb-2">Servicios</h3>
          <p className="text-xl sm:text-2xl text-white font-light">{services.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black border border-zinc-800 p-6">
          <h3 className="text-white text-lg mb-6 uppercase tracking-widest">Ventas Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="ventas" fill="#FFFFFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black border border-zinc-800 p-6">
          <h3 className="text-white text-lg mb-6 uppercase tracking-widest">Pedidos Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000000',
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
  );
};

export default DashboardStats;

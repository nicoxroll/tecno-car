import { Calendar, Clock, User } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "../../services/supabase";
import { Product, Service } from "../../types";

interface DashboardStatsProps {
  products: Product[];
  services: Service[];
}

interface Order {
  id: number;
  total: number;
  date: string;
  created_at: string;
}

interface Appointment {
  id: number;
  service_name: string;
  customer_name: string;
  appointment_date: string;
  status: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const DashboardStats: React.FC<DashboardStatsProps> = ({
  products,
  services,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Orders
        const { data: ordersData } = await supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false });

        if (ordersData) setOrders(ordersData);

        // Fetch Appointments
        const { data: appointmentsData } = await supabase
          .from("appointments")
          .select("*")
          .order("appointment_date", { ascending: false })
          .limit(4);

        if (appointmentsData) setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Stats
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;

  // Process Monthly Data
  const monthlyData = useMemo(() => {
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const data = new Array(12).fill(0).map((_, i) => ({
      month: months[i],
      ventas: 0,
      pedidos: 0,
    }));

    orders.forEach((order) => {
      const dateStr = order.date || order.created_at;
      if (dateStr) {
        const date = new Date(dateStr);
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          data[monthIndex].ventas += order.total || 0;
          data[monthIndex].pedidos += 1;
        }
      }
    });

    // Return last 6 months relative to current month
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      if (m < 0) m += 12;
      last6Months.push(data[m]);
    }
    return last6Months;
  }, [orders]);

  // Process Category Data
  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    products.forEach((product) => {
      const cat = product.category || "Otros";
      categories[cat] = (categories[cat] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, [products]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mb-2">
            Ventas Totales
          </h3>
          <p className="text-xl sm:text-2xl text-white font-light">
            ${totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mb-2">
            Pedidos
          </h3>
          <p className="text-xl sm:text-2xl text-white font-light">
            {totalOrders}
          </p>
        </div>
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mb-2">
            Productos
          </h3>
          <p className="text-xl sm:text-2xl text-white font-light">
            {products.length}
          </p>
        </div>
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-zinc-400 text-xs sm:text-sm uppercase tracking-widest mb-2">
            Servicios
          </h3>
          <p className="text-xl sm:text-2xl text-white font-light">
            {services.length}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black border border-zinc-800 p-6">
          <h3 className="text-white text-lg mb-6 uppercase tracking-widest">
            Ventas Mensuales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                }}
              />
              <Bar dataKey="ventas" fill="#FFFFFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black border border-zinc-800 p-6">
          <h3 className="text-white text-lg mb-6 uppercase tracking-widest">
            Pedidos Mensuales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                }}
              />
              <Line
                type="monotone"
                dataKey="pedidos"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 & Recent Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-black border border-zinc-800 p-6">
          <h3 className="text-white text-lg mb-6 uppercase tracking-widest">
            Productos por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Appointments */}
        <div className="bg-black border border-zinc-800 p-6">
          <h3 className="text-white text-lg mb-6 uppercase tracking-widest">
            Turnos Recientes
          </h3>
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h4 className="text-white font-medium text-sm">
                      {apt.service_name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <User size={12} />
                      <span>{apt.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <Calendar size={12} />
                      <span>
                        {new Date(apt.appointment_date).toLocaleDateString()}
                      </span>
                      <Clock size={12} />
                      <span>
                        {new Date(apt.appointment_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      apt.status === "Confirmado"
                        ? "bg-green-900/30 text-green-500"
                        : apt.status === "Pendiente"
                        ? "bg-yellow-900/30 text-yellow-500"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No hay turnos recientes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;

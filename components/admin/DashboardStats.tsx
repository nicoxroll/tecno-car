import { CircularProgress } from "@mui/material";
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
import { Service } from "../../types";

interface DashboardStatsProps {
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

type TimeRange = "all" | "year" | "month" | "week" | "day";

const DashboardStats: React.FC<DashboardStatsProps> = ({ services }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<
    { category: string; created_at?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const getStartDate = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of the day for consistency
    switch (timeRange) {
      case "year":
        now.setFullYear(now.getFullYear() - 1);
        break;
      case "month":
        now.setMonth(now.getMonth() - 1);
        break;
      case "week":
        now.setDate(now.getDate() - 7);
        break;
      case "day":
        // For "day", we want from the start of today? Or last 24h?
        // Usually "Last Day" means "Today" or "Last 24h".
        // Let's assume "Today" (since midnight).
        // If "day" means "Last 24h", we wouldn't setHours(0).
        // Let's stick to "From start of today" if it's "Day", or maybe "Last 24h".
        // User said "ultimo ... dia".
        // Let's use "Last 24 hours" logic or "Since yesterday same time".
        // But usually dashboard filters are "This Year", "This Month".
        // "Ultimo año" -> Last 365 days.
        // "Ultimo dia" -> Last 24 hours.
        // Let's use simple subtraction.
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString();
      default:
        return null;
    }
    return now.toISOString();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const startDate = getStartDate();

        // Fetch Orders
        let ordersQuery = supabase
          .from("sales")
          .select("*")
          .order("created_at", { ascending: false });

        if (startDate) {
          // Use 'date' column if available and reliable, otherwise created_at
          // The 'date' column is the business date.
          ordersQuery = ordersQuery.gte("date", startDate);
        }

        const { data: ordersData } = await ordersQuery;
        if (ordersData) setOrders(ordersData);

        // Fetch Products (Categories only)
        let productsQuery = supabase
          .from("products")
          .select("category, created_at");

        if (startDate) {
          productsQuery = productsQuery.gte("created_at", startDate);
        }

        const { data: productsData } = await productsQuery;
        if (productsData) setProducts(productsData);

        // Fetch Appointments
        let appointmentsQuery = supabase
          .from("appointments")
          .select("*")
          .order("appointment_date", { ascending: false });
        // .limit(4); // Remove limit if we want stats, or keep limit for "Recent"?
        // The UI shows "Turnos Recientes" list, but maybe we want stats too?
        // The component doesn't show appointment stats (count), just the list.
        // But if I filter by "Last Year", showing only 4 is fine for the list.
        // But if I want to show "Total Appointments" count (not currently shown), I'd need all.
        // Currently "Servicios" card shows services count.
        // I'll keep the limit for the list, but maybe increase it or fetch all for stats if I were showing stats.
        // But wait, the user said "filter... on the dashboard about all the info".
        // The "Recent Appointments" list should probably respect the filter.
        // If I filter "Last Day", I should only see appointments from the last day.

        if (startDate) {
          appointmentsQuery = appointmentsQuery.gte(
            "appointment_date",
            startDate
          );
        } else {
          appointmentsQuery = appointmentsQuery.limit(10); // Default limit if no filter
        }

        const { data: appointmentsData } = await appointmentsQuery;
        if (appointmentsData) setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Filter services in memory (since it's a prop)
  const filteredServices = useMemo(() => {
    const startDate = getStartDate();
    if (!startDate) return services;
    return services.filter((s) => {
      // @ts-ignore - created_at might exist at runtime
      const date = s.created_at || s.date;
      if (!date) return true; // Keep if no date
      return new Date(date) >= new Date(startDate);
    });
  }, [services, timeRange]);

  // Calculate Stats
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;

  // Process Chart Data
  const chartData = useMemo(() => {
    if (timeRange === "day") {
      // Group by Hour (0-23)
      const data = new Array(24).fill(0).map((_, i) => ({
        name: `${i}:00`,
        ventas: 0,
        pedidos: 0,
      }));

      orders.forEach((order) => {
        const dateStr = order.date || order.created_at;
        if (dateStr) {
          const date = new Date(dateStr);
          // Only process if it's today (or within the filtered range which is handled by fetch)
          // Since orders are already filtered by fetch, we just map them to hours.
          // However, if the filter is "Last 24h", we might span 2 days.
          // If we want to show relative hours (e.g. "1 hour ago"), that's complex.
          // Let's stick to absolute hours of the day for simplicity, or maybe just map to the hour index.
          const hour = date.getHours();
          if (hour >= 0 && hour < 24) {
            data[hour].ventas += order.total || 0;
            data[hour].pedidos += 1;
          }
        }
      });
      return data;
    } else if (timeRange === "week") {
      // Group by Day of Week
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const data = new Array(7).fill(0).map((_, i) => ({
        name: days[i],
        ventas: 0,
        pedidos: 0,
      }));

      orders.forEach((order) => {
        const dateStr = order.date || order.created_at;
        if (dateStr) {
          const date = new Date(dateStr);
          const dayIndex = date.getDay();
          data[dayIndex].ventas += order.total || 0;
          data[dayIndex].pedidos += 1;
        }
      });

      // Rotate to start from today/tomorrow? Or just standard week?
      // Standard week (Sun-Sat) is fine.
      return data;
    } else if (timeRange === "month") {
      // Group by Day of Month (1-31)
      // We can create an array of days based on the current month or just 1-31.
      const daysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate();
      const data = new Array(daysInMonth).fill(0).map((_, i) => ({
        name: `${i + 1}`,
        ventas: 0,
        pedidos: 0,
      }));

      orders.forEach((order) => {
        const dateStr = order.date || order.created_at;
        if (dateStr) {
          const date = new Date(dateStr);
          const day = date.getDate();
          if (day >= 1 && day <= daysInMonth) {
            data[day - 1].ventas += order.total || 0;
            data[day - 1].pedidos += 1;
          }
        }
      });
      return data;
    } else {
      // Default: Group by Month (Year/All)
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
        name: months[i],
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

      // If "all" or "year", maybe just show all 12 months.
      // The previous logic showed last 6 months.
      // Let's show all 12 months for "Year" view.
      return data;
    }
  }, [orders, timeRange]);

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
        <CircularProgress sx={{ color: "white" }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "Todo" },
          { id: "year", label: "Último Año" },
          { id: "month", label: "Último Mes" },
          { id: "week", label: "Última Semana" },
          { id: "day", label: "Último Día" },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setTimeRange(filter.id as TimeRange)}
            className={`px-4 py-2 text-xs uppercase tracking-widest transition-colors border ${
              timeRange === filter.id
                ? "bg-white text-black border-white"
                : "bg-black text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

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
            {filteredServices.length}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black border border-zinc-800 p-6">
          <h3 className="text-white text-lg mb-6 uppercase tracking-widest">
            Ventas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="ventas" fill="#FFFFFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black border border-zinc-800 p-6">
          <h3 className="text-white text-lg mb-6 uppercase tracking-widest">
            Pedidos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#000000",
                  border: "1px solid #374151",
                  borderRadius: "4px",
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
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
                  color: "#fff",
                }}
                itemStyle={{ color: "#fff" }}
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

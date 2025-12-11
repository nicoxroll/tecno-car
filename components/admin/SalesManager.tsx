import {
  Autocomplete,
  Chip,
  CircularProgress,
  Fade,
  Tooltip as MuiTooltip,
  TextField,
} from "@mui/material";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Filter,
  List,
  PieChart as PieChartIcon,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "../../services/supabase";
import { Order, Product, SaleItem } from "../../types";
import CustomSelect from "../ui/CustomSelect";
import Modal from "./Modal";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const SalesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"list" | "stats">("list");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProducts, setFilterProducts] = useState<Product[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<keyof Order>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Form state
  const [formData, setFormData] = useState<Partial<Order>>({
    code: "",
    customer: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    status: "Pendiente",
    total: 0,
    items: [],
    payment_method: "Transferencia",
  });
  const [itemsText, setItemsText] = useState("");
  const [formSaleItems, setFormSaleItems] = useState<Partial<SaleItem>[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [
    page,
    rowsPerPage,
    filterPaymentMethod,
    searchTerm,
    filterProducts,
    sortField,
    sortDirection,
  ]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("name");
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);

      let saleIds: number[] | null = null;

      if (filterProducts.length > 0) {
        const { data: items } = await supabase
          .from("sale_items")
          .select("sale_id")
          .in(
            "product_id",
            filterProducts.map((p) => p.id)
          );

        if (items) {
          saleIds = [...new Set(items.map((i) => i.sale_id))];
        } else {
          saleIds = [];
        }
      }

      let query = supabase
        .from("sales")
        .select("*, sale_items(*)", { count: "exact" });

      if (saleIds !== null) {
        query = query.in("id", saleIds);
      }

      if (filterPaymentMethod !== "all") {
        query = query.eq("payment_method", filterPaymentMethod);
      }

      if (searchTerm) {
        if (!isNaN(Number(searchTerm))) {
          query = query.or(
            `customer.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,id.eq.${searchTerm},email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
          );
        } else {
          query = query.or(
            `customer.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
          );
        }
      }

      query = query.order(sortField, { ascending: sortDirection === "asc" });

      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const [productStats, setProductStats] = useState<
    { name: string; quantity: number }[]
  >([]);

  useEffect(() => {
    if (activeTab === "stats") {
      fetchProductStats();
    }
  }, [activeTab]);

  const fetchProductStats = async () => {
    const { data, error } = await supabase
      .from("sale_items")
      .select("product_name, quantity");

    if (error) {
      console.error("Error fetching product stats:", error);
      return;
    }

    const stats = data.reduce((acc: any, item: any) => {
      acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity;
      return acc;
    }, {});

    const formattedStats = Object.entries(stats)
      .map(([name, quantity]) => ({
        name,
        quantity: Number(quantity),
      }))
      .sort((a, b) => b.quantity - a.quantity);

    setProductStats(formattedStats);
  };

  useEffect(() => {
    if (formSaleItems.length > 0) {
      const calculatedTotal = formSaleItems.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0),
        0
      );
      setFormData((prev) => ({ ...prev, total: calculatedTotal }));
    }
  }, [formSaleItems]);

  const handleSave = async () => {
    try {
      let calculatedTotal = formData.total;
      let itemsSummary = itemsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (formSaleItems.length > 0) {
        // Recalculate total just in case, but respect manual override if needed?
        // Actually, user asked for auto-sum but editable.
        // If we recalculate here, we ignore manual edits.
        // So we should use formData.total which is updated by the effect or the user.
        calculatedTotal = formData.total;

        itemsSummary = formSaleItems.map(
          (item) => `${item.product_name} x${item.quantity}`
        );
      }

      const orderData: any = {
        customer: formData.customer,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        status: formData.status,
        total: calculatedTotal,
        items: itemsSummary,
        payment_method: formData.payment_method,
      };

      let saleId = editingOrder?.id;

      if (editingOrder) {
        const { error } = await supabase
          .from("sales")
          .upsert({
            id: editingOrder.id,
            ...orderData,
            updated_at: new Date().toISOString(),
          });
        if (error) throw error;
        toast.success("Pedido actualizado correctamente");
      } else {
        // Generate code for new manual orders
        orderData.code = `ORD-${Date.now().toString().slice(-6)}${Math.random()
          .toString(36)
          .substring(2, 5)
          .toUpperCase()}`;

        const { data, error } = await supabase
          .from("sales")
          .insert([
            {
              ...orderData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
        if (error) throw error;
        saleId = data.id;
        toast.success("Pedido creado correctamente");
      }

      // Handle Sale Items
      if (saleId && formSaleItems.length > 0) {
        // Delete existing items for this sale (simple replace strategy)
        if (editingOrder) {
          await supabase.from("sale_items").delete().eq("sale_id", saleId);
        }

        // Insert new items
        const itemsToInsert = formSaleItems.map((item) => ({
          sale_id: saleId,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));

        const { error: itemsError } = await supabase
          .from("sale_items")
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      fetchOrders();
      closeModal();
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Error al guardar el pedido");
    }
  };

  const handleDeleteOrder = async (id: number) => {
    setShowDeleteConfirm(id);
  };

  const confirmDeleteOrder = async () => {
    if (!showDeleteConfirm) return;
    const id = showDeleteConfirm;

    try {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
      fetchOrders();
      toast.success("Pedido eliminado correctamente");
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Error al eliminar el pedido");
    }
  };

  const openCreateModal = () => {
    setFormData({
      customer: "",
      email: "",
      phone: "",
      date: new Date().toISOString().split("T")[0],
      status: "Pendiente",
      total: 0,
      items: [],
      payment_method: "Transferencia",
    });
    setItemsText("");
    setFormSaleItems([]);
    setEditingOrder(null);
    setIsCreating(true);
  };

  const openEditModal = (order: Order) => {
    setFormData(order);
    setItemsText(order.items ? order.items.join(", ") : "");
    setFormSaleItems(order.sale_items || []);
    setEditingOrder(order);
    setIsCreating(true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingOrder(null);
  };

  const stats = useMemo(() => {
    const statusCount = orders.reduce((acc, order) => {
      const status = order.status || "Desconocido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
    }));

    const salesByDate = orders.reduce((acc, order) => {
      if (!order.date) return acc;
      const date = new Date(order.date).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      });
      acc[date] = (acc[date] || 0) + (Number(order.total) || 0);
      return acc;
    }, {} as Record<string, number>);

    const salesData = Object.entries(salesByDate)
      .map(([date, total]) => ({ date, total }))
      // Simple sort by date string (DD/MM) might be tricky if spanning years, but sufficient for simple view
      .slice(-10);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (Number(order.total) || 0),
      0
    );
    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    return { statusData, salesData, totalRevenue, averageOrderValue };
  }, [orders]);

  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">
            Gestión
          </h2>
          <div className="flex border border-zinc-800">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === "list"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <List size={14} />
            </button>
            <div className="w-[1px] bg-zinc-800"></div>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === "stats"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <PieChartIcon size={14} />
            </button>
          </div>
        </div>

        {activeTab === "list" && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const headers = [
                  "ID",
                  "Código",
                  "Fecha",
                  "Cliente",
                  "Total",
                  "Estado",
                  "Método Pago",
                  "Items",
                ];
                const csvContent = [
                  headers.join(";"),
                  ...orders.map((o) =>
                    [
                      o.id,
                      o.code || "",
                      o.date,
                      `"${o.customer}"`,
                      o.total,
                      o.status,
                      o.payment_method || "",
                      `"${(o.items || []).join(", ")}"`,
                    ].join(";")
                  ),
                ].join("\r\n");

                const blob = new Blob(["\uFEFF" + csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute(
                  "download",
                  `ventas_merlano_${
                    new Date().toISOString().split("T")[0]
                  }.csv`
                );
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-2 text-white text-xs uppercase tracking-widest border border-zinc-700 px-3 py-2 hover:bg-zinc-900 transition-colors"
            >
              <Download size={14} /> Exportar
            </button>
            <MuiTooltip
              title="Filtros"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 border border-zinc-800 transition-colors flex items-center justify-center ${
                  showFilters
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Filter size={16} />
              </button>
            </MuiTooltip>
            <MuiTooltip
              title="Nueva Venta"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={openCreateModal}
                className="bg-white text-black px-3 py-2 text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </MuiTooltip>
          </div>
        )}
      </div>

      {showFilters && activeTab === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-1 animate-fade-in">
          {/* Search */}
          <div className="relative group">
            <Search
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-zinc-500 group-hover:text-white transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="BUSCAR POR CLIENTE O CÓDIGO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-800 text-white pl-8 pr-4 py-2 focus:outline-none focus:border-white transition-colors text-xs uppercase tracking-widest placeholder-zinc-600"
            />
          </div>

          {/* Product Filter */}
          <div className="relative group w-full">
            <Autocomplete
              multiple
              options={products}
              getOptionLabel={(option) => option.name}
              value={filterProducts}
              onChange={(_, newValue) => setFilterProducts(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  placeholder={
                    filterProducts.length === 0
                      ? "FILTRAR POR PRODUCTOS..."
                      : ""
                  }
                  sx={{
                    "& .MuiInput-underline:before": {
                      borderBottomColor: "#27272a",
                    },
                    "& .MuiInput-underline:after": {
                      borderBottomColor: "white",
                    },
                    "& .MuiInputBase-input": {
                      color: "white",
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    },
                    "& .MuiInputBase-root": { paddingBottom: "4px" },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li
                  {...props}
                  className="bg-black hover:bg-zinc-900 text-white border-b border-zinc-800 last:border-0"
                >
                  <div className="flex items-center gap-3 w-full">
                    <img
                      src={option.image}
                      alt={option.name}
                      className="w-8 h-8 object-cover"
                    />
                    <span className="text-sm">{option.name}</span>
                  </div>
                </li>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option.name}
                    size="small"
                    {...getTagProps({ index })}
                    sx={{
                      color: "white",
                      borderColor: "#3f3f46",
                      "& .MuiChip-deleteIcon": {
                        color: "#71717a",
                        "&:hover": { color: "white" },
                      },
                    }}
                  />
                ))
              }
              PaperComponent={({ children }) => (
                <div className="bg-black border border-zinc-800 text-white mt-1">
                  {children}
                </div>
              )}
              sx={{
                "& .MuiAutocomplete-popupIndicator": { color: "#71717a" },
                "& .MuiAutocomplete-clearIndicator": { color: "#71717a" },
                "& .MuiAutocomplete-tag": { margin: "2px" },
              }}
            />
          </div>

          {/* Payment Method Filter */}
          <div className="relative group w-full">
            <CustomSelect
              value={filterPaymentMethod}
              onChange={(value) => setFilterPaymentMethod(value)}
              options={[
                { value: "all", label: "Todos los Métodos" },
                { value: "Transferencia", label: "Transferencia" },
                { value: "Efectivo", label: "Efectivo" },
              ]}
            />
          </div>
        </div>
      )}

      {activeTab === "list" ? (
        <div className="bg-black border border-zinc-800 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-black">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1">Código</div>
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1">
                    Fecha
                    {sortField === "date" && (
                      <span className="text-zinc-500">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("customer")}
                >
                  <div className="flex items-center gap-1">
                    Cliente
                    {sortField === "customer" && (
                      <span className="text-zinc-500">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex items-center gap-1">
                    Total
                    {sortField === "total" && (
                      <span className="text-zinc-500">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("payment_method")}
                >
                  <div className="flex items-center gap-1">
                    Pago
                    {sortField === "payment_method" && (
                      <span className="text-zinc-500">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Modificado
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-12">
                    <CircularProgress size={30} sx={{ color: "white" }} />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-4 text-zinc-400">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white font-mono">
                      {order.code || `#${order.id}`}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                      {order.date}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white">
                      {order.customer}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                      {order.email || "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                      {order.phone || "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-white">
                      ${order.total.toLocaleString()}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                      {order.payment_method || "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm">
                      <span
                        className={`px-2 py-1 text-xs uppercase tracking-wider ${
                          order.status === "Completado"
                            ? "bg-green-900/30 text-green-500"
                            : order.status === "Pendiente"
                            ? "bg-yellow-900/30 text-yellow-500"
                            : "bg-blue-900/30 text-blue-500"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString() +
                          " " +
                          new Date(order.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                      {order.updated_at
                        ? new Date(order.updated_at).toLocaleDateString() +
                          " " +
                          new Date(order.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm text-zinc-400">
                      {order.sale_items && order.sale_items.length > 0
                        ? order.sale_items
                            .map((i) => `${i.product_name} x${i.quantity}`)
                            .join(", ")
                        : order.items && order.items.length > 0
                        ? order.items.join(", ")
                        : "-"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-xs sm:text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(order)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
            <div className="text-sm text-zinc-400">
              Mostrando {page * rowsPerPage + 1} a{" "}
              {Math.min((page + 1) * rowsPerPage, totalCount)} de {totalCount}{" "}
              resultados
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-zinc-400">
                Página {page + 1} de{" "}
                {Math.max(1, Math.ceil(totalCount / rowsPerPage))}
              </span>
              <button
                onClick={() =>
                  setPage(
                    Math.min(Math.ceil(totalCount / rowsPerPage) - 1, page + 1)
                  )
                }
                disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">
                  Ingresos Totales
                </h3>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">
                ${stats.totalRevenue.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">
                  Ticket Promedio
                </h3>
                <TrendingUp className="text-blue-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">
                $
                {stats.averageOrderValue.toLocaleString("es-AR", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">
                  Total Pedidos
                </h3>
                <Calendar className="text-purple-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">{orders.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Chart */}
            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-6">
                Tendencia de Ventas
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#000000",
                        borderColor: "#27272a",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="total" fill="#fff" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-6">
                Estado de Pedidos
              </h3>
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
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#000000",
                        borderColor: "#27272a",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Sales Chart */}
            <div className="bg-black border border-zinc-800 p-6 col-span-1 lg:col-span-2">
              <h3 className="text-white text-sm uppercase tracking-widest mb-6">
                Ventas por Producto (Top 10)
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productStats.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#000000",
                        borderColor: "#27272a",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Bar dataKey="quantity" fill="#fff" radius={[0, 0, 0, 0]} />
                  </BarChart>
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
          title={
            editingOrder ? `Editar Pedido #${editingOrder.id}` : "Nuevo Pedido"
          }
        >
          {/* Form */}
          <div className="space-y-6">
            {editingOrder && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    value={editingOrder.code || "-"}
                    disabled
                    className="w-full bg-black/50 border border-zinc-800 text-zinc-500 px-4 py-3 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Creado el
                  </label>
                  <input
                    type="text"
                    value={
                      editingOrder.created_at
                        ? new Date(editingOrder.created_at).toLocaleString()
                        : "-"
                    }
                    disabled
                    className="w-full bg-black/50 border border-zinc-800 text-zinc-500 px-4 py-3 cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Cliente
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData({ ...formData, customer: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Estado</label>
              <CustomSelect
                value={formData.status || "Pendiente"}
                onChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                options={[
                  { value: "Pendiente", label: "Pendiente" },
                  { value: "En proceso", label: "En proceso" },
                  { value: "Completado", label: "Completado" },
                ]}
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Método de Pago
              </label>
              <CustomSelect
                value={formData.payment_method || "Transferencia"}
                onChange={(value) =>
                  setFormData({ ...formData, payment_method: value })
                }
                options={[
                  { value: "Transferencia", label: "Transferencia" },
                  { value: "Efectivo", label: "Efectivo" },
                ]}
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Total</label>
              <input
                type="number"
                value={formData.total}
                onChange={(e) =>
                  setFormData({ ...formData, total: Number(e.target.value) })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>

            {editingOrder && (
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Última Edición
                </label>
                <input
                  type="text"
                  value={
                    editingOrder.updated_at
                      ? new Date(editingOrder.updated_at).toLocaleString()
                      : "-"
                  }
                  disabled
                  className="w-full bg-black/50 border border-zinc-800 text-zinc-500 px-4 py-3 cursor-not-allowed"
                />
              </div>
            )}

            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Productos
              </label>

              {/* Product Selector */}
              <div className="flex gap-4 mb-6 items-end">
                <div className="flex-1">
                  <Autocomplete
                    options={products}
                    getOptionLabel={(option) =>
                      `${option.name} ($${option.price})`
                    }
                    value={
                      products.find(
                        (p) => p.id.toString() === selectedProductId
                      ) || null
                    }
                    onChange={(_, newValue) => {
                      if (newValue)
                        setSelectedProductId(newValue.id.toString());
                      else setSelectedProductId("");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Seleccionar producto"
                        variant="standard"
                        sx={{
                          "& .MuiInput-underline:before": {
                            borderBottomColor: "#27272a",
                          },
                          "& .MuiInput-underline:after": {
                            borderBottomColor: "white",
                          },
                          "& .MuiInputBase-input": { color: "white" },
                          "& .MuiInputLabel-root": { color: "#a1a1aa" },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "white",
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li
                        {...props}
                        className="bg-black hover:bg-zinc-900 text-white border-b border-zinc-800 last:border-0"
                      >
                        <div className="flex items-center gap-3 w-full p-1">
                          <img
                            src={option.image}
                            alt={option.name}
                            className="w-10 h-10 object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium">{option.name}</p>
                            <p className="text-xs text-zinc-400">
                              ${option.price}
                            </p>
                          </div>
                        </div>
                      </li>
                    )}
                    PaperComponent={({ children }) => (
                      <div className="bg-black border border-zinc-800 text-white mt-1">
                        {children}
                      </div>
                    )}
                    sx={{
                      "& .MuiAutocomplete-popupIndicator": { color: "#71717a" },
                      "& .MuiAutocomplete-clearIndicator": { color: "#71717a" },
                    }}
                  />
                </div>
                <div className="w-20">
                  <label className="block text-zinc-400 text-xs mb-1">
                    Cant.
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(Number(e.target.value))
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-2 py-1 text-sm focus:outline-none focus:border-white transition-colors text-center"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!selectedProductId) return;
                    const product = products.find(
                      (p) => p.id.toString() === selectedProductId
                    );
                    if (product) {
                      setFormSaleItems([
                        ...formSaleItems,
                        {
                          product_id: product.id,
                          product_name: product.name,
                          quantity: selectedQuantity,
                          unit_price: product.price,
                        },
                      ]);
                      setSelectedProductId("");
                      setSelectedQuantity(1);
                    }
                  }}
                  className="bg-white text-black px-3 py-2 hover:bg-zinc-200 transition-colors mb-[2px]"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Items Table */}
              {formSaleItems.length > 0 && (
                <div className="mb-4 border border-zinc-800">
                  <table className="w-full text-sm text-left text-zinc-400">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50">
                      <tr>
                        <th className="px-4 py-2">Imagen</th>
                        <th className="px-4 py-2">Producto</th>
                        <th className="px-4 py-2 text-center">Cant.</th>
                        <th className="px-4 py-2 text-right">Precio</th>
                        <th className="px-4 py-2 text-right">Total</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formSaleItems.map((item, index) => {
                        const product = products.find(
                          (p) => p.id === item.product_id
                        );
                        return (
                          <tr
                            key={index}
                            className="border-b border-zinc-800 last:border-0"
                          >
                            <td className="px-4 py-2">
                              {product?.image && (
                                <img
                                  src={product.image}
                                  alt={item.product_name}
                                  className="w-10 h-10 object-cover"
                                />
                              )}
                            </td>
                            <td className="px-4 py-2 text-white">
                              {item.product_name}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-right">
                              ${item.unit_price}
                            </td>
                            <td className="px-4 py-2 text-right">
                              ${(item.quantity || 0) * (item.unit_price || 0)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => {
                                  const newItems = [...formSaleItems];
                                  newItems.splice(index, 1);
                                  setFormSaleItems(newItems);
                                }}
                                className="text-zinc-500 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Legacy Textarea */}
              {formSaleItems.length === 0 && (
                <textarea
                  value={itemsText}
                  onChange={(e) => setItemsText(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 min-h-[100px] resize-none"
                  placeholder="Lista de productos (Legacy/Texto simple)"
                />
              )}
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
                {editingOrder ? "Guardar Cambios" : "Crear Pedido"}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title="Eliminar Pedido"
        >
          <div className="space-y-6">
            <p className="text-zinc-300">
              ¿Estás seguro de que deseas eliminar este pedido? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-zinc-800 text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteOrder}
                className="bg-red-600 text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SalesManager;

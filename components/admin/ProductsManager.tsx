import { CircularProgress, Fade, Tooltip as MuiTooltip } from "@mui/material";
import {
  AlertTriangle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Edit,
  Filter,
  Grid,
  Layers,
  List,
  Minus,
  Package,
  PieChart as PieChartIcon,
  Plus,
  Search,
  Table as TableIcon,
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
import { deleteImage, supabase, uploadImage } from "../../services/supabase";
import { Product } from "../../types";
import CustomSelect from "../ui/CustomSelect";
import Modal from "./Modal";

// Utilidad para convertir el texto de características a array limpio
function parseFeaturesText(featuresText?: string): string[] | undefined {
  if (!featuresText) return undefined;
  const arr = featuresText
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => f.length > 0);
  return arr.length > 0 ? arr : undefined;
}

interface ProductsManagerProps {}

const ProductsManager: React.FC<ProductsManagerProps> = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(6);
  const [totalCount, setTotalCount] = useState(0);

  const [activeTab, setActiveTab] = useState<"products" | "stats">("products");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("Todas");
  const [selectedModel, setSelectedModel] = useState<string>("Todos");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    sections: true,
    categories: true,
    brands: true,
    models: true,
    tags: true,
    price: true,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [modalTagInput, setModalTagInput] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creatingProduct, setCreatingProduct] =
    useState<Partial<Product> | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Multi Select State
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Categories and Sections State
  const [categories, setCategories] = useState<string[]>([
    "Multimedia",
    "Audio",
    "Iluminación",
    "Seguridad",
    "Accesorios",
    "Limpieza",
  ]);
  const [sectionsData, setSectionsData] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("key, value")
        .in("key", ["catalog_filters", "catalog_sections"]);

      if (data) {
        const filtersConfig = data.find((d) => d.key === "catalog_filters");
        const sectionsConfig = data.find((d) => d.key === "catalog_sections");

        try {
          if (filtersConfig?.value) {
            setCategories(JSON.parse(filtersConfig.value));
          }
          if (sectionsConfig?.value) {
            setSectionsData(JSON.parse(sectionsConfig.value));
          }
        } catch (e) {
          console.error("Error parsing config", e);
        }
      }
    };
    fetchConfig();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase.from("products").select("*", { count: "exact" });

      if (selectedSection && selectedSection !== "Todas") {
        query = query.eq("section", selectedSection);
      }

      if (selectedCategory && selectedCategory !== "Todos") {
        query = query.eq("category", selectedCategory);
      }

      if (selectedBrand && selectedBrand !== "Todas") {
        query = query.eq("brand", selectedBrand);
      }

      if (selectedModel && selectedModel !== "Todos") {
        query = query.eq("model", selectedModel);
      }

      if (minPrice > 0) {
        query = query.gte("price", minPrice);
      }
      if (maxPrice < 1000000) {
        query = query.lte("price", maxPrice);
      }

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (searchTags.length > 0) {
        query = query.contains("tags", searchTags);
      }

      query = query.order(sortField, { ascending: sortDirection === "asc" });

      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    page,
    rowsPerPage,
    selectedCategory,
    minPrice,
    maxPrice,
    selectedSection,
    selectedBrand,
    selectedModel,
    searchQuery,
    searchTags,
    sortField,
    sortDirection,
  ]);

  // Available brands derived from currently queried products and sectionsData configuration
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    sectionsData.forEach((s) => {
      if (s.brands) {
        s.brands.forEach((b: string) => brandsSet.add(b));
      }
    });
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return ["Todas", ...Array.from(brandsSet).sort()];
  }, [sectionsData, products]);

  // Available models derived from products directly
  const availableModels = useMemo(() => {
    const modelsSet = new Set<string>();
    products.forEach((p) => {
      if (p.model) modelsSet.add(p.model);
    });
    return ["Todos", ...Array.from(modelsSet).sort()];
  }, [products]);

  const toggleFilter = (key: string) => {
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Bulk Update State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkConfig, setBulkConfig] = useState<{
    type: "amount" | "percentage";
    value: number;
    action: "increase" | "decrease";
  }>({ type: "percentage", value: 0, action: "increase" });
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );

  const categoryStats = useMemo(() => {
    const stats = products.reduce(
      (acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [products]);

  const productStats = useMemo(() => {
    const totalValue = products.reduce(
      (sum, p) => sum + Number(p.price) * (p.stock || 0),
      0,
    );
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockCount = products.filter((p) => (p.stock || 0) < 5).length;

    // Top 5 most expensive products
    const topExpensive = [...products]
      .sort((a, b) => Number(b.price) - Number(a.price))
      .slice(0, 5)
      .map((p) => ({
        name: p.name.substring(0, 15) + "...",
        price: Number(p.price),
      }));

    return { totalValue, totalStock, lowStockCount, topExpensive };
  }, [products]);

  const COLORS = [
    "#ffffff",
    "#a1a1aa",
    "#52525b",
    "#27272a",
    "#18181b",
    "#71717a",
  ];

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !searchTags.includes(newTag)) {
        setSearchTags([...searchTags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSearchTags(searchTags.filter((tag) => tag !== tagToRemove));
  };

  const handleModalTagInput = (
    e: React.KeyboardEvent<HTMLInputElement>,
    isEditing: boolean,
  ) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = modalTagInput.trim();
      if (newTag) {
        if (isEditing && editingProduct) {
          const currentTags = editingProduct.tags || [];
          if (!currentTags.includes(newTag)) {
            setEditingProduct({
              ...editingProduct,
              tags: [...currentTags, newTag],
            });
          }
        } else if (!isEditing && creatingProduct) {
          const currentTags = creatingProduct.tags || [];
          if (!currentTags.includes(newTag)) {
            setCreatingProduct({
              ...creatingProduct,
              tags: [...currentTags, newTag],
            });
          }
        }
      }
      setModalTagInput("");
    }
  };

  const removeModalTag = (tagToRemove: string, isEditing: boolean) => {
    if (isEditing && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        tags: (editingProduct.tags || []).filter((t) => t !== tagToRemove),
      });
    } else if (!isEditing && creatingProduct) {
      setCreatingProduct({
        ...creatingProduct,
        tags: (creatingProduct.tags || []).filter((t) => t !== tagToRemove),
      });
    }
  };

  const handleBulkUpdate = async () => {
    if (bulkConfig.value <= 0) return;
    setShowBulkConfirm(true);
  };

  const confirmBulkUpdate = async () => {
    try {
      const updates = products.map((p) => {
        let newPrice = Number(p.price);
        const change =
          bulkConfig.type === "percentage"
            ? newPrice * (bulkConfig.value / 100)
            : bulkConfig.value;

        if (bulkConfig.action === "increase") {
          newPrice += change;
        } else {
          newPrice -= change;
        }
        newPrice = Math.round(newPrice);

        let newDiscountPrice = p.discount_price;
        if (p.discount_price && p.discount_price < Number(p.price)) {
          if (bulkConfig.type === "percentage") {
            const discountChange = Number(p.discount_price) * (bulkConfig.value / 100);
            newDiscountPrice = bulkConfig.action === "increase" ? Number(p.discount_price) + discountChange : Number(p.discount_price) - discountChange;
            newDiscountPrice = Math.round(newDiscountPrice);
          } else {
             // For amount change, adjust discount price proportionally or keep ratio? Assuming proportional to the original discount.
             const discountRatio = Number(p.discount_price) / Number(p.price);
             newDiscountPrice = Math.round(newPrice * discountRatio);
          }
        }

        return { ...p, price: newPrice, discount_price: newDiscountPrice };
      });

      const { error } = await supabase.from("products").upsert(updates);

      if (error) throw error;

      setProducts(updates);
      setIsBulkModalOpen(false);
      setShowBulkConfirm(false);
      toast.success("Precios actualizados correctamente");
    } catch (error) {
      console.error("Error bulk updating:", error);
      toast.error("Error al actualizar precios masivamente");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Nombre",
      "Categoría",
      "Precio",
      "Stock",
      "Disponible",
      "Destacado",
      "Descripción",
      "Modelo",
      "Etiquetas",
      "Fecha Creación",
      "Última Modificación",
    ];
    const csvContent = [
      headers.join(";"),
      ...products.map((p) =>
        [
          p.id,
          `"${(p.name || "").replace(/"/g, '""')}"`,
          p.category,
          p.price,
          p.stock || 0,
          p.available === true ? "Sí" : p.available === false ? "No" : "Oculto",
          p.featured ? "Sí" : "No",
          `"${(p.description || "")
            .replace(/"/g, '""')
            .replace(/(\r\n|\n|\r)/gm, " ")}"`,
          `"${(p.model || "").replace(/"/g, '""')}"`,
          `"${(p.tags || []).join(", ")}"`,
          p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
          p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "",
        ].join(";"),
      ),
    ].join("\r\n");

    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `productos_merlano_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateProduct = async (product: any) => {
    try {
      const features = parseFeaturesText(product.featuresText);
      const productToUpdate = {
        ...product,
        features,
      };
      delete productToUpdate.featuresText;
      const { error } = await supabase.from("products").upsert(productToUpdate);

      if (error) throw error;

      setProducts(products.map((p) => (p.id === product.id ? productToUpdate : p)));
      setEditingProduct(null);
      toast.success("Producto actualizado correctamente");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error al actualizar el producto");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      // Keep image reference to remove it from storage after DB deletion.
      const productToDelete = products.find((p) => p.id === id);

      // Remove dependent sale items first to satisfy FK constraints.
      const { error: saleItemsError } = await supabase
        .from("sale_items")
        .delete()
        .eq("product_id", id);

      if (saleItemsError) throw saleItemsError;

      const { data: deletedProduct, error: productDeleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (productDeleteError) throw productDeleteError;

      if (!deletedProduct) {
        toast.error("No se pudo eliminar el producto (no encontrado)");
        return;
      }

      // Image cleanup should not block a successful product deletion.
      if (productToDelete?.image) {
        await deleteImage(productToDelete.image);
      }

      setDeletingProductId(null);
      if (page !== 0) {
        setPage(0);
      } else {
        await fetchProducts();
      }
      toast.success("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error deleting product:", error);
      const message = (error as { message?: string })?.message || "";
      if (message.includes("violates foreign key constraint")) {
        toast.error(
          "No se pudo eliminar porque el producto tiene registros relacionados",
        );
      } else {
        toast.error("Error al eliminar el producto");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      // Find products to delete (for image cleanup later)
      const productsToDelete = products.filter((p) => selectedIds.includes(p.id));

      // First delete dependent sale items
      const { error: saleItemsError } = await supabase
        .from("sale_items")
        .delete()
        .in("product_id", selectedIds);

      if (saleItemsError) throw saleItemsError;

      // Delete the products
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .in("id", selectedIds);

      if (deleteError) throw deleteError;

      // Clean up images non-blockingly
      for (const product of productsToDelete) {
        if (product.image) {
          try {
            await deleteImage(product.image);
          } catch (e) {
            console.error("Error cleaning up image:", e);
          }
        }
      }

      setShowBulkDeleteConfirm(false);
      setSelectedIds([]);
      setIsMultiSelectMode(false);
      if (page !== 0) {
        setPage(0);
      } else {
        await fetchProducts();
      }
      toast.success(`${productsToDelete.length} productos eliminados correctamente`);
    } catch (error) {
      console.error("Error en eliminación masiva:", error);
      toast.error("Error al eliminar los productos seleccionados");
    }
  };

  const handleCreateProduct = async (product: any) => {
    try {
      const features = parseFeaturesText(product.featuresText);
      const productData = {
        name: product.name,
        price: product.price,
        discount_price: product.discount_price,
        image: product.image,
        category: product.category,
        section: product.section,
        description: product.description || "",
        features,
        stock: product.stock || 0,
        available: product.available !== undefined ? product.available : true,
        featured: product.featured ?? false,
        tags: product.tags || [],
        model: product.model,
        brand: product.brand,
      };

      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setProducts([...products, data[0] as Product]);
        setCreatingProduct(null);
        toast.success("Producto creado correctamente");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error al crear el producto: " + (error as any).message);
    }
  };

  const handleSort = (field: string) => {
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
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === "products"
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

        {activeTab === "products" && (
          <div className="flex gap-2">
            <MuiTooltip
              title="Exportar CSV"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center text-white text-xs uppercase tracking-widest border border-zinc-700 px-3 py-2 hover:bg-zinc-900 transition-colors"
              >
                <Download size={16} />
              </button>
            </MuiTooltip>
            <MuiTooltip
              title="Filtros"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`px-3 py-2 border border-zinc-800 transition-colors flex items-center justify-center ${
                  isFiltersOpen
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Filter size={16} />
              </button>
            </MuiTooltip>
            <MuiTooltip
              title="Actualización Masiva"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center justify-center text-white text-xs uppercase tracking-widest border border-zinc-700 px-3 py-2 hover:bg-zinc-900 transition-colors"
                disabled={isMultiSelectMode}
              >
                <Layers size={16} className={isMultiSelectMode ? "opacity-50" : ""} />
              </button>
            </MuiTooltip>
            <MuiTooltip
              title="Selección Múltiple"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={() => {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  setSelectedIds([]);
                }}
                className={`flex items-center justify-center text-xs uppercase tracking-widest border px-3 py-2 transition-colors ${
                  isMultiSelectMode
                    ? "bg-white text-black border-white"
                    : "text-white border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <CheckSquare size={16} />
              </button>
            </MuiTooltip>
            {isMultiSelectMode && selectedIds.length > 0 && (
              <MuiTooltip
                title={`Eliminar seleccionados (${selectedIds.length})`}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
              >
                <button
                  onClick={() => setShowBulkDeleteConfirm(true)}
                  className="flex items-center justify-center text-white bg-red-900/50 hover:bg-red-800 text-xs uppercase tracking-widest border border-red-900 px-3 py-2 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </MuiTooltip>
            )}

            <MuiTooltip
              title="Nuevo Producto"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={() => {
                  setModalTagInput("");
                  setCreatingProduct({
                    name: "",
                    category: "",
                    section: sectionsData.length > 0 ? sectionsData[0].id : "",
                    price: 0,
                    image:
                      "https://images.pexels.com/photos/17345649/pexels-photo-17345649.jpeg?auto=compress&cs=tinysrgb&w=800",
                    description: "",
                    features: [],
                    stock: 0,
                    available: true,
                    featured: false,
                  });
                }}
                className="bg-white text-black px-3 py-2 text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </MuiTooltip>
          </div>
        )}
      </div>

      {activeTab === "stats" && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">
                  Valor del Inventario
                </h3>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">
                ${productStats.totalValue.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">
                  Total Productos
                </h3>
                <Package className="text-blue-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">
                {products.length}{" "}
                <span className="text-sm text-zinc-500">
                  ({productStats.totalStock} unidades)
                </span>
              </p>
            </div>
            <div className="bg-black border border-zinc-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400 text-sm uppercase tracking-wider">
                  Stock Bajo
                </h3>
                <AlertTriangle className="text-yellow-500" size={20} />
              </div>
              <p className="text-3xl font-light text-white">
                {productStats.lowStockCount}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution Chart */}
            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <PieChartIcon size={14} /> Distribución por Categorías
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryStats.map((_, index) => (
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

            {/* Top Expensive Products Chart */}
            <div className="bg-black border border-zinc-800 p-6">
              <h3 className="text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp size={14} /> Productos de Mayor Valor
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productStats.topExpensive}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#27272a"
                      horizontal={false}
                    />
                    <XAxis type="number" stroke="#71717a" fontSize={12} hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#71717a"
                      fontSize={10}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#000000",
                        borderColor: "#27272a",
                        color: "#fff",
                      }}
                      itemStyle={{ color: "#fff" }}
                      formatter={(value: number) => [
                        `$${value.toLocaleString()}`,
                        "Precio",
                      ]}
                    />
                    <Bar
                      dataKey="price"
                      fill="#fff"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-12 relative">
          {/* Sidebar Filters */}
          <div
            className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${
              isFiltersOpen
                ? "w-full lg:w-64 opacity-100 max-h-[1000px] mb-8 lg:mb-0"
                : "w-0 opacity-0 max-h-0 lg:max-h-[1000px] lg:w-0 border-0 p-0"
            }`}
          >
            <div className={`space-y-12 pr-4 ${!isFiltersOpen && "hidden"}`}>
              {/* Search Mockup */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border-b border-zinc-800 text-white text-xs py-3 pl-2 focus:outline-none focus:border-white transition-colors"
                />
                <Search
                  size={14}
                  className="absolute right-2 top-3 text-zinc-500"
                />
              </div>

              {/* Sections */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilter("sections")}
                  className="w-full text-white text-xs font-bold uppercase tracking-widest mb-6 flex justify-between items-center"
                >
                  <span>Secciones</span>
                  {expandedFilters.sections ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedFilters.sections && (
                  <div className="space-y-1 mt-2">
                    {[
                      { id: "Todas", title: "Todas" },
                      ...sectionsData.map((s) => ({ id: s.id, title: s.title }))
                    ].map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => {
                          setSelectedSection(sec.id === "Todas" ? "" : sec.id);
                          setSelectedCategory("Todos");
                        }}
                        className={`block w-full text-left text-xs py-2 px-2 transition-all duration-200 border-l-2 ${
                          (selectedSection === sec.id) || (selectedSection === "" && sec.id === "Todas")
                            ? "border-white text-white pl-4 font-medium"
                            : "border-transparent text-zinc-500 hover:text-zinc-300 pl-2"
                        }`}
                      >
                        {sec.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilter("categories")}
                  className="w-full text-white text-xs font-bold uppercase tracking-widest mb-6 flex justify-between items-center"
                >
                  <span>Categorías</span>
                  {expandedFilters.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedFilters.categories && (
                  <div className="space-y-1 mt-2">
                    {["Todos", ...categories].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`block w-full text-left text-xs py-2 px-2 transition-all duration-200 border-l-2 ${
                          selectedCategory === cat
                            ? "border-white text-white pl-4 font-medium"
                            : "border-transparent text-zinc-500 hover:text-zinc-300 pl-2"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Brands */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilter("brands")}
                  className="w-full text-white text-xs font-bold uppercase tracking-widest mb-6 flex justify-between items-center"
                >
                  <span>Marcas</span>
                  {expandedFilters.brands ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedFilters.brands && (
                  <div className="space-y-1 mt-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {availableBrands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(b)}
                        className={`block w-full text-left text-xs py-2 px-2 transition-all duration-200 border-l-2 ${
                          selectedBrand === b
                            ? "border-white text-white pl-4 font-medium"
                            : "border-transparent text-zinc-500 hover:text-zinc-300 pl-2"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Models */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilter("models")}
                  className="w-full text-white text-xs font-bold uppercase tracking-widest mb-6 flex justify-between items-center"
                >
                  <span>Modelos</span>
                  {expandedFilters.models ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedFilters.models && (
                  <div className="space-y-1 mt-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {availableModels.map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedModel(m)}
                        className={`block w-full text-left text-xs py-2 px-2 transition-all duration-200 border-l-2 ${
                          selectedModel === m
                            ? "border-white text-white pl-4 font-medium"
                            : "border-transparent text-zinc-500 hover:text-zinc-300 pl-2"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilter("tags")}
                  className="w-full text-white text-xs font-bold uppercase tracking-widest mb-6 flex justify-between items-center"
                >
                  <span>Etiquetas</span>
                  {expandedFilters.tags ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedFilters.tags && (
                  <div className="mt-2">
                    <div className="relative mb-3">
                      <input
                        type="text"
                        placeholder="FILTRAR POR ETIQUETA..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInput}
                        className="w-full bg-black border-b border-zinc-800 text-white text-xs py-2 pl-2 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    {searchTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {searchTags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-zinc-800 text-white text-[10px] px-2 py-1 flex items-center gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-400"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleFilter("price")}
                  className="w-full text-white text-[10px] font-bold uppercase tracking-widest mb-6 border-t border-zinc-800 pt-6 flex justify-between items-center"
                >
                  <span>RANGO DE PRECIO</span>
                  {expandedFilters.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expandedFilters.price && (
                  <div className="space-y-4 px-1 mt-2">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase text-zinc-500 tracking-wider">
                        MÍNIMO
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={maxPrice}
                        value={minPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val <= maxPrice) setMinPrice(val);
                        }}
                        className="bg-transparent text-white text-xs font-mono text-right w-20 focus:outline-none border-b border-zinc-800 focus:border-white transition-colors"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={minPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= maxPrice) setMinPrice(val);
                      }}
                      className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer accent-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase text-zinc-500 tracking-wider">
                        MÁXIMO
                      </label>
                      <input
                        type="number"
                        min={minPrice}
                        max="1000000"
                        value={maxPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= minPrice) setMaxPrice(val);
                        }}
                        className="bg-transparent text-white text-xs font-mono text-right w-20 focus:outline-none border-b border-zinc-800 focus:border-white transition-colors"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={maxPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= minPrice) setMaxPrice(val);
                      }}
                      className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer accent-white"
                    />
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Table/Grid */}
          <div className="flex-1 w-full min-w-0">
            <div className="bg-black border border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 text-sm">
                  {totalCount} productos encontrados
                </span>
                <div className="flex border border-zinc-800">
                  <MuiTooltip
                    title="Vista Cuadrícula"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 transition-colors ${
                        viewMode === "grid"
                          ? "bg-white text-black"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                      }`}
                    >
                      <Grid size={16} />
                    </button>
                  </MuiTooltip>
                  <div className="w-[1px] bg-zinc-800"></div>
                  <MuiTooltip
                    title="Vista Tabla"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-2 transition-colors ${
                        viewMode === "table"
                          ? "bg-white text-black"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                      }`}
                    >
                      <TableIcon size={16} />
                    </button>
                  </MuiTooltip>
                </div>
              </div>

              {/* Table View */}
              {viewMode === "table" && (
                <div className="overflow-x-auto w-full bg-black border border-zinc-800">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-black">
                      <tr>
                        {isMultiSelectMode && (
                          <th className="px-4 py-3 text-left w-12">
                            <input
                              type="checkbox"
                              checked={selectedIds.length === products.length && products.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds(products.map(p => p.id));
                                } else {
                                  setSelectedIds([]);
                                }
                              }}
                              className="w-4 h-4 bg-black border border-zinc-700 rounded focus:ring-0 checked:bg-white"
                            />
                          </th>
                        )}
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center gap-1">
                            Producto
                            {sortField === "name" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center gap-1">
                            Categoría
                            {sortField === "category" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("price")}
                        >
                          <div className="flex items-center gap-1">
                            Precio
                            {sortField === "price" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("stock")}
                        >
                          <div className="flex items-center gap-1">
                            Stock
                            {sortField === "stock" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              ))}
                          </div>
                        </th>
                        <th
                          className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort("available")}
                        >
                          <div className="flex items-center gap-1">
                            Estado
                            {sortField === "available" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={12} />
                              ) : (
                                <ChevronDown size={12} />
                              ))}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {loading ? (
                        <tr>
                          <td colSpan={isMultiSelectMode ? 7 : 6} className="text-center py-12">
                            <CircularProgress
                              size={30}
                              sx={{ color: "white" }}
                            />
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr
                            key={product.id}
                            className={`transition-colors ${
                              isMultiSelectMode && selectedIds.includes(product.id)
                                ? "bg-zinc-800/50"
                                : "hover:bg-zinc-900"
                            }`}
                          >
                            {isMultiSelectMode && (
                              <td className="px-4 py-4 w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(product.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedIds([...selectedIds, product.id]);
                                    } else {
                                      setSelectedIds(selectedIds.filter(id => id !== product.id));
                                    }
                                  }}
                                  className="w-4 h-4 bg-black border border-zinc-700 rounded focus:ring-0 checked:bg-white"
                                />
                              </td>
                            )}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  crossOrigin="anonymous"
                                  className="w-12 h-12 object-cover border border-zinc-700"
                                />
                                <div>
                                  <div className="text-white text-sm font-medium">
                                    {product.name}
                                  </div>
                                  <div className="text-zinc-500 text-xs">
                                    {product.description.substring(0, 50)}...
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-zinc-400">
                              {product.category}
                            </td>
                            <td className="px-4 py-4 text-sm text-white font-medium">
                              {product.discount_price &&
                              product.discount_price < product.price ? (
                                <div className="flex flex-col">
                                  <span className="text-zinc-500 line-through text-xs">
                                    ${product.price.toLocaleString()}
                                  </span>
                                  <span className="text-green-400">
                                    ${product.discount_price.toLocaleString()}
                                  </span>
                                </div>
                              ) : (
                                `$${product.price.toLocaleString()}`
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-zinc-400">
                              {product.stock || "N/A"}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`px-2 py-1 text-xs ${
                                  product.available === true
                                    ? "bg-green-900 text-green-300"
                                    : product.available === false
                                    ? "bg-red-900 text-red-300"
                                    : "bg-zinc-800 text-zinc-400"
                                }`}
                              >
                                {product.available === true ? "Disponible" : product.available === false ? "Agotado" : "Oculto"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setModalTagInput("");
                                    setEditingProduct(product);
                                  }}
                                  className="text-zinc-400 hover:text-white transition-colors"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeletingProductId(product.id)
                                  }
                                  className="text-zinc-400 hover:text-red-500 transition-colors"
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
                  {products.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                      <div className="text-sm text-zinc-400">
                        Mostrando {page * rowsPerPage + 1} a{" "}
                        {Math.min((page + 1) * rowsPerPage, totalCount)} de{" "}
                        {totalCount} resultados
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
                              Math.min(
                                Math.ceil(totalCount / rowsPerPage) - 1,
                                page + 1,
                              ),
                            )
                          }
                          disabled={
                            page >= Math.ceil(totalCount / rowsPerPage) - 1
                          }
                          className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Grid View */}
              {viewMode === "grid" && (
                <div
                  className={`grid gap-6 transition-all duration-500 ${
                    isFiltersOpen
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1 md:grid-cols-3 xl:grid-cols-4"
                  }`}
                >
                  {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                      <CircularProgress size={30} sx={{ color: "white" }} />
                    </div>
                  ) : (
                    products.map((product) => (
                      <div
                        key={product.id}
                        className={`group bg-black border transition-all duration-300 flex flex-col relative ${
                          isMultiSelectMode && selectedIds.includes(product.id)
                            ? "border-white"
                            : "border-zinc-900 hover:border-zinc-700"
                        }`}
                      >
                        {isMultiSelectMode && (
                          <div className="absolute top-2 left-2 z-20">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(product.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedIds([...selectedIds, product.id]);
                                } else {
                                  setSelectedIds(selectedIds.filter(id => id !== product.id));
                                }
                              }}
                              className="w-5 h-5 bg-black border border-white rounded focus:ring-0 checked:bg-white cursor-pointer"
                            />
                          </div>
                        )}
                        <div
                          className="relative aspect-square overflow-hidden bg-black cursor-pointer"
                          onClick={() => {
                            setModalTagInput("");
                            setEditingProduct(product);
                          }}
                        >
                          <img
                            src={
                              product.image ||
                              "https://images.pexels.com/photos/28968374/pexels-photo-28968374.jpeg"
                            }
                            alt={product.name}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                          />
                          {product.discount_price &&
                            product.discount_price < product.price && (
                              <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-bold px-2 py-1 z-10">
                                {Math.round(
                                  ((product.price - product.discount_price) /
                                    product.price) *
                                    100,
                                )}
                                % OFF
                              </div>
                            )}
                          {/* Edit/Delete Overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalTagInput("");
                                setEditingProduct(product);
                              }}
                              className="bg-white text-black px-4 py-2 text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingProductId(product.id);
                              }}
                              className="bg-red-900 text-white px-4 py-2 text-xs tracking-widest uppercase hover:bg-red-800 transition-colors flex items-center gap-2 shadow-lg"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div
                          className="p-6 flex flex-col flex-1 cursor-pointer"
                          onClick={() => {
                            setModalTagInput("");
                            setEditingProduct(product);
                          }}
                        >
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
                            {product.category}
                          </span>
                          <h3 className="text-white font-light text-lg mb-2 group-hover:underline decoration-zinc-500 underline-offset-4">
                            {product.name}
                          </h3>
                          <p className="text-zinc-400 text-xs line-clamp-2 mb-4 flex-1">
                            {product.description || "Sin descripción"}
                          </p>
                          <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-900">
                            <div className="flex flex-col">
                              {product.discount_price &&
                              product.discount_price < product.price ? (
                                <>
                                  <span className="text-zinc-500 line-through text-xs">
                                    ${product.price.toLocaleString()}
                                  </span>
                                  <span className="text-white font-medium text-lg">
                                    ${product.discount_price.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-white font-medium text-lg">
                                  ${product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[10px] uppercase tracking-widest ${
                                product.available === true
                                  ? "text-green-500"
                                  : product.available === false
                                  ? "text-red-500"
                                  : "text-zinc-500"
                              }`}
                            >
                              {product.available === true ? "Disponible" : product.available === false ? "Agotado" : "Oculto"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {products.length === 0 && (
                <div className="py-24 text-center border border-zinc-900 border-dashed">
                  <p className="text-zinc-500 font-light mb-2">
                    No se encontraron productos con estos filtros.
                  </p>
                  <button
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(1000000);
                      setSelectedSection("");
                      setSelectedCategory("Todos");
                      setSearchQuery("");
                      setSearchTags([]);
                    }}
                    className="text-white text-sm underline hover:text-zinc-300"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              )}

              {/* Pagination */}
              {viewMode === "grid" && products.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 mt-4">
                  <div className="text-sm text-zinc-400">
                    Mostrando {page * rowsPerPage + 1} a{" "}
                    {Math.min((page + 1) * rowsPerPage, totalCount)} de{" "}
                    {totalCount} resultados
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
                          Math.min(
                            Math.ceil(totalCount / rowsPerPage) - 1,
                            page + 1,
                          ),
                        )
                      }
                      disabled={page >= Math.ceil(totalCount / rowsPerPage) - 1}
                      className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {isBulkModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsBulkModalOpen(false)}
          title="Actualización Masiva de Precios"
        >
          <div className="space-y-6">
            <p className="text-zinc-400 text-sm">
              Esta acción modificará el precio de <strong>TODOS</strong> los
              productos.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs mb-2 uppercase tracking-widest">
                  Acción
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setBulkConfig({ ...bulkConfig, action: "increase" })
                    }
                    className={`flex-1 py-3 text-xs uppercase tracking-widest border transition-colors flex items-center justify-center gap-2 ${
                      bulkConfig.action === "increase"
                        ? "bg-white text-black border-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    <Plus size={14} /> Aumentar
                  </button>
                  <button
                    onClick={() =>
                      setBulkConfig({ ...bulkConfig, action: "decrease" })
                    }
                    className={`flex-1 py-3 text-xs uppercase tracking-widest border transition-colors flex items-center justify-center gap-2 ${
                      bulkConfig.action === "decrease"
                        ? "bg-white text-black border-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    <Minus size={14} /> Disminuir
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 text-xs mb-2 uppercase tracking-widest">
                  Tipo
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setBulkConfig({ ...bulkConfig, type: "percentage" })
                    }
                    className={`flex-1 py-3 text-xs uppercase tracking-widest border transition-colors ${
                      bulkConfig.type === "percentage"
                        ? "bg-white text-black border-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    %
                  </button>
                  <button
                    onClick={() =>
                      setBulkConfig({ ...bulkConfig, type: "amount" })
                    }
                    className={`flex-1 py-3 text-xs uppercase tracking-widest border transition-colors ${
                      bulkConfig.type === "amount"
                        ? "bg-white text-black border-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    $
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs mb-2 uppercase tracking-widest">
                Valor
              </label>
              <input
                type="number"
                value={bulkConfig.value}
                onChange={(e) =>
                  setBulkConfig({
                    ...bulkConfig,
                    value: Number(e.target.value),
                  })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                placeholder="0"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkUpdate}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Aplicar Cambios
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingProductId(null)}
          title="Confirmar Eliminación"
        >
          <div className="space-y-6">
            <p className="text-zinc-400 text-sm">
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setDeletingProductId(null)}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="bg-red-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-red-800 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title="Editar Producto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">
                  Imagen del Producto
                </label>
                <div className="aspect-square bg-black border border-zinc-800 overflow-hidden group cursor-pointer">
                  <img
                    src={
                      editingProduct.image ||
                      "https://images.pexels.com/photos/28968374/pexels-photo-28968374.jpeg"
                    }
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Image URL Input */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  URL de Imagen
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProduct.image || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        image: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (editingProduct.image) {
                        await deleteImage(editingProduct.image);
                        setEditingProduct({ ...editingProduct, image: "" });
                      }
                    }}
                    className="text-zinc-500 hover:text-red-500 transition-colors"
                    title="Eliminar imagen"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  O subir archivo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = await uploadImage(file);
                      if (imageUrl) {
                        setEditingProduct({
                          ...editingProduct,
                          image: imageUrl,
                        });
                      }
                    }
                  }}
                  className="w-full bg-black border border-zinc-700 text-white px-4 py-3 file:bg-black file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:uppercase file:text-xs file:tracking-widest hover:file:bg-zinc-900 transition-colors"
                />
              </div>

              {/* Additional Images Gallery */}
              <div>
                <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">
                  Galería de Imágenes
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {editingProduct.images?.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square group border border-zinc-800"
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          const newImages = editingProduct.images?.filter(
                            (_, i) => i !== idx,
                          );
                          setEditingProduct({
                            ...editingProduct,
                            images: newImages,
                          });
                        }}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border border-zinc-800 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 hover:bg-zinc-900/50 transition-all">
                    <Plus size={24} className="text-zinc-500 mb-2" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      Agregar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const imageUrl = await uploadImage(file);
                          if (imageUrl) {
                            setEditingProduct({
                              ...editingProduct,
                              images: [
                                ...(editingProduct.images || []),
                                imageUrl,
                              ],
                            });
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => {
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`w-full bg-transparent border-b text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 ${
                    errors.name ? "border-red-500" : "border-zinc-800"
                  }`}
                  placeholder="Nombre del producto"
                />
                {errors.name && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Sección
                  </label>
                  <CustomSelect
                    value={editingProduct.section || ""}
                    onChange={(value) => {
                      setEditingProduct({
                        ...editingProduct,
                        section: value,
                        category: "", // reset category when section changes
                      });
                    }}
                    options={[
                      ...sectionsData.map((s) => ({
                        value: s.id,
                        label: s.title,
                      })),
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Categoría
                  </label>
                  <CustomSelect
                    value={editingProduct.category || ""}
                    onChange={(value) => {
                      setEditingProduct({
                        ...editingProduct,
                        category: value,
                      });
                      if (errors.category) setErrors({ ...errors, category: "" });
                    }}
                    options={[
                      { value: "", label: "Seleccionar categoría" },
                      ...(
                        editingProduct.section
                          ? sectionsData
                              .find((s) => s.id === editingProduct.section)
                              ?.categories?.filter((c: string) => c !== "Todos") || []
                          : categories
                      ).map((cat: string) => ({
                        value: cat,
                        label: cat,
                      })),
                    ]}
                    error={!!errors.category}
                  />
                  {errors.category && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => {
                      setEditingProduct({
                        ...editingProduct,
                        price: parseInt(e.target.value) || 0,
                      });
                      if (errors.price) setErrors({ ...errors, price: "" });
                    }}
                    className={`w-full bg-transparent border-b text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 ${
                      errors.price ? "border-red-500" : "border-zinc-800"
                    }`}
                    placeholder="0"
                  />
                  {errors.price && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.price}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Rebajado ($)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.discount_price || ""}
                    onChange={(e) => {
                      setEditingProduct({
                        ...editingProduct,
                        discount_price: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      });
                    }}
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Marca (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        brand: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="Ej: Toyota"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Modelo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.model || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        model: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="Ej: Modelo X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Estado
                  </label>
                  <CustomSelect
                    value={
                      editingProduct.available === false 
                        ? "false" 
                        : editingProduct.available === null 
                          ? "hidden" 
                          : "true"
                    }
                    onChange={(value) => {
                      let availableVal: boolean | null = true;
                      if (value === "false") availableVal = false;
                      if (value === "hidden") availableVal = null;
                      setEditingProduct({
                        ...editingProduct,
                        available: availableVal,
                      });
                    }}
                    options={[
                      { value: "true", label: "Disponible" },
                      { value: "false", label: "Agotado" },
                      { value: "hidden", label: "Oculto" },
                    ]}
                  />
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.featured || false}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          featured: e.target.checked,
                        })
                      }
                      className="w-5 h-5 bg-black border border-zinc-700 rounded focus:ring-0 checked:bg-white"
                    />
                    <span className="text-zinc-400 text-sm">
                      Destacar
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Descripción
                </label>
                <textarea
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm h-32 focus:outline-none focus:border-white transition-colors resize-none placeholder-zinc-700"
                  placeholder="Descripción del producto"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Características (opcional)
                </label>
                <textarea
                  value={editingProduct.featuresText ?? (editingProduct.features ? editingProduct.features.join("\n") : "")}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      featuresText: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm h-24 focus:outline-none focus:border-white transition-colors resize-none placeholder-zinc-700"
                  placeholder="Una característica por línea"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Etiquetas (Enter o coma para agregar)
                </label>
                <input
                  type="text"
                  value={modalTagInput}
                  onChange={(e) => setModalTagInput(e.target.value)}
                  onKeyDown={(e) => handleModalTagInput(e, true)}
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="Ej: oferta, nuevo, led"
                />
                {editingProduct.tags && editingProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeModalTag(tag, true)}
                          className="hover:text-red-400"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {editingProduct.section && (() => {
                  const section = sectionsData.find(s => s.id === editingProduct.section);
                  if (section && section.recommendedTags && section.recommendedTags.length > 0) {
                    return (
                      <div className="flex flex-wrap gap-2 mt-4 mt-2 border-t border-zinc-800 pt-2">
                        <span className="text-xs text-zinc-500 w-full mb-1">Recomendadas de la sección:</span>
                        {section.recommendedTags.map((tag: string, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                const currentTags = editingProduct.tags || [];
                                if (!currentTags.includes(tag)) {
                                  setEditingProduct({...editingProduct, tags: [...currentTags, tag]});
                                }
                            }}
                            className="text-xs bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-2 py-1 flex items-center gap-1 transition-colors"
                          >
                            <Plus size={10} /> {tag}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800">
            <button
              onClick={() => setShowDeleteConfirm(editingProduct.id)}
              className="bg-red-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-red-800 transition-colors"
            >
              Eliminar Producto
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setErrors({});
                }}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const newErrors: Record<string, string> = {};
                  if (!editingProduct.name)
                    newErrors.name = "El nombre es obligatorio";
                  if (!editingProduct.category)
                    newErrors.category = "La categoría es obligatoria";
                  if (!editingProduct.price || editingProduct.price <= 0)
                    newErrors.price = "El precio debe ser mayor a 0";

                  if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    toast.error(
                      "Por favor corrige los errores antes de continuar.",
                    );
                    return;
                  }
                  handleUpdateProduct(editingProduct);
                  setErrors({});
                }}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Product Modal */}
      {creatingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setCreatingProduct(null)}
          title="Crear Nuevo Producto"
        >
          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Imagen del Producto
              </label>
              <div className="aspect-square bg-black border border-zinc-700 overflow-hidden mb-4">
                <img
                  src={
                    creatingProduct.image ||
                    "https://images.pexels.com/photos/28968374/pexels-photo-28968374.jpeg"
                  }
                  alt="Nuevo producto"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  value={creatingProduct.image || ""}
                  onChange={(e) =>
                    setCreatingProduct({
                      ...creatingProduct,
                      image: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="URL de la imagen"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (creatingProduct.image) {
                      await deleteImage(creatingProduct.image);
                      setCreatingProduct({ ...creatingProduct, image: "" });
                    }
                  }}
                  className="text-zinc-500 hover:text-red-500 transition-colors"
                  title="Eliminar imagen"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <label className="block text-zinc-400 text-sm mb-2">
                O subir archivo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const imageUrl = await uploadImage(file);
                    if (imageUrl) {
                      setCreatingProduct({
                        ...creatingProduct,
                        image: imageUrl,
                      });
                    }
                  }
                }}
                className="w-full bg-black border border-zinc-700 text-white px-4 py-3 file:bg-black file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:uppercase file:text-xs file:tracking-widest hover:file:bg-zinc-900 transition-colors"
              />

              {/* Additional Images Gallery */}
              <div className="mt-6">
                <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">
                  Galería de Imágenes
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {creatingProduct.images?.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square group border border-zinc-800"
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          const newImages = creatingProduct.images?.filter(
                            (_, i) => i !== idx,
                          );
                          setCreatingProduct({
                            ...creatingProduct,
                            images: newImages,
                          });
                        }}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border border-zinc-800 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-zinc-600 hover:bg-zinc-900/50 transition-all">
                    <Plus size={24} className="text-zinc-500 mb-2" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      Agregar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const imageUrl = await uploadImage(file);
                          if (imageUrl) {
                            setCreatingProduct({
                              ...creatingProduct,
                              images: [
                                ...(creatingProduct.images || []),
                                imageUrl,
                              ],
                            });
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={creatingProduct.name || ""}
                  onChange={(e) => {
                    setCreatingProduct({
                      ...creatingProduct,
                      name: e.target.value,
                    });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`w-full bg-transparent border-b text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 ${
                    errors.name ? "border-red-500" : "border-zinc-800"
                  }`}
                  placeholder="Nombre del producto"
                />
                {errors.name && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Sección
                  </label>
                  <CustomSelect
                    value={creatingProduct.section || ""}
                    onChange={(value) => {
                      setCreatingProduct({
                        ...creatingProduct,
                        section: value,
                        category: "", // reset category
                      });
                    }}
                    options={[
                      ...sectionsData.map((s) => ({
                        value: s.id,
                        label: s.title,
                      })),
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Categoría *
                  </label>
                  <CustomSelect
                    value={creatingProduct.category || ""}
                    onChange={(value) => {
                      setCreatingProduct({
                        ...creatingProduct,
                        category: value,
                      });
                      if (errors.category) setErrors({ ...errors, category: "" });
                    }}
                    options={[
                      { value: "", label: "Seleccionar categoría" },
                      ...(creatingProduct.section
                        ? sectionsData
                            .find((s) => s.id === creatingProduct.section)
                            ?.categories?.filter((c: string) => c !== "Todos") || []
                        : categories
                      ).map((cat: string) => ({ value: cat, label: cat })),
                    ]}
                    error={!!errors.category}
                  />
                  {errors.category && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    value={creatingProduct.price || 0}
                    onChange={(e) => {
                      setCreatingProduct({
                        ...creatingProduct,
                        price: Number(e.target.value),
                      });
                      if (errors.price) setErrors({ ...errors, price: "" });
                    }}
                    className={`w-full bg-transparent border-b text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 ${
                      errors.price ? "border-red-500" : "border-zinc-800"
                    }`}
                    placeholder="0"
                  />
                  {errors.price && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {errors.price}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Rebajado ($)
                  </label>
                  <input
                    type="number"
                    value={creatingProduct.discount_price || ""}
                    onChange={(e) => {
                      setCreatingProduct({
                        ...creatingProduct,
                        discount_price: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      });
                    }}
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Marca (Opcional)
                  </label>
                  <input
                    type="text"
                    value={creatingProduct.brand || ""}
                    onChange={(e) =>
                      setCreatingProduct({
                        ...creatingProduct,
                        brand: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="Ej: Toyota"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Modelo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={creatingProduct.model || ""}
                    onChange={(e) =>
                      setCreatingProduct({
                        ...creatingProduct,
                        model: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="Ej: Modelo X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={creatingProduct.stock || 0}
                    onChange={(e) =>
                      setCreatingProduct({
                        ...creatingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Estado
                  </label>
                  <CustomSelect
                    value={
                      creatingProduct.available === false 
                        ? "false" 
                        : creatingProduct.available === null 
                          ? "hidden" 
                          : "true"
                    }
                    onChange={(value) => {
                      let availableVal: boolean | null = true;
                      if (value === "false") availableVal = false;
                      if (value === "hidden") availableVal = null;
                      setCreatingProduct({
                        ...creatingProduct,
                        available: availableVal as boolean, // we map null to 'hidden' using types, wait we must update type Product
                      })
                    }}
                    options={[
                      { value: "true", label: "Disponible" },
                      { value: "false", label: "Agotado" },
                      { value: "hidden", label: "Oculto" },
                    ]}
                  />
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creatingProduct.featured || false}
                      onChange={(e) =>
                        setCreatingProduct({
                          ...creatingProduct,
                          featured: e.target.checked,
                        })
                      }
                      className="w-5 h-5 bg-black border border-zinc-700 rounded focus:ring-0 checked:bg-white"
                    />
                    <span className="text-zinc-400 text-sm">
                      Destacar
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Descripción
                </label>
                <textarea
                  value={creatingProduct.description || ""}
                  onChange={(e) =>
                    setCreatingProduct({
                      ...creatingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm h-32 focus:outline-none focus:border-white transition-colors resize-none placeholder-zinc-700"
                  placeholder="Descripción del producto"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Características (opcional)
                </label>
                <textarea
                  value={creatingProduct.featuresText ?? (creatingProduct.features ? creatingProduct.features.join("\n") : "")}
                  onChange={(e) =>
                    setCreatingProduct({
                      ...creatingProduct,
                      featuresText: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm h-24 focus:outline-none focus:border-white transition-colors resize-none placeholder-zinc-700"
                  placeholder="Una característica por línea"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Etiquetas (Enter o coma para agregar)
                </label>
                <input
                  type="text"
                  value={modalTagInput}
                  onChange={(e) => setModalTagInput(e.target.value)}
                  onKeyDown={(e) => handleModalTagInput(e, false)}
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="Ej: oferta, nuevo, led"
                />
                {creatingProduct.tags && creatingProduct.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {creatingProduct.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeModalTag(tag, false)}
                          className="hover:text-red-400"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {creatingProduct.section && (() => {
                  const section = sectionsData.find(s => s.id === creatingProduct.section);
                  if (section && section.recommendedTags && section.recommendedTags.length > 0) {
                    return (
                      <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-zinc-800">
                        <span className="text-xs text-zinc-500 w-full mb-1">Recomendadas de la sección:</span>
                        {section.recommendedTags.map((tag: string, i: number) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                const currentTags = creatingProduct.tags || [];
                                if (!currentTags.includes(tag)) {
                                  setCreatingProduct({...creatingProduct, tags: [...currentTags, tag]});
                                }
                            }}
                            className="text-xs bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 px-2 py-1 flex items-center gap-1 transition-colors"
                          >
                            <Plus size={10} /> {tag}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-800">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCreatingProduct(null);
                  setErrors({});
                }}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const newErrors: Record<string, string> = {};
                  if (!creatingProduct.name)
                    newErrors.name = "El nombre es obligatorio";
                  if (!creatingProduct.category)
                    newErrors.category = "La categoría es obligatoria";
                  if (!creatingProduct.price || creatingProduct.price <= 0)
                    newErrors.price = "El precio debe ser mayor a 0";

                  if (Object.keys(newErrors).length > 0) {
                    setErrors(newErrors);
                    toast.error(
                      "Por favor corrige los errores antes de continuar.",
                    );
                    return;
                  }

                  handleCreateProduct(creatingProduct as Omit<Product, "id">);
                  setErrors({});
                }}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Crear Producto
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modals */}
      {showBulkConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowBulkConfirm(false)}
          title="Confirmar Actualización Masiva"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-yellow-500 bg-yellow-900/20 p-4 border border-yellow-900/50 rounded">
              <AlertTriangle size={24} />
              <p className="text-sm">
                Esta acción modificará el precio de <strong>TODOS</strong> los
                productos.
              </p>
            </div>

            <p className="text-zinc-300 text-lg leading-relaxed">
              ¿Estás seguro de que deseas{" "}
              <strong>
                {bulkConfig.action === "increase" ? "aumentar" : "disminuir"}
              </strong>{" "}
              el precio de todos los productos en un{" "}
              <strong>
                {bulkConfig.value}
                {bulkConfig.type === "percentage" ? "%" : "$"}
              </strong>
              ?
            </p>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
              <button
                onClick={() => setShowBulkConfirm(false)}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBulkUpdate}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowDeleteConfirm(null)}
          title="Confirmar Eliminación"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-red-500 bg-red-900/20 p-4 border border-red-900/50 rounded">
              <AlertTriangle size={24} />
              <p className="text-sm">Esta acción no se puede deshacer.</p>
            </div>

            <p className="text-zinc-300 text-lg leading-relaxed">
              ¿Estás seguro de que deseas eliminar este producto
              permanentemente?
            </p>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm) {
                    handleDeleteProduct(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                    setEditingProduct(null);
                  }
                }}
                className="bg-red-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-red-800 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showBulkDeleteConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowBulkDeleteConfirm(false)}
          title="Confirmar Eliminación Masiva"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-red-500 bg-red-900/20 p-4 border border-red-900/50 rounded">
              <AlertTriangle size={24} />
              <p className="text-sm">Esta acción no se puede deshacer.</p>
            </div>

            <p className="text-zinc-300 text-lg leading-relaxed">
              ¿Estás seguro de que deseas eliminar <strong>{selectedIds.length}</strong> productos
              permanentemente?
            </p>

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-red-800 transition-colors"
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

export default ProductsManager;

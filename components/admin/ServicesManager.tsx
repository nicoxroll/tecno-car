import { Fade, Tooltip as MuiTooltip } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  Filter,
  Grid,
  List,
  Mail,
  Phone,
  Plus,
  Search,
  Table as TableIcon,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { deleteImage, supabase, uploadImage } from "../../services/supabase";
import { Service } from "../../types";
import CustomSelect from "../ui/CustomSelect";
import Modal from "./Modal";

dayjs.locale("es");

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff",
    },
    background: {
      paper: "#18181b",
      default: "#09090b",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#3f3f46", // zinc-700
            },
            "&:hover fieldset": {
              borderColor: "#71717a", // zinc-500
            },
            "&.Mui-focused fieldset": {
              borderColor: "#ffffff",
            },
          },
        },
      },
    },
  },
});

interface Appointment {
  id: number;
  service_id: number | null;
  service_name: string;
  service_image: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  description: string;
  appointment_date: string;
  status: string;
}

interface ServicesManagerProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({
  services,
  setServices,
}) => {
  const [activeTab, setActiveTab] = useState<"services" | "appointments">(
    "services"
  );
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [creatingService, setCreatingService] =
    useState<Partial<Service> | null>(null);

  const [showDeleteServiceConfirm, setShowDeleteServiceConfirm] = useState<
    number | null
  >(null);
  const [showDeleteAppointmentConfirm, setShowDeleteAppointmentConfirm] =
    useState<number | null>(null);

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [sortField, setSortField] = useState<string>("appointment_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Appointment Filters
  const [appointmentFilters, setAppointmentFilters] = useState({
    search: "",
    status: "Todos",
    date: null as Dayjs | null,
  });
  const [showAppointmentFilters, setShowAppointmentFilters] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter((app) => {
      const matchesSearch =
        (app.customer_name || "")
          .toLowerCase()
          .includes(appointmentFilters.search.toLowerCase()) ||
        (app.service_name || "")
          .toLowerCase()
          .includes(appointmentFilters.search.toLowerCase());
      const matchesStatus =
        appointmentFilters.status === "Todos" ||
        app.status === appointmentFilters.status;
      const matchesDate =
        !appointmentFilters.date ||
        dayjs(app.appointment_date).isSame(appointmentFilters.date, "day");

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort the filtered appointments
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Appointment];
      let bValue: any = b[sortField as keyof Appointment];

      // Handle different data types
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (typeof aValue === "number") {
        // Numbers are fine as is
      } else if (typeof aValue === "boolean") {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [appointments, appointmentFilters, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const [newAppointment, setNewAppointment] = useState<{
    service: Service | null;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    description: string;
    appointment_date: Dayjs | null;
  }>({
    service: null,
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    description: "",
    appointment_date: dayjs(),
  });

  useEffect(() => {
    if (activeTab === "appointments") {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      if (!newAppointment.service) {
        toast.error("Por favor selecciona un servicio");
        return;
      }
      if (
        !newAppointment.customer_name ||
        !newAppointment.customer_name.trim()
      ) {
        toast.error("Por favor ingresa el nombre del cliente");
        return;
      }
      if (!newAppointment.appointment_date) {
        toast.error("Por favor selecciona una fecha y hora");
        return;
      }

      const appointmentData = {
        service_id: newAppointment.service.id,
        service_name: newAppointment.service.title,
        service_image: newAppointment.service.image,
        customer_name: newAppointment.customer_name,
        customer_phone: newAppointment.customer_phone,
        customer_email: newAppointment.customer_email,
        description: newAppointment.description,
        appointment_date: newAppointment.appointment_date.toISOString(),
        status: "Pendiente",
      };

      const { error } = await supabase
        .from("appointments")
        .insert([appointmentData]);

      if (error) throw error;

      setIsCreatingAppointment(false);
      setNewAppointment({
        service: null,
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        description: "",
        appointment_date: dayjs(),
      });
      fetchAppointments();
      toast.success("Turno creado correctamente");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Error al crear el turno: " + (error as any).message);
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    setShowDeleteAppointmentConfirm(id);
  };

  const confirmDeleteAppointment = async () => {
    if (!showDeleteAppointmentConfirm) return;
    const id = showDeleteAppointmentConfirm;

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setAppointments(appointments.filter((a) => a.id !== id));
      toast.success("Turno eliminado correctamente");
      setShowDeleteAppointmentConfirm(null);
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Error al eliminar el turno");
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      const { error } = await supabase.from("appointments").upsert({
        id: editingAppointment.id,
        customer_name: editingAppointment.customer_name,
        customer_phone: editingAppointment.customer_phone,
        customer_email: editingAppointment.customer_email,
        description: editingAppointment.description,
        appointment_date: editingAppointment.appointment_date,
        status: editingAppointment.status,
      });

      if (error) throw error;

      setAppointments(
        appointments.map((a) =>
          a.id === editingAppointment.id ? editingAppointment : a
        )
      );
      setEditingAppointment(null);
      toast.success("Turno actualizado correctamente");
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Error al actualizar el turno");
    }
  };

  const handleUpdateService = async (service: Service) => {
    try {
      const { error } = await supabase.from("services").upsert(service);

      if (error) throw error;

      setServices(services.map((s) => (s.id === service.id ? service : s)));
      setEditingService(null);
      toast.success("Servicio actualizado correctamente");
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error("Error al actualizar el servicio");
    }
  };

  const handleDeleteService = async (id: number) => {
    setShowDeleteServiceConfirm(id);
  };

  const confirmDeleteService = async () => {
    if (!showDeleteServiceConfirm) return;
    const id = showDeleteServiceConfirm;

    try {
      // Find service to get image URL
      const serviceToDelete = services.find((s) => s.id === id);

      if (serviceToDelete?.image) {
        await deleteImage(serviceToDelete.image);
      }

      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;

      setServices(services.filter((s) => s.id !== id));
      toast.success("Servicio eliminado correctamente");
      setShowDeleteServiceConfirm(null);
      setEditingService(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Error al eliminar el servicio");
    }
  };

  const handleCreateService = async (service: Omit<Service, "id">) => {
    try {
      // Get max order
      const { data: maxOrderData } = await supabase
        .from("services")
        .select("order")
        .order("order", { ascending: false })
        .limit(1);

      const nextOrder = (maxOrderData?.[0]?.order || 0) + 1;

      const { data, error } = await supabase
        .from("services")
        .insert([{ ...service, order: nextOrder }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setServices([...services, data[0] as Service]);
        setCreatingService(null);
        toast.success("Servicio creado correctamente");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("Error al crear el servicio");
    }
  };

  const handleMoveService = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === services.length - 1)
    )
      return;

    const newServices = [...services];
    const otherIndex = index + (direction === "up" ? -1 : 1);

    // Swap
    const temp = newServices[index];
    newServices[index] = newServices[otherIndex];
    newServices[otherIndex] = temp;

    setServices(newServices);

    try {
      // Update order for swapped items
      const item1 = newServices[index];
      const item2 = newServices[otherIndex];

      if (item1 && item2) {
        await supabase
          .from("services")
          .update({ order: index })
          .eq("id", item1.id);
        await supabase
          .from("services")
          .update({ order: otherIndex })
          .eq("id", item2.id);
      }
    } catch (e) {
      console.error("Error updating order", e);
      toast.error("Error al guardar el orden");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-light text-white uppercase tracking-tight">
            Gestión
          </h2>
          <div className="flex border border-zinc-800">
            <button
              onClick={() => setActiveTab("services")}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === "services"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <List size={14} />
            </button>
            <div className="w-[1px] bg-zinc-800"></div>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === "appointments"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900"
              }`}
            >
              <Calendar size={14} />
            </button>
          </div>
        </div>

        {activeTab === "services" ? (
          <MuiTooltip
            title="Agregar Servicio"
            TransitionComponent={Fade}
            TransitionProps={{ timeout: 600 }}
          >
            <button
              onClick={() =>
                setCreatingService({
                  title: "",
                  description: "",
                  image: "",
                  category: "",
                })
              }
              className="bg-white text-black px-3 py-2 text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          </MuiTooltip>
        ) : (
          <div className="flex items-center gap-4">
            <MuiTooltip
              title="Filtros"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={() => setShowAppointmentFilters(!showAppointmentFilters)}
                className={`px-3 py-2 border border-zinc-800 transition-colors flex items-center justify-center ${
                  showAppointmentFilters
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Filter size={16} />
              </button>
            </MuiTooltip>
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
            <MuiTooltip
              title="Nuevo Turno"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 600 }}
            >
              <button
                onClick={() => setIsCreatingAppointment(true)}
                className="bg-white text-black px-3 py-2 text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </MuiTooltip>
          </div>
        )}
      </div>

      {activeTab === "services" ? (
        /* Services Timeline */
        <section className="py-16 bg-black relative z-20 overflow-hidden">
          {/* Central Line for Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-zinc-900 transform -translate-x-1/2 z-0"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-thin text-white tracking-tight uppercase mb-4">
                Tecnología{" "}
                <span className="font-medium text-zinc-500">Aplicada</span>
              </h2>
              <div className="w-12 h-[1px] bg-white mx-auto"></div>
            </div>

            <div className="space-y-24 md:space-y-0 relative">
              {services.map((service, index) => {
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={service.id}
                    className={`service-item flex flex-col md:flex-row items-center gap-12 md:gap-0 scroll-mt-32 opacity-100 translate-y-0 group/item relative`}
                  >
                    {/* Reorder Controls */}
                    <div
                      className={`absolute top-0 ${
                        isEven ? "left-0" : "right-0"
                      } md:left-1/2 md:-translate-x-1/2 z-30 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity items-center`}
                    >
                      <button
                        onClick={() => handleMoveService(index, "up")}
                        disabled={index === 0}
                        className="w-6 h-6 flex items-center justify-center bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveService(index, "down")}
                        disabled={index === services.length - 1}
                        className="w-6 h-6 flex items-center justify-center bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Image Side */}
                    <div
                      className={`w-full md:w-1/2 ${
                        isEven
                          ? "md:pr-16 md:text-right order-1 md:order-1"
                          : "md:pl-16 order-1 md:order-2"
                      }`}
                    >
                      <div
                        className="relative group overflow-hidden border border-zinc-800 bg-black aspect-[4/3] cursor-pointer"
                        onClick={() => {
                          const serviceWithTimeline = {
                            ...service,
                            timeline:
                              service.timeline && service.timeline.length > 0
                                ? service.timeline
                                : (service.timeline_images || []).map(
                                    (img, i) => ({
                                      image: img,
                                      title: `Paso ${i + 1}`,
                                      description: "",
                                    })
                                  ),
                          };
                          setEditingService(serviceWithTimeline);
                        }}
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
                            <span className="text-xs uppercase tracking-widest">
                              Editar
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dot on Line - Centered */}
                    <div className="hidden md:flex absolute left-1/2 w-4 h-4 bg-black border border-zinc-500 z-10 items-center justify-center transform -translate-x-1/2 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>

                    {/* Text Side */}
                    <div
                      className={`w-full md:w-1/2 ${
                        isEven
                          ? "md:pl-16 order-2 md:order-2 text-left"
                          : "md:pr-16 order-2 md:order-1 md:text-right text-left"
                      }`}
                    >
                      <span className="text-[10px] text-zinc-500 tracking-[0.3em] font-medium block mb-4 border-l-2 border-white pl-3 md:border-l-0 md:pl-0">
                        {service.category || `0${index + 1} / SERVICIO`}
                      </span>
                      <h3 className="text-3xl font-light text-white mb-6 leading-tight">
                        {service.title}
                      </h3>
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
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          {showAppointmentFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-1">
              <div className="relative group">
                <Search
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 text-zinc-500 group-hover:text-white transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  value={appointmentFilters.search}
                  onChange={(e) =>
                    setAppointmentFilters({
                      ...appointmentFilters,
                      search: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white pl-8 pr-4 py-2 focus:outline-none focus:border-white transition-colors text-xs uppercase tracking-widest placeholder-zinc-600"
                />
              </div>

              <div className="relative group w-full">
                <CustomSelect
                  value={appointmentFilters.status}
                  onChange={(value) =>
                    setAppointmentFilters({
                      ...appointmentFilters,
                      status: value,
                    })
                  }
                  options={[
                    { value: "Todos", label: "Todos los Estados" },
                    { value: "Pendiente", label: "Pendiente" },
                    { value: "Confirmado", label: "Confirmado" },
                    { value: "Completado", label: "Completado" },
                    { value: "Cancelado", label: "Cancelado" },
                  ]}
                />
              </div>

              <div className="relative group min-w-[150px]">
                <input
                  type="date"
                  value={
                    appointmentFilters.date
                      ? appointmentFilters.date.format("YYYY-MM-DD")
                      : ""
                  }
                  onChange={(e) =>
                    setAppointmentFilters({
                      ...appointmentFilters,
                      date: e.target.value ? dayjs(e.target.value) : null,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-0 py-2 text-xs uppercase tracking-widest focus:outline-none focus:border-white transition-colors placeholder-zinc-700 [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>
          )}

          {loadingAppointments ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-white rounded-full"></div>
            </div>
          ) : viewMode === "grid" ? (
            /* Appointments Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-black border border-zinc-800 p-6 hover:border-zinc-600 transition-colors group cursor-pointer relative"
                  onClick={() => setSelectedAppointment(appointment)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 overflow-hidden border border-zinc-700">
                        <img
                          src={
                            appointment.service_image ||
                            "https://images.pexels.com/photos/28968374/pexels-photo-28968374.jpeg"
                          }
                          alt={appointment.service_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          {appointment.service_name}
                        </h4>
                        <span
                          className={`text-xs uppercase tracking-wider px-2 py-1 ${
                            appointment.status === "Pendiente"
                              ? "bg-yellow-900/30 text-yellow-500"
                              : appointment.status === "Confirmado"
                              ? "bg-green-900/30 text-green-500"
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setEditingAppointment(appointment)}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-zinc-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{appointment.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>
                        {new Date(appointment.appointment_date).toLocaleString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                    {appointment.customer_phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{appointment.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredAppointments.length === 0 && (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  No hay turnos que coincidan con los filtros.
                </div>
              )}
            </div>
          ) : (
            /* Appointments Table */
            <div className="overflow-x-auto border border-zinc-800">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="bg-black text-zinc-200 uppercase tracking-wider text-xs">
                  <tr>
                    <th
                      className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("service_name")}
                    >
                      <div className="flex items-center gap-1">
                        Servicio
                        {sortField === "service_name" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("customer_name")}
                    >
                      <div className="flex items-center gap-1">
                        Cliente
                        {sortField === "customer_name" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("appointment_date")}
                    >
                      <div className="flex items-center gap-1">
                        Fecha
                        {sortField === "appointment_date" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 font-medium">Contacto</th>
                    <th
                      className="px-6 py-4 font-medium cursor-pointer hover:text-white transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-1">
                        Estado
                        {sortField === "status" &&
                          (sortDirection === "asc" ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-4 font-medium text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-black">
                  {filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="hover:bg-zinc-900 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              appointment.service_image ||
                              "https://images.pexels.com/photos/28968374/pexels-photo-28968374.jpeg"
                            }
                            alt=""
                            className="w-8 h-8 object-cover"
                          />
                          <span className="text-white">
                            {appointment.service_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white">
                        {appointment.customer_name}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(appointment.appointment_date).toLocaleString(
                          "es-AR"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          {appointment.customer_phone && (
                            <span>{appointment.customer_phone}</span>
                          )}
                          {appointment.customer_email && (
                            <span>{appointment.customer_email}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs uppercase tracking-wider px-2 py-1 ${
                            appointment.status === "Pendiente"
                              ? "bg-yellow-900/30 text-yellow-500"
                              : appointment.status === "Confirmado"
                              ? "bg-green-900/30 text-green-500"
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <MuiTooltip
                            title="Ver Detalles"
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                          >
                            <button
                              onClick={() => setSelectedAppointment(appointment)}
                              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          </MuiTooltip>
                          <MuiTooltip
                            title="Editar"
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                          >
                            <button
                              onClick={() => setEditingAppointment(appointment)}
                              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </MuiTooltip>
                          <MuiTooltip
                            title="Eliminar"
                            TransitionComponent={Fade}
                            TransitionProps={{ timeout: 600 }}
                          >
                            <button
                              onClick={() =>
                                handleDeleteAppointment(appointment.id)
                              }
                              className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </MuiTooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-zinc-500"
                      >
                        No hay turnos que coincidan con los filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Appointment Modal */}
      {isCreatingAppointment && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreatingAppointment(false)}
          title="Nuevo Turno"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Servicio *
              </label>
              <CustomSelect
                value={newAppointment.service?.id?.toString() || ""}
                onChange={(value) => {
                  const selectedService = services.find(
                    (s) => s.id === Number(value)
                  );
                  setNewAppointment({
                    ...newAppointment,
                    service: selectedService || null,
                  });
                }}
                options={[
                  { value: "", label: "Seleccionar Servicio" },
                  ...services.map((service) => ({
                    value: service.id.toString(),
                    label: service.title,
                  })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={newAppointment.customer_name}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      customer_name: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  value={
                    newAppointment.appointment_date
                      ? newAppointment.appointment_date.format(
                          "YYYY-MM-DDTHH:mm"
                        )
                      : ""
                  }
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      appointment_date: dayjs(e.target.value),
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 [&::-webkit-calendar-picker-indicator]:invert"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newAppointment.customer_phone}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      customer_phone: e.target.value,
                    })
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
                  value={newAppointment.customer_email}
                  onChange={(e) =>
                    setNewAppointment({
                      ...newAppointment,
                      customer_email: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Descripción / Notas
              </label>
              <textarea
                value={newAppointment.description}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    description: e.target.value,
                  })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleCreateAppointment}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Crear Turno
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <Modal
          isOpen={true}
          onClose={() => setEditingService(null)}
          title="Editar Servicio"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">
                  Imagen del Servicio
                </label>
                <div className="relative aspect-square bg-black border border-zinc-800 overflow-hidden group cursor-pointer">
                  <img
                    src={editingService.image}
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
                    value={editingService.image}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        image: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="https://..."
                  />
                  <MuiTooltip
                    title="Eliminar imagen"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <button
                      type="button"
                      onClick={async () => {
                        if (editingService.image) {
                          await deleteImage(editingService.image);
                          setEditingService({ ...editingService, image: "" });
                        }
                      }}
                      className="text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </MuiTooltip>
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
                        setEditingService({
                          ...editingService,
                          image: imageUrl,
                        });
                      }
                    }
                  }}
                  className="w-full bg-black border border-zinc-700 text-white px-4 py-3 file:bg-black file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:uppercase file:text-xs file:tracking-widest hover:file:bg-zinc-900 transition-colors"
                />
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={editingService.category || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      category: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="Ej: 01 / MULTIMEDIA"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Título del Servicio
                </label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="Nombre del servicio"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Descripción
                </label>
                <textarea
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 min-h-[100px] resize-none"
                  placeholder="Descripción detallada del servicio"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Descripción Completa
                </label>
                <textarea
                  value={editingService.fullDescription || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      fullDescription: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 min-h-[160px] resize-none"
                  placeholder="Descripción completa para el modal de detalles"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Video URL (YouTube/Vimeo)
                </label>
                <input
                  type="text"
                  value={editingService.video_url || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      video_url: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Timeline Steps */}
              <div>
                <label className="block text-zinc-400 text-sm mb-4">
                  Galería del Proceso (Timeline)
                </label>
                <div className="space-y-4 mb-4">
                  {(editingService.timeline || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900/50 border border-zinc-800 p-4 flex gap-4 items-start"
                    >
                      <div className="w-24 h-24 flex-shrink-0 bg-black border border-zinc-700 relative group">
                        <img
                          src={step.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Edit size={16} className="text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file);
                                if (url) {
                                  const newTimeline = [
                                    ...(editingService.timeline || []),
                                  ];
                                  newTimeline[idx] = { ...step, image: url };
                                  setEditingService({
                                    ...editingService,
                                    timeline: newTimeline,
                                  });
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex-grow space-y-2">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newTimeline = [
                              ...(editingService.timeline || []),
                            ];
                            newTimeline[idx] = {
                              ...step,
                              title: e.target.value,
                            };
                            setEditingService({
                              ...editingService,
                              timeline: newTimeline,
                            });
                          }}
                          className="w-full bg-transparent border-b border-zinc-800 text-white px-2 py-1 text-sm focus:outline-none focus:border-white"
                          placeholder="Título del paso"
                        />
                        <textarea
                          value={step.description}
                          onChange={(e) => {
                            const newTimeline = [
                              ...(editingService.timeline || []),
                            ];
                            newTimeline[idx] = {
                              ...step,
                              description: e.target.value,
                            };
                            setEditingService({
                              ...editingService,
                              timeline: newTimeline,
                            });
                          }}
                          className="w-full bg-transparent border-b border-zinc-800 text-white px-2 py-1 text-sm focus:outline-none focus:border-white resize-none"
                          placeholder="Descripción del paso"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newTimeline = editingService.timeline?.filter(
                            (_, i) => i !== idx
                          );
                          setEditingService({
                            ...editingService,
                            timeline: newTimeline,
                          });
                        }}
                        className="text-zinc-500 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setEditingService({
                        ...editingService,
                        timeline: [
                          ...(editingService.timeline || []),
                          {
                            title: "",
                            description: "",
                            image:
                              "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
                          },
                        ],
                      });
                    }}
                    className="w-full py-3 border border-zinc-800 border-dashed text-zinc-500 hover:text-white hover:border-zinc-600 hover:bg-zinc-900/50 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Agregar Paso
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800">
            <button
              onClick={() => handleDeleteService(editingService.id)}
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
                onClick={() => {
                  handleUpdateService(editingService);
                }}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Service Modal */}
      {creatingService && (
        <Modal
          isOpen={true}
          onClose={() => setCreatingService(null)}
          title="Crear Nuevo Servicio"
        >
          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Imagen del Servicio
              </label>
              <div className="aspect-square bg-black border border-zinc-700 overflow-hidden mb-4">
                <img
                  src={
                    creatingService.image ||
                    "https://images.pexels.com/photos/28968374/pexels-photo-28968374.jpeg"
                  }
                  alt="Nuevo servicio"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  value={creatingService.image || ""}
                  onChange={(e) =>
                    setCreatingService({
                      ...creatingService,
                      image: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="URL de la imagen"
                />
                <MuiTooltip
                  title="Eliminar imagen"
                  TransitionComponent={Fade}
                  TransitionProps={{ timeout: 600 }}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      if (creatingService.image) {
                        await deleteImage(creatingService.image);
                        setCreatingService({ ...creatingService, image: "" });
                      }
                    }}
                    className="text-zinc-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </MuiTooltip>
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
                      setCreatingService({
                        ...creatingService,
                        image: imageUrl,
                      });
                    }
                  }
                }}
                className="w-full bg-black border border-zinc-700 text-white px-4 py-3 file:bg-black file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:uppercase file:text-xs file:tracking-widest hover:file:bg-zinc-900 transition-colors"
              />
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Categoría
                </label>
                <input
                  type="text"
                  value={creatingService.category || ""}
                  onChange={(e) =>
                    setCreatingService({
                      ...creatingService,
                      category: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="Ej: 01 / MULTIMEDIA"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Título del Servicio *
                </label>
                <input
                  type="text"
                  value={creatingService.title || ""}
                  onChange={(e) =>
                    setCreatingService({
                      ...creatingService,
                      title: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="Nombre del servicio"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Descripción *
                </label>
                <textarea
                  value={creatingService.description || ""}
                  onChange={(e) =>
                    setCreatingService({
                      ...creatingService,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 min-h-[100px] resize-none"
                  placeholder="Descripción del servicio"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Descripción Completa
                </label>
                <textarea
                  value={creatingService.fullDescription || ""}
                  onChange={(e) =>
                    setCreatingService({
                      ...creatingService,
                      fullDescription: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 min-h-[160px] resize-none"
                  placeholder="Descripción completa para el modal de detalles"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Video URL (YouTube/Vimeo)
                </label>
                <input
                  type="text"
                  value={creatingService.video_url || ""}
                  onChange={(e) =>
                    setCreatingService({
                      ...creatingService,
                      video_url: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Timeline Steps */}
              <div>
                <label className="block text-zinc-400 text-sm mb-4">
                  Galería del Proceso (Timeline)
                </label>
                <div className="space-y-4 mb-4">
                  {(creatingService.timeline || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900/50 border border-zinc-800 p-4 flex gap-4 items-start"
                    >
                      <div className="w-24 h-24 flex-shrink-0 bg-black border border-zinc-700 relative group">
                        <img
                          src={step.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Edit size={16} className="text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await uploadImage(file);
                                if (url) {
                                  const newTimeline = [
                                    ...(creatingService.timeline || []),
                                  ];
                                  newTimeline[idx] = { ...step, image: url };
                                  setCreatingService({
                                    ...creatingService,
                                    timeline: newTimeline,
                                  });
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex-grow space-y-2">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newTimeline = [
                              ...(creatingService.timeline || []),
                            ];
                            newTimeline[idx] = {
                              ...step,
                              title: e.target.value,
                            };
                            setCreatingService({
                              ...creatingService,
                              timeline: newTimeline,
                            });
                          }}
                          className="w-full bg-transparent border-b border-zinc-800 text-white px-2 py-1 text-sm focus:outline-none focus:border-white"
                          placeholder="Título del paso"
                        />
                        <textarea
                          value={step.description}
                          onChange={(e) => {
                            const newTimeline = [
                              ...(creatingService.timeline || []),
                            ];
                            newTimeline[idx] = {
                              ...step,
                              description: e.target.value,
                            };
                            setCreatingService({
                              ...creatingService,
                              timeline: newTimeline,
                            });
                          }}
                          className="w-full bg-transparent border-b border-zinc-800 text-white px-2 py-1 text-sm focus:outline-none focus:border-white resize-none"
                          placeholder="Descripción del paso"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newTimeline = creatingService.timeline?.filter(
                            (_, i) => i !== idx
                          );
                          setCreatingService({
                            ...creatingService,
                            timeline: newTimeline,
                          });
                        }}
                        className="text-zinc-500 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      setCreatingService({
                        ...creatingService,
                        timeline: [
                          ...(creatingService.timeline || []),
                          {
                            title: "",
                            description: "",
                            image:
                              "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
                          },
                        ],
                      });
                    }}
                    className="w-full py-3 border border-zinc-800 border-dashed text-zinc-500 hover:text-white hover:border-zinc-600 hover:bg-zinc-900/50 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Agregar Paso
                  </button>
                </div>
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
                    alert(
                      "Por favor completa los campos obligatorios: título y descripción."
                    );
                    return;
                  }
                  handleCreateService(creatingService as Omit<Service, "id">);
                }}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Crear Servicio
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAppointment(null)}
          title="Detalles del Turno"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-zinc-800">
              <div className="w-20 h-20 overflow-hidden border border-zinc-700">
                <img
                  src={
                    selectedAppointment.service_image ||
                    "https://images.pexels.com/photos/28968374/pexels-photo-28968374.jpeg"
                  }
                  alt={selectedAppointment.service_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl text-white font-light">
                  {selectedAppointment.service_name}
                </h3>
                <span
                  className={`inline-block mt-2 text-xs uppercase tracking-wider px-2 py-1 ${
                    selectedAppointment.status === "Pendiente"
                      ? "bg-yellow-900/30 text-yellow-500"
                      : selectedAppointment.status === "Confirmado"
                      ? "bg-green-900/30 text-green-500"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                  Información del Cliente
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <User size={18} className="text-zinc-500" />
                    <span>{selectedAppointment.customer_name}</span>
                  </div>
                  {selectedAppointment.customer_phone && (
                    <div className="flex items-center gap-3 text-zinc-300">
                      <Phone size={18} className="text-zinc-500" />
                      <span>{selectedAppointment.customer_phone}</span>
                    </div>
                  )}
                  {selectedAppointment.customer_email && (
                    <div className="flex items-center gap-3 text-zinc-300">
                      <Mail size={18} className="text-zinc-500" />
                      <span>{selectedAppointment.customer_email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">
                  Detalles de la Cita
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Calendar size={18} className="text-zinc-500" />
                    <span>
                      {new Date(
                        selectedAppointment.appointment_date
                      ).toLocaleDateString("es-AR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Clock size={18} className="text-zinc-500" />
                    <span>
                      {new Date(
                        selectedAppointment.appointment_date
                      ).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      hs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedAppointment.description && (
              <div className="space-y-2 pt-4">
                <h4 className="text-sm text-zinc-500 uppercase tracking-widest">
                  Notas / Descripción
                </h4>
                <div className="bg-black p-4 border border-zinc-800 text-zinc-300 italic">
                  "{selectedAppointment.description}"
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
              <button
                onClick={() => {
                  setEditingAppointment(selectedAppointment);
                  setSelectedAppointment(null);
                }}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <Modal
          isOpen={true}
          onClose={() => setEditingAppointment(null)}
          title="Editar Turno"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={editingAppointment.customer_name}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      customer_name: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  value={dayjs(editingAppointment.appointment_date).format(
                    "YYYY-MM-DDTHH:mm"
                  )}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      appointment_date: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 [&::-webkit-calendar-picker-indicator]:invert"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editingAppointment.customer_phone}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      customer_phone: e.target.value,
                    })
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
                  value={editingAppointment.customer_email}
                  onChange={(e) =>
                    setEditingAppointment({
                      ...editingAppointment,
                      customer_email: e.target.value,
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">Estado</label>
              <CustomSelect
                value={editingAppointment.status}
                onChange={(value) =>
                  setEditingAppointment({
                    ...editingAppointment,
                    status: value,
                  })
                }
                options={[
                  { value: "Pendiente", label: "Pendiente" },
                  { value: "Confirmado", label: "Confirmado" },
                  { value: "Completado", label: "Completado" },
                  { value: "Cancelado", label: "Cancelado" },
                ]}
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-sm mb-2">
                Descripción / Notas
              </label>
              <textarea
                value={editingAppointment.description}
                onChange={(e) =>
                  setEditingAppointment({
                    ...editingAppointment,
                    description: e.target.value,
                  })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setEditingAppointment(null)}
                className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateAppointment}
                className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Delete Service Confirmation Modal */}
      {showDeleteServiceConfirm && (
        <Modal
          isOpen={!!showDeleteServiceConfirm}
          onClose={() => setShowDeleteServiceConfirm(null)}
          title="Eliminar Servicio"
        >
          <div className="space-y-6">
            <p className="text-zinc-300">
              ¿Estás seguro de que deseas eliminar este servicio? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteServiceConfirm(null)}
                className="bg-zinc-800 text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteService}
                className="bg-red-600 text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Appointment Confirmation Modal */}
      {showDeleteAppointmentConfirm && (
        <Modal
          isOpen={!!showDeleteAppointmentConfirm}
          onClose={() => setShowDeleteAppointmentConfirm(null)}
          title="Eliminar Turno"
        >
          <div className="space-y-6">
            <p className="text-zinc-300">
              ¿Estás seguro de que deseas eliminar este turno? Esta acción no se
              puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteAppointmentConfirm(null)}
                className="bg-zinc-800 text-white px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteAppointment}
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

export default ServicesManager;

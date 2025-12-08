import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Calendar, List, Clock, User, Phone, Mail, FileText, Grid, Table as TableIcon, Eye, Filter, ChevronUp, ChevronDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Service } from '../../types';
import Modal from './Modal';
import { supabase, uploadImage } from '../../services/supabase';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { toast } from 'sonner';

dayjs.locale('es');

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff',
    },
    background: {
      paper: '#18181b',
      default: '#09090b',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#3f3f46', // zinc-700
            },
            '&:hover fieldset': {
              borderColor: '#71717a', // zinc-500
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ffffff',
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
  const [activeTab, setActiveTab] = useState<'services' | 'appointments'>('services');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [creatingService, setCreatingService] = useState<Partial<Service> | null>(null);
  
  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  
  // Appointment Filters
  const [appointmentFilters, setAppointmentFilters] = useState({
    search: '',
    status: 'Todos',
    date: null as Dayjs | null,
  });
  const [showAppointmentFilters, setShowAppointmentFilters] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = (app.customer_name || '').toLowerCase().includes(appointmentFilters.search.toLowerCase()) ||
                         (app.service_name || '').toLowerCase().includes(appointmentFilters.search.toLowerCase());
    const matchesStatus = appointmentFilters.status === 'Todos' || app.status === appointmentFilters.status;
    const matchesDate = !appointmentFilters.date || dayjs(app.appointment_date).isSame(appointmentFilters.date, 'day');
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const [newAppointment, setNewAppointment] = useState<{
    service: Service | null;
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    description: string;
    appointment_date: Dayjs | null;
  }>({
    service: null,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    description: '',
    appointment_date: dayjs(),
  });

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
  }, [activeTab]);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      if (!newAppointment.service) {
        toast.error('Por favor selecciona un servicio');
        return;
      }
      if (!newAppointment.customer_name || !newAppointment.customer_name.trim()) {
        toast.error('Por favor ingresa el nombre del cliente');
        return;
      }
      if (!newAppointment.appointment_date) {
        toast.error('Por favor selecciona una fecha y hora');
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
        status: 'Pendiente'
      };

      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);

      if (error) throw error;

      setIsCreatingAppointment(false);
      setNewAppointment({
        service: null,
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        description: '',
        appointment_date: dayjs(),
      });
      fetchAppointments();
      toast.success('Turno creado correctamente');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear el turno: ' + (error as any).message);
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este turno?')) return;
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      setAppointments(appointments.filter(a => a.id !== id));
      toast.success('Turno eliminado correctamente');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Error al eliminar el turno');
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;
    
    try {
       const { error } = await supabase
        .from('appointments')
        .update({
          customer_name: editingAppointment.customer_name,
          customer_phone: editingAppointment.customer_phone,
          customer_email: editingAppointment.customer_email,
          description: editingAppointment.description,
          appointment_date: editingAppointment.appointment_date,
          status: editingAppointment.status
        })
        .eq('id', editingAppointment.id);

      if (error) throw error;

      setAppointments(appointments.map(a => a.id === editingAppointment.id ? editingAppointment : a));
      setEditingAppointment(null);
      toast.success('Turno actualizado correctamente');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error al actualizar el turno');
    }
  };

  const handleUpdateService = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update(service)
        .eq('id', service.id);

      if (error) throw error;

      setServices(services.map(s => s.id === service.id ? service : s));
      setEditingService(null);
      toast.success('Servicio actualizado correctamente');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Error al actualizar el servicio');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(services.filter(s => s.id !== id));
      toast.success('Servicio eliminado correctamente');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar el servicio');
    }
  };

  const handleCreateService = async (service: Omit<Service, 'id'>) => {
    try {
      // Get max order
      const { data: maxOrderData } = await supabase
        .from('services')
        .select('order')
        .order('order', { ascending: false })
        .limit(1);
      
      const nextOrder = (maxOrderData?.[0]?.order || 0) + 1;

      const { data, error } = await supabase
        .from('services')
        .insert([{ ...service, order: nextOrder }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setServices([...services, data[0] as Service]);
        setCreatingService(null);
        toast.success('Servicio creado correctamente');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Error al crear el servicio');
    }
  };

  const handleMoveService = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === services.length - 1)) return;
    
    const newServices = [...services];
    const otherIndex = index + (direction === 'up' ? -1 : 1);
    
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
            await supabase.from('services').update({ order: index }).eq('id', item1.id);
            await supabase.from('services').update({ order: otherIndex }).eq('id', item2.id);
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
          <h2 className="text-2xl font-light text-white uppercase tracking-tight">Gestión</h2>
          <div className="flex border border-zinc-800">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'services' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
            >
              <List size={14} />
            </button>
            <div className="w-[1px] bg-zinc-800"></div>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'appointments' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
            >
              <Calendar size={14} />
            </button>
          </div>
        </div>

        {activeTab === 'services' ? (
          <button
            onClick={() => setCreatingService({ title: '', description: '', image: '', category: '' })}
            className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Agregar Servicio
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAppointmentFilters(!showAppointmentFilters)}
              className={`px-3 py-2 border border-zinc-800 transition-colors flex items-center gap-2 ${showAppointmentFilters ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              title="Filtros"
            >
              <Filter size={16} />
            </button>
            <div className="flex border border-zinc-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                title="Vista Cuadrícula"
              >
                <Grid size={16} />
              </button>
              <div className="w-[1px] bg-zinc-800"></div>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                title="Vista Tabla"
              >
                <TableIcon size={16} />
              </button>
            </div>
            <button
              onClick={() => setIsCreatingAppointment(true)}
              className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Nuevo Turno
            </button>
          </div>
        )}
      </div>

      {activeTab === 'services' ? (
        /* Services Timeline */
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
                    className={`service-item flex flex-col md:flex-row items-center gap-12 md:gap-0 scroll-mt-32 opacity-100 translate-y-0 group/item relative`}
                  >
                    {/* Reorder Controls */}
                    <div className={`absolute top-0 ${isEven ? 'left-0' : 'right-0'} md:left-1/2 md:-translate-x-1/2 z-30 flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity items-center`}>
                      <button 
                        onClick={() => handleMoveService(index, 'up')}
                        disabled={index === 0}
                        className="w-6 h-6 flex items-center justify-center bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button 
                        onClick={() => handleMoveService(index, 'down')}
                        disabled={index === services.length - 1}
                        className="w-6 h-6 flex items-center justify-center bg-zinc-800 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Image Side */}
                    <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 md:text-right order-1 md:order-1' : 'md:pl-16 order-1 md:order-2'}`}>
                      <div
                        className="relative group overflow-hidden border border-zinc-800 bg-black aspect-[4/3] cursor-pointer"
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
                    <div className="hidden md:flex absolute left-1/2 w-4 h-4 bg-black border border-zinc-500 z-10 items-center justify-center transform -translate-x-1/2 rounded-full">
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
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          {showAppointmentFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-1">
              <div className="relative group">
                <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-zinc-500 group-hover:text-white transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  value={appointmentFilters.search}
                  onChange={(e) => setAppointmentFilters({ ...appointmentFilters, search: e.target.value })}
                  className="w-full bg-transparent border-b border-zinc-800 text-white pl-8 pr-4 py-2 focus:outline-none focus:border-white transition-colors text-xs uppercase tracking-widest placeholder-zinc-600"
                />
              </div>
              
              <div className="relative group">
                <select
                  value={appointmentFilters.status}
                  onChange={(e) => setAppointmentFilters({ ...appointmentFilters, status: e.target.value })}
                  className="w-full bg-transparent border-b border-zinc-800 text-white pl-0 pr-8 py-2 appearance-none focus:outline-none focus:border-white transition-colors text-xs uppercase tracking-widest cursor-pointer"
                >
                  <option value="Todos" className="bg-black">Todos los Estados</option>
                  <option value="Pendiente" className="bg-black">Pendiente</option>
                  <option value="Confirmado" className="bg-black">Confirmado</option>
                  <option value="Completado" className="bg-black">Completado</option>
                  <option value="Cancelado" className="bg-black">Cancelado</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition-colors" size={14} />
              </div>

              <ThemeProvider theme={darkTheme}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DateTimePicker
                    label={null}
                    value={appointmentFilters.date}
                    onChange={(newValue) => setAppointmentFilters({ ...appointmentFilters, date: newValue })}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        variant: 'standard',
                        placeholder: "FECHA",
                        InputProps: {
                            disableUnderline: false,
                            style: { 
                                fontSize: '0.75rem', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                color: 'white'
                            }
                        },
                        sx: {
                            '& .MuiInput-underline:before': { borderBottomColor: '#27272a' },
                            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#52525b' },
                            '& .MuiInput-underline:after': { borderBottomColor: 'white' },
                            '& input::placeholder': { color: '#52525b', opacity: 1 }
                        }
                      } 
                    }}
                  />
                </LocalizationProvider>
              </ThemeProvider>
            </div>
          )}

          {loadingAppointments ? (
            <div className="flex justify-center py-24">
              <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-white rounded-full"></div>
            </div>
          ) : viewMode === 'grid' ? (
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
                    <img src={appointment.service_image || '/placeholder.jpg'} alt={appointment.service_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{appointment.service_name}</h4>
                    <span className={`text-xs uppercase tracking-wider px-2 py-1 ${
                      appointment.status === 'Pendiente' ? 'bg-yellow-900/30 text-yellow-500' :
                      appointment.status === 'Confirmado' ? 'bg-green-900/30 text-green-500' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
                  <span>{new Date(appointment.appointment_date).toLocaleString('es-AR')}</span>
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
                <th className="px-6 py-4 font-medium">Servicio</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-black">
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-zinc-900 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={appointment.service_image || '/placeholder.jpg'} alt="" className="w-8 h-8 object-cover" />
                      <span className="text-white">{appointment.service_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{appointment.customer_name}</td>
                  <td className="px-6 py-4">{new Date(appointment.appointment_date).toLocaleString('es-AR')}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {appointment.customer_phone && <span>{appointment.customer_phone}</span>}
                      {appointment.customer_email && <span>{appointment.customer_email}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs uppercase tracking-wider px-2 py-1 ${
                      appointment.status === 'Pendiente' ? 'bg-yellow-900/30 text-yellow-500' :
                      appointment.status === 'Confirmado' ? 'bg-green-900/30 text-green-500' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedAppointment(appointment)}
                        className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Ver Detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingAppointment(appointment)}
                        className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
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
          <ThemeProvider theme={darkTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <div className="space-y-6">
                <Autocomplete
                  options={services}
                  getOptionLabel={(option) => option.title}
                  onChange={(_, newValue) => setNewAppointment({ ...newAppointment, service: newValue })}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <li key={key} {...otherProps} className="flex items-center gap-3 p-2 hover:bg-zinc-800 cursor-pointer">
                        <img src={option.image} alt={option.title} className="w-10 h-10 object-cover" />
                        <span>{option.title}</span>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Servicio" 
                      variant="outlined" 
                      fullWidth
                      required
                    />
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label="Nombre Completo"
                    variant="outlined"
                    fullWidth
                    required
                    value={newAppointment.customer_name}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customer_name: e.target.value })}
                  />
                  <DateTimePicker
                    label="Fecha y Hora"
                    value={newAppointment.appointment_date}
                    onChange={(newValue) => setNewAppointment({ ...newAppointment, appointment_date: newValue })}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    value={newAppointment.customer_phone}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customer_phone: e.target.value })}
                  />
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    type="email"
                    value={newAppointment.customer_email}
                    onChange={(e) => setNewAppointment({ ...newAppointment, customer_email: e.target.value })}
                  />
                </div>

                <TextField
                  label="Descripción / Notas"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={newAppointment.description}
                  onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                />

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleCreateAppointment}
                    className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                  >
                    Crear Turno
                  </button>
                </div>
              </div>
            </LocalizationProvider>
          </ThemeProvider>
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
                  <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">Imagen del Servicio</label>
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
                  <label className="block text-zinc-400 text-sm mb-2">URL de Imagen</label>
                  <input
                    type="text"
                    value={editingService.image}
                    onChange={(e) => setEditingService({...editingService, image: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="https://..."
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">O subir archivo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const imageUrl = await uploadImage(file);
                        if (imageUrl) {
                          setEditingService({...editingService, image: imageUrl});
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
                  <label className="block text-zinc-400 text-sm mb-2">Categoría</label>
                  <input
                    type="text"
                    value={editingService.category || ''}
                    onChange={(e) => setEditingService({...editingService, category: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Ej: 01 / MULTIMEDIA"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Título del Servicio</label>
                  <input
                    type="text"
                    value={editingService.title}
                    onChange={(e) => setEditingService({...editingService, title: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Nombre del servicio"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                  <textarea
                    value={editingService.description}
                    onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    placeholder="Descripción detallada del servicio"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descripción Completa</label>
                  <textarea
                    value={editingService.fullDescription || ''}
                    onChange={(e) => setEditingService({...editingService, fullDescription: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 h-40 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
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
                    handleDeleteService(editingService.id);
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
                <label className="block text-zinc-400 text-sm mb-2">Imagen del Servicio</label>
                <div className="aspect-square bg-black border border-zinc-700 overflow-hidden mb-4">
                  <img
                    src={creatingService.image || '/placeholder.jpg'}
                    alt="Nuevo servicio"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="url"
                  value={creatingService.image || ''}
                  onChange={(e) => setCreatingService({...creatingService, image: e.target.value})}
                  className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors mb-4"
                  placeholder="URL de la imagen"
                />
                <label className="block text-zinc-400 text-sm mb-2">O subir archivo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = await uploadImage(file);
                      if (imageUrl) {
                        setCreatingService({...creatingService, image: imageUrl});
                      }
                    }
                  }}
                  className="w-full bg-black border border-zinc-700 text-white px-4 py-3 file:bg-black file:border-0 file:text-white file:px-4 file:py-2 file:mr-4 file:uppercase file:text-xs file:tracking-widest hover:file:bg-zinc-900 transition-colors"
                />
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Categoría</label>
                  <input
                    type="text"
                    value={creatingService.category || ''}
                    onChange={(e) => setCreatingService({...creatingService, category: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Ej: 01 / MULTIMEDIA"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Título del Servicio *</label>
                  <input
                    type="text"
                    value={creatingService.title || ''}
                    onChange={(e) => setCreatingService({...creatingService, title: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Nombre del servicio"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descripción *</label>
                  <textarea
                    value={creatingService.description || ''}
                    onChange={(e) => setCreatingService({...creatingService, description: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    placeholder="Descripción del servicio"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descripción Completa</label>
                  <textarea
                    value={creatingService.fullDescription || ''}
                    onChange={(e) => setCreatingService({...creatingService, fullDescription: e.target.value})}
                    className="w-full bg-black border border-zinc-700 text-white px-4 py-3 h-40 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
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
                    handleCreateService(creatingService as Omit<Service, 'id'>);
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
                <img src={selectedAppointment.service_image || '/placeholder.jpg'} alt={selectedAppointment.service_name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl text-white font-light">{selectedAppointment.service_name}</h3>
                <span className={`inline-block mt-2 text-xs uppercase tracking-wider px-2 py-1 ${
                  selectedAppointment.status === 'Pendiente' ? 'bg-yellow-900/30 text-yellow-500' :
                  selectedAppointment.status === 'Confirmado' ? 'bg-green-900/30 text-green-500' :
                  'bg-zinc-800 text-zinc-500'
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Información del Cliente</h4>
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
                <h4 className="text-sm text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Detalles de la Cita</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Calendar size={18} className="text-zinc-500" />
                    <span>{new Date(selectedAppointment.appointment_date).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Clock size={18} className="text-zinc-500" />
                    <span>{new Date(selectedAppointment.appointment_date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedAppointment.description && (
              <div className="space-y-2 pt-4">
                <h4 className="text-sm text-zinc-500 uppercase tracking-widest">Notas / Descripción</h4>
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
          <ThemeProvider theme={darkTheme}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label="Nombre Completo"
                    variant="outlined"
                    fullWidth
                    required
                    value={editingAppointment.customer_name}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, customer_name: e.target.value })}
                  />
                  <DateTimePicker
                    label="Fecha y Hora"
                    value={dayjs(editingAppointment.appointment_date)}
                    onChange={(newValue) => newValue && setEditingAppointment({ ...editingAppointment, appointment_date: newValue.toISOString() })}
                    slotProps={{ textField: { fullWidth: true, required: true } }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label="Teléfono"
                    variant="outlined"
                    fullWidth
                    value={editingAppointment.customer_phone}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, customer_phone: e.target.value })}
                  />
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    type="email"
                    value={editingAppointment.customer_email}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, customer_email: e.target.value })}
                  />
                </div>

                <Autocomplete
                  options={['Pendiente', 'Confirmado', 'Completado', 'Cancelado']}
                  value={editingAppointment.status}
                  onChange={(_, newValue) => newValue && setEditingAppointment({ ...editingAppointment, status: newValue })}
                  renderInput={(params) => <TextField {...params} label="Estado" variant="outlined" fullWidth />}
                />

                <TextField
                  label="Descripción / Notas"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={editingAppointment.description}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, description: e.target.value })}
                />

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
            </LocalizationProvider>
          </ThemeProvider>
        </Modal>
      )}
    </div>
  );
};

export default ServicesManager;

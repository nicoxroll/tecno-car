import React, { useState } from 'react';
import { Edit, Trash2, Plus, X } from 'lucide-react';
import { Service } from '../../types';
import Modal from './Modal';

interface ServicesManagerProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const ServicesManager: React.FC<ServicesManagerProps> = ({
  services,
  setServices,
}) => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [creatingService, setCreatingService] = useState<Partial<Service> | null>(null);

  const handleUpdateService = (service: Service) => {
    setServices(services.map(s => s.id === service.id ? service : s));
    setEditingService(null);
  };

  const handleDeleteService = (id: number) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleCreateService = (service: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...service,
      id: Math.max(...services.map(s => s.id), 0) + 1
    };
    setServices([...services, newService]);
    setCreatingService(null);
  };

  return (
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

      {/* Services Timeline */}
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
                <div className="aspect-square bg-zinc-900 border border-zinc-700 overflow-hidden mb-4">
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
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                  placeholder="URL de la imagen"
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
                    placeholder="Descripción del servicio"
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
    </div>
  );
};

export default ServicesManager;

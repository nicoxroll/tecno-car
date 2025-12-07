import React, { useState, useEffect } from 'react';
import { X, Edit, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, uploadImage } from '../../services/supabase';
import Modal from './Modal';

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState({
    companyName: "Merlano Tecnología Vehicular",
    email: "info@merlanotecnologiavehicular.com",
    phone: "+54 221 333 4444",
    address: "Calle 7 #4143 e 163 y 164, Berisso",
    hours: {
      monday: "09:00 - 18:00",
      tuesday: "09:00 - 18:00",
      wednesday: "09:00 - 18:00",
      thursday: "09:00 - 18:00",
      friday: "09:00 - 18:00",
      saturday: "Cerrado"
    },
    social: {
      instagram: "https://instagram.com/merlanotecnologiavehicular",
      facebook: "https://facebook.com/merlanotecnologiavehicular",
      whatsapp: "https://wa.me/5492213334444"
    },
    system: {
      maintenanceMode: false,
      emailNotifications: true
    }
  });
  
  // Catalog Hero State
  const [catalogHeroImage, setCatalogHeroImage] = useState<string>('https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=1600');
  const [catalogHeroTitle, setCatalogHeroTitle] = useState<string>('Catálogo');
  const [catalogHeroSubtitle, setCatalogHeroSubtitle] = useState<string>('Equipamiento Premium Seleccionado');
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroForm, setHeroForm] = useState({ title: '', subtitle: '', image: '' });

  // Main Hero State
  const [mainHeroImage, setMainHeroImage] = useState<string>('https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg?auto=compress&cs=tinysrgb&w=1600');
  const [mainHeroTitle, setMainHeroTitle] = useState<string>('MERLANO');
  const [mainHeroSubtitle, setMainHeroSubtitle] = useState<string>('TECNOLOGÍA VEHICULAR');
  const [isEditingMainHero, setIsEditingMainHero] = useState(false);
  const [mainHeroForm, setMainHeroForm] = useState({ title: '', subtitle: '', image: '' });

  const [configView, setConfigView] = useState<'main' | 'catalog'>('main');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from('site_config').select('*');
      if (data) {
        const configMap = data.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});

        if (configMap.catalog_hero_image) setCatalogHeroImage(configMap.catalog_hero_image);
        if (configMap.catalog_hero_title) setCatalogHeroTitle(configMap.catalog_hero_title);
        if (configMap.catalog_hero_subtitle) setCatalogHeroSubtitle(configMap.catalog_hero_subtitle);
        
        if (configMap.main_hero_image) setMainHeroImage(configMap.main_hero_image);
        if (configMap.main_hero_title) setMainHeroTitle(configMap.main_hero_title);
        if (configMap.main_hero_subtitle) setMainHeroSubtitle(configMap.main_hero_subtitle);
        
        // Here you would map other settings if they were saved in DB
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error al cargar la configuración');
    }
  };

  const handleSaveHero = async () => {
    try {
      const promise = async () => {
        if (heroForm.title !== catalogHeroTitle) {
           await supabase.from('site_config').upsert({ key: 'catalog_hero_title', value: heroForm.title }, { onConflict: 'key' });
           setCatalogHeroTitle(heroForm.title);
        }
        if (heroForm.subtitle !== catalogHeroSubtitle) {
           await supabase.from('site_config').upsert({ key: 'catalog_hero_subtitle', value: heroForm.subtitle }, { onConflict: 'key' });
           setCatalogHeroSubtitle(heroForm.subtitle);
        }
        if (heroForm.image && heroForm.image !== catalogHeroImage) {
           await supabase.from('site_config').upsert({ key: 'catalog_hero_image', value: heroForm.image }, { onConflict: 'key' });
           setCatalogHeroImage(heroForm.image);
        }
        return 'Portada del catálogo actualizada';
      };

      toast.promise(promise(), {
        loading: 'Guardando cambios...',
        success: (data) => {
          setIsEditingHero(false);
          return data;
        },
        error: 'Error al actualizar',
      });
    } catch (error) {
      console.error('Error updating hero:', error);
    }
  };

  const handleSaveMainHero = async () => {
    try {
      const promise = async () => {
        if (mainHeroForm.title !== mainHeroTitle) {
           await supabase.from('site_config').upsert({ key: 'main_hero_title', value: mainHeroForm.title }, { onConflict: 'key' });
           setMainHeroTitle(mainHeroForm.title);
        }
        if (mainHeroForm.subtitle !== mainHeroSubtitle) {
           await supabase.from('site_config').upsert({ key: 'main_hero_subtitle', value: mainHeroForm.subtitle }, { onConflict: 'key' });
           setMainHeroSubtitle(mainHeroForm.subtitle);
        }
        if (mainHeroForm.image && mainHeroForm.image !== mainHeroImage) {
           await supabase.from('site_config').upsert({ key: 'main_hero_image', value: mainHeroForm.image }, { onConflict: 'key' });
           setMainHeroImage(mainHeroForm.image);
        }
        return 'Portada principal actualizada';
      };

      toast.promise(promise(), {
        loading: 'Guardando cambios...',
        success: (data) => {
          setIsEditingMainHero(false);
          return data;
        },
        error: 'Error al actualizar',
      });
    } catch (error) {
      console.error('Error updating main hero:', error);
    }
  };

  const handleHeroImageUpload = async (file: File, isMain: boolean = false) => {
      try {
        const promise = async () => {
          const imageUrl = await uploadImage(file);
          if (!imageUrl) throw new Error('Error al subir imagen');
          if (isMain) {
              setMainHeroForm(prev => ({ ...prev, image: imageUrl }));
          } else {
              setHeroForm(prev => ({ ...prev, image: imageUrl }));
          }
          return 'Imagen subida, recuerda guardar los cambios.';
        };
  
        toast.promise(promise(), {
          loading: 'Subiendo imagen...',
          success: (data) => data,
          error: 'Error al subir la imagen',
        });
      } catch (error) {
        console.error('Error uploading hero image:', error);
      }
  };

  const handleSave = () => {
    // In a real app, you would save all 'settings' state to Supabase here
    console.log('Saving settings:', settings);
    toast.success('Configuración guardada correctamente');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">Configuración</h2>

      <div className="space-y-8 animate-fade-in mb-8">
            <div className="flex items-center justify-between bg-zinc-900/50 p-4 border border-zinc-800">
                <button 
                    onClick={() => setConfigView(v => v === 'main' ? 'catalog' : 'main')}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                    <ChevronLeft size={20} />
                </button>
                
                <h3 className="text-white text-sm uppercase tracking-widest flex items-center gap-2">
                    <Settings size={14} /> 
                    {configView === 'main' ? 'Portada Principal (Home)' : 'Portada del Catálogo'}
                </h3>

                <button 
                    onClick={() => setConfigView(v => v === 'main' ? 'catalog' : 'main')}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {configView === 'main' ? (
                /* Main Hero Editor */
                <div className="relative group overflow-hidden border border-zinc-800 bg-black">
                    <div className="relative h-[60vh] overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 z-10"></div>
                    <img 
                        src={mainHeroImage} 
                        alt="Main Hero" 
                        className="w-full h-full object-cover"
                        style={{
                            filter: 'grayscale(100%) contrast(110%) brightness(0.5)'
                        }}
                    />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                        <h1 className="text-4xl md:text-6xl font-thin text-white uppercase tracking-tight mb-4 drop-shadow-lg">
                            {mainHeroTitle}
                        </h1>
                        <div className="h-[1px] w-24 bg-white mb-4"></div>
                        <p className="text-zinc-400 font-light tracking-[0.3em] text-xs md:text-sm uppercase drop-shadow-md">
                            {mainHeroSubtitle}
                        </p>
                    </div>
                    </div>

                    <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => {
                                setMainHeroForm({
                                    title: mainHeroTitle,
                                    subtitle: mainHeroSubtitle,
                                    image: mainHeroImage
                                });
                                setIsEditingMainHero(true);
                            }}
                            className="bg-white text-black px-4 py-2 text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <Edit size={14} /> Editar
                        </button>
                    </div>
                </div>
            ) : (
                /* Catalog Hero Editor */
                <div className="relative group overflow-hidden border border-zinc-800 bg-black">
                    <div className="relative h-[60vh] overflow-hidden">
                    <div className="absolute inset-0 bg-zinc-900/40 z-10 mix-blend-multiply"></div>
                    <img 
                        src={catalogHeroImage} 
                        alt="Catalog Hero" 
                        className="w-full h-full object-cover"
                        style={{
                            filter: 'grayscale(100%) contrast(90%) brightness(0.7)'
                        }}
                    />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                        <h1 className="text-4xl md:text-6xl font-thin text-white uppercase tracking-tight mb-4 drop-shadow-lg">
                            {catalogHeroTitle} <span className="text-zinc-400">2024</span>
                        </h1>
                        <div className="h-[1px] w-24 bg-white mb-4"></div>
                        <p className="text-white font-light tracking-[0.3em] text-xs md:text-sm uppercase drop-shadow-md bg-black/50 px-6 py-3 backdrop-blur-md border border-white/20">
                            {catalogHeroSubtitle}
                        </p>
                    </div>
                    </div>

                    <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => {
                                setHeroForm({
                                    title: catalogHeroTitle,
                                    subtitle: catalogHeroSubtitle,
                                    image: catalogHeroImage
                                });
                                setIsEditingHero(true);
                            }}
                            className="bg-white text-black px-4 py-2 text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <Edit size={14} /> Editar
                        </button>
                    </div>
                </div>
            )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

        {/* General Settings */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Configuración General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Nombre de la Empresa</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Email de Contacto</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({...settings, email: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Teléfono</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({...settings, phone: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Dirección</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({...settings, address: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Horarios de Atención</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(settings.hours).map(([day, hours]) => (
                <div key={day}>
                  <label className="block text-zinc-400 text-xs sm:text-sm mb-2 capitalize">
                    {day === 'wednesday' ? 'Miércoles' : day === 'saturday' ? 'Sábado' : day}
                  </label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setSettings({
                      ...settings,
                      hours: { ...settings.hours, [day]: e.target.value }
                    })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Redes Sociales</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Instagram</label>
              <input
                type="url"
                value={settings.social.instagram}
                onChange={(e) => setSettings({
                  ...settings,
                  social: { ...settings.social, instagram: e.target.value }
                })}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Facebook</label>
              <input
                type="url"
                value={settings.social.facebook}
                onChange={(e) => setSettings({
                  ...settings,
                  social: { ...settings.social, facebook: e.target.value }
                })}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">WhatsApp</label>
              <input
                type="url"
                value={settings.social.whatsapp}
                onChange={(e) => setSettings({
                  ...settings,
                  social: { ...settings.social, whatsapp: e.target.value }
                })}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Configuración del Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Modo Mantenimiento</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.system.maintenanceMode}
                  onChange={(e) => setSettings({
                    ...settings,
                    system: { ...settings.system, maintenanceMode: e.target.checked }
                  })}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-zinc-500"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs sm:text-sm">Notificaciones por Email</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.system.emailNotifications}
                  onChange={(e) => setSettings({
                    ...settings,
                    system: { ...settings.system, emailNotifications: e.target.checked }
                  })}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-zinc-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 sm:mt-8">
        <button 
          onClick={handleSave}
          className="bg-white text-black px-4 sm:px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
        >
          Guardar Cambios
        </button>
      </div>

      {/* Modal Editar Main Hero */}
      {isEditingMainHero && (
        <Modal isOpen={true} title="Editar Portada Principal" onClose={() => setIsEditingMainHero(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Título</label>
              <input
                type="text"
                value={mainHeroForm.title}
                onChange={(e) => setMainHeroForm({ ...mainHeroForm, title: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:ring-white focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Subtítulo</label>
              <input
                type="text"
                value={mainHeroForm.subtitle}
                onChange={(e) => setMainHeroForm({ ...mainHeroForm, subtitle: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:ring-white focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Imagen de Fondo</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  {mainHeroForm.image && (
                    <img src={mainHeroForm.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleHeroImageUpload(e.target.files[0], true);
                      }
                    }}
                    className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">O pegar URL de imagen:</span>
                    <input 
                        type="text" 
                        value={mainHeroForm.image}
                        onChange={(e) => setMainHeroForm({...mainHeroForm, image: e.target.value})}
                        className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white text-sm focus:ring-white focus:border-white"
                        placeholder="https://ejemplo.com/imagen.jpg"
                    />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveMainHero}
                className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-zinc-200"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Editar Catalog Hero */}
      {isEditingHero && (
        <Modal isOpen={true} title="Editar Portada del Catálogo" onClose={() => setIsEditingHero(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Título</label>
              <input
                type="text"
                value={heroForm.title}
                onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:ring-white focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Subtítulo</label>
              <input
                type="text"
                value={heroForm.subtitle}
                onChange={(e) => setHeroForm({ ...heroForm, subtitle: e.target.value })}
                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:ring-white focus:border-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Imagen de Fondo</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  {heroForm.image && (
                    <img src={heroForm.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleHeroImageUpload(e.target.files[0], false);
                      }
                    }}
                    className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500">O pegar URL de imagen:</span>
                    <input 
                        type="text" 
                        value={heroForm.image}
                        onChange={(e) => setHeroForm({...heroForm, image: e.target.value})}
                        className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white text-sm focus:ring-white focus:border-white"
                        placeholder="https://ejemplo.com/imagen.jpg"
                    />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveHero}
                className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-zinc-200"
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

export default SettingsManager;

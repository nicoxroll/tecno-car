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
  const [heroForm, setHeroForm] = useState({ title: '', subtitle: '', image: '', year: '' });

  // Main Hero State
  const [mainHeroImage, setMainHeroImage] = useState<string>('https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg?auto=compress&cs=tinysrgb&w=1600');
  const [mainHeroTitle, setMainHeroTitle] = useState<string>('MERLANO');
  const [mainHeroSubtitle, setMainHeroSubtitle] = useState<string>('TECNOLOGÍA VEHICULAR');
  const [mainHeroDescription, setMainHeroDescription] = useState<string>('Especialistas en electrónica automotriz avanzada. Multimedia, seguridad y confort en Berisso.');
  const [isEditingMainHero, setIsEditingMainHero] = useState(false);
  const [mainHeroForm, setMainHeroForm] = useState({ title: '', subtitle: '', description: '', image: '' });

  // Catalog State
  const [catalogYear, setCatalogYear] = useState<string>('2024');

  // About State
  const [aboutImage, setAboutImage] = useState<string>('https://images.pexels.com/photos/4488652/pexels-photo-4488652.jpeg?auto=compress&cs=tinysrgb&w=800');
  const [aboutDescription1, setAboutDescription1] = useState<string>('Les presentamos <strong className="text-white font-medium">Merlano Tecnología Vehicular</strong>, un taller especializado en brindar soluciones integrales de vehículos de todo tipo, con un enfoque centrado en la calidad, la experiencia y la atención personalizada.');
  const [aboutDescription2, setAboutDescription2] = useState<string>('Contamos con un espacio especialmente preparado para que la espera sea cómoda y agradable, donde cada detalle está pensado para su confort mientras cuidamos de su vehículo.');
  const [aboutAmenities, setAboutAmenities] = useState<any[]>([
    { icon: 'Wind', text: 'Sala de espera climatizada' },
    { icon: 'Coffee', text: 'Servicio de café' },
    { icon: 'Wifi', text: 'Wi-Fi gratuito' },
    { icon: 'Tv', text: 'Televisión con cable' },
    { icon: 'CheckCircle', text: 'Baño para clientes' },
  ]);

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
        if (configMap.main_hero_description) setMainHeroDescription(configMap.main_hero_description);
        
        if (configMap.catalog_year) setCatalogYear(configMap.catalog_year);
        
        if (configMap.about_image) setAboutImage(configMap.about_image);
        if (configMap.about_description_1) setAboutDescription1(configMap.about_description_1);
        if (configMap.about_description_2) setAboutDescription2(configMap.about_description_2);
        
        if (configMap.about_amenities) {
          try {
            const parsedAmenities = JSON.parse(configMap.about_amenities);
            setAboutAmenities(parsedAmenities);
          } catch (e) {
            console.warn('Error parsing about amenities, using default');
          }
        }
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
        if (heroForm.year !== catalogYear) {
           await supabase.from('site_config').upsert({ key: 'catalog_year', value: heroForm.year }, { onConflict: 'key' });
           setCatalogYear(heroForm.year);
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
        if (mainHeroForm.description !== mainHeroDescription) {
           await supabase.from('site_config').upsert({ key: 'main_hero_description', value: mainHeroForm.description }, { onConflict: 'key' });
           setMainHeroDescription(mainHeroForm.description);
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

  const handleSaveAbout = async () => {
    try {
      const promise = async () => {
        // Save image
        if (aboutImage) {
          await supabase.from('site_config').upsert({ key: 'about_image', value: aboutImage }, { onConflict: 'key' });
        }
        
        // Save descriptions
        await supabase.from('site_config').upsert({ key: 'about_description_1', value: aboutDescription1 }, { onConflict: 'key' });
        await supabase.from('site_config').upsert({ key: 'about_description_2', value: aboutDescription2 }, { onConflict: 'key' });
        
        // Save amenities
        await supabase.from('site_config').upsert({ key: 'about_amenities', value: JSON.stringify(aboutAmenities) }, { onConflict: 'key' });
        
        // Update local state
        setAboutImage(aboutImage);
        setAboutDescription1(aboutDescription1);
        setAboutDescription2(aboutDescription2);
        setAboutAmenities(aboutAmenities);
        
        return 'Configuración de Quiénes Somos guardada';
      };

      toast.promise(promise(), {
        loading: 'Guardando configuración...',
        success: (data) => data,
        error: 'Error al guardar',
      });
    } catch (error) {
      console.error('Error saving about configuration:', error);
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

  const handleSaveAll = async () => {
    try {
      const promise = async () => {
        // Save general settings
        await supabase.from('site_config').upsert({ key: 'company_name', value: settings.companyName }, { onConflict: 'key' });
        await supabase.from('site_config').upsert({ key: 'company_email', value: settings.email }, { onConflict: 'key' });
        await supabase.from('site_config').upsert({ key: 'company_phone', value: settings.phone }, { onConflict: 'key' });
        await supabase.from('site_config').upsert({ key: 'company_address', value: settings.address }, { onConflict: 'key' });
        
        // Save about configuration
        if (aboutImage) {
          await supabase.from('site_config').upsert({ key: 'about_image', value: aboutImage }, { onConflict: 'key' });
        }
        
        await supabase.from('site_config').upsert({ key: 'about_description_1', value: aboutDescription1 }, { onConflict: 'key' });
        await supabase.from('site_config').upsert({ key: 'about_description_2', value: aboutDescription2 }, { onConflict: 'key' });
        await supabase.from('site_config').upsert({ key: 'about_amenities', value: JSON.stringify(aboutAmenities) }, { onConflict: 'key' });
        
        return 'Toda la configuración guardada correctamente';
      };

      toast.promise(promise(), {
        loading: 'Guardando configuración...',
        success: (data) => data,
        error: 'Error al guardar',
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
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
                        <p className="text-zinc-400 font-light tracking-[0.3em] text-xs md:text-sm uppercase drop-shadow-md mb-4">
                            {mainHeroSubtitle}
                        </p>
                        <p className="text-zinc-300 font-light text-xs md:text-sm max-w-md leading-relaxed drop-shadow-md">
                            {mainHeroDescription}
                        </p>
                    </div>
                    </div>

                    <div className="absolute bottom-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => {
                                setMainHeroForm({
                                    title: mainHeroTitle,
                                    subtitle: mainHeroSubtitle,
                                    description: mainHeroDescription,
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
                            {catalogHeroTitle} <span className="text-zinc-400">{catalogYear}</span>
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
                                    image: catalogHeroImage,
                                    year: catalogYear
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

      {/* About Configuration */}
      <div className="bg-zinc-950 border border-zinc-800 p-4 sm:p-6">
        <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">Configuración de Quiénes Somos</h3>
        <div className="space-y-6">
          {/* Image Configuration */}
          <div>
            <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Imagen de la Sección</label>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                {aboutImage && (
                  <img src={aboutImage} alt="About Preview" className="w-20 h-20 object-cover rounded" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleHeroImageUpload(e.target.files[0], false).then(() => {
                        // After upload, we need to save the about image
                        // This will be handled by the upload function updating the form
                      });
                    }
                  }}
                  className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                />
              </div>
              <input 
                type="text" 
                value={aboutImage}
                onChange={(e) => setAboutImage(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">Esta imagen aparecerá en la sección "Quiénes Somos"</p>
          </div>

          {/* Text Descriptions */}
          <div>
            <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Primer Párrafo</label>
            <textarea
              value={aboutDescription1}
              onChange={(e) => setAboutDescription1(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Texto del primer párrafo..."
            />
            <p className="text-xs text-zinc-500 mt-1">Puedes usar &lt;strong&gt; para resaltar texto</p>
          </div>

          <div>
            <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Segundo Párrafo</label>
            <textarea
              value={aboutDescription2}
              onChange={(e) => setAboutDescription2(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
              placeholder="Texto del segundo párrafo..."
            />
          </div>

          {/* Amenities/Services */}
          <div>
            <label className="block text-zinc-400 text-xs sm:text-sm mb-2">Servicios/Comodidades</label>
            <div className="space-y-3">
              {aboutAmenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded">
                  <select
                    value={amenity.icon}
                    onChange={(e) => {
                      const newAmenities = [...aboutAmenities];
                      newAmenities[index].icon = e.target.value;
                      setAboutAmenities(newAmenities);
                    }}
                    className="bg-zinc-900 border border-zinc-700 text-white px-2 py-1 text-xs focus:outline-none focus:border-zinc-500"
                  >
                    <option value="Wind">Viento (Aire)</option>
                    <option value="Coffee">Café</option>
                    <option value="Wifi">Wi-Fi</option>
                    <option value="Tv">TV</option>
                    <option value="CheckCircle">Check</option>
                  </select>
                  <input
                    type="text"
                    value={amenity.text}
                    onChange={(e) => {
                      const newAmenities = [...aboutAmenities];
                      newAmenities[index].text = e.target.value;
                      setAboutAmenities(newAmenities);
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-3 py-1 text-sm focus:outline-none focus:border-zinc-500"
                    placeholder="Texto del servicio..."
                  />
                  <button
                    onClick={() => {
                      const newAmenities = aboutAmenities.filter((_, i) => i !== index);
                      setAboutAmenities(newAmenities);
                    }}
                    className="text-zinc-400 hover:text-red-400 p-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setAboutAmenities([...aboutAmenities, { icon: 'CheckCircle', text: 'Nuevo servicio' }]);
                }}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors px-3 py-2 text-sm"
              >
                + Agregar Servicio
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 sm:mt-8">
        <button 
          onClick={handleSaveAll}
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
              <label className="block text-sm font-medium text-zinc-400 mb-1">Descripción</label>
              <textarea
                value={mainHeroForm.description}
                onChange={(e) => setMainHeroForm({ ...mainHeroForm, description: e.target.value })}
                rows={3}
                className="w-full bg-zinc-800 border-zinc-700 rounded-md p-2 text-white focus:ring-white focus:border-white resize-none"
                placeholder="Descripción del hero principal..."
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
              <label className="block text-sm font-medium text-zinc-400 mb-1">Año del Catálogo</label>
              <input
                type="text"
                value={heroForm.year}
                onChange={(e) => setHeroForm({ ...heroForm, year: e.target.value })}
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

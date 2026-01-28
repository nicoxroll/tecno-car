import { Fade, Tooltip as MuiTooltip } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Settings,
  X,
} from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { deleteImage, supabase, uploadImage } from "../../services/supabase";
import IconPicker from "../ui/IconPicker";
import RichTextEditor from "../ui/RichTextEditor";
import Modal from "./Modal";

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState({
    companyName: "Merlano Tecnología Vehicular",
    email: "info@merlanotecnologiavehicular.com",
    phone: "+54 221 333 4444",
    address: "Calle 7 #4143 e 163 y 164, Berisso",
    hours: {
      days: "Lunes a Viernes",
      time: "09:00 - 18:00 hs",
    },
    social: {
      instagram: "https://instagram.com/merlanotecnologiavehicular",
      facebook: "https://facebook.com/merlanotecnologiavehicular",
      whatsapp: "https://wa.me/5492213334444",
    },
  });

  // Catalog Filters State
  const [catalogFilters, setCatalogFilters] = useState<string[]>([
    "Multimedia",
    "Audio",
    "Iluminación",
    "Seguridad",
    "Accesorios",
    "Limpieza",
  ]);
  const [newFilter, setNewFilter] = useState("");

  // Catalog Hero State
  const [catalogHeroImage, setCatalogHeroImage] = useState<string>(
    "https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=1600"
  );
  const [catalogHeroTitle, setCatalogHeroTitle] = useState<string>("Catálogo");
  const [catalogHeroSubtitle, setCatalogHeroSubtitle] = useState<string>(
    "Equipamiento Premium Seleccionado"
  );
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [heroForm, setHeroForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    year: "",
  });

  // Main Hero State
  const [mainHeroImage, setMainHeroImage] = useState<string>(
    "https://images.pexels.com/photos/305070/pexels-photo-305070.jpeg?auto=compress&cs=tinysrgb&w=1600"
  );
  const [mainHeroTitle, setMainHeroTitle] = useState<string>("MERLANO");
  const [mainHeroSubtitle, setMainHeroSubtitle] = useState<string>(
    "TECNOLOGÍA VEHICULAR"
  );
  const [mainHeroDescription, setMainHeroDescription] = useState<string>(
    "Especialistas en electrónica automotriz avanzada. Multimedia, seguridad y confort en Berisso."
  );
  const [isEditingMainHero, setIsEditingMainHero] = useState(false);
  const [mainHeroForm, setMainHeroForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
  });

  // Catalog State
  const [catalogYear, setCatalogYear] = useState<string>("2024");

  // About State
  const [aboutImage, setAboutImage] = useState<string>(
    "https://images.pexels.com/photos/4488652/pexels-photo-4488652.jpeg?auto=compress&cs=tinysrgb&w=800"
  );
  const [aboutDescription1, setAboutDescription1] = useState<string>(
    'Les presentamos <strong className="text-white font-medium">Merlano Tecnología Vehicular</strong>, un taller especializado en brindar soluciones integrales de vehículos de todo tipo, con un enfoque centrado en la calidad, la experiencia y la atención personalizada.'
  );
  const [aboutDescription2, setAboutDescription2] = useState<string>(
    "Contamos con un espacio especialmente preparado para que la espera sea cómoda y agradable, donde cada detalle está pensado para su confort mientras cuidamos de su vehículo."
  );
  const [aboutAmenities, setAboutAmenities] = useState<any[]>([
    { icon: "Wind", text: "Sala de espera climatizada" },
    { icon: "Coffee", text: "Servicio de café" },
    { icon: "Wifi", text: "Wi-Fi gratuito" },
    { icon: "Tv", text: "Televisión con cable" },
    { icon: "CheckCircle", text: "Baño para clientes" },
  ]);

  const [aboutGallery, setAboutGallery] = useState<string[]>([]);
  const [originalSettings, setOriginalSettings] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  const [configView, setConfigView] = useState<"main" | "catalog">("main");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from("site_config").select("*");
      if (data) {
        const configMap = data.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});

        if (configMap.catalog_hero_image)
          setCatalogHeroImage(configMap.catalog_hero_image);
        if (configMap.catalog_hero_title)
          setCatalogHeroTitle(configMap.catalog_hero_title);
        if (configMap.catalog_hero_subtitle)
          setCatalogHeroSubtitle(configMap.catalog_hero_subtitle);

        if (configMap.main_hero_image)
          setMainHeroImage(configMap.main_hero_image);
        if (configMap.main_hero_title)
          setMainHeroTitle(configMap.main_hero_title);
        if (configMap.main_hero_subtitle)
          setMainHeroSubtitle(configMap.main_hero_subtitle);
        if (configMap.main_hero_description)
          setMainHeroDescription(configMap.main_hero_description);

        if (configMap.catalog_year) setCatalogYear(configMap.catalog_year);

        if (configMap.about_image) setAboutImage(configMap.about_image);
        if (configMap.about_description_1)
          setAboutDescription1(configMap.about_description_1);
        if (configMap.about_description_2)
          setAboutDescription2(configMap.about_description_2);

        if (configMap.about_amenities) {
          try {
            const parsedAmenities = JSON.parse(configMap.about_amenities);
            setAboutAmenities(parsedAmenities);
          } catch (e) {
            console.warn("Error parsing about amenities, using default");
          }
        }

        if (configMap.about_gallery) {
          try {
            const parsedGallery = JSON.parse(configMap.about_gallery);
            setAboutGallery(parsedGallery);
          } catch (e) {
            console.warn("Error parsing about gallery, using default");
          }
        }

        if (configMap.catalog_filters) {
          try {
            const parsedFilters = JSON.parse(configMap.catalog_filters);
            setCatalogFilters(parsedFilters);
          } catch (e) {
            console.warn("Error parsing catalog filters, using default");
          }
        }

        if (configMap.company_hours_days)
          setSettings((prev) => ({
            ...prev,
            hours: { ...prev.hours, days: configMap.company_hours_days },
          }));
        if (configMap.company_hours_time)
          setSettings((prev) => ({
            ...prev,
            hours: { ...prev.hours, time: configMap.company_hours_time },
          }));

        // Update general settings state
        setSettings((prev) => ({
          ...prev,
          companyName: configMap.company_name || prev.companyName,
          email: configMap.company_email || prev.email,
          phone: configMap.company_phone || prev.phone,
          address: configMap.company_address || prev.address,
          social: {
            instagram: configMap.social_instagram || prev.social.instagram,
            facebook: configMap.social_facebook || prev.social.facebook,
            whatsapp: configMap.social_whatsapp || prev.social.whatsapp,
          },
        }));

        setOriginalSettings({
          catalogHeroImage: configMap.catalog_hero_image,
          catalogHeroTitle: configMap.catalog_hero_title,
          catalogHeroSubtitle: configMap.catalog_hero_subtitle,
          mainHeroImage: configMap.main_hero_image,
          mainHeroTitle: configMap.main_hero_title,
          mainHeroSubtitle: configMap.main_hero_subtitle,
          mainHeroDescription: configMap.main_hero_description,
          catalogYear: configMap.catalog_year,
          aboutImage: configMap.about_image,
          aboutDescription1: configMap.about_description_1,
          aboutDescription2: configMap.about_description_2,
          aboutAmenities: configMap.about_amenities
            ? JSON.parse(configMap.about_amenities)
            : [],
          aboutGallery: configMap.about_gallery
            ? JSON.parse(configMap.about_gallery)
            : [],
          catalogFilters: configMap.catalog_filters
            ? JSON.parse(configMap.catalog_filters)
            : [],
          settings: {
            companyName: configMap.company_name,
            email: configMap.company_email,
            phone: configMap.company_phone,
            address: configMap.company_address,
            hours: {
              days: configMap.company_hours_days,
              time: configMap.company_hours_time,
            },
            social: {
              instagram: configMap.social_instagram,
              facebook: configMap.social_facebook,
              whatsapp: configMap.social_whatsapp,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Error al cargar la configuración");
    }
  };

  const handleSaveHero = async () => {
    try {
      const promise = async () => {
        if (heroForm.title !== catalogHeroTitle) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "catalog_hero_title", value: heroForm.title },
              { onConflict: "key" }
            );
          setCatalogHeroTitle(heroForm.title);
        }
        if (heroForm.subtitle !== catalogHeroSubtitle) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "catalog_hero_subtitle", value: heroForm.subtitle },
              { onConflict: "key" }
            );
          setCatalogHeroSubtitle(heroForm.subtitle);
        }
        if (heroForm.image && heroForm.image !== catalogHeroImage) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "catalog_hero_image", value: heroForm.image },
              { onConflict: "key" }
            );
          setCatalogHeroImage(heroForm.image);
        }
        if (heroForm.year !== catalogYear) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "catalog_year", value: heroForm.year },
              { onConflict: "key" }
            );
          setCatalogYear(heroForm.year);
        }
        return "Portada del catálogo actualizada";
      };

      toast.promise(promise(), {
        loading: "Guardando cambios...",
        success: (data) => {
          setIsEditingHero(false);
          return data;
        },
        error: "Error al actualizar",
      });
    } catch (error) {
      console.error("Error updating hero:", error);
    }
  };

  const handleSaveMainHero = async () => {
    try {
      const promise = async () => {
        if (mainHeroForm.title !== mainHeroTitle) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "main_hero_title", value: mainHeroForm.title },
              { onConflict: "key" }
            );
          setMainHeroTitle(mainHeroForm.title);
        }
        if (mainHeroForm.subtitle !== mainHeroSubtitle) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "main_hero_subtitle", value: mainHeroForm.subtitle },
              { onConflict: "key" }
            );
          setMainHeroSubtitle(mainHeroForm.subtitle);
        }
        if (mainHeroForm.image && mainHeroForm.image !== mainHeroImage) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "main_hero_image", value: mainHeroForm.image },
              { onConflict: "key" }
            );
          setMainHeroImage(mainHeroForm.image);
        }
        if (mainHeroForm.description !== mainHeroDescription) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "main_hero_description", value: mainHeroForm.description },
              { onConflict: "key" }
            );
          setMainHeroDescription(mainHeroForm.description);
        }
        return "Portada principal actualizada";
      };

      toast.promise(promise(), {
        loading: "Guardando cambios...",
        success: (data) => {
          setIsEditingMainHero(false);
          return data;
        },
        error: "Error al actualizar",
      });
    } catch (error) {
      console.error("Error updating main hero:", error);
    }
  };



  const handleHeroImageUpload = async (file: File, isMain: boolean = false) => {
    try {
      const promise = async () => {
        const imageUrl = await uploadImage(file);
        if (!imageUrl) throw new Error("Error al subir imagen");
        if (isMain) {
          setMainHeroForm((prev) => ({ ...prev, image: imageUrl }));
        } else {
          setHeroForm((prev) => ({ ...prev, image: imageUrl }));
        }
        return "Imagen subida, recuerda guardar los cambios.";
      };

      toast.promise(promise(), {
        loading: "Subiendo imagen...",
        success: (data) => data,
        error: "Error al subir la imagen",
      });
    } catch (error) {
      console.error("Error uploading hero image:", error);
    }
  };

  const handleGalleryImageUpload = async (file: File) => {
    try {
      const promise = async () => {
        const imageUrl = await uploadImage(file);
        if (!imageUrl) throw new Error("Error al subir imagen");
        setAboutGallery((prev) => [...prev, imageUrl]);
        setUploadedImages((prev) => [...prev, imageUrl]); // Track uploaded image
        return "Imagen agregada a la galería";
      };

      toast.promise(promise(), {
        loading: "Subiendo imagen...",
        success: (data) => data,
        error: "Error al subir la imagen",
      });
    } catch (error) {
      console.error("Error uploading gallery image:", error);
    }
  };

  const handleAboutImageUpload = async (file: File) => {
    try {
      const promise = async () => {
        const imageUrl = await uploadImage(file);
        if (!imageUrl) throw new Error("Error al subir imagen");
        setAboutImage(imageUrl);
        setUploadedImages((prev) => [...prev, imageUrl]); // Track uploaded image
        return "Imagen de sección actualizada";
      };

      toast.promise(promise(), {
        loading: "Subiendo imagen...",
        success: (data) => data,
        error: "Error al subir la imagen",
      });
    } catch (error) {
      console.error("Error uploading about image:", error);
    }
  };

  const handleSaveAll = async () => {
    try {
      const promise = async () => {
        // Save general settings
        await supabase
          .from("site_config")
          .upsert(
            { key: "company_name", value: settings.companyName },
            { onConflict: "key" }
          );
        await supabase
          .from("site_config")
          .upsert(
            { key: "company_email", value: settings.email },
            { onConflict: "key" }
          );
        await supabase
          .from("site_config")
          .upsert(
            { key: "company_phone", value: settings.phone },
            { onConflict: "key" }
          );
        await supabase
          .from("site_config")
          .upsert(
            { key: "company_address", value: settings.address },
            { onConflict: "key" }
          );

        // Save social media
        await supabase
          .from("site_config")
          .upsert(
            { key: "company_hours_days", value: settings.hours.days },
            { onConflict: "key" }
          );
        await supabase
          .from("site_config")
          .upsert(
            { key: "company_hours_time", value: settings.hours.time },
            { onConflict: "key" }
          );

        await supabase
          .from("site_config")
          .upsert(
            { key: "social_instagram", value: settings.social.instagram },
            { onConflict: "key" }
          );
        await supabase
          .from("site_config")
          .upsert(
            { key: "social_facebook", value: settings.social.facebook },
            { onConflict: "key" }
          );
        await supabase
          .from("site_config")
          .upsert(
            { key: "social_whatsapp", value: settings.social.whatsapp },
            { onConflict: "key" }
          );

        // Save about configuration
        if (aboutImage) {
          await supabase
            .from("site_config")
            .upsert(
              { key: "about_image", value: aboutImage },
              { onConflict: "key" }
            );
        }

        await supabase
          .from("site_config")
          .upsert(
            { key: "about_description_1", value: aboutDescription1 },
            { onConflict: "key" }
          );
        await supabase
          .from("site_config")
          .upsert(
            { key: "about_description_2", value: aboutDescription2 },
            { onConflict: "key" }
          );
        await supabase
          .from("site_config")
          .upsert(
            { key: "about_amenities", value: JSON.stringify(aboutAmenities) },
            { onConflict: "key" }
          );

        // Save gallery
        await supabase
          .from("site_config")
          .upsert(
            { key: "about_gallery", value: JSON.stringify(aboutGallery) },
            { onConflict: "key" }
          );

        // Save catalog filters
        await supabase
          .from("site_config")
          .upsert(
            { key: "catalog_filters", value: JSON.stringify(catalogFilters) },
            { onConflict: "key" }
          );

        // Update original settings to filter out "unsaved" state
        setOriginalSettings({
            ...originalSettings,
            aboutImage,
            aboutDescription1,
            aboutDescription2,
            aboutAmenities,
            aboutGallery,
            catalogFilters,
            settings
        })
        setUploadedImages([]); // Clear uploaded images list as they are now saved

        return "Toda la configuración guardada correctamente";
      };

      toast.promise(promise(), {
        loading: "Guardando configuración...",
        success: (data) => data,
        error: "Error al guardar",
      });
    } catch (error) {
      console.error("Error saving configuration:", error);
    }
  };

  const confirmCancel = async () => {
    try {
        // Delete uploaded images that weren't saved
        if (uploadedImages.length > 0) {
            await Promise.all(uploadedImages.map(async (url) => {
                // Only delete if it's NOT in the original settings (double check)
                if (url !== originalSettings.aboutImage && !originalSettings.aboutGallery.includes(url)) {
                     await deleteImage(url);
                }
            }));
            setUploadedImages([]);
        }

        // Restore State
        if (originalSettings) {
             // Main Hero
            setMainHeroImage(originalSettings.mainHeroImage);
            setMainHeroTitle(originalSettings.mainHeroTitle);
            setMainHeroSubtitle(originalSettings.mainHeroSubtitle);
            setMainHeroDescription(originalSettings.mainHeroDescription);
            
            // Catalog Hero
            setCatalogHeroImage(originalSettings.catalogHeroImage);
            setCatalogHeroTitle(originalSettings.catalogHeroTitle);
            setCatalogHeroSubtitle(originalSettings.catalogHeroSubtitle);
            setCatalogYear(originalSettings.catalogYear);

            // About
            setAboutImage(originalSettings.aboutImage);
            setAboutDescription1(originalSettings.aboutDescription1);
            setAboutDescription2(originalSettings.aboutDescription2);
            setAboutAmenities(originalSettings.aboutAmenities);
            setAboutGallery(originalSettings.aboutGallery);
            
            // Filters & General
            setCatalogFilters(originalSettings.catalogFilters);
            setSettings(originalSettings.settings);
        }
        toast.info("Cambios cancelados");
        setShowCancelWarning(false);

    } catch (error) {
        console.error("Error cancelling changes:", error);
        toast.error("Error al cancelar");
    }
  }

  const handleCancelClick = () => {
      setShowCancelWarning(true);
  }

  const hasChanges = useMemo(() => {
    if (!originalSettings) return false;

    const currentSettings = {
        companyName: settings.companyName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        hours: settings.hours,
        social: settings.social
    };
    
    // Simplistic comparison using JSON.stringify
    const settingsChanged = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings.settings);
    const aboutChanged = 
        aboutImage !== originalSettings.aboutImage ||
        aboutDescription1 !== originalSettings.aboutDescription1 ||
        aboutDescription2 !== originalSettings.aboutDescription2 ||
        JSON.stringify(aboutAmenities) !== JSON.stringify(originalSettings.aboutAmenities) ||
        JSON.stringify(aboutGallery) !== JSON.stringify(originalSettings.aboutGallery);
        
    const filtersChanged = JSON.stringify(catalogFilters) !== JSON.stringify(originalSettings.catalogFilters);

    return settingsChanged || aboutChanged || filtersChanged;
  }, [settings, aboutImage, aboutDescription1, aboutDescription2, aboutAmenities, aboutGallery, catalogFilters, originalSettings]);


  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">
        Configuración
      </h2>

      <div className="space-y-8 animate-fade-in mb-8">
        <div className="flex items-center justify-between bg-black p-4 border border-zinc-800">
          <button
            onClick={() =>
              setConfigView((v) => (v === "main" ? "catalog" : "main"))
            }
            className="p-2 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>

          <h3 className="text-white text-sm uppercase tracking-widest flex items-center gap-2">
            <Settings size={14} />
            {configView === "main"
              ? "Portada Principal (Home)"
              : "Portada del Catálogo"}
          </h3>

          <button
            onClick={() =>
              setConfigView((v) => (v === "main" ? "catalog" : "main"))
            }
            className="p-2 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {configView === "main" ? (
          /* Main Hero Editor */
          <div className="relative group overflow-hidden border border-zinc-800 bg-black">
            <div className="relative h-[60vh] overflow-hidden">
              <div className="absolute inset-0 bg-black/60 z-10"></div>
              <img
                src={mainHeroImage}
                alt="Main Hero"
                className="w-full h-full object-cover"
                style={{
                  filter: "grayscale(100%) contrast(110%) brightness(0.5)",
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
                    image: mainHeroImage,
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
                  filter: "grayscale(100%) contrast(90%) brightness(0.7)",
                }}
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                <h1 className="text-4xl md:text-6xl font-thin text-white uppercase tracking-tight mb-4 drop-shadow-lg">
                  {catalogHeroTitle}{" "}
                  <span className="text-zinc-400">{catalogYear}</span>
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
                    year: catalogYear,
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
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">
            Configuración General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">
            Horarios de Atención
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                  Días de Atención
                </label>
                <input
                  type="text"
                  value={settings.hours.days}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hours: { ...settings.hours, days: e.target.value },
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="Ej: Lunes a Viernes"
                />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                  Horario
                </label>
                <input
                  type="text"
                  value={settings.hours.time}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hours: { ...settings.hours, time: e.target.value },
                    })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder="Ej: 09:00 - 18:00 hs"
                />
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">
            Redes Sociales
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={settings.social.instagram}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, instagram: e.target.value },
                  })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={settings.social.facebook}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, facebook: e.target.value },
                  })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                WhatsApp
              </label>
              <input
                type="url"
                value={settings.social.whatsapp}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, whatsapp: e.target.value },
                  })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* Catalog Filters */}
        <div className="bg-black border border-zinc-800 p-4 sm:p-6">
          <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">
            Filtros de Catálogo
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFilter}
                onChange={(e) => setNewFilter(e.target.value)}
                placeholder="Nuevo filtro..."
                className="flex-1 bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newFilter.trim()) {
                    setCatalogFilters([...catalogFilters, newFilter.trim()]);
                    setNewFilter("");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newFilter.trim()) {
                    setCatalogFilters([...catalogFilters, newFilter.trim()]);
                    setNewFilter("");
                  }
                }}
                className="bg-white text-black px-4 py-2 text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Agregar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {catalogFilters.map((filter, index) => (
                <div key={index} className="relative group">
                  <input
                    type="text"
                    value={filter}
                    onChange={(e) => {
                      const newFilters = [...catalogFilters];
                      newFilters[index] = e.target.value;
                      setCatalogFilters(newFilters);
                    }}
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  />
                  <MuiTooltip
                    title="Eliminar filtro"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <button
                      onClick={() => {
                        const newFilters = catalogFilters.filter(
                          (_, i) => i !== index
                        );
                        setCatalogFilters(newFilters);
                      }}
                      className="absolute right-2 top-2.5 text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </MuiTooltip>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* About Configuration */}
      <div className="bg-black border border-zinc-800 p-4 sm:p-6">
        <h3 className="text-white text-base sm:text-lg mb-4 sm:mb-6 uppercase tracking-widest">
          Configuración de Quiénes Somos
        </h3>
        <div className="space-y-6">
          {/* Image Configuration */}
          <div>
            <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
              Imagen de la Sección
            </label>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {aboutImage && (
                  <img
                    src={aboutImage}
                    alt="About Preview"
                    className="w-20 h-20 object-cover flex-shrink-0"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                        handleAboutImageUpload(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                />
              </div>
              <input
                type="text"
                value={aboutImage}
                onChange={(e) => setAboutImage(e.target.value)}
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Esta imagen aparecerá en la sección "Quiénes Somos"
            </p>
          </div>

          {/* Text Descriptions */}
          <div>
            <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
              Primer Párrafo
            </label>
              <RichTextEditor
                tagName="p"
                initialValue={aboutDescription1}
                onChange={(value) => setAboutDescription1(value)}
                className="w-full bg-transparent border border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors min-h-[5rem] rounded"
                placeholder="Texto del primer párrafo..."
              />
              <p className="text-xs text-zinc-500 mt-1">
                Usa las herramientas de formato (selecciona el texto para verlas)
              </p>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Segundo Párrafo
              </label>
              <RichTextEditor
                tagName="p"
                initialValue={aboutDescription2}
                onChange={(value) => setAboutDescription2(value)}
                className="w-full bg-transparent border border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors min-h-[5rem] rounded"
                placeholder="Texto del segundo párrafo..."
              />
            </div>

          {/* Amenities/Services */}
          <div>
            <label className="block text-zinc-400 text-xs sm:text-sm mb-4">
              Servicios/Comodidades
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {aboutAmenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-zinc-900/30 border border-zinc-800 rounded hover:border-zinc-700 transition-colors group"
                >
                  <IconPicker
                    value={amenity.icon}
                    onChange={(icon) => {
                      const newAmenities = [...aboutAmenities];
                      newAmenities[index].icon = icon;
                      setAboutAmenities(newAmenities);
                    }}
                  />
                  <input
                    type="text"
                    value={amenity.text}
                    onChange={(e) => {
                      const newAmenities = [...aboutAmenities];
                      newAmenities[index].text = e.target.value;
                      setAboutAmenities(newAmenities);
                    }}
                    className="flex-1 bg-transparent text-white text-xs focus:outline-none placeholder-zinc-700"
                    placeholder="Servicio..."
                  />
                  <MuiTooltip
                    title="Eliminar servicio"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <button
                      onClick={() => {
                        const newAmenities = aboutAmenities.filter(
                          (_, i) => i !== index
                        );
                        setAboutAmenities(newAmenities);
                      }}
                      className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </MuiTooltip>
                </div>
              ))}
              <button
                onClick={() => {
                  setAboutAmenities([
                    ...aboutAmenities,
                    { icon: "CheckCircle", text: "Nuevo" },
                  ]);
                }}
                className="flex items-center justify-center gap-2 p-2 border border-dashed border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-600 transition-colors text-xs h-full min-h-[34px]"
              >
                <Plus size={12} /> Agregar
              </button>
            </div>
          </div>

          {/* Gallery Configuration */}
          <div>
            <label className="block text-zinc-400 text-xs sm:text-sm mb-4">
              Galería de Imágenes
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {aboutGallery.map((img, index) => (
                <div
                  key={index}
                  className="relative group aspect-square border border-zinc-800 bg-black"
                >
                  <img
                    src={img}
                    alt={`Gallery ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      const newGallery = aboutGallery.filter(
                        (_, i) => i !== index
                      );
                      setAboutGallery(newGallery);
                    }}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              <label className="border border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-white hover:bg-zinc-900 transition-all aspect-square">
                <Plus size={24} className="text-zinc-500 mb-2" />
                <span className="text-xs text-zinc-500 uppercase tracking-widest">
                  Agregar
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleGalleryImageUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-zinc-500">
              Estas imágenes aparecerán debajo del texto en la sección "Quiénes
              Somos".
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 sm:mt-8 gap-4">
        {hasChanges && (
            <button
            onClick={handleCancelClick}
            className="px-4 sm:px-6 py-3 text-sm uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
            Cancelar
            </button>
        )}
        <button
          onClick={handleSaveAll}
          className="relative bg-white text-black px-4 sm:px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
        >
          Guardar Cambios
          {hasChanges && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Modal Editar Main Hero */}
      {isEditingMainHero && (
        <Modal
          isOpen={true}
          title="Editar Portada Principal"
          onClose={() => setIsEditingMainHero(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Título
              </label>
              <input
                type="text"
                value={mainHeroForm.title}
                onChange={(e) =>
                  setMainHeroForm({ ...mainHeroForm, title: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Subtítulo
              </label>
              <input
                type="text"
                value={mainHeroForm.subtitle}
                onChange={(e) =>
                  setMainHeroForm({ ...mainHeroForm, subtitle: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Descripción
              </label>
              <RichTextEditor
                initialValue={mainHeroForm.description}
                onChange={(value) =>
                  setMainHeroForm({
                    ...mainHeroForm,
                    description: value,
                  })
                }
                className="w-full bg-transparent border border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors min-h-[5rem] rounded"
                placeholder="Descripción del hero principal..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Imagen de Fondo
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  {mainHeroForm.image && (
                    <img
                      src={mainHeroForm.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
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
                  <span className="text-xs text-zinc-500">
                    O pegar URL de imagen:
                  </span>
                  <input
                    type="text"
                    value={mainHeroForm.image}
                    onChange={(e) =>
                      setMainHeroForm({
                        ...mainHeroForm,
                        image: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
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
        <Modal
          isOpen={true}
          title="Editar Portada del Catálogo"
          onClose={() => setIsEditingHero(false)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Título
              </label>
              <input
                type="text"
                value={heroForm.title}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, title: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Subtítulo
              </label>
              <input
                type="text"
                value={heroForm.subtitle}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, subtitle: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Año del Catálogo
              </label>
              <input
                type="text"
                value={heroForm.year}
                onChange={(e) =>
                  setHeroForm({ ...heroForm, year: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Imagen de Fondo
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  {heroForm.image && (
                    <img
                      src={heroForm.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
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
                  <span className="text-xs text-zinc-500">
                    O pegar URL de imagen:
                  </span>
                  <input
                    type="text"
                    value={heroForm.image}
                    onChange={(e) =>
                      setHeroForm({ ...heroForm, image: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
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

      {/* Confirmation Modal for Cancel */}
      {showCancelWarning && (
        <Modal
          isOpen={true}
          title="Descartar Cambios"
          onClose={() => setShowCancelWarning(false)}
        >
          <div className="space-y-4">
            <p className="text-zinc-300 text-sm">
              ¿Estás seguro de que deseas cancelar? Todos los cambios no guardados se perderán permanentemente.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Volver
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 text-sm bg-red-900/30 text-red-500 border border-red-900/50 rounded hover:bg-red-900/50 hover:border-red-800 transition-colors uppercase tracking-wider"
              >
                Descartar Todo
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SettingsManager;


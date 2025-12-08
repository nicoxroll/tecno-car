import React, { useEffect, useState } from "react";
import { Wifi, Coffee, Tv, Wind, CheckCircle } from "lucide-react";
import { supabase } from "../services/supabase";

interface Amenity {
  icon: string;
  text: string;
}

const About: React.FC = () => {
  const [aboutImage, setAboutImage] = useState<string>(
    "https://images.pexels.com/photos/4488652/pexels-photo-4488652.jpeg?auto=compress&cs=tinysrgb&w=800"
  );
  const [aboutDescription1, setAboutDescription1] = useState<string>(
    'Les presentamos <strong className="text-white font-medium">Merlano Tecnología Vehicular</strong>, un taller especializado en brindar soluciones integrales de vehículos de todo tipo, con un enfoque centrado en la calidad, la experiencia y la atención personalizada.'
  );
  const [aboutDescription2, setAboutDescription2] = useState<string>(
    "Contamos con un espacio especialmente preparado para que la espera sea cómoda y agradable, donde cada detalle está pensado para su confort mientras cuidamos de su vehículo."
  );
  const [amenities, setAmenities] = useState<Amenity[]>([
    { icon: "Wind", text: "Sala de espera climatizada" },
    { icon: "Coffee", text: "Servicio de café" },
    { icon: "Wifi", text: "Wi-Fi gratuito" },
    { icon: "Tv", text: "Televisión con cable" },
    { icon: "CheckCircle", text: "Baño para clientes" },
  ]);

  useEffect(() => {
    const loadAboutData = async () => {
      try {
        const { data } = await supabase
          .from("site_config")
          .select("key, value");

        if (data) {
          const configMap = data.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});

          if (configMap.about_image) setAboutImage(configMap.about_image);
          if (configMap.about_description_1)
            setAboutDescription1(configMap.about_description_1);
          if (configMap.about_description_2)
            setAboutDescription2(configMap.about_description_2);

          if (configMap.about_amenities) {
            try {
              const parsedAmenities = JSON.parse(configMap.about_amenities);
              setAmenities(parsedAmenities);
            } catch (e) {
              console.warn("Error parsing amenities, using default");
            }
          }
        }
      } catch (error) {
        console.warn("Error loading about data, using defaults");
      }
    };

    loadAboutData();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Wind":
        return <Wind size={18} strokeWidth={1} />;
      case "Coffee":
        return <Coffee size={18} strokeWidth={1} />;
      case "Wifi":
        return <Wifi size={18} strokeWidth={1} />;
      case "Tv":
        return <Tv size={18} strokeWidth={1} />;
      case "CheckCircle":
        return <CheckCircle size={18} strokeWidth={1} />;
      default:
        return <CheckCircle size={18} strokeWidth={1} />;
    }
  };

  return (
    <section
      id="about"
      className="py-24 bg-zinc-950 border-t border-zinc-900 relative z-20"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Text Side */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <h2 className="text-4xl font-thin text-white mb-8 tracking-tight uppercase">
              Quienes <span className="text-zinc-500 font-medium">Somos</span>
            </h2>
            <div className="w-12 h-[1px] bg-white mb-8"></div>

            <p
              className="text-zinc-300 font-light text-sm leading-loose mb-8 text-justify"
              dangerouslySetInnerHTML={{ __html: aboutDescription1 }}
            ></p>
            <p className="text-zinc-400 font-light text-sm leading-loose mb-10">
              {aboutDescription2}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {amenities.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 text-zinc-400 group"
                >
                  <div className="w-10 h-10 border border-zinc-800 bg-black flex items-center justify-center text-white group-hover:border-white group-hover:text-white transition-colors">
                    {getIcon(item.icon)}
                  </div>
                  <span className="text-xs uppercase tracking-widest font-light group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Side */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <div className="relative aspect-[4/3] border border-zinc-800 p-2 bg-black">
              {/* Removed blue background decoration */}
              <img
                src={aboutImage}
                alt="Taller Merlano Sala de Espera"
                className="w-full h-full object-cover filter grayscale contrast-110 hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video border border-zinc-800 bg-black overflow-hidden">
            <video
              src="/presentacion.mkv"
              controls
              className="w-full h-full object-cover"
              poster="/placeholder.jpg"
            >
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

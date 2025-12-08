import React, { useState, useEffect } from "react";
import {
  Instagram,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "../services/supabase";

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<{
    id: string;
    img: string;
    title: string;
    permalink: string;
  } | null>(null);
  const [posts, setPosts] = useState<
    { id: string; img: string; title: string; permalink: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        if (data && data.length > 0) {
          const mappedPosts = data.map((post) => ({
            id: post.id,
            img: post.image_url,
            title: post.title,
            permalink:
              post.instagram_url ||
              "https://instagram.com/merlanotecnologiavehicular",
          }));
          setPosts(mappedPosts);
        } else {
          // Fallback if no posts in DB
          const placeholderPosts = [
            {
              id: "1",
              img: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200",
              title: "BMW TECH",
              permalink: "https://instagram.com/merlanotecnologiavehicular",
            },
            {
              id: "2",
              img: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1200",
              title: "INTERIORES",
              permalink: "https://instagram.com/merlanotecnologiavehicular",
            },
            {
              id: "3",
              img: "https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=1200",
              title: "BLACK SERIES",
              permalink: "https://instagram.com/merlanotecnologiavehicular",
            },
            {
              id: "4",
              img: "https://images.pexels.com/photos/136872/pexels-photo-136872.jpeg?auto=compress&cs=tinysrgb&w=1200",
              title: "MERCEDES BENZ",
              permalink: "https://instagram.com/merlanotecnologiavehicular",
            },
            {
              id: "5",
              img: "https://images.pexels.com/photos/794435/pexels-photo-794435.jpeg?auto=compress&cs=tinysrgb&w=1200",
              title: "AUDI S-LINE",
              permalink: "https://instagram.com/merlanotecnologiavehicular",
            },
            {
              id: "6",
              img: "https://images.pexels.com/photos/2526127/pexels-photo-2526127.jpeg?auto=compress&cs=tinysrgb&w=1200",
              title: "DETALLADO",
              permalink: "https://instagram.com/merlanotecnologiavehicular",
            },
          ];
          setPosts(placeholderPosts);
        }
      } catch (error) {
        console.error("Error fetching gallery posts:", error);
        // Fallback to placeholders on error
        const placeholderPosts = [
          {
            id: "1",
            img: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=1200",
            title: "BMW TECH",
            permalink: "https://instagram.com/merlanotecnologiavehicular",
          },
          {
            id: "2",
            img: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1200",
            title: "INTERIORES",
            permalink: "https://instagram.com/merlanotecnologiavehicular",
          },
          {
            id: "3",
            img: "https://images.pexels.com/photos/100650/pexels-photo-100650.jpeg?auto=compress&cs=tinysrgb&w=1200",
            title: "BLACK SERIES",
            permalink: "https://instagram.com/merlanotecnologiavehicular",
          },
          {
            id: "4",
            img: "https://images.pexels.com/photos/136872/pexels-photo-136872.jpeg?auto=compress&cs=tinysrgb&w=1200",
            title: "MERCEDES BENZ",
            permalink: "https://instagram.com/merlanotecnologiavehicular",
          },
          {
            id: "5",
            img: "https://images.pexels.com/photos/794435/pexels-photo-794435.jpeg?auto=compress&cs=tinysrgb&w=1200",
            title: "AUDI S-LINE",
            permalink: "https://instagram.com/merlanotecnologiavehicular",
          },
          {
            id: "6",
            img: "https://images.pexels.com/photos/2526127/pexels-photo-2526127.jpeg?auto=compress&cs=tinysrgb&w=1200",
            title: "DETALLADO",
            permalink: "https://instagram.com/merlanotecnologiavehicular",
          },
        ];
        setPosts(placeholderPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryPosts();
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = posts.findIndex((p) => p.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % posts.length;
    setSelectedImage(posts[nextIndex]);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = posts.findIndex((p) => p.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
    setSelectedImage(posts[prevIndex]);
  };

  return (
    <section
      id="gallery"
      className="py-24 bg-black border-t border-zinc-900 relative z-20"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-light text-white tracking-tight uppercase flex items-center gap-3">
            <Instagram className="text-white" size={24} strokeWidth={1} />
            Trabajos Recientes
          </h2>
          <a
            href="https://instagram.com/merlanotecnologiavehicular"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            Ver Instagram
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 bg-zinc-900 border border-zinc-900">
          {loading
            ? // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden bg-zinc-900 animate-pulse"
                >
                  <div className="w-full h-full bg-zinc-800"></div>
                </div>
              ))
            : posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square overflow-hidden bg-zinc-900 cursor-pointer"
                  onClick={() => setSelectedImage(post)}
                >
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 filter grayscale contrast-110"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-light tracking-[0.2em] text-xs uppercase border border-white px-4 py-2">
                      {post.title}
                    </span>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-20 p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-zinc-950 border border-zinc-800 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-zinc-300 transition-colors flex items-center gap-2"
            >
              <span className="text-xs tracking-widest uppercase">Cerrar</span>
              <X size={24} strokeWidth={1} />
            </button>

            <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden border-b border-zinc-900 group">
              <img
                src={selectedImage.img}
                alt={selectedImage.title}
                className="max-h-[70vh] w-auto object-contain"
              />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-2 rounded-full border border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={24} strokeWidth={1} />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-2 rounded-full border border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={24} strokeWidth={1} />
              </button>
            </div>

            <div className="p-8 flex justify-between items-center bg-zinc-950">
              <h3 className="text-xl text-white font-light tracking-[0.2em] uppercase">
                {selectedImage.title}
              </h3>
              <a
                href="https://instagram.com/merlanotecnologiavehicular"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest border border-zinc-800 px-6 py-3 transition-colors"
              >
                Ver en Instagram
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;

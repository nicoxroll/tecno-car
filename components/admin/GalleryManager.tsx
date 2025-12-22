import { CircularProgress, Fade, Tooltip as MuiTooltip } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Facebook,
  Image as ImageIcon,
  Instagram,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { deleteImage, supabase, uploadImage } from "../../services/supabase";
import Modal from "./Modal";

interface GalleryPost {
  id: string;
  title: string;
  image_url: string;
  description?: string;
  instagram_url?: string;
  platform?: "instagram" | "facebook";
  created_at?: string;
}

const GalleryManager: React.FC = () => {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<GalleryPost | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryPost | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<GalleryPost>>({
    title: "",
    image_url: "",
    description: "",
    instagram_url: "",
    platform: "instagram",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching gallery posts:", error);
      toast.error("Error al cargar la galería");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file);
      if (!imageUrl) throw new Error("Error al subir imagen");
      setFormData((prev) => ({ ...prev, image_url: imageUrl }));
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image_url) {
      toast.error("El título y la imagen son obligatorios");
      return;
    }

    try {
      if (editingPost) {
        const { error } = await supabase.from("gallery_posts").upsert({
          id: editingPost.id,
          title: formData.title,
          image_url: formData.image_url,
          description: formData.description,
          instagram_url: formData.instagram_url,
          platform: formData.platform,
        });

        if (error) throw error;
        toast.success("Publicación actualizada");
      } else {
        const { error } = await supabase.from("gallery_posts").insert([
          {
            title: formData.title,
            image_url: formData.image_url,
            description: formData.description,
            instagram_url: formData.instagram_url,
            platform: formData.platform,
          },
        ]);

        if (error) throw error;
        toast.success("Publicación creada");
      }

      fetchPosts();
      resetForm();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Error al guardar la publicación");
    }
  };

  const handleDelete = async () => {
    if (!deletingPostId) return;

    try {
      const { error } = await supabase
        .from("gallery_posts")
        .delete()
        .eq("id", deletingPostId);

      if (error) throw error;

      setPosts(posts.filter((p) => p.id !== deletingPostId));
      toast.success("Publicación eliminada");
      setDeletingPostId(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Error al eliminar la publicación");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image_url: "",
      description: "",
      instagram_url: "",
      platform: "instagram",
    });
    setIsCreating(false);
    setEditingPost(null);
  };

  const openEditModal = (post: GalleryPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      image_url: post.image_url,
      description: post.description || "",
      instagram_url: post.instagram_url || "",
      platform: post.platform || "instagram",
    });
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = posts.findIndex((p) => p.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % posts.length;
    setSelectedImage(posts[nextIndex]);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedImage) return;
    const currentIndex = posts.findIndex((p) => p.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + posts.length) % posts.length;
    setSelectedImage(posts[prevIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      if (e.key === "Escape") setSelectedImage(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, posts]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-white uppercase tracking-tight">
          Galería de Instagram
        </h2>
        <MuiTooltip
          title="Nueva Publicación"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
        >
          <button
            onClick={() => setIsCreating(true)}
            className="bg-white text-black px-3 py-2 text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center"
          >
            <Plus size={16} />
          </button>
        </MuiTooltip>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <CircularProgress size={30} sx={{ color: "white" }} />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 border-dashed bg-black">
          <ImageIcon size={48} className="text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-lg font-light">
            Aún no hay publicaciones
          </p>
          <p className="text-zinc-600 text-sm mt-2">
            Comienza creando una nueva publicación para la galería
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-black border border-zinc-800 group relative"
            >
              <div
                className="aspect-square overflow-hidden relative cursor-pointer"
                onClick={() => setSelectedImage(post)}
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <MuiTooltip
                    title="Editar"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(post);
                      }}
                      className="p-2 bg-white text-black hover:bg-zinc-200 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                  </MuiTooltip>
                  <MuiTooltip
                    title="Eliminar"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingPostId(post.id);
                      }}
                      className="p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </MuiTooltip>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-medium truncate">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-zinc-400 text-sm truncate mt-1">
                    {post.description}
                  </p>
                )}
                {post.instagram_url && (
                  <a
                    href={post.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-zinc-500 mt-2 hover:text-white transition-colors"
                  >
                    {post.platform === "facebook" ? (
                      <Facebook size={12} />
                    ) : (
                      <Instagram size={12} />
                    )}
                    Ver publicación
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedImage &&
        createPortal(
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
                <span className="text-xs tracking-widest uppercase">
                  Cerrar
                </span>
                <X size={24} strokeWidth={1} />
              </button>

              <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden border-b border-zinc-900 group">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title}
                  crossOrigin="anonymous"
                  className="max-h-[70vh] w-auto object-contain"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-2 border border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} strokeWidth={1} />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-2 border border-zinc-700 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} strokeWidth={1} />
                </button>
              </div>

              <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-zinc-950">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl text-white font-light tracking-[0.2em] uppercase">
                    {selectedImage.title}
                  </h3>
                  {selectedImage.description && (
                    <p className="text-zinc-400 text-sm font-light max-w-2xl">
                      {selectedImage.description}
                    </p>
                  )}
                </div>
                {selectedImage.instagram_url && (
                  <a
                    href={selectedImage.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest border border-zinc-800 px-6 py-3 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    {selectedImage.platform === "facebook" ? (
                      <>
                        <Facebook size={16} /> Ver en Facebook
                      </>
                    ) : (
                      <>
                        <Instagram size={16} /> Ver en Instagram
                      </>
                    )}
                  </a>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Create/Edit Modal */}
      {(isCreating || editingPost) && (
        <Modal
          isOpen={true}
          title={editingPost ? "Editar Publicación" : "Nueva Publicación"}
          onClose={resetForm}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                placeholder="Título de la publicación"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Imagen
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      crossOrigin="anonymous"
                      className="w-20 h-20 object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload(e.target.files[0]);
                      }
                    }}
                    className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-zinc-900"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                    placeholder="URL de la imagen"
                    required
                  />
                  <MuiTooltip
                    title="Eliminar imagen"
                    TransitionComponent={Fade}
                    TransitionProps={{ timeout: 600 }}
                  >
                    <button
                      type="button"
                      onClick={async () => {
                        if (formData.image_url) {
                          await deleteImage(formData.image_url);
                          setFormData({ ...formData, image_url: "" });
                        }
                      }}
                      className="text-zinc-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </MuiTooltip>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700 resize-none"
                placeholder="Descripción de la publicación..."
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Plataforma
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="platform"
                    value="instagram"
                    checked={formData.platform === "instagram"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        platform: e.target.value as "instagram" | "facebook",
                      })
                    }
                    className="accent-white"
                  />
                  <span className="text-white text-sm flex items-center gap-1">
                    <Instagram size={16} /> Instagram
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="platform"
                    value="facebook"
                    checked={formData.platform === "facebook"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        platform: e.target.value as "instagram" | "facebook",
                      })
                    }
                    className="accent-white"
                  />
                  <span className="text-white text-sm flex items-center gap-1">
                    <Facebook size={16} /> Facebook
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Link de la publicación (Opcional)
              </label>
              <div className="flex items-center gap-2">
                {formData.platform === "facebook" ? (
                  <Facebook size={18} className="text-zinc-400" />
                ) : (
                  <Instagram size={18} className="text-zinc-400" />
                )}
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram_url: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-zinc-800 text-white px-3 py-2 text-sm focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                  placeholder={
                    formData.platform === "facebook"
                      ? "https://facebook.com/..."
                      : "https://instagram.com/p/..."
                  }
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                {editingPost ? "Guardar Cambios" : "Crear Publicación"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPostId && (
        <Modal
          isOpen={true}
          title="Eliminar Publicación"
          onClose={() => setDeletingPostId(null)}
        >
          <div className="space-y-4">
            <p className="text-zinc-300">
              ¿Estás seguro de que deseas eliminar esta publicación? Esta acción
              no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setDeletingPostId(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
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

export default GalleryManager;

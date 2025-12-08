import React, { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  Plus,
  X,
  Instagram,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { supabase, uploadImage } from "../../services/supabase";
import Modal from "./Modal";

interface GalleryPost {
  id: string;
  title: string;
  image_url: string;
  description?: string;
  instagram_url?: string;
  created_at?: string;
}

const GalleryManager: React.FC = () => {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<GalleryPost | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<GalleryPost>>({
    title: "",
    image_url: "",
    description: "",
    instagram_url: "",
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
        const { error } = await supabase
          .from("gallery_posts")
          .update({
            title: formData.title,
            image_url: formData.image_url,
            description: formData.description,
            instagram_url: formData.instagram_url,
          })
          .eq("id", editingPost.id);

        if (error) throw error;
        toast.success("Publicación actualizada");
      } else {
        const { error } = await supabase.from("gallery_posts").insert([
          {
            title: formData.title,
            image_url: formData.image_url,
            description: formData.description,
            instagram_url: formData.instagram_url,
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
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-white uppercase tracking-tight">
          Galería de Instagram
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-white text-black px-4 py-2 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Nueva Publicación
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-white rounded-full"></div>
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
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => openEditModal(post)}
                    className="p-2 bg-white text-black hover:bg-zinc-200 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => setDeletingPostId(post.id)}
                    className="p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
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
                    <Instagram size={12} /> Ver en Instagram
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
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
                className="w-full bg-black border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
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
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full bg-black border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="URL de la imagen"
                  required
                />
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
                className="w-full bg-black border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                placeholder="Descripción de la publicación..."
              />
            </div>

            <div>
              <label className="block text-zinc-400 text-xs sm:text-sm mb-2">
                Link de Instagram (Opcional)
              </label>
              <div className="flex items-center gap-2">
                <Instagram size={18} className="text-zinc-400" />
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram_url: e.target.value })
                  }
                  className="w-full bg-black border border-zinc-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                  placeholder="https://instagram.com/p/..."
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

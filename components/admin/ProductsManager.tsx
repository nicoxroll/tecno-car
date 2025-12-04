import React, { useState } from 'react';
import { Edit, Trash2, Plus, X, Filter, Search } from 'lucide-react';
import { Product } from '../../types';
import Modal from './Modal';

interface ProductsManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  setProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [priceRange, setPriceRange] = useState<number>(1000000);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creatingProduct, setCreatingProduct] = useState<Partial<Product> | null>(null);

  const handleUpdateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleCreateProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Math.max(...products.map(p => p.id), 0) + 1
    };
    setProducts([...products, newProduct]);
    setCreatingProduct(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-light text-white uppercase tracking-tight">Gestión de Productos</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2 text-white text-xs uppercase tracking-widest border border-zinc-700 px-3 py-2 hover:bg-zinc-900 transition-colors"
          >
            <Filter size={14} /> {isFiltersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button
            onClick={() => setCreatingProduct({ name: '', category: '', price: 0 })}
            className="bg-white text-black px-3 py-2 text-xs sm:text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            Agregar Producto
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${isFiltersOpen ? 'w-full lg:w-64 opacity-100 max-h-[1000px]' : 'w-0 opacity-0 max-h-0 lg:max-h-[1000px] lg:w-0'}`}>
          <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-6">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="BUSCAR PRODUCTOS..."
                className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm py-3 pl-3 pr-10 focus:outline-none focus:border-white transition-colors"
              />
              <Search size={16} className="absolute right-3 top-3 text-zinc-500" />
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-4">
                Categorías
              </h3>
              <div className="space-y-2">
                {['Todos', 'Multimedia', 'Audio', 'Iluminación', 'Seguridad', 'Accesorios'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left text-sm py-2 px-3 transition-all duration-200 border-l-2 ${selectedCategory === cat ? 'border-white text-white bg-zinc-900 font-medium' : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-4">
                Precio Máximo
              </h3>
              <div className="px-2">
                <input
                  type="range"
                  min="50000"
                  max="1000000"
                  step="10000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-3 font-mono">
                  <span>$50k</span>
                  <span className="text-white">${priceRange.toLocaleString()}</span>
                  <span>$1M+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table/Grid */}
        <div className="flex-1">
          <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400 text-sm">{products.filter(p => (selectedCategory === 'Todos' || p.category === selectedCategory) && p.price <= priceRange).length} productos encontrados</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={`text-sm px-3 py-1 border transition-colors ${viewMode === 'table' ? 'border-white text-white' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  Tabla
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`text-sm px-3 py-1 border transition-colors ${viewMode === 'grid' ? 'border-white text-white' : 'border-zinc-700 text-zinc-400 hover:text-white'}`}
                >
                  Grid
                </button>
              </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Categoría</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {products.filter(p =>
                    (selectedCategory === 'Todos' || p.category === selectedCategory) &&
                    p.price <= priceRange
                  ).map((product) => (
                    <tr key={product.id} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover border border-zinc-700"
                          />
                          <div>
                            <div className="text-white text-sm font-medium">{product.name}</div>
                            <div className="text-zinc-500 text-xs">{product.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-zinc-400">{product.category}</td>
                      <td className="px-4 py-4 text-sm text-white font-medium">${product.price.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-zinc-400">{product.stock || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.available ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                          {product.available ? 'Disponible' : 'Agotado'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-zinc-400 hover:text-white transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className={`grid gap-6 transition-all duration-500 ${isFiltersOpen ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'}`}>
                {products.filter(p =>
                  (selectedCategory === 'Todos' || p.category === selectedCategory) &&
                  p.price <= priceRange
                ).map((product) => (
                  <div key={product.id} className="group bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
                    <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => setEditingProduct(product)}>
                      <img
                        src={product.image || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      />
                      {/* Edit Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <Edit size={24} className="mx-auto mb-2" />
                          <span className="text-xs uppercase tracking-widest">Editar</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">{product.category}</span>
                      <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-zinc-400 text-xs line-clamp-2 mb-3">{product.description || 'Sin descripción'}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">${product.price.toLocaleString()}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                            className="text-zinc-400 hover:text-white transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                            className="text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {products.filter(p =>
              (selectedCategory === 'Todos' || p.category === selectedCategory) &&
              p.price <= priceRange
            ).length === 0 && (
              <div className="py-24 text-center border border-zinc-900 border-dashed">
                <p className="text-zinc-500 font-light mb-2">No se encontraron productos con estos filtros.</p>
                <button
                  onClick={() => { setPriceRange(1000000); setSelectedCategory('Todos'); }}
                  className="text-white text-sm underline hover:text-zinc-300"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title="Editar Producto"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-sm mb-4 uppercase tracking-widest">Imagen del Producto</label>
                  <div className="aspect-square bg-zinc-900 border border-zinc-800 overflow-hidden group cursor-pointer">
                    <img
                      src={editingProduct.image || '/placeholder.jpg'}
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
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
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
                          setEditingProduct({...editingProduct, image: e.target?.result as string});
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
                  <label className="block text-zinc-400 text-sm mb-2">Nombre del Producto</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Nombre del producto"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Categoría</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                  >
                    <option value="Multimedia">Multimedia</option>
                    <option value="Audio">Audio</option>
                    <option value="Iluminación">Iluminación</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Precio ($)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm mb-2">Stock</label>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                      className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    placeholder="Descripción del producto"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Características (opcional)</label>
                  <textarea
                    value={editingProduct.features ? editingProduct.features.join('\n') : ''}
                    onChange={(e) => setEditingProduct({...editingProduct, features: e.target.value.split('\n').filter(f => f.trim())})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    placeholder="Una característica por línea"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800">
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                    handleDeleteProduct(editingProduct.id);
                    setEditingProduct(null);
                  }
                }}
                className="bg-red-900 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-red-800 transition-colors"
              >
                Eliminar Producto
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleUpdateProduct(editingProduct);
                  }}
                  className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
        </Modal>
      )}

      {/* Create Product Modal */}
      {creatingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setCreatingProduct(null)}
          title="Crear Nuevo Producto"
        >
            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Image */}
              <div>
                <label className="block text-zinc-400 text-sm mb-2">Imagen del Producto</label>
                <div className="aspect-square bg-zinc-900 border border-zinc-700 overflow-hidden mb-4">
                  <img
                    src={creatingProduct.image || '/placeholder.jpg'}
                    alt="Nuevo producto"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="url"
                  value={creatingProduct.image || ''}
                  onChange={(e) => setCreatingProduct({...creatingProduct, image: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                  placeholder="URL de la imagen"
                />
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Nombre del Producto *</label>
                  <input
                    type="text"
                    value={creatingProduct.name || ''}
                    onChange={(e) => setCreatingProduct({...creatingProduct, name: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="Nombre del producto"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Categoría *</label>
                  <select
                    value={creatingProduct.category || ''}
                    onChange={(e) => setCreatingProduct({...creatingProduct, category: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Multimedia">Multimedia</option>
                    <option value="Audio">Audio</option>
                    <option value="Iluminación">Iluminación</option>
                    <option value="Seguridad">Seguridad</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Precio *</label>
                  <input
                    type="number"
                    value={creatingProduct.price || 0}
                    onChange={(e) => setCreatingProduct({...creatingProduct, price: Number(e.target.value)})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Descripción</label>
                  <textarea
                    value={creatingProduct.description || ''}
                    onChange={(e) => setCreatingProduct({...creatingProduct, description: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-32 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    placeholder="Descripción del producto"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Características (opcional)</label>
                  <textarea
                    value={creatingProduct.features ? creatingProduct.features.join('\n') : ''}
                    onChange={(e) => setCreatingProduct({...creatingProduct, features: e.target.value.split('\n').filter(f => f.trim())})}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 h-24 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
                    placeholder="Una característica por línea"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end items-center mt-8 pt-6 border-t border-zinc-800">
              <div className="flex gap-3">
                <button
                  onClick={() => setCreatingProduct(null)}
                  className="bg-zinc-800 text-white px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!creatingProduct.name || !creatingProduct.category || !creatingProduct.price) {
                      alert('Por favor completa los campos obligatorios: nombre, categoría y precio.');
                      return;
                    }
                    handleCreateProduct(creatingProduct as Omit<Product, 'id'>);
                  }}
                  className="bg-white text-black px-6 py-3 text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Crear Producto
                </button>
              </div>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductsManager;

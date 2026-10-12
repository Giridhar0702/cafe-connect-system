import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/StoreContext';
import type { CategoryItem } from '../../types';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  UtensilsCrossed,
  AlertTriangle,
  FolderTree
} from 'lucide-react';

const CategoriesManagement: React.FC = () => {
  const { 
    categoryItems, 
    foods, 
    addCategoryItem, 
    updateCategoryItem, 
    deleteCategoryItem, 
    toggleCategoryItemActive, 
    adminSearchQuery 
  } = useStore();

  const defaultCategoryForm: Partial<CategoryItem> = {
    name: '',
    description: '',
    displayOrder: (categoryItems?.length || 0) + 1,
    isActive: true
  };

  const [formData, setFormData] = useState<Partial<CategoryItem>>(defaultCategoryForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Compute how many foods belong to each category
  const foodCountsByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    foods.forEach(f => {
      map[f.category] = (map[f.category] || 0) + 1;
    });
    return map;
  }, [foods]);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let list = [...categoryItems];
    if (adminSearchQuery) {
      const q = adminSearchQuery.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        (c.description && c.description.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [categoryItems, adminSearchQuery]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingId) {
      const existing = categoryItems.find(c => c.id === editingId);
      if (existing) {
        updateCategoryItem({
          ...existing,
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          displayOrder: Number(formData.displayOrder) || existing.displayOrder,
          isActive: formData.isActive !== undefined ? formData.isActive : existing.isActive,
        });
      }
      setEditingId(null);
    } else {
      addCategoryItem({
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        displayOrder: Number(formData.displayOrder) || (categoryItems.length + 1),
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      });
    }

    setFormData({
      ...defaultCategoryForm,
      displayOrder: categoryItems.length + 2
    });
  };

  const handleEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      displayOrder: cat.displayOrder,
      isActive: cat.isActive
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(defaultCategoryForm);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteCategoryItem(deleteId);
      setDeleteId(null);
      if (editingId === deleteId) {
        handleCancelEdit();
      }
    }
  };

  const categoryToDelete = useMemo(() => {
    return categoryItems.find(c => c.id === deleteId);
  }, [categoryItems, deleteId]);

  const activeCount = useMemo(() => {
    return categoryItems.filter(c => c.isActive).length;
  }, [categoryItems]);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-600" />
            Category Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage food menu categories, display order, and customer menu visibility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm text-sm">
            <span className="text-gray-500 font-medium">Total: </span>
            <span className="font-bold text-gray-900">{categoryItems.length}</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 shadow-sm text-sm">
            <span className="text-emerald-700 font-medium">Active: </span>
            <span className="font-bold text-emerald-800">{activeCount}</span>
          </div>
        </div>
      </div>

      {/* Add / Edit Form Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {editingId ? (
              <>
                <Edit2 className="w-5 h-5 text-blue-600" />
                Edit Category: <span className="text-primary-600">{formData.name}</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-primary-600" />
                Add New Category
              </>
            )}
          </h2>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-gray-500 hover:text-gray-700 underline font-medium"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Starters, Briyanis, Hot Beverages"
                className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.displayOrder ?? 1}
                onChange={e => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))}
                className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description for customer menu cards..."
                className="w-full border border-gray-300 p-2.5 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* Active & Submit button */}
            <div className="flex items-center justify-between md:justify-end gap-4 h-11">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <div className="flex items-center gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  {editingId ? (
                    <>
                      <Edit2 className="w-4 h-4" />
                      Update Category
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Category
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[750px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider w-16">
                  Order
                </th>
                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Category Name
                </th>
                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Description
                </th>
                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Food Dishes
                </th>
                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <FolderTree className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    No categories found. Create a category above.
                  </td>
                </tr>
              ) : (
                filteredCategories.map(cat => {
                  const itemCount = foodCountsByCategory[cat.name] || 0;
                  const isEditing = editingId === cat.id;

                  return (
                    <tr 
                      key={cat.id} 
                      className={`hover:bg-gray-50/70 transition ${isEditing ? 'bg-primary-50/40' : ''}`}
                    >
                      {/* Order */}
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs">
                          {cat.displayOrder}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-sm">{cat.name}</div>
                      </td>

                      {/* Description */}
                      <td className="p-4 max-w-[240px]">
                        <span className="text-sm text-gray-600 line-clamp-1" title={cat.description}>
                          {cat.description || <span className="text-gray-300 italic">No description</span>}
                        </span>
                      </td>

                      {/* Food Count Badge */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => toggleCategoryItemActive(cat.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            cat.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                          title={cat.isActive ? 'Click to deactivate' : 'Click to activate'}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              cat.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(cat.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Category: {categoryToDelete.name}?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to remove this category from the database?
                </p>

                {(foodCountsByCategory[categoryToDelete.name] || 0) > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Warning:</strong> {foodCountsByCategory[categoryToDelete.name]} food items are currently assigned to this category.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-sm"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManagement;

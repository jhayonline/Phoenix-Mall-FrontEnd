import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categoriesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  display_order: number | null;
  is_active: boolean;
  children?: Category[];
}

interface ApiError {
  message?: string;
  error?: string;
  description?: string;
}

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    level: 1,
    display_order: 0,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getAllCategories();
      if (response.success && response.data) {
        const tree = buildCategoryTree(response.data);
        setCategories(tree);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      const error = err as ApiError;
      toast({
        title: "Error",
        description: error.message || error.error || error.description || "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const buildCategoryTree = (categories: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    categories.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach(cat => {
      const categoryWithChildren = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        const parent = map.get(cat.parent_id)!;
        if (!parent.children) parent.children = [];
        parent.children.push(categoryWithChildren);
      } else {
        roots.push(categoryWithChildren);
      }
    });

    return roots;
  };

  const handleCreate = async () => {
    try {
      await categoriesApi.createCategory({
        name: formData.name,
        slug: formData.slug,
        parent_id: formData.parent_id || null,
        level: formData.level,
        display_order: formData.display_order,
      });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setShowAddModal(false);
      setFormData({ name: '', slug: '', parent_id: '', level: 1, display_order: 0 });
      loadCategories();
    } catch (err) {
      const error = err as ApiError;
      toast({
        title: "Error",
        description: error.message || error.error || error.description || "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    try {
      await categoriesApi.updateCategory(editingCategory.id, {
        name: formData.name,
        slug: formData.slug,
        parent_id: formData.parent_id || null,
        level: formData.level,
        display_order: formData.display_order,
      });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setEditingCategory(null);
      setFormData({ name: '', slug: '', parent_id: '', level: 1, display_order: 0 });
      loadCategories();
    } catch (err) {
      const error = err as ApiError;
      toast({
        title: "Error",
        description: error.message || error.error || error.description || "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesApi.deleteCategory(id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      loadCategories();
    } catch (err) {
      const error = err as ApiError;
      toast({
        title: "Error",
        description: error.message || error.error || error.description || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const renderCategoryTree = (categories: Category[], depth: number = 0) => {
    return categories.map((category) => (
      <div key={category.id} className="mb-2">
        <div className={`flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 ${depth > 0 ? 'ml-8' : ''}`}>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="font-medium">{category.name}</span>
              <span className="text-xs text-gray-500">({category.slug})</span>
              {!category.is_active && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Inactive</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Level: {category.level} | Order: {category.display_order}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingCategory(category);
                setFormData({
                  name: category.name,
                  slug: category.slug,
                  parent_id: category.parent_id || '',
                  level: category.level,
                  display_order: category.display_order || 0,
                });
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="mt-2">
            {renderCategoryTree(category.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Only show for admin users
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Categories Management</h1>
            <p className="text-gray-600 mt-1">Manage your product categories</p>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        {/* Categories Tree */}
        <div className="bg-gray-50 rounded-xl">
          {categories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">No categories found</p>
              <Button
                onClick={() => setShowAddModal(true)}
                variant="outline"
                className="mt-4"
              >
                Create your first category
              </Button>
            </div>
          ) : (
            renderCategoryTree(categories)
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setFormData({ name: '', slug: '', parent_id: '', level: 1, display_order: 0 });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setFormData(prev => ({ ...prev, slug }));
                  }}
                  placeholder="e.g., Electronics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., electronics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Parent Category</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {'—'.repeat(Math.min(cat.level, 3))} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Level</label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={editingCategory ? handleUpdate : handleCreate}
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                {editingCategory ? 'Update' : 'Create'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setFormData({ name: '', slug: '', parent_id: '', level: 1, display_order: 0 });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default CategoriesManagement;

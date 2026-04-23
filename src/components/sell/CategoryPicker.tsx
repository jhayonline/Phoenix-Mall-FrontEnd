import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { categoriesApi } from "@/lib/api";
import type { CategoryResponseData } from "@/lib/api";

interface CategoryPickerProps {
  selectedCategoryId: string | null;
  onSelect: (categoryId: string, categoryName: string) => void;
}

interface CategoryNode extends CategoryResponseData {
  children?: CategoryNode[];
  level: number;
  description?: string | null;
}

const CategoryPicker: React.FC<CategoryPickerProps> = ({ selectedCategoryId, onSelect }) => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [currentLevel, setCurrentLevel] = useState<CategoryNode[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAllCategories();
      if (response.success && response.data) {
        const tree = buildCategoryTree(response.data);
        setCategories(tree);
        setCurrentLevel(tree);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (flatCategories: CategoryResponseData[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    // First pass: create nodes
    flatCategories.forEach((cat) => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
        level: cat.level,
        description: cat.description,
      });
    });

    // Second pass: build hierarchy
    flatCategories.forEach((cat) => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort by display_order
    const sortByOrder = (items: CategoryNode[]) => {
      items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      items.forEach((item) => {
        if (item.children) sortByOrder(item.children);
      });
    };
    sortByOrder(roots);

    return roots;
  };

  const handleCategorySelect = (category: CategoryNode) => {
    if (category.children && category.children.length > 0) {
      // Go deeper
      setCurrentLevel(category.children);
      setBreadcrumb([...breadcrumb, category]);
    } else {
      // Leaf category - select it
      onSelect(category.id, category.name);
    }
  };

  const handleBack = () => {
    if (breadcrumb.length === 0) {
      setCurrentLevel(categories);
    } else {
      const newBreadcrumb = [...breadcrumb];
      newBreadcrumb.pop();
      setBreadcrumb(newBreadcrumb);

      if (newBreadcrumb.length === 0) {
        setCurrentLevel(categories);
      } else {
        const parent = newBreadcrumb[newBreadcrumb.length - 1];
        setCurrentLevel(parent.children || []);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-400">/</span>
          {breadcrumb.map((item, idx) => (
            <span key={item.id} className="text-gray-900">
              {item.name}
              {idx < breadcrumb.length - 1 && <span className="text-gray-400 ml-1">/</span>}
            </span>
          ))}
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {currentLevel.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category)}
            className={`p-4 text-left rounded-xl border-2 transition-all ${
              selectedCategoryId === category.id
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{category.name}</span>
              {category.children && category.children.length > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              {selectedCategoryId === category.id && <Check className="w-4 h-4 text-red-500" />}
            </div>
            {category.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
            )}
          </button>
        ))}
      </div>

      {currentLevel.length === 0 && (
        <div className="text-center py-8 text-gray-500">No categories available</div>
      )}
    </div>
  );
};

export default CategoryPicker;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { categoriesApi } from '@/lib/api';
import { iconMap } from '@/lib/iconMap';
import { Package } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: number;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAllCategories();
      if (response.success && response.data) {
        // Only show level 1 categories on the main categories page
        const level1Categories = response.data.filter(cat => cat.level === 1);
        setCategories(level1Categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/shop?category=${categoryName.toLowerCase()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 pb-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-4">
              <Flame className="w-4 h-4 mr-2" />
              Browse All Categories
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by <span className="text-red-600">Category</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of products organized into categories for easy browsing
            </p>
          </motion.div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {categories.map((category) => {
              const Icon = iconMap[category.name] as React.ElementType || Package;
              const isHovered = hoveredCategory === category.id;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(category.name)}
                  onHoverStart={() => setHoveredCategory(category.id)}
                  onHoverEnd={() => setHoveredCategory(null)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative mb-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      {Icon && (
                        <Icon className="w-10 h-10 md:w-12 md:h-12 text-red-600" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                  <h3 className="text-center font-semibold text-sm sm:text-base md:text-lg text-gray-900">
                    {category.name}
                  </h3>
                  {category.description && isHovered && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-xs text-gray-500 text-center mt-1 max-w-[120px]"
                    >
                      {category.description}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 shadow-lg">
              <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600 font-medium">
                {categories.length} categories available
              </span>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Categories;

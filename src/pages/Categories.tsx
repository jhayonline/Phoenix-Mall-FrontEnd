import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Laptop,
  Smartphone,
  Sofa,
  Home,
  Shirt,
  Gem,
  Building,
  Car,
  Wrench,
  Utensils,
  Baby,
  Sparkles,
  Filter,
  Grid,
  List,
  ChevronDown,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/sections/ProductGrid';
import { categoriesApi, productsApi, imagesApi } from '@/lib/api';
import type { CategoryResponseData, ProductResponseData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CategoryWithDetails extends CategoryResponseData {
  description?: string;
  image?: string;
  IconComponent?: any;
  color?: string;
  productCount?: number;
}

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  rating?: number;
  reviews?: number;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithDetails[]>([]);
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('grid');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { toast } = useToast();

  // Category icons mapping
  const categoryIcons: Record<string, any> = {
    'Electronics': Laptop,
    'Mobile Phones': Smartphone,
    'Furniture': Sofa,
    'Home Appliances': Home,
    'Fashion': Shirt,
    'Jewelries': Gem,
    'Property': Building,
    'Vehicles': Car,
    'Services': Wrench,
    'Food & Agriculture': Utensils,
    'Babies & Kids': Baby,
    'Beauty & Personal Care': Sparkles,
  };

  // Category colors mapping
  const categoryColors: Record<string, string> = {
    'Electronics': 'from-blue-500 to-cyan-500',
    'Mobile Phones': 'from-purple-500 to-indigo-500',
    'Furniture': 'from-amber-500 to-orange-500',
    'Home Appliances': 'from-green-500 to-emerald-500',
    'Fashion': 'from-pink-500 to-rose-500',
    'Jewelries': 'from-violet-500 to-purple-500',
    'Property': 'from-slate-500 to-gray-500',
    'Vehicles': 'from-red-500 to-pink-500',
    'Services': 'from-teal-500 to-cyan-500',
    'Food & Agriculture': 'from-lime-500 to-green-500',
    'Babies & Kids': 'from-yellow-400 to-amber-400',
    'Beauty & Personal Care': 'from-fuchsia-500 to-pink-500',
  };

  // Category descriptions
  const categoryDescriptions: Record<string, string> = {
    'Electronics': 'Laptops, Computers, Printers etc',
    'Mobile Phones': 'Mobile Phones, Tablets',
    'Furniture': 'Home & Office Furniture',
    'Home Appliances': 'Kitchen & Home Appliances',
    'Fashion': 'Clothing & Accessories',
    'Jewelries': 'Rings, Necklaces & More',
    'Property': 'Houses & Real Estate',
    'Vehicles': 'Cars, Motorcycles & More',
    'Services': 'Professional Services',
    'Food & Agriculture': 'Fresh Food & Farm Products',
    'Babies & Kids': 'Baby Items & Kids Products',
    'Beauty & Personal Care': 'Skincare & Cosmetics',
  };

  // Category images
  const categoryImages: Record<string, string> = {
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center',
    'Mobile Phones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center',
    'Furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center',
    'Home Appliances': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center',
    'Fashion': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center',
    'Jewelries': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center',
    'Property': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop&crop=center',
    'Vehicles': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center',
    'Services': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&crop=center',
    'Food & Agriculture': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center',
    'Babies & Kids': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center',
    'Beauty & Personal Care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAllCategories();
      console.log('Categories API response:', response);

      if (response.success && response.data) {
        console.log('Raw categories data:', response.data);

        // Get only level 1 categories and add display properties
        const topLevelCategories = response.data
          .filter(cat => cat.level === 1)
          .map(cat => ({
            ...cat,
            description: categoryDescriptions[cat.name] || '',
            image: categoryImages[cat.name] || '',
            IconComponent: categoryIcons[cat.name] || Laptop,
            color: categoryColors[cat.name] || 'from-gray-500 to-gray-600',
          }));

        console.log('Filtered top level categories:', topLevelCategories);
        setCategories(topLevelCategories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { limit: 20 };

      if (selectedCategory !== 'all') {
        // Find category slug
        const category = categories.find(c => c.name === selectedCategory);
        if (category) {
          params.category = category.slug;
        }
      }

      if (sortBy === 'price-low') {
        params.sort = 'price_asc';
      } else if (sortBy === 'price-high') {
        params.sort = 'price_desc';
      } else if (sortBy === 'newest') {
        params.sort = 'newest';
      } else if (sortBy === 'rating') {
        params.sort = 'most_viewed';
      }

      const response = await productsApi.getProducts(params);

      if (response.success && response.data) {
        const productsWithDetails = await Promise.all(
          response.data.map(async (product) => {
            let primaryImage: string | undefined;
            try {
              const imagesResponse = await imagesApi.getImages(product.pid);
              if (imagesResponse.success && imagesResponse.data.length > 0) {
                const primaryImg = imagesResponse.data.find(img => img.is_primary);
                primaryImage = primaryImg?.image_url || imagesResponse.data[0]?.image_url;
              }
            } catch (error) {
              console.error('Failed to load images for product:', product.pid);
            }
            return {
              ...product,
              primaryImage,
              rating: 4.5,
              reviews: Math.floor(Math.random() * 200),
            };
          })
        );
        setProducts(productsWithDetails);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 150, damping: 12, duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-4 pt-24">
        <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-gray-900 dark:hover:text-white">HOME</button>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">CATEGORIES</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4 mr-2" />
            Browse All Categories
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Shop by <span className="text-red-600">Category</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our wide range of products organized into categories for easy browsing
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-16"
        >
          {categories.map((category) => {
            const IconComponent = category.IconComponent;
            const isHovered = hoveredCategory === category.id;

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category.name)}
                onHoverStart={() => setHoveredCategory(category.id)}
                onHoverEnd={() => setHoveredCategory(null)}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="relative mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden relative shadow-lg group-hover:shadow-xl transition-all duration-300">
                    {/* Gradient + icon always visible as base layer */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
                    </div>

                    {/* Image on top — hides the icon when it loads */}
                    <img
                      src={category.image}
                      alt={category.name}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />

                    {/* Hover overlay */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 flex items-center justify-center`}
                        >
                          <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <h3 className="text-center font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {category.name}
                </h3>

                <AnimatePresence>
                  {isHovered && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="text-xs text-gray-600 dark:text-gray-300 text-center mt-1 max-w-[100px]"
                    >
                      {category.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Products Section */}
        <div id="products-section" className="pt-8 border-t border-gray-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedCategory === 'all' ? 'All Products' : `${selectedCategory} Products`}
              </h2>
              <p className="text-gray-600 dark:text-slate-400">
                Showing {products.length} products
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="popular">Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          <ProductGrid
            products={products}
            viewMode={viewMode === 'grid' ? '3' : '1'}
            onViewModeChange={() => { }}
            loading={loading}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Categories;

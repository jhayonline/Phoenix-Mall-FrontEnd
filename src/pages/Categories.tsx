import React, { useState } from 'react';
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
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const categories = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    parent_id: null,
    level: 1,
    display_order: 1,
    is_active: true,
    description: "Laptops, Computers, Printers etc",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center",
    IconComponent: Laptop,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Fashion",
    slug: "fashion",
    parent_id: null,
    level: 1,
    display_order: 2,
    is_active: true,
    description: "Clothing & Accessories",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center",
    IconComponent: Shirt,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: 3,
    name: "Vehicles",
    slug: "vehicles",
    parent_id: null,
    level: 1,
    display_order: 3,
    is_active: true,
    description: "Cars, Motorcycles & More",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center",
    IconComponent: Car,
    color: "from-red-500 to-pink-500",
  },
  {
    id: 4,
    name: "Home & Living",
    slug: "home-living",
    parent_id: null,
    level: 1,
    display_order: 4,
    is_active: true,
    description: "Home & Living",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
    IconComponent: Home,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 5,
    name: "Mobile Phones",
    slug: "mobile-phones",
    parent_id: 1, // Electronics
    level: 1,
    display_order: 5,
    is_active: true,
    description: "Mobile Phones, Tablets",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center",
    IconComponent: Smartphone,
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: 6,
    name: "Furniture",
    slug: "furniture",
    parent_id: 1, // Electronics (as per your DB)
    level: 1,
    display_order: 6,
    is_active: true,
    description: "Home & Office Furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center",
    IconComponent: Sofa,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 7,
    name: "Home Appliances",
    slug: "home-appliances",
    parent_id: 2, // Fashion (as per DB)
    level: 1,
    display_order: 7,
    is_active: true,
    description: "Kitchen & Home Appliances",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
    IconComponent: Home,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 8,
    name: "Jewelries",
    slug: "jewelries",
    parent_id: 2, // Fashion
    level: 1,
    display_order: 8,
    is_active: true,
    description: "Rings, Necklaces & More",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
    IconComponent: Gem,
    color: "from-violet-500 to-purple-500",
  },
  {
    id: 9,
    name: "Property",
    slug: "property",
    parent_id: 3, // Vehicles
    level: 1,
    display_order: 9,
    is_active: true,
    description: "Houses & Real Estate",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop&crop=center",
    IconComponent: Building,
    color: "from-slate-500 to-gray-500",
  },
  {
    id: 10,
    name: "Services",
    slug: "services",
    parent_id: 3, // Vehicles
    level: 1,
    display_order: 10,
    is_active: true,
    description: "Professional Services",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&crop=center",
    IconComponent: Wrench,
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: 11,
    name: "Food & Agriculture",
    slug: "food-agriculture",
    parent_id: null,
    level: 1,
    display_order: 11,
    is_active: true,
    description: "Fresh Food & Farm Products",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center",
    IconComponent: Utensils,
    color: "from-lime-500 to-green-500",
  },
  {
    id: 12,
    name: "Babies & Kids",
    slug: "babies-kids",
    parent_id: null,
    level: 1,
    display_order: 12,
    is_active: true,
    description: "Baby Items & Kids Products",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center",
    IconComponent: Baby,
    color: "from-yellow-400 to-amber-400",
  },
  {
    id: 13,
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    parent_id: null,
    level: 1,
    display_order: 13,
    is_active: true,
    description: "Skincare & Cosmetics",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center",
    IconComponent: Sparkles,
    color: "from-fuchsia-500 to-pink-500",
  },
];

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('grid');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName.toLowerCase());
    // Scroll to products section
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
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 12,
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <Header />

      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">

        <div className="container mx-auto px-4 py-4">
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12 py-4 pt-16">
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
              const isImageLoaded = loadedImages.has(category.id);
              const isHovered = hoveredCategory === category.id;

              return (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(category.name)}
                  onHoverStart={() => setHoveredCategory(category.id)}
                  onHoverEnd={() => setHoveredCategory(null)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  {/* Circle Container */}
                  <div className="relative mb-4">
                    {/* Main Circle */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden relative bg-gray-200 dark:bg-slate-700 shadow-lg group-hover:shadow-xl transition-all duration-300">

                      {/* Loading State */}
                      {!isImageLoaded && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20 animate-pulse rounded-full`} />
                      )}

                      {/* Category Image */}
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        onLoad={() => handleImageLoad(category.id)}
                        loading="lazy"
                      />

                      {/* Hover Overlay */}
                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 flex items-center justify-center rounded-full`}
                          >
                            <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Category Name */}
                  <motion.h3
                    className="text-center font-semibold text-sm text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300 mb-1"
                    style={{
                      backgroundImage: isHovered ? `linear-gradient(to right, ${category.color.split(' ')[1].replace('to-', '')}, ${category.color.split(' ')[2]})` : 'none'
                    }}
                  >
                    {category.name}
                  </motion.h3>

                  {/* Product Count */}
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {category.productCount} products
                  </p>

                  {/* Category Description - Show on Hover */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="text-xs text-gray-500 dark:text-slate-400 text-center mt-1 max-w-[100px]"
                      >
                        {category.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <Footer />
      </section>
    </div>
  );
};

export default Categories;

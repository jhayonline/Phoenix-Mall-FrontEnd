import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const categories = [
  {
    id: 1,
    name: "Electronics",
    description: "Laptops, Computers, Printers etc",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center",
    IconComponent: Laptop,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    name: "Fashion",
    description: "Clothing & Accessories",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center",
    IconComponent: Shirt,
    color: "from-pink-500 to-rose-500",
  },
  {
    id: 3,
    name: "Vehicles",
    description: "Cars, Motorcycles & More",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center",
    IconComponent: Car,
    color: "from-red-500 to-pink-500",
  },
  {
    id: 4,
    name: "Home & Living",
    description: "Home & Living",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
    IconComponent: Home,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 5,
    name: "Mobile Phones",
    description: "Mobile Phones, Tablets",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center",
    IconComponent: Smartphone,
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: 6,
    name: "Furniture",
    description: "Home & Office Furniture",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center",
    IconComponent: Sofa,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 7,
    name: "Home Appliances",
    description: "Kitchen & Home Appliances",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
    IconComponent: Home,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 8,
    name: "Jewelries",
    description: "Rings, Necklaces & More",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
    IconComponent: Gem,
    color: "from-violet-500 to-purple-500",
  },
  {
    id: 9,
    name: "Property",
    description: "Houses & Real Estate",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop&crop=center",
    IconComponent: Building,
    color: "from-slate-500 to-gray-500",
  },
  {
    id: 10,
    name: "Services",
    description: "Professional Services",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&crop=center",
    IconComponent: Wrench,
    color: "from-teal-500 to-cyan-500",
  },
  {
    id: 11,
    name: "Food & Agriculture",
    description: "Fresh Food & Farm Products",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center",
    IconComponent: Utensils,
    color: "from-lime-500 to-green-500",
  },
  {
    id: 12,
    name: "Babies & Kids",
    description: "Baby Items & Kids Products",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center",
    IconComponent: Baby,
    color: "from-yellow-400 to-amber-400",
  },
  {
    id: 13,
    name: "Beauty & Personal Care",
    description: "Skincare & Cosmetics",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center",
    IconComponent: Sparkles,
    color: "from-fuchsia-500 to-pink-500",
  },
];


const CategoriesSection: React.FC = () => {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  const handleCategoryClick = (categoryName: string) => {
    // Handle navigation to category section
    console.log(`Navigate to ${categoryName} section`);
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
    <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <Flame className="w-4 h-4 mr-2" />
            What's Popular
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Find exactly what you're looking for in our organized categories
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-8 justify-items-center"
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
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden relative bg-gray-200 dark:bg-slate-700 shadow-lg group-hover:shadow-xl transition-all duration-300">

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
                          <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Floating Ring on Hover */}
                  {/* <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 rounded-full border-4 bg-gradient-to-r ${category.color} opacity-60 blur-sm`}
                        style={{ margin: '-8px' }}
                      />
                    )}
                  </AnimatePresence> */}
                </div>

                {/* Category Name */}
                <motion.h3
                  className="text-center font-semibold text-sm sm:text-base md:text-lg text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300"
                  style={{
                    backgroundImage: isHovered ? `linear-gradient(to right, ${category.color.split(' ')[1].replace('to-', '')}, ${category.color.split(' ')[2]})` : 'none'
                  }}
                >
                  {category.name}
                </motion.h3>

                {/* Category Description - Show on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 max-w-[120px]"
                    >
                      {category.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {categories.length} categories available
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;

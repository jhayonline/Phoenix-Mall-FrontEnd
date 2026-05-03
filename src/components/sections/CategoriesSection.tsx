import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  Gamepad2,
  PawPrint,
  ShoppingBag,
  Tv,
  Headphones,
  Camera,
  Watch,
  Loader2,
} from "lucide-react";
import { categoriesApi } from "@/lib/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  description: string | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string | null;
}

// Map category names to their working shop slugs
const getCategorySlug = (categoryName: string): string => {
  const slugMap: Record<string, string> = {
    "Mobile Devices": "smartphones",
    "Computing & Electronics": "laptops",
    "Fashion & Style": "men", // Will show men's fashion, women's fashion is separate
    "Home & Living": "furniture",
    Mobility: "cars",
    "Real Estate": "real-estate",
    Jewelry: "jewelry",
    "Beauty & Personal Care": "skincare",
    "Baby & Kids": "baby+food+%26+nutrition",
    Services: "home+services",
    "Food & Agriculture": "preserved+food",
    Games: "video+games",
    "Pets & Animals": "dogs",
  };
  return slugMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, "-");
};

// Map category names to icons
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("mobile") || name.includes("smartphone"))
    return <Smartphone className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("computing") || name.includes("laptop") || name.includes("computer"))
    return <Laptop className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("fashion")) return <Shirt className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("home") || name.includes("living"))
    return <Home className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("vehicle") || name.includes("car") || name.includes("mobility"))
    return <Car className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("jewelry")) return <Gem className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("property") || name.includes("real estate"))
    return <Building className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("service")) return <Wrench className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("food") || name.includes("agriculture"))
    return <Utensils className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("baby") || name.includes("kids"))
    return <Baby className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("beauty")) return <Sparkles className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("game")) return <Gamepad2 className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("pet") || name.includes("animal"))
    return <PawPrint className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("furniture")) return <Sofa className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("tv") || name.includes("television"))
    return <Tv className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("headphone")) return <Headphones className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("camera")) return <Camera className="w-8 h-8 md:w-10 md:h-10" />;
  if (name.includes("watch")) return <Watch className="w-8 h-8 md:w-10 md:h-10" />;
  return <ShoppingBag className="w-8 h-8 md:w-10 md:h-10" />;
};

// Map category names to gradient colors
const getCategoryColor = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("mobile")) return "from-purple-500 to-indigo-500";
  if (name.includes("computing") || name.includes("laptop")) return "from-blue-500 to-cyan-500";
  if (name.includes("fashion")) return "from-pink-500 to-rose-500";
  if (name.includes("home") || name.includes("living")) return "from-green-500 to-emerald-500";
  if (name.includes("vehicle") || name.includes("car") || name.includes("mobility"))
    return "from-red-500 to-pink-500";
  if (name.includes("jewelry")) return "from-violet-500 to-purple-500";
  if (name.includes("property") || name.includes("real estate"))
    return "from-slate-500 to-gray-500";
  if (name.includes("service")) return "from-teal-500 to-cyan-500";
  if (name.includes("food") || name.includes("agriculture")) return "from-lime-500 to-green-500";
  if (name.includes("baby") || name.includes("kids")) return "from-yellow-400 to-amber-400";
  if (name.includes("beauty")) return "from-fuchsia-500 to-pink-500";
  if (name.includes("game")) return "from-indigo-500 to-purple-500";
  if (name.includes("pet") || name.includes("animal")) return "from-orange-500 to-red-500";
  if (name.includes("furniture")) return "from-amber-500 to-orange-500";
  if (name.includes("tv")) return "from-rose-500 to-red-500";
  if (name.includes("headphone")) return "from-cyan-500 to-blue-500";
  if (name.includes("camera")) return "from-gray-500 to-slate-500";
  if (name.includes("watch")) return "from-indigo-400 to-purple-400";
  return "from-gray-500 to-gray-600";
};

// Get image for category
const getCategoryImage = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  const images: Record<string, string> = {
    mobility:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center",
    "real estate":
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop&crop=center",
    "mobile devices":
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&crop=center",
    "computing & electronics":
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&crop=center",
    games:
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=400&fit=crop&crop=center",
    "home & living":
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
    "fashion & style":
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center",
    jewelry:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center",
    "beauty & personal care":
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center",
    "baby & kids":
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center",
    services:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&crop=center",
    "food & agriculture":
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop&crop=center",
    "pets & animals":
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop&crop=center",
  };

  for (const [key, url] of Object.entries(images)) {
    if (name.includes(key) || key.includes(name)) {
      return url;
    }
  }
  return "https://placehold.co/400x400/e2e8f0/94a3b8?text=Category";
};

const CategoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesApi.getAllCategories();
      console.log("Categories API response:", response);

      if (response.success && response.data) {
        // Filter to show only top-level categories (level 1) and active ones
        const topLevelCategories = response.data.filter(
          (cat) => cat.level === 1 && cat.is_active === true,
        );
        console.log("Top level categories:", topLevelCategories);
        setCategories(topLevelCategories);
      } else {
        console.error("Failed to load categories:", response);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  const handleCategoryClick = (categoryName: string) => {
    const slug = getCategorySlug(categoryName);
    navigate(`/shop?category=${slug}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 12,
        duration: 0.6,
      },
    },
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto max-w-7xl text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Loading categories...</p>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-gray-500">No categories found.</p>
        </div>
      </section>
    );
  }

  // Split categories into rows: first 5, next 5, remaining
  const firstRow = categories.slice(0, 5);
  const secondRow = categories.slice(5, 10);
  const thirdRow = categories.slice(10, categories.length);

  const renderCategoryCard = (category: Category) => {
    const isImageLoaded = loadedImages.has(category.id);
    const isHovered = hoveredCategory === category.id;
    const icon = getCategoryIcon(category.name);
    const color = getCategoryColor(category.name);
    const image = getCategoryImage(category.name);

    return (
      <motion.div
        key={category.id}
        variants={itemVariants}
        whileHover={{
          scale: 1.05,
          y: -8,
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleCategoryClick(category.name)}
        onHoverStart={() => setHoveredCategory(category.id)}
        onHoverEnd={() => setHoveredCategory(null)}
        className="flex flex-col items-center cursor-pointer group"
      >
        <div className="relative mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden relative bg-gray-200 dark:bg-slate-700 shadow-lg group-hover:shadow-xl transition-all duration-300">
            {!isImageLoaded && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20 animate-pulse rounded-full`}
              />
            )}
            <img
              src={image}
              alt={category.name}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              onLoad={() => handleImageLoad(category.id)}
              loading="lazy"
            />
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute inset-0 bg-gradient-to-br ${color} opacity-80 flex items-center justify-center rounded-full`}
                >
                  {icon}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <motion.h3
          className="text-center font-semibold text-sm sm:text-base md:text-lg text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300"
          style={{
            backgroundImage: isHovered
              ? `linear-gradient(to right, ${color.split(" ")[1].replace("to-", "")}, ${color.split(" ")[2]})`
              : "none",
          }}
        >
          {category.name}
        </motion.h3>
        <AnimatePresence>
          {isHovered && category.description && (
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
            Shop by Category
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Find exactly what you're looking for in our organized categories
          </p>
        </motion.div>

        {/* Categories Grid - 5-5-* Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col items-center gap-8"
        >
          {/* First Row - 5 items */}
          {firstRow.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {firstRow.map(renderCategoryCard)}
            </div>
          )}

          {/* Second Row - 5 items */}
          {secondRow.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {secondRow.map(renderCategoryCard)}
            </div>
          )}

          {/* Third Row - remaining items, centered */}
          {thirdRow.length > 0 && (
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {thirdRow.map(renderCategoryCard)}
            </div>
          )}
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

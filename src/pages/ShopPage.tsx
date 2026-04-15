import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/sections/HeroBanner';
import ProductGrid from '@/components/sections/ProductGrid';
import { productsApi, categoriesApi, imagesApi } from '@/lib/api';
import type { ProductResponseData, CategoryResponseData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  discount?: number;
  seller?: string;
}

const ShopPage = () => {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<CategoryResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('2');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [selectedCategories, priceRange, sortBy, searchQuery, currentPage]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAllCategories();
      if (response.success && response.data) {
        // Get only level 1 categories for filtering
        const topLevelCategories = response.data.filter(cat => cat.level === 1);
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
      // Build query params
      const params: Record<string, any> = {
        page: currentPage,
        limit: 20,
      };

      if (sortBy === 'price-low') {
        params.sort = 'price_asc';
      } else if (sortBy === 'price-high') {
        params.sort = 'price_desc';
      } else if (sortBy === 'newest') {
        params.sort = 'newest';
      } else if (sortBy === 'popular') {
        params.sort = 'most_viewed';
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedCategories.length > 0) {
        // Get category slugs from selected category names
        const selectedCategoryObjects = categories.filter(cat =>
          selectedCategories.includes(cat.name)
        );
        if (selectedCategoryObjects.length > 0) {
          params.category = selectedCategoryObjects[0].slug;
        }
      }

      if (priceRange[0] > 0) {
        params.min_price = priceRange[0];
      }
      if (priceRange[1] < 10000) {
        params.max_price = priceRange[1];
      }

      const response = await productsApi.getProducts(params);
      if (response.success && response.data) {
        // Enhance products with images
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

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const categoryNames = categories.map(cat => cat.name);

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' }
  ];

  if (loading && products.length === 0) {
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
      <div className="relative z-50">
        <Header />
      </div>

      <div className="pt-16">
        <HeroBanner />

        {/* Mobile Search Bar */}
        <div className="lg:hidden sticky top-16 z-40 bg-white border-b border-gray-200 p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Filter/Sort Buttons */}
        <div className="lg:hidden flex items-center justify-between p-3 bg-white border-b border-gray-200">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={() => setShowSort(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-3 sm:px-4 py-4 lg:py-6">
          <div className="flex gap-4 lg:gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Categories
                  </h3>
                  <div className="space-y-2">
                    {categoryNames.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`block w-full text-left text-sm py-1 hover:text-gray-900 transition-colors ${selectedCategories.includes(category) ? 'text-gray-900 font-medium' : 'text-gray-500'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area - Product Grid */}
            <ProductGrid
              products={products}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              loading={loading}
            />
          </div>
        </div>

        {/* Mobile Filter Modal */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setShowFilters(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween' }}
                className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 lg:hidden flex flex-col"
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {categoryNames.map((category) => (
                        <label key={category} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category)}
                            onChange={() => toggleCategory(category)}
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                          />
                          <span className="text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceRange([0, 10000]);
                    }}
                    className="flex-1 py-3 text-gray-600 border border-gray-200 rounded-lg font-medium hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Sort Modal */}
        <AnimatePresence>
          {showSort && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setShowSort(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween' }}
                className="fixed bottom-0 left-0 right-0 bg-white z-50 lg:hidden rounded-t-xl"
              >
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Sort By</h3>
                  <button onClick={() => setShowSort(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSort(false);
                      }}
                      className={`w-full text-left py-3 px-2 rounded-lg transition-colors ${sortBy === option.value ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="h-20 lg:hidden"></div>

        <Footer />
        <MobileBottomNav />
      </div>
    </div>
  );
};

export default ShopPage;

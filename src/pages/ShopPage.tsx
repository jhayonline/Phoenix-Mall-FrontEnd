import React, { useState, useEffect } from 'react';
import {
  X,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  Laptop,
  Smartphone,
  Sofa,
  Home,
  Shirt,
  Gem,
  Building,
  Car,
  Utensils,
  Baby,
  Sparkles,
  Tv,
  Briefcase,
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
import SearchBar from '@/components/SearchBar';
import { useSearchParams } from 'react-router-dom';

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  discount?: number;
  seller?: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface CategoryWithSubs extends CategoryResponseData {
  subcategories?: CategoryResponseData[];
  deeperSubs?: CategoryResponseData[];
  icon?: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
  'Electronics': <Laptop className="w-5 h-5" />,
  'Fashion': <Shirt className="w-5 h-5" />,
  'Vehicles': <Car className="w-5 h-5" />,
  'Home & Living': <Home className="w-5 h-5" />,
  'Mobile Phones': <Smartphone className="w-5 h-5" />,
  'Furniture': <Sofa className="w-5 h-5" />,
  'Home Appliances': <Tv className="w-5 h-5" />,
  'Jewelries': <Gem className="w-5 h-5" />,
  'Property': <Building className="w-5 h-5" />,
  'Services': <Briefcase className="w-5 h-5" />,
  'Food & Agriculture': <Utensils className="w-5 h-5" />,
  'Babies & Kids': <Baby className="w-5 h-5" />,
  'Beauty & Personal Care': <Sparkles className="w-5 h-5" />,
};

const ShopPage = () => {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryResponseData[]>([]);
  const [categoriesWithSubs, setCategoriesWithSubs] = useState<CategoryWithSubs[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('2');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 1,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<CategoryWithSubs | null>(null);
  const [hoveredSubCategory, setHoveredSubCategory] = useState<CategoryResponseData | null>(null);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [selectedCategories, priceRange, sortBy, searchQuery, currentPage]);

  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategories([categoryFromUrl]);
    }
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAllCategories();
      if (response.success && response.data) {
        setAllCategories(response.data);

        // Build hierarchical category structure
        const level1Categories = response.data.filter(cat => cat.level === 1);
        const categoriesWithChildren = level1Categories.map(cat => ({
          ...cat,
          subcategories: response.data.filter(sub => sub.parent_id === cat.id && sub.level === 2),
          icon: iconMap[cat.name],
        }));
        setCategoriesWithSubs(categoriesWithChildren);
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

  // Get deeper subcategories (level 3) for a given subcategory
  const getDeeperSubcategories = (subCategoryId: string) => {
    return allCategories.filter(cat => cat.parent_id === subCategoryId && cat.level === 3);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
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
        const selectedCategory = allCategories.find(cat =>
          cat.name.toLowerCase() === selectedCategories[0].toLowerCase()
        );
        if (selectedCategory) {
          params.category = selectedCategory.slug;
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
        if (response.pagination) {
          setPagination(response.pagination);
        }

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
    setSelectedCategories([categoryName]);
    setCurrentPage(1);
    setSearchParams({ category: categoryName.toLowerCase() });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.total_pages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
          <SearchBar
            placeholder="Search products..."
            onSearch={handleSearch}
            initialValue={searchQuery}
          />
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
          <div className="flex gap-6 lg:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100">
                  <SearchBar
                    placeholder="Search in categories..."
                    onSearch={handleSearch}
                    initialValue={searchQuery}
                    className="w-full"
                  />
                </div>

                {/* Categories Header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-red-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-5 bg-red-500 rounded-full"></span>
                    All Categories
                  </h3>
                </div>

                {/* Categories List */}
                <div className="py-2">
                  {categoriesWithSubs.map((category) => (
                    <div
                      key={category.id}
                      className="relative"
                      onMouseEnter={() => setHoveredCategory(category)}
                      onMouseLeave={() => {
                        setHoveredCategory(null);
                        setHoveredSubCategory(null);
                      }}
                    >
                      <button
                        onClick={() => handleCategoryClick(category.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-all duration-200 group ${selectedCategories.includes(category.name)
                          ? 'bg-red-50 border-r-2 border-red-500'
                          : ''
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`text-gray-400 group-hover:text-red-500 transition-colors ${selectedCategories.includes(category.name) ? 'text-red-500' : ''
                            }`}>
                            {category.icon}
                          </div>
                          <span className={`text-sm font-medium ${selectedCategories.includes(category.name)
                            ? 'text-red-600'
                            : 'text-gray-700 group-hover:text-gray-900'
                            }`}>
                            {category.name}
                          </span>
                        </div>
                        {category.subcategories && category.subcategories.length > 0 && (
                          <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        )}
                      </button>

                      {/* Subcategories Sidebar - Appears on hover */}
                      <AnimatePresence>
                        {hoveredCategory?.id === category.id && category.subcategories && category.subcategories.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-full top-0 ml-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
                          >
                            <div className="py-2">
                              <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                  {category.name}
                                </span>
                              </div>
                              {category.subcategories.map((sub) => {
                                const deeperSubs = getDeeperSubcategories(sub.id);
                                return (
                                  <div
                                    key={sub.id}
                                    className="relative"
                                    onMouseEnter={() => setHoveredSubCategory(sub)}
                                    onMouseLeave={() => setHoveredSubCategory(null)}
                                  >
                                    <button
                                      onClick={() => handleCategoryClick(sub.name)}
                                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors group flex items-center justify-between"
                                    >
                                      <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                        {sub.name}
                                      </span>
                                      {deeperSubs.length > 0 && (
                                        <ChevronRightIcon className="w-3 h-3 text-gray-300" />
                                      )}
                                    </button>

                                    {/* Level 3 Subcategories (iPhone, Samsung, etc.) */}
                                    <AnimatePresence>
                                      {hoveredSubCategory?.id === sub.id && deeperSubs.length > 0 && (
                                        <motion.div
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -10 }}
                                          transition={{ duration: 0.2 }}
                                          className="absolute left-full top-0 ml-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
                                        >
                                          <div className="py-2">
                                            <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {sub.name}
                                              </span>
                                            </div>
                                            {deeperSubs.map((deepSub) => (
                                              <button
                                                key={deepSub.id}
                                                onClick={() => handleCategoryClick(deepSub.name)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors group flex items-center justify-between"
                                              >
                                                <span className="text-sm text-gray-600 group-hover:text-gray-900">
                                                  {deepSub.name}
                                                </span>
                                              </button>
                                            ))}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Price Range Section */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area - Product Grid */}
            <div className="flex-1">
              <ProductGrid
                products={products}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                loading={loading}
              />

              {/* Pagination Controls */}
              {pagination.total_pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      const endPage = Math.min(pagination.total_pages, startPage + maxVisible - 1);

                      if (endPage - startPage + 1 < maxVisible) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }

                      return pages.map(page => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                            ? 'bg-red-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      ));
                    })()}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === pagination.total_pages}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Results info */}
              {pagination.total > 0 && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  Showing {((currentPage - 1) * pagination.per_page) + 1} to{' '}
                  {Math.min(currentPage * pagination.per_page, pagination.total)} of{' '}
                  {pagination.total.toLocaleString()} products
                </div>
              )}
            </div>
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
                  <h3 className="font-semibold text-lg">Categories</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <SearchBar
                    placeholder="Search products..."
                    onSearch={handleSearch}
                    initialValue={searchQuery}
                    className="mb-4"
                  />
                  {categoriesWithSubs.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => {
                          handleCategoryClick(category.name);
                          setShowFilters(false);
                        }}
                        className={`w-full text-left py-2 flex items-center justify-between ${selectedCategories.includes(category.name) ? 'text-red-600 font-medium' : 'text-gray-700'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <span>{category.name}</span>
                        </div>
                      </button>
                      {category.subcategories && (
                        <div className="ml-6 mt-1 space-y-1">
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                handleCategoryClick(sub.name);
                                setShowFilters(false);
                              }}
                              className="block w-full text-left py-1.5 text-sm text-gray-500 hover:text-gray-700"
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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
                      className={`w-full text-left py-3 px-2 rounded-lg transition-colors ${sortBy === option.value ? 'bg-red-50 text-red-600 font-medium' : 'hover:bg-gray-50'
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

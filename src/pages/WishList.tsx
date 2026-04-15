import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Trash2,
  Share2,
  Search,
  Filter,
  Clock,
  Eye,
  ShoppingCart,
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { favoritesApi, imagesApi } from '@/lib/api';
import type { ProductResponseData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

type FilterType = 'all' | 'viewed' | 'not-viewed';
type SortType = 'date' | 'price' | 'name';

interface WishlistItemWithDetails extends ProductResponseData {
  viewed: boolean;
  addedDate: Date;
  primaryImage?: string;
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showSortOptions, setShowSortOptions] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load favorites from backend
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await favoritesApi.list();
      if (response.success && response.data) {
        // Enhance products with additional data
        const itemsWithDetails = await Promise.all(
          response.data.map(async (product) => {
            // Get product images
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
              viewed: false, // Track if user has clicked on product
              addedDate: new Date(), // Backend should provide this
              primaryImage,
            };
          })
        );
        setWishlistItems(itemsWithDetails);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  // Remove item from wishlist
  const removeFromWishlist = async (pid: string) => {
    try {
      await favoritesApi.remove(pid);
      setWishlistItems(prev => prev.filter(item => item.pid !== pid));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(pid);
        return newSet;
      });
      toast({
        title: "Removed",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  // Remove all selected items
  const removeSelected = async () => {
    const selectedPids = Array.from(selectedItems);
    for (const pid of selectedPids) {
      try {
        await favoritesApi.remove(pid);
      } catch (error) {
        console.error('Failed to remove:', pid);
      }
    }
    setWishlistItems(prev => prev.filter(item => !selectedItems.has(item.pid)));
    setSelectedItems(new Set());
    toast({
      title: "Removed",
      description: `${selectedPids.length} items removed from wishlist`,
    });
  };

  // Mark item as viewed (when clicked)
  const markAsViewed = (pid: string) => {
    setWishlistItems(prev =>
      prev.map(item =>
        item.pid === pid ? { ...item, viewed: true } : item
      )
    );
  };

  // Toggle item selection
  const toggleSelection = (pid: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pid)) {
        newSet.delete(pid);
      } else {
        newSet.add(pid);
      }
      return newSet;
    });
  };

  // Select all items
  const selectAll = () => {
    setSelectedItems(new Set(filteredItems.map(item => item.pid)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  // Filter items based on current filter
  const filteredItems = wishlistItems.filter(item => {
    const matchesFilter = filter === 'all' ||
      (filter === 'viewed' && item.viewed) ||
      (filter === 'not-viewed' && !item.viewed);

    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.condition?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Sort items based on current sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'date') {
      return b.addedDate.getTime() - a.addedDate.getTime();
    } else if (sortBy === 'price') {
      return b.price - a.price;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  // Format currency (GHS)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

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

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl shadow-lg">
                <Heart className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading">My Wishlist</h1>
                <p className="text-gray-600">
                  {wishlistItems.length} items
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedItems.size > 0 ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={removeSelected}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium transition-colors hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove ({selectedItems.size})</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearSelection}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-200"
                  >
                    Cancel
                  </motion.button>
                </>
              ) : (
                <>
                  {wishlistItems.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={selectAll}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-200"
                    >
                      Select all
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors hover:bg-gray-200"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-4 shadow-soft flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <Heart className="w-6 h-6 text-blue-600" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-bold">{wishlistItems.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-soft flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Not Viewed</p>
              <p className="text-xl font-bold">{wishlistItems.filter(item => !item.viewed).length}</p>
            </div>
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-soft mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search wishlist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex space-x-2">
                {[
                  { value: 'all' as const, label: 'All' },
                  { value: 'viewed' as const, label: 'Viewed' },
                  { value: 'not-viewed' as const, label: 'Not Viewed' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === option.value
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>
                  {sortBy === 'date' && 'Recently Added'}
                  {sortBy === 'price' && 'Price: High to Low'}
                  {sortBy === 'name' && 'Name: A to Z'}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${showSortOptions ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {showSortOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 overflow-hidden"
                  >
                    {[
                      { value: 'date' as const, label: 'Recently Added' },
                      { value: 'price' as const, label: 'Price: High to Low' },
                      { value: 'name' as const, label: 'Name: A to Z' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortOptions(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === option.value
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50 text-gray-700'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {sortedItems.length > 0 ? (
              sortedItems.map((item, index) => (
                <motion.div
                  key={item.pid}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                    delay: index * 0.05
                  }}
                  className="bg-white rounded-xl shadow-soft overflow-hidden group relative"
                  onClick={() => markAsViewed(item.pid)}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.pid)}
                        onChange={() => toggleSelection(item.pid)}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${selectedItems.has(item.pid)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300 group-hover:border-blue-400'
                          }`}
                      >
                        {selectedItems.has(item.pid) && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </motion.div>
                    </label>
                  </div>

                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={item.primaryImage || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'}
                      alt={item.title}
                      className="w-full h-48 object-cover transition-transform duration-300"
                    />

                    {/* Status Badges */}
                    <div className="absolute top-3 right-3 space-y-2">
                      {item.status !== 'active' && (
                        <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
                          {item.status === 'sold' ? 'Sold' : 'Inactive'}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(item.pid);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-blue-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                    </div>

                    <p className="text-sm text-gray-500 mb-3">{item.condition || 'N/A'}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{formatCurrency(item.price)}</span>
                      </div>

                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{formatDate(item.addedDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* View Status Indicator */}
                  {!item.viewed && (
                    <div className="absolute top-12 left-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        New
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  {searchQuery
                    ? `No items found for "${searchQuery}"`
                    : 'Save your favorite items here to easily find them later.'}
                </p>
                <Button className="hero-button" onClick={() => window.location.href = '/shop'}>
                  Start Shopping
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Wishlist;

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Star, Grid, List } from "lucide-react";
import { Link } from "react-router-dom";
import { favoritesApi } from "@/lib/api";
import type { ProductResponseData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  discount?: number;
  seller?: string;
}

interface ProductGridProps {
  products: ProductWithDetails[];
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, viewMode, onViewModeChange, loading }) => {
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  // Define checkFavorites with useCallback
  const checkFavorites = useCallback(async () => {
    try {
      const checks = await Promise.all(
        products.map(async (product) => {
          try {
            const response = await favoritesApi.check(product.pid);
            return { pid: product.pid, favorited: response.data.favorited };
          } catch {
            return { pid: product.pid, favorited: false };
          }
        })
      );
      const favoritedSet = new Set(checks.filter(c => c.favorited).map(c => c.pid));
      setLikedProducts(favoritedSet);
    } catch (error) {
      console.error('Failed to check favorites:', error);
    }
  }, [products]);

  // Check favorites on load
  useEffect(() => {
    if (user && products.length > 0) {
      checkFavorites();
    }
  }, [user, products, checkFavorites]);

  const toggleLike = async (pid: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      if (likedProducts.has(pid)) {
        await favoritesApi.remove(pid);
        setLikedProducts(prev => {
          const newSet = new Set(prev);
          newSet.delete(pid);
          return newSet;
        });
        toast({
          title: "Removed",
          description: "Item removed from wishlist",
        });
        window.dispatchEvent(new Event('wishlistUpdated'));
      } else {
        await favoritesApi.add(pid);
        setLikedProducts(prev => new Set([...prev, pid]));
        toast({
          title: "Added",
          description: "Item added to wishlist",
        });
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const renderStars = (rating: number = 0) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < fullStars
              ? "text-yellow-400 fill-yellow-400"
              : i === fullStars && hasHalfStar
                ? "text-yellow-400 fill-yellow-400 opacity-50"
                : "text-gray-300"
              }`}
          />
        ))}
        {rating > 0 && (
          <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
        )}
      </div>
    );
  };


  const getGridCols = () => {
    switch (viewMode) {
      case '1': return 'grid-cols-1';
      case '2': return 'grid-cols-2 lg:grid-cols-3';
      case '3': return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      case '4': return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
      default: return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
    }
  };

  if (loading) {
    return (
      <div className="flex-1">
        <div className={`grid gap-3 sm:gap-4 ${getGridCols()}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-soft animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Desktop Top Bar */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Showing {products.length} products
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            {['1', '2', '3', '4'].map((view) => (
              <button
                key={view}
                onClick={() => onViewModeChange(view)}
                className={`p-2 rounded transition-colors ${viewMode === view ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {view === '1' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={`grid gap-3 sm:gap-4 ${getGridCols()}`}>
        {products.map((product) => (
          <motion.div
            key={product.pid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`group relative bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 ${viewMode === '1' ? 'flex gap-4 p-3' : 'overflow-hidden'
              }`}
          >
            <Link to={`/product/${product.pid}`} className="block w-full">
              {/* Product Image */}
              <div className={`relative ${viewMode === '1' ? 'w-24 h-24 flex-shrink-0' : 'aspect-square'
                } overflow-hidden ${viewMode !== '1' ? 'rounded-t-lg' : 'rounded-lg'}`}>
                <img
                  src={product.primaryImage || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Wishlist Button */}
                <button
                  onClick={(e) => toggleLike(product.pid, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all ${likedProducts.has(product.pid) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
                    } ${viewMode === '1' ? 'scale-75' : ''}`}
                >
                  <Heart className={`w-3 h-3 ${likedProducts.has(product.pid) ? 'fill-current' : ''}`} />
                </button>

                {/* Status Badge */}
                {product.status?.toLowerCase() !== 'active' && (
                  <span className={`absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded ${viewMode === '1' ? 'text-xs px-1.5 py-0.5' : ''
                    }`}>
                    {product.status === 'sold' ? 'SOLD' : 'INACTIVE'}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className={`${viewMode === '1' ? 'flex-1' : 'p-3'}`}>
                <div className="flex items-start justify-between mb-1">
                  <h3 className={`font-medium text-gray-900 line-clamp-2 ${viewMode === '1' ? 'text-sm' : 'text-sm sm:text-base'
                    }`}>
                    {product.title}
                  </h3>
                </div>

                {product.condition && (
                  <p className={`text-gray-500 mb-2 ${viewMode === '1' ? 'text-xs' : 'text-xs sm:text-sm'
                    }`}>
                    {product.condition}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-2">
                  {renderStars(product.rating || 0)}
                  {product.reviews && product.reviews > 0 && (
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  )}
                </div>

                {product.location && (
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{product.location}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-gray-900 ${viewMode === '1' ? 'text-sm' : 'text-base'
                      }`}>
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;

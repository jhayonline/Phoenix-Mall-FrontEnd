import React, { useState, useEffect, useCallback } from "react";
import { Heart, MapPin, Star, Grid, List, TrendingDown, Eye, Clock } from "lucide-react";
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
  recommended_price?: number;
}

interface ProductGridProps {
  products: ProductWithDetails[];
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  loading?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  viewMode,
  onViewModeChange,
  loading,
}) => {
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

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
        }),
      );
      const favoritedSet = new Set(checks.filter((c) => c.favorited).map((c) => c.pid));
      setLikedProducts(favoritedSet);
    } catch (error) {
      console.error("Failed to check favorites:", error);
    }
  }, [products]);

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
        setLikedProducts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(pid);
          return newSet;
        });
        toast({
          title: "Removed",
          description: "Item removed from wishlist",
        });
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        await favoritesApi.add(pid);
        setLikedProducts((prev) => new Set([...prev, pid]));
        toast({
          title: "Added",
          description: "Item added to wishlist",
        });
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
            className={`w-3 h-3 ${
              i < fullStars
                ? "text-yellow-400 fill-yellow-400"
                : i === fullStars && hasHalfStar
                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                  : "text-gray-300"
            }`}
          />
        ))}
        {rating > 0 && <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getGridCols = () => {
    switch (viewMode) {
      case "1":
        return "grid-cols-1";
      case "2":
        return "grid-cols-2 lg:grid-cols-3";
      case "3":
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
      case "4":
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
      default:
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
    }
  };

  // Render list view (viewMode === "1")
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <Link
            key={product.pid}
            to={`/product/${product.pid}`}
            className="block bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              {/* Product Image - Fixed size */}
              <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg overflow-hidden relative">
                <img
                  src={
                    product.primaryImage ||
                    "https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image"
                  }
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Status Badge */}
                {product.status?.toLowerCase() !== "active" && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                    {product.status === "sold" ? "SOLD" : "INACTIVE"}
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <h3 className="font-medium text-gray-900 text-base line-clamp-1 mb-1">
                  {product.title}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-red-600 text-xl">
                    {formatCurrency(product.price)}
                  </span>
                  {product.recommended_price && product.recommended_price < product.price && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(product.recommended_price)}
                      </span>
                      <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                        Price High
                      </span>
                    </>
                  )}
                </div>

                {/* Condition */}
                {product.condition && (
                  <p className="text-sm text-gray-500 mb-1">{product.condition}</p>
                )}

                {/* Location & Date */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-2">
                  {product.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {product.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(product.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {product.views_count} views
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  {renderStars(product.rating || 0)}
                  {product.reviews && product.reviews > 0 && (
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  )}
                </div>
              </div>

              {/* Wishlist Button - Right side */}
              <div className="flex-shrink-0">
                <button
                  onClick={(e) => toggleLike(product.pid, e)}
                  className={`p-2 rounded-full transition-colors ${
                    likedProducts.has(product.pid)
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${likedProducts.has(product.pid) ? "fill-current" : ""}`}
                  />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  // Render grid view
  const renderGridView = () => {
    return (
      <div className={`grid gap-3 sm:gap-4 ${getGridCols()}`}>
        {products.map((product) => (
          <div
            key={product.pid}
            className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 overflow-hidden"
          >
            <Link to={`/product/${product.pid}`} className="block w-full">
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={
                    product.primaryImage ||
                    "https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image"
                  }
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />

                {/* Wishlist Button */}
                <button
                  onClick={(e) => toggleLike(product.pid, e)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-colors ${
                    likedProducts.has(product.pid)
                      ? "bg-red-500 text-white"
                      : "bg-white/80 text-gray-600 hover:bg-white"
                  }`}
                >
                  <Heart
                    className={`w-3 h-3 ${likedProducts.has(product.pid) ? "fill-current" : ""}`}
                  />
                </button>

                {/* Status Badge */}
                {product.status?.toLowerCase() !== "active" && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
                    {product.status === "sold" ? "SOLD" : "INACTIVE"}
                  </span>
                )}

                {/* Price Recommendation Badge */}
                {product.recommended_price && product.recommended_price < product.price && (
                  <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded flex items-center gap-0.5">
                    <TrendingDown className="w-2.5 h-2.5" />
                    Price High
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                  {product.title}
                </h3>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-red-600 text-base">
                    {formatCurrency(product.price)}
                  </span>
                  {product.recommended_price && product.recommended_price < product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatCurrency(product.recommended_price)}
                    </span>
                  )}
                </div>

                {product.condition && (
                  <p className="text-xs text-gray-500 mb-1">{product.condition}</p>
                )}

                <div className="flex items-center gap-2 mb-1">
                  {renderStars(product.rating || 0)}
                </div>

                {product.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500 truncate">{product.location}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1">
        {viewMode === "1" ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-3 sm:gap-4 ${getGridCols()}`}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-soft animate-pulse"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}
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
        <p className="text-sm text-gray-500">Showing {products.length} products</p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            {["1", "2", "3", "4"].map((view) => (
              <button
                key={view}
                onClick={() => onViewModeChange(view)}
                className={`p-2 rounded transition-colors ${
                  viewMode === view
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {view === "1" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* View Mode Renderer */}
      {viewMode === "1" ? renderListView() : renderGridView()}
    </div>
  );
};

export default ProductGrid;

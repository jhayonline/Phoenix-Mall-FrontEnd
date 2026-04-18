import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { wishlistApi, imagesApi, favoritesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { ProductResponseData } from '@/lib/api';

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  rating?: number;
  reviews?: number;
}

const WishlistPage = () => {
  const [wishlistProducts, setWishlistProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const response = await wishlistApi.getWishlist();
      if (response.success && response.data) {
        const productsWithImages = await Promise.all(
          response.data.map(async (item: any) => {
            let primaryImage = item.image_url;

            // If no image_url in the response, fetch from API
            if (!primaryImage) {
              try {
                const imagesResponse = await imagesApi.getImages(item.product_pid);
                if (imagesResponse.success && imagesResponse.data.length > 0) {
                  const primaryImg = imagesResponse.data.find(img => img.is_primary);
                  primaryImage = primaryImg?.image_url || imagesResponse.data[0]?.image_url;
                }
              } catch (error) {
                console.error('Failed to load image:', item.product_pid);
              }
            }

            // Format image URL correctly
            if (primaryImage && !primaryImage.startsWith('http')) {
              const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5150/api';
              const API_BASE_URL_WITHOUT_API = API_BASE_URL.replace('/api', '');
              primaryImage = `${API_BASE_URL_WITHOUT_API}${primaryImage}`;
            }

            return {
              id: item.product_id || item.id,
              pid: item.product_pid,
              title: item.title,
              price: item.price,
              condition: item.condition || null,
              location: item.location || null,
              category_id: null,
              status: 'active',
              whatsapp_contact: true,
              phone_contact: true,
              views_count: 0,
              description: null,
              seller_id: 0,
              created_at: null,
              updated_at: null,
              primaryImage: primaryImage || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image',
              rating: item.average_rating || 4.5,
              reviews: item.total_reviews || 0,
            };
          })
        );
        setWishlistProducts(productsWithImages);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderStars = (ratingValue: number, count?: number) => {
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
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
        </div>
        {ratingValue > 0 && (
          <>
            <span className="text-xs font-medium text-gray-700 ml-1">
              {ratingValue.toFixed(1)}
            </span>
            {count && count > 0 && (
              <span className="text-xs text-gray-500">
                ({formatNumber(count)} reviews)
              </span>
            )}
          </>
        )}
      </div>
    );
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

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
            <p className="text-gray-500 mb-6">Save your favorite items here</p>
            <Link to="/shop">
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                Start Shopping
              </button>
            </Link>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold">My Wishlist</h1>
        </div>
        <p className="text-gray-500 mb-8">{wishlistProducts.length} items saved</p>

        {/* Custom Wishlist Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {wishlistProducts.map((product) => (
            <motion.div
              key={product.pid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <Link to={`/product/${product.pid}`} className="block">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.primaryImage || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 line-clamp-2 text-sm sm:text-base mb-1">
                    {product.title}
                  </h3>

                  {product.condition && (
                    <p className="text-gray-500 text-xs mb-1">
                      {product.condition}
                    </p>
                  )}

                  <div className="flex items-center gap-1 mb-1">
                    {renderStars(product.rating || 0, product.reviews)}
                  </div>

                  {product.location && (
                    <div className="flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{product.location}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-gray-900 text-base">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default WishlistPage;

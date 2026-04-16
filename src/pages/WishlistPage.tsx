import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductGrid from '@/components/sections/ProductGrid';
import { wishlistApi, imagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { ProductResponseData } from '@/lib/api';

interface WishlistItem {
  product_id: string;
  product_pid: string;
  title: string;
  price: number;
  image_url?: string;
  condition?: string | null;
  location?: string | null;
}

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  rating?: number;
  reviews?: number;
}

const WishlistPage = () => {
  const [wishlistProducts, setWishlistProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('3');
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
          response.data.map(async (item: WishlistItem) => {
            let image_url = item.image_url;
            if (!image_url) {
              try {
                const imagesResponse = await imagesApi.getImages(item.product_pid);
                if (imagesResponse.success && imagesResponse.data.length > 0) {
                  const primaryImg = imagesResponse.data.find(img => img.is_primary);
                  image_url = primaryImg?.image_url || imagesResponse.data[0]?.image_url;
                }
              } catch (error) {
                console.error('Failed to load image:', item.product_pid);
              }
            }

            const productWithDetails: ProductWithDetails = {
              id: item.product_id,
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
              primaryImage: image_url,
              rating: 4.5,
              reviews: Math.floor(Math.random() * 200),
            };
            return productWithDetails;
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
              <button className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
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

        <ProductGrid
          products={wishlistProducts}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          loading={loading}
        />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default WishlistPage;

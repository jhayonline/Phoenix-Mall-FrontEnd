import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Eye,
  Heart,
  TrendingUp,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { profileApi, productsApi, imagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { ProductResponseData } from '@/lib/api';

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  favorite_count?: number;
}

const SellerDashboard: React.FC = () => {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
    total_views: 0,
    total_favorites: 0,
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSellerProducts();
      loadStats();
    }
  }, [user]);

  const loadSellerProducts = async () => {
    setLoading(true);
    try {
      const response = await profileApi.getSellerProducts();
      if (response.success && response.data) {
        const productsWithImages = await Promise.all(
          response.data.map(async (item: any) => {
            const product = item.product;
            let primaryImage: string | undefined;

            try {
              const imagesResponse = await imagesApi.getImages(product.pid);
              if (imagesResponse.success && imagesResponse.data.length > 0) {
                const primaryImg = imagesResponse.data.find(img => img.is_primary);
                primaryImage = primaryImg?.image_url || imagesResponse.data[0]?.image_url;
              }
            } catch (error) {
              console.error('Failed to load image:', product.pid);
            }

            return {
              ...product,
              primaryImage,
              favorite_count: item.favorite_count,
            };
          })
        );
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error('Failed to load seller products:', error);
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await profileApi.getStats();
      if (response.success && response.data) {
        setStats({
          total: response.data.total_listings,
          active: response.data.active_listings,
          sold: response.data.sold_listings,
          total_views: response.data.total_views,
          total_favorites: response.data.total_favorites,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleDelete = async (pid: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeletingId(pid);
    try {
      await productsApi.deleteProduct(pid);
      setProducts(prev => prev.filter(p => p.pid !== pid));
      toast({
        title: "Deleted",
        description: "Product has been deleted successfully",
      });
      loadStats();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAsSold = async (pid: string) => {
    setUpdatingStatus(pid);
    try {
      await productsApi.markAsSold(pid);
      setProducts(prev =>
        prev.map(p =>
          p.pid === pid ? { ...p, status: 'sold' } : p
        )
      );
      toast({
        title: "Updated",
        description: "Product marked as sold",
      });
      loadStats();
    } catch (error) {
      console.error('Failed to mark as sold:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleEdit = (pid: string) => {
    navigate(`/edit-product/${pid}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>;
      case 'sold':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Sold</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">{status}</span>;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your products and track performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sold</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sold}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_views}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Products</h2>
          <Button
            onClick={() => navigate('/sell')}
            className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Button>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-4">Start selling by adding your first product</p>
            <Button onClick={() => navigate('/sell')} className="bg-gray-900 hover:bg-gray-800">
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.pid}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-xl shadow-soft overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    {/* Product Image */}
                    <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.primaryImage || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {product.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {getStatusBadge(product.status)}
                            <span className="text-sm text-gray-500">{product.condition}</span>
                            {product.location && (
                              <span className="text-sm text-gray-500">{product.location}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-xl">{formatCurrency(product.price)}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {product.views_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {product.favorite_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {product.description || 'No description'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => handleEdit(product.pid)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>

                        {product.status === 'active' && (
                          <button
                            onClick={() => handleMarkAsSold(product.pid)}
                            disabled={updatingStatus === product.pid}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {updatingStatus === product.pid ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Mark as Sold
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(product.pid)}
                          disabled={deletingId === product.pid}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deletingId === product.pid ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default SellerDashboard;

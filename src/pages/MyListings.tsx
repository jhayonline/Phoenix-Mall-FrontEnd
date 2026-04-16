import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Eye,
  Heart,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  Plus,
  MapPin,
  Clock
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

const MyListings: React.FC = () => {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadListings();
    }
  }, [user]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const response = await profileApi.getListings();
      if (response.success && response.data) {
        const productsWithImages = await Promise.all(
          response.data.map(async (product: ProductResponseData) => {
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
            };
          })
        );
        setProducts(productsWithImages);
      }
    } catch (error) {
      console.error('Failed to load listings:', error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pid: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setDeletingId(pid);
    try {
      await productsApi.deleteProduct(pid);
      setProducts(prev => prev.filter(p => p.pid !== pid));
      toast({
        title: "Deleted",
        description: "Listing has been deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
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
        description: "Listing marked as sold",
      });
    } catch (error) {
      console.error('Failed to mark as sold:', error);
      toast({
        title: "Error",
        description: "Failed to update listing",
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">Manage all your product listings</p>
          </div>
          <Button
            onClick={() => navigate('/sell')}
            className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Listing
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-soft text-center">
            <Package className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            <p className="text-sm text-gray-500">Total Listings</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-soft text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-soft text-center">
            <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {products.reduce((sum, p) => sum + p.views_count, 0)}
            </p>
            <p className="text-sm text-gray-500">Total Views</p>
          </div>
        </div>

        {/* Listings Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-4">Start selling by adding your first product</p>
            <Button onClick={() => navigate('/sell')} className="bg-gray-900 hover:bg-gray-800">
              Create Your First Listing
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product.pid}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl shadow-soft overflow-hidden group hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.primaryImage || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(product.status)}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                      {product.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900">{formatCurrency(product.price)}</span>
                      {product.condition && (
                        <span className="text-xs text-gray-500">{product.condition}</span>
                      )}
                    </div>

                    {product.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{product.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {product.views_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(product.created_at)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(product.pid)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>

                      {product.status === 'active' && (
                        <button
                          onClick={() => handleMarkAsSold(product.pid)}
                          disabled={updatingStatus === product.pid}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          {updatingStatus === product.pid ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Sold
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(product.pid)}
                        disabled={deletingId === product.pid}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
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

export default MyListings;

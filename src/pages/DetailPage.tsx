import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MessageCircle,
  Phone,
  Shield,
  Share2,
  Check
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductGrid from '@/components/sections/ProductGrid';
import { productsApi, imagesApi, favoritesApi } from '@/lib/api';
import type { ProductResponseData, ProductImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  allImages?: ProductImage[];
  seller?: {
    name: string;
    phone?: string;
  };
}

const DetailPage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithDetails[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsApi.getProduct(pid!);
      if (response.success && response.data) {
        const productData = response.data;

        let primaryImage: string | undefined;
        let allImages: ProductImage[] | undefined;
        try {
          const imagesResponse = await imagesApi.getImages(pid!);
          if (imagesResponse.success && imagesResponse.data.length > 0) {
            allImages = imagesResponse.data;
            const primaryImg = allImages.find(img => img.is_primary);
            primaryImage = primaryImg?.image_url || allImages[0]?.image_url;
          }
        } catch (error) {
          console.error('Failed to load images:', error);
        }

        const sellerInfo = {
          name: `Seller ${productData.seller_id}`,
          phone: '+233 XX XXX XXXX',
        };

        setProduct({
          ...productData,
          primaryImage,
          allImages,
          seller: sellerInfo,
        });

        if (productData.category_id) {
          loadRelatedProducts(productData.category_id);
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pid, toast]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !product) return;
    try {
      const response = await favoritesApi.check(product.pid);
      setIsLiked(response.data.favorited);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  }, [user, product]);

  const loadRelatedProducts = useCallback(async (categoryId: string) => {
    try {
      const response = await productsApi.getProducts({
        category: categoryId,
        limit: 6
      });
      if (response.success && response.data) {
        const filtered = response.data.filter(p => p.pid !== pid);

        // Fetch images for each related product
        const productsWithImages = await Promise.all(
          filtered.slice(0, 6).map(async (product) => {
            let primaryImage: string | undefined;
            try {
              const imagesResponse = await imagesApi.getImages(product.pid);
              if (imagesResponse.success && imagesResponse.data.length > 0) {
                const primaryImg = imagesResponse.data.find(img => img.is_primary);
                primaryImage = primaryImg?.image_url || imagesResponse.data[0]?.image_url;
              }
            } catch (error) {
              console.error('Failed to load images for related product:', product.pid);
            }
            return {
              ...product,
              primaryImage,
              rating: 4.5,
              reviews: 0,
            };
          })
        );

        setRelatedProducts(productsWithImages);
      }
    } catch (error) {
      console.error('Failed to load related products:', error);
    }
  }, [pid]);

  useEffect(() => {
    if (pid) {
      loadProduct();
    }
  }, [pid, loadProduct]);

  useEffect(() => {
    if (product && user) {
      checkFavoriteStatus();
    }
  }, [product, user, checkFavoriteStatus]);

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!product) return;

    try {
      if (isLiked) {
        await favoritesApi.remove(product.pid);
        setIsLiked(false);
        toast({
          title: "Removed",
          description: "Item removed from wishlist",
        });
        window.dispatchEvent(new Event('wishlistUpdated'));
      } else {
        await favoritesApi.add(product.pid);
        setIsLiked(true);
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

  const copyPhoneNumber = () => {
    if (product?.seller?.phone) {
      navigator.clipboard.writeText(product.seller.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Phone number copied to clipboard",
      });
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const nextImage = () => {
    if (product?.allImages) {
      setSelectedImageIndex((prev) => (prev + 1) % product.allImages!.length);
    }
  };

  const prevImage = () => {
    if (product?.allImages) {
      setSelectedImageIndex((prev) => (prev - 1 + product.allImages!.length) % product.allImages!.length);
    }
  };

  const handleImageHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomEnabled) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
    setShowZoom(true);
  };

  const handleImageLeave = () => {
    setShowZoom(false);
  };

  const toggleZoom = () => {
    setZoomEnabled(!zoomEnabled);
    setShowZoom(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const renderStars = (rating: number = 4.5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating)
          ? "text-yellow-400 fill-yellow-400"
          : "text-gray-300"
          }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const imageList = product.allImages?.map(img => img.image_url) || [product.primaryImage || ''];
  const hasImages = imageList.length > 0 && imageList[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-4 pt-24">
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="relative">
            <div className="sticky top-24">
              <div
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4 cursor-zoom-in"
                onMouseMove={handleImageHover}
                onMouseLeave={handleImageLeave}
              >
                <img
                  src={hasImages ? imageList[selectedImageIndex] : 'https://placehold.co/800x800/e2e8f0/94a3b8?text=No+Image'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />

                {showZoom && zoomEnabled && hasImages && (
                  <div
                    className="absolute inset-0 bg-cover bg-no-repeat"
                    style={{
                      backgroundImage: `url(${imageList[selectedImageIndex]})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: '200%',
                      transform: 'scale(1.5)'
                    }}
                  />
                )}

                <button
                  onClick={toggleZoom}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  {zoomEnabled ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </button>

                {hasImages && imageList.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {product.status !== 'active' && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    {product.status === 'sold' ? 'SOLD' : 'INACTIVE'}
                  </span>
                )}
              </div>

              {hasImages && imageList.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {imageList.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageClick(index)}
                      className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${selectedImageIndex === index
                        ? 'border-gray-900 ring-2 ring-gray-300'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      <img src={image} alt={`${product.title} view ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
              {product.condition && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">{product.condition}</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">{renderStars(4.5)}</div>
              <span className="text-sm text-gray-600">(Coming soon)</span>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{product.description || 'No description available.'}</p>

            {product.location && (
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-5 h-5" />
                <span>{product.location}</span>
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <button
                onClick={toggleFavorite}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isLiked
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Saved to Wishlist' : 'Add to Wishlist'}
              </button>
              <button className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Seller</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(`https://wa.me/${product.seller?.phone}`, '_blank')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={copyPhoneNumber}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {copied ? <Check className="w-4 h-4" /> : 'Call'}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Safety Tips from Phoenix
              </h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• Avoid paying in advance, even for delivery</li>
                <li>• Meet with the seller at a safe public place</li>
                <li>• Inspect the item and ensure it's exactly what you want</li>
                <li>• Make sure that the packed item is the one you've inspected</li>
                <li>• Only pay if you're satisfied</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <ProductGrid
              products={relatedProducts}
              viewMode="3"
              onViewModeChange={() => { }}
              loading={false}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DetailPage;

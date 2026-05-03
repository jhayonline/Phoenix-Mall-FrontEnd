import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MessageCircle,
  Shield,
  Share2,
  Check,
  Eye,
  PenSquare,
  Clock,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductGrid from "@/components/sections/ProductGrid";
import ReviewModal from "@/components/ReviewModal";
import AllReviewsModal from "@/components/AllReviewsModal";
import { productsApi, imagesApi, favoritesApi } from "@/lib/api";
import { chatApi } from "@/lib/api/chat";
import type { ProductResponseData, ProductImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import FollowButton from "@/components/FollowButton";
import { OnlineIndicator } from "@/components/OnlineIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductSpec {
  spec_id: string;
  spec_name: string;
  value: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  allImages?: ProductImage[];
  wishlist_count?: number;
  average_rating?: number;
  total_reviews?: number;
  specs?: ProductSpec[];
  region?: string;
  town?: string;
  negotiation?: string;
  promotion_type?: string;
}

const DetailPage: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithDetails[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);
  const [seller, setSeller] = useState<any | null>(null);
  const [isCurrentUserSeller, setIsCurrentUserSeller] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const hasViewedProduct = (productId: string): boolean => {
    const viewed = sessionStorage.getItem(`viewed_${productId}`);
    return viewed === "true";
  };

  const markProductViewed = (productId: string) => {
    sessionStorage.setItem(`viewed_${productId}`, "true");
  };

  const loadReviews = useCallback(async () => {
    if (!pid) return;
    setLoadingReviews(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api"}/products/${pid}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  }, [pid]);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsApi.getProduct(pid!);
      if (response.success && response.data) {
        let productData = response.data as ProductWithDetails;

        if (!hasViewedProduct(pid!)) {
          try {
            await productsApi.trackView(pid!);
            markProductViewed(pid!);
            const updatedResponse = await productsApi.getProduct(pid!);
            if (updatedResponse.success && updatedResponse.data) {
              productData = {
                ...productData,
                views_count: updatedResponse.data.views_count,
                wishlist_count: (updatedResponse.data as any).wishlist_count,
                average_rating: (updatedResponse.data as any).average_rating,
                total_reviews: (updatedResponse.data as any).total_reviews,
                specs: (updatedResponse.data as any).specs,
                region: (updatedResponse.data as any).region,
                town: (updatedResponse.data as any).town,
                negotiation: (updatedResponse.data as any).negotiation,
              };
            }
          } catch {
            //
          }
        }

        let primaryImage: string | undefined;
        let allImages: ProductImage[] | undefined;
        try {
          const imagesResponse = await imagesApi.getImages(pid!);
          if (imagesResponse.success && imagesResponse.data.length > 0) {
            allImages = imagesResponse.data;
            const primaryImg = allImages.find((img) => img.is_primary);
            primaryImage = primaryImg?.image_url || allImages[0]?.image_url;
          }
        } catch {
          //
        }

        try {
          const sellerRes = await productsApi.getSeller(productData.seller_id);
          setSeller(sellerRes.data);
          if (user && sellerRes.data) {
            const currentUserId = typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
            setIsCurrentUserSeller(currentUserId === sellerRes.data.id);
          }
        } catch {
          //
        }

        setProduct({
          ...productData,
          primaryImage,
          allImages,
        });

        if (productData.category_id) {
          loadRelatedProducts(productData.category_id);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [pid, toast, user]);

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !product) return;
    try {
      const response = await favoritesApi.check(product.pid);
      setIsLiked(response.data.favorited);
    } catch (error) {
      //
    }
  }, [user, product]);

  const loadRelatedProducts = useCallback(
    async (categoryId: string) => {
      try {
        const response = await productsApi.getProducts({
          category: categoryId,
          limit: 6,
        });
        if (response.success && response.data) {
          const filtered = response.data.filter((p) => p.pid !== pid);

          const productsWithImages = await Promise.all(
            filtered.slice(0, 6).map(async (product) => {
              let primaryImage: string | undefined;
              try {
                const imagesResponse = await imagesApi.getImages(product.pid);
                if (imagesResponse.success && imagesResponse.data.length > 0) {
                  const primaryImg = imagesResponse.data.find((img) => img.is_primary);
                  primaryImage = primaryImg?.image_url || imagesResponse.data[0]?.image_url;
                }
              } catch (error) {
                //
              }

              return {
                ...product,
                primaryImage,
                rating: product.average_rating || 0,
                reviews: product.total_reviews || 0,
              };
            }),
          );

          setRelatedProducts(productsWithImages);
        }
      } catch (error) {
        //
      }
    },
    [pid],
  );

  const handleReviewSubmitted = async () => {
    const response = await productsApi.getProduct(pid!);
    if (response.success && response.data) {
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              average_rating: response.data.average_rating,
              total_reviews: response.data.total_reviews,
            }
          : prev,
      );
    }
    await loadReviews();
  };

  const handleChatSeller = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to message the seller",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!seller || !product) return;

    try {
      const productUuid = product.id;
      const message = `Hi, I'm interested in your product: ${product.title}`;
      const response = await chatApi.sendMessage(seller.id, message, productUuid);

      if (response.success) {
        toast({
          title: "Message Sent",
          description: "You can now continue the conversation in Messages",
        });
        navigate("/messaging", { state: { from: `/product/${pid}` } });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error: any) {
      console.error("Failed to start chat:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (pid) {
      loadProduct();
      loadReviews();
    }
  }, [pid, loadProduct, loadReviews]);

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
      navigate("/login");
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
        window.dispatchEvent(new Event("wishlistUpdated"));
      } else {
        await favoritesApi.add(product.pid);
        setIsLiked(true);
        toast({
          title: "Added",
          description: "Item added to wishlist",
        });
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const shareProduct = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      toast({
        title: "Link Copied!",
        description: "Product link copied to clipboard. Share it with friends!",
      });
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
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
      setSelectedImageIndex(
        (prev) => (prev - 1 + product.allImages!.length) % product.allImages!.length,
      );
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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getNegotiationLabel = (value: string) => {
    switch (value) {
      case "fixed":
        return "Fixed Price";
      case "negotiable":
        return "Price Negotiable";
      case "flexible":
        return "Ask Seller";
      default:
        return "Price Negotiable";
    }
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
              className={`w-4 h-4 ${
                i < fullStars
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
            <span className="text-sm font-medium text-gray-700 ml-1">{ratingValue.toFixed(1)}</span>
            {count && count > 0 && (
              <span className="text-xs text-gray-500">({formatNumber(count)} reviews)</span>
            )}
          </>
        )}
        {ratingValue === 0 && <span className="text-xs text-gray-500 ml-1">No reviews yet</span>}
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const imageList = product.allImages?.map((img) => img.image_url) || [product.primaryImage || ""];
  const hasImages = imageList.length > 0 && imageList[0];
  const totalImages = imageList.length;
  const specs = product.specs || [];
  const hasSpecs = specs.length > 0;
  const visibleSpecs = showFullSpecs ? specs : specs.slice(0, 6);

  // Mobile Layout - Complete version
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Product Images - Full width carousel */}
        <div className="relative bg-white">
          <div className="relative aspect-square bg-gray-100">
            <img
              src={
                hasImages
                  ? imageList[selectedImageIndex]
                  : "https://placehold.co/800x800/e2e8f0/94a3b8?text=No+Image"
              }
              alt={product.title}
              className="w-full h-full object-cover"
            />

            {hasImages && totalImages > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {imageList.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleImageClick(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === selectedImageIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md"
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`}
            />
          </button>

          {/* Status Badge */}
          {product.status !== "active" && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              {product.status === "sold" ? "SOLD" : "INACTIVE"}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 bg-white border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h1>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-red-600">
                {formatCurrency(product.price)}
              </span>
              {product.negotiation && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {getNegotiationLabel(product.negotiation)}
                </span>
              )}
            </div>
            <button onClick={shareProduct} className="p-2">
              {shareCopied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Share2 className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(product.views_count || 0)} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber((product as any).wishlist_count || 0)} saved
            </span>
          </div>

          <div className="flex items-center gap-2">
            {renderStars(product.average_rating || 0, product.total_reviews || 0)}
          </div>
        </div>

        {/* Location */}
        {(product.location || (product.town && product.region)) && (
          <div className="p-4 bg-white border-b border-gray-100 mt-2">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span>
                {product.town && product.region
                  ? `${product.town}, ${product.region}`
                  : product.location}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="p-4 bg-white border-b border-gray-100 mt-2">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {showFullDescription || product.description.length <= 300
                ? product.description
                : `${product.description.substring(0, 300)}...`}
            </p>
            {product.description.length > 300 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-red-600 text-xs mt-1"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Action Buttons - Inline under description (not fixed) */}
        {!isCurrentUserSeller ? (
          <div className="p-4 bg-white border-b border-gray-100 mt-2">
            <div className="flex gap-2">
              <button
                onClick={toggleFavorite}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
                  isLiked ? "bg-red-500 text-white" : "bg-gray-900 text-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Saved" : "Wishlist"}
              </button>

              {user && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm bg-white"
                >
                  <PenSquare className="w-4 h-4" />
                  Review
                </button>
              )}

              {user && (
                <button
                  onClick={handleChatSeller}
                  className="flex-1 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white border-b border-gray-100 mt-2">
            <button
              onClick={() => navigate(`/edit-product/${pid}`)}
              className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium text-sm"
            >
              Edit Product
            </button>
          </div>
        )}

        {/* Specifications */}
        {hasSpecs && (
          <div className="p-4 bg-white border-b border-gray-100 mt-2">
            <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
            <div className="space-y-2">
              {specs.map((spec) => (
                <div key={spec.spec_id} className="flex py-1">
                  <div className="w-1/2">
                    <span className="text-sm text-gray-500">{spec.spec_name}</span>
                  </div>
                  <div className="w-1/2">
                    <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seller Info */}
        {seller && (
          <div className="p-4 bg-white border-b border-gray-100 mt-2">
            <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  {seller.avatar_url ? (
                    <img
                      src={
                        seller.avatar_url.startsWith("http")
                          ? seller.avatar_url
                          : `http://localhost:5150${seller.avatar_url}`
                      }
                      alt={seller.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=ef4444&color=fff&size=48`;
                      }}
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {seller.name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                {/* Online indicator dot - positioned at bottom-right of avatar */}
                {seller.id && (
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <OnlineIndicator userId={seller.id} size="sm" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{seller.name}</p>
                </div>
                {seller.username && <p className="text-xs text-gray-500">@{seller.username}</p>}
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span>{seller.product_count || 0} listings</span>
                  <span>{seller.follower_count || 0} followers</span>
                </div>
              </div>
              {user && !isCurrentUserSeller && (
                <FollowButton
                  userId={seller.id}
                  userPid={seller.pid}
                  username={seller.username || seller.name}
                  variant="outline"
                />
              )}
            </div>
          </div>
        )}

        {/* Safety Tips */}
        <div className="p-4 bg-yellow-50 mt-2">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            Safety Tips
          </h3>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Avoid paying in advance, even for delivery</li>
            <li>• Meet at a safe public place</li>
            <li>• Inspect the item before paying</li>
            <li>• Only pay if you're satisfied</li>
          </ul>
        </div>

        {/* Reviews Section */}
        <div className="p-4 bg-white mt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              Customer Reviews
              {product.total_reviews && product.total_reviews > 0 && (
                <span className="text-sm text-gray-500 ml-2">({product.total_reviews})</span>
              )}
            </h3>
            {user && !isCurrentUserSeller && (
              <button onClick={() => setShowReviewModal(true)} className="text-sm text-red-600">
                Write a review
              </button>
            )}
          </div>

          {loadingReviews ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {/* Show only first 2 reviews */}
              {reviews.slice(0, 2).map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      {review.user_avatar ? (
                        <img
                          src={
                            review.user_avatar.startsWith("http")
                              ? review.user_avatar
                              : `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api").replace("/api", "")}${review.user_avatar}`
                          }
                          alt={review.user_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}&background=ef4444&color=fff&size=40`;
                          }}
                        />
                      ) : (
                        <span className="text-white font-bold text-sm uppercase">
                          {review.user_name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-gray-900">{review.user_name}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* View All button - only show if more than 2 reviews */}
              {reviews.length > 2 && (
                <button
                  onClick={() => setShowAllReviewsModal(true)}
                  className="w-full py-2 text-center text-sm text-red-600 font-medium hover:text-red-700 transition-colors border-t border-gray-100 pt-3"
                >
                  View all {reviews.length} reviews
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-4 px-4 pb-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Related Products</h2>
            <ProductGrid
              products={relatedProducts}
              viewMode="3"
              onViewModeChange={() => {}}
              loading={false}
            />
          </div>
        )}

        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          productId={pid!}
          productName={product.title}
          onReviewSubmitted={handleReviewSubmitted}
        />

        <AllReviewsModal
          isOpen={showAllReviewsModal}
          onClose={() => setShowAllReviewsModal(false)}
          reviews={reviews}
          productName={product.title}
        />

        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  // Desktop Layout
  const visibleThumbnails = () => {
    if (totalImages <= 5) {
      return imageList.filter((_, idx) => idx !== selectedImageIndex);
    }
    const thumbnails: string[] = [];
    let start = Math.max(0, selectedImageIndex - 2);
    let end = Math.min(totalImages - 1, start + 3);
    if (end - start < 3) {
      start = Math.max(0, end - 3);
    }
    for (let i = start; i <= end; i++) {
      if (i !== selectedImageIndex) {
        thumbnails.push(imageList[i]);
      }
    }
    return thumbnails.slice(0, 4);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Images */}
          <div className="relative">
            <div className="sticky top-24">
              <div
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4 cursor-zoom-in"
                onMouseMove={handleImageHover}
                onMouseLeave={handleImageLeave}
              >
                <img
                  src={
                    hasImages
                      ? imageList[selectedImageIndex]
                      : "https://placehold.co/800x800/e2e8f0/94a3b8?text=No+Image"
                  }
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                {showZoom && zoomEnabled && hasImages && (
                  <div
                    className="absolute inset-0 bg-cover bg-no-repeat"
                    style={{
                      backgroundImage: `url(${imageList[selectedImageIndex]})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: "200%",
                      transform: "scale(1.5)",
                    }}
                  />
                )}
                <button
                  onClick={toggleZoom}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md"
                >
                  {zoomEnabled ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </button>
                {hasImages && totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                      {selectedImageIndex + 1} / {totalImages}
                    </div>
                  </>
                )}
                {product.status !== "active" && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    {product.status === "sold" ? "SOLD" : "INACTIVE"}
                  </span>
                )}
              </div>

              {hasImages && totalImages > 1 && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {visibleThumbnails().map((image, idx) => {
                    const originalIndex = imageList.findIndex((img) => img === image);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleImageClick(originalIndex)}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImageIndex === originalIndex
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Seller Information Desktop */}
              <div className="mt-4">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Seller Information</h3>
                  </div>
                  <div className="p-4">
                    {seller ? (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                            {seller.avatar_url ? (
                              <img
                                src={
                                  seller.avatar_url.startsWith("http")
                                    ? seller.avatar_url
                                    : `http://localhost:5150${seller.avatar_url}`
                                }
                                alt={seller.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.name)}&background=ef4444&color=fff&size=48`;
                                }}
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {seller.name?.charAt(0) || "U"}
                              </span>
                            )}
                          </div>
                          {/* Online indicator dot - positioned at bottom-right of avatar */}
                          {seller.id && (
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <OnlineIndicator userId={seller.id} size="sm" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{seller.name}</p>
                          </div>
                          {seller.username && (
                            <p className="text-sm text-gray-500">@{seller.username}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{seller.product_count || 0} listings</span>
                            <span>{seller.follower_count || 0} followers</span>
                          </div>
                        </div>
                        {user && !isCurrentUserSeller && (
                          <FollowButton
                            userId={seller.id}
                            userPid={seller.pid}
                            username={seller.username || seller.name}
                            variant="outline"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Loading seller information...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="mt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    Safety Tips
                  </h3>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    <li>• Avoid paying in advance, even for delivery</li>
                    <li>• Meet at a safe public place</li>
                    <li>• Inspect the item before paying</li>
                    <li>• Only pay if you're satisfied</li>
                  </ul>
                </div>
              </div>

              {/* Reviews Section - Desktop */}
              <div className="mt-4">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Customer Reviews
                        {product.total_reviews && product.total_reviews > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({product.total_reviews})
                          </span>
                        )}
                      </h3>
                      {user && !isCurrentUserSeller && (
                        <button
                          onClick={() => setShowReviewModal(true)}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <PenSquare className="w-3 h-3" />
                          Write a review
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {loadingReviews ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : reviews.length > 0 ? (
                      <div>
                        <div className="space-y-4">
                          {/* Show only first 2 reviews */}
                          {reviews.slice(0, 2).map((review) => (
                            <div
                              key={review.id}
                              className="border-b border-gray-100 pb-4 last:border-0"
                            >
                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                                  {review.user_avatar ? (
                                    <img
                                      src={
                                        review.user_avatar.startsWith("http")
                                          ? review.user_avatar
                                          : `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api").replace("/api", "")}${review.user_avatar}`
                                      }
                                      alt={review.user_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}&background=ef4444&color=fff&size=40`;
                                      }}
                                    />
                                  ) : (
                                    <span className="text-white font-bold text-sm uppercase">
                                      {review.user_name?.charAt(0) || "U"}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span className="font-medium text-gray-900">
                                      {review.user_name}
                                    </span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatDate(review.created_at)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                      />
                                    ))}
                                  </div>
                                  {review.comment && (
                                    <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View All button - only show if more than 2 reviews */}
                        {reviews.length > 2 && (
                          <button
                            onClick={() => setShowAllReviewsModal(true)}
                            className="w-full mt-4 py-2 text-center text-sm text-red-600 font-medium hover:text-red-700 transition-colors border-t border-gray-100 pt-3"
                          >
                            View all {reviews.length} reviews
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">
                          No reviews yet. Be the first to review!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>

            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-3xl font-bold text-red-600">
                {formatCurrency(product.price)}
              </span>
              {product.condition && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded capitalize">
                  {product.condition}
                </span>
              )}
              {product.negotiation && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                  {getNegotiationLabel(product.negotiation)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 flex-wrap">
              <div className="flex items-center gap-1 text-gray-500">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{formatNumber(product.views_count || 0)} views</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Heart className="w-4 h-4" />
                <span className="text-sm">
                  {formatNumber((product as any).wishlist_count || 0)} saved
                </span>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(product.average_rating || 0, product.total_reviews || 0)}
              </div>
            </div>

            {(product.location || (product.town && product.region)) && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-5 h-5" />
                <span>
                  {product.town && product.region
                    ? `${product.town}, ${product.region}`
                    : product.location}
                </span>
              </div>
            )}

            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {showFullDescription || product.description.length <= 300
                    ? product.description
                    : `${product.description.substring(0, 300)}...`}
                </p>
                {product.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-red-600 text-sm mt-2"
                  >
                    {showFullDescription ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {hasSpecs && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Specifications</h3>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100">
                    {specs.map((spec) => (
                      <div key={spec.spec_id} className="flex py-3 px-4">
                        <div className="w-1/2">
                          <span className="text-sm text-gray-500">{spec.spec_name}</span>
                        </div>
                        <div className="w-1/2">
                          <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isCurrentUserSeller ? (
              <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isLiked ? "bg-red-500 text-white" : "bg-gray-900 text-white"}`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  {isLiked ? "Saved" : "Wishlist"}
                </button>
                <button
                  onClick={handleChatSeller}
                  className="flex-1 py-3 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
                <button
                  onClick={shareProduct}
                  className="p-3 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors"
                >
                  {shareCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm">This is your listing</p>
                <button
                  onClick={() => navigate(`/edit-product/${pid}`)}
                  className="mt-2 text-red-600 text-sm"
                >
                  Edit Product
                </button>
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <ProductGrid
              products={relatedProducts}
              viewMode="3"
              onViewModeChange={() => {}}
              loading={false}
            />
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productId={pid!}
        productName={product.title}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <AllReviewsModal
        isOpen={showAllReviewsModal}
        onClose={() => setShowAllReviewsModal(false)}
        reviews={reviews}
        productName={product.title}
      />

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default DetailPage;

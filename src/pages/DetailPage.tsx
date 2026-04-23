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
  Phone,
  Shield,
  Share2,
  Check,
  Eye,
  PenSquare,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductGrid from "@/components/sections/ProductGrid";
import ReviewModal from "@/components/ReviewModal";
import { productsApi, imagesApi, favoritesApi } from "@/lib/api";
import { chatApi } from "@/lib/api/chat";
import type { ProductResponseData, ProductImage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import FollowButton from "@/components/FollowButton";
import { OnlineIndicator } from "@/components/OnlineIndicator";

interface ProductSpec {
  spec_id: string;
  spec_name: string;
  value: string;
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
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithDetails[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [seller, setSeller] = useState<any | null>(null);
  const [isCurrentUserSeller, setIsCurrentUserSeller] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const hasViewedProduct = (productId: string): boolean => {
    const viewed = sessionStorage.getItem(`viewed_${productId}`);
    return viewed === "true";
  };

  const markProductViewed = (productId: string) => {
    sessionStorage.setItem(`viewed_${productId}`, "true");
  };

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

  const getVisibleThumbnails = () => {
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

    while (thumbnails.length < 4 && thumbnails.length < totalImages - 1) {
      if (start > 0) {
        start--;
        if (start !== selectedImageIndex) {
          thumbnails.unshift(imageList[start]);
        }
      } else if (end < totalImages - 1) {
        end++;
        if (end !== selectedImageIndex) {
          thumbnails.push(imageList[end]);
        }
      } else {
        break;
      }
    }

    return thumbnails.slice(0, 4);
  };

  const visibleThumbnails = getVisibleThumbnails();

  const viewsCount = product.views_count || 0;
  const wishlistCount = (product as any).wishlist_count || 0;
  const averageRating = (product as any).average_rating || 0;
  const totalReviews = (product as any).total_reviews || 0;
  const specs = product.specs || [];
  const hasSpecs = specs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Product Images */}
          <div className="relative">
            <div className="sticky top-24">
              {/* Main Image */}
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
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  {zoomEnabled ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </button>

                {hasImages && totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {hasImages && totalImages > 1 && (
                  <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                    {selectedImageIndex + 1} / {totalImages}
                  </div>
                )}

                {product.status !== "active" && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    {product.status === "sold" ? "SOLD" : "INACTIVE"}
                  </span>
                )}
              </div>

              {/* Thumbnail Images */}
              {hasImages && totalImages > 1 && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {visibleThumbnails.map((image, idx) => {
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
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Seller Section */}
              <div className="mt-4">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Seller Information</h3>
                  </div>
                  <div className="p-4">
                    {seller ? (
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => seller.username && navigate(`/user/${seller.username}`)}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                            {seller.avatar_url ? (
                              <img
                                src={
                                  seller.avatar_url.startsWith("http")
                                    ? seller.avatar_url
                                    : `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api").replace("/api", "")}${seller.avatar_url}`
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
                                {seller.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          {seller.id && (
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <OnlineIndicator userId={seller.id} size="sm" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{seller.name}</p>
                            <OnlineIndicator
                              userId={seller.id}
                              size="sm"
                              showDetailedText={true}
                              textClassName="text-xs"
                            />
                          </div>
                          {seller.username && (
                            <p className="text-sm text-gray-500">@{seller.username}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span>{seller.product_count} listings</span>
                            <span>{seller.follower_count} followers</span>
                          </div>
                        </div>

                        {user && !isCurrentUserSeller && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <FollowButton
                              userId={seller.id}
                              userPid={seller.pid}
                              username={seller.username || seller.name}
                              variant="outline"
                            />
                          </div>
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

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 flex-wrap">
              <div className="flex items-center gap-1 text-gray-500">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{formatNumber(viewsCount)} views</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{formatNumber(wishlistCount)} saved</span>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(averageRating, totalReviews)}
              </div>
            </div>

            {/* Location */}
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

            {/* Description */}
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
                    className="text-red-600 text-sm mt-2 hover:text-red-700"
                  >
                    {showFullDescription ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons - Only for non-sellers */}
            {!isCurrentUserSeller && (
              <div className="flex gap-2 mb-6">
                <button
                  onClick={toggleFavorite}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm ${
                    isLiked
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  {isLiked ? "Saved" : "Wishlist"}
                </button>

                {user && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <PenSquare className="w-4 h-4" />
                    Review
                  </button>
                )}

                {user && (
                  <button
                    onClick={handleChatSeller}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                )}

                <button
                  onClick={shareProduct}
                  className="p-2.5 rounded-lg border border-gray-300 text-gray-600 hover:border-gray-400 transition-colors relative"
                >
                  {shareCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Seller View - Show edit option instead of action buttons */}
            {isCurrentUserSeller && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6 text-center">
                <p className="text-gray-600 text-sm">This is your listing</p>
                <button
                  onClick={() => navigate(`/edit-product/${pid}`)}
                  className="mt-2 text-red-600 text-sm hover:text-red-700"
                >
                  Edit Product
                </button>
              </div>
            )}

            {/* Specifications Section */}
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
          </div>
        </div>

        {/* Related Products */}
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

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default DetailPage;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Package, UserCheck, ArrowLeft } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import ProductGrid from "@/components/sections/ProductGrid";
import FollowButton from "@/components/FollowButton";
import { followsApi, imagesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { UserProfile as UserProfileType } from "@/lib/api/follows";
import { OnlineIndicator } from "@/components/OnlineIndicator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api";
const API_BASE = API_BASE_URL.replace("/api", "");

const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
};

const UserAvatar = ({
  user,
  size = 10,
  showOnlineStatus = false,
}: {
  user: any;
  size?: number;
  showOnlineStatus?: boolean;
}) => {
  const url = resolveImageUrl(user.avatar_url);
  const sizeClass = `w-${size} h-${size}`;
  return (
    <div className="relative">
      <div
        className={`${sizeClass} rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0`}
      >
        {url ? (
          <img
            src={url}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ef4444&color=fff&size=80`;
            }}
          />
        ) : (
          <span className="text-white font-bold text-sm">
            {user.name?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </div>
      {showOnlineStatus && user.id && (
        <div className="absolute -bottom-0.5 -right-0.5">
          <OnlineIndicator userId={user.id} size="sm" />
        </div>
      )}
    </div>
  );
};

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "followers" | "following">("products");
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserProfileType | null>(null);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, listingsRes] = await Promise.all([
        followsApi.getProfile(username!),
        followsApi.getUserListings(username!),
      ]);

      const profileData = profileRes.data;
      setProfile(profileData);

      // Fetch primary image for each listing
      const listingsWithImages = await Promise.all(
        listingsRes.data.map(async (product: any) => {
          let primaryImage: string | undefined;
          try {
            const imagesRes = await imagesApi.getImages(product.pid);
            if (imagesRes.success && imagesRes.data.length > 0) {
              const primary = imagesRes.data.find((img: any) => img.is_primary);
              const imageUrl = primary?.image_url || imagesRes.data[0]?.image_url;
              primaryImage = resolveImageUrl(imageUrl);
            }
          } catch {
            // no image, leave undefined
          }
          return {
            ...product,
            primaryImage:
              primaryImage || "https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image",
            rating: product.average_rating || 0,
            reviews: product.total_reviews || 0,
          };
        }),
      );

      setListings(listingsWithImages);
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast({
        title: "Error",
        description: "User not found",
        variant: "destructive",
      });
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const loadFollowers = async (userId: number) => {
    try {
      const response = await followsApi.getFollowers(userId);
      setFollowers(response.data);
    } catch (error) {
      console.error("Failed to load followers:", error);
    }
  };

  const loadFollowing = async (userId: number) => {
    try {
      const response = await followsApi.getFollowing(userId);
      setFollowing(response.data);
    } catch (error) {
      console.error("Failed to load following:", error);
    }
  };

  const handleFollowChange = (isFollowing: boolean) => {
    setProfile((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        is_following: isFollowing,
        follower_count: isFollowing ? prev.follower_count + 1 : prev.follower_count - 1,
      };
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Shared avatar component for followers/following lists
  const AvatarComponent = ({ user, size = 10 }: { user: any; size?: number }) => {
    const url = resolveImageUrl(user.avatar_url);
    const sizeClass = `w-${size} h-${size}`;
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0`}
      >
        {url ? (
          <img
            src={url}
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ef4444&color=fff&size=80`;
            }}
          />
        ) : (
          <span className="text-white font-bold text-sm">
            {user.name?.charAt(0)?.toUpperCase()}
          </span>
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-8">The user you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Go to Shop
          </button>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const profileAvatarUrl = resolveImageUrl(profile.avatar_url);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                  {profileAvatarUrl ? (
                    <img
                      src={profileAvatarUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=ef4444&color=fff&size=128`;
                      }}
                    />
                  ) : (
                    <span className="text-white text-3xl font-bold">{profile.name.charAt(0)}</span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0">
                  <OnlineIndicator userId={profile.id} size="md" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {profile.name}
                      </h1>
                      {/* Show online status with text */}
                      <OnlineIndicator
                        userId={profile.id}
                        size="sm"
                        showDetailedText={true}
                        textClassName="text-sm"
                      />
                    </div>
                    {profile.username && <p className="text-gray-500 mt-1">@{profile.username}</p>}
                    {profile.bio && <p className="text-gray-600 mt-2 max-w-lg">{profile.bio}</p>}
                  </div>
                  <FollowButton
                    userId={profile.id}
                    userPid={profile.pid}
                    username={profile.username || profile.name}
                    onFollowChange={handleFollowChange}
                  />
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">{profile.product_count}</div>
                    <div className="text-sm text-gray-500">Products</div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("followers");
                      loadFollowers(profile.id);
                    }}
                    className={`text-center hover:opacity-75 transition-opacity ${activeTab === "followers" ? "text-red-600" : ""}`}
                  >
                    <div className="text-xl font-bold text-gray-900">{profile.follower_count}</div>
                    <div className="text-sm text-gray-500">Followers</div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("following");
                      loadFollowing(profile.id);
                    }}
                    className={`text-center hover:opacity-75 transition-opacity ${activeTab === "following" ? "text-red-600" : ""}`}
                  >
                    <div className="text-xl font-bold text-gray-900">{profile.following_count}</div>
                    <div className="text-sm text-gray-500">Following</div>
                  </button>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-3 px-4 font-medium transition-colors ${activeTab === "products" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products ({profile.product_count})
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("followers");
                loadFollowers(profile.id);
              }}
              className={`pb-3 px-4 font-medium transition-colors ${activeTab === "followers" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Followers ({profile.follower_count})
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("following");
                loadFollowing(profile.id);
              }}
              className={`pb-3 px-4 font-medium transition-colors ${activeTab === "following" ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Following ({profile.following_count})
              </div>
            </button>
          </div>

          {/* Content */}
          {activeTab === "products" && listings.length > 0 && (
            <ProductGrid
              products={listings}
              viewMode="3"
              onViewModeChange={() => {}}
              loading={false}
            />
          )}

          {activeTab === "products" && listings.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500">This user hasn't listed any products yet.</p>
            </div>
          )}

          {activeTab === "followers" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {followers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No followers yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {followers.map((follower) => (
                    <div
                      key={follower.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/user/${follower.username || follower.id}`)}
                    >
                      <UserAvatar user={follower} size={10} showOnlineStatus={true} />
                      <div>
                        <p className="font-medium text-gray-900">{follower.name}</p>
                        {follower.username && (
                          <p className="text-sm text-gray-500">@{follower.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "following" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {following.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Not following anyone yet</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {following.map((followed) => (
                    <div
                      key={followed.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/user/${followed.username || followed.id}`)}
                    >
                      <AvatarComponent user={followed} size={10} />
                      <div>
                        <p className="font-medium text-gray-900">{followed.name}</p>
                        {followed.username && (
                          <p className="text-sm text-gray-500">@{followed.username}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default UserProfile;

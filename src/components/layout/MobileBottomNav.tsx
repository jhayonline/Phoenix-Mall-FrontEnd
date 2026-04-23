import React, { useState, useCallback, useEffect } from "react";
import { Heart, Bell, Plus, MessageCircle, ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { profileApi } from "@/lib/api";
import { OnlineIndicator } from "@/components/OnlineIndicator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api";
const API_BASE = API_BASE_URL.replace("/api", "");

const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const cleanPath = url.startsWith("/") ? url.slice(1) : url;
  return `${API_BASE}/${cleanPath}`;
};

type Tab = {
  name: string;
  icon: React.ElementType;
  path: string;
  badge?: string | null;
};

const NavButton: React.FC<{
  tab: Tab;
  active: boolean;
  onClick: () => void;
}> = ({ tab, active, onClick }) => {
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-2xl transition-colors duration-150 ${
        active ? "bg-red-50" : ""
      }`}
    >
      {/* Icon */}
      <div className="relative">
        <Icon
          className="w-[20px] h-[20px] transition-colors duration-150"
          style={{
            color: active ? "#dc2626" : "#9ca3af",
            fill: active ? "#dc2626" : "none",
          }}
          strokeWidth={active ? 2.2 : 1.8}
        />

        {/* Badge */}
        {tab.badge && (
          <span className="absolute -top-2 -right-2.5 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full text-white font-semibold text-[9px] bg-gradient-to-r from-red-500 to-red-600 shadow-md">
            {tab.badge}
          </span>
        )}
      </div>

      {/* Active dot */}
      {active && <div className="w-1 h-1 rounded-full bg-red-600 mt-0.5" />}
      {!active && <div className="w-1 h-1 mt-0.5" />}
    </button>
  );
};

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  // Load profile data for avatar
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const response = await profileApi.getProfile();
          if (response.success && response.data) {
            setProfileAvatar(response.data.avatar_url);
          }
        } catch (error) {
          console.error("Failed to load profile avatar:", error);
        }
      }
    };
    loadProfile();
  }, [user]);

  // Load unread counts
  useEffect(() => {
    const loadCounts = async () => {
      if (!user) return;
      try {
        const { chatApi } = await import("@/lib/api/chat");
        const response = await chatApi.getTotalUnreadCount();
        if (response.success && response.data) {
          setMessageCount(response.data.total);
        }
      } catch (error) {
        console.error("Failed to load unread count:", error);
      }
    };
    loadCounts();

    const handleMessagesRead = () => {
      loadCounts();
    };
    window.addEventListener("messagesRead", handleMessagesRead);
    return () => window.removeEventListener("messagesRead", handleMessagesRead);
  }, [user]);

  // Load cart count from localStorage
  useEffect(() => {
    const loadCartCount = () => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        try {
          const items = JSON.parse(cart);
          const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartCount(totalItems);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    loadCartCount();

    const handleCartUpdate = () => {
      loadCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const getAvatarUrl = () => {
    const url = profileAvatar || user?.avatar_url;
    if (!url) return null;
    return resolveImageUrl(url);
  };

  const avatarUrl = getAvatarUrl();
  const isProfileActive = isActive("/profile");
  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?";

  const tabs: (Tab | "center")[] = [
    {
      name: "Shop",
      icon: ShoppingCart,
      path: "/shop",
      badge: cartCount > 0 ? String(cartCount) : null,
    },
    { name: "Wishlist", icon: Heart, path: "/wishlist", badge: null },
    "center",
    {
      name: "Messages",
      icon: MessageCircle,
      path: "/messaging",
      badge: messageCount > 0 ? String(messageCount) : null,
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
      badge: notifCount > 0 ? String(notifCount) : null,
    },
  ];

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 md:hidden flex items-center gap-3">
      {/* Main pill nav */}
      <div
        className="flex-1 rounded-[28px] overflow-hidden bg-white/70 backdrop-blur-md shadow-lg"
        style={{
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: `
            0 0 0 0.5px rgba(255, 255, 255, 0.6),
            0 4px 6px rgba(0, 0, 0, 0.04),
            0 12px 28px rgba(0, 0, 0, 0.12),
            0 24px 48px rgba(0, 0, 0, 0.08)
          `,
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
          }}
        />

        <div className="flex items-center justify-between px-4 py-2">
          {tabs.map((tab, i) => {
            if (tab === "center") {
              return user ? (
                <button
                  key="center"
                  onClick={() => navigate("/sell")}
                  className="relative flex items-center justify-center w-12 h-12 rounded-2xl text-white bg-gradient-to-br from-red-500 to-red-600 shadow-md active:scale-95 transition-transform duration-150"
                  style={{
                    boxShadow: `
                      0 4px 12px rgba(220, 38, 38, 0.4),
                      0 2px 4px rgba(220, 38, 38, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `,
                  }}
                >
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </button>
              ) : (
                <div key="center-placeholder" className="w-12 h-12" />
              );
            }

            return (
              <NavButton
                key={tab.name}
                tab={tab}
                active={isActive(tab.path)}
                onClick={() => navigate(tab.path)}
              />
            );
          })}
        </div>
      </div>

      {/* Detached profile avatar button */}
      <button
        onClick={() => navigate("/profile")}
        className="relative flex-shrink-0 w-[60px] h-[60px] rounded-full bg-white/70 backdrop-blur-md shadow-lg transition-transform duration-150 active:scale-95"
        style={{
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: `
            0 0 0 0.5px rgba(255, 255, 255, 0.6),
            0 4px 6px rgba(0, 0, 0, 0.04),
            0 12px 28px rgba(0, 0, 0, 0.12),
            0 24px 48px rgba(0, 0, 0, 0.08)
          `,
          padding: "6px",
        }}
      >
        {/* Active ring */}
        {isProfileActive && <div className="absolute inset-0 rounded-full ring-2 ring-red-500" />}

        {/* Avatar with online indicator */}
        <div className="relative w-full h-full">
          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
            {user && avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user.name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || user.email || "User",
                  )}&background=ef4444&color=fff&size=120`;
                }}
              />
            ) : user ? (
              <span className="text-white font-bold text-lg">{userInitial}</span>
            ) : (
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            )}
          </div>

          {/* Online status indicator */}
          {user?.id && (
            <div className="absolute -bottom-0.5 -right-0.5">
              <OnlineIndicator
                userId={typeof user.id === "string" ? parseInt(user.id, 10) : user.id}
                size="sm"
              />
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

export default MobileBottomNav;

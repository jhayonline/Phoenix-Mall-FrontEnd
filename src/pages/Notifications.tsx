import React, { useState, useEffect } from "react";
import {
  Bell,
  MessageSquare,
  Heart,
  UserPlus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Inbox,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { chatApi, type Conversation } from "@/lib/api/chat";
import { priceIntelApi, type PriceRecommendation } from "@/lib/api/priceIntel";

interface Notification {
  id: string;
  type: "message" | "like" | "follow" | "price_recommendation";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  data?: {
    conversation_id?: string;
    user_id?: number;
    user_name?: string;
    product_id?: string;
    product_title?: string;
    market_avg?: number;
    current_price?: number;
    recommendation_id?: string;
  };
}

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const allNotifications: Notification[] = [];

      // 1. Load message notifications from chat
      const convResponse = await chatApi.getConversations();
      if (convResponse.success && convResponse.data) {
        const unreadConversations = convResponse.data.filter((conv) => conv.unread_count > 0);

        const messageNotifications: Notification[] = unreadConversations.map((conv) => ({
          id: `msg-${conv.id}`,
          type: "message",
          title: conv.other_user_name,
          description: conv.last_message,
          timestamp: conv.last_message_time,
          isRead: false,
          link: `/messages?conv=${conv.id}`,
          data: {
            conversation_id: conv.id,
            user_id: conv.other_user_id,
            user_name: conv.other_user_name,
          },
        }));
        allNotifications.push(...messageNotifications);
      }

      // 2. Load price recommendation notifications
      try {
        const recommendations = await priceIntelApi.getProductRecommendations();
        const priceNotifications: Notification[] = recommendations.map((rec) => ({
          id: `price-${rec.id}`,
          type: "price_recommendation",
          title: "Price Recommendation Available",
          description: `Market analysis shows similar items average GHS ${rec.market_avg_price}. Consider adjusting your price.`,
          timestamp: rec.created_at,
          isRead: rec.is_viewed,
          link: `/edit-product/${rec.product_id}`,
          data: {
            product_id: rec.product_id,
            market_avg: rec.market_avg_price,
            recommended_price: rec.recommended_price || rec.market_avg_price,
            recommendation_id: rec.id,
          },
        }));
        allNotifications.push(...priceNotifications);
      } catch (error) {
        console.error("Failed to load price recommendations:", error);
      }

      // Sort by timestamp (newest first)
      allNotifications.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, recommendationId?: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

    // If it's a price recommendation, mark it as viewed in the backend
    if (recommendationId) {
      try {
        await priceIntelApi.markAsViewed(recommendationId);
      } catch (error) {
        console.error("Failed to mark recommendation as viewed:", error);
      }
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    // Mark all as read in UI
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    // Mark price recommendations as viewed in backend
    for (const notification of unreadNotifications) {
      if (notification.type === "price_recommendation" && notification.data?.recommendation_id) {
        try {
          await priceIntelApi.markAsViewed(notification.data.recommendation_id);
        } catch (error) {
          console.error("Failed to mark recommendation as viewed:", error);
        }
      }
    }

    toast({
      title: "Marked all as read",
      description: "All notifications have been marked as read",
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id, notification.data?.recommendation_id);

    if (notification.link) {
      navigate(notification.link);
    } else if (notification.type === "message" && notification.data?.conversation_id) {
      navigate(`/messages?conv=${notification.data.conversation_id}`);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getNotificationIcon = (type: Notification["type"], isRead: boolean) => {
    const baseClasses = "w-5 h-5";
    const iconColor = isRead ? "text-gray-400" : "text-red-500";

    switch (type) {
      case "message":
        return <MessageSquare className={`${baseClasses} ${iconColor}`} />;
      case "like":
        return <Heart className={`${baseClasses} ${iconColor}`} />;
      case "follow":
        return <UserPlus className={`${baseClasses} ${iconColor}`} />;
      case "price_recommendation":
        return <TrendingDown className={`${baseClasses} ${iconColor}`} />;
      default:
        return <Bell className={`${baseClasses} ${iconColor}`} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-red-500" />
              <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {unreadCount === 0
              ? "All caught up! No new notifications."
              : `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer
                  transition-all duration-200 hover:bg-gray-100
                  ${!notification.isRead ? "bg-white shadow-sm border border-gray-200" : "bg-transparent"}
                `}
              >
                {/* Unread indicator dot */}
                {!notification.isRead && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full" />
                )}

                {/* Icon */}
                <div
                  className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ${!notification.isRead ? "bg-red-50" : "bg-gray-100"}
                `}
                >
                  {getNotificationIcon(notification.type, notification.isRead)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        className={`
                        text-sm font-medium
                        ${!notification.isRead ? "text-gray-900" : "text-gray-600"}
                      `}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTime(notification.timestamp)}
                      </span>
                      {!notification.isRead && (
                        <span className="text-[10px] font-medium text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price Recommendation Badge */}
                  {notification.type === "price_recommendation" &&
                    notification.data?.market_avg && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 rounded-full">
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-red-600 font-medium">
                          Market Avg: GHS {notification.data.market_avg}
                        </span>
                      </div>
                    )}

                  {/* Action hint */}
                  <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      Click to{" "}
                      {notification.type === "price_recommendation" ? "adjust price" : "view"}{" "}
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              When you receive messages, price recommendations, or activity updates, they'll appear
              here.
            </p>
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Notifications;

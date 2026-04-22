import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  X,
  MessageSquare,
  Heart,
  UserPlus,
  Clock,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { chatApi, type Conversation } from '@/lib/api/chat';

interface Notification {
  id: string;
  type: 'message' | 'like' | 'follow';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  data?: {
    conversation_id?: string;
    user_id?: number;
    user_name?: string;
  };
}

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications from API
  useEffect(() => {
    loadNotifications();

    // Mark as viewed when page loads
    markNotificationsAsViewed();
  }, []);

  const loadNotifications = async () => {
    try {
      // Load conversations to check for unread messages
      const convResponse = await chatApi.getConversations();
      if (convResponse.success && convResponse.data) {
        const unreadConversations = convResponse.data.filter(conv => conv.unread_count > 0);

        // Create notifications from unread messages
        const messageNotifications: Notification[] = unreadConversations.map(conv => ({
          id: `msg-${conv.id}`,
          type: 'message',
          title: `New message from ${conv.other_user_name}`,
          description: conv.last_message,
          timestamp: conv.last_message_time,
          isRead: false,
          link: `/messages?conv=${conv.id}`,
          data: {
            conversation_id: conv.id,
            user_id: conv.other_user_id,
            user_name: conv.other_user_name,
          }
        }));

        setNotifications(messageNotifications);
        setUnreadCount(messageNotifications.length);
      }

      // TODO: Add likes and follows from API when implemented

    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsViewed = async () => {
    // This will be handled when user opens the page
    // In a real implementation, you'd call an API to mark as viewed
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.link) {
      navigate(notification.link);
    } else if (notification.type === 'message' && notification.data?.conversation_id) {
      navigate(`/messages?conv=${notification.data.conversation_id}`);
    } else if (notification.type === 'like' || notification.type === 'follow') {
      // Navigate to profile when implemented
      toast({
        title: "Coming Soon",
        description: "Profile pages will be available soon",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-8 h-8 text-red-600" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-5 flex items-center justify-center font-medium px-1.5"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </div>
              <h1 className="text-3xl font-bold font-heading">Notifications</h1>
            </div>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-red-100 text-red-600 hover:bg-red-200"
              >
                Mark all as read
              </motion.button>
            )}
          </div>
          <p className="text-gray-600 mt-2">
            Stay updated with your messages and activities
          </p>
        </motion.div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <AnimatePresence mode="popLayout">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                    delay: index * 0.03
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`border-b border-gray-100 last:border-b-0 cursor-pointer transition-all duration-200 ${!notification.isRead
                    ? 'bg-gradient-to-r from-red-50 to-transparent border-l-4 border-l-red-500'
                    : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="p-4 flex items-start">
                    {/* Notification Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm border border-gray-200 mr-4"
                    >
                      {getNotificationIcon(notification.type)}
                    </motion.div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator - eye icon for old notifications */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-red-500 rounded-full"
                        />
                      )}
                      {notification.isRead && (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Highlight bar for unread notifications */}
                  {!notification.isRead && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5 }}
                      className="h-0.5 bg-gradient-to-r from-red-400 to-red-600"
                    />
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No notifications</h3>
                <p className="text-gray-500 max-w-md">
                  You're all caught up! New messages and activities will appear here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Notifications;

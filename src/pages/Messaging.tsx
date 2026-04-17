import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MoreVertical,
  Info,
  Paperclip,
  Send,
  Image,
  CheckCheck,
  ChevronLeft,
  Archive,
  Star,
  Trash2,
  Bell
} from 'lucide-react';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  read: boolean;
  delivered: boolean;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
}

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  online: boolean;
  lastSeen?: Date;
  messages: Message[];
  isTyping?: boolean;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Alexei Computers',
      userAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
      lastMessage: 'Hello, is the Xiaomi Pad still available?',
      lastMessageTime: new Date('2026-04-17T19:12:00'),
      unreadCount: 2,
      online: true,
      messages: [
        {
          id: '1',
          text: 'Hello, is the Xiaomi Pad still available?',
          senderId: '2',
          receiverId: '1',
          timestamp: new Date('2026-04-17T19:12:00'),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: '2',
          text: 'Yes, it is. Price is 2500 GHS',
          senderId: '1',
          receiverId: '2',
          timestamp: new Date('2026-04-17T19:15:00'),
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: '3',
          text: 'Can we negotiate?',
          senderId: '2',
          receiverId: '1',
          timestamp: new Date('2026-04-17T19:20:00'),
          read: false,
          delivered: true,
          type: 'text'
        }
      ]
    },
    {
      id: '2',
      userId: '3',
      userName: 'Ghana Electronics',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      lastMessage: 'Thanks for your purchase!',
      lastMessageTime: new Date('2026-04-17T18:30:00'),
      unreadCount: 0,
      online: false,
      lastSeen: new Date('2026-04-17T18:25:00'),
      messages: []
    },
    {
      id: '3',
      userId: '4',
      userName: 'Fashion Hub',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      lastMessage: 'Your order has been shipped',
      lastMessageTime: new Date('2026-04-17T14:45:00'),
      unreadCount: 1,
      online: true,
      messages: []
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'spam'>('all');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768 && selectedConversation) {
        setShowChatInfo(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedConversation]);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'unread') return matchesSearch && conv.unreadCount > 0;
    if (filterType === 'spam') return false;
    return matchesSearch;
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      senderId: user?.id || '1',
      receiverId: selectedConversation.userId,
      timestamp: new Date(),
      read: false,
      delivered: true,
      type: 'text'
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageInput,
          lastMessageTime: new Date(),
          unreadCount: conv.unreadCount
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: messageInput,
      lastMessageTime: new Date()
    });
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return 'Offline';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'Online';
    if (minutes < 60) return `Last seen ${minutes} minutes ago`;
    if (minutes < 1440) return `Last seen ${Math.floor(minutes / 60)} hours ago`;
    return `Last seen ${Math.floor(minutes / 1440)} days ago`;
  };

  const quickReplies = [
    { text: 'Is this available?' },
    { text: 'Last price?' },
    { text: 'What is your location?' },
    { text: 'I want to make an offer.' },
    { text: 'Please call me.' }
  ];

  const chatInfoVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Added bottom padding for mobile nav on main container */}
      <div className="pt-20 md:pt-24 pb-24 md:pb-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 'calc(100vh - 8rem)' }}>
            <div className="flex h-full">
              {/* Conversations Sidebar */}
              <div className={`${isMobileView && selectedConversation ? 'hidden' : 'w-full md:w-96'} border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                      Messages
                    </h1>
                    <button className="p-2 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2 mt-4">
                    {['all', 'unread', 'spam'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setFilterType(filter as any)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filterType === filter
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.map((conv, index) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedConversation(conv);
                        const updated = conversations.map(c => {
                          if (c.id === conv.id) {
                            return { ...c, unreadCount: 0 };
                          }
                          return c;
                        });
                        setConversations(updated);
                      }}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedConversation?.id === conv.id ? 'bg-red-50 dark:bg-gray-700' : ''
                        }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                          {conv.userAvatar ? (
                            <img src={conv.userAvatar} alt={conv.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold text-lg">
                              {conv.userName.charAt(0)}
                            </span>
                          )}
                        </div>
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {conv.userName}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                            {conv.lastMessage}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              {selectedConversation ? (
                <div className={`${isMobileView && !showChatInfo ? 'flex-1' : 'hidden md:flex flex-1'} flex flex-col`}>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isMobileView && (
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                          {selectedConversation.userAvatar ? (
                            <img src={selectedConversation.userAvatar} alt={selectedConversation.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">
                              {selectedConversation.userName.charAt(0)}
                            </span>
                          )}
                        </div>
                        {selectedConversation.online && (
                          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                          {selectedConversation.userName}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedConversation.online ? 'Online' : formatLastSeen(selectedConversation.lastSeen)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowChatInfo(!showChatInfo)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    {selectedConversation.messages.map((message, index) => {
                      const isOwn = message.senderId === (user?.id || '1');
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${isOwn
                                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                                }`}
                            >
                              <p className="text-sm">{message.text}</p>
                              <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-red-100' : 'text-gray-500'}`}>
                                <span>{formatTime(message.timestamp)}</span>
                                {isOwn && message.read && <CheckCheck className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {selectedConversation.isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-600">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Replies */}
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {quickReplies.map((reply) => (
                        <button
                          key={reply.text}
                          onClick={() => setMessageInput(reply.text)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm transition-colors whitespace-nowrap"
                        >
                          {reply.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-end gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      <div className="flex-1 relative">
                        <textarea
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          rows={1}
                          className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                          style={{ minHeight: '40px', maxHeight: '100px' }}
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="p-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center">
                      <Send className="w-12 h-12 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Your Messages
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a conversation to start chatting
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Info Sidebar */}
              <AnimatePresence>
                {showChatInfo && selectedConversation && (
                  <motion.div
                    variants={chatInfoVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-10 md:relative md:shadow-none"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Chat Info</h3>
                      <button
                        onClick={() => setShowChatInfo(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600">
                        {selectedConversation.userAvatar ? (
                          <img src={selectedConversation.userAvatar} alt={selectedConversation.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">
                              {selectedConversation.userName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {selectedConversation.userName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        @{selectedConversation.userName.toLowerCase().replace(/\s/g, '')}
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${selectedConversation.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedConversation.online ? 'Online' : formatLastSeen(selectedConversation.lastSeen)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-4">
                      <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">On</p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-white">Add to Favorites</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Star this chat</p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                          <Archive className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-white">Archive Chat</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Move to archive</p>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-red-600 dark:text-red-400">Delete Chat</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Messages;

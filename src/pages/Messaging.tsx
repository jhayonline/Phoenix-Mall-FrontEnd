import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Bell,
  MessageSquare
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { chatApi, type ChatMessage, type Conversation } from '@/lib/api/chat';

interface MessageWithDetails extends ChatMessage {
  isOwn: boolean;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageWithDetails[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user ID from auth compute once when user is available
  const currentUserId = useMemo(() => {
    const id = user?.id;
    if (!id) return null;
    const parsed = parseInt(String(id), 10);
    return isNaN(parsed) ? null : parsed;
  }, [user?.id]);

  // Set ref synchronously
  const currentUserIdRef = useRef<number | null>(currentUserId);
  currentUserIdRef.current = currentUserId;

  // Check if auth is truly ready (user exists AND has valid ID)
  const isAuthReady = currentUserId !== null;

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

  // Load conversations only when auth is ready
  useEffect(() => {
    if (isAuthReady) {
      loadConversations();
    }
  }, [isAuthReady]);

  // Auto-select conversation from URL once conversations are loaded
  useEffect(() => {
    const convId = searchParams.get('conv');
    if (convId && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find(c => c.id === convId);
      if (conv) setSelectedConversation(conv);
    }
  }, [conversations, searchParams, selectedConversation]);

  // Polling, only start when conversation is selected AND auth is ready
  useEffect(() => {
    if (!selectedConversation || !isAuthReady) return;

    const load = () => {
      loadMessages(selectedConversation.id);
    };

    load();

    pollingIntervalRef.current = setInterval(() => {
      if (selectedConversation && isAuthReady) {
        loadMessages(selectedConversation.id, true);
      }
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [selectedConversation, isAuthReady]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await chatApi.getConversations();
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string, isPolling = false) => {
    try {
      const response = await chatApi.getMessages(conversationId);
      if (response.success && response.data) {
        const userId = currentUserIdRef.current;

        if (!userId) {
          console.warn('loadMessages called before userId was ready — skipping');
          return;
        }

        const messagesWithOwn = response.data.map(msg => ({
          ...msg,
          isOwn: Number(msg.sender_id) === Number(userId),
        }));

        if (isPolling) {
          setMessages(prev => {
            // Create a map of existing messages
            const existingMap = new Map(prev.map(m => [String(m.id), m]));

            // Merge new messages with existing ones
            const merged = messagesWithOwn.map(msg => {
              const existing = existingMap.get(String(msg.id));
              return existing || msg;
            });

            // Check if there are new messages
            if (merged.length !== prev.length) {
              // Dispatch event for new unread messages
              const newUnreadCount = merged.filter(m => !m.isOwn && !m.read).length;
              if (newUnreadCount > 0) {
                window.dispatchEvent(new Event('messagesRead'));
              }
              return merged;
            }
            return prev;
          });

          loadConversations();
        } else {
          // Initial load - check for unread messages
          const hadUnread = messages.some(m => !m.isOwn && !m.read);
          const nowHasUnread = messagesWithOwn.some(m => !m.isOwn && !m.read);

          if (hadUnread && !nowHasUnread) {
            window.dispatchEvent(new Event('messagesRead'));
          }

          setMessages(messagesWithOwn);
        }
      }
    } catch (error) {
      if (!isPolling) {
        console.error('Failed to load messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return;

    const userId = currentUserIdRef.current;
    if (!userId) return;

    setSending(true);
    const messageText = messageInput.trim();
    setMessageInput('');

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessageWithDetails = {
      id: tempId,
      conversation_id: selectedConversation.id,
      sender_id: userId,
      receiver_id: selectedConversation.other_user_id,
      message: messageText,
      read: false,
      created_at: new Date().toISOString(),
      isOwn: true,
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await chatApi.sendMessage(
        selectedConversation.other_user_id,
        messageText
      );

      if (response.success) {
        setMessages(prev => prev.map(msg =>
          msg.id === tempId ? { ...response.data, isOwn: true } : msg
        ));

        setConversations(prev => prev.map(conv =>
          conv.id === selectedConversation.id
            ? { ...conv, last_message: messageText, last_message_time: new Date().toISOString() }
            : conv
        ));

        // Refresh unread count after sending
        window.dispatchEvent(new Event('messagesRead'));
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSearchParams({ conv: conversation.id });
    setConversations(prev => prev.map(conv =>
      conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
    ));
    // Dispatch event when opening a conversation to refresh badge
    window.dispatchEvent(new Event('messagesRead'));
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setSearchParams({});
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.other_user_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterType === 'unread') return matchesSearch && conv.unread_count > 0;
    return matchesSearch;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

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
                    {['all', 'unread'].map((filter) => (
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
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400 mt-1">Start a conversation from a product page</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => handleConversationSelect(conv)}
                        className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedConversation?.id === conv.id ? 'bg-red-50 dark:bg-gray-700' : ''
                          }`}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                            {conv.other_user_avatar ? (
                              <img src={conv.other_user_avatar} alt={conv.other_user_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {conv.other_user_name.charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {conv.other_user_name}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(conv.last_message_time)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">
                              {conv.last_message}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
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
                          onClick={handleBack}
                          className="p-2 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                          {selectedConversation.other_user_avatar ? (
                            <img src={selectedConversation.other_user_avatar} alt={selectedConversation.other_user_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-bold">
                              {selectedConversation.other_user_name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                          {selectedConversation.other_user_name}
                        </h2>
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
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${message.isOwn ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${message.isOwn
                              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                              }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${message.isOwn ? 'text-red-100' : 'text-gray-500'}`}>
                              <span>{formatTime(message.created_at)}</span>
                              {message.isOwn && message.read && <CheckCheck className="w-3 h-3" />}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
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
                        disabled={!messageInput.trim() || sending}
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
                        {selectedConversation.other_user_avatar ? (
                          <img src={selectedConversation.other_user_avatar} alt={selectedConversation.other_user_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">
                              {selectedConversation.other_user_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {selectedConversation.other_user_name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        @{selectedConversation.other_user_name.toLowerCase().replace(/\s/g, '')}
                      </p>
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

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Heart,
  User,
  Menu,
  X,
  LogIn,
  UserPlus,
  MessageSquare,
  Bell,
  LogOut,
  Store,
  Home,
  ShoppingCart,
  Grid,
  Mail,
  Plus,
  Package,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { wishlistApi, chatApi } from "@/lib/api";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  // Load wishlist count
  useEffect(() => {
    const loadWishlistCount = async () => {
      if (!user) {
        setWishlistCount(0);
        return;
      }
      try {
        const response = await wishlistApi.getWishlist();
        if (response.success && response.data) {
          setWishlistCount(response.data.length);
        }
      } catch (error) {
        //
      }
    };

    loadWishlistCount();

    const handleWishlistUpdate = () => {
      loadWishlistCount();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [user]);

  // Load unread message count for messaging icon
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user) {
        setUnreadMessageCount(0);
        return;
      }
      try {
        const response = await chatApi.getTotalUnreadCount();
        if (response.success && response.data) {
          setUnreadMessageCount(response.data.total);
        }
      } catch (error) {
        //
      }
    };

    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 10000);

    const handleMessagesRead = () => {
      loadUnreadCount();
    };

    window.addEventListener("messagesRead", handleMessagesRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener("messagesRead", handleMessagesRead);
    };
  }, [user]);

  // Load unread notification count
  useEffect(() => {
    const loadUnreadNotificationCount = async () => {
      if (!user) {
        setUnreadNotificationCount(0);
        return;
      }
      try {
        const response = await chatApi.getConversations();
        if (response.success && response.data) {
          const total = response.data.reduce((sum, conv) => sum + conv.unread_count, 0);
          setUnreadNotificationCount(total);
        }
      } catch (error) {
        //
      }
    };

    loadUnreadNotificationCount();

    const handleMessagesRead = () => {
      loadUnreadNotificationCount();
    };

    window.addEventListener("messagesRead", handleMessagesRead);

    return () => {
      window.removeEventListener("messagesRead", handleMessagesRead);
    };
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems = [
    { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Shop", path: "/shop", icon: <ShoppingCart className="w-4 h-4" /> },
    { name: "Contact", path: "/contact", icon: <Mail className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isHome = location.pathname === "/";

  const profileMenuItems = [
    { name: "My Profile", icon: <User className="w-4 h-4" />, action: () => navigate("/profile") },
    {
      name: "My Listings",
      icon: <Package className="w-4 h-4" />,
      action: () => navigate("/my-listings"),
    },
    {
      name: "Seller Dashboard",
      icon: <Store className="w-4 h-4" />,
      action: () => navigate("/seller/dashboard"),
    },
    {
      name: "My Wishlist",
      icon: <Heart className="w-4 h-4" />,
      action: () => navigate("/wishlist"),
    },
    { name: "Logout", icon: <LogOut className="w-4 h-4" />, action: () => logout() },
  ];

  // Add admin items conditionally
  if (user?.role === "admin") {
    profileMenuItems.push({
      name: "Manage Categories",
      icon: <Grid className="w-4 h-4" />,
      action: () => navigate("/admin/categories"),
    });
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          isScrolled ? "glass shadow-medium backdrop-blur-lg bg-background/80" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between lg:gap-8">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <span className="text-xl font-bold font-heading text-[#FF0000]">PhoeniX</span>
              <img src="/phoenix-logo.svg" alt="Phoenix Mall Logo" className="w-7 h-7" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <div key={item.name} className="relative">
                  <a
                    href={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground/80 hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </a>
                </div>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* Auth Buttons (only on Home) */}
              {isHome && (
                <div className="hidden md:flex items-center space-x-2">
                  {user ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-foreground">Welcome, {user.first_name}</span>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/login")}
                        className="flex items-center space-x-1.5 rounded-full px-4"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Login</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate("/register")}
                        className="flex items-center space-x-1.5 rounded-full px-4 bg-gradient-to-r from-primary to-purple-600"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Sign Up</span>
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Icons Row */}
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {/* SELL BUTTON */}
                    <button
                      className="relative p-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg transition-all cursor-pointer hidden md:block"
                      onClick={() => navigate("/sell")}
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    {/* Messaging */}
                    <button
                      className="relative p-2 rounded-full transition-all duration-200 cursor-pointer hover:bg-accent hidden md:block"
                      onClick={() => navigate("/messaging", { state: { from: location.pathname } })}
                    >
                      <MessageSquare className="w-5 h-5 text-foreground/80" />
                      {unreadMessageCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-5 flex items-center justify-center font-medium px-1.5">
                          {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications */}
                    <button
                      className="relative p-2 rounded-full transition-all duration-200 cursor-pointer hover:bg-accent hidden md:block"
                      onClick={() => navigate("/notifications")}
                    >
                      <Bell className="w-5 h-5 text-foreground/80" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-5 flex items-center justify-center font-medium px-1.5">
                          {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                        </span>
                      )}
                    </button>

                    {/* Wishlist */}
                    <button
                      className="relative p-2 rounded-full hover:bg-accent cursor-pointer"
                      onClick={() => navigate("/wishlist")}
                    >
                      <Heart className="w-5 h-5 text-foreground/80" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full min-w-[18px] h-5 flex items-center justify-center font-medium px-1.5">
                          {wishlistCount > 99 ? "99+" : wishlistCount}
                        </span>
                      )}
                    </button>

                    {/* User Dropdown */}
                    <div
                      className="relative"
                      onMouseEnter={() => setIsProfileMenuOpen(true)}
                      onMouseLeave={() => setIsProfileMenuOpen(false)}
                    >
                      <button className="p-2 rounded-full hover:bg-accent cursor-pointer">
                        <User className="w-5 h-5 text-foreground/80" />
                      </button>

                      {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl p-2 z-50 overflow-hidden">
                          <div className="relative space-y-1">
                            <div className="px-3 py-2 border-b border-border/50">
                              <p className="font-medium text-sm">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>

                            {profileMenuItems.map((item) => (
                              <div
                                key={item.name}
                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent cursor-pointer rounded-md text-sm group"
                                onClick={item.action}
                              >
                                <div className="text-foreground/80 group-hover:text-white transition-colors">
                                  {item.icon}
                                </div>
                                <span className="group-hover:text-white transition-colors">
                                  {item.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Show only wishlist for non-logged in users on non-home pages
                  !isHome && (
                    <button
                      className="relative p-2 rounded-full hover:bg-accent cursor-pointer"
                      onClick={() => navigate("/wishlist")}
                    >
                      <Heart className="w-5 h-5 text-foreground/80" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full min-w-[18px] h-5 flex items-center justify-center font-medium px-1.5">
                          {wishlistCount > 99 ? "99+" : wishlistCount}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden relative z-[200]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5 text-gray-700" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-700" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="fixed top-0 right-0 w-80 h-full bg-background border-l border-border/50 shadow-2xl z-[200] lg:hidden overflow-y-auto transition-transform duration-300 ease-in-out transform translate-x-0">
                  <div className="flex flex-col h-full p-6 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          PhoeniX Mall
                        </span>
                        <img src="/phoenix-logo.svg" alt="Phoenix Mall Logo" className="w-8 h-8" />
                      </div>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-accent"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col space-y-3">
                      {navigationItems.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium ${
                            isActive(item.path)
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-accent text-foreground/80"
                          }`}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>

                    {user && (
                      <div className="pt-4 border-t border-border/50">
                        <button
                          onClick={() => {
                            navigate("/sell");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Sell an Item</span>
                        </button>
                      </div>
                    )}

                    {!user && (
                      <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate("/login");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </Button>
                        <Button
                          onClick={() => {
                            navigate("/register");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-primary to-purple-600"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Sign Up
                        </Button>
                      </div>
                    )}

                    {user && (
                      <div className="pt-4 border-t border-border/50">
                        <div className="px-3 py-2">
                          <p className="font-medium text-sm">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex flex-col space-y-2 mt-3">
                          {profileMenuItems.map((item) => (
                            <button
                              key={item.name}
                              onClick={() => {
                                item.action();
                                setIsMobileMenuOpen(false);
                              }}
                              className="flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent rounded-md"
                            >
                              {item.icon}
                              <span>{item.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

export default Header;

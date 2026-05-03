import React, { useState, useEffect, useRef } from "react";
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
  HelpCircle,
  Settings,
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

  // Refs for profile menu
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

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

  // Load unread message count
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

  // Handle click outside for profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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
    {
      name: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
      action: () => navigate("/messaging"),
    },
    {
      name: "Settings",
      icon: <Settings className="w-4 h-4" />,
      action: () => navigate("/settings"),
    },
    {
      name: "Help Center",
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => navigate("/help"),
    },
    { name: "Logout", icon: <LogOut className="w-4 h-4" />, action: () => logout() },
  ];

  // Add admin items conditionally
  if (user?.role === "admin") {
    profileMenuItems.unshift({
      name: "Manage Categories",
      icon: <Grid className="w-4 h-4" />,
      action: () => navigate("/admin/categories"),
    });
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-md border-b border-border/50"
            : "bg-background/80 backdrop-blur-sm"
        }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between lg:gap-8">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <img src="/phoenix-logo.svg" alt="Phoenix Mall Logo" className="w-8 h-8" />
              <span className="text-xl font-bold font-heading" style={{ color: "#FF0000" }}>
                PhoeniX
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground/70 hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Auth Buttons */}
              {!user && (
                <div className="hidden md:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="rounded-full"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/register")}
                    className="rounded-full bg-[#FF0000] hover:bg-[#CC0000] text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Icons Row */}
              <div className="flex items-center space-x-1">
                {user ? (
                  <>
                    {/* Sell Button */}
                    <button
                      className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium hover:shadow-lg transition-all"
                      onClick={() => navigate("/sell")}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Sell</span>
                    </button>

                    {/* Messaging */}
                    <button
                      className="relative p-2 rounded-full hover:bg-accent transition-colors"
                      onClick={() => navigate("/messaging")}
                    >
                      <MessageSquare className="w-5 h-5 text-foreground/70" />
                      {unreadMessageCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center px-1">
                          {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications */}
                    <button
                      className="relative p-2 rounded-full hover:bg-accent transition-colors"
                      onClick={() => navigate("/notifications")}
                    >
                      <Bell className="w-5 h-5 text-foreground/70" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center px-1">
                          {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                        </span>
                      )}
                    </button>

                    {/* Wishlist */}
                    <button
                      className="relative p-2 rounded-full hover:bg-accent transition-colors"
                      onClick={() => navigate("/wishlist")}
                    >
                      <Heart className="w-5 h-5 text-foreground/70" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center px-1">
                          {wishlistCount > 99 ? "99+" : wishlistCount}
                        </span>
                      )}
                    </button>

                    {/* User Dropdown */}
                    <div className="relative">
                      <button
                        ref={profileButtonRef}
                        className="p-2 rounded-full hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        aria-label="User menu"
                      >
                        <User className="w-5 h-5 text-foreground/70" />
                      </button>

                      {isProfileMenuOpen && (
                        <div
                          ref={profileMenuRef}
                          className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-border/50">
                            <p className="font-semibold text-sm">
                              {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                          </div>
                          <div className="py-1 max-h-[70vh] overflow-y-auto">
                            {profileMenuItems.map((item) => (
                              <button
                                key={item.name}
                                onClick={() => {
                                  item.action();
                                  setIsProfileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                              >
                                <span className="text-muted-foreground">{item.icon}</span>
                                <span>{item.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Show wishlist for non-logged in users
                  !isHome && (
                    <button
                      className="relative p-2 rounded-full hover:bg-accent transition-colors"
                      onClick={() => navigate("/wishlist")}
                    >
                      <Heart className="w-5 h-5 text-foreground/70" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-4 flex items-center justify-center px-1">
                          {wishlistCount > 99 ? "99+" : wishlistCount}
                        </span>
                      )}
                    </button>
                  )
                )}

                {/* Mobile Menu Toggle */}
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-background z-50 lg:hidden shadow-2xl overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <img src="/phoenix-logo.svg" alt="Phoenix Mall Logo" className="w-8 h-8" />
                  <span className="text-xl font-bold" style={{ color: "#FF0000" }}>
                    PhoeniX
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Section for Mobile */}
              {user && (
                <div className="p-4 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Navigation */}
              <div className="flex-1 py-4">
                <div className="px-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    Menu
                  </p>
                  {navigationItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-accent"
                      }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>

                {user && (
                  <>
                    {/* Sell Button Mobile */}
                    <div className="px-4 mt-4">
                      <button
                        onClick={() => {
                          navigate("/sell");
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Sell an Item</span>
                      </button>
                    </div>

                    {/* Mobile Menu Items */}
                    <div className="px-4 mt-6 space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                        Account
                      </p>
                      {profileMenuItems.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => {
                            item.action();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left hover:bg-accent transition-colors"
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {!user && (
                  <div className="px-4 mt-6 space-y-3">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-xl hover:bg-accent transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/register");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium"
                      style={{ backgroundColor: "#FF0000" }}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <button onClick={() => navigate("/help")} className="hover:text-foreground">
                    Help
                  </button>
                  <button onClick={() => navigate("/contact")} className="hover:text-foreground">
                    Contact
                  </button>
                  <button onClick={() => navigate("/terms")} className="hover:text-foreground">
                    Terms
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;

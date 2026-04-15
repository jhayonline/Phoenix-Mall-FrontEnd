import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingBag, User, Menu, X, LogIn, UserPlus,
  MessageSquare, Bell, Heart, Megaphone, PlusCircle,
  LogOut, Settings, BarChart2, MessageCircle, Store,
  Home, ShoppingCart, Grid, Info, Mail, Plus
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cartApi } from '@/lib/api';

interface CartItem {
  id: string;
  pid: string;
  title: string;
  price: number;
  quantity: number;
  condition?: string | null;
  location?: string | null;
  seller_id: number;
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user and logout function from AuthContext
  const { user, logout } = useAuth();

  // Load cart count from localStorage
  useEffect(() => {
    const loadCartCount = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }
      try {
        const response = await cartApi.getCart();
        if (response.success && response.data) {
          const totalItems = response.data.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        }
      } catch (error) {
        console.error('Failed to load cart count:', error);
      }
    };

    loadCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Shop', path: '/shop', icon: <ShoppingCart className="w-4 h-4" /> },
    { name: 'Categories', path: '/categories', icon: <Grid className="w-4 h-4" /> },
    { name: 'About', path: '/about', icon: <Info className="w-4 h-4" /> },
    { name: 'Contact', path: '/contact', icon: <Mail className="w-4 h-4" /> }
  ];

  const isActive = (path: string) => location.pathname === path;
  const isHome = location.pathname === '/';

  const profileMenuItems = [
    { name: 'My Profile', icon: <User className="w-4 h-4" />, action: () => navigate('/profile') },
    { name: 'My Listings', icon: <Store className="w-4 h-4" />, action: () => navigate('/profile/listings') },
    { name: 'My Orders', icon: <ShoppingBag className="w-4 h-4" />, action: () => navigate('/orders') },
    { name: 'Settings', icon: <Settings className="w-4 h-4" />, action: () => navigate('/settings') },
    { name: 'Logout', icon: <LogOut className="w-4 h-4" />, action: () => logout() },
  ];

  // Icon variants for animation
  const iconVariants = {
    hover: {
      scale: 1.15,
      rotate: 5,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  // Badge animation
  const badgeVariants = {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: { type: "spring", stiffness: 500, damping: 10 }
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'glass shadow-medium backdrop-blur-lg bg-background/80'
          : 'bg-transparent'
          }`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between lg:gap-8">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                PhoeniX Mall
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <motion.div
                  key={item.name}
                  className="relative"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <motion.a
                    href={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${isActive(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    variants={{
                      hover: { y: -2 },
                      tap: { y: 0 }
                    }}
                  >
                    <motion.span
                      variants={{
                        hover: { scale: 1.1 },
                        tap: { scale: 0.95 }
                      }}
                    >
                      {item.icon}
                    </motion.span>
                    <span>{item.name}</span>
                  </motion.a>

                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.div>
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
                      <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/login')}
                          className="flex items-center space-x-1.5 rounded-full px-4"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Login</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                        <Button
                          size="sm"
                          onClick={() => navigate('/register')}
                          className="flex items-center space-x-1.5 rounded-full px-4 bg-gradient-to-r from-primary to-purple-600"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Sign Up</span>
                        </Button>
                      </motion.div>
                    </>
                  )}
                </div>
              )}

              {/* Icons Row - Show on ALL pages when user is logged in */}
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {/* SELL BUTTON - Plus icon for posting products */}
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="relative p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg transition-all cursor-pointer hidden md:block"
                      onClick={() => navigate('/sell')}
                    >
                      <Plus className="w-5 h-5" />
                    </motion.div>

                    {/* Messaging */}
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="relative p-2 rounded-full transition-all duration-200 cursor-pointer group hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hidden md:block"
                      onClick={() => navigate('/messages')}
                    >
                      <MessageSquare className="w-5 h-5 text-foreground/80 group-hover:text-white transition-colors" />
                      <motion.span
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
                      >
                        2
                      </motion.span>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="relative p-2 rounded-full hover:bg-accent cursor-pointer group hidden md:block"
                      onClick={() => navigate('/notifications')}
                    >
                      <Bell className="w-5 h-5 text-foreground/80 group-hover:text-white transition-colors" />
                      <motion.span
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                        className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium"
                      >
                        5
                      </motion.span>
                    </motion.div>

                    {/* Wish List */}
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="p-2 rounded-full hover:bg-accent cursor-pointer group hidden md:block"
                      onClick={() => navigate('/wish-list')}
                    >
                      <Heart className="w-5 h-5 text-foreground/80 group-hover:text-white transition-colors" />
                    </motion.div>

                    {/* Ads */}
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="p-2 rounded-full hover:bg-accent cursor-pointer group hidden md:block"
                      onClick={() => navigate('/ads')}
                    >
                      <Megaphone className="w-5 h-5 text-foreground/80 group-hover:text-white transition-colors" />
                    </motion.div>

                    {/* Cart */}
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="relative p-2 rounded-full hover:bg-accent cursor-pointer group"
                      onClick={() => navigate('/shopping-bag')}
                    >
                      <ShoppingBag className="w-5 h-5 text-foreground/80 group-hover:text-white transition-colors" />
                      <motion.span
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                        className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                      >
                        {cartCount}
                      </motion.span>
                    </motion.div>

                    {/* User Dropdown */}
                    <div
                      className="relative"
                      onMouseEnter={() => setIsProfileMenuOpen(true)}
                      onMouseLeave={() => setIsProfileMenuOpen(false)}
                    >
                      <motion.div
                        variants={iconVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="p-2 rounded-full hover:bg-accent cursor-pointer group"
                      >
                        <User className="w-5 h-5 text-foreground/80 group-hover:text-white transition-colors" />
                      </motion.div>

                      <AnimatePresence>
                        {isProfileMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl p-2 z-50 overflow-hidden"
                            style={{ originY: 0, originX: 1 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />

                            <div className="relative space-y-1">
                              <div className="px-3 py-2 border-b border-border/50">
                                <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>

                              {profileMenuItems.map((item, index) => (
                                <motion.div
                                  key={item.name}
                                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent cursor-pointer rounded-md text-sm group"
                                  onClick={item.action}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{
                                    opacity: 1,
                                    x: 0,
                                    transition: {
                                      delay: index * 0.05,
                                      type: "spring",
                                      stiffness: 500
                                    }
                                  }}
                                  whileHover={{ x: 4 }}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    className="text-foreground/80 group-hover:text-white transition-colors"
                                  >
                                    {item.icon}
                                  </motion.div>
                                  <span className="group-hover:text-white transition-colors">{item.name}</span>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  // Show only cart for non-logged in users on non-home pages
                  !isHome && (
                    <motion.div
                      variants={iconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="relative p-2 rounded-full hover:bg-accent cursor-pointer group"
                      onClick={() => navigate('/shopping-bag')}
                    >
                      <ShoppingBag className="w-5 h-5 text-foreground/80 group-hover:text-white transition-colors" />
                      <motion.span
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                        className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
                      >
                        {cartCount}
                      </motion.span>
                    </motion.div>
                  )
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="lg:hidden"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-full"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu Panel */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />

                {/* Sidebar */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed top-0 right-0 w-80 h-full bg-background border-l border-border/50 shadow-2xl z-50 lg:hidden overflow-y-auto"
                  style={{ originX: 1 }}
                >
                  <div className="flex flex-col h-full p-6 space-y-8">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center space-x-2"
                      >
                        <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          PhoeniX Mall
                        </span>
                      </motion.div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-full hover:bg-accent"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex flex-col space-y-3">
                      {navigationItems.map((item) => (
                        <motion.button
                          key={item.name}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium ${isActive(item.path)
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-accent text-foreground/80'
                            }`}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Sell button in mobile menu */}
                    {user && (
                      <div className="pt-4 border-t border-border/50">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            navigate('/sell');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Sell an Item</span>
                        </motion.button>
                      </div>
                    )}

                    {/* Auth buttons in mobile menu */}
                    {!user && (
                      <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
                        <Button
                          variant="outline"
                          onClick={() => {
                            navigate('/login');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full"
                        >
                          <LogIn className="w-4 h-4 mr-2" />
                          Login
                        </Button>
                        <Button
                          onClick={() => {
                            navigate('/register');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-primary to-purple-600"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Sign Up
                        </Button>
                      </div>
                    )}

                    {/* User info if logged in */}
                    {user && (
                      <div className="pt-4 border-t border-border/50">
                        <div className="px-3 py-2">
                          <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
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
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile Search */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: isScrolled ? 1 : 0,
              height: isScrolled ? 'auto' : 0
            }}
            className="md:hidden mt-3 overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-full bg-background/80 backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  Truck,
  HeadphonesIcon,
  Star,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Search,
} from 'lucide-react';

import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HeroSection from '@/components/sections/HeroSection';
import CategoriesSection from '@/components/sections/CategoriesSection';
import ProductGrid from '@/components/sections/ProductGrid';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { productsApi, imagesApi } from '@/lib/api';
import type { ProductResponseData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  discount?: number;
  seller?: string;
}

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const searchRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchBar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load featured products
  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getProducts({ limit: 8, sort: 'newest' });

      if (response.success && response.data) {
        const productsWithDetails = await Promise.all(
          response.data.map(async (product) => {
            let primaryImage: string | undefined;

            try {
              const imagesResponse = await imagesApi.getImages(product.pid);
              if (imagesResponse.success && imagesResponse.data.length > 0) {
                const primaryImg = imagesResponse.data.find(img => img.is_primary);
                primaryImage = primaryImg?.image_url || imagesResponse.data[0]?.image_url;
              }
            } catch (error) {
              console.error('Failed to load images for product:', product.pid);
            }

            return {
              ...product,
              primaryImage,
              rating: 4.5,
              reviews: Math.floor(Math.random() * 200),
            };
          })
        );

        setFeaturedProducts(productsWithDetails);
      } else {
        // If no products, set empty array
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Failed to load featured products:', error);
      setFeaturedProducts([]);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Featured categories for quick navigation
  const featuredCategories = [
    { id: 'electronics', name: 'Electronics', icon: TrendingUp, count: 145 },
    { id: 'fashion', name: 'Fashion', icon: Sparkles, count: 289 },
    { id: 'home-living', name: 'Home & Living', icon: Award, count: 167 },
    { id: 'phones', name: 'Phones', icon: Star, count: 98 },
    { id: 'vehicles', name: 'Vehicles', icon: TrendingUp, count: 134 },
    { id: 'okada-spares', name: 'Okada Spares', icon: Clock, count: 76 },
  ];

  // Trust badges
  const trustBadges = [
    { icon: Shield, title: 'Secure Payments', description: '100% secure payment processing' },
    { icon: Truck, title: 'Free Shipping', description: 'Free delivery on orders over GHS 500' },
    { icon: HeadphonesIcon, title: '24/7 Support', description: 'Round-the-clock customer service' },
    { icon: Award, title: 'Quality Guarantee', description: '30-day money-back guarantee' },
  ];

  // Featured brands
  const featuredBrands = [
    { name: 'Apple', logo: 'https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo.png', products: 67 },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Samsung_Orig_Wordmark_BLACK_RGB.png', products: 54 },
    { name: 'iPhone', logo: 'https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo.png', products: 45 },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Samsung_Orig_Wordmark_BLACK_RGB.png', products: 32 },
    { name: 'Tecno', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Samsung_Orig_Wordmark_BLACK_RGB.png', products: 28 },
    { name: 'Infinix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Samsung_Orig_Wordmark_BLACK_RGB.png', products: 24 },
  ];

  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Fashion Enthusiast',
      content: 'The quality of products here is exceptional. I\'ve been shopping for months and every purchase has exceeded my expectations.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Tech Reviewer',
      content: 'As someone who reviews tech products professionally, I can confidently say the electronics here are top-notch and fairly priced.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Interior Designer',
      content: 'The home decor selection is curated beautifully. I always find unique pieces that my clients love.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 4
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Fitness Coach',
      content: 'The sports equipment I purchased has held up perfectly through months of heavy use. Great durability!',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 5
    }
  ];

  // Render star ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "w-4 h-4",
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
        )}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Mobile Search Bar */}
      {isMobile && (
        <AnimatePresence>
          {showSearchBar && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              ref={searchRef}
              className="fixed top-16 left-0 right-0 z-40 bg-background p-4 border-b border-border shadow-md"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full w-full"
                  autoFocus
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <main className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* Trust Badges Section */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badge.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center p-4 md:p-6 rounded-xl bg-card shadow-soft hover:shadow-medium transition-shadow"
                  >
                    <div className="flex justify-center mb-3 md:mb-4">
                      <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
                        <Icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 md:mb-2 text-sm md:text-base">{badge.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{badge.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Categories Navigation */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3 md:mb-4">
                Shop by <span className="text-gradient">Category</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Explore our diverse range of categories to find exactly what you're looking for
              </p>
            </motion.div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              {featuredCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = `/shop?category=${category.id}`}
                    className={cn(
                      "p-3 md:p-4 rounded-xl text-center transition-all duration-300 flex flex-col items-center bg-card text-foreground shadow-soft hover:shadow-medium"
                    )}
                  >
                    <div className="flex justify-center mb-2 md:mb-3">
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="font-semibold text-xs md:text-sm mb-1">{category.name}</h3>
                    <p className="text-[10px] md:text-xs opacity-70">{category.count}+</p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Products Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12"
            >
              <div className="inline-flex items-center px-3 py-1 md:px-4 md:py-2 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Trending Now
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3 md:mb-4">
                Featured <span className="text-gradient">Products</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Discover our most popular and trending products loved by thousands of customers
              </p>
            </motion.div>

            <ProductGrid
              products={featuredProducts}
              viewMode="3"
              onViewModeChange={() => { }}
              loading={loading}
            />
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3 md:mb-4">
                What Our <span className="text-gradient">Customers</span> Say
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it - hear from our satisfied customers
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-card p-6 rounded-2xl shadow-soft hover:shadow-medium transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-4">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Brands Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3 md:mb-4">
                Shop by <span className="text-gradient">Brand</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Explore products from world-renowned brands you know and trust
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
              {featuredBrands.map((brand, index) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group text-center cursor-pointer bg-card p-4 rounded-xl shadow-soft hover:shadow-medium transition-all"
                >
                  <div className="bg-background rounded-xl p-4 mb-3 h-20 flex items-center justify-center">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{brand.name}</h3>
                  <p className="text-xs text-muted-foreground">{brand.products}+ products</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center mt-8 md:mt-12"
            >
              <Button className="bg-card text-foreground border border-border hover:bg-muted px-6 py-3 group">
                View All Brands
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 md:py-16 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3 md:mb-4 text-foreground">
                  Stay <span className="text-gradient">Updated</span>
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8">
                  Subscribe to our newsletter and be the first to know about new products,
                  exclusive deals, and special promotions
                </p>

                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button className="hero-button whitespace-nowrap py-3">
                    Subscribe
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  By subscribing, you agree to our Privacy Policy and consent to receive
                  updates from our company.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />

      {/* Floating Action Button for Mobile Search */}
      {isMobile && !showSearchBar && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed bottom-20 right-4 z-30 p-3 bg-primary text-primary-foreground rounded-full shadow-lg md:hidden"
          onClick={() => setShowSearchBar(true)}
        >
          <Search className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

export default HomePage;

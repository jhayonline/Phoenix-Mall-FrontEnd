import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Shield,
  MapPin,
  HeadphonesIcon,
  MessageCircle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import HeroSection from '@/components/sections/HeroSection';
import CategoriesSection from '@/components/sections/CategoriesSection';
import ProductGrid from '@/components/sections/ProductGrid';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { productsApi, imagesApi } from '@/lib/api';
import type { ProductResponseData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ProductWithDetails extends ProductResponseData {
  primaryImage?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  discount?: number;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<string>('3');
  const { toast } = useToast();

  // Load featured products on mount
  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    setLoading(true);
    try {
      // Get newest products for featured section
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
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Failed to load featured products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Trust badges
  const trustBadges = [
    {
      icon: MapPin,
      title: 'Local Meetups',
      description: 'Connect with sellers in Accra, Kumasi, and across Ghana'
    },
    {
      icon: MessageCircle,
      title: 'Direct Chat',
      description: 'Communicate directly with sellers via messaging'
    },
    {
      icon: Shield,
      title: 'Safe Trading Tips',
      description: 'Follow our safety guidelines for secure transactions'
    },
    {
      icon: HeadphonesIcon,
      title: 'Seller Support',
      description: 'We help resolve disputes between buyers and sellers'
    },
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative">
        {/* Hero Section */}
        <HeroSection />

        {/* Trust Badges Section */}
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badge.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{badge.title}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <CategoriesSection />

        {/* Featured Products Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending Now
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Featured <span className="text-gradient">Products</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our most popular and trending products loved by thousands of customers
              </p>
            </motion.div>

            <ProductGrid
              products={featuredProducts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              loading={loading}
            />
          </div>
        </section>

        {/* Featured Brands Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                Shop by <span className="text-gradient">Brand</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore products from world-renowned brands you know and trust
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {featuredBrands.map((brand, index) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group text-center cursor-pointer"
                >
                  <div className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-large transition-all duration-300 mb-4">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-12 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{brand.name}</h3>
                  <p className="text-sm text-muted-foreground">{brand.products} products</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Button className="hero-button-outline px-8 py-3 group">
                View All Brands
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-20 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                  Stay <span className="text-gradient">Updated</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Subscribe to our newsletter and be the first to know about new products,
                  exclusive deals, and special promotions
                </p>

                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button className="hero-button whitespace-nowrap">
                    Subscribe
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-4">
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
    </div>
  );
};

export default Index;

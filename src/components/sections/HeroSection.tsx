import React, { useState, useEffect } from "react";
import { ArrowRight, Shield, Store, Users, TrendingUp, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      title: "Start Selling Today",
      subtitle: "Join Thousands of Sellers",
      description:
        "Turn your passion into profit. List your products and reach millions of buyers across the country.",
      cta: "Start Selling",
      secondaryCta: "Browse Products",
      badge: "For Sellers",
      badgeIcon: Store,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=600&fit=crop",
    },
    {
      title: "Discover Unique Finds",
      subtitle: "Shop from Local Sellers",
      description:
        "From handmade crafts to electronics, find everything you need directly from trusted sellers in your community.",
      cta: "Start Shopping",
      secondaryCta: "View Categories",
      badge: "For Buyers",
      badgeIcon: Users,
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=600&fit=crop",
    },
    {
      title: "Top Rated Sellers",
      subtitle: "Shop with Confidence",
      description:
        "Connect with verified sellers who have earned the trust of thousands of buyers through quality products and service.",
      cta: "Explore Sellers",
      secondaryCta: "Learn More",
      badge: "Trusted Marketplace",
      badgeIcon: Sparkles,
      image: "https://images.unsplash.com/photo-1556741533-6e6a4bd8b49c?w=1200&h=600&fit=crop",
    },
  ];

  // Auto-slide functionality with very light transition
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 150);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSlideChange = (index: number) => {
    if (index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[650px] flex items-center overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
        {/* Slides Container */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Slide Content */}
            <div
              key={currentSlide}
              className="space-y-6"
              style={{
                opacity: isTransitioning ? 0.7 : 1,
                transform: isTransitioning ? "translateY(4px)" : "translateY(0)",
                transition: "opacity 150ms ease-out, transform 150ms ease-out",
              }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium">
                {(() => {
                  const BadgeIcon = slides[currentSlide].badgeIcon;
                  return <BadgeIcon className="w-4 h-4" />;
                })()}
                <span>{slides[currentSlide].badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight">
                {slides[currentSlide].title}
                <span className="block text-gradient mt-2">{slides[currentSlide].subtitle}</span>
              </h1>

              {/* Description */}
              <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                {slides[currentSlide].description}
              </p>

              {/* Marketplace Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="w-4 h-4 text-primary" />
                  <span>1,000+ Sellers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Buyer Protection</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>50k+ Buyers</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 transition-all duration-300"
                >
                  {slides[currentSlide].cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-muted text-base px-6 transition-all duration-300"
                >
                  <Eye className="mr-2 w-4 h-4" />
                  {slides[currentSlide].secondaryCta}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image with marketplace-focused badges */}
          <div className="relative">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              style={{
                opacity: isTransitioning ? 0.8 : 1,
                transition: "opacity 150ms ease-out",
              }}
            >
              {/* Main Image */}
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="w-full h-auto object-cover transition-all duration-300"
                style={{ aspectRatio: "16/9" }}
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

              {/* Floating Badges */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs font-semibold">Multi-Vendor</p>
                    <p className="text-xs text-muted-foreground">Shop from anywhere</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-white">Active sellers daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center justify-center gap-2 mt-8 md:mt-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSlideChange(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "bg-primary w-8"
                  : "bg-muted-foreground/30 w-4 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

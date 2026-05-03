import React, { useState, useEffect } from "react";

const HeroSection: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    {
      url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRhvkKSsL9etHe0tKms2AC0dUAtfnS7Vsj8I1SWQBFhgAgunkyY924snoKwhi1Wk4P4k8mrTvSxtAUYTG-PcLhDL8EplSUsu3aIAaLRQ&s=10?w=800&h=600",
      alt: "",
    },
    {
      url: "https://cloudcommercepro.com/wp-content/uploads/2020/09/marketplace-hero.jpg",
      alt: "",
    },
    {
      url: "https://www.coursevox.com/store/1167/6179a579f91da881be2c758b_morningbrewShVipPImS6kunsplash_5c8728bacb20daf02414ecbdf89e0418_2000-1699777146680.png",
      alt: "",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Background Pattern - Subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-bl from-red-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-gradient-to-tr from-orange-50/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
          {/* Left Column - Content */}
          <div className="flex-1 max-w-2xl">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm mb-6">
              <span className="text-xs font-medium text-gray-700">Trusted Marketplace</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="text-xs text-gray-500">100+ Active Sellers</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Ghana's Largest
              <span className="block text-red-600 mt-2">Online Marketplace</span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mt-6 max-w-xl">
              Connect with thousands of trusted sellers. Find everything from electronics to
              fashion, vehicles to real estate all in one place.
            </p>
          </div>

          {/* Right Column - Hero Image */}
          <div className="flex-1">
            <div className="relative">
              {/* Main Image Card */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl transition-all duration-500 ease-in-out">
                <img
                  src={images[currentImageIndex].url}
                  alt={images[currentImageIndex].alt}
                  className="w-full h-auto object-cover transition-opacity duration-500"
                  style={{ aspectRatio: "4/3" }}
                />
                {/* Overlay gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentImageIndex
                        ? "w-6 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  HeadphonesIcon,
  ArrowUp,
  MessageCircle,
  Heart,
  Shield,
  Clock,
  Send,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const footerLinks = {
    "Customer Care": [
      { name: "Contact Us", path: "/contact" },
      { name: "Safety Tips", path: "/safety-tips" },
      { name: "FAQ", path: "/faq" },
      { name: "Report an Issue", path: "/report" },
    ],
    Legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Cookie Policy", path: "/cookies" },
      { name: "Seller Guidelines", path: "/seller-guidelines" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-auto bg-gradient-to-br from-red-600 via-red-700 to-amber-600 text-white">
      <div className="container mx-auto px-4">
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-white">PhoeniX Mall</span>
              </div>

              <p className="text-red-100 leading-relaxed">
                Ghana's premier online marketplace connecting buyers and sellers across the nation.
                Shop safely with our trusted community.
              </p>

              {/* Newsletter Subscription */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Newsletter
                </h4>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-300" />
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/10 border-red-400/30 text-white placeholder:text-red-200 focus:border-white focus:ring-white"
                      required
                    />
                  </div>
                  <Button type="submit" className="bg-white text-red-600 hover:bg-red-50">
                    <span>Subscribe</span>
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
                {subscribed && (
                  <p className="text-sm text-green-300 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Thank you for subscribing!
                  </p>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Follow Us</h4>
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5 text-red-100 hover:text-white transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="lg:col-span-2 space-y-5">
                <h3 className="font-semibold text-lg text-white">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.path}
                        className="text-red-100 hover:text-white transition-colors flex items-center group"
                      >
                        <ChevronRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:translate-x-1 transition-transform">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-5">
              <h3 className="font-semibold text-lg text-white">Contact Us</h3>
              <div className="space-y-4">
                <a
                  href="mailto:team@phoenixmall.com"
                  className="flex items-start space-x-3 text-red-100 hover:text-white transition-colors group"
                >
                  <Mail className="w-5 h-5 mt-0.5 text-white flex-shrink-0" />
                  <span className="break-all">team@phoenixmall.com</span>
                </a>
                <a
                  href="tel:+233532423078"
                  className="flex items-start space-x-3 text-red-100 hover:text-white transition-colors group"
                >
                  <Phone className="w-5 h-5 mt-0.5 text-white flex-shrink-0" />
                  <span>+233 53 242 3078</span>
                </a>
                <div className="flex items-start space-x-3 text-red-100">
                  <MapPin className="w-5 h-5 mt-0.5 text-white flex-shrink-0" />
                  <span>Accra, Ghana</span>
                </div>
              </div>

              {/* Working Hours */}
              <div className="pt-4">
                <div className="flex items-center gap-2 text-sm text-red-200">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Support Available: 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-red-200">© 2026 PhoeniX Mall. All rights reserved.</div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-red-200">
                <MapPin className="w-3 h-3" />
                Local Meetups
              </span>
              <span className="w-1 h-1 bg-white/30 rounded-full hidden sm:block" />
              <span className="flex items-center gap-1 text-red-200">
                <MessageCircle className="w-3 h-3" />
                Direct Chat
              </span>
              <span className="w-1 h-1 bg-white/30 rounded-full hidden sm:block" />
              <span className="flex items-center gap-1 text-red-200">
                <Shield className="w-3 h-3" />
                Safe Transactions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-white text-red-600 rounded-full shadow-lg z-50 hover:bg-red-50 transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
};

export default Footer;

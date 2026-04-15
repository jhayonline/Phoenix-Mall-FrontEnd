import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { ShoppingBag as BagIcon, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cartApi, imagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface CartItemWithDetails {
  id: string;
  product_id: string;
  product_pid: string;
  title: string;
  price: number;
  quantity: number;
  image_url?: string;
  condition?: string | null;
  location?: string | null;
  inStock?: boolean;
}

const ShoppingBag = () => {
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('free');
  const { toast } = useToast();
  const { user } = useAuth();

  // Load cart from backend
  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await cartApi.getCart();
      if (response.success && response.data) {
        // Get images for each cart item
        const itemsWithImages = await Promise.all(
          response.data.map(async (item) => {
            let image_url = item.image_url;
            if (!image_url) {
              try {
                const imagesResponse = await imagesApi.getImages(item.product_pid);
                if (imagesResponse.success && imagesResponse.data.length > 0) {
                  const primaryImg = imagesResponse.data.find(img => img.is_primary);
                  image_url = primaryImg?.image_url || imagesResponse.data[0]?.image_url;
                }
              } catch (error) {
                console.error('Failed to load image:', item.product_pid);
              }
            }
            return {
              ...item,
              image_url,
              inStock: true,
            };
          })
        );
        setCartItems(itemsWithImages);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (pid: string, delta: number) => {
    const item = cartItems.find(i => i.product_pid === pid);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);

    // Optimistic update
    setCartItems(prev =>
      prev.map(item =>
        item.product_pid === pid ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      await cartApi.updateQuantity(pid, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Revert on error
      loadCart();
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (pid: string) => {
    // Optimistic update
    setCartItems(prev => prev.filter(item => item.product_pid !== pid));

    try {
      await cartApi.removeItem(pid);
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
      // Revert on error
      loadCart();
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateShipping = () => {
    if (shippingMethod === 'free') return 0;
    if (shippingMethod === 'flat') return 49;
    if (shippingMethod === 'pickup') return 8;
    return 0;
  };

  const calculateVAT = (subtotal: number) => {
    return subtotal * 0.19;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const vat = calculateVAT(subtotal);
    return subtotal + shipping + vat;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const handleCheckout = () => {
    toast({
      title: "Coming Soon",
      description: "Checkout functionality will be available soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <BagIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items yet</p>
            <Link to="/shop">
              <Button className="bg-gray-900 hover:bg-gray-800">
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const vat = calculateVAT(subtotal);
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">Shopping Bag</h1>
        <p className="text-gray-500 mb-8">{cartItems.length} items in your cart</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.product_pid}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-xl shadow-soft overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No+Image'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/product/${item.product_pid}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                          </Link>
                          {item.condition && (
                            <p className="text-sm text-gray-500 mt-1">{item.condition}</p>
                          )}
                          {item.location && (
                            <p className="text-xs text-gray-400 mt-1">{item.location}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.product_pid)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            className="px-3 py-1 text-lg hover:bg-gray-50 transition-colors"
                            onClick={() => updateQuantity(item.product_pid, -1)}
                          >
                            –
                          </button>
                          <span className="px-4 min-w-[40px] text-center">{item.quantity}</span>
                          <button
                            className="px-3 py-1 text-lg hover:bg-gray-50 transition-colors"
                            onClick={() => updateQuantity(item.product_pid, 1)}
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.price)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>

                <div>
                  <span className="text-gray-600 block mb-2">Shipping</span>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value="free"
                          checked={shippingMethod === 'free'}
                          onChange={() => setShippingMethod('free')}
                          className="w-4 h-4 text-gray-900"
                        />
                        <span className="text-sm">Free Shipping</span>
                      </div>
                      <span className="text-sm text-gray-600">GHS 0</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value="flat"
                          checked={shippingMethod === 'flat'}
                          onChange={() => setShippingMethod('flat')}
                          className="w-4 h-4 text-gray-900"
                        />
                        <span className="text-sm">Flat Rate</span>
                      </div>
                      <span className="text-sm text-gray-600">GHS 49</span>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value="pickup"
                          checked={shippingMethod === 'pickup'}
                          onChange={() => setShippingMethod('pickup')}
                          className="w-4 h-4 text-gray-900"
                        />
                        <span className="text-sm">Local Pickup</span>
                      </div>
                      <span className="text-sm text-gray-600">GHS 8</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (19%)</span>
                  <span className="font-medium">{formatCurrency(vat)}</span>
                </div>

                <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 bg-gray-900 hover:bg-gray-800"
              >
                Proceed to Checkout
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ShoppingBag;

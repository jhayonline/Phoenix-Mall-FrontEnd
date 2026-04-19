import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, X, Image as ImageIcon, Loader2,
  ChevronRight, ChevronLeft, Check, FolderTree,
  Car, Bike, Gamepad2, PawPrint, Briefcase, Utensils,
  Building, Home, Laptop, Smartphone, Shirt,
  Gem, Sparkles, Baby, Tv, Sofa, Watch, Headphones,
  Camera, Package, Wrench, Code, Leaf, Apple, Dog, Cat,
  Fish, Bird, Rabbit, Store, Truck, Lightbulb, Microwave,
  ChefHat, Footprints, Diamond, Heart, SprayCan, Scissors,
  ToyBrick, Monitor, Cpu, Mouse, Shoe, Ring, Lipstick,
  Flower2, Droplet, Smile, Brush, Wand2, Sun, Feather
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { productsApi, categoriesApi, imagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  display_order: number;
  is_active: boolean;
  description: string | null;
}

const iconMap: Record<string, React.ReactNode> = {
  // Level 1 Categories
  'Mobility': <Car className="w-5 h-5" />,
  'Real Estate': <Building className="w-5 h-5" />,
  'Mobile Devices': <Smartphone className="w-5 h-5" />,
  'Computing & Electronics': <Monitor className="w-5 h-5" />,
  'Games': <Gamepad2 className="w-5 h-5" />,
  'Home & Living': <Home className="w-5 h-5" />,
  'Fashion & Style': <Shirt className="w-5 h-5" />,
  'Jewelry': <Gem className="w-5 h-5" />,
  'Beauty & Personal Care': <Flower2 className="w-5 h-5" />,
  'Baby & Kids': <Baby className="w-5 h-5" />,
  'Services': <Briefcase className="w-5 h-5" />,
  'Food & Agriculture': <Apple className="w-5 h-5" />,
  'Pets & Animals': <PawPrint className="w-5 h-5" />,

  // Level 2 - Mobility
  'Cars': <Car className="w-5 h-5" />,
  'Motorbikes': <Bike className="w-5 h-5" />,
  'Bicycles': <Bike className="w-5 h-5" />,

  // Level 2 - Real Estate
  'Rentals': <Home className="w-5 h-5" />,
  'Properties for Sale': <Building className="w-5 h-5" />,
  'Houses': <Home className="w-5 h-5" />,
  'Apartments': <Building className="w-5 h-5" />,
  'Hostels': <Building className="w-5 h-5" />,
  'Offices': <Building className="w-5 h-5" />,
  'Shops': <Store className="w-5 h-5" />,
  'Buildings': <Building className="w-5 h-5" />,

  // Level 2 - Mobile Devices
  'Smartphones': <Smartphone className="w-5 h-5" />,
  'Tablets': <Smartphone className="w-5 h-5" />,
  'Mobile Accessories': <Package className="w-5 h-5" />,
  'Smartwatches': <Watch className="w-5 h-5" />,

  // Level 2 - Computing & Electronics
  'Laptops': <Laptop className="w-5 h-5" />,
  'Desktop Computers': <Monitor className="w-5 h-5" />,
  'Monitors': <Monitor className="w-5 h-5" />,
  'Computer Components': <Cpu className="w-5 h-5" />,
  'Computer Accessories': <Mouse className="w-5 h-5" />,
  'System Units': <Cpu className="w-5 h-5" />,
  'Televisions': <Tv className="w-5 h-5" />,
  'Audio Equipment': <Headphones className="w-5 h-5" />,
  'Headphones': <Headphones className="w-5 h-5" />,
  'Cameras': <Camera className="w-5 h-5" />,

  // Level 2 - Games
  'Video Games': <Gamepad2 className="w-5 h-5" />,
  'Consoles & Controllers': <Gamepad2 className="w-5 h-5" />,
  'Board & Card Games': <Gamepad2 className="w-5 h-5" />,

  // Level 2 - Home & Living
  'Furniture': <Sofa className="w-5 h-5" />,
  'Lighting': <Lightbulb className="w-5 h-5" />,
  'Appliances': <Microwave className="w-5 h-5" />,
  'Cookware': <ChefHat className="w-5 h-5" />,
  'Kitchen Appliances': <Microwave className="w-5 h-5" />,
  'Home Appliances': <Tv className="w-5 h-5" />,

  // Level 2 - Fashion & Style
  'Men': <Shirt className="w-5 h-5" />,
  'Women': <Shirt className="w-5 h-5" />,
  'Kids': <Baby className="w-5 h-5" />,
  'Babies': <Baby className="w-5 h-5" />,
  'Clothing': <Shirt className="w-5 h-5" />,
  'Footwear': <Footprints className="w-5 h-5" />,
  'Accessories': <Watch className="w-5 h-5" />,

  // Level 2 - Jewelry
  'Rings & Earrings': <Diamond className="w-5 h-5" />,
  'Watches': <Watch className="w-5 h-5" />,
  'Necklaces': <Heart className="w-5 h-5" />,
  'Bracelets': <Heart className="w-5 h-5" />,
  'Bracelets & Bangles': <Heart className="w-5 h-5" />,
  'Cufflinks': <Gem className="w-5 h-5" />,
  'Beads': <Heart className="w-5 h-5" />,
  'Anklets': <Footprints className="w-5 h-5" />,

  // Level 2 - Beauty & Personal Care
  'Hair & Oral Care': <Scissors className="w-5 h-5" />,
  'Skincare': <Droplet className="w-5 h-5" />,
  'Fragrances': <SprayCan className="w-5 h-5" />,
  'Makeup': <Brush className="w-5 h-5" />,
  'Intimate Wellness': <Heart className="w-5 h-5" />,
  'Beauty Accessories': <Scissors className="w-5 h-5" />,

  // Level 2 - Baby & Kids
  'Fashion': <Baby className="w-5 h-5" />,
  'Games & Toys': <ToyBrick className="w-5 h-5" />,
  'Baby Food & Nutrition': <Baby className="w-5 h-5" />,
  'Baby Accessories': <Baby className="w-5 h-5" />,
  'Playground & Outdoor': <ToyBrick className="w-5 h-5" />,

  // Level 2 - Services
  'Home Services': <Wrench className="w-5 h-5" />,
  'Tech Services': <Code className="w-5 h-5" />,
  'Repair & Maintenance': <Wrench className="w-5 h-5" />,
  'Other Services': <Briefcase className="w-5 h-5" />,

  // Level 2 - Food & Agriculture
  'Preserved Food': <Package className="w-5 h-5" />,
  'Fresh Food': <Apple className="w-5 h-5" />,
  'Farm Produce': <Leaf className="w-5 h-5" />,
  'Agricultural Supplies': <Truck className="w-5 h-5" />,

  // Level 2 - Pets & Animals
  'Pet Accessories': <PawPrint className="w-5 h-5" />,
  'Pet Food & Feed': <Package className="w-5 h-5" />,
  'Cats': <Cat className="w-5 h-5" />,
  'Dogs': <Dog className="w-5 h-5" />,
  'Fish': <Fish className="w-5 h-5" />,
  'Birds': <Bird className="w-5 h-5" />,
  'Rabbits': <Rabbit className="w-5 h-5" />,
  'Other Animals': <PawPrint className="w-5 h-5" />,
};

const SellPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [currentLevelCategories, setCurrentLevelCategories] = useState<Category[]>([]);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'new',
    location: '',
    category_id: '',
    whatsapp_contact: true,
    phone_contact: false,
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCategories();
  }, [user]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAllCategories();
      if (response.success && response.data) {
        setAllCategories(response.data);
      }
    } catch (error) {
      //
    }
  };

  const openCategoryModal = () => {
    const level1Categories = allCategories.filter(cat => cat.level === 1);
    setCurrentLevelCategories(level1Categories);
    setCategoryBreadcrumb([]);
    setShowCategoryModal(true);
  };

  const handleCategorySelect = (category: Category) => {
    const hasChildren = allCategories.some(cat => cat.parent_id === category.id);

    if (hasChildren) {
      const nextLevelCategories = allCategories.filter(cat => cat.parent_id === category.id);
      setCurrentLevelCategories(nextLevelCategories);
      setCategoryBreadcrumb([...categoryBreadcrumb, category]);
    } else {
      setSelectedCategory(category);
      setFormData({ ...formData, category_id: category.id });
      setShowCategoryModal(false);
      toast({
        title: "Category Selected",
        description: `${categoryBreadcrumb.map(c => c.name).join(' → ')}${categoryBreadcrumb.length ? ' → ' : ''}${category.name}`,
      });
    }
  };

  const handleBack = () => {
    if (categoryBreadcrumb.length === 0) {
      const level1Categories = allCategories.filter(cat => cat.level === 1);
      setCurrentLevelCategories(level1Categories);
    } else {
      const newBreadcrumb = [...categoryBreadcrumb];
      newBreadcrumb.pop();
      setCategoryBreadcrumb(newBreadcrumb);

      if (newBreadcrumb.length === 0) {
        const level1Categories = allCategories.filter(cat => cat.level === 1);
        setCurrentLevelCategories(level1Categories);
      } else {
        const parentCategory = newBreadcrumb[newBreadcrumb.length - 1];
        const siblingCategories = allCategories.filter(cat => cat.parent_id === parentCategory.id);
        setCurrentLevelCategories(siblingCategories);
      }
    }
  };

  const handleReset = () => {
    const level1Categories = allCategories.filter(cat => cat.level === 1);
    setCurrentLevelCategories(level1Categories);
    setCategoryBreadcrumb([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...selectedImages, ...files].slice(0, 5);
    setSelectedImages(newImages);
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast({
        title: "Category Required",
        description: "Please select a category for your product",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const productResponse = await productsApi.createProduct({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        condition: formData.condition,
        location: formData.location,
        category_id: formData.category_id,
        whatsapp_contact: formData.whatsapp_contact,
        phone_contact: formData.phone_contact,
      });

      if (productResponse.success && productResponse.data) {
        const productPid = productResponse.data.pid;

        if (selectedImages.length > 0) {
          setUploadingImages(true);
          for (const image of selectedImages) {
            try {
              await imagesApi.upload(productPid, image);
            } catch (error) {
              //
            }
          }
        }

        toast({
          title: "Success!",
          description: "Your product has been listed successfully",
        });

        navigate(`/product/${productPid}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  const getCategoryPath = () => {
    if (!selectedCategory) return '';
    const path = [...categoryBreadcrumb, selectedCategory];
    return path.map(c => c.name).join(' → ');
  };

  const getCategoryIcon = (categoryName: string) => {
    return iconMap[categoryName] || <FolderTree className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-soft p-6 md:p-8"
          >
            <h1 className="text-2xl font-bold mb-6 text-center">Sell an Item</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., iPhone 12 Pro - Like New"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium mb-2">Price (GHS) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium mb-2">Condition *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="new">Brand New</option>
                    <option value="like_new">Like New</option>
                    <option value="used">Used - Good</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location *</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Accra, Kumasi"
                  required
                />
              </div>

              {/* Category Selection - Modal Trigger */}
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <div
                  onClick={openCategoryModal}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:border-red-500 hover:bg-red-50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedCategory ? (
                        getCategoryIcon(selectedCategory.name)
                      ) : (
                        <FolderTree className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      )}
                      <div>
                        {selectedCategory ? (
                          <>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedCategory.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {getCategoryPath()}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Click to select a category
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                </div>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={openCategoryModal}
                    className="text-xs text-red-600 mt-2 hover:text-red-700"
                  >
                    Change category
                  </button>
                )}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Images (Max 5)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {selectedImages.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">Upload up to 5 images. First image will be primary.</p>
              </div>

              {/* Contact Preferences */}
              <div className="space-y-2">
                <label className="block text-sm font-medium mb-2">Contact Preferences</label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.whatsapp_contact}
                    onChange={(e) => setFormData({ ...formData, whatsapp_contact: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm">Enable WhatsApp contact</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.phone_contact}
                    onChange={(e) => setFormData({ ...formData, phone_contact: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-sm">Enable phone call contact</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || uploadingImages}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
              >
                {(loading || uploadingImages) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadingImages ? 'Uploading Images...' : 'Creating Listing...'}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Listing
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Category Selection Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCategoryModal(false)}
            />

            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="pointer-events-auto w-full max-w-md mx-4"
              >
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {categoryBreadcrumb.length > 0 && (
                          <button
                            onClick={handleBack}
                            className="p-1 hover:bg-red-200 rounded-full transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-red-600" />
                          </button>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">
                          {categoryBreadcrumb.length === 0 ? 'Select Category' : categoryBreadcrumb[categoryBreadcrumb.length - 1].name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowCategoryModal(false)}
                        className="p-1 hover:bg-red-200 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    {categoryBreadcrumb.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 overflow-x-auto pb-1">
                        {categoryBreadcrumb.slice(0, -1).map((cat, idx) => (
                          <React.Fragment key={cat.id}>
                            <span className="text-gray-500 whitespace-nowrap">{cat.name}</span>
                            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          </React.Fragment>
                        ))}
                        <span className="text-red-600 font-medium whitespace-nowrap">
                          {categoryBreadcrumb[categoryBreadcrumb.length - 1].name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto">
                    {currentLevelCategories.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No categories found
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {currentLevelCategories.map((category) => {
                          const hasChildren = allCategories.some(cat => cat.parent_id === category.id);
                          return (
                            <button
                              key={category.id}
                              onClick={() => handleCategorySelect(category)}
                              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group text-left"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <div className="text-gray-400 group-hover:text-red-500 transition-colors">
                                  {getCategoryIcon(category.name)}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                                    {category.name}
                                  </p>
                                  {category.description && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {category.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {hasChildren ? (
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0 ml-2" />
                              ) : (
                                <Check className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <button
                      onClick={handleReset}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Start over
                    </button>
                    <p className="text-xs text-gray-500">
                      {categoryBreadcrumb.length} level{categoryBreadcrumb.length !== 1 ? 's' : ''} deep
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default SellPage;

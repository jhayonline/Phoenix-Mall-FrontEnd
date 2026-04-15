import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { productsApi, categoriesApi, imagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const SellPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
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
        // Get level 2 categories (subcategories)
        const subCategories = response.data.filter(cat => cat.level === 2);
        setCategories(subCategories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...selectedImages, ...files].slice(0, 5);
    setSelectedImages(newImages);

    // Create preview URLs
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);

    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create product
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

        // Upload images
        if (selectedImages.length > 0) {
          setUploadingImages(true);
          for (const image of selectedImages) {
            try {
              await imagesApi.upload(productPid, image);
            } catch (error) {
              console.error('Failed to upload image:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-soft p-6"
          >
            <h1 className="text-2xl font-bold mb-6">Sell an Item</h1>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                >
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New</option>
                  <option value="used">Used - Good</option>
                  <option value="refurbished">Refurbished</option>
                </select>
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

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2">Images (Max 5)</label>
                <div className="grid grid-cols-4 gap-3 mb-3">
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
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
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
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Enable WhatsApp contact</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.phone_contact}
                    onChange={(e) => setFormData({ ...formData, phone_contact: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Enable phone call contact</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || uploadingImages}
                className="w-full bg-gray-900 hover:bg-gray-800"
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
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default SellPage;

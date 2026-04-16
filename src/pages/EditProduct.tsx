import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ImageIcon, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { productsApi, categoriesApi, imagesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { CategoryResponseData, ProductImage } from '@/lib/api';

const EditProduct: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryResponseData[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
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
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCategories();
    loadProduct();
  }, [pid]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAllCategories();
      if (response.success && response.data) {
        const subCategories = response.data.filter(cat => cat.level === 2);
        setCategories(subCategories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getProduct(pid!);
      if (response.success && response.data) {
        const product = response.data;
        setFormData({
          title: product.title,
          description: product.description || '',
          price: product.price.toString(),
          condition: product.condition || 'new',
          location: product.location || '',
          category_id: product.category_id || '',
          whatsapp_contact: product.whatsapp_contact,
          phone_contact: product.phone_contact,
        });

        // Load existing images
        try {
          const imagesResponse = await imagesApi.getImages(pid!);
          if (imagesResponse.success && imagesResponse.data.length > 0) {
            setExistingImages(imagesResponse.data);
          }
        } catch (error) {
          console.error('Failed to load images:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
      navigate('/seller/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...selectedImages, ...files].slice(0, 5 - existingImages.length);
    setSelectedImages(newImages);

    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeNewImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      await imagesApi.deleteImage(pid!, imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: "Removed",
        description: "Image removed successfully",
      });
    } catch (error) {
      console.error('Failed to remove image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Update product details
      await productsApi.updateProduct(pid!, {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        condition: formData.condition,
        location: formData.location,
        category_id: formData.category_id,
        whatsapp_contact: formData.whatsapp_contact,
        phone_contact: formData.phone_contact,
      });

      // Upload new images
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        for (const image of selectedImages) {
          try {
            await imagesApi.upload(pid!, image);
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        }
      }

      toast({
        title: "Success!",
        description: "Product updated successfully",
      });

      navigate('/seller/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
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

  const totalImages = existingImages.length + selectedImages.length;
  const canAddMore = totalImages < 5;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 shadow-soft">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Current Images</label>
                <div className="grid grid-cols-4 gap-3">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={image.image_url} alt="Product" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Add New Images {canAddMore ? `(${totalImages}/5)` : '(Max 5 reached)'}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {canAddMore && (
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

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting || uploadingImages}
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                {(submitting || uploadingImages) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadingImages ? 'Uploading Images...' : 'Updating...'}
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/seller/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default EditProduct;

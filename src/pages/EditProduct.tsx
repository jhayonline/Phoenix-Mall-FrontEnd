import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  ImageIcon,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  MapPin,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CategoryPicker from "@/components/sell/CategoryPicker";
import LocationPicker from "@/components/sell/LocationPicker";
import { productsApi, categoriesApi, imagesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { CategoryResponseData, ProductImage } from "@/lib/api";

interface Spec {
  id: string;
  spec_name: string;
  spec_type: string;
  is_required: boolean;
  preset_options: string[] | null;
  validation_rules: { min?: number; max?: number } | null;
  input_placeholder: string | null;
  helper_text: string | null;
  value: string;
}

interface ProductSpec {
  spec_id: string;
  spec_name: string;
  value: string;
}

const EditProduct: React.FC = () => {
  const { pid } = useParams<{ pid: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [negotiation, setNegotiation] = useState("negotiable");
  const [condition, setCondition] = useState("new");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [townId, setTownId] = useState<string | null>(null);
  const [regionName, setRegionName] = useState("");
  const [townName, setTownName] = useState("");
  const [whatsappContact, setWhatsappContact] = useState(true);
  const [phoneContact, setPhoneContact] = useState(false);

  // Specifications
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [specErrors, setSpecErrors] = useState<Record<string, string>>({});

  // Images
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProduct();
  }, [pid]);

  // Load specs when category changes
  useEffect(() => {
    if (categoryId) {
      loadSpecs();
    }
  }, [categoryId]);

  const loadSpecs = async () => {
    setLoadingSpecs(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api"}/categories/${categoryId}/specs`,
      );
      const data = await response.json();
      const specsData = Array.isArray(data) ? data : data.data || [];
      setSpecs(specsData.map((s: Spec) => ({ ...s, value: "" })));
    } catch (error) {
      console.error("Failed to load specs:", error);
    } finally {
      setLoadingSpecs(false);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getProduct(pid!);
      if (response.success && response.data) {
        const product = response.data as any;
        setTitle(product.title);
        setDescription(product.description || "");
        setPrice(product.price.toString());
        setCondition(product.condition || "new");
        setNegotiation(product.negotiation || "negotiable");
        setCategoryId(product.category_id || null);
        setWhatsappContact(product.whatsapp_contact);
        setPhoneContact(product.phone_contact);

        // Load location data from product response
        if (product.region_id) setRegionId(product.region_id);
        if (product.town_id) setTownId(product.town_id);
        if (product.region) setRegionName(product.region);
        if (product.town) setTownName(product.town);

        // Load existing specs
        if (product.specs && product.specs.length > 0) {
          setSpecs(
            product.specs.map((spec: ProductSpec) => ({
              id: spec.spec_id,
              spec_name: spec.spec_name,
              spec_type: "text",
              is_required: false,
              preset_options: null,
              validation_rules: null,
              input_placeholder: null,
              helper_text: null,
              value: spec.value,
            })),
          );
        }

        // Load existing images
        try {
          const imagesResponse = await imagesApi.getImages(pid!);
          if (imagesResponse.success && imagesResponse.data.length > 0) {
            setExistingImages(imagesResponse.data);
          }
        } catch (error) {
          console.error("Failed to load images:", error);
        }
      }
    } catch (error) {
      console.error("Failed to load product:", error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      });
      navigate("/seller/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxNewImages = 5 - existingImages.length;
    const newImages = [...selectedImages, ...files].slice(0, maxNewImages);
    setSelectedImages(newImages);
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
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
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      toast({
        title: "Removed",
        description: "Image removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const validateSpecs = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    specs.forEach((spec) => {
      if (spec.is_required && !spec.value.trim()) {
        errors[spec.id] = `${spec.spec_name} is required`;
        isValid = false;
      }
    });

    setSpecErrors(errors);
    if (!isValid) {
      toast({
        title: "Error",
        description: "Please fill in all required specifications",
        variant: "destructive",
      });
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product title",
        variant: "destructive",
      });
      return;
    }
    if (!categoryId) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }
    if (!regionId || !townId) {
      toast({ title: "Error", description: "Please select your location", variant: "destructive" });
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast({ title: "Error", description: "Please enter a valid price", variant: "destructive" });
      return;
    }

    // Validate specs
    if (!validateSpecs()) {
      return;
    }

    setSubmitting(true);

    try {
      // Update product details
      const productData = {
        title,
        description: description || null,
        category_id: categoryId,
        region_id: regionId,
        town_id: townId,
        price: parseFloat(price),
        negotiation,
        condition: condition || null,
        location: `${townName}, ${regionName}`,
        whatsapp_contact: whatsappContact,
        phone_contact: phoneContact,
        specs: specs
          .filter((s) => s.value)
          .map((s) => ({
            spec_id: s.id,
            value: s.value,
          })),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api"}/products/update/${pid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(productData),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to update product");
      }

      // Upload new images
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        for (const image of selectedImages) {
          try {
            await imagesApi.upload(pid!, image);
          } catch (error) {
            console.error("Failed to upload image:", error);
          }
        }
      }

      toast({
        title: "Success!",
        description: "Product updated successfully",
      });

      navigate("/seller/dashboard");
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

  const totalImages = existingImages.length + selectedImages.length;
  const canAddMore = totalImages < 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 shadow-soft">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., iPhone 14 Pro Max - 256GB"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <CategoryPicker
                selectedCategoryId={categoryId}
                onSelect={(id, name) => {
                  setCategoryId(id);
                }}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <LocationPicker
                selectedRegionId={regionId}
                selectedTownId={townId}
                onSelect={(regId, townIdVal, regNameVal, townNameVal) => {
                  setRegionId(regId);
                  setTownId(townIdVal);
                  setRegionName(regNameVal);
                  setTownName(townNameVal);
                }}
              />
            </div>

            {/* Specifications */}
            {loadingSpecs ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              specs.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Specifications</label>
                  <div className="space-y-4">
                    {specs.map((spec) => (
                      <div key={spec.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {spec.spec_name}
                          {spec.is_required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        {spec.spec_type === "select" && spec.preset_options ? (
                          <select
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = specs.map((s) =>
                                s.id === spec.id ? { ...s, value: e.target.value } : s,
                              );
                              setSpecs(newSpecs);
                              if (specErrors[spec.id]) {
                                const newErrors = { ...specErrors };
                                delete newErrors[spec.id];
                                setSpecErrors(newErrors);
                              }
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <option value="">Select {spec.spec_name}</option>
                            {spec.preset_options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : spec.spec_type === "number" ? (
                          <input
                            type="number"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = specs.map((s) =>
                                s.id === spec.id ? { ...s, value: e.target.value } : s,
                              );
                              setSpecs(newSpecs);
                            }}
                            placeholder={
                              spec.input_placeholder || `Enter ${spec.spec_name.toLowerCase()}`
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        ) : spec.spec_type === "boolean" ? (
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`spec_${spec.id}`}
                                checked={spec.value === "true"}
                                onChange={() => {
                                  const newSpecs = specs.map((s) =>
                                    s.id === spec.id ? { ...s, value: "true" } : s,
                                  );
                                  setSpecs(newSpecs);
                                }}
                                className="w-4 h-4 text-red-500"
                              />
                              <span className="text-sm">Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`spec_${spec.id}`}
                                checked={spec.value === "false"}
                                onChange={() => {
                                  const newSpecs = specs.map((s) =>
                                    s.id === spec.id ? { ...s, value: "false" } : s,
                                  );
                                  setSpecs(newSpecs);
                                }}
                                className="w-4 h-4 text-red-500"
                              />
                              <span className="text-sm">No</span>
                            </label>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = specs.map((s) =>
                                s.id === spec.id ? { ...s, value: e.target.value } : s,
                              );
                              setSpecs(newSpecs);
                            }}
                            placeholder={
                              spec.input_placeholder || `Enter ${spec.spec_name.toLowerCase()}`
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        )}

                        {spec.helper_text && (
                          <p className="text-xs text-gray-500 mt-1">{spec.helper_text}</p>
                        )}
                        {specErrors[spec.id] && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {specErrors[spec.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">Price (GHS) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium mb-2">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New</option>
                  <option value="used">Used - Good</option>
                  <option value="fair">Used - Fair</option>
                </select>
              </div>
            </div>

            {/* Negotiation */}
            <div>
              <label className="block text-sm font-medium mb-2">Price Negotiation</label>
              <div className="flex gap-4">
                {[
                  { value: "fixed", label: "Fixed Price" },
                  { value: "negotiable", label: "Negotiable" },
                  { value: "flexible", label: "Ask Seller" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="negotiation"
                      checked={negotiation === option.value}
                      onChange={() => setNegotiation(option.value)}
                      className="w-4 h-4 text-red-500"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={850}
                placeholder="Describe your item in detail..."
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/850 characters</p>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Current Images</label>
                <div className="grid grid-cols-4 gap-3">
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={image.image_url}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
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
                Add New Images {canAddMore ? `(${totalImages}/5)` : "(Max 5 reached)"}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
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
              <p className="text-xs text-gray-500 mt-2">First image will be the cover photo.</p>
            </div>

            {/* Contact Preferences */}
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-2">Contact Preferences</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={whatsappContact}
                  onChange={(e) => setWhatsappContact(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm">Enable WhatsApp contact</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={phoneContact}
                  onChange={(e) => setPhoneContact(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm">Enable phone call contact</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitting || uploadingImages}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {submitting || uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadingImages ? "Uploading Images..." : "Updating..."}
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/seller/dashboard")}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default EditProduct;

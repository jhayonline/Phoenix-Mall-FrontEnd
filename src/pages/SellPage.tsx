import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  Plus,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CategoryPicker from "@/components/sell/CategoryPicker";
import LocationPicker from "@/components/sell/LocationPicker";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { productsApi, imagesApi } from "@/lib/api";

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

type Step = 1 | 2 | 3 | 4;

const SellPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [regionId, setRegionId] = useState<string | null>(null);
  const [townId, setTownId] = useState<string | null>(null);
  const [regionName, setRegionName] = useState("");
  const [townName, setTownName] = useState("");

  // Step 2: Specifications
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  // Step 3: Pricing & Contact
  const [price, setPrice] = useState("");
  const [negotiation, setNegotiation] = useState("negotiable");
  const [description, setDescription] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Step 4: Promotion
  const [promotionType, setPromotionType] = useState("standard");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [specErrors, setSpecErrors] = useState<Record<string, string>>({});

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      // Try to get phone number and name from user object
      // You might need to fetch profile data here if not available in user
      setPhoneNumber((user as any)?.phone_number || "");
      setSellerName((user as any)?.name || user?.first_name || "");
    }
  }, [user]);

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
      toast({
        title: "Error",
        description: "Failed to load category specifications",
        variant: "destructive",
      });
    } finally {
      setLoadingSpecs(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    URL.revokeObjectURL(imagePreviews[index]);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
  };

  const validateStep1 = (): boolean => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product title",
        variant: "destructive",
      });
      return false;
    }
    if (!categoryId) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return false;
    }
    if (!regionId || !townId) {
      toast({ title: "Error", description: "Please select your location", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
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
        description: "Please fill in all required fields",
        variant: "destructive",
      });
    }
    return isValid;
  };

  const validateStep3 = (): boolean => {
    if (!price || parseFloat(price) <= 0) {
      toast({ title: "Error", description: "Please enter a valid price", variant: "destructive" });
      return false;
    }
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return false;
    }
    if (!sellerName.trim()) {
      toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStep === 3 && validateStep3()) {
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (!agreeTerms) {
      toast({ title: "Error", description: "Please agree to the terms", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Create product
      const productData = {
        title,
        description: description || null,
        category_id: categoryId,
        region_id: regionId,
        town_id: townId,
        price: parseFloat(price),
        negotiation,
        condition: null,
        location: `${townName}, ${regionName}`,
        whatsapp_contact: true,
        phone_contact: true,
        specs: specs
          .filter((s) => s.value)
          .map((s) => ({
            spec_id: s.id,
            value: s.value,
          })),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api"}/products/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(productData),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create product");
      }

      const product = result.data || result;
      const productPid = product.pid;

      // Upload images if any
      if (images.length > 0 && productPid) {
        setUploadingImages(true);
        for (const image of images) {
          try {
            await imagesApi.upload(productPid, image);
          } catch (error) {
            console.error("Failed to upload image:", error);
          }
        }
      }

      toast({ title: "Success!", description: "Your item has been listed successfully" });
      navigate(`/product/${productPid}`);
    } catch (error: any) {
      console.error("Failed to create product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., iPhone 14 Pro Max - 256GB"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <CategoryPicker
                selectedCategoryId={categoryId}
                onSelect={(id, name) => {
                  setCategoryId(id);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                Please provide accurate details about your item. This helps buyers find exactly what
                they're looking for.
              </p>
            </div>

            {loadingSpecs ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : specs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No specifications required for this category.
              </div>
            ) : (
              specs.map((spec) => (
                <div key={spec.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
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
                        <span>Yes</span>
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
                        <span>No</span>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
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
              ))
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (GH₵) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Negotiation
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item in detail..."
                rows={5}
                maxLength={850}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/850 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="024XXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Max 5)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
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
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-colors">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">Add Photo</span>
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
              <p className="text-xs text-gray-500">
                Upload up to 5 photos. First photo will be the cover image.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl p-6 border border-red-200">
              <h3 className="font-semibold text-lg mb-2">🎉 Launch Special! 🎉</h3>
              <p className="text-gray-700 mb-4">
                For our launch month, all promotions are{" "}
                <strong className="text-red-600">completely FREE</strong>! Choose any promotion type
                at no cost.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  value: "standard",
                  label: "Standard Listing",
                  description: "Free - Basic listing",
                  price: "Free",
                },
                {
                  value: "spotlight",
                  label: "Spotlight",
                  description: "Featured in search results for 7 days",
                  price: "Free (Usually GHS 15)",
                },
                {
                  value: "premium",
                  label: "Premium Spotlight",
                  description: "Top placement for 28 days + highlighted badge",
                  price: "Free (Usually GHS 100)",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    promotionType === option.value
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="promotion"
                    value={option.value}
                    checked={promotionType === option.value}
                    onChange={() => setPromotionType(option.value)}
                    className="mt-1 w-4 h-4 text-red-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                    <div className="text-sm font-semibold text-red-600 mt-1">{option.price}</div>
                  </div>
                  {promotionType === option.value && <Check className="w-5 h-5 text-red-500" />}
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 text-red-500 rounded"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{" "}
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => navigate("/terms")}
                  >
                    Terms of Use
                  </button>
                  , confirm that I will abide by the{" "}
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => navigate("/safety-tips")}
                  >
                    Safety Tips
                  </button>
                  , and declare that this posting does not include any Prohibited Items.
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1 relative">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      currentStep >= step ? "bg-red-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                      step < 4 ? (currentStep > step ? "bg-red-600" : "bg-gray-200") : "hidden"
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Details</span>
              <span>Specs</span>
              <span>Price</span>
              <span>Promote</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">
              {currentStep === 1 && "Tell us about your item"}
              {currentStep === 2 && "Add specifications"}
              {currentStep === 3 && "Set price & contact"}
              {currentStep === 4 && "Boost your listing"}
            </h2>

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || uploadingImages}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting || uploadingImages ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {uploadingImages ? "Uploading images..." : "Posting..."}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Post Listing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default SellPage;

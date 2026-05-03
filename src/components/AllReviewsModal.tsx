import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user_name: string;
  user_avatar?: string;
  created_at: string;
}

interface AllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  productName: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
};

const AllReviewsModal: React.FC<AllReviewsModalProps> = ({
  isOpen,
  onClose,
  reviews,
  productName,
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-lg max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Customer Reviews</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""} for {productName}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Reviews List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        {review.user_avatar ? (
                          <img
                            src={
                              review.user_avatar.startsWith("http")
                                ? review.user_avatar
                                : `${API_BASE_URL.replace("/api", "")}${review.user_avatar}`
                            }
                            alt={review.user_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user_name)}&background=ef4444&color=fff&size=40`;
                            }}
                          />
                        ) : (
                          <span className="text-white font-bold text-sm uppercase">
                            {review.user_name?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-medium text-gray-900">{review.user_name}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Button onClick={onClose} variant="outline" className="w-full">
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AllReviewsModal;

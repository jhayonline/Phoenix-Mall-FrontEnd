import { backendRequest } from "./client";

export interface PriceIntelData {
  product_id: string;
  product_title: string;
  seller_current_price: number;
  market_average_price: number;
  market_median_price: number;
  market_lowest_price: number;
  market_highest_price: number;
  competitor_count: number;
  percentile_25: number;
  percentile_75: number;
  recommendation: string;
  analyzed_at: string;
}

export interface PriceRecommendation {
  id: string;
  product_id: string;
  market_avg_price: number;
  recommended_price: number | null;
  competitor_count: number;
  is_viewed: boolean;
  created_at: string;
}

export interface CompetitorListing {
  id: string;
  product_title: string;
  price: number;
  condition: string | null;
  platform: string;
  location: string | null;
  url: string;
  scraped_at: string;
}

export const priceIntelApi = {
  // Get price recommendations for seller's products
  async getProductRecommendations(productId?: string): Promise<PriceRecommendation[]> {
    const endpoint = productId
      ? `/price-intel/recommendations/product/${productId}`
      : "/price-intel/recommendations";
    const response = await backendRequest<PriceRecommendation[]>(endpoint);
    return response.data;
  },

  // Get market intelligence for a product
  async getMarketIntel(productId: string): Promise<PriceIntelData | null> {
    try {
      const response = await backendRequest<PriceIntelData>(`/price-intel/market/${productId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  // Get competitor listings for a product
  async getCompetitorListings(productTitle: string): Promise<CompetitorListing[]> {
    const response = await backendRequest<CompetitorListing[]>(
      `/price-intel/competitors?title=${encodeURIComponent(productTitle)}`,
    );
    return response.data;
  },

  // Mark recommendation as viewed
  async markAsViewed(recommendationId: string): Promise<void> {
    await backendRequest(`/price-intel/recommendations/${recommendationId}/view`, {
      method: "PUT",
    });
  },
};

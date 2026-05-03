import React, { useState, useEffect } from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { priceIntelApi, type PriceIntelData, type CompetitorListing } from "@/lib/api/priceIntel";

interface PriceInsightProps {
  productId: string;
  productTitle: string;
  currentPrice: number;
  onPriceSuggestion?: (suggestedPrice: number) => void;
}

const PriceInsight: React.FC<PriceInsightProps> = ({
  productId,
  productTitle,
  currentPrice,
  onPriceSuggestion,
}) => {
  const [intel, setIntel] = useState<PriceIntelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorListing[]>([]);
  const [showCompetitors, setShowCompetitors] = useState(false);

  useEffect(() => {
    loadIntel();
  }, [productId]);

  const loadIntel = async () => {
    setLoading(true);
    try {
      const data = await priceIntelApi.getMarketIntel(productId);
      setIntel(data);

      if (data && data.competitor_count > 0) {
        const comps = await priceIntelApi.getCompetitorListings(productTitle);
        setCompetitors(comps);
      }
    } catch (error) {
      console.error("Failed to load price intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  const getComparisonIcon = () => {
    if (!intel) return null;

    const diff = currentPrice - intel.market_average_price;
    const percentDiff = (diff / intel.market_average_price) * 100;

    if (percentDiff > 10) {
      return <TrendingUp className="w-5 h-5 text-red-500" />;
    } else if (percentDiff < -10) {
      return <TrendingDown className="w-5 h-5 text-green-500" />;
    } else {
      return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getRecommendationColor = () => {
    if (!intel) return "text-gray-600";

    if (intel.recommendation.includes("Lower")) {
      return "text-red-600";
    } else if (intel.recommendation.includes("competitive")) {
      return "text-green-600";
    }
    return "text-gray-600";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!intel || intel.competitor_count === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Not enough market data for price analysis yet.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {getComparisonIcon()}
          <div className="text-left">
            <h4 className="font-medium text-gray-900">Price Intelligence</h4>
            <p className="text-xs text-gray-500">
              Based on {intel.competitor_count} competitor listings
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-100">
          {/* Market Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Market Average</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(intel.market_average_price)}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Market Median</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(intel.market_median_price)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Lowest Price</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(intel.market_lowest_price)}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-600">Highest Price</p>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(intel.market_highest_price)}
              </p>
            </div>
          </div>

          {/* Price Range Indicator */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Lower</span>
              <span>25th %ile</span>
              <span>Median</span>
              <span>75th %ile</span>
              <span>Higher</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400"
                style={{ width: "100%" }}
              />
              <div
                className="absolute h-3 w-1 bg-gray-900 top-1/2 -translate-y-1/2"
                style={{ left: `${(currentPrice / intel.market_highest_price) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Your price: {formatCurrency(currentPrice)}
            </p>
          </div>

          {/* Recommendation */}
          <div
            className={`bg-${intel.recommendation.includes("Lower") ? "red" : intel.recommendation.includes("competitive") ? "green" : "gray"}-50 rounded-lg p-3 mb-4`}
          >
            <p className={`text-sm font-medium ${getRecommendationColor()}`}>
              {intel.recommendation}
            </p>
          </div>

          {/* Suggested Action Button */}
          {intel.recommendation.includes("Lower") && onPriceSuggestion && (
            <button
              type="button"
              onClick={() => onPriceSuggestion(intel.market_average_price)}
              className="w-full mb-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Apply Suggested Price ({formatCurrency(intel.market_average_price)})
            </button>
          )}

          {/* Competitor Listings */}
          {competitors.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowCompetitors(!showCompetitors)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View competitor listings
                {showCompetitors ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {showCompetitors && (
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {competitors.slice(0, 5).map((comp, idx) => (
                    <a
                      key={idx}
                      href={comp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {comp.product_title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {comp.platform} • {comp.location || "Location not specified"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(comp.price)}
                          </p>
                          {comp.condition && (
                            <p className="text-xs text-gray-500">{comp.condition}</p>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-400 mt-1" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceInsight;

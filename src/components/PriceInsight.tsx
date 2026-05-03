import React, { useState, useEffect } from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
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

  const getPositionLabel = () => {
    if (!intel) return null;
    const diff = currentPrice - intel.market_average_price;
    const percentDiff = (diff / intel.market_average_price) * 100;

    if (percentDiff > 15) return { text: "Above market", color: "text-red-600" };
    if (percentDiff < -15) return { text: "Below market", color: "text-green-600" };
    return { text: "At market", color: "text-gray-600" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
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
          <Info className="w-4 h-4" />
          <span className="text-sm">Not enough market data for price analysis yet.</span>
        </div>
      </div>
    );
  }

  const position = getPositionLabel();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gray-50/50"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Market Price Analysis</span>
          <span className={`text-xs font-medium ${position?.color}`}>{position?.text}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Price Comparison Row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Your Price</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(currentPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Market Average</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(intel.market_average_price)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Market Median</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(intel.market_median_price)}
              </p>
            </div>
          </div>

          {/* Price Range Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{formatCurrency(intel.market_lowest_price)}</span>
              <span>{formatCurrency(intel.market_highest_price)}</span>
            </div>
            <div className="relative h-1.5 bg-gray-100 rounded-full">
              <div
                className="absolute h-full bg-gray-300 rounded-full"
                style={{
                  left: `${((intel.market_lowest_price - intel.market_lowest_price) / (intel.market_highest_price - intel.market_lowest_price)) * 100}%`,
                  right: `${((intel.market_highest_price - intel.market_highest_price) / (intel.market_highest_price - intel.market_lowest_price)) * 100}%`,
                  width: "100%",
                }}
              />
              <div
                className="absolute w-2.5 h-2.5 bg-gray-700 rounded-full -translate-x-1/2 -top-0.5"
                style={{
                  left: `${((currentPrice - intel.market_lowest_price) / (intel.market_highest_price - intel.market_lowest_price)) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>25th</span>
              <span>Median</span>
              <span>75th</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-0.5">
              <span>{formatCurrency(intel.percentile_25)}</span>
              <span>{formatCurrency(intel.market_median_price)}</span>
              <span>{formatCurrency(intel.percentile_75)}</span>
            </div>
          </div>

          {/* Insight Message */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{intel.recommendation}</p>
          </div>

          {/* Apply Button */}
          {intel.recommendation.includes("Lower") && onPriceSuggestion && (
            <button
              type="button"
              onClick={() => onPriceSuggestion(Math.round(intel.market_average_price))}
              className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Apply suggested price ({formatCurrency(Math.round(intel.market_average_price))})
            </button>
          )}

          {/* Competitor Listings */}
          {competitors.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowCompetitors(!showCompetitors)}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                View {competitors.length} competitor listings
                {showCompetitors ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {showCompetitors && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {competitors.slice(0, 5).map((comp, idx) => (
                    <a
                      key={idx}
                      href={comp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {comp.product_title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{comp.platform}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(comp.price)}
                          </p>
                          {comp.condition && (
                            <p className="text-xs text-gray-500">{comp.condition}</p>
                          )}
                        </div>
                      </div>
                      {comp.location && (
                        <p className="text-xs text-gray-400 mt-1">{comp.location}</p>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Data Source Note */}
          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Based on {intel.competitor_count} competitor listings from Jiji
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceInsight;

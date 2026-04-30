import React, { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface SpecFilter {
  spec_id: string;
  spec_name: string;
  spec_type: string;
  values: string[];
}

interface SpecFiltersProps {
  categoryId: string | null;
  selectedSpecs: Record<string, string[]>;
  onSpecChange: (specId: string, values: string[]) => void;
}

const SpecFilters: React.FC<SpecFiltersProps> = ({ categoryId, selectedSpecs, onSpecChange }) => {
  const [specs, setSpecs] = useState<SpecFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (categoryId) {
      loadSpecFilters();
    } else {
      setSpecs([]);
    }
  }, [categoryId]);

  const loadSpecFilters = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api"}/categories/${categoryId}/specs`,
      );
      const data = await response.json();
      const specsData = Array.isArray(data) ? data : data.data || [];

      // Transform to filter format
      const filters: SpecFilter[] = specsData
        .filter((s: any) => s.spec_type === "select" && s.preset_options)
        .map((s: any) => ({
          spec_id: s.id,
          spec_name: s.spec_name,
          spec_type: s.spec_type,
          values: s.preset_options || [],
        }));

      setSpecs(filters);
    } catch (error) {
      console.error("Failed to load spec filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpec = (specId: string) => {
    const newExpanded = new Set(expandedSpecs);
    if (newExpanded.has(specId)) {
      newExpanded.delete(specId);
    } else {
      newExpanded.add(specId);
    }
    setExpandedSpecs(newExpanded);
  };

  const handleValueToggle = (specId: string, value: string) => {
    const current = selectedSpecs[specId] || [];
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onSpecChange(specId, newValues);
  };

  const clearSpec = (specId: string) => {
    onSpecChange(specId, []);
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (specs.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500 text-sm">
        No filters available for this category
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {specs.map((spec) => (
        <div key={spec.spec_id} className="border-b border-gray-100 pb-3">
          <button
            onClick={() => toggleSpec(spec.spec_id)}
            className="w-full flex items-center justify-between text-left py-2"
          >
            <span className="font-medium text-gray-900 text-sm">{spec.spec_name}</span>
            {expandedSpecs.has(spec.spec_id) ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSpecs.has(spec.spec_id) && (
            <div className="mt-2 space-y-2">
              {spec.values.map((value) => {
                const isSelected = (selectedSpecs[spec.spec_id] || []).includes(value);
                return (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleValueToggle(spec.spec_id, value)}
                      className="w-4 h-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{value}</span>
                  </label>
                );
              })}

              {(selectedSpecs[spec.spec_id] || []).length > 0 && (
                <button
                  onClick={() => clearSpec(spec.spec_id)}
                  className="text-xs text-red-500 hover:text-red-600 mt-1"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SpecFilters;

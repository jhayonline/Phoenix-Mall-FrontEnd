import React, { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";

interface LocationPickerProps {
  selectedRegionId: string | null;
  selectedTownId: string | null;
  onSelect: (regionId: string, townId: string, regionName: string, townName: string) => void;
}

interface Region {
  id: string;
  name: string;
  display_order: number;
}

interface Town {
  id: string;
  name: string;
  display_order: number;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedRegionId,
  selectedTownId,
  onSelect,
}) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedTown, setSelectedTown] = useState<Town | null>(null);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingTowns, setLoadingTowns] = useState(false);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api"}/regions`,
      );
      const data = await response.json();
      if (data.success !== false) {
        const regionsData = Array.isArray(data) ? data : data.data || [];
        setRegions(regionsData);
      }
    } catch (error) {
      console.error("Failed to load regions:", error);
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadTowns = async (regionId: string) => {
    setLoadingTowns(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5150/api"}/regions/${regionId}/towns`,
      );
      const data = await response.json();
      if (data.success !== false) {
        const townsData = Array.isArray(data) ? data : data.data || [];
        setTowns(townsData);
      }
    } catch (error) {
      console.error("Failed to load towns:", error);
    } finally {
      setLoadingTowns(false);
    }
  };

  const handleRegionChange = (regionId: string) => {
    const region = regions.find((r) => r.id === regionId);
    if (region) {
      setSelectedRegion(region);
      setSelectedTown(null);
      setTowns([]);
      loadTowns(regionId);
    }
  };

  const handleTownSelect = (town: Town) => {
    setSelectedTown(town);
    if (selectedRegion) {
      onSelect(selectedRegion.id, town.id, selectedRegion.name, town.name);
    }
  };

  return (
    <div className="space-y-4">
      {/* Region Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Region <span className="text-red-500">*</span>
        </label>
        {loadingRegions ? (
          <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <select
            value={selectedRegion?.id || ""}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select region</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Town Select */}
      {selectedRegion && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Town/City <span className="text-red-500">*</span>
          </label>
          {loadingTowns ? (
            <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {towns.map((town) => (
                <button
                  key={town.id}
                  onClick={() => handleTownSelect(town)}
                  className={`px-3 py-2 text-left text-sm rounded-lg border transition-all ${
                    selectedTown?.id === town.id
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{town.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected location display */}
      {selectedRegion && selectedTown && (
        <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            📍 {selectedTown.name}, {selectedRegion.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;

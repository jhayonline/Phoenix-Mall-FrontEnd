import React, { useState, useRef, useEffect } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (values: [number, number]) => void;
  formatCurrency?: (value: number) => string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  formatCurrency = (value) => `GH₵ ${value.toLocaleString()}`,
}) => {
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
  }, [minValue, maxValue]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!sliderRef.current || !dragging) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);
    const value = min + (max - min) * percent;
    const roundedValue = Math.round(value / 100) * 100;

    if (dragging === "min" && roundedValue <= localMax - 100) {
      setLocalMin(roundedValue);
      onChange([roundedValue, localMax]);
    } else if (dragging === "max" && roundedValue >= localMin + 100) {
      setLocalMax(roundedValue);
      onChange([localMin, roundedValue]);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <div>
          <span className="text-gray-500">Min</span>
          <div className="font-semibold text-gray-900">{formatCurrency(localMin)}</div>
        </div>
        <div className="text-right">
          <span className="text-gray-500">Max</span>
          <div className="font-semibold text-gray-900">{formatCurrency(localMax)}</div>
        </div>
      </div>

      <div ref={sliderRef} className="relative h-2 bg-gray-200 rounded-full cursor-pointer">
        <div
          className="absolute h-full bg-red-500 rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />

        {/* Min handle */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-red-500 rounded-full -top-1 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `calc(${minPercent}% - 8px)` }}
          onMouseDown={() => setDragging("min")}
        />

        {/* Max handle */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-red-500 rounded-full -top-1 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `calc(${maxPercent}% - 8px)` }}
          onMouseDown={() => setDragging("max")}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={localMin}
          onChange={(e) => {
            const val = Math.min(Number(e.target.value), localMax - 100);
            setLocalMin(val);
            onChange([val, localMax]);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <span className="text-gray-400 self-center">—</span>
        <input
          type="number"
          value={localMax}
          onChange={(e) => {
            const val = Math.max(Number(e.target.value), localMin + 100);
            setLocalMax(val);
            onChange([localMin, val]);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>
    </div>
  );
};

export default PriceRangeSlider;

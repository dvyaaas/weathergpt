"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, Navigation } from "lucide-react";
import { GeoLocation } from "@/lib/types";
import { searchPlaces } from "@/lib/api";

interface SearchBarProps {
  onSelectLocation: (loc: GeoLocation) => void;
  currentLocationName: string;
}

const POPULAR_CITIES: GeoLocation[] = [
  { name: "New Delhi", latitude: 28.6139, longitude: 77.2090, admin1: "Delhi", country: "India" },
  { name: "Mumbai", latitude: 19.0760, longitude: 72.8777, admin1: "Maharashtra", country: "India" },
  { name: "Chennai", latitude: 13.0827, longitude: 80.2707, admin1: "Tamil Nadu", country: "India" },
  { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946, admin1: "Karnataka", country: "India" },
  { name: "Kolkata", latitude: 22.5726, longitude: 88.3639, admin1: "West Bengal", country: "India" },
  { name: "Madurai", latitude: 9.9252, longitude: 78.1198, admin1: "Tamil Nadu", country: "India" },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectLocation,
  currentLocationName,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchPlaces(query);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Geocoding search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="w-full relative" ref={dropdownRef}>
      {/* Search Bar Input */}
      <div className="relative flex items-center">
        <div className="absolute left-4 text-sky-500 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search any Indian city, district, village or airport (e.g. Madurai, VOMM)..."
          className="w-full pl-12 pr-12 py-3.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 shadow-sm transition-all"
        />
        {isLoading && (
          <div className="absolute right-4 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-card rounded-2xl p-1.5 shadow-subtle border border-slate-200/80 max-h-72 overflow-y-auto">
          {results.map((loc, idx) => (
            <button
              key={`${loc.name}-${loc.latitude}-${idx}`}
              onClick={() => handleSelect(loc)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left hover:bg-sky-50/70 transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-sky-100/70 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-all">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 group-hover:text-sky-950">
                    {loc.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {[loc.admin1, loc.country].filter(Boolean).join(", ")}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Popular Indian City Quick Chips */}
      <div className="flex items-center space-x-2 mt-3 overflow-x-auto py-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 whitespace-nowrap pl-1">
          <Navigation className="w-3 h-3 text-sky-400" />
          <span>Quick:</span>
        </span>
        {POPULAR_CITIES.map((city) => {
          const isCurrent = currentLocationName.includes(city.name);
          return (
            <button
              key={city.name}
              onClick={() => handleSelect(city)}
              className={`text-xs px-3 py-1 rounded-xl transition-all whitespace-nowrap border ${
                isCurrent
                  ? "bg-sky-50 text-sky-700 border-sky-300 font-semibold"
                  : "bg-white/80 text-slate-600 border-slate-200/70 hover:bg-white hover:text-slate-900"
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};


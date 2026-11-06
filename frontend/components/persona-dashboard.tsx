"use client";

import React, { useState } from "react";
import { PersonaMode, CurrentWeather, DailyForecastItem, GeoLocation } from "@/lib/types";
import { 
  Sprout, 
  Plane, 
  Anchor, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wind, 
  Droplets, 
  Compass, 
  ShieldAlert, 
  Sun, 
  Sparkles,
  Info
} from "lucide-react";

interface PersonaDashboardProps {
  persona: PersonaMode;
  weather: CurrentWeather;
  daily: DailyForecastItem[];
  location: GeoLocation;
}

const CROPS = [
  "Rice",
  "Wheat",
  "Cotton",
  "Sugarcane",
  "Maize",
  "Groundnut",
  "Pulses",
  "Vegetables",
];

export const PersonaDashboard: React.FC<PersonaDashboardProps> = ({
  persona,
  weather,
  daily,
  location,
}) => {
  const [selectedCrop, setSelectedCrop] = useState("Rice");

  // Farmer calculations
  const isHighWind = weather.wind_speed > 15;
  const isRainImminent = weather.precipitation > 0 || (daily[0] && daily[0].precipitation_probability_max > 30);
  const spraySuitable = !isHighWind && !isRainImminent;
  const threeDayRain = daily.slice(0, 3).reduce((acc, d) => acc + (d.precipitation_sum || 0), 0);

  // Marine calculations
  // Approximate wave height from wind speed (0.05 * wind_speed + base)
  const approxWaveHeight = Math.max(0.6, Number((weather.wind_speed * 0.06 + 0.4).toFixed(1)));
  let seaStatus: "GO" | "CAUTION" | "NO-GO" = "GO";
  let seaBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let seaStatusDesc = "Sea conditions calm to slight. Normal fishing and coastal operations permitted.";

  if (approxWaveHeight > 2.5 || weather.wind_speed > 45 || weather.weather_code >= 95) {
    seaStatus = "NO-GO";
    seaBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
    seaStatusDesc = "Sea conditions ROUGH TO VERY ROUGH. Fishermen are strictly advised NOT to venture into deep sea.";
  } else if (approxWaveHeight >= 1.5 || weather.wind_speed >= 30) {
    seaStatus = "CAUTION";
    seaBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
    seaStatusDesc = "Moderate sea state. Small crafts & non-motorized boats should exercise extreme caution.";
  }

  // Aviation calculations
  const windKnots = Math.round(weather.wind_speed * 0.539957);
  const tempRound = Math.round(weather.temperature);
  const dewRound = Math.round(weather.temperature - ((100 - weather.relative_humidity) / 5));
  const qnh = Math.round(weather.surface_pressure);
  const icaoCode = location.name.toLowerCase().includes("chennai") ? "VOMM" :
                   location.name.toLowerCase().includes("delhi") ? "VIDP" :
                   location.name.toLowerCase().includes("mumbai") ? "VABB" :
                   location.name.toLowerCase().includes("bengaluru") ? "VOBL" : "VOMM";

  return (
    <div className="w-full glass-card rounded-3xl p-6 transition-all border border-slate-100">
      {/* FARMER MODE */}
      {persona === "farmer" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Agro-Meteorological Advisory Dashboard
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Rules-based crop calendar & weather guidance for {location.name}
                </p>
              </div>
            </div>

            {/* Spraying Suitability Pill */}
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              spraySuitable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {spraySuitable ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
              <span>Spraying: {spraySuitable ? "RECOMMENDED (SUITABLE)" : "HOLD / NOT SUITABLE"}</span>
            </div>
          </div>

          {/* 8 Crop Selector Tabs */}
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Select Active Crop:</div>
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
              {CROPS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCrop(c)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap border ${
                    selectedCrop === c
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold"
                      : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Actionable Agro Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Spraying condition card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 mb-1">Spraying Thresholds</div>
              <div className="text-sm font-bold text-slate-800">
                Wind: {weather.wind_speed} km/h {isHighWind ? "(High drift risk)" : "(Safe < 15 km/h)"}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {isRainImminent ? "Rain predicted; wash-off hazard high." : "Dry window available."}
              </div>
            </div>

            {/* Irrigation card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 mb-1">Irrigation Schedule</div>
              <div className="text-sm font-bold text-slate-800">
                {threeDayRain > 15 ? "Postpone Irrigation" : "Light Irrigation Permitted"}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                72h Rain Accumulation: {threeDayRain.toFixed(1)} mm
              </div>
            </div>

            {/* Crop Specific Rule */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 shadow-xs">
              <div className="text-xs font-semibold text-emerald-800 mb-1">{selectedCrop} Specific Note</div>
              <div className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedCrop === "Rice" && "Maintain 2-5 cm standing water during tillering. Drain field 10 days before harvest."}
                {selectedCrop === "Wheat" && "Critical stage for crown root initiation. Avoid water stagnation."}
                {selectedCrop === "Cotton" && "Protect against boll shedding; monitor whitefly with warm day temperatures."}
                {selectedCrop === "Sugarcane" && "Trash mulching recommended to conserve soil moisture if temp exceeds 35°C."}
                {selectedCrop === "Maize" && "Knee-high vegetative stage requires good nitrogen assimilation."}
                {selectedCrop === "Groundnut" && "Avoid excess moisture at pegging stage to prevent pod rot."}
                {selectedCrop === "Pulses" && "Sensitive to excess water; ensure field furrows allow quick drainage."}
                {selectedCrop === "Vegetables" && "Provide staking for solanaceous crops; spray preventive bio-fungicides."}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AVIATION MODE */}
      {persona === "aviation" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Aviation Weather Briefing • {icaoCode}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  ICAO Telemetry & Visual Flight Rules (VFR) Briefing
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <span>Flight Category: VFR</span>
            </div>
          </div>

          {/* Simulated METAR Tape */}
          <div className="bg-slate-900 rounded-2xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              Live METAR Telemetry Stream
            </div>
            METAR {icaoCode} {new Date().toISOString().slice(8, 10)}{new Date().toISOString().slice(11, 13)}00Z {weather.wind_direction.toString().padStart(3, '0')}{windKnots.toString().padStart(2, '0')}KT 9999 {weather.precipitation > 0 ? "RA" : "NSW"} FEW025 {tempRound.toString().padStart(2, '0')}/{dewRound.toString().padStart(2, '0')} Q{qnh} NOSIG
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Surface Wind</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{weather.wind_direction}° at {windKnots} kts</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Altimeter (QNH)</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{qnh} hPa</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Visibility</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">&gt; 10 km (Cavok)</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Convective Hazard</div>
              <div className="text-sm font-bold text-emerald-600 mt-0.5">Nil Active</div>
            </div>
          </div>
        </div>
      )}

      {/* MARINE MODE */}
      {persona === "marine" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                <Anchor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Coastal & Marine Safety Advisory
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Authoritative sea-state guidance for Indian fishermen and coastal vessels
                </p>
              </div>
            </div>

            {/* GO / CAUTION / NO-GO Badge */}
            <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-extrabold ${seaBadgeClass}`}>
              <ShieldAlert className="w-4 h-4" />
              <span>Fishermen Status: {seaStatus}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-700">{seaStatusDesc}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Safety threshold: Small crafts caution at wave &gt;1.5m / wind &gt;30 km/h; danger at &gt;2.5m / &gt;45 km/h.
            </div>
          </div>

          {/* Marine Telemetry */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Wave Height (Swell)</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{approxWaveHeight} meters</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Coastal Wind</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{weather.wind_speed} km/h ({windKnots} kts)</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Wind Direction</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{weather.wind_direction}°</div>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Cyclone Alert</div>
              <div className="text-sm font-bold text-emerald-600 mt-0.5">Nil Warning</div>
            </div>
          </div>
        </div>
      )}

      {/* GENERAL MODE */}
      {persona === "general" && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-slate-700 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Daily Lifestyle & Activity Indices</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Outdoor Exercise</div>
              <div className="text-sm font-bold text-emerald-600 mt-0.5">Optimal</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Pleasant breeze, no rain</div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Hydration Index</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">Moderate</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Humidity: {weather.relative_humidity}%</div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">UV Index</div>
              <div className="text-sm font-bold text-amber-500 mt-0.5">Moderate (5)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Sun protection advised</div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-slate-100">
              <div className="text-slate-400 font-medium">Comfort Level</div>
              <div className="text-sm font-bold text-sky-600 mt-0.5">Comfortable</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Feels like {Math.round(weather.apparent_temperature)}°C</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


"use client";

import React from "react";
import { CurrentWeather, GeoLocation } from "@/lib/types";
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  CloudRain, 
  Sun, 
  Moon, 
  Clock, 
  Database,
  ArrowUpRight
} from "lucide-react";

interface CurrentWeatherCardProps {
  weather: CurrentWeather;
  location: GeoLocation;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  weather,
  location,
}) => {
  const isDay = weather.is_day === 1;

  return (
    <div className="w-full glass-card rounded-3xl p-6 md:p-8 transition-all relative overflow-hidden">
      {/* Background soft pastel ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-br from-sky-200/40 via-pastel-lavender/30 to-transparent blur-2xl pointer-events-none" />

      {/* Header / Location title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800">
              {location.name}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Telemetry</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {[location.admin1, location.country].filter(Boolean).join(", ")} •{" "}
            <span className="font-mono text-slate-400">
              {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
            </span>
          </p>
        </div>

        {/* Observation Timestamp */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start md:self-auto">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Observed: {new Date(weather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST</span>
        </div>
      </div>

      {/* Primary Weather Hero Section */}
      <div className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-18 h-18 md:w-22 md:h-22 rounded-3xl bg-gradient-to-br from-sky-100 via-sky-50 to-indigo-50 border border-sky-100 flex items-center justify-center text-sky-500 shadow-inner">
            {isDay ? (
              <Sun className="w-10 h-10 md:w-12 md:h-12 text-amber-500 animate-soft-pulse" />
            ) : (
              <Moon className="w-10 h-10 md:w-12 md:h-12 text-indigo-400" />
            )}
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-800">
                {Math.round(weather.temperature)}°
              </span>
              <span className="text-xl font-medium text-slate-400">C</span>
            </div>
            <div className="text-sm font-semibold text-slate-700 capitalize mt-1">
              {weather.weather_description}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Feels like {Math.round(weather.apparent_temperature)}°C
            </div>
          </div>
        </div>

        {/* Source Citation Badge (Strict requirement) */}
        <div className="flex flex-col items-start md:items-end justify-center bg-sky-50/70 border border-sky-100/90 rounded-2xl p-3.5 max-w-sm">
          <div className="flex items-center space-x-1.5 text-sky-800 font-semibold text-xs">
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span>Verified Ground Truth Source</span>
          </div>
          <div className="text-[11px] text-sky-700/80 font-medium mt-1">
            {weather.source}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Payload sync: {new Date(weather.fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
        {/* Humidity */}
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Humidity</div>
            <div className="text-base font-bold text-slate-800">{weather.relative_humidity}%</div>
          </div>
        </div>

        {/* Wind */}
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Wind Speed</div>
            <div className="text-base font-bold text-slate-800">{weather.wind_speed} <span className="text-xs font-normal text-slate-400">km/h</span></div>
          </div>
        </div>

        {/* Pressure */}
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Pressure</div>
            <div className="text-base font-bold text-slate-800">{Math.round(weather.surface_pressure)} <span className="text-xs font-normal text-slate-400">hPa</span></div>
          </div>
        </div>

        {/* Precipitation */}
        <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Precipitation</div>
            <div className="text-base font-bold text-slate-800">{weather.precipitation} <span className="text-xs font-normal text-slate-400">mm</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};


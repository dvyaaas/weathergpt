"use client";

import React from "react";
import { HourlyForecastItem } from "@/lib/types";
import { Cloud, CloudRain, Sun, Droplets } from "lucide-react";

interface HourlyForecastProps {
  items: HourlyForecastItem[];
}

export const HourlyForecastStrip: React.FC<HourlyForecastProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full glass-card rounded-3xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          24-Hour Forecast
        </h3>
        <span className="text-xs text-slate-400 font-medium">Hourly telemetry</span>
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
        {items.map((item, idx) => {
          const date = new Date(item.time);
          const hour = date.toLocaleTimeString([], { hour: "numeric", hour12: true });
          const isNow = idx === 0;

          return (
            <div
              key={item.time}
              className={`flex flex-col items-center justify-between min-w-[76px] p-3 rounded-2xl transition-all border ${
                isNow
                  ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                  : "bg-white/80 text-slate-700 border-slate-100 hover:border-sky-200 hover:bg-white"
              }`}
            >
              <span className={`text-xs font-semibold ${isNow ? "text-sky-100" : "text-slate-500"}`}>
                {isNow ? "Now" : hour}
              </span>

              <div className="my-2.5">
                {item.precipitation_probability > 30 ? (
                  <CloudRain className={`w-5 h-5 ${isNow ? "text-white" : "text-sky-500"}`} />
                ) : item.weather_code <= 2 ? (
                  <Sun className={`w-5 h-5 ${isNow ? "text-amber-200" : "text-amber-500"}`} />
                ) : (
                  <Cloud className={`w-5 h-5 ${isNow ? "text-white" : "text-slate-400"}`} />
                )}
              </div>

              <span className="text-sm font-bold tracking-tight">
                {Math.round(item.temperature)}°
              </span>

              {item.precipitation_probability > 0 && (
                <div className={`flex items-center space-x-0.5 mt-1 text-[10px] ${isNow ? "text-sky-100" : "text-sky-600"}`}>
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{item.precipitation_probability}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


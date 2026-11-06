"use client";

import React from "react";
import { DailyForecastItem } from "@/lib/types";
import { Cloud, CloudRain, Sun, Calendar, Droplets } from "lucide-react";

interface DailyForecastProps {
  items: DailyForecastItem[];
}

export const DailyForecastCard: React.FC<DailyForecastProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full glass-card rounded-3xl p-5 md:p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-4 h-4 text-sky-500" />
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          7-Day Weather Outlook
        </h3>
      </div>

      <div className="space-y-2.5">
        {items.map((day, idx) => {
          const dateObj = new Date(day.date);
          const dayName = idx === 0 ? "Today" : dateObj.toLocaleDateString([], { weekday: "short" });
          const dateStr = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });

          return (
            <div
              key={day.date}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/70 border border-slate-100 hover:bg-white hover:border-sky-100 transition-all text-xs"
            >
              {/* Day title */}
              <div className="w-24">
                <div className="font-bold text-slate-800">{dayName}</div>
                <div className="text-[10px] text-slate-400 font-medium">{dateStr}</div>
              </div>

              {/* Weather icon & description */}
              <div className="flex items-center space-x-2.5 flex-1 max-w-[200px]">
                {day.precipitation_probability_max > 40 ? (
                  <CloudRain className="w-4 h-4 text-sky-500 shrink-0" />
                ) : day.weather_code <= 2 ? (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                ) : (
                  <Cloud className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="text-slate-600 truncate font-medium">
                  {day.weather_description}
                </span>
              </div>

              {/* Rain Chance */}
              <div className="w-16 flex items-center space-x-1 text-slate-500">
                {day.precipitation_probability_max > 0 ? (
                  <>
                    <Droplets className="w-3 h-3 text-sky-500" />
                    <span>{day.precipitation_probability_max}%</span>
                  </>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </div>

              {/* Temperature Min / Max */}
              <div className="flex items-center space-x-2 font-mono">
                <span className="font-bold text-slate-800 text-sm">
                  {Math.round(day.temperature_max)}°
                </span>
                <span className="text-slate-400 text-xs">/</span>
                <span className="text-slate-500 text-xs">
                  {Math.round(day.temperature_min)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { WeatherGlobe } from "@/components/weather-globe";
import { SearchBar } from "@/components/search-bar";
import { CurrentWeatherCard } from "@/components/current-weather";
import { HourlyForecastStrip } from "@/components/hourly-forecast";
import { DailyForecastCard } from "@/components/daily-forecast";
import { PersonaDashboard } from "@/components/persona-dashboard";
import { AlertBanner } from "@/components/alert-banner";
import { OutboxModal } from "@/components/outbox-modal";
import { ChatDrawer } from "@/components/chat-drawer";
import { 
  GeoLocation, 
  WeatherForecastResponse, 
  PersonaMode, 
  SupportedLanguage, 
  WeatherAlert 
} from "@/lib/types";
import { fetchForecast, fetchAlerts } from "@/lib/api";
import { Loader2, RefreshCw, Sparkles, MapPin } from "lucide-react";

const INITIAL_LOCATION: GeoLocation = {
  name: "New Delhi",
  latitude: 28.6139,
  longitude: 77.2090,
  admin1: "Delhi",
  country: "India",
  country_code: "IN",
};

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(INITIAL_LOCATION);
  const [currentPersona, setCurrentPersona] = useState<PersonaMode>("general");
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>("en");
  const [weatherData, setWeatherData] = useState<WeatherForecastResponse | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);

  // Load weather and alerts when location changes
  const loadData = async (loc: GeoLocation) => {
    setIsRefreshing(true);
    try {
      const [forecast, activeAlerts] = await Promise.all([
        fetchForecast(loc.latitude, loc.longitude, loc.name, loc.admin1),
        fetchAlerts(loc.latitude, loc.longitude),
      ]);
      setWeatherData(forecast);
      setAlerts(activeAlerts);
    } catch (err) {
      console.error("Error loading weather data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(currentLocation);
  }, [currentLocation]);

  const handleSelectLocation = (loc: GeoLocation) => {
    setCurrentLocation(loc);
  };

  const handleGlobeCitySelect = (city: { name: string; lat: number; lon: number }) => {
    setCurrentLocation({
      name: city.name,
      latitude: city.lat,
      longitude: city.lon,
      country: "India",
      country_code: "IN",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      {/* Header */}
      <Header
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        onOpenOutbox={() => setIsOutboxOpen(true)}
        hasUnreadAlerts={alerts.length > 0}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Extreme Weather Alert Banner */}
        <AlertBanner
          alerts={alerts}
          onOpenOutbox={() => setIsOutboxOpen(true)}
        />

        {/* Top Control Bar: Search + Quick Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-2xl">
            <SearchBar
              onSelectLocation={handleSelectLocation}
              currentLocationName={currentLocation.name}
            />
          </div>
          <div className="flex items-center space-x-3 self-end md:self-auto">
            <button
              onClick={() => loadData(currentLocation)}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync Forecast"}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: 2 Column Layout (Left: Weather & 3D Globe, Right: AI Chat & Analytics) */}
        {isLoading && !weatherData ? (
          <div className="w-full h-96 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            <p className="text-sm font-medium text-slate-500">
              Connecting to Open-Meteo & IMD observational telemetry...
            </p>
          </div>
        ) : weatherData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): 3D Globe + Current Weather + Mode Dashboard + Forecasts */}
            <div className="lg:col-span-7 space-y-6">
              {/* 3D Weather Globe */}
              <WeatherGlobe
                currentLocation={weatherData.location}
                onSelectCity={handleGlobeCitySelect}
              />

              {/* Current Weather Card */}
              <CurrentWeatherCard
                weather={weatherData.current}
                location={weatherData.location}
              />

              {/* Mode Specific Persona Dashboard (Farmer / Aviation / Marine / General) */}
              <PersonaDashboard
                persona={currentPersona}
                weather={weatherData.current}
                daily={weatherData.daily}
                location={weatherData.location}
              />

              {/* 24-Hour Forecast Strip */}
              <HourlyForecastStrip items={weatherData.hourly} />

              {/* 7-Day Forecast Outlook */}
              <DailyForecastCard items={weatherData.daily} />
            </div>

            {/* Right Column (5 cols): AI WeatherGPT Assistant Drawer & Chat */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-20">
                <ChatDrawer
                  currentPersona={currentPersona}
                  currentLanguage={currentLanguage}
                  currentLocation={weatherData.location}
                />
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Outbox Modal (Simulated SMS / WhatsApp Alert Dispatch) */}
      <OutboxModal
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white/70 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">WeatherGPT</span>
            <span>• SIH26068 (Ministry of Earth Sciences / IMD)</span>
          </div>
          <div>
            Observational telemetry verified via Open-Meteo & ECMWF/GFS Numerical Models.
          </div>
        </div>
      </footer>
    </div>
  );
}


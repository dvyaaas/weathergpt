"use client";

import React from "react";
import { PersonaMode, SupportedLanguage } from "@/lib/types";
import { 
  CloudSun, 
  Sprout, 
  Plane, 
  Anchor, 
  Sparkles, 
  Globe2, 
  BellRing, 
  Radio
} from "lucide-react";

interface HeaderProps {
  currentPersona: PersonaMode;
  onSelectPersona: (persona: PersonaMode) => void;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenOutbox: () => void;
  hasUnreadAlerts?: boolean;
}

const PERSONA_CONFIG: { id: PersonaMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "general", label: "General", icon: <CloudSun className="w-4 h-4" />, desc: "Public & Daily Forecast" },
  { id: "farmer", label: "Farmer Mode", icon: <Sprout className="w-4 h-4" />, desc: "Crops, Spray & Soil Moisture" },
  { id: "aviation", label: "Aviation", icon: <Plane className="w-4 h-4" />, desc: "METAR, TAF & Flight Hazards" },
  { id: "marine", label: "Marine & Fishery", icon: <Anchor className="w-4 h-4" />, desc: "Sea State & Safety Advisories" },
];

const LANGUAGE_LABELS: Record<SupportedLanguage, { label: string; native: string }> = {
  en: { label: "English", native: "EN" },
  hi: { label: "Hindi", native: "हिंदी" },
  ta: { label: "Tamil", native: "தமிழ்" },
  te: { label: "Telugu", native: "తెలుగు" },
  bn: { label: "Bengali", native: "বাংলা" },
};

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  onSelectPersona,
  currentLanguage,
  onSelectLanguage,
  onOpenOutbox,
  hasUnreadAlerts = true,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/60 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-sky-400/25">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-800">
                  Weather<span className="text-sky-500 font-extrabold">GPT</span>
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                  SIH26068
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                MoES • India Meteorological Department (IMD)
              </p>
            </div>
          </div>

          {/* Mobile outbox button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenOutbox}
              className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              title="Alerts Outbox"
            >
              <BellRing className="w-4 h-4" />
              {hasUnreadAlerts && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Persona Mode Switcher Pills */}
        <div className="flex items-center overflow-x-auto py-1 scrollbar-none gap-1.5 p-1 bg-slate-100/70 rounded-2xl border border-slate-200/60">
          {PERSONA_CONFIG.map((p) => {
            const isActive = currentPersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm shadow-slate-200 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span className={isActive ? "text-sky-600" : "text-slate-400"}>
                  {p.icon}
                </span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right side actions: Language Selector & Outbox */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Outbox Dispatch Status */}
          <button
            onClick={onOpenOutbox}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/90 border border-slate-200/80 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Alerts Outbox</span>
            {hasUnreadAlerts && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          {/* Language Selector */}
          <div className="flex items-center space-x-1 p-1 bg-slate-100/70 rounded-xl border border-slate-200/60">
            <Globe2 className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((lang) => {
              const active = currentLanguage === lang;
              return (
                <button
                  key={lang}
                  onClick={() => onSelectLanguage(lang)}
                  className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${
                    active
                      ? "bg-white text-sky-700 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title={LANGUAGE_LABELS[lang].label}
                >
                  {LANGUAGE_LABELS[lang].native}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};


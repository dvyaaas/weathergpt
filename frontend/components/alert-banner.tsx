"use client";

import React from "react";
import { WeatherAlert } from "@/lib/types";
import { AlertTriangle, Radio, ExternalLink, X } from "lucide-react";

interface AlertBannerProps {
  alerts: WeatherAlert[];
  onOpenOutbox: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onOpenOutbox }) => {
  if (!alerts || alerts.length === 0) return null;
  const alert = alerts[0];

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-orange-500/10 border border-amber-300/60 rounded-2xl p-4 shadow-sm backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs mt-0.5">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                {alert.severity} • {alert.sender_name}
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {alert.event}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-1">
              {alert.headline}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              <strong className="text-slate-600">Affected:</strong> {alert.area_description} — {alert.instruction}
            </p>
          </div>
        </div>

        {/* Action: Open Simulated SMS/WhatsApp Outbox */}
        <button
          onClick={onOpenOutbox}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-50 transition-all shadow-xs self-start sm:self-auto shrink-0"
        >
          <Radio className="w-3.5 h-3.5 text-amber-600" />
          <span>Dispatch Outbox</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};


"use client";

import React, { useState, useEffect } from "react";
import { OutboxMessage } from "@/lib/types";
import { fetchOutbox } from "@/lib/api";
import { MessageSquare, Send, CheckCheck, X, Smartphone, Share2, Clock } from "lucide-react";

interface OutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OutboxModal: React.FC<OutboxModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<OutboxMessage[]>([]);
  const [simulatedRecipient, setSimulatedRecipient] = useState("+91 98400 12345");
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchOutbox().then(setMessages);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTestAlert = () => {
    const newMsg: OutboxMessage = {
      id: `SIM-${Date.now().toString().slice(-4)}`,
      type: "SMS",
      recipient: simulatedRecipient,
      content: "TEST ALERT (WeatherGPT SIH26068): Moderate squall warning active for coastal fishing zones. Follow safe sea-state guidance.",
      timestamp: new Date().toISOString(),
      status: "Delivered",
    };
    setMessages((prev) => [newMsg, ...prev]);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl border border-white/80 bg-white/95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Multi-Channel Alerts Outbox
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Simulated SMS & WhatsApp delivery gateway (SIH26068 Demo)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Simulator Form */}
        <div className="py-4 border-b border-slate-100">
          <div className="text-xs font-semibold text-slate-500 mb-2">Simulate Live Broadcast Dispatch:</div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={simulatedRecipient}
                onChange={(e) => setSimulatedRecipient(e.target.value)}
                placeholder="+91 Mobile number"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <button
              onClick={handleSendTestAlert}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          </div>
          {testSent && (
            <div className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center space-x-1">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Simulated SMS payload dispatched successfully!</span>
            </div>
          )}
        </div>

        {/* Outbox Message Stream */}
        <div className="py-3">
          <div className="text-xs font-semibold text-slate-400 mb-2.5">Recent Gateway Deliveries:</div>
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs hover:bg-white transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.type === "WhatsApp" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"
                    }`}>
                      {m.type}
                    </span>
                    <span className="font-semibold text-slate-700">{m.recipient}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-600 font-medium">
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>{m.status}</span>
                  </div>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed mt-1">
                  {m.content}
                </p>
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Delivery channel: SMS Broadcast / WhatsApp API</span>
          <button
            onClick={onClose}
            className="font-semibold text-sky-600 hover:text-sky-700"
          >
            Close Outbox
          </button>
        </div>
      </div>
    </div>
  );
};


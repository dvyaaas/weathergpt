"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  PersonaMode, 
  SupportedLanguage, 
  GeoLocation, 
  ChatMessage 
} from "@/lib/types";
import { streamChatResponse } from "@/lib/api";
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Bot, 
  User, 
  Database, 
  RotateCcw, 
  ChevronDown, 
  Volume2,
  HelpCircle,
  Clock
} from "lucide-react";

interface ChatDrawerProps {
  currentPersona: PersonaMode;
  currentLanguage: SupportedLanguage;
  currentLocation: GeoLocation;
}

const PERSONA_QUICK_PROMPTS: Record<PersonaMode, string[]> = {
  general: [
    "Will it rain in Madurai on Saturday?",
    "What are the weather conditions in Chennai today?",
    "How is the humidity and temperature in Bengaluru this evening?",
  ],
  farmer: [
    "Is tomorrow suitable for spraying paddy in Thanjavur?",
    "What is the 3-day rain forecast for groundnut harvest in Madurai?",
    "Should I hold irrigation for my cotton field in Coimbatore?",
  ],
  aviation: [
    "What are the weather conditions and METAR at Chennai airport?",
    "Is there any convective storm or low cloud base warning at Delhi (VIDP)?",
    "Briefing for VFR flight out of Bengaluru (VOBL) this afternoon.",
  ],
  marine: [
    "Is it safe for fishermen to go to sea in Kochi today?",
    "What is the significant wave height and sea-state at Rameswaram?",
    "Any squall or cyclone warning for Gulf of Mannar?",
  ],
};

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  currentPersona,
  currentLanguage,
  currentLocation,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      role: "assistant",
      content: `Hello! I am WeatherGPT, your grounded AI weather assistant. I verify all numbers using live Open-Meteo & IMD observational telemetry. How can I assist you with ${currentLocation.name}'s weather?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Voice Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      // Select language for ASR
      const langMap: Record<SupportedLanguage, string> = {
        en: "en-IN",
        hi: "hi-IN",
        ta: "ta-IN",
        te: "te-IN",
        bn: "bn-IN",
      };
      recognition.lang = langMap[currentLanguage] || "en-IN";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  // Text to Speech (Read-aloud responses)
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    // Clean markdown headings/stars before reading
    const cleanText = text.replace(/[*#_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Send message handler
  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query || !query.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setInput("");
    setIsStreaming(true);

    let accumulatedContent = "";

    await streamChatResponse(
      query,
      currentPersona,
      currentLanguage,
      currentLocation.latitude,
      currentLocation.longitude,
      currentLocation.name,
      (token: string) => {
        accumulatedContent += token;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulatedContent } : m))
        );
      },
      () => {
        setIsStreaming(false);
      },
      (err: any) => {
        console.error("Chat streaming error:", err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: `Failed to connect to WeatherGPT service. Please ensure the backend is running. (${err.message})`,
                }
              : m
          )
        );
        setIsStreaming(false);
      }
    );
  };

  const clearChat = () => {
    setMessages([
      {
        id: "intro-reset",
        role: "assistant",
        content: `Chat session refreshed. Grounded on ${currentLocation.name} telemetry. Ask anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="w-full glass-card rounded-3xl p-5 md:p-6 flex flex-col h-[600px] border border-slate-100 shadow-soft">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span>WeatherGPT Assistant</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                {currentPersona} Mode
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Grounded on real observational telemetry • Zero hallucinations
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          title="Reset chat session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start space-x-2.5 ${isUser ? "flex-row-reverse space-x-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                  isUser
                    ? "bg-sky-500 text-white"
                    : "bg-slate-100 text-slate-700 border border-slate-200/60"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-sky-600" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  isUser
                    ? "bg-sky-500 text-white rounded-tr-xs"
                    : "bg-white text-slate-800 rounded-tl-xs border border-slate-100"
                }`}
              >
                <div className="whitespace-pre-line font-medium prose prose-sm max-w-none">
                  {m.content || (
                    <span className="text-slate-400 italic flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping mr-1" />
                      Analyzing weather telemetry & composing verified answer...
                    </span>
                  )}
                </div>

                {/* Footer with Timestamp and Read-aloud button */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/30 text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {!isUser && m.content && (
                    <button
                      onClick={() => speakText(m.content)}
                      className="hover:text-sky-600 transition-all p-0.5 rounded"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions for current Persona */}
      <div className="py-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase text-slate-400 whitespace-nowrap pl-0.5">
            Suggested:
          </span>
          {PERSONA_QUICK_PROMPTS[currentPersona].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium px-3 py-1 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-700 text-slate-600 border border-slate-200/60 transition-all whitespace-nowrap shrink-0 shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="pt-2 border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              isListening
                ? "Listening... Speak your weather question now"
                : `Ask WeatherGPT about ${currentLocation.name}...`
            }
            className={`w-full pl-4 pr-24 py-3 bg-white rounded-2xl border text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 shadow-xs transition-all ${
              isListening ? "border-rose-400 ring-2 ring-rose-300/40 bg-rose-50/20" : "border-slate-200"
            }`}
          />

          {/* Action buttons inside input */}
          <div className="absolute right-2 flex items-center space-x-1">
            {/* Push-to-Talk Voice Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "text-slate-400 hover:text-sky-600 hover:bg-slate-100"
              }`}
              title={isListening ? "Stop listening" : "Push to talk (Voice input)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !isStreaming
                  ? "bg-sky-500 text-white hover:bg-sky-600 shadow-xs"
                  : "text-slate-300 bg-slate-100 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


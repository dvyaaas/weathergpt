# WeatherGPT (SIH26068)
### Multilingual, Voice-Enabled AI Weather Assistant for India
**Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)**

WeatherGPT is an intelligent meteorological platform engineered for India with specialized modes for general citizens, farmers, aviators, and fishermen. All weather numbers are strictly grounded in observational telemetry from official meteorological sources (Open-Meteo, ECMWF, GFS, and IMD bulletins) with mandatory source citations and timestamps.

---

## 🌟 Features Implemented (Milestone 1 Foundation)

1. **Four Specialized User Personas:**
   - **General:** Conversational public forecasts, hourly trends, lifestyle & comfort indices.
   - **Farmer Mode:** Rule-based agro-meteorological advisories across 8 core Indian crops (Rice, Wheat, Cotton, Sugarcane, Maize, Groundnut, Pulses, Vegetables) with foliar spray suitability (safe wind/rain thresholds) and 72-hour soil moisture irrigation advisories.
   - **Aviation Mode:** Major Indian airport METAR telemetry generation (ICAO: VIDP, VOMM, VABB, VOBL, etc.), surface wind in knots, altimeter QNH pressure, and VFR flight hazard briefings.
   - **Marine & Fishery Mode:** Sea-state safety guidance with significant wave height, coastal wind speed, and explicit **GO / CAUTION / NO-GO** advisories based on authoritative INCOIS/IMD criteria.

2. **Multilingual Architecture:**
   - Support for 5 Indian languages: **English**, **Hindi (हिंदी)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, and **Bengali (বাংলা)**.

3. **Grounded AI Weather Assistant (SSE Streaming):**
   - Live token-by-token streaming via Server-Sent Events (SSE).
   - Real-time tool execution resolving Indian locations and numerical forecasts.
   - Zero hallucinations: strictly cites the data provider and timestamp on every query.
   - Push-to-Talk voice input (Web Speech API ASR) with read-aloud TTS capabilities.

4. **Interactive 3D Weather Earth Globe:**
   - Procedural Three.js 3D Earth globe featuring atmospheric glow, rotating cloud layer, and glowing city markers for Indian cities.
   - Smooth mouse/touch rotation and city focus.

5. **Extreme Weather Alerts & Simulated Outbox:**
   - Real IMD alert bulletin banner with severity ratings and affected zones.
   - Simulated SMS & WhatsApp dispatch outbox modal demonstrating multi-channel emergency broadcast alerts to farmers and fishing groups.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, Three.js, Framer Motion.
- **Backend:** Python 3.12, FastAPI, Pydantic v2, Uvicorn, HTTPX, SSE-Starlette.
- **Weather Data Engine:** Open-Meteo Forecast API (ECMWF/GFS), Open-Meteo Geocoding API, Open-Meteo Marine API, IMD bulletins.
- **Infrastructure Ready:** Docker Compose configuration with PostgreSQL/PostGIS and Redis services.

---

## 🚀 How to Run WeatherGPT

### Option A: One-Click Quickstart (Windows)
Double-click `dev.bat` in the root `weathergpt` directory. It opens two terminal windows:
- **Backend Server:** `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`)
- **Frontend App:** `http://localhost:3000`

---

### Option B: Manual Terminal Execution

#### 1. Start the Backend:
Open a terminal in `weathergpt`:
```powershell
backend\.venv\Scripts\python.exe backend\run.py
```

#### 2. Start the Frontend:
Open a second terminal in `weathergpt`:
```powershell
cd frontend
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## 🧪 Testing Queries in the AI Assistant

Try asking natural-language questions in the chat assistant:
- *"Will it rain in Madurai on Saturday?"*
- *"Is tomorrow suitable for spraying paddy in Thanjavur?"*
- *"What are the weather conditions at Chennai airport?"*
- *"Is it safe for fishermen to go to sea in Kochi today?"*


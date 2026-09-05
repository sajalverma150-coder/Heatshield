import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Droplet, 
  MapPin, 
  Clock, 
  PhoneCall, 
  ShieldAlert, 
  Compass, 
  Sun, 
  Wind, 
  Flame, 
  Activity, 
  HeartPulse, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
  Navigation,
  RefreshCw,
  Radio
} from 'lucide-react';
import { WeatherTelemetry, UserHealthProfile, CoolingFacility } from '../../types';
import { ASSET_IMAGES } from '../../data/mockData';
import { CityData } from '../../data/indiaCities';
import { HydrationTracker } from '../HydrationTracker';

interface LiveTelemetryViewProps {
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  facilities: CoolingFacility[];
  selectedCity?: CityData;
  onOpenCitySelector?: () => void;
  onLogWater: (amountMl: number) => void;
  onNavigateToFacility: (facility: CoolingFacility) => void;
  onOpenTriage: () => void;
  onTriggerSOS: () => void;
  onSwitchTab: (tab: any) => void;
  onSimulateInactivity?: () => void;
  onOpenHealthReport?: () => void;
  onOpenPushSettings?: () => void;
  isLiveApiLoading?: boolean;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
  onToggleDataSourceMode?: (mode: 'live_api' | 'imd_heatwave') => void;
  onRefreshTelemetry?: () => void;
}

export const LiveTelemetryView: React.FC<LiveTelemetryViewProps> = ({
  weather,
  userProfile,
  facilities,
  selectedCity,
  onOpenCitySelector,
  onLogWater,
  onNavigateToFacility,
  onOpenTriage,
  onTriggerSOS,
  onSwitchTab,
  onSimulateInactivity,
  onOpenHealthReport,
  onOpenPushSettings,
  isLiveApiLoading = false,
  dataSourceMode = 'live_api',
  onToggleDataSourceMode,
  onRefreshTelemetry,
}) => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(3); // 14:00 peak
  const [countdownText, setCountdownText] = useState<string>('02h 45m 12s');
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);

  // Hourly curve points
  const hourlyData = [
    { time: '08:00', temp: 31.0, wbgt: 26.5, stress: 'Safe Work Limit' },
    { time: '10:00', temp: 35.5, wbgt: 29.8, stress: 'Moderate Stress' },
    { time: '12:00', temp: 39.8, wbgt: 32.5, stress: 'High Stress (Rest 30m/h)' },
    { time: '14:00', temp: 41.8, wbgt: 34.2, stress: 'CRITICAL CURFEW (Work Halt)' },
    { time: '16:00', temp: 40.2, wbgt: 33.1, stress: 'Severe Heat Load' },
    { time: '18:00', temp: 36.4, wbgt: 30.2, stress: 'Gradual Relief' },
    { time: '20:00', temp: 33.2, wbgt: 28.4, stress: 'Nocturnal UHI Trap' },
  ];

  // Dynamic countdown timer calculation
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(16, 30, 0, 0); // Curfew ends 16:30 IST

      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownText('Peak Curfew Window Concluded');
      } else {
        const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setCountdownText(`${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s remaining`);
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const nearestShelter = facilities[0];

  return (
    <div id="live-telemetry-screen" className="space-y-4 sm:space-y-6 pb-12">
      
      {/* City & Live GPS Telemetry Status Strip */}
      {selectedCity && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#0b1326] border border-[#2d3449] text-xs shadow-lg">
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveApiLoading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="font-mono text-slate-400">Monitoring Station:</span>
            <strong className="text-white font-semibold text-sm">{selectedCity.name}, {selectedCity.state}</strong>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171f33] text-orange-400 border border-orange-500/30">
              {selectedCity.climateZone}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-400" />
              <span>{weather.lastUpdated}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Live Data Source Toggle */}
            {onToggleDataSourceMode && (
              <div className="flex items-center bg-[#060e20] p-0.5 rounded-lg border border-[#2d3449]">
                <button
                  onClick={() => onToggleDataSourceMode('live_api')}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                    dataSourceMode === 'live_api'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Stream real-time observed meteorological data via Open-Meteo Satellite API"
                >
                  Live API
                </button>
                <button
                  onClick={() => onToggleDataSourceMode('imd_heatwave')}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all ${
                    dataSourceMode === 'imd_heatwave'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Calibrated IMD Severe Heatwave Scenario (47-50°C stress testing & GRAP protocols)"
                >
                  IMD Heatwave
                </button>
              </div>
            )}

            {/* Refresh / Live Sync Button */}
            {onRefreshTelemetry && (
              <button
                id="telemetry-refresh-btn"
                onClick={onRefreshTelemetry}
                disabled={isLiveApiLoading}
                className="px-2.5 py-1 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Fetch real-time live sensor data for this location"
              >
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${isLiveApiLoading ? 'animate-spin' : ''}`} />
                <span>{isLiveApiLoading ? 'Syncing...' : 'Live Sync'}</span>
              </button>
            )}

            {/* Change City / GPS Button */}
            {onOpenCitySelector && (
              <button
                id="telemetry-switch-city-btn"
                onClick={onOpenCitySelector}
                className="px-2.5 py-1 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-orange-500/40 text-orange-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3 h-3 text-orange-400" />
                <span>Change City / GPS</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. Peak Heat Window Countdown Banner */}
      <section id="heat-window-countdown-banner" className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-[#171f33] to-orange-950/80 border border-red-500/40 p-3.5 sm:p-5 shadow-xl shadow-red-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 text-red-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-black bg-red-500 text-white tracking-wide">
                  GRAP STAGE IV
                </span>
                <span className="text-xs font-mono text-red-300 font-semibold uppercase">
                  Mandatory Heat Curfew Active
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-headline font-bold text-white mt-0.5">
                Peak Heat Window: <span className="text-orange-400 font-mono">{countdownText}</span>
              </h2>
              <p className="text-xs text-slate-300">
                12:30 – 16:30 IST • All unshaded physical labor suspended under DDMA Order #419-B
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="view-official-order-btn"
              onClick={() => setShowOrderModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#060e20] hover:bg-[#131b2e] text-xs font-mono text-slate-300 border border-[#2d3449] hover:border-slate-400 transition-colors flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-orange-400" />
              <span>Official Order</span>
            </button>
            <button
              id="find-shelter-quick-btn"
              onClick={() => onSwitchTab('cooling-finder')}
              className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-900/30 transition-all flex items-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Nearest Shelter (350m)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Primary Biometeorology Telemetry Matrix */}
      <section id="biometeorology-matrix-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        
        {/* WBGT (Wet Bulb Globe Temp) */}
        <div className="p-3.5 rounded-xl bg-[#0b1326] border-2 border-red-500/50 shadow-md">
          <div className="flex items-center justify-between text-[#a78b7d] text-xs mb-1">
            <span className="font-mono uppercase font-bold text-red-400">WBGT Index</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-headline font-black text-red-400">{weather.wbgt}</span>
            <span className="text-sm font-mono text-red-300">°C</span>
          </div>
          <div className="text-[10px] font-mono text-red-300 mt-1 font-semibold">
            EXTREME DANGER (&gt;32°C)
          </div>
        </div>

        {/* NOAA Heat Index */}
        <div className="p-3.5 rounded-xl bg-[#0b1326] border border-orange-500/40">
          <div className="flex items-center justify-between text-[#a78b7d] text-xs mb-1">
            <span className="font-mono uppercase">Heat Index</span>
            <Sun className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-headline font-black text-orange-400">{weather.heatIndex}</span>
            <span className="text-sm font-mono text-orange-300">°C</span>
          </div>
          <div className="text-[10px] font-mono text-orange-300 mt-1">
            Feels like 51°C in sun
          </div>
        </div>

        {/* UTCI Thermal Stress */}
        <div className="p-3.5 rounded-xl bg-[#0b1326] border border-[#2d3449]">
          <div className="flex items-center justify-between text-[#a78b7d] text-xs mb-1">
            <span className="font-mono uppercase">UTCI Stress</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-headline font-bold text-purple-300">{weather.utci}</span>
            <span className="text-sm font-mono text-purple-400">°C</span>
          </div>
          <div className="text-[10px] font-mono text-purple-300/80 mt-1">
            Very Strong Stress
          </div>
        </div>

        {/* Dry Bulb Temp & Humidity */}
        <div className="p-3.5 rounded-xl bg-[#0b1326] border border-[#2d3449]">
          <div className="flex items-center justify-between text-[#a78b7d] text-xs mb-1">
            <span className="font-mono uppercase">Air Temp / RH</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-headline font-bold text-white">{weather.dryBulbTemp}</span>
            <span className="text-sm font-mono text-slate-400">°C</span>
          </div>
          <div className="text-[10px] font-mono text-cyan-400 mt-1">
            {weather.humidity}% Rel. Humidity
          </div>
        </div>

        {/* Solar Radiation */}
        <div className="p-3.5 rounded-xl bg-[#0b1326] border border-[#2d3449]">
          <div className="flex items-center justify-between text-[#a78b7d] text-xs mb-1">
            <span className="font-mono uppercase">Solar Radiance</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-headline font-bold text-amber-300">{weather.solarRadiation}</span>
            <span className="text-xs font-mono text-slate-400">W/m²</span>
          </div>
          <div className="text-[10px] font-mono text-amber-400/80 mt-1">
            UV Index 11+ (Extreme)
          </div>
        </div>

        {/* Wind Speed & Boundary Layer */}
        <div className="p-3.5 rounded-xl bg-[#0b1326] border border-[#2d3449]">
          <div className="flex items-center justify-between text-[#a78b7d] text-xs mb-1">
            <span className="font-mono uppercase">Wind Velocity</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-headline font-bold text-white">{weather.windSpeed}</span>
            <span className="text-xs font-mono text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Stagnant Microclimate
          </div>
        </div>

      </section>

      {/* 3. Mid Grid: Personalized Health Advisory & Interactive Physiological Stress Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left (7 Cols): Interactive Physiological Heat Stress Curve */}
        <div className="lg:col-span-7 bg-[#0b1326] rounded-2xl border border-[#2d3449] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  Hourly Physiological Heat Stress Curve
                </h3>
                <p className="text-xs text-[#e0c0b1]/70">
                  {weather.stationName} Diurnal Cycle • Red zone indicates fatal heat stroke threshold
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-0.5 bg-slate-400" /> Safe Limit (28°C)
                </span>
                <span className="flex items-center gap-1 text-red-400 font-semibold">
                  <span className="w-2.5 h-0.5 bg-red-500" /> Curfew (33°C)
                </span>
              </div>
            </div>

            {/* SVG Diurnal Curve Chart */}
            <div className="relative w-full h-52 sm:h-60 mt-4 bg-[#060e20] rounded-xl border border-[#2d3449]/60 p-2 sm:p-4">
              <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
                {/* Horizontal reference grid lines */}
                <line x1="40" y1="180" x2="580" y2="180" stroke="#171f33" strokeWidth="1" />
                <line x1="40" y1="130" x2="580" y2="130" stroke="#171f33" strokeWidth="1" />
                <line x1="40" y1="80" x2="580" y2="80" stroke="#171f33" strokeWidth="1" />
                
                {/* Safe limit line (28°C) */}
                <line x1="40" y1="140" x2="580" y2="140" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                <text x="45" y="136" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono">Safe Limit 28°C</text>

                {/* Critical Curfew line (33°C) */}
                <line x1="40" y1="65" x2="580" y2="65" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="45" y="60" fill="#ef4444" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold">CRITICAL WORK CURFEW 33°C WBGT</text>

                {/* Danger zone shading */}
                <rect x="40" y="20" width="540" height="45" fill="#ef4444" fillOpacity="0.08" />

                {/* Ambient Dry Bulb temp path */}
                <path
                  d="M 50 170 Q 130 130 220 70 T 320 30 T 420 45 T 510 110 T 570 150"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="3"
                />

                {/* WBGT Curve path */}
                <path
                  d="M 50 185 Q 130 150 220 100 T 320 52 T 420 75 T 510 135 T 570 170"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3.5"
                  strokeDasharray="1 0"
                />

                {/* Interactive Points */}
                {hourlyData.map((pt, idx) => {
                  const cx = 50 + idx * 86.6;
                  // Map WBGT to Y coord (26°C -> 185, 34.2°C -> 52)
                  const cy = 185 - ((pt.wbgt - 26) / 8.5) * 133;
                  const isSelected = selectedPointIndex === idx;

                  return (
                    <g key={pt.time} className="cursor-pointer" onClick={() => setSelectedPointIndex(idx)}>
                      {isSelected && (
                        <circle cx={cx} cy={cy} r="14" fill="#f97316" fillOpacity="0.2" className="animate-ping" />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : 4.5}
                        fill={isSelected ? '#ffffff' : (pt.wbgt >= 33 ? '#ef4444' : '#f97316')}
                        stroke="#060e20"
                        strokeWidth="2"
                      />
                      {/* X-axis labels */}
                      <text
                        x={cx}
                        y="208"
                        textAnchor="middle"
                        fill={isSelected ? '#ffb690' : '#94a3b8'}
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                      >
                        {pt.time}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Point Inspector Bar */}
          <div className="mt-3 p-3 rounded-xl bg-[#060e20] border border-[#2d3449] flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono text-orange-400 font-bold px-2 py-1 bg-orange-500/10 rounded border border-orange-500/30">
                {hourlyData[selectedPointIndex].time} IST
              </span>
              <div>
                <span className="text-white font-semibold">
                  Air {hourlyData[selectedPointIndex].temp}°C • WBGT {hourlyData[selectedPointIndex].wbgt}°C
                </span>
                <span className="text-slate-400 text-[11px] block">
                  Status: <span className="text-orange-300 font-medium">{hourlyData[selectedPointIndex].stress}</span>
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-mono text-slate-400">Sweat Rate</span>
              <div className="font-mono text-orange-400 font-bold">
                {selectedPointIndex === 3 ? '850 ml/hr' : '450-700 ml/hr'}
              </div>
            </div>
          </div>
        </div>

        {/* Right (5 Cols): Personalized Health Memory & Bio-Advisory Engine */}
        <div className="lg:col-span-5 bg-[#0b1326] rounded-2xl border border-orange-500/30 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle glow background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-headline font-bold text-white">
                    Personalized Bio-Advisory Engine
                  </h3>
                  <p className="text-[11px] font-mono text-[#a78b7d]">
                    Memory ID: Rajesh Kumar (Age 52)
                  </p>
                </div>
              </div>
              <button
                id="edit-profile-shortcut-btn"
                onClick={() => onSwitchTab('profile')}
                className="text-[11px] font-mono text-orange-400 hover:text-orange-300 underline"
              >
                Edit Profile
              </button>
            </div>

            {/* Metabolic Strain Dial & Risk Box */}
            <div className="p-3 rounded-xl bg-[#060e20] border border-red-500/30 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                    Cumulative Thermal Strain
                  </div>
                  <div className="text-xl sm:text-2xl font-headline font-black text-white">
                    94 <span className="text-xs text-red-400 font-mono">/ 100 EXTREME</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">Personal Threshold</span>
                  <span className="text-xs font-mono font-bold text-amber-300">28.5°C WBGT</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#171f33] h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 h-full rounded-full w-[94%]" />
              </div>

              <div className="mt-2 text-[11px] text-red-300/90 leading-tight">
                ⚠️ <strong>Clinical Warning:</strong> Calcium channel blocker (Amlodipine) + Thiazide diuretic accelerates peripheral dehydration and suppresses internal heat dissipation.
              </div>
            </div>

            {/* Dynamic Hydration Tracker with Real-Time Dehydration Hazard Engine */}
            <HydrationTracker
              weather={weather}
              userProfile={userProfile}
              onLogWater={onLogWater}
              onOpenTriage={onOpenTriage}
              onSimulateInactivity={onSimulateInactivity}
              onOpenHealthReport={onOpenHealthReport}
              onOpenPushSettings={onOpenPushSettings}
              className="mb-3"
            />
          </div>

          {/* Action Trigger in Profile Card */}
          <div className="pt-2 border-t border-[#2d3449] flex items-center justify-between">
            <span className="text-xs text-slate-300">Feeling dizzy or muscle cramps?</span>
            <button
              id="triage-diagnostic-shortcut-btn"
              onClick={onOpenTriage}
              className="text-xs font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <span>Run AI Triage Tree</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 4. Lower Row: Microclimate Heat Island Satellite & Municipal Directives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left (5 Cols): Microclimate Satellite Imagery & Thermal Plume */}
        <div className="lg:col-span-5 bg-[#0b1326] rounded-2xl border border-[#2d3449] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-headline font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                Landsat-9 / INSAT-3DR Thermal Plume
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                LST +3.4°C UHI
              </span>
            </div>

            {/* Satellite Map Frame */}
            <div className="relative rounded-xl overflow-hidden border border-[#2d3449] aspect-video bg-[#060e20] group">
              <img
                src={ASSET_IMAGES.satelliteDharavi}
                alt="Dharavi Urban Heat Island Satellite Map"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-transparent to-transparent" />
              
              {/* Overlay Radar Pulse on Dharavi Hotspot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-600/30 animate-radar" />
                <div className="w-6 h-6 rounded-full bg-red-600/60 flex items-center justify-center text-white text-[10px] font-mono font-bold shadow-lg border border-white">
                  AWS
                </div>
              </div>

              {/* Legend overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono bg-[#0b1326]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-[#2d3449]">
                <span className="text-slate-300">Surface Temp Anomaly:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400">32°C (Coast)</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-red-400 font-bold">46.8°C (Tin Roofs)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-300 space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Solar Radiative Load:</span>
              <span className="text-white font-bold">{weather.solarRadiativeLoad} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Sweat Evaporation Loss:</span>
              <span className="text-orange-400 font-bold">{weather.sweatLossRate} ml/hr</span>
            </div>
          </div>
        </div>

        {/* Right (7 Cols): Municipal EOC Emergency Directives & Nearest Shelter Card */}
        <div className="lg:col-span-7 bg-[#0b1326] rounded-2xl border border-[#2d3449] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-headline font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Municipal EOC Directives • Ward G/North
              </h3>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                ACTIVE ORDERS
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#060e20] border border-red-500/20 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-white font-semibold block">Mandatory Informal Labor Suspension</span>
                  Section 51 NDMA order enforces stoppage of masonry, road works, and open headload carriage between 11:30 and 16:30. Contractors non-compliant face immediate license revocation.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#060e20] border border-cyan-500/20 flex items-start gap-2.5">
                <Droplet className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="text-white font-semibold block">Free Drinking Water Bowsers Stationed</span>
                  24 BMC water bowsers deployed with chilled electrolyte solution along 90ft Road, Matunga Labour Camp, and Sion Circle.
                </div>
              </div>
            </div>

            {/* Nearest Designated Shelter Highlight */}
            <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 to-[#171f33] border border-emerald-500/30 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/20 px-1.5 py-0.5 rounded">
                    Nearest Cooling Sanctuary
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {nearestShelter.walkTimeMins} mins walk ({nearestShelter.distanceKm} km)
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1 truncate">
                  {nearestShelter.name}
                </h4>
                <p className="text-[11px] text-slate-300">
                  Indoor Temp: <strong className="text-emerald-400">{nearestShelter.indoorTemp}°C</strong> • Chilled ORS & Misting Fans
                </p>
              </div>

              <button
                id="navigate-nearest-shelter-btn"
                onClick={() => onNavigateToFacility(nearestShelter)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 shadow-md shadow-emerald-950/40 flex items-center gap-1.5 transition-all"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>
            </div>
          </div>

          {/* Quick Action Grid at bottom */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#2d3449]">
            <button
              id="action-cooling-btn"
              onClick={() => onSwitchTab('cooling-finder')}
              className="p-2 rounded-lg bg-[#060e20] hover:bg-[#171f33] border border-[#2d3449] hover:border-orange-500/50 text-left transition-all"
            >
              <div className="text-[10px] font-mono text-slate-400">FIND SHELTER</div>
              <div className="text-xs font-semibold text-orange-300 flex items-center justify-between">
                <span>Cooling Pods</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </div>
            </button>

            <button
              id="action-protocols-btn"
              onClick={() => onSwitchTab('protocols')}
              className="p-2 rounded-lg bg-[#060e20] hover:bg-[#171f33] border border-[#2d3449] hover:border-orange-500/50 text-left transition-all"
            >
              <div className="text-[10px] font-mono text-slate-400">FIRST AID</div>
              <div className="text-xs font-semibold text-orange-300 flex items-center justify-between">
                <span>Triage Matrix</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </div>
            </button>

            <button
              id="action-forecast-btn"
              onClick={() => onSwitchTab('forecast')}
              className="p-2 rounded-lg bg-[#060e20] hover:bg-[#171f33] border border-[#2d3449] hover:border-orange-500/50 text-left transition-all"
            >
              <div className="text-[10px] font-mono text-slate-400">5-DAY ML</div>
              <div className="text-xs font-semibold text-orange-300 flex items-center justify-between">
                <span>Surge Horizon</span>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </div>
            </button>

            <button
              id="action-emergency-sos-quick-btn"
              onClick={onTriggerSOS}
              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-left transition-all"
            >
              <div className="text-[10px] font-mono text-red-400 font-bold">EMERGENCY</div>
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Call 108</span>
                <PhoneCall className="w-3 h-3 text-red-400" />
              </div>
            </button>
          </div>

        </div>

      </div>

      {/* Official Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1326] border border-red-500/50 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#2d3449] pb-3 mb-3">
              <div className="flex items-center gap-2 text-red-400 font-headline font-bold text-base">
                <ShieldAlert className="w-5 h-5" />
                <span>BMC DDMA Executive Order #419-B</span>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 font-sans max-h-96 overflow-y-auto pr-1">
              <p className="font-mono text-[11px] text-amber-300">
                ISSUED UNDER SECTION 30(2)(v) & 51 OF DISASTER MANAGEMENT ACT, 2005
              </p>
              <p>
                In view of IMD Heatwave Warning and AWS-4019 WBGT recording exceeding 34.2°C, the following statutory directives are in immediate force across Wards G/North, L, M/East, and F/North:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-200">
                <li><strong>Curfew on Outdoor Unshaded Labor:</strong> Complete halt from 11:30 to 16:30 IST.</li>
                <li><strong>Free ORS & Water Stations:</strong> Obligatory for all commercial employers and builders.</li>
                <li><strong>Designated Cooling Refuges:</strong> 18 municipal schools, community halls, and transit hubs open with 24/7 air-cooling.</li>
                <li><strong>Hospital Heat Wings:</strong> Lokmanya Tilak Sion Hospital and KEM Hospital activated under Code Red mass casualty surge protocols.</li>
              </ol>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2d3449] flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg"
              >
                Acknowledged
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

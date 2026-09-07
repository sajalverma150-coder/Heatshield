import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Droplet, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Sun, 
  Wind, 
  Flame, 
  HeartPulse, 
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  TrendingUp,
  Navigation,
  RefreshCw,
  Radio,
  FileText,
  Compass,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { WeatherTelemetry, UserHealthProfile, CoolingFacility } from '../../types';
import { CityData } from '../../data/indiaCities';

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
  onOpenHealthReport,
  isLiveApiLoading = false,
  dataSourceMode = 'live_api',
  onToggleDataSourceMode,
  onRefreshTelemetry,
}) => {
  const [selectedHourIndex, setSelectedHourIndex] = useState<number>(3); // 14:00 peak
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamically compute the diurnal trajectory from the current weather or forecast
  const hourlyData = useMemo(() => {
    const baseTemp = weather.dryBulbTemp;
    const baseWbgt = weather.wbgt;

    // Time offsets for typical diurnal cycle
    const intervals = [
      { time: '08:00', tempOffset: -4.2, wbgtOffset: -3.5 },
      { time: '10:00', tempOffset: -1.8, wbgtOffset: -1.6 },
      { time: '12:00', tempOffset: 1.2, wbgtOffset: 1.1 },
      { time: '14:00', tempOffset: 2.0, wbgtOffset: 1.8 }, // Peak heat
      { time: '16:00', tempOffset: 0.8, wbgtOffset: 0.7 },
      { time: '18:00', tempOffset: -1.9, wbgtOffset: -1.4 },
      { time: '20:00', tempOffset: -3.6, wbgtOffset: -2.8 },
    ];

    return intervals.map(({ time, tempOffset, wbgtOffset }) => {
      const temp = Number((baseTemp + tempOffset).toFixed(1));
      const wbgt = Number((baseWbgt + wbgtOffset).toFixed(1));

      let stress = 'Safe Work Limit';
      let sweatRate = '300 ml/h';

      if (wbgt >= 33.5 || temp >= 42.0) {
        stress = 'Mandatory Curfew';
        sweatRate = '950 ml/h';
      } else if (wbgt >= 31.5 || temp >= 39.0) {
        stress = 'Severe Heat Load';
        sweatRate = '750 ml/h';
      } else if (wbgt >= 29.0 || temp >= 35.0) {
        stress = 'Moderate Stress';
        sweatRate = '550 ml/h';
      } else {
        stress = 'Normal / Safe Limit';
        sweatRate = '350 ml/h';
      }

      return { time, temp, wbgt, stress, sweat: sweatRate };
    });
  }, [weather.dryBulbTemp, weather.wbgt]);

  // Determine dynamic risk status and directives
  const statusInfo = useMemo(() => {
    const isCurfew = weather.wbgt >= 33.5 || weather.dryBulbTemp >= 42.0;
    const isSevere = weather.wbgt >= 31.5 || weather.dryBulbTemp >= 39.0;
    const isModerate = weather.wbgt >= 29.0 || weather.dryBulbTemp >= 35.0;

    if (isCurfew) {
      return {
        stage: 'Stage IV Severe Heat Curfew',
        badgeColor: 'bg-red-500/15 text-red-300 border-red-500/30',
        dotColor: 'text-red-400',
        window: 'Mandatory Curfew Active (12:30 – 16:30 IST)',
        summary: 'Extreme thermal hazard active. Outdoor physical labor is prohibited under municipal NDMA order. Seek air-cooled shelters immediately.',
        hasCurfew: true,
      };
    }
    if (isSevere) {
      return {
        stage: 'Stage III Heat Emergency Standby',
        badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
        dotColor: 'text-orange-400',
        window: 'High Sun Exposure Window (12:00 – 16:00 IST)',
        summary: 'Significant heat stress danger. Outdoor physical labor should be reduced with mandatory shaded rest and frequent hydration breaks.',
        hasCurfew: false,
      };
    }
    if (isModerate) {
      return {
        stage: 'Stage II Heat Advisory (Yellow Alert)',
        badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dotColor: 'text-amber-400',
        window: 'Advisory: Hydrate frequently during afternoon hours',
        summary: 'Moderate thermal conditions. Vulnerable groups, outdoor workers, and seniors should stay hydrated with chilled fluids and ORS.',
        hasCurfew: false,
      };
    }
    return {
      stage: 'Normal / Moderate Conditions',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dotColor: 'text-emerald-400',
      window: 'No Curfew Restrictions • All Public Zones Open',
      summary: 'Current readings are within safe thermal thresholds. Standard hydration and sun protection recommended for outdoor activities.',
      hasCurfew: false,
    };
  }, [weather.wbgt, weather.dryBulbTemp]);

  const handleQuickWaterLog = (amount: number) => {
    onLogWater(amount);
    setToastMessage(`+${amount}ml logged`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const nearestShelter = facilities[0] || {
    name: 'District Community Hall & Cooling Shelter',
    distanceKm: 0.35,
    walkTimeMins: 4,
    indoorTemp: 24.5,
    capacity: 120,
    currentOccupancy: 45,
    hasOxygen: true,
  };

  const selectedHour = hourlyData[selectedHourIndex] || hourlyData[3];

  // SVG Chart boundaries calculation
  const allTemps = hourlyData.map(d => d.temp);
  const minChartTemp = Math.min(...allTemps, 20) - 2;
  const maxChartTemp = Math.max(...allTemps, 45) + 3;
  const tempRange = maxChartTemp - minChartTemp || 1;

  const getYCoord = (tempVal: number) => {
    // chart y spans from 165 (bottom) to 35 (top) -> range of 130
    const fraction = (tempVal - minChartTemp) / tempRange;
    return Math.round(165 - fraction * 130);
  };

  return (
    <div id="live-telemetry-screen" className="space-y-5 pb-8">
      
      {/* 1. Header Location & Telemetry Source Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm truncate">
                {selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : 'New Delhi, NCR'}
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md hidden md:inline">
                {weather.stationName}
              </span>
            </div>
            <span className="text-xs text-slate-400 block font-mono mt-0.5">
              Source: {weather.lastUpdated}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          {/* Data Source Switcher */}
          {onToggleDataSourceMode && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                id="source-toggle-live-api"
                onClick={() => onToggleDataSourceMode('live_api')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  dataSourceMode === 'live_api'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Real-time live satellite readings observed right now"
              >
                ● Live Real-Time API
              </button>
              <button
                id="source-toggle-heatwave-test"
                onClick={() => onToggleDataSourceMode('imd_heatwave')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  dataSourceMode === 'imd_heatwave'
                    ? 'bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Emergency heatwave simulation to test sirens & curfew alerts (42°C+)"
              >
                Simulated Heatwave (47°C+)
              </button>
            </div>
          )}

          {/* Sync Button */}
          {onRefreshTelemetry && (
            <button
              onClick={onRefreshTelemetry}
              disabled={isLiveApiLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="Refresh telemetry data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveApiLoading ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          )}

          {/* Change City Button */}
          {onOpenCitySelector && (
            <button
              onClick={onOpenCitySelector}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700 flex items-center gap-1.5"
            >
              <MapPin className="w-3 h-3 text-orange-400" />
              <span>Change Station</span>
            </button>
          )}
        </div>
      </div>

      {/* Data Source Explanation Note (helps user understand real-time vs simulation) */}
      <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span>
            {dataSourceMode === 'live_api' ? (
              <span>
                <strong>Live Satellite Mode:</strong> Displaying current real-time observations ({weather.dryBulbTemp}°C). If readings seem lower than summer heatwaves, this reflects today's actual local atmospheric conditions.
              </span>
            ) : (
              <span>
                <strong>Simulated Emergency Mode:</strong> Simulating a peak Indian summer heatwave ({weather.dryBulbTemp}°C) to test NDMA curfew protocols, shelter allocations, and hospital code orange response.
              </span>
            )}
          </span>
        </div>
        <button
          onClick={() => onToggleDataSourceMode && onToggleDataSourceMode(dataSourceMode === 'live_api' ? 'imd_heatwave' : 'live_api')}
          className="text-[11px] text-orange-400 hover:underline shrink-0 ml-3"
        >
          Switch to {dataSourceMode === 'live_api' ? 'Heatwave Test' : 'Live Real-Time'} →
        </button>
      </div>

      {/* 2. Hero Weather & Curfew Anchor Card */}
      <section 
        id="hero-heat-overview-card"
        className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden shadow-lg"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Main Temperature & Threat Summary */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusInfo.badgeColor}`}>
                {statusInfo.hasCurfew ? (
                  <Flame className={`w-3.5 h-3.5 ${statusInfo.dotColor}`} />
                ) : (
                  <ShieldCheck className={`w-3.5 h-3.5 ${statusInfo.dotColor}`} />
                )}
                <span>{statusInfo.stage}</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                {statusInfo.window}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-headline font-bold text-white tracking-tight">
                {weather.dryBulbTemp}°C
              </span>
              <div className="text-slate-400 text-sm font-sans">
                Feels like <strong className="text-orange-400 font-semibold">{weather.heatIndex}°C</strong> in sun
              </div>
            </div>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {statusInfo.summary}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Find Shelter */}
            <button
              id="hero-find-shelter-btn"
              onClick={() => onSwitchTab('cooling-finder')}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-950/40 transition-all flex items-center gap-2 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Nearest Shelter ({nearestShelter.walkTimeMins}m walk)</span>
            </button>

            {/* AI Triage */}
            <button
              id="hero-ai-triage-btn"
              onClick={onOpenTriage}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-orange-500/50 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Symptom Triage</span>
            </button>

            {/* Quick Water Log */}
            <button
              id="hero-quick-water-btn"
              onClick={() => handleQuickWaterLog(250)}
              className="px-3.5 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium border border-cyan-700/50 transition-all flex items-center gap-1.5"
              title="Log +250ml water intake immediately"
            >
              <Droplet className="w-4 h-4 text-cyan-400" />
              <span>+250ml Water</span>
            </button>
          </div>

        </div>

        {/* Toast confirmation message */}
        {toastMessage && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}
      </section>

      {/* 3. Essential Vitals Grid (4 Clean Bento Cards) */}
      <section id="biometeorology-vitals-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* WBGT Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">WBGT Heat Stress</span>
            {weather.wbgt >= 32 ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1">
            {weather.wbgt} <span className="text-sm font-sans font-normal text-slate-400">°C</span>
          </div>
          <div className={`text-xs font-medium mt-1 ${
            weather.wbgt >= 33.5 ? 'text-red-400' :
            weather.wbgt >= 31.5 ? 'text-orange-400' :
            weather.wbgt >= 29.0 ? 'text-amber-400' :
            'text-emerald-400'
          }`}>
            {weather.wbgt >= 33.5 ? 'Critical Threshold (>33.5°C)' :
             weather.wbgt >= 31.5 ? 'High Heat Strain (>31.5°C)' :
             weather.wbgt >= 29.0 ? 'Moderate Caution Zone' :
             'Normal Work Zone (<29°C)'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {weather.wbgt >= 32 ? 'Outdoor work halt advised' : 'Safe for monitored outdoor labor'}
          </p>
        </div>

        {/* Heat Index & Humidity */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Heat Index / RH</span>
            <Sun className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1">
            {weather.heatIndex} <span className="text-sm font-sans font-normal text-slate-400">°C</span>
          </div>
          <div className="text-xs text-orange-400 font-medium mt-1">
            {weather.humidity}% Relative Humidity
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {weather.humidity >= 65 ? 'Suppresses sweat evaporation' : 'Moderate evaporative cooling rate'}
          </p>
        </div>

        {/* Solar Radiation & UV */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Solar & UV Load</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1">
            {weather.solarRadiation} <span className="text-xs font-sans font-normal text-slate-400">W/m²</span>
          </div>
          <div className="text-xs text-amber-400 font-medium mt-1">
            {weather.solarRadiation >= 800 ? 'UV Index 10+ (Very High)' :
             weather.solarRadiation >= 500 ? 'UV Index 6-8 (High)' :
             'UV Index 3-5 (Moderate)'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {weather.solarRadiation >= 800 ? 'Sunburn risk within 15 mins' : 'Standard sun protection needed'}
          </p>
        </div>

        {/* Wind Speed & Loo Winds */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-medium">Wind Velocity</span>
            <Wind className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1">
            {weather.windSpeed} <span className="text-xs font-sans font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1">
            {weather.dryBulbTemp >= 40 && weather.windSpeed >= 12 ? 'Dry Desiccating Loo Winds' : 'Moderate Air Movement'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {weather.dryBulbTemp >= 40 ? 'Accelerates fluid loss in sun' : 'Assists ambient air ventilation'}
          </p>
        </div>

      </section>

      {/* 4. Two Balanced Columns: Heat Trajectory Curve & Personal Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left (7 cols): Diurnal Heat & Curfew Curve */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span>Today's Temperature & Curfew Timeline</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hourly trajectory calculated for {selectedCity?.name || 'Current Station'}
                </p>
              </div>
              <div className="text-xs font-mono text-slate-400 hidden sm:flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 bg-orange-400 rounded-full" /> Temp
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-1 bg-red-400 rounded-full" /> WBGT
                </span>
              </div>
            </div>

            {/* Clean SVG Temperature Graph */}
            <div className="w-full h-48 mt-4 bg-slate-950/60 rounded-xl border border-slate-800/80 p-3 relative">
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                {/* Reference Grid lines */}
                <line x1="40" y1="160" x2="560" y2="160" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="110" x2="560" y2="110" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="60" x2="560" y2="60" stroke="#1e293b" strokeWidth="1" />

                {/* Safe limit reference */}
                <line x1="40" y1="125" x2="560" y2="125" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <text x="45" y="120" fill="#38bdf8" fontSize="10" fontFamily="sans-serif">Safe WBGT Limit (29°C)</text>

                {/* Curfew window highlight rectangle - only shown if curfew thresholds reached */}
                {statusInfo.hasCurfew && (
                  <g>
                    <rect x="230" y="20" width="180" height="150" fill="#ef4444" fillOpacity="0.08" rx="8" />
                    <text x="320" y="36" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="bold">
                      CURFEW ZONE (12:30 - 16:30)
                    </text>
                  </g>
                )}

                {/* Lines connecting the dynamic points */}
                {(() => {
                  const points = hourlyData.map((pt, idx) => ({
                    x: 50 + idx * 83.3,
                    yTemp: getYCoord(pt.temp),
                    yWbgt: getYCoord(pt.wbgt),
                  }));

                  const pathTemp = points.reduce((acc, curr, idx) => {
                    return idx === 0 ? `M ${curr.x} ${curr.yTemp}` : `${acc} L ${curr.x} ${curr.yTemp}`;
                  }, '');

                  const pathWbgt = points.reduce((acc, curr, idx) => {
                    return idx === 0 ? `M ${curr.x} ${curr.yWbgt}` : `${acc} L ${curr.x} ${curr.yWbgt}`;
                  }, '');

                  return (
                    <>
                      <path d={pathTemp} fill="none" stroke="#f97316" strokeWidth="2.5" />
                      <path d={pathWbgt} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="3 2" />
                    </>
                  );
                })()}

                {/* Interactive Points */}
                {hourlyData.map((pt, idx) => {
                  const cx = 50 + idx * 83.3;
                  const cy = getYCoord(pt.temp);
                  const isSelected = selectedHourIndex === idx;

                  return (
                    <g key={pt.time} className="cursor-pointer" onClick={() => setSelectedHourIndex(idx)}>
                      {isSelected && (
                        <circle cx={cx} cy={cy} r="10" fill="#f97316" fillOpacity="0.2" />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 5.5 : 4}
                        fill={isSelected ? '#ffffff' : (pt.wbgt >= 33 ? '#ef4444' : '#f97316')}
                        stroke="#090e17"
                        strokeWidth="2"
                      />
                      <text
                        x={cx}
                        y="185"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#64748b'}
                        fontSize="10"
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

          {/* Selected Hour Details Bar */}
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/20 font-mono">
                {selectedHour.time} IST
              </span>
              <div>
                <span className="text-white font-medium">
                  Air {selectedHour.temp}°C • WBGT {selectedHour.wbgt}°C
                </span>
                <span className="text-slate-400 block text-[11px]">
                  {selectedHour.stress}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Sweat Rate:</span>
              <div className="font-mono text-orange-400 font-bold">{selectedHour.sweat}</div>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Personal Health & Hydration Engine */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-headline font-bold text-white">
                    Personal Health & Hydration
                  </h3>
                  <p className="text-xs text-slate-400">
                    {userProfile.fullName} ({userProfile.age} yrs)
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSwitchTab('profile')}
                className="text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                Edit
              </button>
            </div>

            {/* Hydration Progress */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 mb-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Daily Water Intake</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {userProfile.hydrationTodayMl} / {userProfile.targetWaterMl} ml
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((userProfile.hydrationTodayMl / userProfile.targetWaterMl) * 100))}%` }}
                />
              </div>

              {/* Quick Log Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleQuickWaterLog(250)}
                  className="flex-1 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-medium border border-cyan-800/40 transition-colors flex items-center justify-center gap-1"
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>+250ml ORS</span>
                </button>
                <button
                  onClick={() => handleQuickWaterLog(500)}
                  className="flex-1 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-medium border border-cyan-800/40 transition-colors flex items-center justify-center gap-1"
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>+500ml Water</span>
                </button>
              </div>
            </div>

            {/* Thermal Strain & Medication Vulnerability */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Cumulative Thermal Strain</span>
                <span className={`font-mono font-bold ${
                  weather.wbgt >= 32 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {weather.wbgt >= 32 ? 'Elevated Strain (Rest Advised)' : 'Stable Baseline'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ⚠️ <strong>Clinical Guidance:</strong> Maintain electrolyte balance with sodium/potassium ORS solutions when engaging in physical activities under outdoor heat.
              </p>
            </div>
          </div>

          {/* Clinical Dossier Shortcut */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {onOpenHealthReport ? (
              <button
                onClick={onOpenHealthReport}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-orange-400" />
                <span>View Clinical Health Dossier</span>
              </button>
            ) : <span />}

            <button
              onClick={onOpenTriage}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
            >
              <span>AI Triage</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

      {/* 5. Support Row: Designated Cooling Shelter & Curfew Protocol Order */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Designated Shelter Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="font-headline font-bold text-white text-sm">
                  Nearest Designated Cooling Shelter
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {nearestShelter.walkTimeMins} min walk
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-white text-sm">
                {nearestShelter.name}
              </div>
              <p className="text-xs text-slate-400">
                Chilled indoor temperature: <strong className="text-emerald-400">{nearestShelter.indoorTemp}°C</strong> • Misting fans, cold WHO-ORS & hydration beds available
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              {nearestShelter.capacity - nearestShelter.currentOccupancy} beds currently open
            </span>
            <button
              onClick={() => onNavigateToFacility(nearestShelter as CoolingFacility)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>

        {/* Official Statutory Directives */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-orange-400">
                <ShieldAlert className="w-4 h-4" />
                <h3 className="font-headline font-bold text-white text-sm">
                  NDMA Heat Action Protocol
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Order #419-B
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>
                  <strong>{statusInfo.hasCurfew ? 'Outdoor Labor Curfew:' : 'Standard Work Window:'}</strong> {statusInfo.hasCurfew ? 'Physical work strictly suspended during peak heat hours.' : 'Normal shifts permitted with mandatory drinking water facilities.'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span><strong>Hydration Stations:</strong> Free chilled ORS is available at transit hubs, metro concourses, and bus stops across the district.</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">Section 51 DMA 2005</span>
            <button
              onClick={() => setShowOrderModal(true)}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Read Full Executive Order</span>
            </button>
          </div>
        </div>

      </div>

      {/* Official Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2 text-red-400 font-headline font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>National Disaster Management Act Order #419-B</span>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 font-sans max-h-96 overflow-y-auto pr-1">
              <p className="font-mono text-[11px] text-amber-300">
                ISSUED UNDER SECTION 30(2)(v) & 51 OF DISASTER MANAGEMENT ACT, 2005
              </p>
              <p>
                In view of IMD Heatwave Warning Guidelines and AWS WBGT monitoring thresholds, the following statutory directives govern municipal heat action:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-200">
                <li><strong>Curfew on Outdoor Unshaded Labor:</strong> Enforced whenever WBGT breaches 33.5°C or ambient temp breaches 42°C.</li>
                <li><strong>Free ORS & Water Stations:</strong> Obligatory for all commercial employers and municipal bus/metro junctions.</li>
                <li><strong>Designated Cooling Refuges:</strong> Municipal community halls and transit hubs open with 24/7 air-cooling.</li>
                <li><strong>Hospital Heat Wings:</strong> Mass casualty emergency departments activated under Code Orange heat protocols.</li>
              </ol>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

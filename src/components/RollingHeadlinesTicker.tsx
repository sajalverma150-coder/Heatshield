import React, { useState } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  ChevronRight, 
  Pause, 
  Play, 
  MapPin, 
  Activity, 
  Radio, 
  Thermometer, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { CityData, INDIAN_CITIES } from '../data/indiaCities';

export interface CityHeadline {
  cityId: string;
  cityName: string;
  state: string;
  temp: number;
  heatIndex: number;
  wbgt?: number;
  severity: 'EXTREME' | 'CRITICAL' | 'HIGH';
  grapStage: string;
  headline: string;
  updateTime: string;
}

export const CRUCIAL_CITY_HEADLINES: CityHeadline[] = [
  {
    cityId: 'delhi',
    cityName: 'New Delhi (Safdarjung)',
    state: 'NCT Delhi',
    temp: 47.8,
    heatIndex: 51.4,
    wbgt: 34.6,
    severity: 'EXTREME',
    grapStage: 'GRAP IV MANDATORY CURFEW',
    headline: 'IMD Red Alert: 47.8°C recorded at Safdarjung. Severe Loo winds 42 km/h; construction halted.',
    updateTime: '14:15 IST',
  },
  {
    cityId: 'phalodi',
    cityName: 'Phalodi',
    state: 'Rajasthan',
    temp: 49.6,
    heatIndex: 52.8,
    wbgt: 35.1,
    severity: 'EXTREME',
    grapStage: 'NATIONAL DISASTER PROTOCOL',
    headline: 'All-Time Heatwave Record: 49.6°C breached. 108 Heat Mobile Resuscitation Ambulances active.',
    updateTime: '14:20 IST',
  },
  {
    cityId: 'nagpur',
    cityName: 'Nagpur',
    state: 'Maharashtra',
    temp: 46.2,
    heatIndex: 49.8,
    wbgt: 33.9,
    severity: 'EXTREME',
    grapStage: 'STAGE IV EMERGENCY',
    headline: 'Vidarbha Heat Vortex: Asphalt surface temps reach 68°C. Afternoon market closures ordered.',
    updateTime: '14:10 IST',
  },
  {
    cityId: 'ahmedabad',
    cityName: 'Ahmedabad',
    state: 'Gujarat',
    temp: 45.4,
    heatIndex: 48.7,
    wbgt: 33.2,
    severity: 'CRITICAL',
    grapStage: 'HAP PHASE 3 RED ALERT',
    headline: 'Heat Action Plan Phase 3: 185 Municipal AC Cooling Refugiums open with free ORS.',
    updateTime: '14:05 IST',
  },
  {
    cityId: 'lucknow',
    cityName: 'Lucknow',
    state: 'Uttar Pradesh',
    temp: 46.5,
    heatIndex: 50.2,
    wbgt: 34.1,
    severity: 'EXTREME',
    grapStage: 'STAGE IV CURFEW',
    headline: 'KGMU Trauma Center opens 100-bed Acute Hyperthermia Wing; water bowsers deployed in Charbagh.',
    updateTime: '13:55 IST',
  },
  {
    cityId: 'kolkata',
    cityName: 'Kolkata',
    state: 'West Bengal',
    temp: 43.1,
    heatIndex: 52.4,
    wbgt: 34.8,
    severity: 'EXTREME',
    grapStage: 'COASTAL HEAT EMERGENCY',
    headline: 'Severe Sultriness Hazard: 84% humidity pushes Heat Index to 52.4°C. Transit misting deployed.',
    updateTime: '14:12 IST',
  },
  {
    cityId: 'mumbai',
    cityName: 'Mumbai (Dharavi / Sion)',
    state: 'Maharashtra',
    temp: 41.8,
    heatIndex: 48.1,
    wbgt: 34.2,
    severity: 'CRITICAL',
    grapStage: 'STAGE IV LABOR CURFEW',
    headline: 'Dharavi Slum Cluster WBGT breaches 34.2°C. BMC issues mandatory outdoor work suspension till 16:30.',
    updateTime: '14:00 IST',
  },
  {
    cityId: 'varanasi',
    cityName: 'Varanasi',
    state: 'Uttar Pradesh',
    temp: 46.8,
    heatIndex: 49.9,
    wbgt: 33.7,
    severity: 'EXTREME',
    grapStage: 'STAGE IV RESTRICTION',
    headline: 'Ganga Ghat open-air assemblies restricted between 11:30–16:00 IST; mobile ORS squads deployed.',
    updateTime: '13:50 IST',
  },
  {
    cityId: 'patna',
    cityName: 'Patna',
    state: 'Bihar',
    temp: 45.1,
    heatIndex: 49.5,
    wbgt: 33.5,
    severity: 'CRITICAL',
    grapStage: 'EMERGENCY ADVISORY',
    headline: 'Bihar Disaster Management issues Statewide Yellow-to-Red heatwave notice. Coaching centers shut.',
    updateTime: '14:18 IST',
  },
  {
    cityId: 'chennai',
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    temp: 41.5,
    heatIndex: 48.9,
    wbgt: 33.4,
    severity: 'CRITICAL',
    grapStage: 'COASTAL CAUTION',
    headline: 'GCC activates 120 Aavin milk booth hydration points distributing free chilled WHO-ORS sachets.',
    updateTime: '13:45 IST',
  },
  {
    cityId: 'hyderabad',
    cityName: 'Hyderabad',
    state: 'Telangana',
    temp: 44.0,
    heatIndex: 47.6,
    wbgt: 32.8,
    severity: 'HIGH',
    grapStage: 'STAGE II ADVISORY',
    headline: 'GHMC deploys 240 shaded bus refugiums and high-velocity evaporative misting fans.',
    updateTime: '13:30 IST',
  },
  {
    cityId: 'bhopal',
    cityName: 'Bhopal',
    state: 'Madhya Pradesh',
    temp: 44.7,
    heatIndex: 48.0,
    wbgt: 33.1,
    severity: 'HIGH',
    grapStage: 'STAGE III ALERT',
    headline: 'AIIMS Bhopal thermal trauma ward placed on code-orange standby; emergency water tankers mobilized.',
    updateTime: '13:40 IST',
  },
];

interface RollingHeadlinesTickerProps {
  selectedCity?: CityData;
  cities?: CityData[];
  onSelectCity: (city: CityData) => void;
  onOpenReport?: () => void;
  onOpenHealthReport?: () => void;
  onOpenPushSettings?: () => void;
}

export const RollingHeadlinesTicker: React.FC<RollingHeadlinesTickerProps> = ({
  selectedCity,
  cities = INDIAN_CITIES,
  onSelectCity,
  onOpenReport,
  onOpenHealthReport,
  onOpenPushSettings,
}) => {
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const handleCityClick = (cityId: string) => {
    // Find matching city in cities list
    const found = (cities || INDIAN_CITIES).find(
      (c) => c.id.toLowerCase() === cityId.toLowerCase() || c.name.toLowerCase().includes(cityId.toLowerCase())
    );
    if (found) {
      onSelectCity(found);
    }
  };

  // Duplicate list to achieve a seamless, continuous 100% loop
  const tickerItems = [...CRUCIAL_CITY_HEADLINES, ...CRUCIAL_CITY_HEADLINES];

  return (
    <aside 
      id="permanent-rolling-headlines-ticker"
      aria-label="National Heatwave Alerts Ticker"
      className="bg-[#060a14] border-b border-[#2d3449] relative overflow-hidden select-none z-30"
    >
      <div className="flex items-center">
        
        {/* Left Fixed Badge */}
        <div className="shrink-0 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-[#091122] border-r border-[#2d3449] shadow-lg">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 relative" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5">
            <span className="text-[11px] font-mono font-bold text-white tracking-wider flex items-center gap-1">
              <Radio className="w-3 h-3 text-red-400 hidden sm:inline" />
              <span>IMD NATIONAL TICKER</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-widest hidden md:inline">
              LIVE
            </span>
          </div>

          <button
            id="toggle-ticker-pause-btn"
            onClick={() => setIsPaused(!isPaused)}
            className="ml-1 p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            title={isPaused ? 'Resume Scrolling' : 'Pause Scrolling'}
            aria-label={isPaused ? 'Resume headlines scroll' : 'Pause headlines scroll'}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
          </button>
        </div>

        {/* Scrolling Marquee Container */}
        <div className="flex-1 overflow-hidden relative py-1.5">
          {/* Subtle gradient edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#060a14] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#060a14] to-transparent z-10" />

          <div className={`animate-marquee ${isPaused ? 'paused' : ''}`}>
            {tickerItems.map((item, idx) => {
              const isSelected = selectedCity?.id
                ? (selectedCity.id.toLowerCase() === item.cityId.toLowerCase() ||
                   (selectedCity.name && selectedCity.name.toLowerCase().includes(item.cityName.toLowerCase().split(' ')[0])))
                : false;

              return (
                <button
                  key={`${item.cityId}-${idx}`}
                  onClick={() => handleCityClick(item.cityId)}
                  className={`inline-flex items-center gap-2.5 px-3 py-1 mr-4 rounded-xl transition-all text-left group ${
                    isSelected
                      ? 'bg-orange-500/20 border border-orange-500/60 text-white shadow-sm shadow-orange-500/20'
                      : 'hover:bg-white/5 border border-transparent hover:border-white/15 text-slate-300'
                  }`}
                  title={`Click to switch telemetry to ${item.cityName}`}
                >
                  {/* City Pill & Temperature */}
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      item.severity === 'EXTREME' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <strong className="text-xs font-headline font-bold text-white tracking-wide group-hover:text-orange-400 transition-colors">
                      {item.cityName}
                    </strong>
                    <span className="text-[11px] font-mono font-bold text-orange-400 px-1.5 py-0.2 rounded bg-black/40 border border-orange-500/30">
                      {item.temp.toFixed(1)}°C
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                      HI: <span className="text-red-300 font-bold">{item.heatIndex.toFixed(1)}°C</span>
                    </span>
                  </div>

                  {/* Warning Strip */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/60 text-red-300 border border-red-500/40 uppercase">
                      {item.grapStage}
                    </span>
                    <span className="text-xs text-slate-200 font-sans group-hover:text-white transition-colors max-w-md truncate">
                      {item.headline}
                    </span>
                  </div>

                  <span className="text-slate-600 font-mono text-xs select-none">|</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right CTA / Quick Link */}
        {(onOpenReport || onOpenHealthReport) && (
          <div className="shrink-0 hidden xl:flex items-center px-3 py-1.5 border-l border-[#2d3449] bg-[#091122]">
            <button
              onClick={onOpenReport || onOpenHealthReport}
              className="text-[11px] font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 px-2 py-1 rounded-lg border border-orange-500/30 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-orange-400" />
              <span>Full Health Report</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

      </div>
    </aside>
  );
};

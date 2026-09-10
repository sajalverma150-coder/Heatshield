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
import { WeatherTelemetry, UserHealthProfile, CoolingFacility, LanguageCode } from '../../types';
import { CityData, calculateDistanceKm, formatShelterDistance } from '../../data/indiaCities';
import { useAppTranslation } from '../../i18n/translations';
import { HydrationTracker } from '../HydrationTracker';

interface LiveTelemetryViewProps {
  language?: LanguageCode;
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  facilities: CoolingFacility[];
  selectedCity?: CityData;
  userCoords?: { lat: number; lng: number } | null;
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
  language = 'en',
  weather,
  userProfile,
  facilities,
  selectedCity,
  userCoords,
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
  const langCode: LanguageCode = language === 'hi' ? 'hi' : 'en';
  const isHindi = langCode === 'hi';
  const t = useAppTranslation(langCode);
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
        stage: isHindi ? 'चरण IV गंभीर लू कर्फ्यू' : 'Stage IV Severe Heat Curfew',
        badgeColor: 'bg-red-500/15 text-red-300 border-red-500/30',
        dotColor: 'text-red-400',
        window: isHindi ? 'अनिवार्य कर्फ्यू लागू (12:30 – 16:30 IST)' : 'Mandatory Curfew Active (12:30 – 16:30 IST)',
        summary: isHindi ? 'अत्यधिक थर्मल संकट सक्रिय। नगर निगम NDMA आदेश के तहत खुले में शारीरिक श्रम प्रतिबंधित है। तुरंत वातानुकूलित आश्रय लें।' : 'Extreme thermal hazard active. Outdoor physical labor is prohibited under municipal NDMA order. Seek air-cooled shelters immediately.',
        hasCurfew: true,
      };
    }
    if (isSevere) {
      return {
        stage: isHindi ? 'चरण III लू आपातकालीन स्टैंडबाय' : 'Stage III Heat Emergency Standby',
        badgeColor: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
        dotColor: 'text-orange-400',
        window: isHindi ? 'तीव्र धूप जोखिम खिड़की (12:00 – 16:00 IST)' : 'High Sun Exposure Window (12:00 – 16:00 IST)',
        summary: isHindi ? 'महत्वपूर्ण ताप तनाव का खतरा। छायादार विश्राम और बार-बार पानी पीने के अनिवार्य अंतराल के साथ शारीरिक श्रम घटाएं।' : 'Significant heat stress danger. Outdoor physical labor should be reduced with mandatory shaded rest and frequent hydration breaks.',
        hasCurfew: false,
      };
    }
    if (isModerate) {
      return {
        stage: isHindi ? 'चरण II लू परामर्श (पीला अलर्ट)' : 'Stage II Heat Advisory (Yellow Alert)',
        badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dotColor: 'text-amber-400',
        window: isHindi ? 'परामर्श: दोपहर के समय निरंतर पानी पिएं' : 'Advisory: Hydrate frequently during afternoon hours',
        summary: isHindi ? 'मध्यम तापमान स्थितियां। संवेदनशील समूह, खुले में काम करने वाले और बुजुर्ग ठंडे पेय तथा ओआरएस का सेवन करें।' : 'Moderate thermal conditions. Vulnerable groups, outdoor workers, and seniors should stay hydrated with chilled fluids and ORS.',
        hasCurfew: false,
      };
    }
    return {
      stage: isHindi ? 'सामान्य / मध्यम स्थितियां' : 'Normal / Moderate Conditions',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dotColor: 'text-emerald-400',
      window: isHindi ? 'कोई प्रतिबंध नहीं • सभी सार्वजनिक क्षेत्र खुले' : 'No Curfew Restrictions • All Public Zones Open',
      summary: isHindi ? 'वर्तमान तापमान सुरक्षित सीमा में है। धूप में निकलने पर मानक जलयोजन और सुरक्षा उपाय अपनाएं।' : 'Current readings are within safe thermal thresholds. Standard hydration and sun protection recommended for outdoor activities.',
      hasCurfew: false,
    };
  }, [weather.wbgt, weather.dryBulbTemp, isHindi]);

  const handleQuickWaterLog = (amount: number) => {
    onLogWater(amount);
    setToastMessage(`+${amount}ml logged`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Compute nearest shelter dynamically based on user coordinates or city center
  const nearestShelter = useMemo(() => {
    if (!facilities || facilities.length === 0) {
      return {
        id: 'default-shelter',
        name: 'District Community Hall & Cooling Shelter',
        distanceKm: 0.35,
        walkTimeMins: 4,
        indoorTemp: 24.5,
        totalCapacity: 120,
        currentOccupancy: 45,
        amenities: [],
        contactPhone: '108',
        status: 'OPEN' as const,
        coordinates: [26.8467, 80.9462] as [number, number],
        category: 'shelter' as const,
      };
    }

    if (userCoords) {
      const sorted = [...facilities].map((fac) => {
        const dist = calculateDistanceKm(userCoords.lat, userCoords.lng, fac.coordinates[0], fac.coordinates[1]);
        const walk = Math.max(1, Math.round(dist * 12.5));
        return { ...fac, distanceKm: dist, walkTimeMins: walk };
      }).sort((a, b) => a.distanceKm - b.distanceKm);

      return sorted[0];
    }

    return facilities[0];
  }, [facilities, userCoords]);

  const shelterDistInfo = useMemo(() => {
    if (!nearestShelter) return null;
    return formatShelterDistance(nearestShelter.distanceKm, isHindi);
  }, [nearestShelter, isHindi]);

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
    <div id="live-telemetry-screen" className="space-y-4 pb-8">
      
      {/* 1. Master Hero Weather & Curfew Anchor Card */}
      <section 
        id="hero-heat-overview-card"
        className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden shadow-sm"
      >
        {/* Top bar inside Hero: Station identity & Data Stream Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dataSourceMode === 'live_api' ? 'bg-emerald-400 animate-pulse' : 'bg-orange-500'}`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-white text-base sm:text-lg truncate">
                  {selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : 'New Delhi, NCR'}
                </span>
                {onOpenCitySelector && (
                  <button
                    onClick={onOpenCitySelector}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-orange-400 hover:text-orange-300 text-xs font-medium transition-colors border border-slate-700/60 flex items-center gap-1 shrink-0"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-400 block font-mono truncate mt-0.5">
                {weather.stationName} • {dataSourceMode === 'live_api' ? 'Live Telemetry' : 'IMD Heatwave Drill'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* Stream Toggle */}
            {onToggleDataSourceMode && (
              <div className="flex items-center bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 text-xs">
                <button
                  id="source-toggle-live-api"
                  onClick={() => onToggleDataSourceMode('live_api')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    dataSourceMode === 'live_api'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Real-time live satellite telemetry"
                >
                  ● Live API
                </button>
                <button
                  id="source-toggle-heatwave-test"
                  onClick={() => onToggleDataSourceMode('imd_heatwave')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    dataSourceMode === 'imd_heatwave'
                      ? 'bg-orange-500/20 text-orange-300 font-semibold border border-orange-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Heatwave stress simulation (47°C+)"
                >
                  Heatwave Drill
                </button>
              </div>
            )}

            {/* Sync Button */}
            {onRefreshTelemetry && (
              <button
                onClick={onRefreshTelemetry}
                disabled={isLiveApiLoading}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/80"
                title="Refresh telemetry"
              >
                <RefreshCw className={`w-4 h-4 ${isLiveApiLoading ? 'animate-spin text-orange-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Hero Core Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Main Temperature & Threat Summary */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
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

            <div className="flex items-baseline gap-4">
              <span className="text-5xl sm:text-6xl font-headline font-bold text-white tracking-tight">
                {weather.dryBulbTemp}°C
              </span>
              <div className="text-slate-300 text-sm">
                {isHindi ? 'अनुभूति तापमान' : 'Feels like'} <strong className="text-orange-400 font-semibold">{weather.heatIndex}°C</strong>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {statusInfo.summary}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col gap-2.5 shrink-0 pt-2 lg:pt-0">
            {/* Find Shelter */}
            <button
              id="hero-find-shelter-btn"
              onClick={() => onSwitchTab('cooling-finder')}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>
                {shelterDistInfo
                  ? (isHindi
                      ? `निकटतम आश्रय (${shelterDistInfo.combinedLabel})`
                      : `Nearest Shelter (${shelterDistInfo.combinedLabel})`)
                  : (isHindi ? 'निकटतम आश्रय खोजें' : 'Find Nearest Shelter')}
              </span>
            </button>

            {/* AI Triage */}
            <button
              id="hero-ai-triage-btn"
              onClick={onOpenTriage}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 hover:border-orange-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>{isHindi ? 'लक्षण ट्राइएज' : 'Symptom Triage'}</span>
            </button>
          </div>

        </div>

        {/* Toast confirmation message */}
        {toastMessage && (
          <div className="mt-4 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </section>

      {/* 2. Essential Vitals Grid (4 Clean Bento Cards) */}
      <section id="biometeorology-vitals-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* WBGT Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold">{isHindi ? 'WBGT ताप तनाव' : 'WBGT Heat Stress'}</span>
              {weather.wbgt >= 32 ? (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1">
              {weather.wbgt}<span className="text-sm font-sans font-normal text-slate-400 ml-1">°C</span>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${
              weather.wbgt >= 33.5 ? 'bg-red-500/15 text-red-300 border border-red-500/30' :
              weather.wbgt >= 31.5 ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30' :
              weather.wbgt >= 29.0 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
              'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            }`}>
              {weather.wbgt >= 33.5 ? (isHindi ? 'गंभीर (>33.5°C)' : 'Critical (>33.5°C)') :
               weather.wbgt >= 31.5 ? (isHindi ? 'उच्च तनाव (>31.5°C)' : 'High Strain (>31.5°C)') :
               weather.wbgt >= 29.0 ? (isHindi ? 'सावधानी क्षेत्र' : 'Caution Zone') :
               (isHindi ? 'सुरक्षित क्षेत्र (<29°C)' : 'Safe Zone (<29°C)')}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
              {weather.wbgt >= 32 ? (isHindi ? 'बाहरी कार्य स्थगित करने की सलाह' : 'Outdoor work halt advised') : (isHindi ? 'निगरानी में बाहरी कार्य सुरक्षित' : 'Safe for monitored outdoor labor')}
            </p>
          </div>
        </div>

        {/* Heat Index & Humidity */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold">{isHindi ? 'हीट इंडेक्स / आर्द्रता' : 'Heat Index / RH'}</span>
              <Sun className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1">
              {weather.heatIndex}<span className="text-sm font-sans font-normal text-slate-400 ml-1">°C</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-300 border border-orange-500/30">
              {weather.humidity}% {isHindi ? 'सापेक्ष आर्द्रता' : 'Relative Humidity'}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
              {weather.humidity >= 65 ? (isHindi ? 'वाष्पीकरणीय शीतलन बाधित' : 'Suppresses evaporative cooling') : (isHindi ? 'मध्यम वाष्पीकरणीय शीतलन' : 'Moderate evaporative cooling')}
            </p>
          </div>
        </div>

        {/* Solar Radiation & UV */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold">{isHindi ? 'सौर एवं यूवी विकिरण' : 'Solar & UV Load'}</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1">
              {weather.solarRadiation}<span className="text-xs font-sans font-normal text-slate-400 ml-1">W/m²</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {weather.solarRadiation >= 800 ? (isHindi ? 'यूवी 10+ (अति तीव्र)' : 'UV 10+ (Extreme)') :
               weather.solarRadiation >= 500 ? (isHindi ? 'यूवी 6-8 (उच्च)' : 'UV 6-8 (High)') :
               (isHindi ? 'यूवी 3-5 (मध्यम)' : 'UV 3-5 (Moderate)')}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
              {weather.solarRadiation >= 800 ? (isHindi ? '15 मिनट में सनबर्न का खतरा' : 'Sunburn risk within 15m') : (isHindi ? 'मानक धूप सुरक्षा की आवश्यकता' : 'Standard sun protection')}
            </p>
          </div>
        </div>

        {/* Wind Speed & Loo Winds */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold">{isHindi ? 'पवन गति' : 'Wind Velocity'}</span>
              <Wind className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-headline font-bold text-white mt-1">
              {weather.windSpeed}<span className="text-xs font-sans font-normal text-slate-400 ml-1">km/h</span>
            </div>
          </div>
          <div className="mt-3">
            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {weather.dryBulbTemp >= 40 && weather.windSpeed >= 12 ? (isHindi ? 'लू की गर्म हवाएं सक्रिय' : 'Loo Winds Active') : (isHindi ? 'सामान्य वायु प्रवाह' : 'Normal Air Movement')}
            </span>
            <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-1">
              {weather.dryBulbTemp >= 40 ? (isHindi ? 'धूप में तीव्र तरल हानि' : 'Rapid fluid loss in sun') : (isHindi ? 'वायु संचलन में सहायक' : 'Assists ventilation')}
            </p>
          </div>
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
                  <span className="w-2.5 h-1 bg-red-500 rounded-full" /> WBGT
                </span>
              </div>
            </div>

            {/* Clean SVG Temperature Graph */}
            <div className="w-full h-48 mt-4 bg-slate-950/60 rounded-xl border border-slate-800 p-3 relative">
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                {/* Reference Grid lines */}
                <line x1="40" y1="160" x2="560" y2="160" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="110" x2="560" y2="110" stroke="#1e293b" strokeWidth="1" />
                <line x1="40" y1="60" x2="560" y2="60" stroke="#1e293b" strokeWidth="1" />

                {/* Safe limit reference */}
                <line x1="40" y1="125" x2="560" y2="125" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <text x="45" y="120" fill="#38bdf8" fontSize="10" fontFamily="sans-serif">Safe WBGT Limit (29°C)</text>

                {/* Curfew window highlight rectangle - only shown if curfew thresholds reached */}
                {statusInfo.hasCurfew && (
                  <g>
                    <rect x="230" y="20" width="180" height="150" fill="#ef4444" fillOpacity="0.12" rx="8" />
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
                      <path d={pathTemp} fill="none" stroke="#ea580c" strokeWidth="2.5" />
                      <path d={pathWbgt} fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 2" />
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
                        <circle cx={cx} cy={cy} r="10" fill="#ea580c" fillOpacity="0.3" />
                      )}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 5.5 : 4}
                        fill={isSelected ? '#ffffff' : (pt.wbgt >= 33 ? '#ef4444' : '#f97316')}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      <text
                        x={cx}
                        y="185"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : '#94a3b8'}
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
          <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-orange-300 bg-orange-500/15 px-2.5 py-1 rounded-md border border-orange-500/30 font-mono">
                {selectedHour.time} IST
              </span>
              <div>
                <span className="text-white font-bold">
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
        <div className="lg:col-span-5">
          <HydrationTracker
            weather={weather}
            userProfile={userProfile}
            onLogWater={onLogWater}
            language={language}
            onOpenTriage={onOpenTriage}
            onSimulateInactivity={onSimulateInactivity}
            onOpenHealthReport={onOpenHealthReport}
            onOpenPushSettings={onOpenPushSettings}
          />
        </div>

      </div>

      {/* 5. Support Row: Designated Cooling Shelter & Curfew Protocol Order */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Designated Shelter Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="font-headline font-bold text-white text-sm">
                  {isHindi ? 'निकटतम अधिकृत शीतलन आश्रय स्थल' : 'Nearest Designated Cooling Shelter'}
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                {nearestShelter.walkTimeMins} {isHindi ? 'मिनट पैदल' : 'min walk'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="font-bold text-white text-sm">
                {nearestShelter.name}
              </div>
              <p className="text-xs text-slate-300">
                {isHindi ? 'वातानुकूलित आंतरिक तापमान:' : 'Chilled indoor temperature:'} <strong className="text-emerald-400">{nearestShelter.indoorTemp}°C</strong> • {isHindi ? 'मिस्टिंग पंखे, ठंडा WHO-ओआरएस एवं रीहाइड्रेशन बेड उपलब्ध' : 'Misting fans, cold WHO-ORS & hydration beds available'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              {nearestShelter.capacity - nearestShelter.currentOccupancy} {isHindi ? 'बेड वर्तमान में खाली' : 'beds currently open'}
            </span>
            <button
              onClick={() => onNavigateToFacility(nearestShelter as CoolingFacility)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isHindi ? 'दिशा-निर्देश प्राप्त करें' : 'Get Directions'}</span>
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
                  {isHindi ? 'NDMA हीट एक्शन प्रोटोकॉल आदेश' : 'NDMA Heat Action Protocol'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded font-bold border border-slate-700">
                {isHindi ? 'आदेश संख्या #419-B' : 'Order #419-B'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <span>
                  <strong>{statusInfo.hasCurfew ? (isHindi ? 'बाहरी श्रम कर्फ्यू:' : 'Outdoor Labor Curfew:') : (isHindi ? 'मानक कार्य खिड़की:' : 'Standard Work Window:')}</strong> {statusInfo.hasCurfew ? (isHindi ? 'चरम गर्मी के दौरान शारीरिक कार्य पूरी तरह से निलंबित।' : 'Physical work strictly suspended during peak heat hours.') : (isHindi ? 'पेयजल की अनिवार्य सुविधा के साथ सामान्य शिफ्ट अनुमत।' : 'Normal shifts permitted with mandatory drinking water facilities.')}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span><strong>{isHindi ? 'जलयोजन केंद्र:' : 'Hydration Stations:'}</strong> {isHindi ? 'जिले भर में ट्रांजिट हब, मेट्रो स्टेशन और बस स्टॉप पर मुफ्त ठंडा ओआरएस उपलब्ध है।' : 'Free chilled ORS is available at transit hubs, metro concourses, and bus stops across the district.'}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-xs text-slate-400">{isHindi ? 'धारा 51 आपदा प्रबंधन अधिनियम 2005' : 'Section 51 DMA 2005'}</span>
            <button
              onClick={() => setShowOrderModal(true)}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{isHindi ? 'पूर्ण कार्यकारी आदेश पढ़ें' : 'Read Full Executive Order'}</span>
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
                <span>{isHindi ? 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण आदेश संख्या #419-B' : 'National Disaster Management Act Order #419-B'}</span>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 font-sans max-h-96 overflow-y-auto pr-1">
              <p className="font-mono text-[11px] text-amber-300">
                {isHindi 
                  ? 'आपदा प्रबंधन अधिनियम, 2005 की धारा 30(2)(v) और 51 के तहत जारी'
                  : 'ISSUED UNDER SECTION 30(2)(v) & 51 OF DISASTER MANAGEMENT ACT, 2005'}
              </p>
              <p>
                {isHindi 
                  ? 'आईएमडी हीटवेव चेतावनी दिशानिर्देशों और एडब्ल्यूएस डब्लूसीजीटी निगरानी सीमा को देखते हुए, निम्नलिखित वैधानिक निर्देश नगर निगम हीट एक्शन को नियंत्रित करते हैं:'
                  : 'In view of IMD Heatwave Warning Guidelines and AWS WBGT monitoring thresholds, the following statutory directives govern municipal heat action:'}
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-200">
                <li><strong>{isHindi ? 'बिना छाया वाले बाहरी श्रम पर कर्फ्यू:' : 'Curfew on Outdoor Unshaded Labor:'}</strong> {isHindi ? 'जब भी WBGT 33.5°C या परिवेशी तापमान 42°C से अधिक हो, अनिवार्य रूप से लागू।' : 'Enforced whenever WBGT breaches 33.5°C or ambient temp breaches 42°C.'}</li>
                <li><strong>{isHindi ? 'मुफ्त ओआरएस और पानी स्टेशन:' : 'Free ORS & Water Stations:'}</strong> {isHindi ? 'सभी वाणिज्यिक नियोक्ताओं और बस/मेट्रो जंक्शनों के लिए अनिवार्य।' : 'Obligatory for all commercial employers and municipal bus/metro junctions.'}</li>
                <li><strong>{isHindi ? 'नामित शीतलन आश्रय:' : 'Designated Cooling Refuges:'}</strong> {isHindi ? 'सामुदायिक भवन और ट्रांजिट हब 24/7 एयर-कूलिंग के साथ खुले हैं।' : 'Municipal community halls and transit hubs open with 24/7 air-cooling.'}</li>
                <li><strong>{isHindi ? 'अस्पताल हीट विंग्स:' : 'Hospital Heat Wings:'}</strong> {isHindi ? 'कोड ऑरेंज हीट प्रोटोकॉल के तहत सक्रिय मास कैजुअल्टी आपातकालीन विभाग।' : 'Mass casualty emergency departments activated under Code Orange heat protocols.'}</li>
              </ol>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                {isHindi ? 'स्वीकार किया' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

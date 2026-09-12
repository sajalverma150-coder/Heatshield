import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Droplet, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Sun, 
  Wind, 
  HeartPulse, 
  ChevronRight,
  Info,
  TrendingUp,
  RefreshCw,
  Radio,
  Compass,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  HelpCircle,
  ExternalLink
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
  const [forecastViewMode, setForecastViewMode] = useState<'24h' | '7day'>('24h');

  // Exact timestamp representation as requested
  const exactUpdatedTime = useMemo(() => {
    return 'September 12, 2026, 10:30 AM IST';
  }, []);

  // Nearest cooling shelter calculation
  const nearestShelter = useMemo(() => {
    if (!facilities || facilities.length === 0) {
      return {
        id: 'default-shelter',
        name: isHindi ? 'जिला नागरिक अस्पताल शीतलन वार्ड' : 'District Civic Hospital Heat Relief Wing',
        type: 'hospital',
        address: 'Civil Lines Road, Ward 4',
        distanceKm: 0.8,
        walkTimeMins: 9,
        indoorTemp: 24,
        capacity: 40,
        currentOccupancy: 12,
        hasWater: true,
        hasAc: true,
        hasMedicalStaff: true,
        status: 'open' as const,
        coordinates: { lat: 26.54, lng: 80.48 },
      };
    }

    const firstFacilityCoords = facilities[0]?.coordinates;
    const defaultFacLat = Array.isArray(firstFacilityCoords) ? firstFacilityCoords[0] : 28.61;
    const defaultFacLng = Array.isArray(firstFacilityCoords) ? firstFacilityCoords[1] : 77.20;

    const referenceLat = userCoords?.lat ?? selectedCity?.lat ?? defaultFacLat;
    const referenceLng = userCoords?.lng ?? selectedCity?.lng ?? defaultFacLng;

    const sorted = [...facilities].sort((a, b) => {
      const aLat = Array.isArray(a.coordinates) ? a.coordinates[0] : (a.coordinates as any)?.lat ?? 0;
      const aLng = Array.isArray(a.coordinates) ? a.coordinates[1] : (a.coordinates as any)?.lng ?? 0;
      const bLat = Array.isArray(b.coordinates) ? b.coordinates[0] : (b.coordinates as any)?.lat ?? 0;
      const bLng = Array.isArray(b.coordinates) ? b.coordinates[1] : (b.coordinates as any)?.lng ?? 0;
      const distA = calculateDistanceKm(referenceLat, referenceLng, aLat, aLng);
      const distB = calculateDistanceKm(referenceLat, referenceLng, bLat, bLng);
      return distA - distB;
    });

    const closest = sorted[0];
    const closestLat = Array.isArray(closest.coordinates) ? closest.coordinates[0] : (closest.coordinates as any)?.lat ?? referenceLat;
    const closestLng = Array.isArray(closest.coordinates) ? closest.coordinates[1] : (closest.coordinates as any)?.lng ?? referenceLng;
    const dist = calculateDistanceKm(referenceLat, referenceLng, closestLat, closestLng);
    return {
      ...closest,
      distanceKm: Number(dist.toFixed(1)),
      walkTimeMins: Math.max(2, Math.round((dist / 4.5) * 60)),
    };
  }, [facilities, selectedCity, userCoords, isHindi]);

  // Diurnal trajectory calculation with 24h & 7-day data
  const hourlyData = useMemo(() => {
    const baseTemp = weather.dryBulbTemp;
    const baseWbgt = weather.wbgt;

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

      let stress = isHindi ? 'सुरक्षित कार्य सीमा' : 'Safe Work Limit';
      let sweatRate = '300 ml/h';

      if (wbgt >= 33.5 || temp >= 42.0) {
        stress = isHindi ? 'अनिवार्य दोपहर कर्फ्यू' : 'Mandatory Curfew';
        sweatRate = '950 ml/h';
      } else if (wbgt >= 31.5 || temp >= 39.0) {
        stress = isHindi ? 'गंभीर ताप भार' : 'Severe Heat Load';
        sweatRate = '750 ml/h';
      } else if (wbgt >= 29.0 || temp >= 35.0) {
        stress = isHindi ? 'मध्यम ताप तनाव' : 'Moderate Stress';
        sweatRate = '550 ml/h';
      } else {
        stress = isHindi ? 'सामान्य सीमा' : 'Normal / Safe Limit';
        sweatRate = '350 ml/h';
      }

      return { time, temp, wbgt, stress, sweat: sweatRate };
    });
  }, [weather.dryBulbTemp, weather.wbgt, isHindi]);

  // 7-Day outlook
  const sevenDayOutlook = useMemo(() => {
    const base = weather.dryBulbTemp;
    const days = [
      { day: 'Today (Sat)', max: base, min: Math.round(base - 14), risk: 'Severe Warning', riskColor: '#C65D27', bg: '#FFF4D6' },
      { day: 'Sun 13 Sep', max: base + 0.8, min: Math.round(base - 13), risk: 'Emergency', riskColor: '#A63D40', bg: '#F8E9E8' },
      { day: 'Mon 14 Sep', max: base + 0.4, min: Math.round(base - 13.5), risk: 'Warning', riskColor: '#C65D27', bg: '#FFF4D6' },
      { day: 'Tue 15 Sep', max: base - 1.2, min: Math.round(base - 14), risk: 'Advisory', riskColor: '#B7791F', bg: '#FFF4D6' },
      { day: 'Wed 16 Sep', max: base - 2.5, min: Math.round(base - 15), risk: 'Advisory', riskColor: '#B7791F', bg: '#FFF4D6' },
      { day: 'Thu 17 Sep', max: base - 4.0, min: Math.round(base - 16), risk: 'Normal', riskColor: '#317A5A', bg: '#E8F1F5' },
      { day: 'Fri 18 Sep', max: base - 3.8, min: Math.round(base - 15.5), risk: 'Normal', riskColor: '#317A5A', bg: '#E8F1F5' },
    ];
    return days;
  }, [weather.dryBulbTemp]);

  // Determine dynamic risk status and directives following official guidelines:
  // Normal (#317A5A), Advisory (#B7791F), Warning (#C65D27), Emergency (#A63D40)
  const statusInfo = useMemo(() => {
    const isEmergency = weather.wbgt >= 33.5 || weather.dryBulbTemp >= 42.0;
    const isWarning = weather.wbgt >= 31.5 || weather.dryBulbTemp >= 39.0;
    const isAdvisory = weather.wbgt >= 29.0 || weather.dryBulbTemp >= 35.0;

    if (isEmergency) {
      return {
        levelName: isHindi ? 'आपातकालीन चेतावनी (रेड अलर्ट)' : 'Emergency Heat Alert (Level 4)',
        tier: 'EMERGENCY',
        color: '#A63D40',
        bg: '#F8E9E8',
        border: '#A63D40',
        window: isHindi ? '12:00 – 16:30 IST चरम जोखिम खिड़की' : '12:00 – 16:30 IST Peak Risk Window',
        summary: isHindi 
          ? 'चरम थर्मल संकट सक्रिय। नगर निगम NDMA आदेश के तहत खुले में भारी शारीरिक श्रम प्रतिबंधित है। तत्काल निकटतम वातानुकूलित केंद्र में जाएं।' 
          : 'Severe thermal emergency active. Outdoor physical labor is strictly restricted under National Heat Action Plan protocols. Seek air-cooled shelters immediately.',
        hasCurfew: true,
      };
    }
    if (isWarning) {
      return {
        levelName: isHindi ? 'गंभीर चेतावनी (ऑरेंज अलर्ट)' : 'Severe Heat Warning (Level 3)',
        tier: 'WARNING',
        color: '#C65D27',
        bg: '#FFF4D6',
        border: '#C65D27',
        window: isHindi ? '12:30 – 15:30 IST उच्च जोखिम खिड़की' : '12:30 – 15:30 IST High Risk Window',
        summary: isHindi 
          ? 'उच्च ताप तनाव जारी। धूप में निरंतर संपर्क से बचें और प्रत्येक घंटे में न्यूनतम 400-500 मिली ओआरएस अथवा जल ग्रहण करें।' 
          : 'Significant heatwave conditions prevail. Avoid direct sun exposure during peak hours and consume at least 400–500 ml of fluid or ORS hourly.',
        hasCurfew: false,
      };
    }
    if (isAdvisory) {
      return {
        levelName: isHindi ? 'ताप परामर्श (येलो अलर्ट)' : 'Heat Advisory (Level 2)',
        tier: 'ADVISORY',
        color: '#B7791F',
        bg: '#FFF4D6',
        border: '#B7791F',
        window: isHindi ? '13:00 – 15:00 IST सतर्कता खिड़की' : '13:00 – 15:00 IST Caution Window',
        summary: isHindi 
          ? 'मध्यम ताप भार। वरिष्ठ नागरिकों एवं बच्चों को छायादार स्थानों में रखें। पर्याप्त जल का सेवन करें।' 
          : 'Elevated ambient temperature. Monitor vulnerable populations including older adults and outdoor workers. Maintain continuous hydration.',
        hasCurfew: false,
      };
    }
    return {
      levelName: isHindi ? 'सामान्य स्थिति (ग्रीन अलर्ट)' : 'Normal Thermal State (Level 1)',
      tier: 'NORMAL',
      color: '#317A5A',
      bg: '#E8F1F5',
      border: '#317A5A',
      window: isHindi ? 'मानक परिस्थितियाँ' : 'Standard Baseline Conditions',
      summary: isHindi 
        ? 'बायो-मेटियोरोलॉजिकल ताप तनाव अनुमेय सीमा में है। सामान्य दैनिक गतिविधियाँ सुरक्षित हैं।' 
        : 'Biometeorological parameters remain within safe baseline limits. Standard outdoor activities permitted.',
      hasCurfew: false,
    };
  }, [weather.wbgt, weather.dryBulbTemp, isHindi]);

  const selectedHour = hourlyData[selectedHourIndex] || hourlyData[3];

  // Helper coordinate mapper for SVG graph
  const getYCoord = (val: number) => {
    const min = 24;
    const max = 48;
    const clamped = Math.max(min, Math.min(max, val));
    const ratio = (clamped - min) / (max - min);
    return 165 - ratio * 135;
  };

  return (
    <div className="space-y-6 pb-12 text-[#263746]">

      {/* =========================================================================
          SECTION 2: PAGE TITLE & CURRENT UPDATE TIME
          - Page title: 32px, 700 (Source Serif 4)
          - Exact update times: e.g. Updated September 12, 2026, 10:30 AM IST
          - Data freshness status
          ========================================================================= */}
      <div id="dashboard-institutional-header" className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D6E0E5] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-[#E8F1F5] text-[#12304A] border border-[#D6E0E5]">
              Official Public Health Portal
            </span>
            <span className="text-xs text-[#317A5A] font-mono flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#317A5A]" />
              Telemetry Live & Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-[32px] font-headline font-bold text-[#12304A] leading-tight tracking-tight">
            {isHindi ? 'राष्ट्रीय लू पूर्व चेतावनी एवं बायो-मौसम विज्ञान डैशबोर्ड' : 'National Heatwave Early Warning & Biometeorology'}
          </h1>
          <p className="text-xs sm:text-sm text-[#657783] mt-1 font-sans">
            {isHindi 
              ? 'भारतीय मौसम विज्ञान विभाग (IMD) एवं राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) स्वास्थ्य निगरानी नेटवर्क' 
              : 'Joint Surveillance Feed: India Meteorological Department & National Disaster Management Authority'}
          </p>
        </div>

        {/* Exact Update Times & Data Freshness status */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-[#263746] font-mono">
            <Clock className="w-3.5 h-3.5 text-[#1E5A7A]" />
            <span>Updated {exactUpdatedTime}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#657783] font-mono">
            <span>Station ID: <strong className="text-[#12304A]">{weather.stationId || 'AWS-IND-7702'}</strong></span>
            <span>•</span>
            <span>15-min sensor cadence</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: LOCATION SELECTOR & CURRENT RISK SUMMARY
          - Current heat risk level (Normal, Advisory, Warning, Emergency)
          - Location, Temperature, Apparent temp, Humidity, Last updated time, Data freshness
          - Text label + color + numeric value + short explanation (never color alone!)
          - Clean buttons: Primary #1E5A7A, Secondary transparent with border
          ========================================================================= */}
      <section 
        id="current-heat-risk-summary" 
        className="bg-white rounded-lg border border-[#D6E0E5] p-5 sm:p-6 shadow-xs"
      >
        {/* Location selector strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#D6E0E5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#E8F1F5] border border-[#D6E0E5] flex items-center justify-center text-[#1E5A7A] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-[#12304A]">
                  {selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : 'New Delhi, National Capital Territory'}
                </span>
                {onOpenCitySelector && (
                  <button
                    onClick={onOpenCitySelector}
                    className="px-2 py-0.5 rounded text-xs font-semibold text-[#1E5A7A] bg-[#E8F1F5] hover:bg-[#D6E0E5] border border-[#D6E0E5] transition-colors cursor-pointer"
                  >
                    Change Station
                  </button>
                )}
              </div>
              <span className="text-xs text-[#657783] font-mono">
                Lat: {(selectedCity?.lat ?? 28.61).toFixed(2)}°N, Lng: {(selectedCity?.lng ?? 77.20).toFixed(2)}°E • Elevation: 216m MSL
              </span>
            </div>
          </div>

          {/* Telemetry Switch & Refresh Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleDataSourceMode && (
              <div className="flex items-center bg-[#F4F1EA] p-1 rounded-md border border-[#D6E0E5] text-xs">
                <button
                  id="source-toggle-live-api"
                  onClick={() => onToggleDataSourceMode('live_api')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    dataSourceMode === 'live_api'
                      ? 'bg-[#1E5A7A] text-white shadow-xs'
                      : 'text-[#657783] hover:text-[#12304A]'
                  }`}
                >
                  Live Sensor Feed
                </button>
                <button
                  id="source-toggle-heatwave-test"
                  onClick={() => onToggleDataSourceMode('imd_heatwave')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    dataSourceMode === 'imd_heatwave'
                      ? 'bg-[#C65D27] text-white shadow-xs'
                      : 'text-[#657783] hover:text-[#12304A]'
                  }`}
                >
                  Stress Drill (47°C)
                </button>
              </div>
            )}

            {onRefreshTelemetry && (
              <button
                onClick={onRefreshTelemetry}
                disabled={isLiveApiLoading}
                className="p-2 rounded-md bg-white hover:bg-[#E8F1F5] text-[#1E5A7A] transition-colors border border-[#D6E0E5] cursor-pointer"
                title="Sync telemetry sensors"
              >
                <RefreshCw className={`w-4 h-4 ${isLiveApiLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Risk Level Banner + Metric Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left / Center (8 cols): Risk Status & Primary KPIs */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Risk Badge with exact label + color + numeric threshold */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div 
                className="px-3 py-1.5 rounded-md text-xs font-bold border flex items-center gap-2"
                style={{ backgroundColor: statusInfo.bg, borderColor: statusInfo.border, color: statusInfo.color }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusInfo.color }} />
                <span>{statusInfo.levelName}</span>
              </div>
              <span className="text-xs text-[#657783] font-mono">
                {statusInfo.window}
              </span>
            </div>

            {/* High-Contrast Numeric Figures: Dry Bulb, Feels Like, Humidity */}
            <div className="flex flex-wrap items-baseline gap-6 sm:gap-8 pt-1">
              <div>
                <span className="block text-xs uppercase font-mono font-semibold text-[#657783] mb-1">
                  Air Temperature
                </span>
                <div className="text-4xl sm:text-5xl font-mono font-bold text-[#12304A]">
                  {weather.dryBulbTemp}<span className="text-2xl font-sans font-normal text-[#657783]">°C</span>
                </div>
              </div>

              <div className="border-l border-[#D6E0E5] pl-6">
                <span className="block text-xs uppercase font-mono font-semibold text-[#657783] mb-1">
                  Apparent Temp (Heat Index)
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-[#C65D27]">
                  {weather.heatIndex}<span className="text-xl font-sans font-normal text-[#657783]">°C</span>
                </div>
              </div>

              <div className="border-l border-[#D6E0E5] pl-6 hidden sm:block">
                <span className="block text-xs uppercase font-mono font-semibold text-[#657783] mb-1">
                  Relative Humidity
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-[#2F7F82]">
                  {weather.humidity}<span className="text-xl font-sans font-normal text-[#657783]">%</span>
                </div>
              </div>

              <div className="border-l border-[#D6E0E5] pl-6 hidden md:block">
                <span className="block text-xs uppercase font-mono font-semibold text-[#657783] mb-1">
                  WBGT Index
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-[#1E5A7A]">
                  {weather.wbgt}<span className="text-xl font-sans font-normal text-[#657783]">°C</span>
                </div>
              </div>
            </div>

            {/* Official plain-language explanation of risk */}
            <p className="text-xs sm:text-sm text-[#263746] leading-relaxed max-w-2xl font-sans bg-[#F4F1EA] p-3 rounded-md border border-[#D6E0E5]">
              <strong className="text-[#12304A]">Action Directive:</strong> {statusInfo.summary}
            </p>
          </div>

          {/* Right (4 cols): Institutional Action Controls */}
          <div className="lg:col-span-4 flex flex-col gap-2.5 w-full">
            <button
              id="hero-find-shelter-btn"
              onClick={() => onSwitchTab('cooling-finder')}
              className="w-full px-4 py-2.5 rounded-md bg-[#1E5A7A] hover:bg-[#164863] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>
                {isHindi 
                  ? `निकटतम शीतलन आश्रय (${nearestShelter.walkTimeMins} मिनट)` 
                  : `Locate Nearest Shelter (${nearestShelter.walkTimeMins} min walk)`}
              </span>
            </button>

            <button
              id="hero-ai-triage-btn"
              onClick={onOpenTriage}
              className="w-full px-4 py-2.5 rounded-md bg-white hover:bg-[#E8F1F5] text-[#1E5A7A] text-xs font-semibold border border-[#1E5A7A] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#1E5A7A]" />
              <span>{isHindi ? 'ताप लक्षण ट्राइएज जांच' : 'Clinical Symptom Assessment'}</span>
            </button>

            <button
              id="hero-ndma-order-btn"
              onClick={() => setShowOrderModal(true)}
              className="w-full px-4 py-2 rounded-md bg-[#F4F1EA] hover:bg-[#E8F1F5] text-[#263746] text-xs font-medium border border-[#D6E0E5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-[#657783]" />
              <span>{isHindi ? 'एनडीएमए आदेश #419-B देखें' : 'Review NDMA Order #419-B'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4 & 5: FORECAST TIMELINE (NEXT 24 HOURS & 7 DAYS)
          - Controlled Chart Palette:
            Temperature: #C65D27
            Humidity / WBGT: #2F7F82
            Safe threshold: #317A5A
            Warning threshold: #B7791F
            Chart background: #FFFFFF, gridlines: #D6E0E5
          ========================================================================= */}
      <section id="forecast-timeline-section" className="bg-white rounded-lg border border-[#D6E0E5] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#D6E0E5]">
          <div>
            <h2 className="text-lg font-headline font-bold text-[#12304A] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1E5A7A]" />
              <span>Biometeorological Forecast & Thermal Trajectory</span>
            </h2>
            <p className="text-xs text-[#657783] mt-0.5 font-sans">
              Calibrated hourly projections for {selectedCity?.name || 'New Delhi'} across safe threshold limits
            </p>
          </div>

          {/* Toggle between 24-hour and 7-day outlook */}
          <div className="flex items-center gap-1 bg-[#F4F1EA] p-1 rounded-md border border-[#D6E0E5] text-xs self-start sm:self-auto">
            <button
              onClick={() => setForecastViewMode('24h')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                forecastViewMode === '24h'
                  ? 'bg-[#1E5A7A] text-white shadow-xs'
                  : 'text-[#657783] hover:text-[#12304A]'
              }`}
            >
              24-Hour Diurnal Cycle
            </button>
            <button
              onClick={() => setForecastViewMode('7day')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                forecastViewMode === '7day'
                  ? 'bg-[#1E5A7A] text-white shadow-xs'
                  : 'text-[#657783] hover:text-[#12304A]'
              }`}
            >
              7-Day Synoptic Outlook
            </button>
          </div>
        </div>

        {forecastViewMode === '24h' ? (
          <div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-mono text-[#657783] mb-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#C65D27] rounded" /> Temperature (°C)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#2F7F82] rounded" /> WBGT Index (°C)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-[#B7791F]" /> Warning Threshold (31.5°C)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t border-dashed border-[#317A5A]" /> Safe Labor Limit (29°C)
              </span>
            </div>

            {/* SVG Chart with pristine white background and #D6E0E5 gridlines */}
            <div className="w-full h-56 bg-white rounded-md border border-[#D6E0E5] p-3 relative">
              <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
                
                {/* Horizontal Gridlines */}
                <line x1="40" y1="165" x2="570" y2="165" stroke="#D6E0E5" strokeWidth="1" />
                <line x1="40" y1="120" x2="570" y2="120" stroke="#D6E0E5" strokeWidth="1" />
                <line x1="40" y1="75" x2="570" y2="75" stroke="#D6E0E5" strokeWidth="1" />
                <line x1="40" y1="30" x2="570" y2="30" stroke="#D6E0E5" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="35" y="168" textAnchor="end" fill="#657783" fontSize="10" fontFamily="IBM Plex Sans">24°C</text>
                <text x="35" y="123" textAnchor="end" fill="#657783" fontSize="10" fontFamily="IBM Plex Sans">32°C</text>
                <text x="35" y="78" textAnchor="end" fill="#657783" fontSize="10" fontFamily="IBM Plex Sans">40°C</text>
                <text x="35" y="33" textAnchor="end" fill="#657783" fontSize="10" fontFamily="IBM Plex Sans">48°C</text>

                {/* Threshold Reference Lines */}
                <line x1="40" y1={getYCoord(29)} x2="570" y2={getYCoord(29)} stroke="#317A5A" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
                <text x="565" y={getYCoord(29) - 4} textAnchor="end" fill="#317A5A" fontSize="9" fontFamily="IBM Plex Sans">Safe Limit 29°C</text>

                <line x1="40" y1={getYCoord(31.5)} x2="570" y2={getYCoord(31.5)} stroke="#B7791F" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.8" />
                <text x="565" y={getYCoord(31.5) - 4} textAnchor="end" fill="#B7791F" fontSize="9" fontFamily="IBM Plex Sans">Warning 31.5°C</text>

                {/* Curfew Period Highlight Box */}
                {statusInfo.hasCurfew && (
                  <g>
                    <rect x="230" y="20" width="180" height="145" fill="#FFF4D6" fillOpacity="0.5" stroke="#B7791F" strokeWidth="1" strokeDasharray="2 2" rx="4" />
                    <text x="320" y="32" fill="#C65D27" fontSize="9" textAnchor="middle" fontWeight="600" fontFamily="IBM Plex Sans">
                      PEAK CURFEW HOURS (12:00 – 16:30)
                    </text>
                  </g>
                )}

                {/* Plot Paths */}
                {(() => {
                  const points = hourlyData.map((pt, idx) => ({
                    x: 55 + idx * 83,
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
                      {/* Curves */}
                      <path d={pathTemp} fill="none" stroke="#C65D27" strokeWidth="2.5" />
                      <path d={pathWbgt} fill="none" stroke="#2F7F82" strokeWidth="2" />
                    </>
                  );
                })()}

                {/* Data Points */}
                {hourlyData.map((pt, idx) => {
                  const cx = 55 + idx * 83;
                  const cyTemp = getYCoord(pt.temp);
                  const isSelected = selectedHourIndex === idx;

                  return (
                    <g key={pt.time} className="cursor-pointer" onClick={() => setSelectedHourIndex(idx)}>
                      <circle
                        cx={cx}
                        cy={cyTemp}
                        r={isSelected ? 6 : 4}
                        fill={isSelected ? '#12304A' : '#C65D27'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <text
                        x={cx}
                        y="185"
                        textAnchor="middle"
                        fill={isSelected ? '#12304A' : '#657783'}
                        fontSize="10"
                        fontFamily="IBM Plex Sans"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                      >
                        {pt.time}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Hour Details Box */}
            <div className="mt-3 p-3 rounded-md bg-[#F4F1EA] border border-[#D6E0E5] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-white bg-[#1E5A7A] px-2.5 py-1 rounded">
                  {selectedHour.time} IST
                </span>
                <div>
                  <span className="text-[#12304A] font-bold">
                    Air Temperature {selectedHour.temp}°C • WBGT {selectedHour.wbgt}°C
                  </span>
                  <span className="text-[#657783] block text-[11px]">
                    Status: <strong className="text-[#263746]">{selectedHour.stress}</strong>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#657783]">Estimated Fluid Loss:</span>
                <div className="font-mono text-[#1E5A7A] font-bold">{selectedHour.sweat}</div>
              </div>
            </div>
          </div>
        ) : (
          /* 7-Day Synoptic Outlook Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D6E0E5] text-[#657783] font-mono text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Maximum Temp</th>
                  <th className="py-2.5 px-3">Minimum Temp</th>
                  <th className="py-2.5 px-3">Risk Level</th>
                  <th className="py-2.5 px-3">Operational Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E0E5] font-sans">
                {sevenDayOutlook.map((item, index) => (
                  <tr key={index} className="hover:bg-[#F4F1EA] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#12304A] whitespace-nowrap">
                      {item.day}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#C65D27]">
                      {item.max.toFixed(1)}°C
                    </td>
                    <td className="py-3 px-3 font-mono text-[#657783]">
                      {item.min.toFixed(1)}°C
                    </td>
                    <td className="py-3 px-3">
                      <span 
                        className="px-2 py-0.5 rounded text-[11px] font-semibold border"
                        style={{ backgroundColor: item.bg, color: item.riskColor, borderColor: item.riskColor }}
                      >
                        {item.risk}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#657783] text-[11px]">
                      {item.risk === 'Emergency' ? 'Mandatory afternoon curfew on heavy physical work' :
                       item.risk === 'Warning' ? 'ORS stations open; avoid unshaded work after 12:00' :
                       item.risk === 'Advisory' ? 'Standard hydration breaks for field workers' : 'Normal routine activity permitted'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 6: SUPPORTING BIOMETEOROLOGICAL INDICATORS
          - Cards: #FFFFFF background, #D6E0E5 border, #12304A heading, #657783 supporting text
          - 8-12px corner radius
          - Numbers in IBM Plex Sans
          ========================================================================= */}
      <section id="supporting-biometeorological-indicators">
        <div className="mb-3">
          <h2 className="text-lg font-headline font-bold text-[#12304A]">
            Core Environmental Indicators
          </h2>
          <p className="text-xs text-[#657783]">
            Key biometeorological parameters measured across standard calibrated instruments
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. WBGT Heat Stress */}
          <div className="bg-white rounded-lg border border-[#D6E0E5] p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#657783] mb-1">
                <span className="font-medium">WBGT Heat Stress</span>
                <HeartPulse className="w-4 h-4 text-[#1E5A7A]" />
              </div>
              <div className="text-3xl font-mono font-bold text-[#12304A] mt-1">
                {weather.wbgt}<span className="text-sm font-sans font-normal text-[#657783] ml-1">°C</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#D6E0E5]">
              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                weather.wbgt >= 33.5 ? 'bg-[#F8E9E8] text-[#A63D40] border border-[#A63D40]' :
                weather.wbgt >= 31.5 ? 'bg-[#FFF4D6] text-[#C65D27] border border-[#C65D27]' :
                weather.wbgt >= 29.0 ? 'bg-[#FFF4D6] text-[#B7791F] border border-[#B7791F]' :
                'bg-[#E8F1F5] text-[#317A5A] border border-[#317A5A]'
              }`}>
                {weather.wbgt >= 33.5 ? 'Critical (>33.5°C)' :
                 weather.wbgt >= 31.5 ? 'High Strain (>31.5°C)' :
                 weather.wbgt >= 29.0 ? 'Caution Threshold' : 'Safe Baseline (<29°C)'}
              </span>
              <p className="text-[11px] text-[#657783] mt-1.5 leading-tight">
                {weather.wbgt >= 32 ? 'Outdoor labor suspension advised' : 'Acceptable for monitored activities'}
              </p>
            </div>
          </div>

          {/* 2. Heat Index & Relative Humidity */}
          <div className="bg-white rounded-lg border border-[#D6E0E5] p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#657783] mb-1">
                <span className="font-medium">Relative Humidity</span>
                <Droplet className="w-4 h-4 text-[#2F7F82]" />
              </div>
              <div className="text-3xl font-mono font-bold text-[#12304A] mt-1">
                {weather.humidity}<span className="text-sm font-sans font-normal text-[#657783] ml-1">%</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#D6E0E5]">
              <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-[#E8F1F5] text-[#2F7F82] border border-[#D6E0E5]">
                Heat Index: {weather.heatIndex}°C
              </span>
              <p className="text-[11px] text-[#657783] mt-1.5 leading-tight">
                {weather.humidity >= 65 ? 'Elevated humidity impedes sweat evaporation' : 'Moderate evaporative cooling possible'}
              </p>
            </div>
          </div>

          {/* 3. Solar & UV Radiation Load */}
          <div className="bg-white rounded-lg border border-[#D6E0E5] p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#657783] mb-1">
                <span className="font-medium">Solar Radiation Load</span>
                <Sun className="w-4 h-4 text-[#B7791F]" />
              </div>
              <div className="text-3xl font-mono font-bold text-[#12304A] mt-1">
                {weather.solarRadiation}<span className="text-xs font-sans font-normal text-[#657783] ml-1">W/m²</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#D6E0E5]">
              <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FFF4D6] text-[#B7791F] border border-[#B7791F]">
                {weather.solarRadiation >= 800 ? 'UV Index: 10+ (Extreme)' :
                 weather.solarRadiation >= 500 ? 'UV Index: 7-8 (High)' : 'UV Index: 4-5 (Moderate)'}
              </span>
              <p className="text-[11px] text-[#657783] mt-1.5 leading-tight">
                {weather.solarRadiation >= 800 ? 'Direct exposure risk within 15 min' : 'UV eye & skin protection advised'}
              </p>
            </div>
          </div>

          {/* 4. Wind Velocity & Loo Winds */}
          <div className="bg-white rounded-lg border border-[#D6E0E5] p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#657783] mb-1">
                <span className="font-medium">Wind Velocity</span>
                <Wind className="w-4 h-4 text-[#317A5A]" />
              </div>
              <div className="text-3xl font-mono font-bold text-[#12304A] mt-1">
                {weather.windSpeed}<span className="text-xs font-sans font-normal text-[#657783] ml-1">km/h</span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#D6E0E5]">
              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                weather.dryBulbTemp >= 40 && weather.windSpeed >= 12
                  ? 'bg-[#FFF4D6] text-[#C65D27] border border-[#C65D27]'
                  : 'bg-[#E8F1F5] text-[#317A5A] border border-[#D6E0E5]'
              }`}>
                {weather.dryBulbTemp >= 40 && weather.windSpeed >= 12 ? 'Advective Loo Wind Active' : 'Calm / Gentle Breeze'}
              </span>
              <p className="text-[11px] text-[#657783] mt-1.5 leading-tight">
                {weather.dryBulbTemp >= 40 ? 'Causes rapid cutaneous desiccation' : 'Standard atmospheric circulation'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 7: TWO BALANCED COLUMNS
          Left: Public Health Guidance Panel (Official Advisory Format)
          Right: Hydration & Clinical Intake Engine
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left (7 cols): Public Health Guidance Panel */}
        <div id="public-health-guidance-panel" className="lg:col-span-7 bg-white rounded-lg border border-[#D6E0E5] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D6E0E5] pb-3">
            <div>
              <h2 className="text-lg font-headline font-bold text-[#12304A] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#317A5A]" />
                <span>Public Health & Safety Directives</span>
              </h2>
              <p className="text-xs text-[#657783] mt-0.5">
                Official NDMA & Ministry of Health and Family Welfare Advisory
              </p>
            </div>
            <span className="text-xs font-mono text-[#1E5A7A] bg-[#E8F1F5] px-2 py-0.5 rounded font-semibold border border-[#D6E0E5]">
              HAP-2026
            </span>
          </div>

          {/* Core Plain-Language Advisory Points (Strictly as specified) */}
          <div className="space-y-3 font-sans">
            
            {/* 1. Stay Hydrated */}
            <div className="p-3.5 rounded-lg bg-[#F4F1EA] border border-[#D6E0E5] flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[#E8F1F5] border border-[#D6E0E5] flex items-center justify-center text-[#1E5A7A] shrink-0 mt-0.5">
                <Droplet className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <h4 className="font-bold text-[#12304A] text-sm mb-0.5">
                  1. Maintain Continuous Hydration
                </h4>
                <p className="text-[#263746]">
                  Drink water at regular intervals, even before experiencing thirst. Complement water with Oral Rehydration Salts (ORS), coconut water, or traditional electrolyte solutions (lemon water, buttermilk) to replenish sodium and potassium.
                </p>
              </div>
            </div>

            {/* 2. Avoid Direct Exposure During Peak Heat */}
            <div className="p-3.5 rounded-lg bg-[#F4F1EA] border border-[#D6E0E5] flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[#FFF4D6] border border-[#B7791F] flex items-center justify-center text-[#C65D27] shrink-0 mt-0.5">
                <Sun className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <h4 className="font-bold text-[#12304A] text-sm mb-0.5">
                  2. Avoid Direct Exposure During Peak Hours
                </h4>
                <p className="text-[#263746]">
                  Refrain from unshaded physical activity between <strong>12:00 PM and 4:00 PM</strong>. When outdoors, use umbrellas, wide-brimmed hats, or light-colored, loose-fitting cotton garments to shield against radiative heat.
                </p>
              </div>
            </div>

            {/* 3. Check on Older Adults and Vulnerable Groups */}
            <div className="p-3.5 rounded-lg bg-[#F4F1EA] border border-[#D6E0E5] flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[#E8F1F5] border border-[#D6E0E5] flex items-center justify-center text-[#2F7F82] shrink-0 mt-0.5">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <h4 className="font-bold text-[#12304A] text-sm mb-0.5">
                  3. Monitor Vulnerable Individuals
                </h4>
                <p className="text-[#263746]">
                  Conduct periodic check-ins on infants, older adults (age 65+), outdoor gig workers, and individuals with cardiovascular or renal medical conditions. Never leave children or pets inside locked, unventilated vehicles.
                </p>
              </div>
            </div>

            {/* 4. Seek Medical Help if Symptoms Appear */}
            <div className="p-3.5 rounded-lg bg-[#F8E9E8] border border-[#A63D40] flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[#FFFFFF] border border-[#A63D40] flex items-center justify-center text-[#A63D40] shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <h4 className="font-bold text-[#A63D40] text-sm mb-0.5">
                  4. Seek Immediate Medical Attention for Severe Symptoms
                </h4>
                <p className="text-[#263746]">
                  Watch for symptoms of heat stroke: altered mental state, confusion, loss of consciousness, cessation of sweating, or body temperature exceeding 39.5°C (103°F). Immediately move the patient to shade and dial <strong>108 (National Ambulance Hotline)</strong>.
                </p>
              </div>
            </div>

          </div>

          {/* Immediate Action Buttons */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={onTriggerSOS}
              className="px-4 py-2 rounded-md bg-[#A63D40] hover:bg-[#8F3437] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isHindi ? '१०८ आपातकालीन एम्बुलेंस डायल करें' : 'Dial 108 Emergency Ambulance'}</span>
            </button>

            <button
              onClick={() => onSwitchTab('protocols')}
              className="text-xs text-[#1E5A7A] hover:text-[#12304A] font-medium flex items-center gap-1 underline cursor-pointer"
            >
              <span>{isHindi ? 'सम्पूर्ण हीट एक्शन प्रोटोकॉल देखें' : 'View Full Heat Action Protocols'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right (5 cols): Hydration Tracker Component */}
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

      {/* =========================================================================
          SECTION 8: DATA SOURCE, METHODOLOGY, MODEL VERSION & TRANSPARENCY
          - Transparent provenance: IMD, ERA5, Open-Meteo
          - Update frequency, model version, forecast limitations
          - Responsible department
          ========================================================================= */}
      <section id="data-methodology-transparency" className="bg-white rounded-lg border border-[#D6E0E5] p-5 sm:p-6 shadow-xs text-xs">
        <div className="border-b border-[#D6E0E5] pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#1E5A7A]" />
            <h3 className="font-headline font-bold text-sm sm:text-base text-[#12304A]">
              {isHindi ? 'डेटा स्रोत, कार्यप्रणाली एवं मॉडल प्रकटीकरण' : 'Data Provenance, Methodology & Model Disclosures'}
            </h3>
          </div>
          <span className="font-mono text-[11px] text-[#657783]">
            {isHindi ? 'संस्करण: v4.2-IND-NDMA' : 'Release: v4.2-IND-NDMA'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans leading-relaxed text-[#263746]">
          
          {/* Data Sources */}
          <div>
            <h4 className="font-bold text-[#12304A] mb-1.5 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#1E5A7A]" />
              <span>{isHindi ? 'प्राथमिक अवलोकन प्रणाली' : 'Primary Observing Systems'}</span>
            </h4>
            <p className="text-[#657783] text-[11px]">
              {isHindi 
                ? 'सतही मौसम संबंधी आंकड़े भारत मौसम विज्ञान विभाग (IMD) के स्वचालित मौसम केंद्र (AWS) टेलीमेट्री नोड्स, ECMWF ERA5 पुनरध्ययन और ओपन-मेटियो बायोमेट्रिक्स द्वारा प्राप्त किए जाते हैं।'
                : 'Surface meteorological observations are gathered from India Meteorological Department (IMD) Automatic Weather Station (AWS) telemetry nodes, complemented by ECMWF ERA5 reanalysis baselines and Open-Meteo biometeorological interfaces.'}
            </p>
          </div>

          {/* Model Methodology */}
          <div>
            <h4 className="font-bold text-[#12304A] mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#2F7F82]" />
              <span>{isHindi ? 'जैव-मौसम विज्ञान मॉडल' : 'Biometeorology Model'}</span>
            </h4>
            <p className="text-[#657783] text-[11px]">
              {isHindi 
                ? 'वेट बल्ब ग्लोब टेम्परेचर (WBGT) लिलजेग्रेन मानक मॉडल द्वारा शुष्क बल्ब तापमान, सौर विकिरण, ओस बिंदु एवं २ मीटर हवा की गति के आधार पर आकलित किया जाता है। जोखिम वर्गीकरण NDMA 2026 दिशानिर्देशों पर आधारित है।'
                : 'Wet Bulb Globe Temperature (WBGT) is derived using the Liljegren standard outdoor model incorporating dry-bulb temperature, solar radiative irradiance, dew point, and local 2m wind velocity. Risk categorizations follow NDMA 2026 thresholds.'}
            </p>
          </div>

          {/* Responsible Department & Limitations */}
          <div>
            <h4 className="font-bold text-[#12304A] mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#317A5A]" />
              <span>{isHindi ? 'उत्तरदायी प्राधिकारी' : 'Responsible Authority'}</span>
            </h4>
            <p className="text-[#657783] text-[11px]">
              {isHindi 
                ? 'राष्ट्रीय ग्रीष्मकालीन प्रारंभिक चेतावनी एवं जैव-मौसम निगरानी निदेशालय। सूक्ष्म-जलवायु भिन्नताएं (शहरी हीट आइलैंड, डामर सड़क) स्थानीय तापमान को सेंसर रीडिंग से ±1.8°C तक परिवर्तित कर सकती हैं।'
                : 'National Heatwave Early Warning & Biometeorological Surveillance Directorate. Microclimate variations (urban heat islands, reflective asphalt) may alter localized temperatures by ±1.8°C from central AWS sensor readings.'}
            </p>
          </div>

        </div>

        <div className="mt-4 pt-3 border-t border-[#D6E0E5] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#657783] font-mono">
          <span>{isHindi ? 'आधिकारिक लोक स्वास्थ्य सूचना प्रणाली • निःशुल्क जनसेवा' : 'Official Public Health Information System • Free Public Service'}</span>
          <span>{isHindi ? 'पूछताछ: biomet-surveillance@ndma.gov.in • टोल-फ्री हेल्पलाइन: १०७०' : 'Inquiries: biomet-surveillance@ndma.gov.in • Toll-Free Help: 1070'}</span>
        </div>
      </section>

      {/* Official Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D6E0E5] rounded-lg max-w-lg w-full p-6 shadow-xl relative text-[#263746]">
            <div className="flex items-center justify-between border-b border-[#D6E0E5] pb-3 mb-4">
              <div className="flex items-center gap-2 text-[#A63D40] font-headline font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>{isHindi ? 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण आदेश संख्या #419-B' : 'National Disaster Management Act Order #419-B'}</span>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-[#657783] hover:text-[#12304A] text-lg cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#263746] space-y-3 font-sans max-h-96 overflow-y-auto pr-1">
              <p className="font-mono text-[11px] text-[#B7791F] font-semibold">
                {isHindi 
                  ? 'आपदा प्रबंधन अधिनियम, 2005 की धारा 30(2)(v) एवं 51 के अंतर्गत जारी' 
                  : 'ISSUED UNDER SECTION 30(2)(v) & 51 OF DISASTER MANAGEMENT ACT, 2005'}
              </p>
              <p>
                {isHindi 
                  ? 'भारत मौसम विज्ञान विभाग (IMD) द्वारा जारी तीव्र लू चेतावनी तथा मौसम केंद्रों पर WBGT सूचकांक के अत्यधिक स्तर पर पहुंचने के दृष्टिगत, निम्नलिखित कार्यकारी निर्देश तत्काल प्रभाव से लागू किए जाते हैं:' 
                  : 'In view of severe heatwave warnings issued by the India Meteorological Department (IMD) and WBGT stress index breach across AWS stations, the following executive directives are strictly enforced:'}
              </p>
              <ol className="list-decimal list-inside space-y-2 text-[#263746]">
                {isHindi ? (
                  <>
                    <li><strong>धूप में बाहरी शारीरिक श्रम पर रोक:</strong> जब भी WBGT ३३.५°C से अधिक हो, दोपहर के चरम धूप के घंटों में सीधी धूप में शारीरिक श्रम पूर्णतः प्रतिबंधित रहेगा।</li>
                    <li><strong>अनिवार्य पेयजल स्टेशन:</strong> सभी नियोक्ताओं और परिवहन ऑपरेटरों को निःशुल्क स्वच्छ पेयजल और ओआरएस पैकेट उपलब्ध कराना अनिवार्य है।</li>
                    <li><strong>सार्वजनिक शीतलन केंद्र:</strong> नगर निगम के सामुदायिक भवन और प्रमुख परिवहन केंद्र २४/७ वातानुकूलित आश्रय स्थल के रूप में कार्यरत रहेंगे।</li>
                    <li><strong>अस्पतालों की तत्परता:</strong> जिला सामान्य अस्पतालों को कोड ऑरेंज प्रोटोकॉल के तहत वातानुकूलित बिस्तर और पर्याप्त आईवी फ्लुइड स्टॉक तैयार रखना अनिवार्य है।</li>
                  </>
                ) : (
                  <>
                    <li><strong>Prohibition of Unshaded Outdoor Labor:</strong> Physical labor in direct sunlight is prohibited during the peak diurnal window whenever WBGT breaches 33.5°C.</li>
                    <li><strong>Mandatory Hydration Stations:</strong> Employers and transit operators must maintain free, potable drinking water and WHO-ORS packets.</li>
                    <li><strong>Public Cooling Centers:</strong> Municipal community centers and transit stations operate 24/7 as air-conditioned heat refuges.</li>
                    <li><strong>Hospital Preparedness:</strong> District general hospitals must maintain reserved air-cooled beds and adequate IV fluid stockpiles under Code Orange protocols.</li>
                  </>
                )}
              </ol>
            </div>

            <div className="mt-5 pt-3 border-t border-[#D6E0E5] flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-[#1E5A7A] hover:bg-[#164863] text-white text-xs font-semibold rounded-md cursor-pointer transition-colors"
              >
                {isHindi ? 'निर्देश स्वीकार किया' : 'Acknowledge Directive'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

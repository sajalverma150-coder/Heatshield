import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Globe, 
  UserCircle, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  Brain,
  Navigation,
  Search,
  ChevronDown,
  Compass,
  Bell,
  BellRing,
  FileText,
  Menu
} from 'lucide-react';
import { NavigationTab, UserRole, LanguageCode, WeatherTelemetry } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { CityData } from '../data/indiaCities';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  weather: WeatherTelemetry;
  selectedCity: CityData;
  onOpenCitySelector: () => void;
  onRefreshTelemetry: () => void;
  onTriggerSOS: () => void;
  onOpenTriage: () => void;
  onOpenPushSettings?: () => void;
  onOpenHealthReport?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  onChangeRole,
  language,
  onChangeLanguage,
  isMobileFrame,
  onToggleMobileFrame,
  weather,
  selectedCity,
  onOpenCitySelector,
  onRefreshTelemetry,
  onTriggerSOS,
  onOpenTriage,
  onOpenPushSettings,
  onOpenHealthReport,
  onOpenMobileMenu,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefreshTelemetry();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header id="main-tactical-navbar" className="bg-[#0b1326] border-b border-[#2d3449] sticky top-0 z-40 px-2.5 sm:px-5 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Home */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            id="brand-home-button"
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:border-orange-400 transition-colors shrink-0">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1">
                  HEATSHIELD <span className="text-orange-500">AI</span>
                </span>
                <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  SIH26083
                </span>
              </div>
              <p className="text-[11px] text-[#e0c0b1]/70 font-mono hidden sm:block truncate max-w-[170px] md:max-w-[220px]">
                {selectedCity.name} • {selectedCity.weather.stationId}
              </p>
            </div>
          </button>
        </div>

        {/* Center-Left: Indian City Search & GPS Switcher Button */}
        <div className="flex items-center gap-1.5">
          <button
            id="navbar-city-selector-btn"
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#171f33] hover:bg-[#1e273d] border border-orange-500/40 text-white text-xs transition-all shadow-sm group hover:border-orange-400"
            title="Search any city in India or use GPS to detect location"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0 group-hover:animate-bounce" />
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-bold text-white text-xs">{selectedCity.name}</span>
                <span className="text-[10px] text-orange-400 font-mono font-semibold hidden md:inline">
                  {weather.dryBulbTemp}°C
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Search India / GPS
              </div>
            </div>
          </button>

          {/* Quick GPS auto-detect trigger button */}
          <button
            id="navbar-quick-gps-btn"
            onClick={onOpenCitySelector}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#060e20] hover:bg-[#131b2e] border border-[#2d3449] hover:border-orange-500/50 text-[11px] font-mono text-slate-300 transition-colors"
            title="Detect current location via GPS"
          >
            <Navigation className="w-3 h-3 text-orange-400" />
            <span className="hidden md:inline">GPS</span>
          </button>
        </div>

        {/* Center-Right: Live Station Telemetry Capsule (Desktop) */}
        <div className="hidden xl:flex items-center gap-3 bg-[#060e20] px-3 py-1.5 rounded-full border border-[#2d3449]/70 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-orange-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold">WBGT {weather.wbgt}°C</span>
          </div>
          <span className="text-[#584237]">|</span>
          <div className="text-[#dae2fd]">
            Heat Index: <span className="text-red-400 font-semibold">{weather.heatIndex}°C</span>
          </div>
          <span className="text-[#584237]">|</span>
          <div className="text-emerald-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeStr || '13:45:00 IST'}</span>
          </div>
          <button 
            id="navbar-refresh-button"
            onClick={handleRefresh}
            title="Force telemetry resync from AWS station"
            className="p-1 hover:text-orange-400 transition-colors text-slate-400 ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>

        {/* Right: Push Bell, Health Report, Language, SOS */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Push Notification Bell Icon Button */}
          {onOpenPushSettings && (
            <button
              id="navbar-push-settings-btn"
              onClick={onOpenPushSettings}
              className="relative p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#171f33] hover:bg-[#202b44] border border-[#2d3449] hover:border-orange-500/40 text-slate-300 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
              title="Push Notifications & Alert Settings"
            >
              <BellRing className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span className="hidden lg:inline">Push Alerts</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-1 sm:static" />
            </button>
          )}

          {/* Health Report Button */}
          {onOpenHealthReport && (
            <button
              id="navbar-health-report-btn"
              onClick={onOpenHealthReport}
              className="flex items-center gap-1.5 bg-[#171f33] hover:bg-[#202b44] border border-purple-500/40 text-purple-300 hover:text-white px-2 sm:px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
              title="View Clinical Heat Health Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Health Report</span>
            </button>
          )}

          {/* Mobile frame preview toggle */}
          <button
            id="viewport-frame-toggle"
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? "Switch to Full Desktop View" : "Preview Mobile Screen Device"}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border ${
              isMobileFrame 
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40' 
                : 'bg-[#171f33] text-slate-300 border-[#2d3449] hover:border-slate-500'
            }`}
          >
            {isMobileFrame ? <Smartphone className="w-3.5 h-3.5 text-orange-400" /> : <Monitor className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isMobileFrame ? 'Phone View' : 'Desktop View'}</span>
          </button>

          {/* Language Selector */}
          <div className="relative flex items-center bg-[#171f33] border border-[#2d3449] rounded-md px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              id="language-selector-select"
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
              className="bg-transparent text-[#dae2fd] text-xs focus:outline-none cursor-pointer font-sans"
            >
              <option value="en" className="bg-[#171f33] text-white">English</option>
              <option value="hi" className="bg-[#171f33] text-white">हिन्दी (Hindi)</option>
              <option value="mr" className="bg-[#171f33] text-white">मराठी (Marathi)</option>
            </select>
          </div>

          {/* AI Triage button - accessible on both mobile and desktop */}
          <button
            id="navbar-triage-button"
            onClick={onOpenTriage}
            className="flex items-center gap-1 sm:gap-1.5 bg-[#171f33] hover:bg-[#222a3d] border border-orange-500/40 text-orange-300 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shrink-0"
            title="AI Heat Triage & Hyperthermia Diagnostic Tree"
          >
            <Brain className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">AI Triage</span>
          </button>

          {/* High Visibility Emergency SOS Button */}
          <button
            id="emergency-sos-108-button"
            onClick={onTriggerSOS}
            className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider shadow-lg shadow-red-900/30 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
            <span>SOS 108</span>
          </button>

          {/* Mobile All-Tools & Views Menu Button */}
          {onOpenMobileMenu && (
            <button
              id="navbar-mobile-menu-btn"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-1.5 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-orange-500/40 text-orange-400 hover:text-white transition-all flex items-center justify-center shrink-0"
              title="Open Navigation Drawer & Emergency Actions"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  MapPin, 
  ChevronDown, 
  Brain, 
  PhoneCall, 
  Globe, 
  BellRing, 
  Smartphone, 
  Monitor, 
  Settings2, 
  Menu,
  Clock,
  Radio
} from 'lucide-react';
import { NavigationTab, UserRole, LanguageCode, WeatherTelemetry } from '../types';
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
  onTriggerSOS,
  onOpenTriage,
  onOpenPushSettings,
  onOpenHealthReport,
  onOpenMobileMenu,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header id="main-tactical-navbar" className="bg-[#0b1326] border-b border-slate-800/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            id="brand-home-button"
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:border-orange-400 group-hover:scale-105 transition-all shadow-sm">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-base tracking-tight text-white">
                  HeatShield
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                National Heat Early Warning
              </p>
            </div>
          </button>
        </div>

        {/* Center: Clean Clickable Location & Weather Pill */}
        <div className="flex items-center justify-center">
          <button
            id="navbar-city-selector-btn"
            onClick={onOpenCitySelector}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 hover:border-orange-500/50 text-white text-xs transition-all shadow-sm group"
            title="Search Indian cities or use GPS"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="font-semibold text-slate-200 group-hover:text-white">
              {selectedCity.name}
            </span>
            <span className="text-orange-400 font-mono font-bold text-xs bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
              {weather.dryBulbTemp}°C
            </span>
            <span className="hidden md:inline-flex text-[11px] text-slate-400 font-mono">
              WBGT {weather.wbgt}°C
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Right: Actions (AI Triage, SOS 108, Settings, Mobile Menu) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* AI Triage Button */}
          <button
            id="navbar-triage-button"
            onClick={onOpenTriage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-orange-500/50 text-slate-200 hover:text-white text-xs font-medium transition-all shadow-sm"
            title="AI Heat Triage & Symptom Assessment"
          >
            <Brain className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">AI Triage</span>
          </button>

          {/* Emergency 108 Button */}
          <button
            id="navbar-sos-button"
            onClick={onTriggerSOS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/40 transition-all active:scale-95"
            title="Emergency Medical Hotline (Dial 108)"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>SOS 108</span>
          </button>

          {/* Settings & Tools Popover Button */}
          <div className="relative" ref={settingsRef}>
            <button
              id="navbar-settings-dropdown-btn"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs transition-colors"
              title="Preferences & Tools"
            >
              <Settings2 className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>

            {/* Dropdown Menu */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Language selection */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-400" />
                    <span>Language / भाषा</span>
                  </label>
                  <select
                    id="navbar-settings-language-select"
                    value={language}
                    onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="en">English (Default)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                  </select>
                </div>

                {/* Push notification settings */}
                {onOpenPushSettings && (
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenPushSettings();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-orange-400" />
                      <span>Push & Siren Alerts</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">Config</span>
                  </button>
                )}

                {/* Phone Frame Toggle (Desktop) */}
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    onToggleMobileFrame();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isMobileFrame ? <Monitor className="w-4 h-4 text-orange-400" /> : <Smartphone className="w-4 h-4 text-orange-400" />}
                    <span>{isMobileFrame ? 'Desktop Canvas' : 'Phone Simulator'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isMobileFrame ? 'Active' : 'Toggle'}
                  </span>
                </button>

              </div>
            )}
          </div>

          {/* Mobile Navigation Drawer Toggle */}
          {onOpenMobileMenu && (
            <button
              id="navbar-mobile-menu-btn"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-orange-400 hover:text-white transition-colors flex items-center justify-center shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

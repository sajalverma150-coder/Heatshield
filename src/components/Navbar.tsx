import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  MapPin, 
  ChevronDown, 
  Brain, 
  PhoneCall, 
  Globe, 
  BellRing, 
  Settings2, 
  Menu
} from 'lucide-react';
import { NavigationTab, UserRole, LanguageCode, WeatherTelemetry } from '../types';
import { CityData } from '../data/indiaCities';
import { useAppTranslation } from '../i18n/translations';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
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
  const t = useAppTranslation(language);

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
    <header id="main-tactical-navbar" className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
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
                  {t.appName}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
                {t.nationalWarning}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Clean Clickable Location & Weather Pill */}
        <div className="flex items-center justify-center min-w-0">
          <button
            id="navbar-city-selector-btn"
            onClick={onOpenCitySelector}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 hover:border-orange-500/50 text-white text-xs transition-all shadow-sm group min-w-0"
            title={t.searchCityPrompt}
          >
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="font-semibold text-slate-200 group-hover:text-white truncate max-w-[90px] sm:max-w-none">
              {selectedCity.name}
            </span>
            <span className="text-orange-400 font-mono font-bold text-xs bg-orange-500/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-orange-500/20 shrink-0">
              {weather.dryBulbTemp}°C
            </span>
            <span className="hidden md:inline-flex text-[11px] text-slate-400 font-mono">
              WBGT {weather.wbgt}°C
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors shrink-0" />
          </button>
        </div>

        {/* Right: Actions (SOS 108 is priority, Triage & Settings on desktop, Hamburger on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

          {/* AI Triage Button (desktop only, available via drawer & hero on mobile) */}
          <button
            id="navbar-triage-button"
            onClick={onOpenTriage}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-orange-500/50 text-slate-200 hover:text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
            title="AI Heat Triage & Symptom Assessment"
          >
            <Brain className="w-3.5 h-3.5 text-orange-400" />
            <span>{t.aiTriage}</span>
          </button>

          {/* Emergency 108 Button */}
          <button
            id="navbar-sos-button"
            onClick={onTriggerSOS}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-950/40 transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Emergency Medical Hotline (Dial 108)"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="font-headline tracking-wide">{t.sos108}</span>
          </button>

          {/* Settings & Tools Popover Button (Desktop only) */}
          <div className="relative hidden md:block" ref={settingsRef}>
            <button
              id="navbar-settings-dropdown-btn"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Preferences & Language"
            >
              <Globe className="w-4 h-4 text-orange-400" />
              <span className="text-[11px] font-mono uppercase font-bold text-slate-200">{language}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-3.5 z-50 text-xs space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Language selection */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-400" />
                    <span>{t.language}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                    <button
                      type="button"
                      id="dropdown-lang-en-btn"
                      onClick={() => {
                        onChangeLanguage('en');
                        setIsSettingsOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <span>English</span>
                    </button>
                    <button
                      type="button"
                      id="dropdown-lang-hi-btn"
                      onClick={() => {
                        onChangeLanguage('hi');
                        setIsSettingsOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        language === 'hi'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <span>हिन्दी</span>
                    </button>
                  </div>
                </div>

                {/* Push notification settings */}
                {onOpenPushSettings && (
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenPushSettings();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-orange-400" />
                      <span>{t.pushAlerts}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">Config</span>
                  </button>
                )}

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

import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  MapPin,
  ChevronDown,
  Globe,
  BellRing,
  PhoneCall,
  Menu,
  Brain,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { WeatherTelemetry, LanguageCode, UserRole } from '../types';
import { CityData } from '../data/indiaCities';
import { TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  isAdminAuthenticated?: boolean;
  onOpenAdminAuthModal?: () => void;
  onLockAdminSession?: () => void;
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
  onSelectTab,
  isAdminAuthenticated = false,
  onOpenAdminAuthModal,
  onLockAdminSession,
  language,
  onChangeLanguage,
  weather,
  selectedCity,
  onOpenCitySelector,
  onTriggerSOS,
  onOpenTriage,
  onOpenPushSettings,
  onOpenMobileMenu,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Close settings popup when clicking outside
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
    <header id="main-tactical-navbar" className="bg-[#12304A] text-white border-b border-[#1E5A7A] sticky top-0 z-40 px-3 sm:px-6 py-2 sm:py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Government/Institutional Identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            id="brand-home-button"
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#1E5A7A] border border-[#2F7F82] flex items-center justify-center text-white shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#E6B85C]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
                  {t.appName}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1E5A7A] text-[#D6E0E5] font-semibold">
                  {language === 'hi' ? 'शासकीय' : 'GOV'}
                </span>
              </div>
              <p className="text-[11px] text-[#D6E0E5] font-sans hidden md:block">
                {language === 'hi' ? 'राष्ट्रीय लू पूर्व चेतावनी एवं जैव-मौसम विज्ञान' : 'National Heatwave Early Warning & Biometeorology'}
              </p>
            </div>
          </button>
        </div>

        {/* Center: Location & Station Data Badge */}
        <div className="hidden md:flex items-center justify-center">
          <button
            id="navbar-city-selector-btn"
            onClick={onOpenCitySelector}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#183F60] hover:bg-[#1E5A7A] border border-[#2F7F82] text-white text-xs transition-colors cursor-pointer"
            title={t.searchCityPrompt}
          >
            <MapPin className="w-3.5 h-3.5 text-[#E6B85C] shrink-0" />
            <span className="font-medium text-white">
              {selectedCity.name}, {selectedCity.state}
            </span>
            <span className="text-white font-mono font-bold text-xs bg-[#12304A] px-2 py-0.5 rounded border border-[#2F7F82] shrink-0">
              {weather.dryBulbTemp}°C
            </span>
            <span className="text-[11px] text-[#D6E0E5] font-mono">
              WBGT {weather.wbgt}°C
            </span>
            <ChevronDown className="w-3 h-3 text-[#D6E0E5] shrink-0" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* AI / Clinical Triage Button */}
          <button
            id="navbar-triage-button"
            onClick={onOpenTriage}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E5A7A] hover:bg-[#164863] text-white text-xs font-medium transition-colors cursor-pointer border border-[#2F7F82]"
            title="Heat Symptom Triage Assessment"
          >
            <Brain className="w-3.5 h-3.5 text-[#E6B85C]" />
            <span>{t.aiTriage}</span>
          </button>

          {/* Emergency 108 Hotline Button */}
          <button
            id="navbar-sos-button"
            onClick={onTriggerSOS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A63D40] hover:bg-[#8F3437] text-white text-xs font-bold transition-colors cursor-pointer border border-[#C65D27]"
            title="Emergency Medical Hotline (Dial 108)"
          >
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap text-xs">{t.sos108}</span>
          </button>

          {/* Admin Auth Status / Login Button (Desktop) */}
          {isAdminAuthenticated ? (
            <button
              id="navbar-admin-session-active-btn"
              onClick={onLockAdminSession}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#317A5A] hover:bg-[#286349] text-white text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0"
              title={language === 'hi' ? 'सत्र लॉक करने हेतु क्लिक करें' : 'Click to lock admin session and return to Citizen Mode'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>{language === 'hi' ? 'अधिकारी सत्र सक्रिय' : 'Officer Active'}</span>
              <Lock className="w-3 h-3 ml-0.5" />
            </button>
          ) : (
            <button
              id="navbar-admin-login-btn"
              onClick={onOpenAdminAuthModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#183F60] hover:bg-[#1E5A7A] border border-[#2F7F82] text-[#D6E0E5] hover:text-white text-xs font-mono transition-colors cursor-pointer shrink-0"
              title={language === 'hi' ? 'आधिकारिक नगर निगम एवं स्वास्थ्य अधिकारी लॉगिन' : 'Official Municipal & Health Officer Access'}
            >
              <Lock className="w-3.5 h-3.5 text-[#E6B85C]" />
              <span>{language === 'hi' ? 'अधिकारी पोर्टल' : 'Officer Portal'}</span>
            </button>
          )}

          {/* Settings & Language Menu */}
          <div className="relative hidden md:block" ref={settingsRef}>
            <button
              id="navbar-settings-dropdown-btn"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-[#183F60] hover:bg-[#1E5A7A] border border-[#2F7F82] text-white text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              title="Language & Preferences"
            >
              <Globe className="w-3.5 h-3.5 text-[#E6B85C]" />
              <span className="text-xs font-mono uppercase font-semibold text-white">{language}</span>
              <ChevronDown className="w-3 h-3 text-[#D6E0E5]" />
            </button>

            {/* Dropdown Menu */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white text-[#263746] border border-[#D6E0E5] shadow-lg p-3 z-50 text-xs space-y-3">
                {/* Language selection */}
                <div>
                  <label className="text-xs font-semibold text-[#12304A] block mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#1E5A7A]" />
                    <span>{t.language}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#E8F1F5] p-1 rounded-md border border-[#D6E0E5]">
                    <button
                      type="button"
                      id="dropdown-lang-en-btn"
                      onClick={() => {
                        onChangeLanguage('en');
                        setIsSettingsOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        language === 'en'
                          ? 'bg-[#1E5A7A] text-white shadow-xs'
                          : 'text-[#263746] hover:bg-[#D6E0E5]'
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
                      className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        language === 'hi'
                          ? 'bg-[#1E5A7A] text-white shadow-xs'
                          : 'text-[#263746] hover:bg-[#D6E0E5]'
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
                    className="w-full flex items-center justify-between p-2 rounded-md bg-[#E8F1F5] hover:bg-[#D6E0E5] text-[#12304A] transition-colors cursor-pointer border border-[#D6E0E5]"
                  >
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-[#1E5A7A]" />
                      <span className="font-medium">{t.pushAlerts}</span>
                    </div>
                    <span className="text-[11px] text-[#317A5A] font-mono font-semibold">
                      {language === 'hi' ? 'सेट करें' : 'Config'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          {onOpenMobileMenu && (
            <button
              id="navbar-mobile-menu-btn"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-[#183F60] hover:bg-[#1E5A7A] border border-[#2F7F82] text-white transition-colors flex items-center justify-center shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-white" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

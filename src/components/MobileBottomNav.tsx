import React, { useState } from 'react';
import { 
  Activity, 
  Home, 
  ShieldCheck, 
  TrendingUp, 
  BellRing, 
  UserCheck,
  FileText,
  Menu,
  X,
  Brain,
  PhoneCall,
  MapPin,
  Droplet,
  RefreshCw,
  Globe,
  Radio,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { NavigationTab, LanguageCode } from '../types';
import { CityData } from '../data/indiaCities';
import { useAppTranslation } from '../i18n/translations';

export interface MobileBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: LanguageCode;
  isEmbedded?: boolean;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
  onOpenTriage?: () => void;
  onTriggerSOS?: () => void;
  onOpenPushSettings?: () => void;
  onOpenCitySelector?: () => void;
  onOpenHealthReport?: () => void;
  unreadAlertCount?: number;
  selectedCity?: CityData;
  onLogWater?: (amountMl: number) => void;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
  onToggleDataSourceMode?: (mode: 'live_api' | 'imd_heatwave') => void;
  onChangeLanguage?: (lang: LanguageCode) => void;
  onRefreshTelemetry?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  isEmbedded = false,
  isOpen,
  onToggleOpen,
  onOpenTriage,
  onTriggerSOS,
  onOpenPushSettings,
  onOpenCitySelector,
  onOpenHealthReport,
  unreadAlertCount = 0,
  selectedCity,
  onLogWater,
  dataSourceMode = 'live_api',
  onToggleDataSourceMode,
  onChangeLanguage,
  onRefreshTelemetry,
}) => {
  const [internalDrawerOpen, setInternalDrawerOpen] = useState<boolean>(false);
  const isDrawerOpen = isOpen !== undefined ? isOpen : internalDrawerOpen;

  const setDrawerOpen = (open: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(open);
    } else {
      setInternalDrawerOpen(open);
    }
  };

  const t = useAppTranslation(language);

  // Check if active tab is one of the secondary views handled inside the drawer
  const isSecondaryActive = currentTab === 'alerts' || currentTab === 'protocols' || currentTab === 'profile';
  const secondaryLabel = 
    currentTab === 'alerts' ? t.alerts :
    currentTab === 'protocols' ? t.protocols :
    currentTab === 'profile' ? t.profile : t.more;

  // Primary 5 mobile tabs
  const primaryTabs: Array<{
    id: NavigationTab | 'more';
    label: string;
    icon: React.ReactNode;
    badge?: string;
    isEmergency?: boolean;
  }> = [
    { id: 'overview', label: t.live, icon: <Activity className="w-5 h-5" /> },
    { id: 'cooling-finder', label: t.shelters, icon: <Home className="w-5 h-5" /> },
    { id: 'forecast', label: t.forecast, icon: <TrendingUp className="w-5 h-5" /> },
    { 
      id: 'health-report', 
      label: t.dossier, 
      icon: <FileText className="w-5 h-5" />,
    },
    { 
      id: 'more', 
      label: isSecondaryActive ? secondaryLabel : t.menu, 
      icon: isSecondaryActive ? (
        currentTab === 'alerts' ? <BellRing className="w-5 h-5 text-red-400" /> :
        currentTab === 'protocols' ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> :
        <UserCheck className="w-5 h-5 text-orange-400" />
      ) : <Menu className="w-5 h-5" />,
      badge: unreadAlertCount > 0 ? '!' : undefined,
    },
  ];

  // All 7 views for the slide-up Action Drawer
  const allViews: Array<{
    id: NavigationTab;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      title: t.overview,
      description: language === 'hi' ? 'लाइव तापमान, WBGT, हीट इंडेक्स व वाइटल्स' : 'Live dry-bulb, WBGT, heat index, and vital signs',
      icon: <Activity className="w-5 h-5 text-orange-400" />,
      badge: selectedCity?.weather ? `${selectedCity.weather.dryBulbTemp}°C` : undefined,
      badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    },
    {
      id: 'cooling-finder',
      title: t.coolingFinder,
      description: language === 'hi' ? 'मानचित्र, पेयजल कियोस्क व आपातकालीन बेड' : 'GIS map, hydration points, and emergency surge beds',
      icon: <Home className="w-5 h-5 text-emerald-400" />,
      badge: selectedCity ? `${selectedCity.coolingFacilities?.length || 0} ${t.open}` : t.open,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'forecast',
      title: t.forecast,
      description: language === 'hi' ? 'एआई पूर्वानुमान, प्रति घंटा वक्र व प्रभाव' : 'XGBoost ML neural forecast, diurnal WBGT curves & SHAP',
      icon: <TrendingUp className="w-5 h-5 text-cyan-400" />,
      badge: 'ML AI',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'health-report',
      title: t.clinicalReport,
      description: language === 'hi' ? 'फिजियोलॉजिकल स्ट्रेन इंडेक्स (PHSI) व रिपोर्ट' : 'Physiological Strain Index (PHSI), vitals & official PDF export',
      icon: <FileText className="w-5 h-5 text-purple-400" />,
      badge: 'PHSI',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'protocols',
      title: t.protocols,
      description: language === 'hi' ? 'एनडीएमए दिशा-निर्देश, प्राथमिक उपचार व नियम' : 'NDMA Stage IV guidelines, stroke matrix & labor curfew',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      badge: 'NDMA',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'alerts',
      title: t.alerts,
      description: language === 'hi' ? 'ध्वनि सायरन व आपातकालीन चेतावनी प्रसारण' : 'Multi-ward acoustic siren OBD & civil warning dispatch',
      icon: <BellRing className="w-5 h-5 text-red-400" />,
      badge: language === 'hi' ? 'कोड रेड' : 'CODE RED',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse',
    },
    {
      id: 'profile',
      title: t.profile,
      description: language === 'hi' ? 'स्वास्थ्य विवरण, दवाएं व पैरामेडिक क्यूआर कार्ड' : 'Bio-multipliers, chronic conditions, and QR triage card',
      icon: <UserCheck className="w-5 h-5 text-blue-400" />,
      badge: 'PHSI Multiplier',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
  ];

  const containerClass = isEmbedded
    ? "w-full bg-[#0b1326] border-t border-slate-800/80 px-2 py-2 flex items-center justify-around select-none z-30"
    : "lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1326]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 pt-2 pb-5 flex items-center justify-around select-none shadow-2xl";

  return (
    <>
      {/* 5-Button Primary Mobile Bottom Navigation Bar */}
      <nav id="mobile-bottom-navigation-bar" className={containerClass}>
        {primaryTabs.map((item) => {
          const isSelected = item.id === 'more' 
            ? isDrawerOpen || isSecondaryActive 
            : currentTab === item.id && !isDrawerOpen;

          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              onClick={() => {
                if (item.id === 'more') {
                  setDrawerOpen(!isDrawerOpen);
                } else {
                  setDrawerOpen(false);
                  onSelectTab(item.id as NavigationTab);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
                isSelected
                  ? 'text-orange-400 font-bold bg-orange-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <div className={isSelected ? 'text-orange-400' : 'text-slate-400'}>
                  {item.icon}
                </div>
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-mono font-bold rounded-full bg-red-600 text-white min-w-[14px] text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-sans tracking-tight mt-0.5 whitespace-nowrap text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Slide-Up Mobile Command Drawer / Action Sheet */}
      {isDrawerOpen && (
        <div 
          id="mobile-action-drawer-overlay"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end lg:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div 
            id="mobile-action-drawer-sheet"
            className="bg-[#0b1326] border-t border-slate-700 rounded-t-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-5 pb-8 space-y-4 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle and Header */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-600/80 mb-3" />
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-sm sm:text-base text-white">
                      {t.appName} {language === 'hi' ? 'कमान केंद्र' : 'Command Center'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {selectedCity ? `${selectedCity.name} (${selectedCity.weather?.dryBulbTemp}°C)` : (language === 'hi' ? 'आपातकालीन सेवाएं' : 'Emergency Tools')}
                    </p>
                  </div>
                </div>
                <button
                  id="mobile-drawer-close-btn"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-full bg-[#171f33] text-slate-400 hover:text-white border border-[#2d3449] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Emergency & Clinical Action Grid */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
                {language === 'hi' ? 'तत्काल आपातकालीन व चिकित्सा सेवाएं' : 'Instant Emergency & Medical Actions'}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {/* AI Triage Button */}
                {onOpenTriage && (
                  <button
                    id="mobile-drawer-triage-btn"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenTriage();
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-[#171f33] to-[#121929] border border-orange-500/40 hover:border-orange-400 flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-orange-300">{t.aiTriage}</div>
                      <div className="text-[10px] text-slate-400">{language === 'hi' ? 'लक्षण जांच' : 'Symptom check'}</div>
                    </div>
                  </button>
                )}

                {/* 108 SOS Button */}
                {onTriggerSOS && (
                  <button
                    id="mobile-drawer-sos-btn"
                    onClick={() => {
                      setDrawerOpen(false);
                      onTriggerSOS();
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-red-950/60 to-red-900/40 border border-red-500/60 hover:border-red-400 flex items-center gap-2 text-left group animate-pulse cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-red-300">{t.sos108}</div>
                      <div className="text-[10px] text-red-400">{language === 'hi' ? 'एम्बुलेंस डिस्पैच' : 'Ambulance dispatch'}</div>
                    </div>
                  </button>
                )}

                {/* Log Rehydration */}
                {onLogWater && (
                  <button
                    id="mobile-drawer-log-water-btn"
                    onClick={() => {
                      onLogWater(250);
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-[#171f33] to-[#121929] border border-cyan-500/40 hover:border-cyan-400 flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-cyan-300">{t.quickLog250}</div>
                      <div className="text-[10px] text-slate-400">{language === 'hi' ? 'जल सेवन दर्ज करें' : 'Log hydration'}</div>
                    </div>
                  </button>
                )}

                {/* Push Alerts & Siren Sounds */}
                {onOpenPushSettings && (
                  <button
                    id="mobile-drawer-push-btn"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenPushSettings();
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-[#171f33] to-[#121929] border border-amber-500/40 hover:border-amber-400 flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300">{t.pushAlerts}</div>
                      <div className="text-[10px] text-slate-400">{language === 'hi' ? 'सायरन अलर्ट' : 'Alert settings'}</div>
                    </div>
                  </button>
                )}

                {/* City Search & GPS */}
                {onOpenCitySelector && (
                  <button
                    id="mobile-drawer-city-btn"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenCitySelector();
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-[#171f33] to-[#121929] border border-[#2d3449] hover:border-orange-500/50 flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#060e20] flex items-center justify-center text-orange-400 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[90px]">
                        {selectedCity ? selectedCity.name : (language === 'hi' ? 'शहर बदलें' : 'Switch City')}
                      </div>
                      <div className="text-[10px] text-orange-400 font-mono">India GPS</div>
                    </div>
                  </button>
                )}

                {/* Resync Live Telemetry */}
                {onRefreshTelemetry && (
                  <button
                    id="mobile-drawer-resync-btn"
                    onClick={() => {
                      onRefreshTelemetry();
                    }}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-[#171f33] to-[#121929] border border-[#2d3449] hover:border-emerald-500/50 flex items-center gap-2 text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#060e20] flex items-center justify-center text-emerald-400 shrink-0">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-300">{language === 'hi' ? 'रीफ्रेश करें' : 'Sync Data'}</div>
                      <div className="text-[10px] text-slate-400">AWS Station Poll</div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* All 7 Views List */}
            <div>
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
                {language === 'hi' ? 'सभी मुख्य नेविगेशन अनुभाग' : 'All Core Navigation Views'}
              </h4>
              <div className="space-y-1.5">
                {allViews.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`mobile-drawer-view-${item.id}`}
                      onClick={() => {
                        onSelectTab(item.id);
                        setDrawerOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all text-left ${
                        isActive
                          ? 'bg-orange-500/15 border-orange-500 shadow-md ring-1 ring-orange-500/40 text-white'
                          : 'bg-[#171f33]/60 hover:bg-[#171f33] border-[#2d3449] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-[#060e20] text-slate-400'}`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isActive ? 'text-orange-400' : 'text-white'}`}>
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.badge && (
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${item.badgeColor || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Settings & Stream Mode */}
            <div className="pt-2 border-t border-[#2d3449] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {t.language}
                </span>
                {onChangeLanguage && (
                  <div className="flex rounded-lg bg-[#060e20] p-0.5 border border-[#2d3449]">
                    <button
                      onClick={() => onChangeLanguage('en')}
                      className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${language === 'en' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => onChangeLanguage('hi')}
                      className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${language === 'hi' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      हिन्दी
                    </button>
                  </div>
                )}
              </div>

              {onToggleDataSourceMode && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-orange-400" />
                    {t.dataStream}
                  </span>
                  <div className="flex rounded-lg bg-[#060e20] p-0.5 border border-[#2d3449]">
                    <button
                      onClick={() => onToggleDataSourceMode('live_api')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer ${dataSourceMode === 'live_api' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      {t.liveApi}
                    </button>
                    <button
                      onClick={() => onToggleDataSourceMode('imd_heatwave')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer ${dataSourceMode === 'imd_heatwave' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      {t.imdHeatwave}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};


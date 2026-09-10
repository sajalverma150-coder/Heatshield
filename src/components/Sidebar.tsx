import React from 'react';
import { 
  Activity, 
  Home, 
  ShieldCheck, 
  TrendingUp, 
  BellRing, 
  UserCheck, 
  FileText,
  MapPin,
  ChevronRight,
  PhoneCall,
  Sparkles,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { NavigationTab, LanguageCode } from '../types';
import { CityData } from '../data/indiaCities';
import { useAppTranslation } from '../i18n/translations';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: LanguageCode;
  selectedCity: CityData;
  onOpenCitySelector: () => void;
  unreadAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  language,
  selectedCity,
  onOpenCitySelector,
  unreadAlertCount = 1,
}) => {
  const t = useAppTranslation(language);

  const { user, signInWithGoogle, signInAsGuest, signOutUser, authError, clearAuthError } = useAuth();

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeVariant?: 'red' | 'orange' | 'emerald' | 'slate';
  }> = [
    {
      id: 'overview',
      label: t.overview,
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'ai-chat',
      label: language === 'hi' ? 'जेमिनी एआई बॉट' : 'Gemini AI Chat',
      icon: <Sparkles className="w-4 h-4 text-orange-400" />,
      badge: 'Live',
      badgeVariant: 'orange',
    },
    {
      id: 'cooling-finder',
      label: t.coolingFinder,
      icon: <Home className="w-4 h-4" />,
      badge: `${selectedCity.coolingFacilities.length} ${t.open}`,
      badgeVariant: 'emerald',
    },
    {
      id: 'forecast',
      label: t.forecast,
      icon: <TrendingUp className="w-4 h-4" />,
      badge: `${selectedCity.weather.dryBulbTemp}°C`,
      badgeVariant: 'orange',
    },
    {
      id: 'health-report',
      label: t.clinicalReport,
      icon: <FileText className="w-4 h-4" />,
      badge: 'PHSI',
      badgeVariant: 'slate',
    },
    {
      id: 'protocols',
      label: t.protocols,
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      label: t.alerts,
      icon: <BellRing className="w-4 h-4" />,
      badge: unreadAlertCount > 0 ? (language === 'hi' ? 'सक्रिय' : 'Active') : undefined,
      badgeVariant: 'red',
    },
    {
      id: 'profile',
      label: t.profile,
      icon: <UserCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside id="tactical-sidebar-navigation" className="hidden lg:flex flex-col w-64 xl:w-72 bg-slate-900/80 border-r border-slate-800/80 p-4 shrink-0 select-none justify-between">
      
      <div>
        {/* Current Active Station Card */}
        <div 
          onClick={onOpenCitySelector}
          className="p-3 mb-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-orange-500/40 cursor-pointer transition-all group shadow-sm"
          title="Click to change monitoring station or use GPS"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {t.monitoringStation}
            </span>
            <span className="text-[11px] text-orange-400 font-mono group-hover:underline flex items-center">
              {t.change} <ChevronRight className="w-3 h-3 inline" />
            </span>
          </div>
          <div className="font-bold text-white text-sm truncate">
            {selectedCity.name}, {selectedCity.state}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
            {selectedCity.weather.stationId} • {selectedCity.climateZone}
          </div>
        </div>

        {/* Navigation Tab Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/15 text-white border border-orange-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`${isActive ? 'text-orange-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    item.badgeVariant === 'red' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    item.badgeVariant === 'orange' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    item.badgeVariant === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Account & Cloud Sync Status Card */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        {user ? (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-7 h-7 rounded-full border border-emerald-400 shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-white font-semibold truncate text-[11px]">
                  {user.displayName || 'HeatShield User'}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <Cloud className="w-2.5 h-2.5" />
                  {'isGuest' in user && user.isGuest ? 'Local Profile Sync' : 'Firestore Sync'}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOutUser().catch(() => {})}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {authError && (
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-[10px] text-red-300 flex flex-col gap-1">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{authError}</span>
                </div>
                <button
                  onClick={() => signInAsGuest()}
                  className="mt-1 px-2 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] transition-colors text-center cursor-pointer"
                >
                  ⚡ Quick Profile (Offline/Guest)
                </button>
              </div>
            )}
            <button
              onClick={() => signInWithGoogle().catch(() => {})}
              className="w-full p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-xs text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-orange-400" />
              <span>{language === 'hi' ? 'Google साइन-इन' : 'Google Sign-In'}</span>
            </button>
            <button
              onClick={() => signInAsGuest()}
              className="w-full py-1.5 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserIcon className="w-3 h-3 text-slate-400" />
              <span>{language === 'hi' ? 'त्वरित प्रोफाइल (अतिथि)' : 'Quick Guest Profile'}</span>
            </button>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-300 mb-2">
            <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
            <span>{t.emergencyHotlines}</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.ambulance108}:</span>
              <span className="text-red-400 font-bold">108</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{t.disasterMgmt}:</span>
              <span className="text-slate-200">1070 / 1077</span>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};

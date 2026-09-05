import React from 'react';
import { 
  Activity, 
  Home, 
  ShieldCheck, 
  TrendingUp, 
  BellRing, 
  UserCheck 
} from 'lucide-react';
import { NavigationTab, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/mockData';

interface MobileBottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: LanguageCode;
  isEmbedded?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  isEmbedded = false,
}) => {
  const t = TRANSLATIONS[language];

  const tabs: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    isEmergency?: boolean;
  }> = [
    { id: 'overview', label: 'Telemetry', icon: <Activity className="w-5 h-5" /> },
    { id: 'cooling-finder', label: 'Shelters', icon: <Home className="w-5 h-5" /> },
    { id: 'protocols', label: 'First-Aid', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'forecast', label: 'Forecast', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'alerts', label: 'Alerts', icon: <BellRing className="w-5 h-5" />, isEmergency: true },
    { id: 'profile', label: 'Memory', icon: <UserCheck className="w-5 h-5" /> },
  ];

  const containerClass = isEmbedded
    ? "w-full bg-[#0b1326] border-t border-[#2d3449] px-2 py-1.5 flex items-center justify-around select-none"
    : "lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1326]/95 backdrop-blur-lg border-t border-[#2d3449] px-2 py-1.5 flex items-center justify-around select-none shadow-2xl";

  return (
    <nav id="mobile-bottom-navigation-bar" className={containerClass}>
      {tabs.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-tab-${item.id}`}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-all ${
              isActive
                ? 'text-orange-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <div className={isActive ? 'text-orange-400' : 'text-slate-400'}>
                {item.icon}
              </div>
              {item.isEmergency && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] font-sans tracking-tight mt-0.5 truncate max-w-[56px]">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

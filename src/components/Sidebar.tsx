import React from 'react';
import {
  Activity,
  Compass,
  FileText,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  MapPin,
  ChevronRight,
  PhoneCall,
  BellRing,
} from 'lucide-react';
import { LanguageCode } from '../types';
import { CityData } from '../data/indiaCities';
import { TRANSLATIONS } from '../i18n/translations';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
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
  unreadAlertCount = 0,
}) => {
  const t = TRANSLATIONS[language];

  const navItems = [
    {
      id: 'overview',
      label: t.overview,
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'cooling-finder',
      label: t.coolingFinder,
      icon: <Compass className="w-4 h-4" />,
      badge: language === 'hi' ? 'जीआईएस' : 'GIS',
      badgeVariant: 'teal',
    },
    {
      id: 'protocols',
      label: t.protocols,
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'forecast',
      label: t.forecast,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      label: t.alerts,
      icon: <BellRing className="w-4 h-4" />,
      badge: unreadAlertCount > 0 ? (language === 'hi' ? 'सक्रिय' : 'Active') : undefined,
      badgeVariant: 'emergency',
    },
    {
      id: 'profile',
      label: t.profile,
      icon: <UserCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside id="tactical-sidebar-navigation" className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#12304A] border-r border-[#1E5A7A] p-4 shrink-0 select-none justify-between text-[#D6E0E5]">
      
      <div>
        {/* Current Active Monitoring Station Card */}
        <div 
          onClick={onOpenCitySelector}
          className="p-3 mb-4 rounded-lg bg-[#183F60] border border-[#2F7F82] hover:border-[#D6E0E5] cursor-pointer transition-colors group"
          title={language === 'hi' ? 'मौसम केंद्र बदलें या जीपीएस का उपयोग करें' : 'Click to change monitoring station or use GPS'}
        >
          <div className="flex items-center justify-between text-xs text-[#D6E0E5] mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#317A5A]" />
              {t.monitoringStation}
            </span>
            <span className="text-[11px] text-[#D6E0E5] group-hover:text-white font-mono group-hover:underline flex items-center">
              {t.change} <ChevronRight className="w-3 h-3 inline" />
            </span>
          </div>
          <div className="font-bold text-white text-sm truncate font-sans">
            {selectedCity.name}, {selectedCity.state}
          </div>
          <div className="text-[11px] text-[#D6E0E5] font-mono mt-0.5 truncate">
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1E5A7A] text-white font-semibold'
                    : 'text-[#D6E0E5] hover:text-white hover:bg-[#183F60]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`${isActive ? 'text-white' : 'text-[#D6E0E5]'}`}>
                    {item.icon}
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold shrink-0 ${
                    isActive ? 'bg-white/20 text-white' :
                    item.badgeVariant === 'emergency' ? 'bg-[#A63D40] text-white' :
                    item.badgeVariant === 'teal' ? 'bg-[#2F7F82] text-white' :
                    'bg-[#183F60] text-[#D6E0E5]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Emergency Hotlines Card */}
      <div className="pt-4 border-t border-[#1E5A7A] space-y-3">
        <div className="p-3 rounded-lg bg-[#183F60] border border-[#2F7F82] text-xs">
          <div className="flex items-center gap-2 font-semibold text-white mb-2">
            <PhoneCall className="w-3.5 h-3.5 text-[#E6B85C]" />
            <span>{t.emergencyHotlines}</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-[#D6E0E5]">{t.ambulance108}:</span>
              <span className="text-white font-bold bg-[#A63D40] px-1.5 py-0.2 rounded">108</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#D6E0E5]">{t.disasterMgmt}:</span>
              <span className="text-white font-medium">1070 / 1077</span>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};

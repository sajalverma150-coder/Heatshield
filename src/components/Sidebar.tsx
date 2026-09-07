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
  PhoneCall
} from 'lucide-react';
import { NavigationTab, LanguageCode } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { CityData } from '../data/indiaCities';

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
  const t = TRANSLATIONS[language];

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeVariant?: 'red' | 'orange' | 'emerald' | 'slate';
  }> = [
    {
      id: 'overview',
      label: t.overview || 'Live Telemetry',
      icon: <Activity className="w-4 h-4" />,
    },
    {
      id: 'cooling-finder',
      label: t.coolingFinder || 'Cooling Shelters',
      icon: <Home className="w-4 h-4" />,
      badge: `${selectedCity.coolingFacilities.length} Open`,
      badgeVariant: 'emerald',
    },
    {
      id: 'forecast',
      label: t.forecast || '7-Day ML Forecast',
      icon: <TrendingUp className="w-4 h-4" />,
      badge: `${selectedCity.weather.dryBulbTemp}°C`,
      badgeVariant: 'orange',
    },
    {
      id: 'health-report',
      label: 'Clinical Health Dossier',
      icon: <FileText className="w-4 h-4" />,
      badge: 'PHSI',
      badgeVariant: 'slate',
    },
    {
      id: 'protocols',
      label: t.protocols || 'Curfew & First-Aid',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'alerts',
      label: t.alerts || 'Emergency Broadcasts',
      icon: <BellRing className="w-4 h-4" />,
      badge: unreadAlertCount > 0 ? 'Active' : undefined,
      badgeVariant: 'red',
    },
    {
      id: 'profile',
      label: t.profile || 'Personal Health Profile',
      icon: <UserCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside id="tactical-sidebar-navigation" className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#0b1326] border-r border-slate-800/80 p-4 shrink-0 select-none justify-between">
      
      <div>
        {/* Current Active Station Card */}
        <div 
          onClick={onOpenCitySelector}
          className="p-3 mb-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 cursor-pointer transition-all group shadow-sm"
          title="Click to change monitoring station or use GPS"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Monitoring Station
            </span>
            <span className="text-[11px] text-orange-400 font-mono group-hover:underline flex items-center">
              Change <ChevronRight className="w-3 h-3 inline" />
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-500/15 text-white border border-orange-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
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

      {/* Clean Emergency Contacts Footer */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-300 mb-2">
            <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
            <span>Emergency Hotlines</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Ambulance (108):</span>
              <span className="text-red-400 font-bold">108</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Disaster Mgmt:</span>
              <span className="text-slate-200">1070 / 1077</span>
            </div>
          </div>
        </div>
      </div>

    </aside>
  );
};

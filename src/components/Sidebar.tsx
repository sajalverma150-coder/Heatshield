import React from 'react';
import { 
  Activity, 
  Home, 
  ShieldCheck, 
  TrendingUp, 
  BellRing, 
  UserCheck, 
  Radio, 
  AlertOctagon,
  Database,
  Lock,
  MapPin,
  ChevronRight,
  Navigation,
  FileText
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
    sublabel: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: t.overview,
      sublabel: 'Biometeorology & Vitals',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: 'cooling-finder',
      label: t.coolingFinder,
      sublabel: 'Shelters & Surge Beds',
      icon: <Home className="w-5 h-5" />,
      badge: `${selectedCity.coolingFacilities.length} Open`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'protocols',
      label: t.protocols,
      sublabel: 'First-Aid & Hydration Matrix',
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      id: 'forecast',
      label: t.forecast,
      sublabel: 'XGBoost ML v2.4 + SHAP',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: `${selectedCity.weather.dryBulbTemp}°C`,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: 'alerts',
      label: t.alerts,
      sublabel: 'Dispatch & Audio OBD',
      icon: <BellRing className="w-5 h-5" />,
      badge: unreadAlertCount > 0 ? 'ALERT' : undefined,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
    },
    {
      id: 'profile',
      label: t.profile,
      sublabel: 'Bio-Multiplier & QR Triage',
      icon: <UserCheck className="w-5 h-5" />,
      badge: '94/100',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    },
    {
      id: 'health-report',
      label: 'Clinical Health Report',
      sublabel: 'Physiological Dossier & PDF',
      icon: <FileText className="w-5 h-5" />,
      badge: 'PHSI',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <aside id="tactical-sidebar-navigation" className="hidden lg:flex flex-col w-64 xl:w-72 bg-[#0b1326] border-r border-[#2d3449] p-3 shrink-0 select-none">
      
      {/* Top Station & Selected City Card */}
      <div className="px-3 py-2.5 mb-2 bg-[#060e20] rounded-xl border border-[#2d3449]/70 hover:border-orange-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#a78b7d] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Station
          </span>
          <button
            onClick={onOpenCitySelector}
            className="text-[10px] font-mono text-orange-400 hover:text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 flex items-center gap-1 transition-colors"
          >
            <span>Change</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>
        <p className="text-sm font-bold text-white mt-1 truncate">
          {selectedCity.name}, {selectedCity.state}
        </p>
        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
          {selectedCity.weather.stationName}
        </p>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-[#171f33] text-white border border-orange-500/50 shadow-md shadow-orange-950/20'
                  : 'text-[#dae2fd]/70 hover:text-white hover:bg-[#131b2e] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : 'bg-[#060e20] text-slate-400 group-hover:text-orange-400 border border-[#2d3449]'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold truncate ${isActive ? 'text-orange-300' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-[#e0c0b1]/60 font-mono truncate">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Municipal Hotline Box */}
      <div className="mt-3 p-3 rounded-xl bg-gradient-to-b from-[#171f33] to-[#060e20] border border-[#2d3449]">
        <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 mb-1">
          <AlertOctagon className="w-4 h-4 text-orange-500" />
          <span>Municipal Heat Helpline</span>
        </div>
        <div className="text-xs text-slate-300 space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-400">Emergency Ambulance:</span>
            <span className="text-red-400 font-bold">108</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Disaster Management:</span>
            <span className="text-white">1070 / 1077</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Civic Helpline:</span>
            <span className="text-cyan-400">1916</span>
          </div>
        </div>
      </div>

      {/* Bottom Diagnostics */}
      <div className="mt-3 pt-3 border-t border-[#2d3449] text-[11px] font-mono text-slate-400 space-y-1 px-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-slate-500" />
            <span className="truncate max-w-[140px]">{selectedCity.weather.stationId}</span>
          </span>
          <span className="text-emerald-400 font-bold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>DPDP Encrypted</span>
          </span>
          <span className="text-emerald-400 font-bold">ACTIVE</span>
        </div>
      </div>

    </aside>
  );
};

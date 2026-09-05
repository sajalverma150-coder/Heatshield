import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CitySearchSelector } from './components/CitySearchSelector';
import { LiveTelemetryView } from './components/views/LiveTelemetryView';
import { CoolingFinderView } from './components/views/CoolingFinderView';
import { ActionProtocolsView } from './components/views/ActionProtocolsView';
import { PredictiveForecastView } from './components/views/PredictiveForecastView';
import { EmergencyAlertsView } from './components/views/EmergencyAlertsView';
import { PersonalHealthProfileView } from './components/views/PersonalHealthProfileView';
import { HealthReportView } from './components/views/HealthReportView';
import { TriageModal } from './components/modals/TriageModal';
import { EmergencyCallModal } from './components/modals/EmergencyCallModal';
import { HealthReportModal } from './components/modals/HealthReportModal';
import { PushNotificationSettingsModal } from './components/modals/PushNotificationSettingsModal';
import { HydrationAlertToast } from './components/HydrationAlertToast';
import { PushNotificationBanner } from './components/PushNotificationBanner';
import { RollingHeadlinesTicker } from './components/RollingHeadlinesTicker';
import { 
  NavigationTab, 
  UserRole, 
  LanguageCode, 
  WeatherTelemetry, 
  UserHealthProfile, 
  CoolingFacility 
} from './types';
import { 
  INITIAL_WEATHER_TELEMETRY, 
  INITIAL_USER_PROFILE, 
  COOLING_FACILITIES 
} from './data/mockData';
import { 
  INDIAN_CITIES, 
  CityData, 
  findNearestIndianCity 
} from './data/indiaCities';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  
  // Active city & GPS selection state
  const [selectedCity, setSelectedCity] = useState<CityData>(INDIAN_CITIES[0]);
  const [isCitySelectorOpen, setIsCitySelectorOpen] = useState<boolean>(false);
  const [gpsStatusText, setGpsStatusText] = useState<string | null>(null);

  // App telemetry & facilities state
  const [weather, setWeather] = useState<WeatherTelemetry>(INDIAN_CITIES[0].weather);
  const [facilities, setFacilities] = useState<CoolingFacility[]>(INDIAN_CITIES[0].coolingFacilities);
  
  // User profile
  const [userProfile, setUserProfile] = useState<UserHealthProfile>(() => {
    try {
      const saved = localStorage.getItem('heatshield_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_USER_PROFILE;
  });

  // Modals state
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isTriageOpen, setIsTriageOpen] = useState<boolean>(false);
  const [isHealthReportOpen, setIsHealthReportOpen] = useState<boolean>(false);
  const [isPushSettingsOpen, setIsPushSettingsOpen] = useState<boolean>(false);

  // Automatic GPS Geolocation Detection on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const { city, distanceKm } = findNearestIndianCity(latitude, longitude);
          
          if (city) {
            setSelectedCity(city);
            setWeather(city.weather);
            setFacilities(city.coolingFacilities);
            setGpsStatusText(`GPS Locked: Nearest Station ${city.name} (${distanceKm} km away)`);
          }
        },
        (error) => {
          // Gracefully fallback to default city if location is not granted
          console.log('GPS geolocation prompt skipped or denied:', error.message);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    }
  }, []);

  // Sync profile changes to local storage
  const handleUpdateProfile = (updated: UserHealthProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('heatshield_user_profile', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const [activeNavFacility, setActiveNavFacility] = useState<CoolingFacility | null>(null);

  const handleSelectCity = (city: CityData) => {
    setSelectedCity(city);
    setWeather(city.weather);
    setFacilities(city.coolingFacilities);
    setActiveNavFacility(null);
  };

  const handleLogWater = (amountMl: number) => {
    const now = Date.now();
    const nowStr = new Date(now).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const updated = {
      ...userProfile,
      hydrationTodayMl: userProfile.hydrationTodayMl + amountMl,
      lastWaterLogTime: nowStr,
      lastWaterLogTimestamp: now,
    };
    handleUpdateProfile(updated);
  };

  const handleSimulateHydrationDelay = () => {
    const twoHoursAgo = Date.now() - (2 * 60 + 20) * 60 * 1000;
    const timeStr = new Date(twoHoursAgo).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const updated = {
      ...userProfile,
      lastWaterLogTime: timeStr,
      lastWaterLogTimestamp: twoHoursAgo,
    };
    handleUpdateProfile(updated);
  };

  const handleRefreshTelemetry = () => {
    // Minor realistic variation simulating IMD sensor update
    const randomTempOffset = (Math.random() * 0.4 - 0.2);
    setWeather(prev => ({
      ...prev,
      dryBulbTemp: Number((prev.dryBulbTemp + randomTempOffset).toFixed(1)),
      wbgt: Number((prev.wbgt + randomTempOffset * 0.6).toFixed(1)),
      heatIndex: Number((prev.heatIndex + randomTempOffset * 0.8).toFixed(1)),
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST (Live Sync)',
    }));
  };

  const handleNavigateToFacility = (facility: CoolingFacility) => {
    setActiveNavFacility(facility);
    setCurrentTab('cooling-finder');
  };

  // Render active main content view
  const renderActiveView = () => {
    switch (currentTab) {
      case 'overview':
        return (
          <LiveTelemetryView
            weather={weather}
            userProfile={userProfile}
            facilities={facilities}
            selectedCity={selectedCity}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            onLogWater={handleLogWater}
            onNavigateToFacility={handleNavigateToFacility}
            onOpenTriage={() => setIsTriageOpen(true)}
            onTriggerSOS={() => setIsSOSOpen(true)}
            onSwitchTab={(tab) => setCurrentTab(tab)}
            onSimulateInactivity={handleSimulateHydrationDelay}
            onOpenHealthReport={() => setIsHealthReportOpen(true)}
            onOpenPushSettings={() => setIsPushSettingsOpen(true)}
          />
        );
      case 'cooling-finder':
        return (
          <CoolingFinderView
            facilities={facilities}
            selectedCity={selectedCity}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            onNavigateToFacility={handleNavigateToFacility}
            onTriggerSOS={() => setIsSOSOpen(true)}
            activeNavigationFacility={activeNavFacility}
            onClearNavigationFacility={() => setActiveNavFacility(null)}
            onSelectCity={handleSelectCity}
          />
        );
      case 'protocols':
        return (
          <ActionProtocolsView
            onTriggerSOS={() => setIsSOSOpen(true)}
            onOpenTriage={() => setIsTriageOpen(true)}
          />
        );
      case 'forecast':
        return (
          <PredictiveForecastView
            forecastDays={(selectedCity as any).forecast || (selectedCity as any).forecastDays || []}
            selectedCity={selectedCity}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
          />
        );
      case 'alerts':
        return (
          <EmergencyAlertsView
            language={language}
            selectedCity={selectedCity}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            onTriggerSOS={() => setIsSOSOpen(true)}
          />
        );
      case 'profile':
        return (
          <PersonalHealthProfileView
            profile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onOpenTriage={() => setIsTriageOpen(true)}
          />
        );
      case 'health-report':
        return (
          <HealthReportView
            weather={weather}
            userProfile={userProfile}
            onLogWater={handleLogWater}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#060e20] text-[#dae2fd] flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Top Tactical Command Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onChangeRole={setUserRole}
        language={language}
        onChangeLanguage={setLanguage}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        weather={weather}
        selectedCity={selectedCity}
        onOpenCitySelector={() => setIsCitySelectorOpen(true)}
        onRefreshTelemetry={handleRefreshTelemetry}
        onTriggerSOS={() => setIsSOSOpen(true)}
        onOpenTriage={() => setIsTriageOpen(true)}
        onOpenPushSettings={() => setIsPushSettingsOpen(true)}
        onOpenHealthReport={() => setIsHealthReportOpen(true)}
      />

      {/* Permanent Rolling Headlines Ticker for Critical Cities in India */}
      <RollingHeadlinesTicker
        selectedCity={selectedCity}
        cities={INDIAN_CITIES}
        onSelectCity={handleSelectCity}
        onOpenHealthReport={() => setIsHealthReportOpen(true)}
        onOpenPushSettings={() => setIsPushSettingsOpen(true)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Desktop View) */}
        {!isMobileFrame && (
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            language={language}
            selectedCity={selectedCity}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            unreadAlertCount={1}
          />
        )}

        {/* Dynamic Content Area with padding to prevent mobile bottom-bar overlap */}
        <main className="flex-1 overflow-y-auto bg-[#060e20] p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6">
          
          {/* If Mobile Frame Mode is enabled, render in a phone frame */}
          {isMobileFrame ? (
            <div className="max-w-md mx-auto my-4 bg-[#0b1326] rounded-[40px] border-4 border-[#2d3449] shadow-2xl overflow-hidden relative pb-16 ring-1 ring-orange-500/30">
              
              {/* Phone Speaker & Camera Notch */}
              <div className="w-36 h-5 bg-[#060e20] rounded-b-2xl mx-auto flex items-center justify-center gap-2 mb-2 border-b border-x border-[#2d3449]">
                <div className="w-10 h-1 bg-[#2d3449] rounded-full" />
                <div className="w-2 h-2 bg-[#2d3449] rounded-full" />
              </div>

              {/* Status bar */}
              <div className="px-6 flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2">
                <span>{selectedCity.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>GPS Active • 5G</span>
                </div>
              </div>

              {/* Inner phone scrollable content */}
              <div className="px-3 pt-1 max-h-[70vh] overflow-y-auto pb-6">
                {renderActiveView()}
              </div>

              {/* Mobile bottom nav inside frame */}
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <MobileBottomNav
                  currentTab={currentTab}
                  onSelectTab={setCurrentTab}
                  language={language}
                  isEmbedded={true}
                />
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {renderActiveView()}
            </div>
          )}

        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Standard Mobile Viewport) */}
      {!isMobileFrame && (
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          language={language}
        />
      )}

      {/* Indian Cities Search & Automatic GPS Location Modal */}
      <CitySearchSelector
        isOpen={isCitySelectorOpen}
        onClose={() => setIsCitySelectorOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
      />

      {/* AI Triage Diagnostic Tree Modal */}
      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        onTriggerSOS={() => {
          setIsTriageOpen(false);
          setIsSOSOpen(true);
        }}
        onNavigateToShelter={() => {
          setIsTriageOpen(false);
          setCurrentTab('cooling-finder');
        }}
      />

      {/* Emergency 108 SOS Dispatch Modal */}
      <EmergencyCallModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        userProfile={userProfile}
      />

      {/* Comprehensive Clinical Health Report Dossier Modal */}
      <HealthReportModal
        isOpen={isHealthReportOpen}
        onClose={() => setIsHealthReportOpen(false)}
        weather={weather}
        userProfile={userProfile}
        onLogWater={handleLogWater}
      />

      {/* Push Notification Controls & Test Station Modal */}
      <PushNotificationSettingsModal
        isOpen={isPushSettingsOpen}
        onClose={() => setIsPushSettingsOpen(false)}
        onLogWater={handleLogWater}
      />

      {/* Subtle UI Toast Alert for Hydration Inactivity during High Heat */}
      <HydrationAlertToast
        weather={weather}
        userProfile={userProfile}
        onLogWater={handleLogWater}
        onSimulateInactivity={handleSimulateHydrationDelay}
        onOpenPushSettings={() => setIsPushSettingsOpen(true)}
      />

      {/* Global In-App Push Notification Slide-in Banner */}
      <PushNotificationBanner
        onLogWater={handleLogWater}
      />

    </div>
  );
}

export default App;

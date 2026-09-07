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
  CoolingFacility,
  ForecastDay 
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
import { 
  fetchLiveWeatherFromApi, 
  fetchLiveForecastFromApi, 
  fetchLiveBatchCitiesWeather,
  generateCalibratedCityForecast,
  CityLiveSummary 
} from './services/weatherApiService';

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
  const [forecastDays, setForecastDays] = useState<ForecastDay[]>(() => 
    (INDIAN_CITIES[0] as any).forecast || generateCalibratedCityForecast(INDIAN_CITIES[0], 7)
  );
  const [batchCitiesWeather, setBatchCitiesWeather] = useState<Record<string, CityLiveSummary>>({});
  const [facilities, setFacilities] = useState<CoolingFacility[]>(INDIAN_CITIES[0].coolingFacilities);
  const [dataSourceMode, setDataSourceMode] = useState<'live_api' | 'imd_heatwave'>('live_api');
  const [isLiveApiLoading, setIsLiveApiLoading] = useState<boolean>(false);

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Function to load weather telemetry for any selected city
  const loadWeatherForCity = async (city: CityData, mode: 'live_api' | 'imd_heatwave' = dataSourceMode) => {
    if (mode === 'live_api') {
      setIsLiveApiLoading(true);
      try {
        const [liveWeather, liveForecast] = await Promise.all([
          fetchLiveWeatherFromApi(city.lat, city.lng, city.weather),
          fetchLiveForecastFromApi(city.lat, city.lng, city.name, city.climateZone),
        ]);
        setWeather(liveWeather);
        setForecastDays(liveForecast);
        setSelectedCity((prev) => ({
          ...prev,
          weather: liveWeather,
          forecast: liveForecast,
        }));
      } catch (err) {
        console.warn('Failed to fetch live API weather, falling back to calibrated IMD station model:', err);
        setWeather(city.weather);
        const calibrated = generateCalibratedCityForecast(city, 7);
        setForecastDays(calibrated);
      } finally {
        setIsLiveApiLoading(false);
      }
    } else {
      setWeather(city.weather);
      const drillForecast = generateCalibratedCityForecast(city, 7);
      setForecastDays(drillForecast);
      setSelectedCity((prev) => ({
        ...prev,
        weather: city.weather,
        forecast: drillForecast,
      }));
    }
  };

  // Initial load of live weather and batch cities on startup
  useEffect(() => {
    loadWeatherForCity(INDIAN_CITIES[0], 'live_api');
    fetchLiveBatchCitiesWeather(INDIAN_CITIES).then((batch) => {
      if (Object.keys(batch).length > 0) {
        setBatchCitiesWeather(batch);
      }
    });
  }, []);

  // Sync batch updates when user toggles to live mode
  useEffect(() => {
    if (dataSourceMode === 'live_api') {
      fetchLiveBatchCitiesWeather(INDIAN_CITIES).then((batch) => {
        if (Object.keys(batch).length > 0) {
          setBatchCitiesWeather(batch);
        }
      });
    }
  }, [dataSourceMode]);

  // Automatic GPS Geolocation Detection on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const { city, distanceKm } = findNearestIndianCity(latitude, longitude);
          
          if (city) {
            setSelectedCity(city);
            setFacilities(city.coolingFacilities);
            setGpsStatusText(`GPS Locked: Nearest Station ${city.name} (${distanceKm} km away)`);
            loadWeatherForCity(city, dataSourceMode);
          }
        },
        (error) => {
          // Gracefully fallback to default city if location is not granted
          console.log('GPS geolocation prompt skipped or denied:', error.message);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
    }
  }, [dataSourceMode]);

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
    setFacilities(city.coolingFacilities);
    setActiveNavFacility(null);
    loadWeatherForCity(city, dataSourceMode);
  };

  const handleToggleDataSourceMode = (newMode: 'live_api' | 'imd_heatwave') => {
    setDataSourceMode(newMode);
    loadWeatherForCity(selectedCity, newMode);
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

  const handleRefreshTelemetry = async () => {
    await loadWeatherForCity(selectedCity, dataSourceMode);
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
            isLiveApiLoading={isLiveApiLoading}
            dataSourceMode={dataSourceMode}
            onToggleDataSourceMode={handleToggleDataSourceMode}
            onRefreshTelemetry={handleRefreshTelemetry}
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
            forecastDays={forecastDays && forecastDays.length > 0 ? forecastDays : (selectedCity as any).forecast || (selectedCity as any).forecastDays || []}
            selectedCity={selectedCity}
            weather={weather}
            dataSourceMode={dataSourceMode}
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
            selectedCity={selectedCity}
            coolingFacilities={facilities}
            onLogWater={handleLogWater}
            onOpenTriage={() => setIsTriageOpen(true)}
            onTriggerSOS={() => setIsSOSOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#090e17] text-[#e2e8f0] flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Top Header */}
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
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Permanent Rolling Headlines Ticker for Critical Cities in India */}
      <RollingHeadlinesTicker
        selectedCity={selectedCity}
        cities={INDIAN_CITIES}
        onSelectCity={handleSelectCity}
        onOpenHealthReport={() => setIsHealthReportOpen(true)}
        onOpenPushSettings={() => setIsPushSettingsOpen(true)}
        weather={weather}
        dataSourceMode={dataSourceMode}
        citiesLiveWeather={batchCitiesWeather}
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
        <main className="flex-1 overflow-y-auto bg-[#090e17] p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6">
          
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
                  isOpen={isMobileMenuOpen}
                  onToggleOpen={setIsMobileMenuOpen}
                  onOpenTriage={() => setIsTriageOpen(true)}
                  onTriggerSOS={() => setIsSOSOpen(true)}
                  onOpenPushSettings={() => setIsPushSettingsOpen(true)}
                  onOpenCitySelector={() => setIsCitySelectorOpen(true)}
                  onOpenHealthReport={() => setCurrentTab('health-report')}
                  unreadAlertCount={1}
                  selectedCity={selectedCity}
                  onLogWater={handleLogWater}
                  dataSourceMode={dataSourceMode}
                  onToggleDataSourceMode={handleToggleDataSourceMode}
                  onChangeLanguage={setLanguage}
                  onRefreshTelemetry={handleRefreshTelemetry}
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
          isOpen={isMobileMenuOpen}
          onToggleOpen={setIsMobileMenuOpen}
          onOpenTriage={() => setIsTriageOpen(true)}
          onTriggerSOS={() => setIsSOSOpen(true)}
          onOpenPushSettings={() => setIsPushSettingsOpen(true)}
          onOpenCitySelector={() => setIsCitySelectorOpen(true)}
          onOpenHealthReport={() => setCurrentTab('health-report')}
          unreadAlertCount={1}
          selectedCity={selectedCity}
          onLogWater={handleLogWater}
          dataSourceMode={dataSourceMode}
          onToggleDataSourceMode={handleToggleDataSourceMode}
          onChangeLanguage={setLanguage}
          onRefreshTelemetry={handleRefreshTelemetry}
        />
      )}

      {/* Indian Cities Search & Automatic GPS Location Modal */}
      <CitySearchSelector
        isOpen={isCitySelectorOpen}
        onClose={() => setIsCitySelectorOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        dataSourceMode={dataSourceMode}
        citiesLiveWeather={batchCitiesWeather}
        activeWeather={weather}
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
        selectedCity={selectedCity}
        coolingFacilities={facilities}
        onLogWater={handleLogWater}
        onOpenTriage={() => {
          setIsHealthReportOpen(false);
          setIsTriageOpen(true);
        }}
        onTriggerSOS={() => {
          setIsHealthReportOpen(false);
          setIsSOSOpen(true);
        }}
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

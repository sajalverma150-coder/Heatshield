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
import { AuthProvider } from './context/AuthContext';
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
            language={language}
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
            cityName={selectedCity.name}
            language={language}
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
            weather={weather}
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
            language={language}
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
            language={language}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#090e17] text-[#e2e8f0] flex flex-col selection:bg-orange-500 selection:text-white">
        
        {/* Top Header */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={userRole}
          onChangeRole={setUserRole}
          language={language}
          onChangeLanguage={setLanguage}
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

        {/* Main Responsive Container Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar (Desktop / PC View) */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            language={language}
            selectedCity={selectedCity}
            onOpenCitySelector={() => setIsCitySelectorOpen(true)}
            unreadAlertCount={1}
          />

          {/* Dynamic Content Area: seamlessly fluid on Mobile, Tablet & PC */}
          <main className="flex-1 overflow-y-auto bg-[#090e17] px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">
            <div className="max-w-6xl mx-auto w-full">
              {renderActiveView()}
            </div>
          </main>
        </div>

        {/* Mobile / Tablet Bottom Navigation Bar (Hidden on Desktop) */}
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
    </AuthProvider>
  );
}

export default App;

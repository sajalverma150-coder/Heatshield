import React, { useState, useMemo, useEffect } from 'react';
import { 
  Droplet, 
  Flame, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Plus, 
  Zap, 
  Sparkles,
  HeartPulse,
  Clock,
  RotateCcw,
  Bell,
  BellRing,
  BarChart3,
  FileText,
  Radio,
  ShieldCheck,
  Calendar,
  Activity
} from 'lucide-react';
import { UserHealthProfile, WeatherTelemetry, LanguageCode } from '../types';
import { calculateDehydrationRisk, DehydrationRiskAssessment } from '../services/hydrationRisk';
import { 
  calculateConditionBasedWaterIntake, 
  calculateWeatherBasedORS,
  getMillisecondsUntilISTReset,
  getISTDateString
} from '../services/hydrationScheduleService';
import { 
  checkHydrationAlertStatus, 
  getNotificationPermission, 
  requestNotificationPermission, 
  triggerTestPushNotification, 
  playNotificationChime,
  NotificationPermissionState 
} from '../services/hydrationNotificationService';
import { HydrationChart } from './HydrationChart';
import { useAppTranslation } from '../i18n/translations';

interface HydrationTrackerProps {
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  onLogWater: (amountMl: number) => void;
  language?: LanguageCode;
  className?: string;
  onOpenTriage?: () => void;
  onSimulateInactivity?: () => void;
  onOpenHealthReport?: () => void;
  onOpenPushSettings?: () => void;
}

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({
  weather,
  userProfile,
  onLogWater,
  language = 'en',
  className = '',
  onOpenTriage,
  onSimulateInactivity,
  onOpenHealthReport,
  onOpenPushSettings,
}) => {
  const langCode: LanguageCode = language === 'hi' ? 'hi' : 'en';
  const t = useAppTranslation(langCode);
  const isHindi = langCode === 'hi';

  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showConditionGuide, setShowConditionGuide] = useState<boolean>(false);
  const [showOrsGuide, setShowOrsGuide] = useState<boolean>(false);
  const [showChart, setShowChart] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(getNotificationPermission());
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('heatshield_push_enabled') === 'true';
    } catch {
      return false;
    }
  });

  // Calculate milliseconds until midnight IST reset and format hours:minutes remaining
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  useEffect(() => {
    const updateCountdown = () => {
      const ms = getMillisecondsUntilISTReset();
      const totalSec = Math.floor(ms / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      setTimeUntilReset(`${hours}h ${mins}m`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute live dehydration risk assessment
  const assessment: DehydrationRiskAssessment = useMemo(() => {
    return calculateDehydrationRisk(weather, userProfile);
  }, [weather, userProfile]);

  // Compute condition-specific fluid recommendation
  const conditionIntake = useMemo(() => {
    return calculateConditionBasedWaterIntake(userProfile, weather.heatIndex);
  }, [userProfile, weather.heatIndex]);

  // Compute weather-based WHO-ORS recommendation
  const orsRecommendation = useMemo(() => {
    return calculateWeatherBasedORS(weather, userProfile, langCode);
  }, [weather, userProfile, langCode]);

  // Compute 2-hour inactivity status during high heat index
  const alertStatus = useMemo(() => {
    return checkHydrationAlertStatus(assessment.heatIndex, userProfile.lastWaterLogTimestamp);
  }, [assessment.heatIndex, userProfile.lastWaterLogTimestamp]);

  const handleRequestPush = async () => {
    playNotificationChime();
    const res = await requestNotificationPermission();
    setPermissionState(res.state);
    setIsPushEnabled(true);
    
    triggerTestPushNotification(
      isHindi ? '🔔 पुश सूचनाएं सक्षम हुईं!' : '🔔 Push Notifications Enabled!',
      isHindi ? 'चरम गर्मी में आपके जलयोजन अंतराल की स्वतः निगरानी की जा रही है।' : 'Automatic alerts are now monitoring your hydration intervals during peak heat.'
    );

    setToastMsg(res.message);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleTestPush = () => {
    playNotificationChime();
    triggerTestPushNotification(
      isHindi ? '🔥 हीटशील्ड अलर्ट परीक्षण' : '🔥 HeatShield Push Alert Test',
      isHindi ? `हीट इंडेक्स ${assessment.heatIndex.toFixed(1)}°C: हर 20-30 मिनट में पानी पिएं।` : `Hydration alert verification: Ambient Heat Index ${assessment.heatIndex.toFixed(1)}°C requires rehydration every 20-30 minutes.`
    );
    setToastMsg(isHindi ? 'परीक्षण सूचना भेजी गई!' : 'Test push notification dispatched!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLog = (amount: number, label?: string) => {
    if (amount <= 0) return;
    onLogWater(amount);
    setToastMsg(
      isHindi 
        ? `+${amount} मिली ${label || 'जल'} दर्ज किया गया! घाटे की पुनः गणना जारी...`
        : `+${amount}ml ${label || 'Hydration'} recorded! Deficit recalculating...`
    );
    setTimeout(() => setToastMsg(null), 3000);
    setShowCustomInput(false);
    setCustomAmount('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      handleLog(val, isHindi ? 'कस्टम सेवन' : 'Custom Intake');
    }
  };

  return (
    <div 
      id="hydration-tracking-section" 
      className={`p-3.5 sm:p-4 rounded-2xl bg-[#0b1326] border border-[#2d3449] relative transition-all duration-300 ${className}`}
    >
      {/* Top Header: Section Title & Real-Time Dynamic Risk Tier Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-bold text-sm sm:text-base text-white tracking-wide">
                {isHindi ? 'तापमान-समायोजित जल एवं ओआरएस सेवन इंजन' : 'Heat-Adjusted Hydration Engine'}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                WHO / NDMA
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {isHindi ? 'बायो-मेटियोरोलॉजिकल तरल हानि एवं हृदय तनाव ट्रैकर' : 'Live biometeorological fluid loss & cardiovascular strain'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Health Report Quick Trigger */}
          {onOpenHealthReport && (
            <button
              id="open-health-report-from-hydration-btn"
              onClick={onOpenHealthReport}
              className="text-xs font-mono text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              title="Open Clinical Heat Health Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>{isHindi ? 'स्वास्थ्य रिपोर्ट' : 'Health Report'}</span>
            </button>
          )}

          {/* Toggle Analytics Chart */}
          <button
            id="toggle-hydration-chart-btn"
            onClick={() => setShowChart(!showChart)}
            className={`text-xs font-mono px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer ${
              showChart 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                : 'text-slate-300 bg-[#060e20] hover:text-white border border-[#2d3449]'
            }`}
            title="Toggle Hourly Hydration Chart"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showChart ? (isHindi ? 'चार्ट छिपाएं' : 'Hide Chart') : (isHindi ? 'चार्ट देखें' : 'View Charts')}</span>
          </button>

          {/* Dynamic Risk Badge */}
          <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm ${assessment.badgeColors.bg} ${assessment.badgeColors.border} ${assessment.badgeColors.text}`}>
            <span className="relative flex h-2 w-2">
              {assessment.tier === 'CRITICAL' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                assessment.tier === 'CRITICAL' ? 'bg-red-400' :
                assessment.tier === 'HIGH' ? 'bg-orange-400' :
                assessment.tier === 'MODERATE' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
            </span>
            <span>
              {isHindi ? (
                assessment.tier === 'CRITICAL' ? 'गंभीर निर्जलीकरण जोखिम' :
                assessment.tier === 'HIGH' ? 'उच्च निर्जलीकरण चेतावनी' :
                assessment.tier === 'MODERATE' ? 'मध्यम निगरानी स्तर' : 'सुरक्षित जलयोजन'
              ) : assessment.label}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Midnight Reset Notice Badge (11:59:59 PM IST) */}
      <div className="mb-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center gap-1.5 text-cyan-300">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span>
            {isHindi 
              ? 'दैनिक जल सेवन रीसेट: प्रतिदिन रात 11:59:59 बजे (IST)' 
              : 'Daily Intake Auto-Reset: Everyday at 11:59:59 PM IST'}
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          {isHindi ? 'अगला रीसेट:' : 'Next Reset in:'} <strong className="text-white">{timeUntilReset}</strong>
        </div>
      </div>

      {/* Hourly Chart Component Drawer */}
      {showChart && (
        <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <HydrationChart 
            weather={weather}
            userProfile={userProfile}
            onLogWater={handleLog}
          />
        </div>
      )}

      {/* Live Telemetry Metric Bar: Intake vs Heat Target vs Sweat Loss */}
      <div className="p-3 rounded-xl bg-[#060e20] border border-[#2d3449] mb-3 font-mono">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-semibold">{isHindi ? 'आज का सेवन:' : "Today's Intake:"}</span>
            <span className="text-cyan-400 font-bold text-sm">{assessment.waterIntakeMl} {isHindi ? 'मिली' : 'ml'}</span>
            <span className="text-slate-400 text-[11px]">/ {conditionIntake.recommendedTargetMl} {isHindi ? 'मिली लक्ष्य' : 'ml target'}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[11px]">{isHindi ? 'पसीने की दर:' : 'Dynamic Sweat Rate:'} </span>
            <span className="text-orange-400 font-bold">{assessment.sweatLossRateMlHr} {isHindi ? 'मिली/घंटा' : 'ml/h'}</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-[#171f33] h-2.5 rounded-full overflow-hidden relative">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${Math.min(100, Math.round((assessment.waterIntakeMl / Math.max(1, conditionIntake.recommendedTargetMl)) * 100))}%` }}
          />
        </div>

        {/* 2-Hour Inactivity Alert Banner during High Heat */}
        {alertStatus.isAlertTriggered && (
          <div 
            id="hydration-inactivity-banner"
            className={`mt-2.5 p-2.5 rounded-xl border text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 transition-all ${
              alertStatus.severity === 'CRITICAL'
                ? 'bg-red-950/40 border-red-500/50 text-red-200'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-lg ${
                alertStatus.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <Flame className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{isHindi ? `जलयोजन विलंबित: ${alertStatus.elapsedFormatted} अंतराल` : `Hydration Overdue: ${alertStatus.elapsedFormatted} Gap`}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                    {isHindi ? 'हीट इंडेक्स' : 'Heat Index'} {assessment.heatIndex.toFixed(1)}°C
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 block">
                  {isHindi ? `पसीने की दर ${assessment.sweatLossRateMlHr} मिली/घंटा से अधिक है। कृपया तुरंत जल ग्रहण करें।` : `Sweat rate exceeds ${assessment.sweatLossRateMlHr} ml/h. Please drink immediately.`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              {isPushEnabled || permissionState === 'granted' ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    <BellRing className="w-3 h-3" />
                    <span>{isHindi ? 'पुश सक्रिय' : 'Push On'}</span>
                  </span>
                  <button
                    id="test-push-inline-btn"
                    onClick={handleTestPush}
                    className="text-[10px] text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/40 transition-colors cursor-pointer"
                    title="Send instant test push alert"
                  >
                    {isHindi ? 'परीक्षण' : 'Test Alert'}
                  </button>
                </div>
              ) : (
                <button
                  id="hydration-card-enable-push-btn"
                  onClick={handleRequestPush}
                  className="text-[10px] text-white bg-orange-500 hover:bg-orange-600 px-2.5 py-0.5 rounded-lg border border-orange-400 flex items-center gap-1 font-bold shadow-sm shadow-orange-500/20 transition-all active:scale-95 cursor-pointer"
                  title="Enable Browser OS & In-App push alerts"
                >
                  <Bell className="w-3 h-3" />
                  <span>{isHindi ? 'पुश चालू करें' : 'Enable Push'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Log Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            {userProfile.lastWaterLogTime ? (
              <span>
                {isHindi ? 'अंतिम:' : 'Last:'} <strong className="text-slate-200">{userProfile.lastWaterLogTime}</strong>
                {alertStatus.elapsedFormatted && (
                  <span className={`ml-1 text-[10px] ${alertStatus.isOverdue ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                    ({alertStatus.elapsedFormatted} {isHindi ? 'पहले' : 'ago'})
                  </span>
                )}
              </span>
            ) : (
              <span>{isHindi ? 'जल सेवन दर्ज करने के लिए दबाएं' : 'Tap to log water intake'}</span>
            )}

            {/* Inactivity Simulation Toggle for testing */}
            {onSimulateInactivity && (
              <button
                id="simulate-inactivity-btn"
                type="button"
                onClick={onSimulateInactivity}
                className="text-[10px] text-slate-500 hover:text-amber-300 underline underline-offset-2 ml-1 transition-colors cursor-pointer"
                title="Simulate 2 hours elapsed since last water log"
              >
                {isHindi ? '2 घंटे का अंतर अनुकरण करें' : 'Simulate 2h Gap'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="log-water-150-btn"
              onClick={() => handleLog(150, isHindi ? 'छोटा ग्लास' : 'Glass')}
              className="px-2 py-1 bg-[#0b1326] hover:bg-[#131d33] text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Small glass / cup"
            >
              +150{isHindi ? 'मिली' : 'ml'}
            </button>
            <button
              id="log-water-250-btn"
              onClick={() => handleLog(250, isHindi ? 'मानक ग्लास' : 'Glass')}
              className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/50 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Standard glass of water"
            >
              +250{isHindi ? 'मिली' : 'ml'}
            </button>
            <button
              id="log-water-500-btn"
              onClick={() => handleLog(500, 'WHO-ORS')}
              className="px-2.5 py-1 bg-cyan-900/50 hover:bg-cyan-800/60 text-cyan-200 border border-cyan-400/60 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95 shadow-sm flex items-center gap-1 cursor-pointer"
              title="500ml Bottle or WHO-ORS packet"
            >
              <Zap className="w-3 h-3 text-cyan-300" />
              <span>+500{isHindi ? 'मिली ओआरएस' : 'ml ORS'}</span>
            </button>
            <button
              id="log-water-custom-toggle-btn"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-1.5 py-1 bg-[#0b1326] hover:bg-[#152038] text-slate-400 hover:text-white border border-[#2d3449] rounded-lg text-[11px] font-mono transition-all cursor-pointer"
              title="Enter custom ml amount"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Custom Input Form */}
        {showCustomInput && (
          <form onSubmit={handleCustomSubmit} className="mt-2 pt-2 border-t border-[#2d3449] flex items-center gap-2">
            <input
              id="custom-water-input"
              type="number"
              min="50"
              max="2000"
              step="50"
              placeholder={isHindi ? 'मिली में मात्रा लिखें (उदा. 300)...' : 'Enter ml (e.g., 300)...'}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 bg-[#060e20] border border-[#2d3449] rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              {isHindi ? 'दर्ज करें' : 'Log'}
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-2 py-1 bg-[#060e20] text-slate-400 hover:text-white rounded-lg text-xs font-mono cursor-pointer"
            >
              {isHindi ? 'रद्द' : 'Cancel'}
            </button>
          </form>
        )}
      </div>

      {/* Toast Feedback */}
      {toastMsg && (
        <div className="mb-3 px-3 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 2 Dedicated Cards: Health-Condition Intake + Weather-Based ORS Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        
        {/* Card 1: Health Condition Water Target Details */}
        <div className="p-3.5 rounded-xl bg-[#060e20] border border-cyan-500/30 font-sans space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-headline font-bold text-white">
                {isHindi ? 'स्वास्थ्य स्थिति अनुसार जल सेवन लक्ष्य' : 'Health-Condition Water Target'}
              </h4>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              {conditionIntake.recommendedTargetMl} {isHindi ? 'मिली/दिन' : 'ml/day'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {isHindi ? conditionIntake.healthConditionAdvisoryHi : conditionIntake.healthConditionAdvisoryEn}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{isHindi ? 'प्रति घंटा घूंट दर:' : 'Hourly Sip Rate:'} <strong className="text-white">{conditionIntake.hourlySipRateMl} ml/h</strong></span>
            <span className="text-cyan-400">{isHindi ? 'सुरक्षित मात्रा' : 'Clinical Safe Bound'}</span>
          </div>
        </div>

        {/* Card 2: Weather-Based WHO-ORS Dosage & Timing */}
        <div className="p-3.5 rounded-xl bg-[#060e20] border border-orange-500/30 font-sans space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-headline font-bold text-white">
                {isHindi ? 'मौसम अनुसार WHO-ओआरएस सेवन विवरण' : 'Weather-Based WHO-ORS Intake Details'}
              </h4>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
              orsRecommendation.sachetsPerDay > 0
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {orsRecommendation.sachetsPerDay} {isHindi ? 'पैकेट/दिन' : 'Sachets/Day'}
            </span>
          </div>

          <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {isHindi ? orsRecommendation.rationaleHi : orsRecommendation.rationaleEn}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{isHindi ? 'घोल मात्रा:' : 'Solution Volume:'} <strong className="text-orange-400">{orsRecommendation.litersOfSolution} L</strong></span>
            <span>{isHindi ? 'समय:' : 'Timing:'} <strong className="text-slate-200">{isHindi ? orsRecommendation.timingScheduleHi : orsRecommendation.timingScheduleEn}</strong></span>
          </div>
        </div>

      </div>

      {/* Dynamic Clinical Advisory & Immediate Action Recommendation */}
      <div className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${assessment.badgeColors.bg} ${assessment.badgeColors.border}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 font-bold font-mono">
            {assessment.tier === 'CRITICAL' ? (
              <span className="text-red-400 flex items-center gap-1">
                ⚠️ {isHindi ? 'तत्काल नैदानिक प्रोटोकॉल' : 'URGENT CLINICAL PROTOCOL'}
              </span>
            ) : assessment.tier === 'HIGH' ? (
              <span className="text-orange-400 flex items-center gap-1">
                ⚠️ {isHindi ? 'बढ़ा हुआ निर्जलीकरण अलर्ट' : 'ELEVATED DEHYDRATION ALERT'}
              </span>
            ) : assessment.tier === 'MODERATE' ? (
              <span className="text-amber-300 flex items-center gap-1">
                ℹ️ {isHindi ? 'एहतियाती पुनर्जलीकरण' : 'PRECAUTIONARY REHYDRATION'}
              </span>
            ) : (
              <span className="text-cyan-300 flex items-center gap-1">
                ✓ {isHindi ? 'शारीरिक स्थिति सुरक्षित' : 'PHYSIOLOGICAL STATUS HEALTHY'}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-0.5 underline shrink-0 cursor-pointer"
          >
            <Info className="w-3 h-3" />
            <span>{showExplanation ? (isHindi ? 'बायो-विवरण छिपाएं' : 'Hide Bio-Logic') : (isHindi ? 'बायो-विवरण देखें' : 'Bio-Logic Details')}</span>
          </button>
        </div>

        <p className="text-slate-200 text-[11px] mb-1.5 font-sans">
          <strong>{isHindi ? 'तत्काल सिफारिश:' : 'Immediate Recommendation:'}</strong> {isHindi ? (
            assessment.tier === 'CRITICAL' 
              ? 'हर 15-20 मिनट में 250 मिली ओआरएस का घोल पिएं। तुरंत शीतल छायादार स्थान में जाएं और भारी शारीरिक श्रम रोक दें।'
              : assessment.tier === 'HIGH'
              ? 'प्रति घंटे 400-500 मिली जल अथवा इलेक्ट्रोलाइट का सेवन करें। तेज धूप में निरंतर रहने से बचें।'
              : 'नियमित अंतराल पर पानी पीते रहें और हाइड्रेटेड बने रहें।'
          ) : assessment.recommendedAction}
        </p>

        <p className="text-[11px] text-slate-400 font-sans">
          <strong>{isHindi ? 'रोग-शरीरक्रिया विज्ञान:' : 'Pathophysiology:'}</strong> {isHindi ? (
            `हीट इंडेक्स ${assessment.heatIndex.toFixed(1)}°C पर पसीने की अत्यधिक दर के कारण रक्त की मात्रा घटती है तथा हृदय पर भार बढ़ता है।`
          ) : assessment.clinicalImpact}
        </p>

        {/* Detailed Bio-Logic Explanation Drawer */}
        {showExplanation && (
          <div className="mt-2.5 pt-2.5 border-t border-[#2d3449]/60 text-[11px] font-mono text-slate-300 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-slate-400">
              <span>● {isHindi ? 'परिवेश हीट इंडेक्स तनाव:' : 'Ambient Heat Index Stressor:'}</span>
              <span className="text-white font-semibold">{assessment.heatIndex.toFixed(1)}°C ({assessment.heatIndexCategory})</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● {isHindi ? 'बुनियादी कोशिकीय आवश्यकता:' : 'Baseline Cellular Need:'}</span>
              <span className="text-white">{assessment.baselineTargetMl} {isHindi ? 'मिली/दिन' : 'ml/day'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● {isHindi ? 'लू में पसीने की अतिरिक्त क्षति:' : 'Heatwave Sweat Loss Add-on:'}</span>
              <span className="text-amber-300 font-semibold">+{assessment.heatAdjustedTargetMl - assessment.baselineTargetMl} {isHindi ? 'मिली' : 'ml'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● {isHindi ? 'दर्ज जल सेवन:' : 'Recorded Water Intake:'}</span>
              <span className="text-cyan-300 font-semibold">{assessment.waterIntakeMl} {isHindi ? 'मिली' : 'ml'} ({Math.round((assessment.waterIntakeMl / Math.max(1, conditionIntake.recommendedTargetMl)) * 100)}%)</span>
            </div>
            {assessment.hasDiureticOrVulnerability && (
              <div className="text-[10px] text-red-300/90 pt-1 border-t border-red-500/20">
                ⚠️ <strong>{isHindi ? 'हृदय/मूत्रवर्धक औषधि संवेदनशीलता सक्रिय:' : 'Cardiovascular / Diuretic Multiplier Active:'}</strong> {isHindi ? 'एंटीहाइपरटेंसिव दवाएं गुर्दे द्वारा तरल उत्सर्जन बढ़ाती हैं, जिससे लू में निर्जलीकरण का खतरा कई गुना बढ़ जाता है।' : 'Antihypertensive diuretic medication accelerates renal fluid clearance, increasing dehydration risk vulnerability under heat stress.'}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

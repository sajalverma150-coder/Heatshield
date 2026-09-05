import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Droplet, 
  Flame, 
  Bell, 
  BellRing, 
  X, 
  Check, 
  Clock, 
  Zap, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { WeatherTelemetry, UserHealthProfile } from '../types';
import { 
  checkHydrationAlertStatus, 
  sendBrowserPushNotification, 
  triggerTestPushNotification,
  getNotificationPermission, 
  requestNotificationPermission,
  playNotificationChime,
  NotificationPermissionState,
  HydrationAlertStatus
} from '../services/hydrationNotificationService';

interface HydrationAlertToastProps {
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  onLogWater: (amountMl: number) => void;
  onSimulateInactivity?: () => void;
  onOpenPushSettings?: () => void;
}

export const HydrationAlertToast: React.FC<HydrationAlertToastProps> = ({
  weather,
  userProfile,
  onLogWater,
  onSimulateInactivity,
  onOpenPushSettings,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(getNotificationPermission());
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('heatshield_push_enabled') === 'true';
    } catch {
      return false;
    }
  });
  const [pushSentToast, setPushSentToast] = useState<string | null>(null);

  // Periodically re-evaluate every 15 seconds
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const heatIndex = typeof weather.heatIndex === 'number' && !isNaN(weather.heatIndex) 
    ? weather.heatIndex 
    : 40.0;

  const alertStatus: HydrationAlertStatus = checkHydrationAlertStatus(
    heatIndex,
    userProfile.lastWaterLogTimestamp
  );

  // When an overdue alert triggers during high-heat index, dispatch push alert
  useEffect(() => {
    if (alertStatus.isAlertTriggered && !isDismissed && (!snoozeUntil || Date.now() > snoozeUntil)) {
      if (isPushEnabled || permissionState === 'granted') {
        const sent = sendBrowserPushNotification(alertStatus);
        if (sent) {
          setPushSentToast('Push alert dispatched: Rehydrate now!');
          setTimeout(() => setPushSentToast(null), 4000);
        }
      }
    }
  }, [alertStatus.isAlertTriggered, alertStatus.elapsedMinutes, permissionState, isPushEnabled, isDismissed, snoozeUntil]);

  // Request browser Notification API permission & activate push notifications
  const handleEnablePush = async () => {
    playNotificationChime();
    const result = await requestNotificationPermission();
    setPermissionState(result.state);
    setIsPushEnabled(true);
    
    // Always trigger an immediate test notification so the user sees it works!
    triggerTestPushNotification(
      '🔔 HeatShield AI Push Notifications Enabled',
      'Hydration inactivity alerts are now active for ambient Heat Index above 38°C.'
    );

    setPushSentToast(result.message);
    setTimeout(() => setPushSentToast(null), 5000);
  };

  const handleQuickLog = (amount: number) => {
    onLogWater(amount);
    setIsDismissed(false);
    setSnoozeUntil(null);
  };

  const handleSnooze = () => {
    setSnoozeUntil(Date.now() + 30 * 60 * 1000);
  };

  const isSnoozed = snoozeUntil !== null && Date.now() < snoozeUntil;
  if (!alertStatus.isAlertTriggered || isDismissed || isSnoozed) {
    return null;
  }

  const isCritical = alertStatus.severity === 'CRITICAL';

  return (
    <div 
      id="hydration-overdue-toast-alert"
      className="fixed top-14 sm:top-16 right-2 sm:right-4 z-50 max-w-md w-[calc(100vw-1rem)] sm:w-auto transition-all animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className={`p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
        isCritical
          ? 'bg-[#180a0e]/95 border-red-500/60 text-white shadow-red-950/50'
          : 'bg-[#16120b]/95 border-amber-500/50 text-white shadow-amber-950/40'
      }`}>
        
        {/* Header Strip */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl border ${
              isCritical
                ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              <Flame className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isCritical ? 'text-red-400' : 'text-amber-300'
                }`}>
                  {isCritical ? 'CRITICAL HYDRATION GAP' : 'HIGH HEAT HYDRATION GAP'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-slate-300 border border-white/10 font-bold">
                  {alertStatus.elapsedFormatted} Overdue
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 block">
                Heat Index: <strong className="text-white">{heatIndex.toFixed(1)}°C</strong> (Extreme Transpiration)
              </span>
            </div>
          </div>

          <button
            id="dismiss-hydration-toast-btn"
            onClick={() => setIsDismissed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Advisory Message */}
        <p className="text-xs text-slate-200 leading-snug mb-3">
          No water intake logged for <strong>{alertStatus.elapsedFormatted}</strong> under intense ambient heat. Rehydrate immediately to prevent heat exhaustion and blood thickening.
        </p>

        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
          
          {/* Quick Intake Logging */}
          <div className="flex items-center gap-1.5">
            <button
              id="toast-log-water-250-btn"
              onClick={() => handleQuickLog(250)}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 shadow-sm"
              title="Log 250ml water now"
            >
              <Droplet className="w-3 h-3 text-cyan-200" />
              <span>+250ml</span>
            </button>
            <button
              id="toast-log-water-500-btn"
              onClick={() => handleQuickLog(500)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs flex items-center gap-1 transition-transform active:scale-95 shadow-sm"
              title="Log 500ml WHO-ORS now"
            >
              <Zap className="w-3 h-3 text-emerald-200" />
              <span>+500ml ORS</span>
            </button>
          </div>

          {/* Push Notification Toggle & Snooze */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {isPushEnabled || permissionState === 'granted' ? (
              <button
                onClick={onOpenPushSettings || handleEnablePush}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 transition-colors"
                title="Push alerts are active"
              >
                <BellRing className="w-3 h-3 text-emerald-400" />
                <span>Push Active ✓</span>
              </button>
            ) : (
              <button
                id="enable-browser-notification-btn"
                onClick={handleEnablePush}
                className="px-2.5 py-0.5 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm shadow-orange-500/30"
                title="Enable browser OS and in-app push notifications"
              >
                <Bell className="w-3 h-3" />
                <span>Enable Push</span>
              </button>
            )}

            <button
              id="snooze-hydration-alert-btn"
              onClick={handleSnooze}
              className="px-2 py-0.5 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Snooze for 30 minutes"
            >
              Snooze 30m
            </button>
          </div>

        </div>

        {/* Confirmation indicator */}
        {pushSentToast && (
          <div className="mt-2 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{pushSentToast}</span>
          </div>
        )}

      </div>
    </div>
  );
};

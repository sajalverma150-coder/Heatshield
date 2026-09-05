import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  Check, 
  AlertTriangle, 
  Volume2, 
  Zap, 
  ShieldAlert, 
  Clock, 
  Sparkles,
  Smartphone,
  Radio
} from 'lucide-react';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  triggerTestPushNotification, 
  playNotificationChime,
  NotificationPermissionState 
} from '../../services/hydrationNotificationService';

interface PushNotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogWater?: (amountMl: number) => void;
}

export const PushNotificationSettingsModal: React.FC<PushNotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onLogWater,
}) => {
  const [permission, setPermission] = useState<NotificationPermissionState>(getNotificationPermission());
  const [isPushEnabled, setIsPushEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('heatshield_push_enabled') === 'true' || getNotificationPermission() === 'granted';
    } catch {
      return true;
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [alertIntervalHours, setAlertIntervalHours] = useState<number>(2);
  const [isChimeEnabled, setIsChimeEnabled] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const result = await requestNotificationPermission();
    setPermission(result.state);
    setIsPushEnabled(true);
    setToastMessage(result.message);

    // Immediately trigger a test notification so the user sees it works!
    triggerTestPushNotification(
      '🔔 HeatShield AI Push Notifications Enabled!',
      'Automatic alerts are now actively monitoring your hydration and local heat index.'
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleTestNotification = () => {
    if (isChimeEnabled) {
      playNotificationChime();
    }
    triggerTestPushNotification(
      '🔥 High Heat Push Alert Test (HI 48.1°C)',
      '2 hours elapsed since last water intake. Drink 250ml water or WHO-ORS to maintain blood volume.'
    );
    setToastMessage('Test push notification dispatched!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div 
      id="push-notification-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-md bg-[#0b1326] border border-[#2d3449] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3449] bg-[#060e20]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-white">
                Push Notification Alerts
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Heatwave emergency & hydration inactivity alerts
              </span>
            </div>
          </div>

          <button
            id="close-push-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {/* Status Indicator Card */}
          <div className="p-4 rounded-xl bg-[#060e20] border border-[#2d3449] flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono text-slate-400 block mb-0.5">Current Delivery Mode</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPushEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <strong className="text-sm font-bold text-white">
                  {isPushEnabled ? 'Live Push Alerts Active' : 'Push Alerts Disabled'}
                </strong>
              </div>
              <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                {permission === 'granted' 
                  ? 'System Native OS Notifications + In-App Banners'
                  : 'High-Fidelity In-App Push Banners Active'}
              </span>
            </div>

            <button
              id="modal-enable-push-btn"
              onClick={handleEnablePush}
              className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs transition-all shadow-sm ${
                isPushEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
              }`}
            >
              {isPushEnabled ? 'Enabled ✓' : 'Enable Push'}
            </button>
          </div>

          {/* Test Trigger Button */}
          <div className="p-4 rounded-xl bg-[#060e20] border border-[#2d3449] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono">Instant Test Push</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Verifies sound & visual alerts</span>
            </div>

            <p className="text-xs text-slate-300">
              Click to fire an immediate test push notification with audio alert chime and simulated hydration action.
            </p>

            <button
              id="test-push-notification-now-btn"
              onClick={handleTestNotification}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-900/40"
            >
              <Bell className="w-4 h-4" />
              <span>Fire Test Push Notification Now</span>
            </button>
          </div>

          {/* Inactivity Threshold Configuration */}
          <div className="p-4 rounded-xl bg-[#060e20] border border-[#2d3449] space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Hydration Alert Threshold:</span>
              </span>
              <strong className="text-orange-400">{alertIntervalHours} Hours Gap</strong>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setAlertIntervalHours(hours)}
                  className={`py-1.5 rounded-lg border text-center transition-colors ${
                    alertIntervalHours === hours
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300 font-bold'
                      : 'border-[#2d3449] text-slate-400 hover:text-white'
                  }`}
                >
                  {hours} Hour{hours > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Triggers only when ambient Heat Index breaches 38.0°C (NOAA Extreme Caution).
            </span>
          </div>

          {/* Audio Chime Toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#060e20] border border-[#2d3449] text-xs font-mono">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-300" />
              <span className="text-slate-200">Alert Sound Chime</span>
            </div>
            <button
              onClick={() => {
                const next = !isChimeEnabled;
                setIsChimeEnabled(next);
                if (next) playNotificationChime();
              }}
              className={`w-10 h-5 rounded-full transition-colors relative ${isChimeEnabled ? 'bg-orange-500' : 'bg-slate-700'}`}
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${isChimeEnabled ? 'left-5' : 'left-1'}`} />
            </button>
          </div>

          {/* Toast feedback */}
          {toastMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2d3449] bg-[#060e20] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#171f33] hover:bg-[#222d47] text-white font-mono text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

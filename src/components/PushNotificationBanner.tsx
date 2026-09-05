import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Flame, 
  Droplet, 
  X, 
  Check, 
  Zap, 
  AlertTriangle, 
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { 
  PushNotificationPayload, 
  subscribeToPushNotifications 
} from '../services/hydrationNotificationService';

interface PushNotificationBannerProps {
  onLogWater?: (amountMl: number) => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  onLogWater,
}) => {
  const [activeNotification, setActiveNotification] = useState<PushNotificationPayload | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPushNotifications((payload) => {
      setActiveNotification(payload);

      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        setActiveNotification((current) => (current?.id && payload?.id && current.id === payload.id ? null : current));
      }, 8000);

      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!activeNotification) return null;

  const isCritical = activeNotification.severity === 'CRITICAL';
  const isSuccess = activeNotification.severity === 'SUCCESS';

  return (
    <div 
      id="in-app-push-notification-banner"
      role="alert"
      className="fixed top-3 right-3 sm:top-4 sm:right-6 z-[9999] max-w-sm w-[calc(100vw-1.5rem)] animate-in slide-in-from-top-6 duration-300 pointer-events-auto"
    >
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl relative overflow-hidden transition-all ${
        isCritical 
          ? 'bg-[#1a080d]/95 border-red-500/70 text-white shadow-red-950/60' 
          : isSuccess
          ? 'bg-[#061912]/95 border-emerald-500/70 text-white shadow-emerald-950/60'
          : 'bg-[#141008]/95 border-amber-500/70 text-white shadow-amber-950/60'
      }`}>
        
        {/* Top Header Tag */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl border ${
              isCritical ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' :
              isSuccess ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
              'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              {isCritical ? <Flame className="w-4 h-4" /> :
               isSuccess ? <ShieldCheck className="w-4 h-4" /> :
               <Bell className="w-4 h-4" />}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 rounded bg-black/40 border border-white/10">
                  PUSH NOTIFICATION
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Just now
                </span>
              </div>
              <h4 className="text-xs font-headline font-bold text-white tracking-wide mt-0.5 leading-snug">
                {activeNotification.title}
              </h4>
            </div>
          </div>

          <button
            id="close-push-banner-btn"
            onClick={() => setActiveNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3 pl-8">
          {activeNotification.body}
        </p>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 pl-8">
          {activeNotification.actionLabel && onLogWater ? (
            <button
              id="push-banner-action-btn"
              onClick={() => {
                onLogWater(activeNotification.actionAmount || 250);
                setActiveNotification(null);
              }}
              className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Droplet className="w-3 h-3 text-cyan-200" />
              <span>{activeNotification.actionLabel}</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>Push alerts active</span>
            </span>
          )}

          <button
            onClick={() => setActiveNotification(null)}
            className="text-xs font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};

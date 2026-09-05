/**
 * Service to manage hydration inactivity detection during high heat index periods
 * and dispatch browser Notification API push alerts alongside high-fidelity UI push banners.
 */

export interface HydrationAlertStatus {
  isAlertTriggered: boolean;
  isHighHeatIndex: boolean;
  isOverdue: boolean;
  elapsedHours: number;
  elapsedMinutes: number;
  elapsedFormatted: string;
  heatIndex: number;
  severity: 'CRITICAL' | 'HIGH' | 'NORMAL';
  title: string;
  message: string;
}

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  severity: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'SUCCESS';
  type: 'hydration' | 'heatwave' | 'system' | 'report';
  actionLabel?: string;
  actionAmount?: number;
}

type PushListener = (payload: PushNotificationPayload) => void;
const listeners: Set<PushListener> = new Set();

export function subscribeToPushNotifications(callback: PushListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function broadcastPushNotification(payload: PushNotificationPayload) {
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      console.error('Error in push notification listener:', e);
    }
  });
}

/**
 * Play a gentle, high-clarity dual-tone chime using Web Audio API
 */
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Tone 2: A5 (880 Hz) - uplifting alert chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.1);
    gain2.gain.setValueAtTime(0.12, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.4);
  } catch (e) {
    // AudioContext may be restricted before user interaction
  }
}

/**
 * Mobile haptic vibration if supported
 */
export function triggerHapticVibrate(pattern: number[] = [100, 60, 100]) {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Check if the browser supports the Notification API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    return Notification.permission as NotificationPermissionState;
  } catch (e) {
    return 'unsupported';
  }
}

/**
 * Request notification permission from the user.
 * Even if blocked by iframe sandbox, sets user preference to enabled for in-app push banners.
 */
export async function requestNotificationPermission(): Promise<{
  state: NotificationPermissionState;
  isInAppFallback: boolean;
  message: string;
}> {
  // Store enabled flag in localStorage
  try {
    localStorage.setItem('heatshield_push_enabled', 'true');
  } catch (e) {
    // ignore
  }

  if (!isNotificationSupported()) {
    return {
      state: 'unsupported',
      isInAppFallback: true,
      message: 'Browser Notification API not supported. In-app live push alerts activated!',
    };
  }

  try {
    // Some browsers or cross-origin iframes reject or throw SecurityError
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      playNotificationChime();
      triggerHapticVibrate([80]);
      return {
        state: 'granted',
        isInAppFallback: false,
        message: 'Browser push notifications successfully enabled!',
      };
    } else {
      // Permission denied or dismissed
      playNotificationChime();
      return {
        state: permission as NotificationPermissionState,
        isInAppFallback: true,
        message: 'Browser notifications restricted. In-app interactive push banners enabled!',
      };
    }
  } catch (error) {
    // Caught iframe sandbox restriction or policy error
    console.warn('Notification permission restricted by iframe sandbox:', error);
    playNotificationChime();
    return {
      state: 'denied',
      isInAppFallback: true,
      message: 'Iframe sandbox mode detected: High-fidelity in-app push banner activated!',
    };
  }
}

/**
 * Check if the user's hydration log has not been updated for 2 hours during high-heat periods
 */
export function checkHydrationAlertStatus(
  heatIndex: number,
  lastWaterLogTimestamp?: number,
  highHeatThreshold: number = 38.0,
  inactivityThresholdHours: number = 2.0
): HydrationAlertStatus {
  const effectiveTimestamp = lastWaterLogTimestamp || (Date.now() - 2.25 * 3600 * 1000);
  const elapsedMs = Math.max(0, Date.now() - effectiveTimestamp);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const totalMinutes = Math.floor(elapsedMs / (1000 * 60));
  const displayHours = Math.floor(totalMinutes / 60);
  const displayMinutes = totalMinutes % 60;

  const isHighHeatIndex = heatIndex >= highHeatThreshold;
  const isOverdue = elapsedHours >= inactivityThresholdHours;
  const isAlertTriggered = isHighHeatIndex && isOverdue;

  const severity: 'CRITICAL' | 'HIGH' | 'NORMAL' = 
    !isAlertTriggered ? 'NORMAL' : heatIndex >= 44.0 ? 'CRITICAL' : 'HIGH';

  const elapsedFormatted = displayHours > 0 
    ? `${displayHours}h ${displayMinutes}m` 
    : `${displayMinutes}m`;

  const title = severity === 'CRITICAL'
    ? '⚠️ CRITICAL: Hydration Check Overdue (Extreme Heat)'
    : '🔥 High-Heat Hydration Alert: 2h+ Since Last Log';

  const message = `Ambient Heat Index is ${heatIndex.toFixed(1)}°C. You have not logged water in ${elapsedFormatted}. Drink at least 250ml water or WHO-ORS immediately to prevent heat exhaustion.`;

  return {
    isAlertTriggered,
    isHighHeatIndex,
    isOverdue,
    elapsedHours,
    elapsedMinutes: totalMinutes,
    elapsedFormatted,
    heatIndex,
    severity,
    title,
    message,
  };
}

// Track last notification dispatch time to prevent spamming
let lastDispatchedTimestamp = 0;
const MIN_NOTIFICATION_INTERVAL_MS = 10 * 1000; // 10s for active interaction

/**
 * Send an OS-level desktop push notification via browser Notification API if permission is granted,
 * and ALWAYS broadcast to the in-app push notification banner system.
 */
export function sendBrowserPushNotification(
  alertStatus: HydrationAlertStatus,
  force: boolean = false
): boolean {
  const now = Date.now();
  if (!force && now - lastDispatchedTimestamp < MIN_NOTIFICATION_INTERVAL_MS) {
    return false;
  }
  lastDispatchedTimestamp = now;

  // Play audio chime and haptic feedback
  playNotificationChime();
  triggerHapticVibrate([100, 60, 150]);

  // Always broadcast to in-app push banner
  broadcastPushNotification({
    id: `push-${now}`,
    title: alertStatus.title,
    body: alertStatus.message,
    timestamp: now,
    severity: alertStatus.severity,
    type: 'hydration',
    actionLabel: '+250ml Water',
    actionAmount: 250,
  });

  // Attempt native OS notification
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const notification = new Notification(alertStatus.title, {
        body: alertStatus.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'heatshield-hydration-alert',
        requireInteraction: alertStatus.severity === 'CRITICAL',
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      return true;
    } catch (err) {
      console.warn('Native notification failed, in-app banner handled it:', err);
    }
  }

  return true;
}

/**
 * Trigger an immediate Test Push Notification so the user can test and verify it works instantly
 */
export function triggerTestPushNotification(customTitle?: string, customBody?: string) {
  const now = Date.now();
  playNotificationChime();
  triggerHapticVibrate([80, 50, 120]);

  const payload: PushNotificationPayload = {
    id: `test-push-${now}`,
    title: customTitle || '🔔 HeatShield AI Push Alert: Active Heatwave Protection',
    body: customBody || 'Push notifications are fully working! You will receive automatic alerts if your water intake is delayed for 2 hours during high heat periods.',
    timestamp: now,
    severity: 'SUCCESS',
    type: 'system',
    actionLabel: '+250ml Log',
    actionAmount: 250,
  };

  broadcastPushNotification(payload);

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(payload.title, {
        body: payload.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'heatshield-test-alert',
      });
    } catch (e) {
      // ignore
    }
  }

  return payload;
}

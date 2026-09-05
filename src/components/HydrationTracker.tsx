import React, { useState, useMemo } from 'react';
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
  Radio
} from 'lucide-react';
import { UserHealthProfile, WeatherTelemetry } from '../types';
import { calculateDehydrationRisk, DehydrationRiskAssessment } from '../services/hydrationRisk';
import { 
  checkHydrationAlertStatus, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendBrowserPushNotification,
  triggerTestPushNotification,
  playNotificationChime,
  NotificationPermissionState 
} from '../services/hydrationNotificationService';
import { HydrationChart } from './HydrationChart';

interface HydrationTrackerProps {
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  onLogWater: (amountMl: number) => void;
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
  className = '',
  onOpenTriage,
  onSimulateInactivity,
  onOpenHealthReport,
  onOpenPushSettings,
}) => {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
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

  // Compute live dehydration risk assessment
  const assessment: DehydrationRiskAssessment = useMemo(() => {
    return calculateDehydrationRisk(weather, userProfile);
  }, [weather, userProfile]);

  // Compute 2-hour inactivity status during high heat index
  const alertStatus = useMemo(() => {
    return checkHydrationAlertStatus(assessment.heatIndex, userProfile.lastWaterLogTimestamp);
  }, [assessment.heatIndex, userProfile.lastWaterLogTimestamp]);

  const handleRequestPush = async () => {
    playNotificationChime();
    const res = await requestNotificationPermission();
    setPermissionState(res.state);
    setIsPushEnabled(true);
    
    // Always trigger an immediate test notification so the user sees it works!
    triggerTestPushNotification(
      '🔔 Push Notifications Enabled!',
      'Automatic alerts are now monitoring your hydration intervals during peak heat.'
    );

    setToastMsg(res.message);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleTestPush = () => {
    playNotificationChime();
    triggerTestPushNotification(
      '🔥 HeatShield Push Alert Test',
      'Hydration alert verification: Ambient Heat Index 48.1°C requires rehydration every 20-30 minutes.'
    );
    setToastMsg('Test push notification dispatched!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLog = (amount: number, label?: string) => {
    if (amount <= 0) return;
    onLogWater(amount);
    setToastMsg(`+${amount}ml ${label || 'Hydration'} recorded! Deficit recalculating...`);
    setTimeout(() => setToastMsg(null), 3000);
    setShowCustomInput(false);
    setCustomAmount('');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      handleLog(val, 'Custom Intake');
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
                Heat-Adjusted Hydration Engine
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                WHO / NDMA
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Live biometeorological fluid loss & cardiovascular strain
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Health Report Quick Trigger */}
          {onOpenHealthReport && (
            <button
              id="open-health-report-from-hydration-btn"
              onClick={onOpenHealthReport}
              className="text-xs font-mono text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all"
              title="Open Clinical Heat Health Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <span>Health Report</span>
            </button>
          )}

          {/* Toggle Analytics Chart */}
          <button
            id="toggle-hydration-chart-btn"
            onClick={() => setShowChart(!showChart)}
            className={`text-xs font-mono px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all ${
              showChart 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                : 'text-slate-300 bg-[#060e20] hover:text-white border border-[#2d3449]'
            }`}
            title="Toggle Hourly Hydration Chart"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showChart ? 'Hide Chart' : 'View Charts'}</span>
          </button>

          {/* Dynamic Risk Badge */}
          <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm ${assessment.badgeColors.bg} ${assessment.badgeColors.border} ${assessment.badgeColors.text}`}>
            <span className="relative flex h-2 w-2">
              {assessment.tier === 'CRITICAL' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                assessment.tier === 'CRITICAL' ? 'bg-red-500' :
                assessment.tier === 'HIGH' ? 'bg-orange-500' :
                assessment.tier === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span>{assessment.tier} RISK</span>
          </div>
        </div>
      </div>

      {/* Embedded Hydration & Sweat Loss Chart (Collapsible / Expandable) */}
      {showChart && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-3 duration-200">
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
            <span className="text-slate-300 font-semibold">Today's Intake:</span>
            <span className="text-cyan-400 font-bold text-sm">{assessment.waterIntakeMl} ml</span>
            <span className="text-slate-400 text-[11px]">/ {assessment.heatAdjustedTargetMl} ml target</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[11px]">Dynamic Sweat Rate: </span>
            <span className="text-orange-400 font-bold">{assessment.sweatLossRateMlHr} ml/h</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-[#171f33] h-2.5 rounded-full overflow-hidden relative">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm" 
            style={{ width: `${Math.min(100, assessment.intakePercentage)}%` }}
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
                  <span>Hydration Overdue: {alertStatus.elapsedFormatted} Gap</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                    Heat Index {assessment.heatIndex.toFixed(1)}°C
                  </span>
                </div>
                <span className="text-[11px] text-slate-300 block">
                  Sweat rate exceeds {assessment.sweatLossRateMlHr} ml/h. Please drink immediately.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
              {isPushEnabled || permissionState === 'granted' ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                    <BellRing className="w-3 h-3" />
                    <span>Push On</span>
                  </span>
                  <button
                    id="test-push-inline-btn"
                    onClick={handleTestPush}
                    className="text-[10px] text-cyan-300 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 px-2 py-0.5 rounded border border-cyan-500/40 transition-colors"
                    title="Send instant test push alert"
                  >
                    Test Alert
                  </button>
                </div>
              ) : (
                <button
                  id="hydration-card-enable-push-btn"
                  onClick={handleRequestPush}
                  className="text-[10px] text-white bg-orange-500 hover:bg-orange-600 px-2.5 py-0.5 rounded-lg border border-orange-400 flex items-center gap-1 font-bold shadow-sm shadow-orange-500/20 transition-all active:scale-95"
                  title="Enable Browser OS & In-App push alerts"
                >
                  <Bell className="w-3 h-3" />
                  <span>Enable Push</span>
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
                Last: <strong className="text-slate-200">{userProfile.lastWaterLogTime}</strong>
                {alertStatus.elapsedFormatted && (
                  <span className={`ml-1 text-[10px] ${alertStatus.isOverdue ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                    ({alertStatus.elapsedFormatted} ago)
                  </span>
                )}
              </span>
            ) : (
              <span>Tap to log water intake</span>
            )}

            {/* Inactivity Simulation Toggle for testing */}
            {onSimulateInactivity && (
              <button
                id="simulate-inactivity-btn"
                type="button"
                onClick={onSimulateInactivity}
                className="text-[10px] text-slate-500 hover:text-amber-300 underline underline-offset-2 ml-1 transition-colors"
                title="Simulate 2 hours elapsed since last water log"
              >
                Simulate 2h Gap
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="log-water-150-btn"
              onClick={() => handleLog(150, 'Glass')}
              className="px-2 py-1 bg-[#0b1326] hover:bg-[#131d33] text-cyan-300 border border-cyan-500/40 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95 shadow-sm"
              title="Small glass / cup"
            >
              +150ml
            </button>
            <button
              id="log-water-250-btn"
              onClick={() => handleLog(250, 'Glass')}
              className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/50 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95 shadow-sm"
              title="Standard glass of water"
            >
              +250ml
            </button>
            <button
              id="log-water-500-btn"
              onClick={() => handleLog(500, 'WHO-ORS')}
              className="px-2.5 py-1 bg-cyan-900/50 hover:bg-cyan-800/60 text-cyan-200 border border-cyan-400/60 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95 shadow-sm flex items-center gap-1"
              title="500ml Bottle or WHO-ORS packet"
            >
              <Zap className="w-3 h-3 text-cyan-300" />
              <span>+500ml ORS</span>
            </button>
            <button
              id="log-water-custom-toggle-btn"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-1.5 py-1 bg-[#0b1326] hover:bg-[#152038] text-slate-400 hover:text-white border border-[#2d3449] rounded-lg text-[11px] font-mono transition-all"
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
              placeholder="Enter ml (e.g., 300)..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 bg-[#060e20] border border-[#2d3449] rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-colors"
            >
              Log
            </button>
            <button
              type="button"
              onClick={() => setShowCustomInput(false)}
              className="px-2 py-1 bg-[#060e20] text-slate-400 hover:text-white rounded-lg text-xs font-mono"
            >
              Cancel
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

      {/* Dynamic Clinical Advisory & Immediate Action Recommendation */}
      <div className={`p-3 rounded-xl border text-xs leading-relaxed transition-all ${assessment.badgeColors.bg} ${assessment.badgeColors.border}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 font-bold font-mono">
            {assessment.tier === 'CRITICAL' ? (
              <span className="text-red-400 flex items-center gap-1">
                ⚠️ URGENT CLINICAL PROTOCOL
              </span>
            ) : assessment.tier === 'HIGH' ? (
              <span className="text-orange-400 flex items-center gap-1">
                ⚠️ ELEVATED DEHYDRATION ALERT
              </span>
            ) : assessment.tier === 'MODERATE' ? (
              <span className="text-amber-300 flex items-center gap-1">
                ℹ️ PRECAUTIONARY REHYDRATION
              </span>
            ) : (
              <span className="text-cyan-300 flex items-center gap-1">
                ✓ PHYSIOLOGICAL STATUS HEALTHY
              </span>
            )}
          </div>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-0.5 underline shrink-0"
          >
            <Info className="w-3 h-3" />
            <span>{showExplanation ? 'Hide Bio-Logic' : 'Bio-Logic Details'}</span>
          </button>
        </div>

        <p className="text-slate-200 text-[11px] mb-1.5 font-sans">
          <strong>Immediate Recommendation:</strong> {assessment.recommendedAction}
        </p>

        <p className="text-[11px] text-slate-400 font-sans">
          <strong>Pathophysiology:</strong> {assessment.clinicalImpact}
        </p>

        {/* Detailed Bio-Logic Explanation Drawer */}
        {showExplanation && (
          <div className="mt-2.5 pt-2.5 border-t border-[#2d3449]/60 text-[11px] font-mono text-slate-300 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-slate-400">
              <span>● Ambient Heat Index Stressor:</span>
              <span className="text-white font-semibold">{assessment.heatIndex.toFixed(1)}°C ({assessment.heatIndexCategory})</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● Baseline Cellular Need:</span>
              <span className="text-white">{assessment.baselineTargetMl} ml/day</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● Heatwave Sweat Loss Add-on:</span>
              <span className="text-amber-300 font-semibold">+{assessment.heatAdjustedTargetMl - assessment.baselineTargetMl} ml</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● Recorded Water Intake:</span>
              <span className="text-cyan-300 font-semibold">{assessment.waterIntakeMl} ml ({assessment.intakePercentage}%)</span>
            </div>
            {assessment.hasDiureticOrVulnerability && (
              <div className="text-[10px] text-red-300/90 pt-1 border-t border-red-500/20">
                ⚠️ <strong>Cardiovascular / Diuretic Multiplier Active:</strong> Antihypertensive diuretic medication accelerates renal fluid clearance, increasing dehydration risk vulnerability under heat stress.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

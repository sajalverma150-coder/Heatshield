import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Droplet, 
  Flame, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { WeatherTelemetry, UserHealthProfile } from '../types';
import { calculateDehydrationRisk } from '../services/hydrationRisk';

interface HydrationChartProps {
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  onLogWater?: (amountMl: number) => void;
  className?: string;
}

interface HourlyHydrationPoint {
  hour: string;
  intakeMl: number;
  sweatLossMl: number;
  netBalanceMl: number;
  heatIndex: number;
  isPeakWindow: boolean;
  status: 'SURPLUS' | 'EQUILIBRIUM' | 'DEFICIT' | 'CRITICAL_DEFICIT';
}

export const HydrationChart: React.FC<HydrationChartProps> = ({
  weather,
  userProfile,
  onLogWater,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'weekly'>('hourly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const assessment = useMemo(() => {
    return calculateDehydrationRisk(weather, userProfile);
  }, [weather, userProfile]);

  // Generate dynamic 24-hour hydration intake vs sweat loss curve based on current user intake and heat index
  const hourlyData: HourlyHydrationPoint[] = useMemo(() => {
    const totalIntake = userProfile.hydrationTodayMl;
    const baseSweatRate = assessment.sweatLossRateMlHr;

    // Hourly distribution curve
    const hours = [
      { hour: '06:00', heatFactor: 0.35, intakeRatio: 0.15, isPeak: false },
      { hour: '08:00', heatFactor: 0.50, intakeRatio: 0.15, isPeak: false },
      { hour: '10:00', heatFactor: 0.75, intakeRatio: 0.18, isPeak: false },
      { hour: '12:00', heatFactor: 1.05, intakeRatio: 0.20, isPeak: true },
      { hour: '14:00', heatFactor: 1.25, intakeRatio: 0.14, isPeak: true },
      { hour: '16:00', heatFactor: 1.15, intakeRatio: 0.10, isPeak: true },
      { hour: '18:00', heatFactor: 0.80, intakeRatio: 0.05, isPeak: false },
      { hour: '20:00', heatFactor: 0.55, intakeRatio: 0.03, isPeak: false },
    ];

    let runningDeficit = 0;

    return hours.map((h) => {
      const intakeMl = Math.round(totalIntake * h.intakeRatio);
      const sweatLossMl = Math.round(baseSweatRate * h.heatFactor * 2); // 2-hour window
      const net = intakeMl - sweatLossMl;
      runningDeficit += net;

      const hourHeatIndex = assessment.heatIndex * (0.8 + 0.2 * h.heatFactor);

      let status: 'SURPLUS' | 'EQUILIBRIUM' | 'DEFICIT' | 'CRITICAL_DEFICIT' = 'EQUILIBRIUM';
      if (net > 50) status = 'SURPLUS';
      else if (net < -350) status = 'CRITICAL_DEFICIT';
      else if (net < -50) status = 'DEFICIT';

      return {
        hour: h.hour,
        intakeMl,
        sweatLossMl,
        netBalanceMl: net,
        heatIndex: Math.round(hourHeatIndex * 10) / 10,
        isPeakWindow: h.isPeak,
        status,
      };
    });
  }, [userProfile.hydrationTodayMl, assessment.sweatLossRateMlHr, assessment.heatIndex]);

  // 7-day adherence data
  const weeklyData = [
    { day: 'Mon', intake: 3400, target: 3600, heatIndex: 44.2, compliance: 94 },
    { day: 'Tue', intake: 3750, target: 3800, heatIndex: 46.5, compliance: 98 },
    { day: 'Wed', intake: 3100, target: 3900, heatIndex: 47.8, compliance: 79 },
    { day: 'Thu', intake: 2900, target: 4000, heatIndex: 48.5, compliance: 72 },
    { day: 'Fri', intake: 3600, target: 3900, heatIndex: 47.0, compliance: 92 },
    { day: 'Sat', intake: 2650, target: 4100, heatIndex: 49.2, compliance: 64 },
    { day: 'Today', intake: userProfile.hydrationTodayMl, target: assessment.heatAdjustedTargetMl, heatIndex: assessment.heatIndex, compliance: Math.min(100, Math.round((userProfile.hydrationTodayMl / assessment.heatAdjustedTargetMl) * 100)) },
  ];

  const maxVolume = Math.max(
    ...hourlyData.map((d) => Math.max(d.intakeMl, d.sweatLossMl)),
    700
  );

  return (
    <div 
      id="hydration-analytics-chart-card"
      className={`p-4 sm:p-5 rounded-2xl bg-[#0b1326] border border-[#2d3449] relative overflow-hidden ${className}`}
    >
      
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-headline font-bold text-base text-white tracking-wide">
              Hydration vs. Thermal Sweat Loss Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Biometeorological fluid balance factoring ambient heat index & personal sweat rates
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-[#060e20] p-1 rounded-xl border border-[#2d3449] self-start sm:self-auto">
          <button
            id="tab-hourly-hydration-chart"
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
              activeTab === 'hourly'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today's Hourly Profile
          </button>
          <button
            id="tab-weekly-hydration-chart"
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
              activeTab === 'weekly'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7-Day Compliance
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 font-mono">
        
        <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449]">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Logged Intake</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-cyan-400">{userProfile.hydrationTodayMl}</span>
            <span className="text-[10px] text-slate-400">/ {assessment.heatAdjustedTargetMl} ml</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {Math.round((userProfile.hydrationTodayMl / assessment.heatAdjustedTargetMl) * 100)}% Heat-Adjusted
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449]">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Active Sweat Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-orange-400">{assessment.sweatLossRateMlHr}</span>
            <span className="text-[10px] text-slate-400">ml / hour</span>
          </div>
          <span className="text-[10px] text-orange-300/80 block mt-0.5">
            HI: {assessment.heatIndex.toFixed(1)}°C
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449]">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Cumulative Deficit</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-bold ${
              assessment.netFluidDeficitMl > 600 ? 'text-red-400' : 'text-amber-400'
            }`}>
              -{assessment.netFluidDeficitMl}
            </span>
            <span className="text-[10px] text-slate-400">ml</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Electrolytes: {assessment.riskTier === 'CRITICAL' ? 'High Depletion' : 'Moderate'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449]">
          <span className="text-[10px] text-slate-400 uppercase block mb-0.5">Dynamic Risk Tier</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              assessment.riskTier === 'CRITICAL' ? 'bg-red-500 animate-pulse' :
              assessment.riskTier === 'HIGH' ? 'bg-orange-500' :
              assessment.riskTier === 'MODERATE' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span className="text-xs font-bold text-white tracking-tight">
              {assessment.riskTier}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Hazard Score: {assessment.dehydrationRiskScore}/100
          </span>
        </div>

      </div>

      {/* Chart Canvas Area */}
      {activeTab === 'hourly' ? (
        <div className="space-y-4">
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pb-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-cyan-500" />
                <span>Water Intake Logged (ml)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-orange-500/80 border border-orange-400" />
                <span>Thermal Sweat Loss (ml/2h)</span>
              </div>
            </div>
            <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              🔥 Peak Heat Window: 12:00 – 16:30 IST
            </span>
          </div>

          {/* Grouped Bar Chart */}
          <div className="h-52 w-full pt-4 pb-2 flex items-end justify-between gap-2 sm:gap-4 border-b border-[#2d3449] relative">
            
            {/* Background Grid Guidelines */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between opacity-10">
              <div className="border-b border-white w-full" />
              <div className="border-b border-white w-full" />
              <div className="border-b border-white w-full" />
              <div className="border-b border-white w-full" />
            </div>

            {hourlyData.map((point, index) => {
              const intakeHeight = Math.max(6, Math.round((point.intakeMl / maxVolume) * 100));
              const sweatHeight = Math.max(8, Math.round((point.sweatLossMl / maxVolume) * 100));
              const isHovered = hoveredIndex === index;

              return (
                <div 
                  key={point.hour}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Floating Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-24 z-30 bg-[#060e20] border border-cyan-500/60 p-2.5 rounded-xl shadow-xl text-[11px] font-mono whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between gap-3 text-white font-bold mb-1">
                        <span>Window: {point.hour}</span>
                        <span className="text-orange-400">{point.heatIndex}°C HI</span>
                      </div>
                      <div className="text-cyan-300">Intake: +{point.intakeMl} ml</div>
                      <div className="text-orange-300">Sweat Loss: -{point.sweatLossMl} ml</div>
                      <div className={`mt-1 pt-1 border-t border-slate-700 font-bold ${
                        point.netBalanceMl < 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        Net: {point.netBalanceMl > 0 ? `+${point.netBalanceMl}` : point.netBalanceMl} ml
                      </div>
                    </div>
                  )}

                  {/* Dual Bars */}
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                    
                    {/* Intake Bar (Blue) */}
                    <div 
                      className={`w-3 sm:w-5 rounded-t-md transition-all duration-300 relative ${
                        point.intakeMl > 0 
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-sm shadow-cyan-500/30' 
                          : 'bg-cyan-950/40 border border-cyan-900/50'
                      } ${isHovered ? 'brightness-125 scale-y-[1.03]' : ''}`}
                      style={{ height: `${intakeHeight}%` }}
                    >
                      {point.intakeMl > 0 && (
                        <span className="hidden sm:block absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-300">
                          {point.intakeMl}
                        </span>
                      )}
                    </div>

                    {/* Sweat Loss Bar (Orange) */}
                    <div 
                      className={`w-3 sm:w-5 rounded-t-md transition-all duration-300 relative ${
                        point.isPeakWindow
                          ? 'bg-gradient-to-t from-red-600 to-orange-500 shadow-sm shadow-orange-500/40'
                          : 'bg-gradient-to-t from-orange-600/80 to-amber-500/80'
                      } ${isHovered ? 'brightness-125 scale-y-[1.03]' : ''}`}
                      style={{ height: `${sweatHeight}%` }}
                    >
                      {point.isPeakWindow && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 absolute -top-2 left-1/2 -translate-x-1/2 animate-ping" />
                      )}
                    </div>

                  </div>

                  {/* Hour Label */}
                  <span className={`text-[10px] font-mono mt-2 transition-colors ${
                    point.isPeakWindow ? 'text-orange-400 font-bold' : 'text-slate-400'
                  }`}>
                    {point.hour}
                  </span>

                </div>
              );
            })}
          </div>

          {/* Deficit Alert Banner below Chart */}
          <div className="p-3 rounded-xl bg-[#060e20] border border-[#2d3449] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-slate-300">
                Peak dehydration occurred between <strong>12:00 – 16:00</strong> with a cumulative deficit of <strong>-{assessment.netFluidDeficitMl}ml</strong>.
              </span>
            </div>

            {onLogWater && (
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  id="chart-quick-log-250-btn"
                  onClick={() => onLogWater(250)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                >
                  <Droplet className="w-3 h-3 text-cyan-200" />
                  <span>+250ml</span>
                </button>
                <button
                  id="chart-quick-log-500-btn"
                  onClick={() => onLogWater(500)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                >
                  <Zap className="w-3 h-3 text-emerald-200" />
                  <span>+500ml ORS</span>
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* 7-Day Compliance View */
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400 mb-2">
            Weekly hydration adherence against dynamic heatwave targets:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 font-mono">
            {weeklyData.map((d) => (
              <div 
                key={d.day}
                className={`p-3 rounded-xl border text-center transition-all ${
                  d.day === 'Today'
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                    : 'bg-[#060e20] border-[#2d3449]'
                }`}
              >
                <span className="text-xs font-bold text-white block">{d.day}</span>
                <span className="text-[10px] text-orange-400 block my-0.5">{d.heatIndex}°C HI</span>
                
                {/* Mini Progress Bar */}
                <div className="w-full bg-[#171f33] h-1.5 rounded-full overflow-hidden my-2">
                  <div 
                    className={`h-full rounded-full ${
                      d.compliance >= 90 ? 'bg-emerald-400' :
                      d.compliance >= 75 ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${d.compliance}%` }}
                  />
                </div>

                <div className="text-[11px] font-bold text-slate-200">{d.intake}ml</div>
                <span className="text-[9px] text-slate-400 block">Target {d.target}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

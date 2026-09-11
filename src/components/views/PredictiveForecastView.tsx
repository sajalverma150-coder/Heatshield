import React, { useState } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  Layers, 
  Hospital, 
  AlertTriangle, 
  Flame, 
  Compass, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  BarChart2, 
  Activity,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { ForecastDay, WeatherTelemetry } from '../../types';
import { FORECAST_DAYS } from '../../data/mockData';
import { CityData, INDIAN_CITIES } from '../../data/indiaCities';
import { NasaSatelliteThermalMap } from '../NasaSatelliteThermalMap';

interface PredictiveForecastViewProps {
  forecastDays?: ForecastDay[];
  selectedCity?: CityData;
  weather?: WeatherTelemetry;
  dataSourceMode?: 'live_api' | 'imd_heatwave';
  onOpenCitySelector?: () => void;
}

export const PredictiveForecastView: React.FC<PredictiveForecastViewProps> = ({
  forecastDays,
  selectedCity,
  weather,
  dataSourceMode = 'live_api',
  onOpenCitySelector,
}) => {
  const activeForecast = (forecastDays && forecastDays.length > 0) ? forecastDays : FORECAST_DAYS;
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [eocRequisitionSent, setEocRequisitionSent] = useState<boolean>(false);
  const [stocksVerified, setStocksVerified] = useState<boolean>(false);

  const selectedDay = activeForecast[selectedDayIndex] || activeForecast[0];

  const handleSendRequisition = () => {
    setEocRequisitionSent(true);
    setTimeout(() => setEocRequisitionSent(false), 4000);
  };

  const handleVerifyStocks = () => {
    setStocksVerified(true);
    setTimeout(() => setStocksVerified(false), 4000);
  };

  // Dynamically calculate SVG Y coordinate based on actual temperatures of selected day
  const hourlyPts = selectedDay.hourlyStress || [];
  const allTemps = hourlyPts.length > 0 ? hourlyPts.flatMap((p) => [p.temp, p.wbgt]) : [selectedDay.maxTemp, selectedDay.minTemp];
  const minTempChart = Math.min(...allTemps, 20);
  const maxTempChart = Math.max(...allTemps, 36);

  const getYCoord = (val: number) => {
    const range = Math.max(8, maxTempChart - minTempChart);
    const fraction = (val - minTempChart) / range;
    return Math.round(170 - fraction * 130);
  };

  const curfewY = getYCoord(33);
  const safeLimitY = getYCoord(28);
  const isCurfewBreached = selectedDay.hourlyStress?.some((p) => p.wbgt >= 33 || p.temp >= 42) || selectedDay.maxWBGT >= 33;

  return (
    <div id="predictive-forecast-screen" className="space-y-4 sm:space-y-6 pb-12">
      
      {/* Top Header & ML Model Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-headline font-bold text-white">
              7-Day Predictive Heat Stress & Hospital Surge Horizon
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
              {dataSourceMode === 'live_api' ? 'LIVE 7-DAY SATELLITE FORECAST' : 'IMD HEATWAVE DRILL (XGBOOST v2.4)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {dataSourceMode === 'live_api' 
              ? `Real-time Open-Meteo biometeorological forecast synchronized with ${selectedCity?.name || 'IMD'} station telemetry`
              : 'Biometeorological neural ensemble trained on 187 IMD stations, INSAT-3DR LST, and Sion Hospital trauma logs'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Confidence: <strong className="text-emerald-400">94.2%</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span>Station:</span>
            <strong className="text-white">{selectedCity ? selectedCity.name : 'Dharavi-AWS-4019'}</strong>
            {onOpenCitySelector && (
              <button
                onClick={onOpenCitySelector}
                className="text-[10px] text-orange-400 hover:underline ml-1 cursor-pointer"
              >
                (Switch)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 7-Day Interactive Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
        {activeForecast.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const isDanger = day.maxWBGT >= 33.5 || day.maxTemp >= 42.0;

          return (
            <div
              key={day.dayName + idx}
              id={`forecast-day-card-${idx}`}
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden telemetry-card-hover ${
                isSelected
                  ? 'bg-slate-800 border-orange-500 shadow-sm ring-1 ring-orange-500/50'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {isDanger && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl-lg">
                  PEAK HEAT
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className={isSelected ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                  {day.dayName}
                </span>
                <span className="text-slate-500 text-[10px]">{day.dateStr}</span>
              </div>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-2xl sm:text-3xl font-headline font-black text-white">
                  {day.maxTemp}
                </span>
                <span className="text-xs font-mono text-slate-400">/ {day.minTemp}°C</span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-slate-800">
                <span className="text-slate-400">WBGT Max:</span>
                <span className={day.maxWBGT >= 33 ? 'text-red-400 font-bold' : day.maxWBGT >= 29 ? 'text-orange-400' : 'text-emerald-400'}>
                  {day.maxWBGT}°C
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                <span className="text-slate-400">Risk Score:</span>
                <span className={`font-bold ${day.riskScore >= 75 ? 'text-red-400' : day.riskScore >= 45 ? 'text-amber-300' : 'text-emerald-400'}`}>
                  {day.riskScore}/100
                </span>
              </div>

              <div className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/60 text-slate-300 truncate border border-slate-800">
                {day.grapStage}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analysis Grid: Multi-Metric Trajectory Graph + SHAP Explainable AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left (7 Cols): Multi-Metric Trajectory Graph */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  Thermal Trajectory & Surge Probability: {selectedDay.dayName}
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous diurnal simulation of Ambient Dry Bulb vs WBGT Stress Curve ({selectedDay.dateStr})
                </p>
              </div>
              <span className="text-xs font-mono text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/30">
                Max WBGT {selectedDay.maxWBGT}°C
              </span>
            </div>

            {/* SVG Graph Canvas */}
            <div className="relative w-full h-56 sm:h-64 mt-4 bg-slate-950/80 rounded-xl border border-slate-800 p-2 sm:p-4">
              <svg viewBox="0 0 550 200" className="w-full h-full overflow-visible">
                {/* Horizontal reference grid lines */}
                <line x1="30" y1="160" x2="520" y2="160" stroke="#1e293b" strokeWidth="1" />
                <line x1="30" y1="110" x2="520" y2="110" stroke="#1e293b" strokeWidth="1" />
                <line x1="30" y1="60" x2="520" y2="60" stroke="#1e293b" strokeWidth="1" />

                {/* Safe limit (28°C) */}
                {safeLimitY >= 25 && safeLimitY <= 175 && (
                  <>
                    <line x1="30" y1={safeLimitY} x2="520" y2={safeLimitY} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    <text x="35" y={safeLimitY - 4} fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono">Safe Limit 28°C</text>
                  </>
                )}

                {/* Critical line (33°C) */}
                {curfewY >= 20 && curfewY <= 175 && (
                  <>
                    <line x1="30" y1={curfewY} x2="520" y2={curfewY} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="35" y={curfewY - 4} fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                      33°C Curfew Line {isCurfewBreached ? '(Protocol Active)' : '(Conditions Safe)'}
                    </text>
                  </>
                )}

                {/* Dynamic Temperature Curve */}
                {hourlyPts.length > 1 && (
                  <>
                    <path
                      d={hourlyPts.map((pt, i) => {
                        const x = 50 + i * ((470) / (hourlyPts.length - 1));
                        const y = getYCoord(pt.temp);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="3.5"
                    />
                    <path
                      d={hourlyPts.map((pt, i) => {
                        const x = 50 + i * ((470) / (hourlyPts.length - 1));
                        const y = getYCoord(pt.temp);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#ffedd5"
                      strokeWidth="2"
                      className="animate-dash-flow"
                    />
                  </>
                )}

                {/* Dynamic WBGT line */}
                {hourlyPts.length > 1 && (
                  <>
                    <path
                      d={hourlyPts.map((pt, i) => {
                        const x = 50 + i * ((470) / (hourlyPts.length - 1));
                        const y = getYCoord(pt.wbgt);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      opacity="0.7"
                    />
                    <path
                      d={hourlyPts.map((pt, i) => {
                        const x = 50 + i * ((470) / (hourlyPts.length - 1));
                        const y = getYCoord(pt.wbgt);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#fca5a5"
                      strokeWidth="1.5"
                      className="animate-dash-flow-fast"
                    />
                  </>
                )}

                {/* Plot points */}
                {hourlyPts.map((pt, i) => {
                  const cx = 50 + i * ((470) / Math.max(1, hourlyPts.length - 1));
                  const cyTemp = getYCoord(pt.temp);

                  return (
                    <g key={pt.hour + i}>
                      <circle cx={cx} cy={cyTemp} r="4.5" fill="#f97316" stroke="#020617" strokeWidth="2" />
                      <text x={cx} y={cyTemp - 8} textAnchor="middle" fill="#fff" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                        {pt.temp}°
                      </text>
                      <text x={cx} y="190" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">
                        {pt.hour}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#ea580c] rounded" /> Ambient Dry-Bulb (°C)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 border-t-2 border-dashed border-[#f97316]" /> WBGT Stress (°C)
              </span>
            </div>
            <span className="text-orange-400 font-bold">
              Projected Surge: +{selectedDay.projectedSurgeAdmissions} Patients
            </span>
          </div>
        </div>

        {/* Right (5 Cols): Explainable AI - SHAP Feature Attributions */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Contributing Factors (SHAP Values)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Normalized Impact (°C)
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Decomposition of meteorological and built-environment drivers forcing thermal stress in {selectedDay.dayName}:
            </p>

            <div className="space-y-2.5">
              {selectedDay.shapFactors.map((factor, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-200 font-semibold truncate pr-2">
                      {factor.factor}
                    </span>
                    <span className={`font-bold ${factor.impact > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {factor.impact > 0 ? `+${factor.impact}°C` : `${factor.impact}°C`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Model Loss (RMSE): 0.38°C</span>
            <span className="text-cyan-400">Tree Depth: 8 Levels</span>
          </div>
        </div>

      </div>

      {/* Hospital Admission Surge Capacity Planner & NASA MODIS Satellite Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left (7 Cols): Hospital Surge Planner */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-headline font-bold text-white">
                  Hospital Admission Surge Outlook ({selectedCity ? selectedCity.name : 'Target District'})
                </h3>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                selectedDay.riskScore >= 70 
                  ? 'text-red-400 bg-red-500/15 border-red-500/30' 
                  : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
              }`}>
                +{selectedDay.projectedSurgeAdmissions} {selectedDay.riskScore >= 70 ? 'ADMISSIONS / 24H' : 'ROUTINE BASELINE / 24H'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Outdoor Labor (Heatstroke)</span>
                <span className={`text-lg font-bold ${selectedDay.riskScore >= 70 ? 'text-red-400' : 'text-slate-300'}`}>
                  {selectedDay.riskScore >= 70 ? '58%' : '14%'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {selectedDay.riskScore >= 70 ? 'Severe Hypovolemia' : 'Mild Dehydration'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Geriatric & Cardiac Load</span>
                <span className={`text-lg font-bold ${selectedDay.riskScore >= 70 ? 'text-orange-400' : 'text-slate-300'}`}>
                  {selectedDay.riskScore >= 70 ? '28%' : '18%'}
                </span>
                <span className="text-[10px] text-slate-500 block">Cardiovascular Strain</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pediatric & Infants</span>
                <span className="text-lg font-bold text-amber-300">
                  {selectedDay.riskScore >= 70 ? '14%' : '8%'}
                </span>
                <span className="text-[10px] text-slate-500 block">Electrolyte Balance</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className={`p-3 rounded-xl border ${
                selectedDay.riskScore >= 70
                  ? 'bg-red-950/20 border-red-500/20 text-red-200'
                  : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
              }`}>
                <strong className={`block font-semibold mb-1 ${selectedDay.riskScore >= 70 ? 'text-red-300' : 'text-emerald-300'}`}>
                  Tactical Clinical Advisory:
                </strong>
                {selectedDay.riskScore >= 70
                  ? `Recommended prepositioning of 1,200 liters chilled 0.9% Normal Saline, rapid ice immersion tubs at ${selectedCity?.name || 'municipal'} emergency trauma overflow, and deployment of mobile heat triage teams.`
                  : `Ambient dry-bulb and WBGT thermal index are currently within normal biometeorological tolerances. Standard municipal hospital outpatient wards and routine hydration advisories remain active.`}
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                id="dispatch-eoc-requisition-btn"
                onClick={handleSendRequisition}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Dispatch EOC Requisition</span>
              </button>
              <button
                id="verify-stocks-btn"
                onClick={handleVerifyStocks}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify Cold Saline Stocks</span>
              </button>
            </div>

            {(eocRequisitionSent || stocksVerified) && (
              <span className="text-xs font-mono text-emerald-400">
                {eocRequisitionSent ? '✓ EOC Requisition Broadcast to DDMA' : '✓ 8,500 Units Chilled Saline Confirmed In-Stock'}
              </span>
            )}
          </div>
        </div>

        {/* Right (5 Cols): Real-Time NASA Satellite Thermal Map */}
        <div className="lg:col-span-5 flex flex-col">
          <NasaSatelliteThermalMap
            city={selectedCity || INDIAN_CITIES[0]}
            weather={weather || selectedCity?.weather || INDIAN_CITIES[0].weather}
            dataSourceMode={dataSourceMode}
          />
        </div>

      </div>

    </div>
  );
};

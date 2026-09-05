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
import { ForecastDay } from '../../types';
import { FORECAST_DAYS, ASSET_IMAGES } from '../../data/mockData';
import { CityData } from '../../data/indiaCities';

interface PredictiveForecastViewProps {
  forecastDays?: ForecastDay[];
  selectedCity?: CityData;
  onOpenCitySelector?: () => void;
}

export const PredictiveForecastView: React.FC<PredictiveForecastViewProps> = ({
  forecastDays,
  selectedCity,
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

  return (
    <div id="predictive-forecast-screen" className="space-y-4 sm:space-y-6 pb-12">
      
      {/* Top Header & ML Model Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0b1326] p-4 rounded-2xl border border-[#2d3449]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-headline font-bold text-white">
              5-Day Predictive Heat Stress & Hospital Surge Horizon
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              XGBOOST v2.4
            </span>
          </div>
          <p className="text-xs text-[#e0c0b1]/70 mt-0.5">
            Biometeorological neural ensemble trained on 187 IMD stations, INSAT-3DR LST, and Sion Hospital trauma logs
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-[#060e20] border border-[#2d3449] text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Confidence: <strong className="text-emerald-400">94.2%</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#060e20] border border-[#2d3449] text-slate-300 flex items-center gap-1.5">
            <span>Station:</span>
            <strong className="text-white">{selectedCity ? selectedCity.name : 'Dharavi-AWS-4019'}</strong>
            {onOpenCitySelector && (
              <button
                onClick={onOpenCitySelector}
                className="text-[10px] text-orange-400 hover:underline ml-1"
              >
                (Switch)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5-Day Interactive Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {activeForecast.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const isPeak = idx === 2; // Wednesday peak

          return (
            <div
              key={day.dayName}
              id={`forecast-day-card-${idx}`}
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                isSelected
                  ? 'bg-[#171f33] border-orange-500 shadow-xl shadow-orange-950/20 ring-1 ring-orange-500/50'
                  : 'bg-[#0b1326] border-[#2d3449] hover:border-slate-500 hover:bg-[#131b2e]'
              }`}
            >
              {isPeak && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl-lg">
                  PEAK DANGER
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

              <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-[#2d3449]/70">
                <span className="text-slate-400">WBGT Max:</span>
                <span className={day.maxWBGT >= 34 ? 'text-red-400 font-bold' : 'text-orange-400'}>
                  {day.maxWBGT}°C
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono mt-1">
                <span className="text-slate-400">Risk Score:</span>
                <span className="text-amber-300 font-bold">{day.riskScore}/100</span>
              </div>

              <div className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-[#060e20] text-slate-300 truncate border border-[#2d3449]">
                {day.grapStage}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Analysis Grid: Multi-Metric Trajectory Graph + SHAP Explainable AI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left (7 Cols): Multi-Metric Trajectory Graph */}
        <div className="lg:col-span-7 bg-[#0b1326] rounded-2xl border border-[#2d3449] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  Thermal Trajectory & Surge Probability: {selectedDay.dayName}
                </h3>
                <p className="text-xs text-slate-400">
                  Continuous simulation of Ambient Dry Bulb vs WBGT Stress Curve
                </p>
              </div>
              <span className="text-xs font-mono text-orange-400 font-bold bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/30">
                Max WBGT {selectedDay.maxWBGT}°C
              </span>
            </div>

            {/* SVG Graph Canvas */}
            <div className="relative w-full h-56 sm:h-64 mt-4 bg-[#060e20] rounded-xl border border-[#2d3449] p-2 sm:p-4">
              <svg viewBox="0 0 550 200" className="w-full h-full overflow-visible">
                {/* Horizontal reference grid lines */}
                <line x1="30" y1="160" x2="520" y2="160" stroke="#171f33" strokeWidth="1" />
                <line x1="30" y1="110" x2="520" y2="110" stroke="#171f33" strokeWidth="1" />
                <line x1="30" y1="60" x2="520" y2="60" stroke="#171f33" strokeWidth="1" />

                {/* Safe limit (28°C) */}
                <line x1="30" y1="125" x2="520" y2="125" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <text x="35" y="120" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono">Safe Limit 28°C</text>

                {/* Critical line (33°C) */}
                <line x1="30" y1="55" x2="520" y2="55" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                <text x="35" y="50" fill="#ef4444" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">33°C Curfew Line</text>

                {/* Dynamic path for selected day's hourly stress */}
                <path
                  d={`M 40 ${190 - (selectedDay.hourlyStress[0].temp - 25) * 6} 
                      Q 120 ${190 - (selectedDay.hourlyStress[1].temp - 25) * 6.5} 
                        200 ${190 - (selectedDay.hourlyStress[2].temp - 25) * 7} 
                      T 280 ${190 - (selectedDay.hourlyStress[3].temp - 25) * 7.5} 
                      T 360 ${190 - (selectedDay.hourlyStress[4].temp - 25) * 7.2} 
                      T 440 ${190 - (selectedDay.hourlyStress[5].temp - 25) * 6.8} 
                      T 500 ${190 - (selectedDay.hourlyStress[6].temp - 25) * 6.2}`}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="3.5"
                />

                {/* WBGT line */}
                <path
                  d={`M 40 ${190 - (selectedDay.hourlyStress[0].wbgt - 22) * 8} 
                      Q 120 ${190 - (selectedDay.hourlyStress[1].wbgt - 22) * 8.5} 
                        200 ${190 - (selectedDay.hourlyStress[2].wbgt - 22) * 9} 
                      T 280 ${190 - (selectedDay.hourlyStress[3].wbgt - 22) * 9.5} 
                      T 360 ${190 - (selectedDay.hourlyStress[4].wbgt - 22) * 9.2} 
                      T 440 ${190 - (selectedDay.hourlyStress[5].wbgt - 22) * 8.6} 
                      T 500 ${190 - (selectedDay.hourlyStress[6].wbgt - 22) * 8.2}`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Plot points */}
                {selectedDay.hourlyStress.map((pt, i) => {
                  const cx = 40 + i * 76.6;
                  const cy = 190 - (pt.temp - 25) * 7.2;

                  return (
                    <g key={pt.hour}>
                      <circle cx={cx} cy={cy} r="4.5" fill="#f97316" stroke="#060e20" strokeWidth="2" />
                      <text x={cx} y="185" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="JetBrains Mono">
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
        <div className="lg:col-span-5 bg-[#0b1326] rounded-2xl border border-[#2d3449] p-4 sm:p-5 flex flex-col justify-between">
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

            <div className="space-y-3">
              {selectedDay.shapFactors.map((factor, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449]">
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

          <div className="mt-3 pt-3 border-t border-[#2d3449] text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Model Loss (RMSE): 0.38°C</span>
            <span className="text-cyan-400">Tree Depth: 8 Levels</span>
          </div>
        </div>

      </div>

      {/* Hospital Admission Surge Capacity Planner & NASA MODIS Satellite Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left (7 Cols): Hospital Surge Planner */}
        <div className="lg:col-span-7 bg-[#0b1326] rounded-2xl border border-red-500/30 p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-headline font-bold text-white">
                  Hospital Admission Surge Outlook (Ward G/North & L)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30">
                +{selectedDay.projectedSurgeAdmissions} ADMISSIONS / 24H
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449]">
                <span className="text-slate-400 block text-[10px]">Outdoor Labor (Heatstroke)</span>
                <span className="text-lg font-bold text-red-400">58%</span>
                <span className="text-[10px] text-slate-500 block">Severe Hypovolemia</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449]">
                <span className="text-slate-400 block text-[10px]">Geriatric & Cardiac Failure</span>
                <span className="text-lg font-bold text-orange-400">28%</span>
                <span className="text-[10px] text-slate-500 block">Decompensated CHF</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449]">
                <span className="text-slate-400 block text-[10px]">Pediatric & Infants</span>
                <span className="text-lg font-bold text-amber-300">14%</span>
                <span className="text-[10px] text-slate-500 block">Electrolyte Crisis</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20">
                <strong className="text-red-300 block font-semibold mb-1">
                  Tactical Resource Requisition Advisory:
                </strong>
                Recommended prepositioning of 1,200 liters chilled 0.9% Normal Saline, 40 additional ice tubs at Sion Hospital trauma overflow, and deployment of 6 mobile dialysis stations.
              </div>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="mt-4 pt-3 border-t border-[#2d3449] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                id="dispatch-eoc-requisition-btn"
                onClick={handleSendRequisition}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-red-950/30"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Dispatch EOC Requisition</span>
              </button>
              <button
                id="verify-stocks-btn"
                onClick={handleVerifyStocks}
                className="px-3.5 py-1.5 rounded-lg bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-slate-300 text-xs font-mono flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verify Cold Saline Stocks</span>
              </button>
            </div>

            {(eocRequisitionSent || stocksVerified) && (
              <span className="text-xs font-mono text-emerald-400 animate-pulse">
                {eocRequisitionSent ? '✓ EOC Requisition Broadcast to DDMA' : '✓ 8,500 Units Chilled Saline Confirmed In-Stock'}
              </span>
            )}
          </div>
        </div>

        {/* Right (5 Cols): NASA MODIS Satellite Thermal Anomaly */}
        <div className="lg:col-span-5 bg-[#0b1326] rounded-2xl border border-[#2d3449] p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                NASA MODIS Satellite Thermal Map
              </h3>
              <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                +4.8°C ANOMALY
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-[#2d3449] aspect-video bg-[#060e20] group">
              <img
                src={ASSET_IMAGES.nasaModis}
                alt="NASA MODIS Thermal Anomaly Mumbai"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060e20] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] font-mono bg-[#0b1326]/90 px-2.5 py-1 rounded border border-[#2d3449] text-slate-300">
                <span>Land Surface Temp (LST):</span>
                <span className="text-red-400 font-bold">47.6°C Peak Core</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            Direct thermal radiation from asphalt transit corridor and dense corrugated tin roofing trapped in high-density informal settlement clusters.
          </p>
        </div>

      </div>

    </div>
  );
};

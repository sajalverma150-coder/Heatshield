import React, { useState, useMemo } from 'react';
import { 
  Droplet, 
  Info, 
  Flame, 
  ShieldCheck, 
  SunMedium, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserHealthProfile, WeatherTelemetry, LanguageCode } from '../types';
import { calculateDehydrationRisk, DehydrationRiskAssessment } from '../services/hydrationRisk';
import { 
  calculateConditionBasedWaterIntake, 
  calculateWeatherBasedORS 
} from '../services/hydrationScheduleService';
import { useAppTranslation } from '../i18n/translations';

interface HydrationTrackerProps {
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  onLogWater?: (amountMl: number) => void;
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
}) => {
  const langCode: LanguageCode = language === 'hi' ? 'hi' : 'en';
  const isHindi = langCode === 'hi';

  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Compute live dehydration risk assessment based on environment & profile
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

  // Liquid Fill calculation
  const currentLoggedMl = userProfile.hydrationTodayMl || 1200;
  const targetMl = userProfile.targetHydrationMl || conditionIntake.recommendedTargetMl || 2800;
  const fillPercentage = Math.min(100, Math.max(8, Math.round((currentLoggedMl / targetMl) * 100)));

  return (
    <div 
      id="hydration-tracking-section" 
      className={`p-3.5 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 relative transition-all duration-300 shadow-sm telemetry-card-hover-cyan ${className}`}
    >
      {/* Header: Title, Guidelines Badge & Risk Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-headline font-bold text-sm sm:text-base text-white tracking-wide">
                {isHindi ? 'पर्यावरण-समायोजित जलयोजन एवं ओआरएस निर्देश' : 'Heat-Adjusted Hydration & ORS Advisory'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                WHO / NDMA
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {isHindi ? 'बायो-मेटियोरोलॉजिकल तरल हानि एवं हृदय तनाव विश्लेषण' : 'Live biometeorological fluid loss & cardiovascular strain'}
            </span>
          </div>
        </div>

        {/* Dynamic Risk Badge */}
        <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto ${assessment.badgeColors.bg} ${assessment.badgeColors.border} ${assessment.badgeColors.text} ${assessment.badgeColors.glow}`}>
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
              assessment.tier === 'CRITICAL' ? 'अति-गंभीर तरल आवश्यकता' :
              assessment.tier === 'HIGH' ? 'उच्च निर्जलीकरण जोखिम' :
              assessment.tier === 'MODERATE' ? 'मध्यम जलयोजन स्तर' : 'सुरक्षित जलयोजन'
            ) : assessment.label}
          </span>
        </div>
      </div>

      {/* Interactive Liquid Fill Gauge Vessel */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          {/* Animated Fluid Vessel Container */}
          <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-2xl bg-slate-900 border-2 border-slate-700/80 shadow-inner overflow-hidden shrink-0 flex flex-col justify-end">
            
            {/* Glass Glare Reflection */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-20" />
            
            {/* Fluid Level Fill Box */}
            <div 
              className="w-full relative transition-all duration-700 ease-out bg-gradient-to-t from-cyan-600 via-cyan-500 to-sky-400"
              style={{ height: `${fillPercentage}%` }}
            >
              {/* Overlapping Wave SVG animations at fluid surface */}
              <div className="absolute -top-3 left-0 w-[200%] h-4 overflow-hidden pointer-events-none z-10">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full opacity-80 animate-liquid-wave">
                  <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z" fill="#38bdf8" />
                </svg>
              </div>
              <div className="absolute -top-2.5 left-0 w-[200%] h-4 overflow-hidden pointer-events-none z-10">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full opacity-60 animate-liquid-wave-slow">
                  <path d="M0,40 C200,-20 400,80 600,20 C800,-40 1000,60 1200,10 L1200,120 L0,120 Z" fill="#06b6d4" />
                </svg>
              </div>

              {/* Rising Fluid Bubbles */}
              <div className="absolute left-1/4 bottom-2 w-2 h-2 rounded-full bg-white/40 animate-bubble-1 pointer-events-none" />
              <div className="absolute left-1/2 bottom-4 w-1.5 h-1.5 rounded-full bg-white/50 animate-bubble-2 pointer-events-none" />
              <div className="absolute left-3/4 bottom-1 w-2.5 h-2.5 rounded-full bg-white/30 animate-bubble-3 pointer-events-none" />
            </div>

            {/* Inner Percentage Readout Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
              <span className="text-2xl font-headline font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {fillPercentage}%
              </span>
              <span className="text-[10px] font-mono font-semibold text-cyan-200 bg-slate-950/80 px-2 py-0.5 rounded-md border border-cyan-500/40">
                {currentLoggedMl} ml
              </span>
            </div>
          </div>

          {/* Fluid Metrics & Quick Log Actions */}
          <div className="flex-1 w-full space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">{isHindi ? 'दैनिक लक्ष्य मात्रा:' : 'Daily Hydration Target:'}</span>
              <span className="text-cyan-400 font-bold">{targetMl} ml</span>
            </div>

            <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-800 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>{isHindi ? 'शेष आवश्यकता:' : 'Remaining:'} <strong className="text-slate-200">{Math.max(0, targetMl - currentLoggedMl)} ml</strong></span>
              <span>{isHindi ? 'ओआरएस पैकेट:' : 'ORS Packets:'} <strong className="text-orange-400">{orsRecommendation.packetsPerDay} {isHindi ? 'सचेत' : 'sachets'}</strong></span>
            </div>

            {/* Quick Fluid Log Buttons */}
            {onLogWater && (
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onLogWater(250)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold border border-cyan-500/40 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>+ 250ml Water</span>
                </button>
                <button
                  onClick={() => onLogWater(300)}
                  className="px-2.5 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-semibold border border-orange-500/40 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ 300ml WHO-ORS</span>
                </button>
                <button
                  onClick={() => onLogWater(500)}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-semibold border border-sky-500/40 transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Droplet className="w-3.5 h-3.5" />
                  <span>+ 500ml Water</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Environmental Context Summary Strip */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 font-mono text-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <SunMedium className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 font-medium">{isHindi ? 'परिवेश स्थिति:' : 'Ambient Condition:'}</span>
          <span className="text-white font-bold">{weather.dryBulbTemp}°C</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{isHindi ? 'हीट इंडेक्स:' : 'Heat Index:'}</span>
          <span className="text-orange-400 font-bold">{assessment.heatIndex.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center gap-2 text-right">
          <span className="text-slate-400">{isHindi ? 'अनुमानित पसीना दर:' : 'Estimated Sweat Loss:'}</span>
          <span className="text-cyan-400 font-bold">{assessment.sweatLossRateMlHr} {isHindi ? 'मिली/घंटा' : 'ml/h'}</span>
        </div>
      </div>

      {/* Dynamic Clinical Advisory & Immediate Action Recommendation */}
      <div className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${assessment.badgeColors.bg} ${assessment.badgeColors.border}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 font-bold font-mono text-sm">
            {assessment.tier === 'CRITICAL' ? (
              <span className="text-red-400 flex items-center gap-1.5">
                ⚠️ {isHindi ? 'तत्काल नैदानिक जलयोजन प्रोटोकॉल' : 'URGENT REHYDRATION PROTOCOL'}
              </span>
            ) : assessment.tier === 'HIGH' ? (
              <span className="text-orange-400 flex items-center gap-1.5">
                ⚠️ {isHindi ? 'उच्च तापमान जलयोजन प्रोटोकॉल' : 'ELEVATED HEAT REHYDRATION PROTOCOL'}
              </span>
            ) : assessment.tier === 'MODERATE' ? (
              <span className="text-amber-300 flex items-center gap-1.5">
                ℹ️ {isHindi ? 'एहतियाती जलयोजन निर्देश' : 'PRECAUTIONARY REHYDRATION'}
              </span>
            ) : (
              <span className="text-cyan-300 flex items-center gap-1.5">
                ✓ {isHindi ? 'मानक जलयोजन निर्देश' : 'STANDARD HYDRATION ADVISORY'}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 underline shrink-0 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showExplanation ? (isHindi ? 'विवरण छिपाएं' : 'Hide Biometeorology Details') : (isHindi ? 'बायो-विवरण देखें' : 'View Biometeorology Details')}</span>
          </button>
        </div>

        <p className="text-slate-200 text-xs sm:text-sm mb-2 font-sans leading-relaxed">
          <strong className="text-white">{isHindi ? 'तत्काल सिफारिश:' : 'Immediate Recommendation:'}</strong> {isHindi ? (
            assessment.tier === 'CRITICAL' 
              ? 'हर 15-20 मिनट में 250 मिली ओआरएस का घोल पिएं। तुरंत शीतल छायादार स्थान में जाएं और भारी शारीरिक श्रम रोक दें।'
              : assessment.tier === 'HIGH'
              ? 'प्रति घंटे 400-500 मिली जल अथवा इलेक्ट्रोलाइट का सेवन करें। तेज धूप में निरंतर रहने से बचें।'
              : 'नियमित अंतराल पर पानी पीते रहें और हाइड्रेटेड बने रहें।'
          ) : assessment.recommendedAction}
        </p>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          <strong className="text-slate-200">{isHindi ? 'शरीर पर प्रभाव:' : 'Physiological Impact:'}</strong> {isHindi ? (
            `हीट इंडेक्स ${assessment.heatIndex.toFixed(1)}°C पर पसीने की उच्च दर (${assessment.sweatLossRateMlHr} मिली/घंटा) के कारण रक्त की मात्रा घटती है। निर्धारित मात्रा में जल एवं ओआरएस लेने से इलेक्ट्रोलाइट संतुलन बना रहता है।`
          ) : assessment.clinicalImpact}
        </p>

        {/* Detailed Bio-Logic Explanation Drawer */}
        {showExplanation && (
          <div className="mt-3.5 pt-3 border-t border-slate-800 text-xs font-mono text-slate-300 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-slate-400">
              <span>● {isHindi ? 'परिवेश हीट इंडेक्स तनाव:' : 'Ambient Heat Index Stressor:'}</span>
              <span className="text-white font-bold">{assessment.heatIndex.toFixed(1)}°C ({assessment.heatIndexCategory})</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● {isHindi ? 'बुनियादी कोशिकीय आवश्यकता:' : 'Baseline Cellular Need:'}</span>
              <span className="text-slate-200 font-semibold">{assessment.baselineTargetMl} {isHindi ? 'मिली/दिन' : 'ml/day'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● {isHindi ? 'लू में पसीने की अतिरिक्त क्षति:' : 'Heatwave Sweat Loss Add-on:'}</span>
              <span className="text-amber-400 font-bold">+{assessment.heatAdjustedTargetMl - assessment.baselineTargetMl} {isHindi ? 'मिली' : 'ml'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>● {isHindi ? 'अनुशंसित दैनिक कुल मात्रा:' : 'Total Prescribed Fluid Target:'}</span>
              <span className="text-cyan-400 font-bold">{conditionIntake.recommendedTargetMl} {isHindi ? 'मिली' : 'ml'}</span>
            </div>
            {assessment.hasDiureticOrVulnerability && (
              <div className="text-xs text-red-300 pt-2 border-t border-red-500/30 bg-red-950/20 p-2 rounded">
                ⚠️ <strong>{isHindi ? 'हृदय/मूत्रवर्धक औषधि संवेदनशीलता सक्रिय:' : 'Cardiovascular / Diuretic Multiplier Active:'}</strong> {isHindi ? 'एंटीहाइपरटेंसिव दवाएं गुर्दे द्वारा तरल उत्सर्जन बढ़ाती हैं, जिससे लू में निर्जलीकरण का खतरा बढ़ जाता है।' : 'Antihypertensive diuretic medication accelerates renal fluid clearance, increasing dehydration risk vulnerability under heat stress.'}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

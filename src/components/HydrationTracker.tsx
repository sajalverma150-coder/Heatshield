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

  return (
    <div 
      id="hydration-tracking-section" 
      className={`p-3.5 sm:p-5 rounded-2xl bg-[#0b1326] border border-[#2d3449] relative transition-all duration-300 ${className}`}
    >
      {/* Header: Title, Guidelines Badge & Risk Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
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
        <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 self-start sm:self-auto shadow-sm ${assessment.badgeColors.bg} ${assessment.badgeColors.border} ${assessment.badgeColors.text}`}>
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

      {/* Environmental Context Summary Strip */}
      <div className="p-3 rounded-xl bg-[#060e20] border border-[#2d3449] mb-4 font-mono text-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <SunMedium className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300 font-semibold">{isHindi ? 'परिवेश स्थिति:' : 'Ambient Condition:'}</span>
          <span className="text-white font-bold">{weather.dryBulbTemp}°C</span>
          <span className="text-slate-500">|</span>
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

        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          <strong className="text-slate-300">{isHindi ? 'शरीर पर प्रभाव:' : 'Physiological Impact:'}</strong> {isHindi ? (
            `हीट इंडेक्स ${assessment.heatIndex.toFixed(1)}°C पर पसीने की उच्च दर (${assessment.sweatLossRateMlHr} मिली/घंटा) के कारण रक्त की मात्रा घटती है। निर्धारित मात्रा में जल एवं ओआरएस लेने से इलेक्ट्रोलाइट संतुलन बना रहता है।`
          ) : assessment.clinicalImpact}
        </p>

        {/* Detailed Bio-Logic Explanation Drawer */}
        {showExplanation && (
          <div className="mt-3.5 pt-3 border-t border-[#2d3449]/60 text-xs font-mono text-slate-300 space-y-2 animate-in fade-in">
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
              <span>● {isHindi ? 'अनुशंसित दैनिक कुल मात्रा:' : 'Total Prescribed Fluid Target:'}</span>
              <span className="text-cyan-300 font-bold">{conditionIntake.recommendedTargetMl} {isHindi ? 'मिली' : 'ml'}</span>
            </div>
            {assessment.hasDiureticOrVulnerability && (
              <div className="text-xs text-red-300/90 pt-2 border-t border-red-500/20">
                ⚠️ <strong>{isHindi ? 'हृदय/मूत्रवर्धक औषधि संवेदनशीलता सक्रिय:' : 'Cardiovascular / Diuretic Multiplier Active:'}</strong> {isHindi ? 'एंटीहाइपरटेंसिव दवाएं गुर्दे द्वारा तरल उत्सर्जन बढ़ाती हैं, जिससे लू में निर्जलीकरण का खतरा बढ़ जाता है।' : 'Antihypertensive diuretic medication accelerates renal fluid clearance, increasing dehydration risk vulnerability under heat stress.'}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Droplet, 
  Info, 
  SunMedium, 
  AlertTriangle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { UserHealthProfile, WeatherTelemetry, LanguageCode } from '../types';
import { calculateDehydrationRisk, DehydrationRiskAssessment } from '../services/hydrationRisk';
import { 
  calculateConditionBasedWaterIntake, 
  calculateWeatherBasedORS 
} from '../services/hydrationScheduleService';

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
  const fillPercentage = Math.min(100, Math.max(0, Math.round((currentLoggedMl / targetMl) * 100)));

  return (
    <div 
      id="hydration-tracking-section" 
      className={`bg-white rounded-lg border border-[#D6E0E5] p-5 shadow-xs text-[#263746] ${className}`}
    >
      {/* Header: Title, Guidelines Badge & Risk Tier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-[#D6E0E5]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-[#E8F1F5] border border-[#D6E0E5] flex items-center justify-center text-[#1E5A7A] shrink-0">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-headline font-bold text-base text-[#12304A]">
                {isHindi ? 'पर्यावरण-समायोजित जलयोजन निर्देश' : 'Biometeorological Hydration Advisory'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F1F5] text-[#1E5A7A] border border-[#D6E0E5] font-semibold">
                WHO / NDMA Standard
              </span>
            </div>
            <p className="text-xs text-[#657783]">
              {isHindi ? 'शारीरिक द्रव संतुलन एवं ताप तनाव अनुकूलन' : 'Calculated fluid deficit under current thermal load'}
            </p>
          </div>
        </div>

        {/* Dynamic Risk Badge */}
        <div className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1.5 self-start sm:self-auto ${
          assessment.tier === 'CRITICAL'
            ? 'bg-[#F8E9E8] border-[#A63D40] text-[#A63D40]'
            : assessment.tier === 'HIGH'
            ? 'bg-[#FFF4D6] border-[#C65D27] text-[#C65D27]'
            : assessment.tier === 'MODERATE'
            ? 'bg-[#FFF4D6] border-[#B7791F] text-[#B7791F]'
            : 'bg-[#E8F1F5] border-[#317A5A] text-[#317A5A]'
        }`}>
          <span className="w-2 h-2 rounded-full bg-current" />
          <span>
            {isHindi ? (
              assessment.tier === 'CRITICAL' ? 'गंभीर आवश्यकता' :
              assessment.tier === 'HIGH' ? 'उच्च जोखिम' :
              assessment.tier === 'MODERATE' ? 'मध्यम जोखिम' : 'सामान्य स्तर'
            ) : assessment.label}
          </span>
        </div>
      </div>

      {/* Institutional Fluid Progress & Metric Card */}
      <div className="p-4 rounded-lg bg-[#F4F1EA] border border-[#D6E0E5] mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Target and Current Readout */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#657783] font-medium">
                {isHindi ? 'दैनिक जलयोजन प्रगति:' : 'Daily Hydration Progress:'}
              </span>
              <span className="font-mono text-sm font-bold text-[#12304A]">
                {currentLoggedMl} <span className="text-xs font-normal text-[#657783]">/ {targetMl} ml</span>
                <span className="ml-2 text-xs font-semibold text-[#1E5A7A]">({fillPercentage}%)</span>
              </span>
            </div>

            {/* Clean, calibrated progress bar */}
            <div className="w-full bg-[#E8F1F5] rounded-md h-3 border border-[#D6E0E5] overflow-hidden p-0.5">
              <div 
                className="bg-[#2F7F82] h-full rounded-sm transition-all duration-300"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#657783] pt-0.5">
              <span>{isHindi ? 'शेष मात्रा:' : 'Remaining Requirement:'} <strong className="text-[#12304A] font-mono">{Math.max(0, targetMl - currentLoggedMl)} ml</strong></span>
              <span>{isHindi ? 'अनुशंसित ओआरएस:' : 'Prescribed ORS:'} <strong className="text-[#1E5A7A] font-mono">{orsRecommendation.packetsPerDay} {isHindi ? 'पैकेट' : 'sachets'}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Fluid Log Buttons */}
        {onLogWater && (
          <div className="pt-3.5 mt-3 border-t border-[#D6E0E5] flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#657783] font-medium mr-1">Log Intake:</span>
            <button
              onClick={() => onLogWater(250)}
              className="px-3 py-1.5 rounded-md bg-[#1E5A7A] hover:bg-[#164863] text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 ml Water</span>
            </button>
            <button
              onClick={() => onLogWater(300)}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-[#E8F1F5] text-[#1E5A7A] text-xs font-medium border border-[#1E5A7A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+300 ml WHO-ORS</span>
            </button>
            <button
              onClick={() => onLogWater(500)}
              className="px-3 py-1.5 rounded-md bg-white hover:bg-[#E8F1F5] text-[#263746] text-xs font-medium border border-[#D6E0E5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 ml Water</span>
            </button>
          </div>
        )}
      </div>

      {/* Environmental Context Summary Strip */}
      <div className="p-3 rounded-lg bg-[#E8F1F5] border border-[#D6E0E5] mb-4 text-xs flex flex-wrap items-center justify-between gap-2.5 text-[#263746]">
        <div className="flex items-center gap-2">
          <SunMedium className="w-4 h-4 text-[#B7791F]" />
          <span className="text-[#657783]">{isHindi ? 'परिवेश स्थिति:' : 'Ambient Temp:'}</span>
          <span className="font-mono font-bold text-[#12304A]">{weather.dryBulbTemp}°C</span>
          <span className="text-[#D6E0E5]">|</span>
          <span className="text-[#657783]">{isHindi ? 'हीट इंडेक्स:' : 'Heat Index:'}</span>
          <span className="font-mono font-bold text-[#C65D27]">{assessment.heatIndex.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#657783]">{isHindi ? 'अनुमानित पसीना दर:' : 'Estimated Sweat Rate:'}</span>
          <span className="font-mono font-bold text-[#12304A]">{assessment.sweatLossRateMlHr} {isHindi ? 'मिली/घंटा' : 'ml/h'}</span>
        </div>
      </div>

      {/* Dynamic Clinical Advisory & Immediate Action Recommendation */}
      <div className={`p-4 rounded-lg border text-xs leading-relaxed ${
        assessment.tier === 'CRITICAL'
          ? 'bg-[#F8E9E8] border-[#A63D40]'
          : assessment.tier === 'HIGH'
          ? 'bg-[#FFF4D6] border-[#C65D27]'
          : assessment.tier === 'MODERATE'
          ? 'bg-[#FFF4D6] border-[#B7791F]'
          : 'bg-[#E8F1F5] border-[#D6E0E5]'
      }`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#12304A]">
            {assessment.tier === 'CRITICAL' ? (
              <span className="text-[#A63D40] flex items-center gap-1.5 font-sans">
                <AlertTriangle className="w-4 h-4" />
                <span>{isHindi ? 'तत्काल नैदानिक जलयोजन प्रोटोकॉल' : 'Urgent Rehydration Protocol'}</span>
              </span>
            ) : assessment.tier === 'HIGH' ? (
              <span className="text-[#C65D27] flex items-center gap-1.5 font-sans">
                <AlertTriangle className="w-4 h-4" />
                <span>{isHindi ? 'उच्च तापमान जलयोजन प्रोटोकॉल' : 'Elevated Thermal Fluid Protocol'}</span>
              </span>
            ) : assessment.tier === 'MODERATE' ? (
              <span className="text-[#B7791F] flex items-center gap-1.5 font-sans">
                <Info className="w-4 h-4" />
                <span>{isHindi ? 'एहतियाती जलयोजन निर्देश' : 'Precautionary Rehydration Advisory'}</span>
              </span>
            ) : (
              <span className="text-[#317A5A] flex items-center gap-1.5 font-sans">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHindi ? 'मानक जलयोजन निर्देश' : 'Standard Hydration Advisory'}</span>
              </span>
            )}
          </div>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-xs text-[#1E5A7A] hover:text-[#12304A] font-medium flex items-center gap-1 underline cursor-pointer shrink-0"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showExplanation ? (isHindi ? 'विवरण छिपाएं' : 'Hide Details') : (isHindi ? 'बायो-विवरण देखें' : 'View Details')}</span>
          </button>
        </div>

        <p className="text-[#263746] text-xs sm:text-sm mb-2 leading-relaxed">
          <strong className="text-[#12304A]">{isHindi ? 'तत्काल सिफारिश:' : 'Recommendation:'}</strong> {isHindi ? (
            assessment.tier === 'CRITICAL' 
              ? 'हर 15-20 मिनट में 250 मिली ओआरएस का घोल पिएं। तुरंत शीतल छायादार स्थान में जाएं और भारी शारीरिक श्रम रोक दें।'
              : assessment.tier === 'HIGH'
              ? 'प्रति घंटे 400-500 मिली जल अथवा इलेक्ट्रोलाइट का सेवन करें। तेज धूप में निरंतर रहने से बचें।'
              : 'नियमित अंतराल पर पानी पीते रहें और हाइड्रेटेड बने रहें।'
          ) : assessment.recommendedAction}
        </p>

        <p className="text-xs text-[#657783] leading-relaxed">
          <strong className="text-[#263746]">{isHindi ? 'शरीर पर प्रभाव:' : 'Physiological Response:'}</strong> {isHindi ? (
            `हीट इंडेक्स ${assessment.heatIndex.toFixed(1)}°C पर पसीने की उच्च दर (${assessment.sweatLossRateMlHr} मिली/घंटा) के कारण रक्त की मात्रा घटती है। निर्धारित मात्रा में जल एवं ओआरएस लेने से इलेक्ट्रोलाइट संतुलन बना रहता है।`
          ) : assessment.clinicalImpact}
        </p>

        {/* Detailed Bio-Logic Explanation Drawer */}
        {showExplanation && (
          <div className="mt-3.5 pt-3 border-t border-[#D6E0E5] text-xs space-y-2">
            <div className="flex items-center justify-between text-[#657783]">
              <span>Ambient Heat Index Stressor:</span>
              <span className="font-mono font-bold text-[#12304A]">{assessment.heatIndex.toFixed(1)}°C ({assessment.heatIndexCategory})</span>
            </div>
            <div className="flex items-center justify-between text-[#657783]">
              <span>Baseline Cellular Need:</span>
              <span className="font-mono font-medium text-[#263746]">{assessment.baselineTargetMl} ml/day</span>
            </div>
            <div className="flex items-center justify-between text-[#657783]">
              <span>Heatwave Sweat Loss Add-on:</span>
              <span className="font-mono font-bold text-[#C65D27]">+{assessment.heatAdjustedTargetMl - assessment.baselineTargetMl} ml</span>
            </div>
            <div className="flex items-center justify-between text-[#657783]">
              <span>Total Prescribed Fluid Target:</span>
              <span className="font-mono font-bold text-[#1E5A7A]">{conditionIntake.recommendedTargetMl} ml</span>
            </div>
            {assessment.hasDiureticOrVulnerability && (
              <div className="text-xs text-[#A63D40] pt-2 border-t border-[#D6E0E5] bg-[#F8E9E8] p-2 rounded">
                <strong>Cardiovascular / Diuretic Multiplier Active:</strong> Antihypertensive diuretic medication accelerates renal fluid clearance, increasing dehydration risk vulnerability under heat stress.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

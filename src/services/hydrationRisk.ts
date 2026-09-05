import { UserHealthProfile, WeatherTelemetry } from '../types';

export type DehydrationRiskTier = 'OPTIMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface DehydrationRiskAssessment {
  tier: DehydrationRiskTier;
  riskScore: number; // 0 to 100
  label: string;
  statusDescription: string;
  clinicalImpact: string;
  recommendedAction: string;
  recommendedIntakeImmediateMl: number;
  badgeColors: {
    text: string;
    bg: string;
    border: string;
    glow: string;
    progressFrom: string;
    progressTo: string;
    barColor: string;
  };
  heatIndex: number;
  heatIndexCategory: string;
  sweatLossRateMlHr: number;
  baselineTargetMl: number;
  heatAdjustedTargetMl: number;
  waterIntakeMl: number;
  intakePercentage: number;
  deficitMl: number;
  hasDiureticOrVulnerability: boolean;
}

/**
 * Categorize NOAA Heat Index
 */
export function getHeatIndexCategory(heatIndex: number): string {
  if (heatIndex >= 54) return 'Extreme Danger (Stroke Imminent)';
  if (heatIndex >= 41) return 'Danger (Cramps & Exhaustion Likely)';
  if (heatIndex >= 32) return 'Extreme Caution (Fatigue & Cramping)';
  if (heatIndex >= 27) return 'Caution (Increased Sweating)';
  return 'Normal Ambient Range';
}

/**
 * Dynamically evaluate dehydration risk level combining real-time heat index and recorded water intake
 */
export function calculateDehydrationRisk(
  weather: WeatherTelemetry,
  userProfile: UserHealthProfile
): DehydrationRiskAssessment {
  const heatIndex = typeof weather.heatIndex === 'number' && !isNaN(weather.heatIndex) 
    ? weather.heatIndex 
    : 40.0;

  const baselineTargetMl = userProfile.targetHydrationMl || 2500;
  const waterIntakeMl = userProfile.hydrationTodayMl || 0;
  const sunExposure = userProfile.sunExposureHours || 4;

  // Check medication/conditions for physiological vulnerability
  const hasDiuretic = userProfile.medications?.some((m) => 
    m.name.toLowerCase().includes('thiazide') || 
    m.name.toLowerCase().includes('diuretic') || 
    m.name.toLowerCase().includes('furosemide') ||
    m.riskImpact.toLowerCase().includes('dehydration')
  ) ?? true; // Rajesh Kumar takes Thiazide diuretic in default profile

  const hasHypertension = userProfile.conditions?.hypertension ?? true;
  const hasVulnerability = hasDiuretic || hasHypertension;

  // 1. Dynamic Heat-Adjusted Fluid Demand (accounting for evaporative sweat cooling)
  // Base increment: ~55ml per °C above 28°C Heat Index + direct sun exposure load
  const heatAboveNormal = Math.max(0, heatIndex - 28);
  const heatAddonMl = Math.round(
    heatAboveNormal * 55 + (sunExposure * Math.max(0, heatIndex - 32) * 3)
  );
  const heatAdjustedTargetMl = baselineTargetMl + heatAddonMl;

  // 2. Estimated sweat loss rate (ml/hr) under current heat index
  const sweatLossRateMlHr = weather.sweatLossRate || Math.round(
    280 + Math.max(0, heatIndex - 26) * 45
  );

  // 3. Fluid deficit and intake fulfillment percentage
  const deficitMl = Math.max(0, heatAdjustedTargetMl - waterIntakeMl);
  const intakePercentage = Math.min(100, Math.round((waterIntakeMl / heatAdjustedTargetMl) * 100));

  // 4. Mathematical Risk Scoring Model (0 - 100 pts)
  // A. Heat stress load component (0 - 45 pts)
  let heatScore = 0;
  if (heatIndex >= 50) {
    heatScore = 45;
  } else if (heatIndex >= 44) {
    heatScore = 38 + ((heatIndex - 44) / 6) * 7;
  } else if (heatIndex >= 38) {
    heatScore = 26 + ((heatIndex - 38) / 6) * 12;
  } else if (heatIndex >= 32) {
    heatScore = 14 + ((heatIndex - 32) / 6) * 12;
  } else {
    heatScore = Math.max(4, (heatIndex / 32) * 14);
  }

  // B. Hydration Deficit Component (0 - 48 pts)
  // Higher deficit relative to adjusted need yields higher points
  const deficitRatio = deficitMl / heatAdjustedTargetMl;
  const deficitScore = Math.min(48, Math.round(deficitRatio * 48));

  // C. Vulnerability bonus (0 - 8 pts)
  const vulnerabilityScore = hasVulnerability ? 7 : 0;

  let rawRiskScore = Math.round(heatScore + deficitScore + vulnerabilityScore);

  // Clinical guardrails
  // If user has virtually consumed their target or a surplus and heat is not hyper-extreme, protect optimal score
  if (intakePercentage >= 95 && heatIndex < 44) {
    rawRiskScore = Math.min(24, rawRiskScore);
  } else if (intakePercentage >= 85 && heatIndex < 40) {
    rawRiskScore = Math.min(27, rawRiskScore);
  }

  // If heat index is dangerous (>=42°C) and water intake is critically low (<40%), enforce high/critical
  if (heatIndex >= 42 && intakePercentage < 40) {
    rawRiskScore = Math.max(76, rawRiskScore);
  } else if (heatIndex >= 40 && intakePercentage < 60) {
    rawRiskScore = Math.max(55, rawRiskScore);
  }

  const riskScore = Math.min(100, Math.max(5, rawRiskScore));

  // 5. Tier classification & clinical recommendations
  let tier: DehydrationRiskTier = 'OPTIMAL';
  let label = 'OPTIMAL HYDRATION';
  let statusDescription = 'Hydrated & Thermally Protected';
  let clinicalImpact = 'Fluid reserves actively compensate for current heat index. Normal sweating efficiency without cardiovascular strain.';
  let recommendedAction = 'Maintain current hydration pace. Sip ~200ml every 45 minutes of heat exposure.';
  let recommendedIntakeImmediateMl = 200;

  let badgeColors = {
    text: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    progressFrom: 'from-cyan-500',
    progressTo: 'to-blue-500',
    barColor: '#06b6d4',
  };

  if (riskScore >= 75) {
    tier = 'CRITICAL';
    label = 'CRITICAL DEHYDRATION RISK';
    statusDescription = 'Severe Hypovolemia & Imminent Heat Collapse';
    clinicalImpact = `Severe water and sodium depletion under dangerous Heat Index (${heatIndex.toFixed(1)}°C). Core temperature rising; impaired sweating, rapid tachycardia, and acute heat stroke hazard.`;
    recommendedAction = 'Drink 500ml WHO-ORS immediately. Cease physical exertion and move into air-conditioned cooling facility.';
    recommendedIntakeImmediateMl = 500;
    badgeColors = {
      text: 'text-red-400',
      bg: 'bg-red-500/15',
      border: 'border-red-500/50',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.25)]',
      progressFrom: 'from-orange-500',
      progressTo: 'to-red-600',
      barColor: '#ef4444',
    };
  } else if (riskScore >= 53) {
    tier = 'HIGH';
    label = 'HIGH DEHYDRATION RISK';
    statusDescription = 'Significant Cellular Fluid Depletion';
    clinicalImpact = `High transpirational loss (~${sweatLossRateMlHr} ml/h) exceeds fluid replacement. Onset of hemoconcentration, dizziness, orthostatic hypotension, and severe muscle cramping.`;
    recommendedAction = `Rehydrate with at least 350-500ml cold water + electrolytes within 20 minutes. Avoid direct asphalt sun.`;
    recommendedIntakeImmediateMl = 400;
    badgeColors = {
      text: 'text-orange-400',
      bg: 'bg-orange-500/15',
      border: 'border-orange-500/40',
      glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]',
      progressFrom: 'from-amber-500',
      progressTo: 'to-orange-500',
      barColor: '#f97316',
    };
  } else if (riskScore >= 28) {
    tier = 'MODERATE';
    label = 'MODERATE DEHYDRATION RISK';
    statusDescription = 'Mild Deficit Under Elevated Heat';
    clinicalImpact = `Sweat rate is outpacing recorded intake at ${heatIndex.toFixed(1)}°C Heat Index. Mild cardiac workload increase with early thirst sensation.`;
    recommendedAction = 'Drink 250ml water or coconut water now to counteract ambient evaporation.';
    recommendedIntakeImmediateMl = 250;
    badgeColors = {
      text: 'text-amber-300',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
      progressFrom: 'from-cyan-500',
      progressTo: 'to-amber-500',
      barColor: '#f59e0b',
    };
  }

  return {
    tier,
    riskScore,
    label,
    statusDescription,
    clinicalImpact,
    recommendedAction,
    recommendedIntakeImmediateMl,
    badgeColors,
    heatIndex,
    heatIndexCategory: getHeatIndexCategory(heatIndex),
    sweatLossRateMlHr,
    baselineTargetMl,
    heatAdjustedTargetMl,
    waterIntakeMl,
    intakePercentage,
    deficitMl,
    hasDiureticOrVulnerability: hasVulnerability,
  };
}

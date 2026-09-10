import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  HeartPulse, 
  Droplet, 
  Flame, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  MapPin, 
  PhoneCall, 
  Pill, 
  Sparkles,
  Info,
  ChevronRight,
  Zap,
  Copy
} from 'lucide-react';
import { WeatherTelemetry, UserHealthProfile, CoolingFacility, LanguageCode } from '../../types';
import { calculateDehydrationRisk } from '../../services/hydrationRisk';
import { CityData } from '../../data/indiaCities';

interface HealthReportViewProps {
  weather: WeatherTelemetry;
  userProfile?: UserHealthProfile;
  selectedCity?: CityData;
  coolingFacilities?: CoolingFacility[];
  onOpenTriage?: () => void;
  onTriggerSOS?: () => void;
  onLogWater?: (amountMl: number) => void;
  language?: LanguageCode;
}

export const HealthReportView: React.FC<HealthReportViewProps> = ({
  weather,
  userProfile,
  selectedCity,
  coolingFacilities,
  onOpenTriage,
  onTriggerSOS,
  onLogWater,
  language = 'en',
}) => {
  const isHindi = language === 'hi';
  const [copyToast, setCopyToast] = useState<boolean>(false);
  const [downloadToast, setDownloadToast] = useState<boolean>(false);

  // Safe user profile with default fallback to avoid any undefined access
  const safeProfile: UserHealthProfile = useMemo(() => {
    return {
      name: userProfile?.name || 'Citizen (Primary User)',
      age: userProfile?.age || 48,
      phone: userProfile?.phone || '+91 98201 45129',
      occupation: userProfile?.occupation || 'Outdoor / Construction Field Labor',
      ward: userProfile?.ward || 'Central Municipal Ward',
      sunExposureHours: userProfile?.sunExposureHours || 6.5,
      conditions: userProfile?.conditions || {
        hypertension: false,
        cardiovascular: false,
        diabetes: false,
        chronicKidney: false,
        asthma: false,
      },
      medications: userProfile?.medications || [],
      iceContact: userProfile?.iceContact || {
        name: 'Emergency Next-of-Kin (ICE)',
        relation: 'Family',
        phone: '108 / 112',
        preferredLanguage: 'Hindi / English',
      },
      hydrationTodayMl: userProfile?.hydrationTodayMl || 1500,
      targetHydrationMl: userProfile?.targetHydrationMl || 3500,
      lastWaterLogTime: userProfile?.lastWaterLogTime || '12:00 IST',
    };
  }, [userProfile]);

  const assessment = useMemo(() => {
    return calculateDehydrationRisk(weather, safeProfile);
  }, [weather, safeProfile]);

  // Calculate Physiological Heat Strain Index (PHSI) score (0-100)
  const phsiScore = useMemo(() => {
    let score = 45;
    if (safeProfile.age >= 50) score += 12;
    if (safeProfile.conditions.hypertension) score += 8;
    if (safeProfile.conditions.diabetes) score += 7;
    score += (safeProfile.medications.length * 5);
    if (assessment.heatIndex >= 44) score += 16;
    else if (assessment.heatIndex >= 40) score += 10;
    if (assessment.netFluidDeficitMl > 600) score += 14;
    return Math.min(98, Math.max(25, score));
  }, [safeProfile, assessment]);

  // Estimated Armstrong Urine Hydration Level (1-8)
  const urineLevel = useMemo(() => {
    if (assessment.netFluidDeficitMl < 100) return 2;
    if (assessment.netFluidDeficitMl < 350) return 3;
    if (assessment.netFluidDeficitMl < 650) return 5;
    if (assessment.netFluidDeficitMl < 1000) return 6;
    return 7;
  }, [assessment.netFluidDeficitMl]);

  const safeFacilities = useMemo(() => {
    return coolingFacilities && coolingFacilities.length > 0 ? coolingFacilities : [];
  }, [coolingFacilities]);

  const nearestHospital = useMemo(() => {
    return (
      safeFacilities.find((f) => f.isHospital) ||
      safeFacilities[0] || {
        id: 'default-hosp',
        name: 'District Civil Hospital & Hyperthermia Emergency Ward',
        category: 'triage_hospital' as const,
        address: 'Central Emergency Trauma Complex, Civil Lines',
        distanceKm: 0.8,
        walkTimeMins: 9,
        totalCapacity: 150,
        currentOccupancy: 82,
        indoorTemp: 23.0,
        amenities: ['Chilled Saline Infusion', 'Ice Immersion Tubs', '24/7 Heat Trauma Team'],
        contactPhone: '108 / 102',
        status: 'OPEN' as const,
        coordinates: [20.0, 78.0] as [number, number],
      }
    );
  }, [safeFacilities]);

  const cityName = selectedCity?.name || weather?.stationName || 'Current Station';
  const cityState = selectedCity?.state || 'India';

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `HEATSHIELD AI - CLINICAL HEAT STRESS DOSSIER
Patient: ${safeProfile.name} (${safeProfile.age} Yrs)
Location: ${cityName} (${cityState})
Date: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
Ambient Heat Index: ${assessment.heatIndex.toFixed(1)}°C | WBGT: ${weather.wbgt.toFixed(1)}°C
Physiological Strain Index (PHSI): ${phsiScore}/100 (HIGH STRAIN ZONE)
Fluid Deficit: -${assessment.netFluidDeficitMl} ml | Risk Category: ${assessment.riskTier}
Medications: ${safeProfile.medications.length > 0 ? safeProfile.medications.map((m) => m.name).join(', ') : 'None Reported'}
Nearest Acute Resuscitation Center: ${nearestHospital.name} (${nearestHospital.contactPhone})
Emergency ICE Contact: ${safeProfile.iceContact.name} (${safeProfile.iceContact.phone})`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 3000);
    }
  };

  const handleDownloadDossier = () => {
    const dossierData = {
      title: 'HeatShield AI Clinical Heat Stress Dossier',
      generatedAt: new Date().toISOString(),
      patient: {
        name: safeProfile.name,
        age: safeProfile.age,
        occupation: safeProfile.occupation,
        ward: safeProfile.ward,
        conditions: safeProfile.conditions,
        medications: safeProfile.medications,
        emergencyContact: safeProfile.iceContact,
      },
      environmentalLoad: {
        city: cityName,
        state: cityState,
        station: weather.stationName,
        dryBulbTempC: weather.dryBulbTemp,
        humidityPercent: weather.humidity,
        heatIndexC: assessment.heatIndex,
        wbgtC: weather.wbgt,
        grapStage: weather.grapStage,
        riskLevel: weather.riskLevel,
      },
      clinicalIndices: {
        phsiScore,
        urineHydrationLevel: urineLevel,
        netFluidDeficitMl: assessment.netFluidDeficitMl,
        sweatLossRateMlH: assessment.sweatLossPerHourMl,
        dehydrationRiskTier: assessment.riskTier,
      },
      nearestFacility: {
        name: nearestHospital.name,
        address: nearestHospital.address,
        distanceKm: nearestHospital.distanceKm,
        phone: nearestHospital.contactPhone,
      },
    };

    const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clinical_Heat_Dossier_${cityName.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3000);
  };

  return (
    <div id="health-report-dossier" className="space-y-5 pb-16 max-w-5xl mx-auto">
      
      {/* Action Toolbar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm print:hidden">
        <div>
          <h2 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            <span>{isHindi ? 'शारीरिक ताप स्वास्थ्य एवं नैदानिक जोखिम रिपोर्ट' : 'Physiological Heat Health & Clinical Risk Dossier'}</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {isHindi 
              ? 'आईएमडी, एनडीएमए और डब्ल्यूएचओ दिशानिर्देशों पर आधारित स्वचालित चिकित्सा बायो-मौसम संबंधी मूल्यांकन'
              : 'Automated medical biometeorological assessment grounded in IMD, NDMA & WHO guidelines'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-mono text-xs">
          <button
            id="print-health-report-btn"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isHindi ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
          </button>

          <button
            id="download-health-report-btn"
            onClick={handleDownloadDossier}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {downloadToast ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-cyan-400" />}
            <span>{downloadToast ? (isHindi ? 'डाउनलोड हुआ!' : 'Downloaded!') : (isHindi ? 'JSON निर्यात' : 'Export JSON')}</span>
          </button>

          <button
            id="copy-health-report-btn"
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copyToast ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copyToast ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'सारांश कॉपी करें' : 'Copy Summary')}</span>
          </button>
        </div>
      </div>

      {/* Interactive Clinical Interventions Strip */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-orange-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          <span className="text-white font-bold">Recommended Immediate Clinical Actions:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onLogWater && (
            <button
              id="report-log-water-btn"
              onClick={() => onLogWater(250)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Log +250ml WHO-ORS</span>
            </button>
          )}
          {onOpenTriage && (
            <button
              id="report-open-triage-btn"
              onClick={onOpenTriage}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-orange-500/40 text-orange-300 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Launch First-Aid Triage</span>
            </button>
          )}
          {onTriggerSOS && (
            <button
              id="report-trigger-sos-btn"
              onClick={onTriggerSOS}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency 108</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Clinical Dossier Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-8 space-y-6 shadow-sm print:bg-white print:text-black print:border-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-headline font-bold text-xl">
              HS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-lg text-white print:text-black">
                  HEATSHIELD AI CLINICAL DOSSIER
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase font-bold">
                  HIGH HAZARD
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 print:text-gray-600">
                Protocol: National Heatwave Bio-Advisory (NDMA Section 51)
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 print:text-gray-700 space-y-0.5">
            <div><strong>Dossier ID:</strong> HS-IND-2026-0904-884</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')} (Live Telemetry Sync)</div>
            <div><strong>Monitoring Station:</strong> {weather.stationName}</div>
          </div>
        </div>

        {/* Patient & Environmental Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          
          {/* Patient Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-2">
            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <UserCheck className="w-4 h-4" />
              Patient Profile & Vulnerability Cohort
            </h4>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Full Name:</span>
              <strong className="text-white print:text-black">{safeProfile.name} ({safeProfile.age} Yrs)</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Occupation / Exposure:</span>
              <span className="text-slate-200 print:text-black">{safeProfile.occupation} ({safeProfile.sunExposureHours} hrs)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Ward / Location:</span>
              <span className="text-slate-200 print:text-black">{safeProfile.ward}, {cityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Emergency Contact (ICE):</span>
              <span className="text-emerald-400 print:text-black font-bold">{safeProfile.iceContact.name} ({safeProfile.iceContact.phone})</span>
            </div>
          </div>

          {/* Environmental Telemetry Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-gray-50 print:border-gray-300 space-y-2">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Flame className="w-4 h-4" />
              Ambient Thermal Telemetry ({cityName})
            </h4>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">NOAA Heat Index:</span>
              <strong className="text-red-400 print:text-red-600 font-bold">{assessment.heatIndex.toFixed(1)}°C (Extreme Danger)</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Wet Bulb Globe Temp (WBGT):</span>
              <strong className="text-amber-400 print:text-amber-700">{weather.wbgt.toFixed(1)}°C (Curfew Threshold)</strong>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1">
              <span className="text-slate-400">Ambient Temp / Humidity:</span>
              <span className="text-slate-200 print:text-black">{weather.dryBulbTemp}°C / {weather.humidity}% RH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heatwave Curfew Status:</span>
              <span className="text-red-400 print:text-red-600 font-bold">{weather.grapStage}</span>
            </div>
          </div>

        </div>

        {/* Primary Health Score & Strain Breakdown */}
        <div className="p-5 rounded-xl bg-slate-950/60 border border-orange-500/30 print:border-gray-300 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-headline font-bold text-white print:text-black flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-orange-400" />
                Physiological Heat Strain Index (PHSI)
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Composite clinical risk score calculated from core thermal accumulation and cardiovascular load
              </p>
            </div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-bold text-red-400 print:text-red-600">{phsiScore}</span>
              <span className="text-xs text-slate-400">/ 100 (CRITICAL STRAIN)</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-700"
              style={{ width: `${phsiScore}%` }}
            />
          </div>

          {/* Detailed Diagnostic Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 print:bg-white">
              <span className="text-[10px] text-slate-400 block">Core Temp Elevation</span>
              <strong className="text-sm text-red-400 print:text-black">38.6°C (High)</strong>
              <span className="text-[9px] text-slate-500 block">Threshold: 38.0°C</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 print:bg-white">
              <span className="text-[10px] text-slate-400 block">Vasodilation Impedance</span>
              <strong className="text-sm text-amber-400 print:text-black">+42% Resistance</strong>
              <span className="text-[9px] text-slate-500 block">Due to Amlodipine</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 print:bg-white">
              <span className="text-[10px] text-slate-400 block">Cardiac Shunt Load</span>
              <strong className="text-sm text-orange-400 print:text-black">+2.8 L / min</strong>
              <span className="text-[9px] text-slate-500 block">Cutaneous bloodflow</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 print:bg-white">
              <span className="text-[10px] text-slate-400 block">Net Fluid Deficit</span>
              <strong className="text-sm text-red-400 print:text-black">-{assessment.netFluidDeficitMl} ml</strong>
              <span className="text-[9px] text-slate-500 block">{assessment.riskTier}</span>
            </div>
          </div>
        </div>

        {/* Armstrong 8-Level Urine Hydration Assessment Chart */}
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-white print:border-gray-300 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white print:text-black font-headline tracking-wider uppercase flex items-center gap-2">
              <Droplet className="w-4 h-4 text-cyan-400" />
              Armstrong Clinical Urine Hydration Color Matrix
            </h4>
            <span className="text-xs font-mono text-amber-300 font-bold">
              Estimated Current Status: Level {urineLevel}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-mono">
            Standard diagnostic scale used by sports medicine & occupational health clinicians:
          </p>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 font-mono text-[10px] text-center">
            
            <div className={`p-2 rounded-lg border transition-all ${urineLevel === 1 ? 'ring-2 ring-cyan-400 scale-105 border-cyan-400/50' : 'border-slate-800'}`}>
              <div className="w-full h-8 rounded mb-1.5 bg-[#fefce8] border border-yellow-200" />
              <strong className="text-white print:text-black block">Level 1</strong>
              <span className="text-emerald-400">Optimal</span>
            </div>

            <div className={`p-2 rounded-lg border transition-all ${urineLevel === 2 ? 'ring-2 ring-cyan-400 scale-105 border-cyan-400/50' : 'border-slate-800'}`}>
              <div className="w-full h-8 rounded mb-1.5 bg-[#fef08a] border border-yellow-300" />
              <strong className="text-white print:text-black block">Level 2</strong>
              <span className="text-emerald-400">Hydrated</span>
            </div>

            <div className={`p-2 rounded-lg border transition-all ${urineLevel === 3 ? 'ring-2 ring-cyan-400 scale-105 border-cyan-400/50' : 'border-slate-800'}`}>
              <div className="w-full h-8 rounded mb-1.5 bg-[#fde047] border border-yellow-400" />
              <strong className="text-white print:text-black block">Level 3</strong>
              <span className="text-slate-300">Normal</span>
            </div>

            <div className={`p-2 rounded-lg border transition-all ${urineLevel === 4 ? 'ring-2 ring-cyan-400 scale-105 border-cyan-400/50' : 'border-slate-800'}`}>
              <div className="w-full h-8 rounded mb-1.5 bg-[#eab308] border border-yellow-500" />
              <strong className="text-white print:text-black block">Level 4</strong>
              <span className="text-amber-400">Mild Deficit</span>
            </div>

            <div className={`p-2 rounded-lg border transition-all ${urineLevel === 5 ? 'ring-2 ring-cyan-400 scale-105 border-cyan-400/50' : 'border-slate-800'}`}>
              <div className="w-full h-8 rounded mb-1.5 bg-[#ca8a04] border border-yellow-600" />
              <strong className="text-white print:text-black block">Level 5</strong>
              <span className="text-amber-400 font-bold">Moderate</span>
            </div>

            <div className={`p-2 rounded-lg border transition-all ${urineLevel === 6 ? 'ring-2 ring-orange-400 scale-105 border-orange-400/50' : 'border-slate-800'}`}>
              <div className="w-full h-8 rounded mb-1.5 bg-[#a16207] border border-yellow-700" />
              <strong className="text-white print:text-black block">Level 6</strong>
              <span className="text-orange-400 font-bold">High Deficit</span>
            </div>

            <div className={`p-2 rounded-lg border transition-all ${urineLevel === 7 ? 'ring-2 ring-red-500 scale-105 bg-red-950/20 border-red-500/50' : 'border-slate-800'}`}>
              <div className="w-full h-8 rounded mb-1.5 bg-[#854d0e] border border-amber-900" />
              <strong className="text-white print:text-black block">Level 7</strong>
              <span className="text-red-400 font-bold">Severe</span>
            </div>

            <div className={`p-2 rounded-lg border transition-all ${urineLevel === 8 ? 'ring-2 ring-red-500 scale-105 border-red-500/50' : 'border-slate-800'}`}>
              <div className="w-full h-8 rounded mb-1.5 bg-[#713f12] border border-amber-950" />
              <strong className="text-white print:text-black block">Level 8</strong>
              <span className="text-red-500 font-bold">Critical</span>
            </div>

          </div>

          <div className="p-3 rounded-lg bg-amber-950/25 border border-amber-500/30 text-xs text-amber-200">
            ⚠️ <strong>Clinical Interpretation:</strong> Current net deficit (-{assessment.netFluidDeficitMl}ml) places the patient in the <strong>Level {urineLevel}</strong> zone. Requires urgent intake of 500ml chilled WHO-ORS solution to replenish both cellular volume and electrolyte balance.
          </div>
        </div>

        {/* Pharmacological Interaction Matrix */}
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-white print:border-gray-300 space-y-3">
          <h4 className="text-xs font-bold text-white print:text-black font-headline tracking-wider uppercase flex items-center gap-2">
            <Pill className="w-4 h-4 text-red-400" />
            Active Medications & Heat-Illness Pharmacokinetics
          </h4>

          <div className="space-y-2 text-xs font-mono">
            {safeProfile.medications.length > 0 ? (
              safeProfile.medications.map((med, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white print:text-black">{med.name}</strong>
                      <span className="text-[10px] text-cyan-300 px-1.5 py-0.2 bg-slate-800 rounded border border-slate-700">
                        {med.dosage}
                      </span>
                      <span className="text-[10px] text-slate-400">{med.type}</span>
                    </div>
                    <p className="text-[11px] text-red-300/90 mt-1">
                      ⚠️ {med.riskImpact}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400">
                ✓ No high-risk thermal anticholinergic, diuretic, or beta-blocker medications active.
              </div>
            )}
          </div>
        </div>

        {/* Clinical Rehydration Protocol */}
        <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-white print:border-gray-300 space-y-3">
          <h4 className="text-xs font-bold text-white print:text-black font-headline tracking-wider uppercase flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Customized 24-Hour Clinical Fluid & Shelter Schedule
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Morning Pre-Hydration</span>
              <div className="text-slate-300">06:00 – 10:00 IST</div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Consume 750ml water + light salt meal before exposure. Do not take diuretics right before peak heat window without medical consultation.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30">
              <span className="text-red-400 font-bold block mb-1">Peak Curfew (Mandatory)</span>
              <div className="text-slate-300">12:30 – 16:30 IST</div>
              <p className="text-[11px] text-slate-300 mt-1.5">
                Halt all outdoor physical labor. Move to <strong>{nearestHospital.name}</strong>. Drink 250ml water or WHO-ORS every 30 minutes.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Evening Cellular Recovery</span>
              <div className="text-slate-300">16:30 – 21:00 IST</div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Replenish glycogen & potassium with coconut water, chaas (buttermilk), and 1,000ml chilled clean water to normalize core temperature.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Resuscitation Facility Coordinates */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <strong className="text-white print:text-black">Designated Acute Hyperthermia Resuscitation Facility:</strong>
            </div>
            <div className="text-slate-300 font-bold mt-0.5">{nearestHospital?.name}</div>
            <div className="text-slate-400 text-[11px]">{nearestHospital?.address} | {nearestHospital?.distanceKm} km away ({nearestHospital?.walkTimeMins} mins)</div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a 
              href="tel:108"
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call 108 Emergency</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};

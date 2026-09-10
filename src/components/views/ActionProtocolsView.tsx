import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Droplet, 
  HeartPulse, 
  ShieldCheck, 
  PhoneCall, 
  Users, 
  Baby, 
  HardHat, 
  Clock, 
  Activity, 
  Check, 
  HelpCircle,
  Calculator,
  ChevronRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { ASSET_IMAGES } from '../../data/mockData';
import { LanguageCode } from '../../types';

interface ActionProtocolsViewProps {
  onTriggerSOS: () => void;
  onOpenTriage: () => void;
  cityName?: string;
  language?: LanguageCode;
}

export const ActionProtocolsView: React.FC<ActionProtocolsViewProps> = ({
  onTriggerSOS,
  onOpenTriage,
  cityName = 'Mumbai',
  language = 'en',
}) => {
  const [activeScenarioTab, setActiveScenarioTab] = useState<'labor' | 'elderly' | 'children'>('labor');
  const [highlightCondition, setHighlightCondition] = useState<'none' | 'exhaustion' | 'stroke'>('none');
  
  // Hydration calculator states
  const [bodyWeightKg, setBodyWeightKg] = useState<number>(65);
  const [exertionLevel, setExertionLevel] = useState<'light' | 'moderate' | 'heavy'>('heavy');

  // Calculate fluid loss
  const calculateFluid = () => {
    let baseRate = 350; // ml/hr
    if (exertionLevel === 'moderate') baseRate = 650;
    if (exertionLevel === 'heavy') baseRate = 950;
    const weightFactor = (bodyWeightKg / 70);
    return Math.round(baseRate * weightFactor);
  };

  const calculatedHourlyMl = calculateFluid();

  return (
    <div id="action-protocols-screen" className="space-y-4 sm:space-y-6 pb-12">
      
      {/* Top Emergency Hotlines Strip */}
      <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
              Civic Emergency Response Hotlines
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                24/7 TOLL-FREE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Immediate medical evacuation, disaster management coordination, and potable tanker requisition
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <a
            href="tel:108"
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>108 (Ambulance)</span>
          </a>
          <a
            href="tel:1916"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>1916 (BMC Disaster Cell)</span>
          </a>
          <a
            href="tel:1800222026"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
          >
            <span>1800-22-2026 (Water Bowsers)</span>
          </a>
        </div>
      </div>

      {/* Interactive Heat Exhaustion vs Heat Stroke Matrix */}
      <section id="first-aid-triage-matrix" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-orange-400" />
              Interactive Emergency Heat First-Aid & Triage Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Differentiate rapidly between Heat Exhaustion (urgent cooling) and Heat Stroke (code red mortality threat)
            </p>
          </div>

          {/* Quick symptom test triggers */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-[11px] text-slate-400 px-1 hidden md:inline">Test Symptoms:</span>
            <button
              onClick={() => setHighlightCondition('stroke')}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                highlightCondition === 'stroke' ? 'bg-red-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Skin Hot & Bone Dry
            </button>
            <button
              onClick={() => setHighlightCondition('exhaustion')}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                highlightCondition === 'exhaustion' ? 'bg-amber-600 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Profuse Sweating & Pale
            </button>
            <button
              onClick={() => setHighlightCondition('none')}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Reset"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Heat Exhaustion */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            highlightCondition === 'exhaustion'
              ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <h4 className="text-base font-headline font-bold text-amber-300">
                  Heat Exhaustion (Urgent Care)
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Core Temp &lt; 40°C
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <strong className="text-slate-300 block font-mono uppercase text-[11px] mb-1">
                  Hallmark Symptoms:
                </strong>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li><strong>Heavy, profuse sweating</strong> with cool, pale, clammy skin</li>
                  <li>Fast, weak pulse; dizziness and lightheadedness upon standing</li>
                  <li>Muscle spasms/cramps in calves and abdomen (hyponatremia)</li>
                  <li>Nausea, headache, persistent exhaustion and extreme thirst</li>
                  <li><strong>Mental state intact:</strong> Patient is oriented and responds coherently</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <strong className="text-amber-400 block font-mono uppercase text-[11px] mb-1">
                  Immediate First-Aid Protocol:
                </strong>
                <ol className="space-y-1 text-slate-200 list-decimal list-inside">
                  <li>Move patient immediately to a shaded, ventilated, or air-cooled area.</li>
                  <li>Loosen tight clothing; elevate feet by 15-20 cm.</li>
                  <li>Sip cool water with ORS or pinch of salt; do NOT gulp freezing water rapidly.</li>
                  <li>Apply cool wet cloths to the neck, armpits, and groin.</li>
                  <li>If vomiting occurs or symptoms worsen after 30 mins, escalate to Code Red 108.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Card 2: Heat Stroke (CODE RED) */}
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            highlightCondition === 'stroke'
              ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500/60 shadow-lg'
              : 'bg-slate-900/90 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-red-500/30">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <h4 className="text-base font-headline font-bold text-red-400">
                  Heat Stroke (CODE RED LIFE THREAT)
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500 text-white font-bold">
                Core Temp &ge; 40°C (104°F)
              </span>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <strong className="text-red-300 block font-mono uppercase text-[11px] mb-1">
                  Fatal Hallmark Symptoms:
                </strong>
                <ul className="space-y-1 text-slate-200 list-disc list-inside">
                  <li><strong className="text-red-300">Skin is hot, flushed, and BONE DRY</strong> (sweat mechanism collapsed)</li>
                  <li>Rapid, bounding pulse; throbbing severe headache</li>
                  <li><strong className="text-red-300">Altered mental state:</strong> Confusion, slurred speech, delirium, irrational behavior</li>
                  <li>Seizures, ataxia (inability to walk), or total loss of consciousness/coma</li>
                  <li>High risk of multiorgan failure and brain edema within 30 minutes!</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-red-500/30">
                <strong className="text-red-400 block font-mono uppercase text-[11px] mb-1">
                  Emergency Life-Support Protocol:
                </strong>
                <ol className="space-y-1 text-slate-200 list-decimal list-inside">
                  <li><strong>DIAL 108 IMMEDIATELY</strong> - Request Hyperthermia Resuscitation Unit.</li>
                  <li><strong>Aggressive External Cooling:</strong> Immerse in ice-water bath up to neck if feasible, or pack neck/groin/axillae with ice packs.</li>
                  <li>Douse continuously with cold water while fanning vigorously.</li>
                  <li><strong>NEVER force oral liquids</strong> if patient is confused or unconscious (aspiration hazard).</li>
                  <li>Place unconscious breathing patient in lateral recovery position.</li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  onClick={onTriggerSOS}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>DISPATCH EMERGENCY 108 AMBULANCE NOW</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Scenario-Based Vulnerability Action Protocols (Tabs) */}
      <section id="scenario-vulnerability-protocols" className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              Scenario-Based Action Protocols & Work-Rest Standards
            </h3>
            <p className="text-xs text-slate-400">
              Tailored biological defenses aligned with NDMA & WHO Heat Health Guidelines
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveScenarioTab('labor')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                activeScenarioTab === 'labor' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>Outdoor Labor</span>
            </button>
            <button
              onClick={() => setActiveScenarioTab('elderly')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                activeScenarioTab === 'elderly' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Elderly & Chronic</span>
            </button>
            <button
              onClick={() => setActiveScenarioTab('children')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                activeScenarioTab === 'children' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>Schools & Infants</span>
            </button>
          </div>
        </div>

        {/* Tab Content: Labor */}
        {activeScenarioTab === 'labor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-800 aspect-video sm:aspect-square bg-slate-950">
              <img
                src={ASSET_IMAGES.laborWorker}
                alt="Construction Laborer Hydrating"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:col-span-8 space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block">Rest-to-Work Ratio:</span>
                  <span className="text-orange-400 font-bold text-sm">15m Rest / 45m Work</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block">Hydration Interval:</span>
                  <span className="text-cyan-400 font-bold text-sm">250ml every 20 mins</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block">Peak Sun Curfew:</span>
                  <span className="text-red-400 font-bold text-sm">11:30 – 16:30 IST</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p><strong>Pre-Hydration Rule:</strong> Drink 500ml water 30 minutes before starting shift. Do not wait until thirst sets in; thirst indicates a 2% body fluid deficit.</p>
                <p><strong>Electrolyte Supplementation:</strong> Heavy sweating leaches 2-4g sodium per day. Add one standard WHO-ORS sachet to every 1 liter of drinking water provided at site gates.</p>
                <p><strong>PPE Adaptation:</strong> Wear light-colored, loose-weave cotton shirts with long sleeves and wide-brimmed cloth flaps beneath construction safety helmets. Avoid dark synthetic vests.</p>
                <p><strong>Buddy System:</strong> Pair workers in teams of two to continuously observe each other for signs of cognitive confusion, stumbling gait, or cessation of sweating.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Elderly */}
        {activeScenarioTab === 'elderly' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-800 aspect-video sm:aspect-square bg-slate-950">
              <img
                src={ASSET_IMAGES.elderlyCooling}
                alt="Elderly Individual in Cooling Refuge"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:col-span-8 space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300">
                <strong className="block text-sm font-headline">CRITICAL PHYSIOLOGICAL WARNING: ELECTRIC FANS ABOVE 35°C</strong>
                When room ambient temperature exceeds 35°C (95°F), standard ceiling or table fans blow heated air across the body faster than sweat can evaporate, creating a convective oven effect that actually elevates core body temperature!
              </div>

              <div className="space-y-1.5">
                <p><strong>Water Misting Priority:</strong> Combine fan airflow with continuous cool water spray misting or a damp cotton sheet over the body.</p>
                <p><strong>Cardiac & Diuretic Medication Alert:</strong> Beta-blockers blunt tachycardia during heat stress, masking clinical shock. Thiazide diuretics deplete potassium rapidly. Check in with municipal health worker for dose adjustments.</p>
                <p><strong>Twice-Daily Check-ins:</strong> Senior citizens living in top-floor tin-roof rooms must be relocated to community air-conditioned shelters during peak afternoon hours.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Children */}
        {activeScenarioTab === 'children' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-800 aspect-video sm:aspect-square bg-slate-950">
              <img
                src={ASSET_IMAGES.familyChild}
                alt="Mother and Child Heat Protection"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:col-span-8 space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block">Vehicle Heat-Trap Warning:</span>
                  <span className="text-red-400 font-bold">Never leave child in locked auto/car</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 block">School Closure Mandate:</span>
                  <span className="text-orange-400 font-bold">WBGT &gt; 32°C Suspends Sports</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p><strong>Higher Surface-to-Mass Ratio:</strong> Children absorb environmental heat faster and have underdeveloped sweat glands compared to adults.</p>
                <p><strong>Dehydration Warning Signs:</strong> Absence of tears when crying, sunken eyes or fontanelle (soft spot), dry lips, and no wet diaper for over 6 consecutive hours.</p>
                <p><strong>Breastfeeding Mothers:</strong> Infants under 6 months do NOT need plain water, which causes water intoxication. Instead, breastfeed more frequently to provide balanced water and maternal electrolytes.</p>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Interactive Hydration Science Calculator & WHO ORS Field Recipe */}
      <section id="hydration-science-calculator" className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left (7 Cols): Dynamic Fluid Loss Calculator */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              Dynamic Metabolic Sweat Rate Calculator
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              CLINICAL FORMULA
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Weight Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-300">Body Weight:</span>
                <span className="text-cyan-400 font-bold text-sm">{bodyWeightKg} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="110"
                value={bodyWeightKg}
                onChange={(e) => setBodyWeightKg(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>40 kg</span>
                <span>75 kg</span>
                <span>110 kg</span>
              </div>
            </div>

            {/* Exertion Level Radio */}
            <div>
              <span className="text-xs text-slate-300 block mb-1.5 font-mono">
                Occupational Physical Exertion:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setExertionLevel('light')}
                  className={`p-2 rounded-xl text-center border transition-all text-xs font-mono cursor-pointer ${
                    exertionLevel === 'light'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Light / Shaded
                  <span className="text-[10px] block opacity-70">~350 ml/h</span>
                </button>
                <button
                  onClick={() => setExertionLevel('moderate')}
                  className={`p-2 rounded-xl text-center border transition-all text-xs font-mono cursor-pointer ${
                    exertionLevel === 'moderate'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Moderate Walk
                  <span className="text-[10px] block opacity-70">~650 ml/h</span>
                </button>
                <button
                  onClick={() => setExertionLevel('heavy')}
                  className={`p-2 rounded-xl text-center border transition-all text-xs font-mono cursor-pointer ${
                    exertionLevel === 'heavy'
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Heavy Masonry
                  <span className="text-[10px] block opacity-70">~950 ml/h</span>
                </button>
              </div>
            </div>

            {/* Calculated Output Box */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  Required Hourly Fluid Intake:
                </span>
                <div className="text-2xl sm:text-3xl font-headline font-black text-cyan-300">
                  {calculatedHourlyMl} <span className="text-xs font-mono text-cyan-400">ml / hour</span>
                </div>
              </div>
              <div className="text-right text-xs font-mono">
                <span className="text-slate-400 block">Drink Cadence:</span>
                <span className="text-white font-bold">~{Math.round(calculatedHourlyMl / 3)} ml every 20m</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right (5 Cols): WHO-ORS Field Emergency Recipe */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
                <Droplet className="w-4 h-4 text-emerald-400" />
                WHO-ORS Emergency Field Recipe
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                LIFESAVING
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              If commercial sachets are unavailable, prepare this verified physiological rehydration solution using household items:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">1. Clean Boiled/Filtered Water</span>
                <span className="text-emerald-400 font-bold">1.0 Liter</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">2. Clean Sugar / Jaggery</span>
                <span className="text-emerald-400 font-bold">6 Level Teaspoons</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">3. Common Salt (Sodium Chloride)</span>
                <span className="text-emerald-400 font-bold">1/2 Level Teaspoon</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-emerald-300/80 leading-relaxed bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
              💡 <em>Tasting rule:</em> Solution should taste no saltier than human tears. Too much salt can cause nausea; too much sugar can worsen diarrhea.
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Need immediate clinical check?</span>
            <button
              onClick={onOpenTriage}
              className="text-xs font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Run AI Triage Check</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};

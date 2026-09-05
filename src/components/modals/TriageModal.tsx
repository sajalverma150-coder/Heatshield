import React, { useState } from 'react';
import { 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  RotateCcw, 
  ChevronRight, 
  ShieldAlert, 
  Droplet, 
  Wind,
  Sparkles
} from 'lucide-react';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSOS: () => void;
  onNavigateToShelter: () => void;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  onTriggerSOS,
  onNavigateToShelter,
}) => {
  const [step, setStep] = useState<number>(1);
  const [isConfused, setIsConfused] = useState<boolean | null>(null);
  const [skinDry, setSkinDry] = useState<boolean | null>(null);
  const [hasVomiting, setHasVomiting] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setIsConfused(null);
    setSkinDry(null);
    setHasVomiting(null);
  };

  // Determine triage result
  const isCodeRed = isConfused === true || skinDry === true;
  const isYellow = !isCodeRed && hasVomiting === true;
  const isGreen = !isCodeRed && !isYellow && isConfused === false && skinDry === false && hasVomiting === false;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0b1326] border border-orange-500/50 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2d3449] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-white text-base">
                AI Heat Triage Diagnostic Tree
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Clinical decision support for heatstroke triage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-mono"
          >
            ✕
          </button>
        </div>

        {/* Step-by-Step Questions */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-orange-400 font-bold uppercase">
              Step 1 of 3: Neurological & Mental Status
            </div>
            <h4 className="text-sm font-semibold text-white">
              Is the individual exhibiting confusion, slurred speech, irrational agitation, or loss of consciousness?
            </h4>
            
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsConfused(true);
                  setStep(4); // Immediate Red Code escalation
                }}
                className="w-full p-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 rounded-xl text-left text-xs font-mono text-red-200 flex items-center justify-between transition-all"
              >
                <div>
                  <strong className="text-red-400 block text-sm">YES - Altered Mental State / Unresponsive</strong>
                  <span>Delirium, confusion, stumbling gait, or fainting</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>

              <button
                onClick={() => {
                  setIsConfused(false);
                  setStep(2);
                }}
                className="w-full p-3 bg-[#060e20] hover:bg-[#171f33] border border-[#2d3449] rounded-xl text-left text-xs font-mono text-slate-200 flex items-center justify-between transition-all"
              >
                <div>
                  <strong className="text-white block text-sm">NO - Alert & Fully Coherent</strong>
                  <span>Speaks normally, oriented to time and location</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-orange-400 font-bold uppercase">
              Step 2 of 3: Skin Thermometry & Sweating
            </div>
            <h4 className="text-sm font-semibold text-white">
              How does the patient's skin feel to the touch?
            </h4>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setSkinDry(true);
                  setStep(4); // Immediate Red Code escalation
                }}
                className="w-full p-3 bg-red-950/40 hover:bg-red-900/50 border border-red-500/50 rounded-xl text-left text-xs font-mono text-red-200 flex items-center justify-between transition-all"
              >
                <div>
                  <strong className="text-red-400 block text-sm">HOT, RED & BONE DRY (No Sweating)</strong>
                  <span>Thermoregulatory sweating mechanism has collapsed</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>

              <button
                onClick={() => {
                  setSkinDry(false);
                  setStep(3);
                }}
                className="w-full p-3 bg-[#060e20] hover:bg-[#171f33] border border-[#2d3449] rounded-xl text-left text-xs font-mono text-slate-200 flex items-center justify-between transition-all"
              >
                <div>
                  <strong className="text-white block text-sm">HEAVY SWEATING & PALE / CLAMMY</strong>
                  <span>Active sweating, skin feels cool or damp</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-orange-400 font-bold uppercase">
              Step 3 of 3: Secondary Complications
            </div>
            <h4 className="text-sm font-semibold text-white">
              Is the patient experiencing persistent vomiting, inability to keep fluids down, or severe muscle cramps?
            </h4>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setHasVomiting(true);
                  setStep(4);
                }}
                className="w-full p-3 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 rounded-xl text-left text-xs font-mono text-amber-200 flex items-center justify-between transition-all"
              >
                <div>
                  <strong className="text-amber-400 block text-sm">YES - Persistent Vomiting / Severe Spasms</strong>
                  <span>Cannot retain fluids orally; high dehydration risk</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => {
                  setHasVomiting(false);
                  setStep(4);
                }}
                className="w-full p-3 bg-[#060e20] hover:bg-[#171f33] border border-[#2d3449] rounded-xl text-left text-xs font-mono text-slate-200 flex items-center justify-between transition-all"
              >
                <div>
                  <strong className="text-white block text-sm">NO - Able to Drink Fluids</strong>
                  <span>Tolerating water or ORS without emesis</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Diagnosis & Clinical Recommendation */}
        {step === 4 && (
          <div className="space-y-4">
            
            {/* CODE RED: HEAT STROKE */}
            {isCodeRed && (
              <div className="p-4 rounded-xl bg-red-950/70 border-2 border-red-500 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-headline font-black text-lg">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                  <span>CODE RED: SUSPECTED HEAT STROKE</span>
                </div>
                <p className="text-xs text-red-200 leading-relaxed">
                  <strong>CRITICAL MEDICAL EMERGENCY:</strong> Core body temperature is likely exceeding 40°C with neurological impairment or anhidrosis. High risk of irreversible brain injury and fatal multiorgan collapse!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerSOS();
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 animate-bounce"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>CALL 108 AMBULANCE IMMEDIATELY</span>
                  </button>
                </div>
              </div>
            )}

            {/* YELLOW: HEAT EXHAUSTION */}
            {isYellow && (
              <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-headline font-bold text-base">
                  <AlertTriangle className="w-5 h-5" />
                  <span>YELLOW TRIAGE: SEVERE HEAT EXHAUSTION</span>
                </div>
                <p className="text-xs text-amber-200 leading-relaxed">
                  Patient is at risk of decompensating into full heatstroke due to fluid depletion and vomiting. Needs immediate shaded air-cooling and paramedic fluid assessment.
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToShelter();
                    }}
                    className="flex-1 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-xs"
                  >
                    Navigate to Cooling Center
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerSOS();
                    }}
                    className="px-3 py-2 bg-red-600 text-white font-bold rounded-lg text-xs"
                  >
                    SOS 108
                  </button>
                </div>
              </div>
            )}

            {/* GREEN: MILD HEAT STRESS */}
            {isGreen && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-headline font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>GREEN TRIAGE: MILD HEAT STRAIN</span>
                </div>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  Vital thermoregulatory reflexes remain intact. Prescribed intervention: 500ml WHO-ORS solution, 30 minutes rest in ventilated shade, and cessation of strenuous outdoor activities.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToShelter();
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                  >
                    Find Shaded Cooling Center
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-xs font-mono">
              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restart Triage</span>
              </button>
              <button
                onClick={onClose}
                className="text-slate-300 hover:text-white"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

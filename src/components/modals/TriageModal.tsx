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

import { LanguageCode } from '../../types';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSOS: () => void;
  onNavigateToShelter: () => void;
  language?: LanguageCode;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  onTriggerSOS,
  onNavigateToShelter,
  language = 'en',
}) => {
  const [step, setStep] = useState<number>(1);
  const [isConfused, setIsConfused] = useState<boolean | null>(null);
  const [skinDry, setSkinDry] = useState<boolean | null>(null);
  const [hasVomiting, setHasVomiting] = useState<boolean | null>(null);
  const isHindi = language === 'hi';

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
    <div className="fixed inset-0 z-50 bg-[#12304A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border-2 border-[#1E5A7A] rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-xl relative overflow-hidden text-[#263746]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D6E0E5] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8F1F5] border border-[#2F7F82] flex items-center justify-center text-[#1E5A7A]">
              <Sparkles className="w-4 h-4 text-[#C65D27]" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-[#12304A] text-base">
                {isHindi ? 'एआई हीट ट्राइएज नैदानिक ट्री' : 'AI Heat Triage Diagnostic Tree'}
              </h3>
              <p className="text-[11px] font-mono text-[#657783]">
                {isHindi ? 'हीटस्ट्रोक ट्राइएज हेतु नैदानिक निर्णय समर्थन' : 'Clinical decision support for heatstroke triage'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#657783] hover:text-[#12304A] text-lg font-mono cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step-by-Step Questions */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-[#C65D27] font-bold uppercase">
              {isHindi ? 'चरण १ / ३: न्यूरोलॉजिकल एवं मानसिक स्थिति' : 'Step 1 of 3: Neurological & Mental Status'}
            </div>
            <h4 className="text-sm font-semibold text-[#12304A]">
              {isHindi 
                ? 'क्या व्यक्ति को भ्रम, लड़खड़ाती आवाज, अत्यधिक उत्तेजना या बेहोशी के लक्षण हैं?'
                : 'Is the individual exhibiting confusion, slurred speech, irrational agitation, or loss of consciousness?'}
            </h4>
            
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsConfused(true);
                  setStep(4); // Immediate Red Code escalation
                }}
                className="w-full p-3 bg-[#F8E9E8] hover:bg-[#F3D5D4] border border-[#A63D40] rounded-xl text-left text-xs text-[#A63D40] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-[#A63D40] block text-sm font-bold">
                    {isHindi ? 'हाँ - असामान्य मानसिक स्थिति / अनुत्तरदायी' : 'YES - Altered Mental State / Unresponsive'}
                  </strong>
                  <span className="text-[#8F3437]">
                    {isHindi ? 'प्रलाप, भ्रम, लड़खड़ाना या बेहोशी' : 'Delirium, confusion, stumbling gait, or fainting'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A63D40] shrink-0" />
              </button>

              <button
                onClick={() => {
                  setIsConfused(false);
                  setStep(2);
                }}
                className="w-full p-3 bg-[#E8F1F5] hover:bg-[#D6E0E5] border border-[#1E5A7A]/30 rounded-xl text-left text-xs text-[#12304A] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-[#12304A] block text-sm font-bold">
                    {isHindi ? 'नहीं - सतर्क एवं पूर्णतः सचेत' : 'NO - Alert & Fully Coherent'}
                  </strong>
                  <span className="text-[#657783]">
                    {isHindi ? 'सामान्य रूप से बोल रहा है, समय व स्थान का ज्ञान है' : 'Speaks normally, oriented to time and location'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#657783] shrink-0" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-[#C65D27] font-bold uppercase">
              {isHindi ? 'चरण २ / ३: त्वचा तापमान एवं पसीना' : 'Step 2 of 3: Skin Thermometry & Sweating'}
            </div>
            <h4 className="text-sm font-semibold text-[#12304A]">
              {isHindi ? 'स्पर्श करने पर मरीज की त्वचा कैसी महसूस होती है?' : "How does the patient's skin feel to the touch?"}
            </h4>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setSkinDry(true);
                  setStep(4); // Immediate Red Code escalation
                }}
                className="w-full p-3 bg-[#F8E9E8] hover:bg-[#F3D5D4] border border-[#A63D40] rounded-xl text-left text-xs text-[#A63D40] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-[#A63D40] block text-sm font-bold">
                    {isHindi ? 'गर्म, लाल एवं बिल्कुल सूखी (पसीना नहीं)' : 'HOT, RED & BONE DRY (No Sweating)'}
                  </strong>
                  <span className="text-[#8F3437]">
                    {isHindi ? 'शरीर की पसीना निकालने की तापीय प्रणाली विफल हो चुकी है' : 'Thermoregulatory sweating mechanism has collapsed'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A63D40] shrink-0" />
              </button>

              <button
                onClick={() => {
                  setSkinDry(false);
                  setStep(3);
                }}
                className="w-full p-3 bg-[#E8F1F5] hover:bg-[#D6E0E5] border border-[#1E5A7A]/30 rounded-xl text-left text-xs text-[#12304A] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-[#12304A] block text-sm font-bold">
                    {isHindi ? 'अत्यधिक पसीना एवं त्वचा पीली / चिपचिपी' : 'HEAVY SWEATING & PALE / CLAMMY'}
                  </strong>
                  <span className="text-[#657783]">
                    {isHindi ? 'पसीना सक्रिय है, त्वचा ठंडी या नम महसूस होती है' : 'Active sweating, skin feels cool or damp'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#657783] shrink-0" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-[#C65D27] font-bold uppercase">
              {isHindi ? 'चरण ३ / ३: द्वितीयक जटिलताएं' : 'Step 3 of 3: Secondary Complications'}
            </div>
            <h4 className="text-sm font-semibold text-[#12304A]">
              {isHindi 
                ? 'क्या मरीज को लगातार उल्टी, तरल पदार्थ न पचने या मांसपेशियों में गंभीर ऐंठन है?'
                : 'Is the patient experiencing persistent vomiting, inability to keep fluids down, or severe muscle cramps?'}
            </h4>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setHasVomiting(true);
                  setStep(4);
                }}
                className="w-full p-3 bg-[#FFF4D6] hover:bg-[#FFECC2] border border-[#C65D27] rounded-xl text-left text-xs text-[#C65D27] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-[#C65D27] block text-sm font-bold">
                    {isHindi ? 'हाँ - लगातार उल्टी / गंभीर ऐंठन' : 'YES - Persistent Vomiting / Severe Spasms'}
                  </strong>
                  <span className="text-[#A54B1A]">
                    {isHindi ? 'मुंह से तरल नहीं रुक रहा; निर्जलीकरण का उच्च जोखिम' : 'Cannot retain fluids orally; high dehydration risk'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#C65D27] shrink-0" />
              </button>

              <button
                onClick={() => {
                  setHasVomiting(false);
                  setStep(4);
                }}
                className="w-full p-3 bg-[#E8F1F5] hover:bg-[#D6E0E5] border border-[#1E5A7A]/30 rounded-xl text-left text-xs text-[#12304A] flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <strong className="text-[#12304A] block text-sm font-bold">
                    {isHindi ? 'नहीं - तरल पदार्थ पीने में सक्षम' : 'NO - Able to Drink Fluids'}
                  </strong>
                  <span className="text-[#657783]">
                    {isHindi ? 'बिना उल्टी के पानी या ओआरएस ले पा रहा है' : 'Tolerating water or ORS without emesis'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#657783] shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Diagnosis & Clinical Recommendation */}
        {step === 4 && (
          <div className="space-y-4">
            
            {/* CODE RED: HEAT STROKE */}
            {isCodeRed && (
              <div className="p-4 rounded-xl bg-[#F8E9E8] border-2 border-[#A63D40] space-y-3">
                <div className="flex items-center gap-2 text-[#A63D40] font-headline font-bold text-lg">
                  <ShieldAlert className="w-6 h-6" />
                  <span>{isHindi ? 'कोड रेड: संदिग्ध हीट स्ट्रोक (लू का गंभीर आघात)' : 'CODE RED: SUSPECTED HEAT STROKE'}</span>
                </div>
                <p className="text-xs text-[#8F3437] leading-relaxed">
                  <strong>{isHindi ? 'अत्यंत गंभीर आपातकाल:' : 'CRITICAL MEDICAL EMERGENCY:'}</strong>{' '}
                  {isHindi 
                    ? 'शरीर का मुख्य तापमान ४०°C से अधिक हो चुका है। न्यूरोलॉजिकल विकार या पसीना बंद होना। तत्काल चिकित्सा न मिलने पर बहु-अंग विफलता का खतरा!'
                    : 'Core body temperature is likely exceeding 40°C with neurological impairment or anhidrosis. High risk of irreversible brain injury and fatal multiorgan collapse!'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerSOS();
                    }}
                    className="w-full py-2.5 bg-[#A63D40] hover:bg-[#8F3437] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{isHindi ? '१०८ एम्बुलेंस को तत्काल कॉल करें' : 'CALL 108 AMBULANCE IMMEDIATELY'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* YELLOW: HEAT EXHAUSTION */}
            {isYellow && (
              <div className="p-4 rounded-xl bg-[#FFF4D6] border-2 border-[#C65D27] space-y-3">
                <div className="flex items-center gap-2 text-[#C65D27] font-headline font-bold text-base">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{isHindi ? 'येलो ट्राइएज: गंभीर ताप थकावट (हीट एग्जॉशन)' : 'YELLOW TRIAGE: SEVERE HEAT EXHAUSTION'}</span>
                </div>
                <p className="text-xs text-[#A54B1A] leading-relaxed">
                  {isHindi 
                    ? 'तरल की कमी व उल्टी के कारण मरीज के हीटस्ट्रोक में जाने का जोखिम है। तत्काल ठंडी छांव और पैरामेडिक जांच आवश्यक है।'
                    : 'Patient is at risk of decompensating into full heatstroke due to fluid depletion and vomiting. Needs immediate shaded air-cooling and paramedic fluid assessment.'}
                </p>
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToShelter();
                    }}
                    className="flex-1 py-2 bg-[#1E5A7A] hover:bg-[#164863] text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    {isHindi ? 'शीतलन केंद्र की दिशा देखें' : 'Navigate to Cooling Center'}
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerSOS();
                    }}
                    className="px-3 py-2 bg-[#A63D40] text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    {isHindi ? '१०८ कॉल' : 'SOS 108'}
                  </button>
                </div>
              </div>
            )}

            {/* GREEN: MILD HEAT STRESS */}
            {isGreen && (
              <div className="p-4 rounded-xl bg-[#E8F1F5] border-2 border-[#317A5A] space-y-3">
                <div className="flex items-center gap-2 text-[#317A5A] font-headline font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isHindi ? 'ग्रीन ट्राइएज: मामूली ताप तनाव' : 'GREEN TRIAGE: MILD HEAT STRAIN'}</span>
                </div>
                <p className="text-xs text-[#263746] leading-relaxed">
                  {isHindi 
                    ? 'शरीर के सुरक्षात्मक तंत्र ठीक हैं। सलाह: ५०० मिली ओआरएस घोल पिएं, हवादार छांव में ३० मिनट विश्राम करें और धूप में काम रोकें।'
                    : 'Vital thermoregulatory reflexes remain intact. Prescribed intervention: 500ml WHO-ORS solution, 30 minutes rest in ventilated shade, and cessation of strenuous outdoor activities.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToShelter();
                    }}
                    className="w-full py-2 bg-[#317A5A] hover:bg-[#286349] text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                  >
                    {isHindi ? 'निकटतम शीतल आश्रय खोजें' : 'Find Shaded Cooling Center'}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center text-xs font-mono">
              <button
                onClick={handleReset}
                className="text-[#657783] hover:text-[#12304A] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isHindi ? 'पुनः जांच शुरू करें' : 'Restart Triage'}</span>
              </button>
              <button
                onClick={onClose}
                className="text-[#1E5A7A] hover:underline font-semibold cursor-pointer"
              >
                {isHindi ? 'समाप्त' : 'Done'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

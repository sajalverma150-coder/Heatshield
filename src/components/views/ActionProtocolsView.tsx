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
  cityName = 'New Delhi',
  language = 'en',
}) => {
  const isHindi = language === 'hi';
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
    <div id="action-protocols-screen" className="space-y-6 pb-12 text-[#263746]">
      
      {/* Top Emergency Hotlines Strip */}
      <div className="bg-[#F8E9E8] p-4 sm:p-5 rounded-lg border border-[#A63D40] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white border border-[#A63D40] flex items-center justify-center text-[#A63D40] shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-headline font-bold text-[#12304A] flex items-center gap-2">
              {isHindi ? 'नागरिक आपातकालीन प्रतिक्रिया हेल्पलाइन' : 'Civic Emergency Response Hotlines'}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#A63D40] border border-[#A63D40] font-bold">
                {isHindi ? '२४/७ टोल-फ्री' : '24/7 TOLL-FREE'}
              </span>
            </h2>
            <p className="text-xs text-[#657783]">
              {isHindi 
                ? 'त्वरित चिकित्सा निकासी, आपदा प्रबंधन समन्वय एवं आपातकालीन पेयजल टैंकर मांग' 
                : 'Immediate medical evacuation, disaster management coordination, and potable water tanker requisition'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <a
            href="tel:108"
            className="px-3.5 py-1.5 rounded-md bg-[#A63D40] hover:bg-[#8F3437] text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isHindi ? '१०८ (एम्बुलेंस)' : '108 (Ambulance)'}</span>
          </a>
          <a
            href="tel:1070"
            className="px-3.5 py-1.5 rounded-md bg-white hover:bg-[#F4F1EA] text-[#12304A] border border-[#D6E0E5] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>{isHindi ? '१०७० (राज्य आपदा प्रकोष्ठ)' : '1070 (State Disaster Cell)'}</span>
          </a>
          <a
            href="tel:1800222026"
            className="px-3.5 py-1.5 rounded-md bg-white hover:bg-[#F4F1EA] text-[#1E5A7A] border border-[#1E5A7A] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>{isHindi ? '१८००-२२-२०२६ (पेयजल टैंकर)' : '1800-22-2026 (Water Bowsers)'}</span>
          </a>
        </div>
      </div>

      {/* Interactive Heat Exhaustion vs Heat Stroke Matrix */}
      <section id="first-aid-triage-matrix" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-headline font-bold text-[#12304A] flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-[#1E5A7A]" />
              {isHindi ? 'आपातकालीन हीट प्राथमिक उपचार एवं नैदानिक ट्राइएज मैट्रिक्स' : 'Emergency Heat First-Aid & Clinical Triage Matrix'}
            </h3>
            <p className="text-xs text-[#657783]">
              {isHindi 
                ? 'ताप थकावट (शीघ्र शीतलन आवश्यक) और हीट स्ट्रोक (कोड रेड जानलेवा आपातकाल) के बीच त्वरित अंतर समझें' 
                : 'Differentiate rapidly between Heat Exhaustion (urgent cooling) and Heat Stroke (Code Red life threat)'}
            </p>
          </div>

          {/* Quick symptom test triggers */}
          <div className="flex items-center gap-1.5 bg-[#F4F1EA] p-1 rounded-md border border-[#D6E0E5] text-xs font-mono">
            <span className="text-[11px] text-[#657783] px-1 hidden md:inline">
              {isHindi ? 'लक्षण जांच:' : 'Test Symptoms:'}
            </span>
            <button
              onClick={() => setHighlightCondition('stroke')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                highlightCondition === 'stroke' ? 'bg-[#A63D40] text-white font-bold' : 'text-[#657783] hover:text-[#12304A]'
              }`}
            >
              {isHindi ? 'गर्म व सूखी त्वचा' : 'Hot & Bone Dry Skin'}
            </button>
            <button
              onClick={() => setHighlightCondition('exhaustion')}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                highlightCondition === 'exhaustion' ? 'bg-[#B7791F] text-white font-bold' : 'text-[#657783] hover:text-[#12304A]'
              }`}
            >
              {isHindi ? 'अत्यधिक पसीना व पीलापन' : 'Profuse Sweating & Pale'}
            </button>
            <button
              onClick={() => setHighlightCondition('none')}
              className="p-1 text-[#657783] hover:text-[#12304A] cursor-pointer"
              title={isHindi ? 'रीसेट करें' : 'Reset test'}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Heat Exhaustion */}
          <div className={`p-5 rounded-lg border transition-all ${
            highlightCondition === 'exhaustion'
              ? 'bg-[#FFF4D6] border-[#B7791F] ring-2 ring-[#B7791F]/30 shadow-sm'
              : 'bg-white border-[#D6E0E5]'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#D6E0E5]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#B7791F]" />
                <h4 className="text-base font-headline font-bold text-[#B7791F]">
                  {isHindi ? 'ताप थकावट (शीघ्र उपचार आवश्यक)' : 'Heat Exhaustion (Urgent Care)'}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFF4D6] text-[#B7791F] border border-[#B7791F] font-bold">
                {isHindi ? 'आंतरिक ताप < ४०°C' : 'Core Temp < 40°C'}
              </span>
            </div>

            <div className="mt-3.5 space-y-3 text-xs leading-relaxed">
              <div>
                <strong className="text-[#12304A] block font-mono uppercase text-[11px] mb-1">
                  {isHindi ? 'प्रमुख लक्षण:' : 'Hallmark Symptoms:'}
                </strong>
                <ul className="space-y-1 text-[#263746] list-disc list-inside">
                  {isHindi ? (
                    <>
                      <li><strong>अत्यधिक पसीना आना</strong>, त्वचा ठंडी, पीली और चिपचिपी होना</li>
                      <li>तेज लेकिन कमजोर नाड़ी; खड़े होने पर चक्कर आना और बेहोशी का अहसास</li>
                      <li>मांसपेशियों में ऐंठन और पिंडलियों अथवा पेट में तेज दर्द</li>
                      <li>मतली, सिरदर्द, अत्यधिक कमजोरी और तीव्र प्यास</li>
                      <li><strong>मानसिक स्थिति सामान्य:</strong> रोगी पूरी तरह से होश में और जागरूक रहता है</li>
                    </>
                  ) : (
                    <>
                      <li><strong>Heavy, profuse sweating</strong> with cool, pale, clammy skin</li>
                      <li>Fast, weak pulse; dizziness and lightheadedness upon standing</li>
                      <li>Muscle spasms and cramps in calves or abdomen</li>
                      <li>Nausea, headache, persistent exhaustion and extreme thirst</li>
                      <li><strong>Mental state intact:</strong> Patient is fully oriented and coherent</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#D6E0E5]">
                <strong className="text-[#B7791F] block font-mono uppercase text-[11px] mb-1">
                  {isHindi ? 'तत्काल प्राथमिक उपचार प्रोटोकॉल:' : 'Immediate First-Aid Protocol:'}
                </strong>
                <ol className="space-y-1 text-[#263746] list-decimal list-inside">
                  {isHindi ? (
                    <>
                      <li>व्यक्ति को तुरंत छायादार, हवादार अथवा वातानुकूलित स्थान पर ले जाएं।</li>
                      <li>तंग कपड़ों को ढीला करें; पैरों को १५-२० सेमी ऊपर उठाएं।</li>
                      <li>ओआरएस या चुटकी भर नमक मिला ठंडा पानी घूंट-घूंट करके पिलाएं; बर्फ का पानी तेजी से न दें।</li>
                      <li>गर्दन, बगल और कमर के जोड़ों पर गीले ठंडे कपड़े की पट्टी रखें।</li>
                      <li>यदि उल्टी हो या ३० मिनट बाद भी आराम न मिले, तो तुरंत १०८ डायल करें।</li>
                    </>
                  ) : (
                    <>
                      <li>Move patient immediately to a shaded, ventilated, or air-cooled area.</li>
                      <li>Loosen tight clothing; elevate feet by 15-20 cm.</li>
                      <li>Sip cool water with ORS or a pinch of salt; do NOT gulp freezing water rapidly.</li>
                      <li>Apply cool wet cloths to the neck, armpits, and groin.</li>
                      <li>If vomiting occurs or symptoms persist after 30 mins, dial 108.</li>
                    </>
                  )}
                </ol>
              </div>
            </div>
          </div>

          {/* Card 2: Heat Stroke (CODE RED) */}
          <div className={`p-5 rounded-lg border transition-all ${
            highlightCondition === 'stroke'
              ? 'bg-[#F8E9E8] border-[#A63D40] ring-2 ring-[#A63D40]/30 shadow-sm'
              : 'bg-white border-[#D6E0E5]'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#D6E0E5]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#A63D40]" />
                <h4 className="text-base font-headline font-bold text-[#A63D40]">
                  {isHindi ? 'हीट स्ट्रोक (कोड रेड - अत्यंत गंभीर आपातकाल)' : 'Heat Stroke (CODE RED MEDICAL EMERGENCY)'}
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#A63D40] text-white font-bold">
                {isHindi ? 'आंतरिक ताप ≥ ४०°C (१०४°F)' : 'Core Temp ≥ 40°C (104°F)'}
              </span>
            </div>

            <div className="mt-3.5 space-y-3 text-xs leading-relaxed">
              <div>
                <strong className="text-[#A63D40] block font-mono uppercase text-[11px] mb-1">
                  {isHindi ? 'घातक चेतावनी लक्षण:' : 'Fatal Hallmark Symptoms:'}
                </strong>
                <ul className="space-y-1 text-[#263746] list-disc list-inside">
                  {isHindi ? (
                    <>
                      <li><strong className="text-[#A63D40]">त्वचा अत्यधिक गर्म, लाल और बिल्कुल सूखी</strong> (पसीना आना पूरी तरह बंद)</li>
                      <li>तेज, धड़कती हुई नाड़ी; तेज सिरदर्द और चक्कर आना</li>
                      <li><strong className="text-[#A63D40]">मानसिक भ्रम:</strong> लड़खड़ाती आवाज, प्रलाप, अजीब व्यवहार या बेहोशी</li>
                      <li>दौरे पड़ना, चलने में असमर्थता या कोमा की स्थिति</li>
                      <li>३० मिनट के भीतर बहु-अंग विफलता और मस्तिष्क सूजन का अत्यंत उच्च जोखिम</li>
                    </>
                  ) : (
                    <>
                      <li><strong className="text-[#A63D40]">Skin is hot, flushed, and BONE DRY</strong> (thermoregulatory sweat collapse)</li>
                      <li>Rapid, bounding pulse; throbbing severe headache</li>
                      <li><strong className="text-[#A63D40]">Altered mental state:</strong> Confusion, slurred speech, delirium, irrational behavior</li>
                      <li>Seizures, inability to walk, or loss of consciousness/coma</li>
                      <li>Critical risk of multiorgan failure and cerebral edema within 30 minutes</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#D6E0E5]">
                <strong className="text-[#A63D40] block font-mono uppercase text-[11px] mb-1">
                  {isHindi ? 'आपातकालीन पुनर्जीवन प्रोटोकॉल:' : 'Emergency Resuscitation Protocol:'}
                </strong>
                <ol className="space-y-1 text-[#263746] list-decimal list-inside">
                  {isHindi ? (
                    <>
                      <li><strong>तुरंत १०८ डायल करें</strong> - हाइपरथर्मिया रिसासिलेशन यूनिट मंगवाएं।</li>
                      <li><strong>आक्रामक बाह्य शीतलन:</strong> बर्फ-पानी के टब में रखें या गर्दन, बगल व कमर पर बर्फ की थैलियां लगाएं।</li>
                      <li>लगातार ठंडा पानी छिड़कें और तेजी से पंखा झलें।</li>
                      <li><strong>बेहोश या भ्रमित व्यक्ति को कभी पानी न पिलाएं</strong> (सांस नली में पानी जाने का खतरा)।</li>
                      <li>बेहोश सांस ले रहे मरीज को करवट की स्थिति (रिकवरी पोजीशन) में लिटाएं।</li>
                    </>
                  ) : (
                    <>
                      <li><strong>DIAL 108 IMMEDIATELY</strong> - Request Hyperthermia Resuscitation Unit.</li>
                      <li><strong>Aggressive External Cooling:</strong> Immerse in ice-water bath or apply ice packs to neck, axillae, and groin.</li>
                      <li>Douse continuously with cold water while fanning vigorously.</li>
                      <li><strong>NEVER force oral liquids</strong> if patient is confused or unconscious (aspiration risk).</li>
                      <li>Place unconscious breathing patient in lateral recovery position.</li>
                    </>
                  )}
                </ol>
              </div>

              <div className="pt-2">
                <button
                  onClick={onTriggerSOS}
                  className="w-full py-2.5 bg-[#A63D40] hover:bg-[#8F3437] text-white font-bold rounded-md text-xs tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isHindi ? 'तत्काल १०८ आपातकालीन एम्बुलेंस भेजें' : 'DISPATCH EMERGENCY 108 AMBULANCE NOW'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Scenario-Based Vulnerability Action Protocols (Tabs) */}
      <section id="scenario-vulnerability-protocols" className="bg-white rounded-lg border border-[#D6E0E5] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6E0E5] pb-3 mb-4">
          <div>
            <h3 className="text-base font-headline font-bold text-[#12304A] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1E5A7A]" />
              {isHindi ? 'परिदृश्य-आधारित कार्य प्रोटोकॉल व कार्य-विश्राम मानक' : 'Scenario-Based Action Protocols & Work-Rest Standards'}
            </h3>
            <p className="text-xs text-[#657783]">
              {isHindi ? 'एनडीएमए एवं विश्व स्वास्थ्य संगठन (WHO) ताप स्वास्थ्य दिशा-निर्देशों के अनुरूप' : 'Targeted protective measures aligned with NDMA & WHO Heat Health Guidelines'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#F4F1EA] p-1 rounded-md border border-[#D6E0E5] text-xs font-mono">
            <button
              onClick={() => setActiveScenarioTab('labor')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                activeScenarioTab === 'labor' ? 'bg-[#1E5A7A] text-white shadow-xs' : 'text-[#657783] hover:text-[#12304A]'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>{isHindi ? 'बाहरी श्रमिक' : 'Outdoor Labor'}</span>
            </button>
            <button
              onClick={() => setActiveScenarioTab('elderly')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                activeScenarioTab === 'elderly' ? 'bg-[#1E5A7A] text-white shadow-xs' : 'text-[#657783] hover:text-[#12304A]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isHindi ? 'बुजुर्ग व बीमार' : 'Elderly & Chronic'}</span>
            </button>
            <button
              onClick={() => setActiveScenarioTab('children')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                activeScenarioTab === 'children' ? 'bg-[#1E5A7A] text-white shadow-xs' : 'text-[#657783] hover:text-[#12304A]'
              }`}
            >
              <Baby className="w-3.5 h-3.5" />
              <span>{isHindi ? 'विद्यालय व बच्चे' : 'Schools & Children'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content: Labor */}
        {activeScenarioTab === 'labor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-4 rounded-lg overflow-hidden border border-[#D6E0E5] aspect-video sm:aspect-square bg-[#F4F1EA]">
              <img
                src={ASSET_IMAGES.laborWorker}
                alt="Construction Laborer Hydrating"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:col-span-8 space-y-3 text-xs text-[#263746]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-md bg-[#F4F1EA] border border-[#D6E0E5]">
                  <span className="text-[#657783] block">{isHindi ? 'विश्राम-कार्य अनुपात:' : 'Rest-to-Work Ratio:'}</span>
                  <span className="text-[#C65D27] font-bold text-sm">{isHindi ? '१५ मि विश्राम / ४५ मि कार्य' : '15m Rest / 45m Work'}</span>
                </div>
                <div className="p-2.5 rounded-md bg-[#F4F1EA] border border-[#D6E0E5]">
                  <span className="text-[#657783] block">{isHindi ? 'जलयोजन अंतराल:' : 'Hydration Interval:'}</span>
                  <span className="text-[#1E5A7A] font-bold text-sm">{isHindi ? 'हर २० मि में २५० मिली' : '250ml every 20 mins'}</span>
                </div>
                <div className="p-2.5 rounded-md bg-[#F4F1EA] border border-[#D6E0E5] col-span-2 sm:col-span-1">
                  <span className="text-[#657783] block">{isHindi ? 'चरम धूप कर्फ्यू:' : 'Peak Sun Curfew:'}</span>
                  <span className="text-[#A63D40] font-bold text-sm">{isHindi ? '११:३० – १६:३० IST' : '11:30 – 16:30 IST'}</span>
                </div>
              </div>

              <div className="space-y-1.5 leading-relaxed">
                {isHindi ? (
                  <>
                    <p><strong>पूर्व-जलयोजन प्रोटोकॉल:</strong> काम शुरू करने से ३० मिनट पहले ५०० मिली पानी पिएं। प्यास लगने का इंतजार न करें।</p>
                    <p><strong>इलेक्ट्रोलाइट अनुपूरण:</strong> अत्यधिक पसीने से प्रतिदिन २-४ ग्राम सोडियम बाहर निकल जाता है। कार्यस्थल पर प्रति १ लीटर पेयजल में एक ओआरएस पैकेट अवश्य मिलाएं।</p>
                    <p><strong>सुरक्षा वस्त्र अनुकूलन:</strong> ढीले, हल्के रंग के सूती कपड़े पहनें और हेलमेट के नीचे गर्दन को ढकने वाला सूती कपड़ा लगाएं। काले सिंथेटिक कपड़े न पहनें।</p>
                    <p><strong>दोहरी निगरानी प्रणाली:</strong> श्रमिकों को दो-दो की टोली में रखें ताकि एक-दूसरे में भ्रम, लड़खड़ाहट या पसीना बंद होने के लक्षणों की तुरंत पहचान हो सके।</p>
                  </>
                ) : (
                  <>
                    <p><strong>Pre-Hydration Protocol:</strong> Drink 500ml water 30 minutes before starting shift. Do not wait for thirst sensation.</p>
                    <p><strong>Electrolyte Supplementation:</strong> Heavy sweating leaches 2-4g sodium per day. Add one standard WHO-ORS sachet to every 1 liter of drinking water provided at site gates.</p>
                    <p><strong>PPE Adaptation:</strong> Wear light-colored, loose-weave cotton garments with long sleeves and wide cloth flaps under safety helmets. Avoid dark synthetic vests.</p>
                    <p><strong>Buddy System:</strong> Pair workers in teams of two to continuously monitor for signs of cognitive confusion, stumbling gait, or cessation of sweating.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Elderly */}
        {activeScenarioTab === 'elderly' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-4 rounded-lg overflow-hidden border border-[#D6E0E5] aspect-video sm:aspect-square bg-[#F4F1EA]">
              <img
                src={ASSET_IMAGES.elderlyCooling}
                alt="Elderly Individual in Cooling Refuge"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:col-span-8 space-y-3 text-xs text-[#263746]">
              <div className="p-3.5 rounded-lg bg-[#FFF4D6] border border-[#B7791F] text-[#263746]">
                <strong className="block text-sm font-headline text-[#12304A] mb-1">
                  {isHindi ? 'शारीरिक स्वास्थ्य चेतावनी: ३५°C से अधिक तापमान में पंखे का उपयोग' : 'PHYSIOLOGICAL ADVISORY: ELECTRIC FANS ABOVE 35°C'}
                </strong>
                {isHindi 
                  ? 'जब कमरे का तापमान ३५°C से अधिक हो जाता है, तो बिजली के पंखे शरीर पर गर्म हवा फेंकते हैं, जिससे पसीना वाष्पीकृत होने की तुलना में शरीर का आंतरिक तापमान और अधिक तेजी से बढ़ जाता है!'
                  : 'When indoor room temperature exceeds 35°C (95°F), electric fans blow heated air across the body faster than sweat can evaporate, creating a convective oven effect that actually raises core body temperature!'}
              </div>

              <div className="space-y-1.5 leading-relaxed">
                {isHindi ? (
                  <>
                    <p><strong>जल छिड़काव प्राथमिकता:</strong> पंखे की हवा के साथ शरीर पर ठंडे पानी का महीन स्प्रे करें या गीली सूती चादर ओढ़ें।</p>
                    <p><strong>हृदय एवं मूत्रवर्धक दवाओं की सतर्कता:</strong> बीटा-ब्लॉकर्स लू के दौरान हृदय गति बढ़ने से रोकते हैं, जिससे शॉक के लक्षण छिप जाते हैं। गर्मी में डॉक्टर से दवा की खुराक की समीक्षा करवाएं।</p>
                    <p><strong>दिन में दो बार कुशलक्षेम जांच:</strong> टिन या एस्बेस्टस की छत वाले कमरों में रहने वाले बुजुर्गों को दोपहर के समय वातानुकूलित सामुदायिक आश्रय स्थलों में स्थानांतरित करें।</p>
                  </>
                ) : (
                  <>
                    <p><strong>Water Misting Priority:</strong> Combine fan airflow with continuous cool water spray misting or a damp cotton sheet draped over the body.</p>
                    <p><strong>Cardiac & Diuretic Medication Alert:</strong> Beta-blockers blunt tachycardia during heat stress, masking clinical shock. Thiazide diuretics deplete potassium rapidly. Consult local dispensary for dose adjustments during heatwaves.</p>
                    <p><strong>Twice-Daily Check-ins:</strong> Older adults residing in top-floor tin-roof rooms should be relocated to community air-conditioned shelters during peak afternoon hours.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Children */}
        {activeScenarioTab === 'children' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-4 rounded-lg overflow-hidden border border-[#D6E0E5] aspect-video sm:aspect-square bg-[#F4F1EA]">
              <img
                src={ASSET_IMAGES.familyChild}
                alt="Mother and Child Heat Protection"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="lg:col-span-8 space-y-3 text-xs text-[#263746]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-md bg-[#F8E9E8] border border-[#A63D40]">
                  <span className="text-[#657783] block">{isHindi ? 'वाहन ताप चेतावनी:' : 'Vehicle Heat-Trap Warning:'}</span>
                  <span className="text-[#A63D40] font-bold">{isHindi ? 'बंद गाड़ी में बच्चे को कभी न छोड़ें' : 'Never leave child in locked auto or car'}</span>
                </div>
                <div className="p-2.5 rounded-md bg-[#FFF4D6] border border-[#B7791F]">
                  <span className="text-[#657783] block">{isHindi ? 'विद्यालय खेल नियम:' : 'School Outdoor Mandate:'}</span>
                  <span className="text-[#C65D27] font-bold">{isHindi ? 'WBGT > ३२°C पर खेलकूद बंद' : 'WBGT > 32°C Suspends Sports'}</span>
                </div>
              </div>

              <div className="space-y-1.5 leading-relaxed">
                {isHindi ? (
                  <>
                    <p><strong>उच्च सतह-से-द्रव्यमान अनुपात:</strong> बच्चों का शरीर वयस्कों की तुलना में अधिक तेजी से बाहरी गर्मी सोखता है और उनकी पसीने की ग्रंथियां अभी पूरी तरह विकसित नहीं होती हैं।</p>
                    <p><strong>निर्जलीकरण के चेतावनी संकेत:</strong> रोने पर आंसू न आना, सिर का तालू धंसा हुआ दिखना, सूखे होंठ और लगातार ६ घंटे तक पेशाब न करना।</p>
                    <p><strong>शिशु मार्गदर्शन:</strong> ६ माह से कम उम्र के शिशुओं को सादा पानी न दें; उन्हें संतुलित जलयोजन के लिए अधिक बार स्तनपान कराएं।</p>
                  </>
                ) : (
                  <>
                    <p><strong>Higher Surface-to-Mass Ratio:</strong> Children absorb environmental heat faster and have underdeveloped sweat glands compared to adults.</p>
                    <p><strong>Dehydration Warning Signs:</strong> Absence of tears when crying, sunken fontanelle (soft spot), dry lips, and no wet diaper for over 6 consecutive hours.</p>
                    <p><strong>Infant Guidance:</strong> Infants under 6 months do not require plain water. Instead, breastfeed more frequently to provide balanced hydration and maternal electrolytes.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Interactive Hydration Science Calculator & WHO ORS Field Recipe */}
      <section id="hydration-science-calculator" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left (7 Cols): Dynamic Fluid Loss Calculator */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#D6E0E5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-[#D6E0E5] pb-2">
            <h3 className="text-base font-headline font-bold text-[#12304A] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#1E5A7A]" />
              {isHindi ? 'गतिशील चयापचय पसीना दर एवं जल आवश्यकता कैलकुलेटर' : 'Dynamic Metabolic Sweat Rate Calculator'}
            </h3>
            <span className="text-[10px] font-mono text-[#1E5A7A] bg-[#E8F1F5] px-2 py-0.5 rounded border border-[#D6E0E5]">
              {isHindi ? 'क्लीनिकल सूत्र' : 'CLINICAL FORMULA'}
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Weight Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-[#657783]">{isHindi ? 'शरीर का वजन:' : 'Body Weight:'}</span>
                <span className="text-[#12304A] font-bold text-sm">{bodyWeightKg} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="110"
                value={bodyWeightKg}
                onChange={(e) => setBodyWeightKg(Number(e.target.value))}
                className="w-full accent-[#1E5A7A] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#657783] font-mono">
                <span>40 kg</span>
                <span>75 kg</span>
                <span>110 kg</span>
              </div>
            </div>

            {/* Exertion Level Radio */}
            <div>
              <span className="text-xs text-[#657783] block mb-1.5 font-mono">
                {isHindi ? 'शारीरिक श्रम स्तर:' : 'Occupational Physical Exertion:'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setExertionLevel('light')}
                  className={`p-2 rounded-md text-center border transition-colors text-xs font-mono cursor-pointer ${
                    exertionLevel === 'light'
                      ? 'bg-[#E8F1F5] border-[#1E5A7A] text-[#1E5A7A] font-bold'
                      : 'bg-white border-[#D6E0E5] text-[#657783] hover:text-[#12304A]'
                  }`}
                >
                  {isHindi ? 'हल्का / छाया' : 'Light / Shaded'}
                  <span className="text-[10px] block opacity-75">~350 ml/h</span>
                </button>
                <button
                  onClick={() => setExertionLevel('moderate')}
                  className={`p-2 rounded-md text-center border transition-colors text-xs font-mono cursor-pointer ${
                    exertionLevel === 'moderate'
                      ? 'bg-[#E8F1F5] border-[#1E5A7A] text-[#1E5A7A] font-bold'
                      : 'bg-white border-[#D6E0E5] text-[#657783] hover:text-[#12304A]'
                  }`}
                >
                  {isHindi ? 'मध्यम चलना' : 'Moderate Walk'}
                  <span className="text-[10px] block opacity-75">~650 ml/h</span>
                </button>
                <button
                  onClick={() => setExertionLevel('heavy')}
                  className={`p-2 rounded-md text-center border transition-colors text-xs font-mono cursor-pointer ${
                    exertionLevel === 'heavy'
                      ? 'bg-[#E8F1F5] border-[#1E5A7A] text-[#1E5A7A] font-bold'
                      : 'bg-white border-[#D6E0E5] text-[#657783] hover:text-[#12304A]'
                  }`}
                >
                  {isHindi ? 'भारी शारीरिक श्रम' : 'Heavy Labor'}
                  <span className="text-[10px] block opacity-75">~950 ml/h</span>
                </button>
              </div>
            </div>

            {/* Calculated Output Box */}
            <div className="p-3.5 rounded-md bg-[#F4F1EA] border border-[#D6E0E5] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono text-[#657783] uppercase">
                  {isHindi ? 'प्रति घंटा आवश्यक तरल सेवन:' : 'Required Hourly Fluid Intake:'}
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-[#12304A]">
                  {calculatedHourlyMl} <span className="text-xs font-normal text-[#657783]">{isHindi ? 'मिली / घंटा' : 'ml / hour'}</span>
                </div>
              </div>
              <div className="text-right text-xs font-mono">
                <span className="text-[#657783] block">{isHindi ? 'पीने का अंतराल:' : 'Drink Cadence:'}</span>
                <span className="text-[#1E5A7A] font-bold">
                  {isHindi ? `~${Math.round(calculatedHourlyMl / 3)} मिली हर २० मिनट में` : `~${Math.round(calculatedHourlyMl / 3)} ml every 20m`}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right (5 Cols): WHO-ORS Field Emergency Recipe */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-[#D6E0E5] p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-[#D6E0E5] pb-2">
              <h3 className="text-base font-headline font-bold text-[#12304A] flex items-center gap-2">
                <Droplet className="w-4 h-4 text-[#2F7F82]" />
                {isHindi ? 'विश्व स्वास्थ्य संगठन (WHO) ओआरएस आपातकालीन घोल विधि' : 'WHO-ORS Emergency Field Recipe'}
              </h3>
              <span className="text-[10px] font-mono text-[#317A5A] bg-[#E8F1F5] px-2 py-0.5 rounded border border-[#D6E0E5] font-semibold">
                {isHindi ? 'मानक' : 'STANDARD'}
              </span>
            </div>

            <p className="text-xs text-[#657783] mb-3">
              {isHindi 
                ? 'यदि बना-बनाया ओआरएस पैकेट उपलब्ध न हो, तो घर पर यह प्रमाणित जीवनरक्षक घोल तैयार करें:' 
                : 'If commercial sachets are unavailable, prepare this verified physiological rehydration solution:'}
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-md bg-[#F4F1EA] border border-[#D6E0E5] flex items-center justify-between">
                <span className="text-[#263746]">{isHindi ? '१. स्वच्छ उबला या छना हुआ पानी' : '1. Clean Boiled/Filtered Water'}</span>
                <span className="text-[#12304A] font-bold">{isHindi ? '१.० लीटर' : '1.0 Liter'}</span>
              </div>
              <div className="p-2.5 rounded-md bg-[#F4F1EA] border border-[#D6E0E5] flex items-center justify-between">
                <span className="text-[#263746]">{isHindi ? '२. साफ चीनी अथवा गुड़' : '2. Clean Sugar / Jaggery'}</span>
                <span className="text-[#12304A] font-bold">{isHindi ? '६ समतल चम्मच' : '6 Level Teaspoons'}</span>
              </div>
              <div className="p-2.5 rounded-md bg-[#F4F1EA] border border-[#D6E0E5] flex items-center justify-between">
                <span className="text-[#263746]">{isHindi ? '३. साधारण खाने का नमक' : '3. Common Salt (NaCl)'}</span>
                <span className="text-[#12304A] font-bold">{isHindi ? '१/२ समतल चम्मच' : '1/2 Level Teaspoon'}</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-[#263746] leading-relaxed bg-[#E8F1F5] p-2.5 rounded-md border border-[#D6E0E5]">
              💡 <em>{isHindi ? 'स्वाद की जांच:' : 'Tasting standard:'}</em> {isHindi ? 'तैयार घोल का स्वाद आंसुओं से अधिक नमकीन नहीं होना चाहिए।' : 'The prepared solution should taste no saltier than human tears.'}
            </div>
          </div>

          <div className="pt-3 border-t border-[#D6E0E5] mt-3 flex items-center justify-between">
            <span className="text-xs text-[#657783]">{isHindi ? 'नैदानिक लक्षण जांच:' : 'Clinical Symptom Check:'}</span>
            <button
              onClick={onOpenTriage}
              className="text-xs font-semibold text-[#1E5A7A] hover:text-[#12304A] flex items-center gap-1 cursor-pointer"
            >
              <span>{isHindi ? 'लक्षण जांच (ट्राइएज) शुरू करें' : 'Run Triage Assessment'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  HeartPulse, 
  AlertOctagon,
  Radio
} from 'lucide-react';
import { UserHealthProfile, LanguageCode } from '../../types';

interface EmergencyCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserHealthProfile;
  language?: LanguageCode;
}

export const EmergencyCallModal: React.FC<EmergencyCallModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  language = 'en',
}) => {
  const [etaSeconds, setEtaSeconds] = useState<number>(348); // 5 mins 48 secs
  const [isTransmitted, setIsTransmitted] = useState<boolean>(true);
  const isHindi = language === 'hi';

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEtaSeconds((prev) => (prev > 10 ? prev - 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatEta = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#12304A]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border-2 border-[#A63D40] rounded-2xl max-w-md w-full p-5 sm:p-6 text-center shadow-xl relative overflow-hidden text-[#263746]">
        
        {/* Siren Badge */}
        <div className="w-16 h-16 rounded-full bg-[#F8E9E8] border-2 border-[#A63D40] mx-auto flex items-center justify-center text-[#A63D40] mb-3">
          <PhoneCall className="w-7 h-7" />
        </div>

        <div className="inline-block px-3 py-1 rounded bg-[#F8E9E8] border border-[#A63D40] text-[#A63D40] text-xs font-mono font-bold uppercase tracking-wider mb-2">
          {isHindi ? 'कोड रेड १०८ एम्बुलेंस प्रेषित' : 'CODE RED 108 DISPATCHED'}
        </div>

        <h2 className="text-xl sm:text-2xl font-headline font-bold text-[#12304A]">
          {isHindi ? 'हीट स्ट्रोक आपातकालीन इकाई मार्ग में है' : 'Heat Stroke Emergency Unit En Route'}
        </h2>
        <p className="text-xs text-[#657783] mt-1">
          {isHindi 
            ? 'लोकमान्य तिलक सायन अस्पताल हाइपरथर्मिया ट्रॉमा सेंटर'
            : 'Lokmanya Tilak Sion Hospital Hyperthermia Trauma Unit'}
        </p>

        {/* Live ETA Card */}
        <div className="mt-4 p-4 rounded-xl bg-[#E8F1F5] border border-[#D6E0E5] space-y-1.5">
          <div className="text-xs font-mono text-[#657783] font-semibold">
            {isHindi ? 'अनुमानित आगमन समय' : 'ESTIMATED ARRIVAL TIME'}
          </div>
          <div className="text-4xl font-headline font-bold text-[#C65D27] tracking-tight">
            {formatEta(etaSeconds)}
          </div>
          <div className="text-xs font-mono text-[#317A5A] flex items-center justify-center gap-1.5 font-semibold">
            <Radio className="w-3.5 h-3.5" />
            <span>{isHindi ? 'यूनिट #MH-01-4491 (बर्फ-स्नान सुसज्जित)' : 'Unit #MH-01-4491 (Ice-Bath Equipped)'}</span>
          </div>
        </div>

        {/* Live GPS Coordinates Transmitted */}
        <div className="mt-3 p-3 rounded-xl bg-[#F4F1EA] border border-[#D6E0E5] text-left text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-[#263746]">
            <span className="flex items-center gap-1 text-[#657783]">
              <MapPin className="w-3.5 h-3.5 text-[#A63D40]" /> {isHindi ? 'जीपीएस लॉक:' : 'GPS Locked:'}
            </span>
            <span className="text-[#12304A] font-bold">19.0435° N, 72.8532° E</span>
          </div>
          <div className="flex items-center justify-between text-[#263746]">
            <span className="text-[#657783]">{isHindi ? 'स्थान:' : 'Location:'}</span>
            <span className="text-[#12304A] truncate">
              {isHindi ? 'धारावी ९० फीट रोड / लेबर कैंप' : 'Dharavi 90ft Rd / Labour Camp'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#263746]">
            <span className="text-[#657783]">{isHindi ? 'मरीज:' : 'Patient:'}</span>
            <span className="text-[#12304A] font-bold">
              {userProfile.name} ({isHindi ? `आयु ${userProfile.age}` : `Age ${userProfile.age}`})
            </span>
          </div>
          <div className="flex items-center justify-between text-[#317A5A] pt-1.5 border-t border-[#D6E0E5] font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {isHindi ? 'आपातकालीन एसएमएस प्रेषित:' : 'ICE SMS Dispatched:'}
            </span>
            <span>{userProfile.iceContact.name}</span>
          </div>
        </div>

        {/* Immediate Survival Instructions */}
        <div className="mt-4 text-xs text-left bg-[#F8E9E8] border border-[#A63D40]/30 p-3 rounded-xl text-[#A63D40] leading-relaxed">
          <strong className="block font-headline font-bold text-[#A63D40] mb-1">
            {isHindi ? 'एम्बुलेंस के आने तक महत्वपूर्ण प्राथमिक चिकित्सा:' : 'CRITICAL FIRST-AID WHILE AMBULANCE TRAVELS:'}
          </strong>
          {isHindi ? (
            <>
              १. मरीज को तत्काल छांव या वातानुकूलित स्थान में ले जाएं।<br />
              २. शरीर पर ठंडा पानी छिड़कें व तेजी से पंखा चलाएं।<br />
              ३. यदि मरीज बेहोश हो या उल्टी कर रहा हो तो पानी न पिलाएं।<br />
              ४. गर्दन, बगल और जांघों पर ठंडी बर्फ की थैलियां रखें।
            </>
          ) : (
            <>
              1. Move patient immediately into shade or AC refuge.<br />
              2. Douse body with cold water and fan vigorously.<br />
              3. Do NOT give water if patient is confused or vomiting.<br />
              4. Place ice packs on neck, underarms, and groin.
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#E8F1F5] hover:bg-[#D6E0E5] border border-[#1E5A7A]/30 text-[#12304A] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {isHindi ? 'खिड़की न्यूनतम करें' : 'Minimize Tracking Window'}
          </button>
          <a
            href="tel:108"
            className="px-4 py-2.5 bg-[#A63D40] hover:bg-[#8F3437] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{isHindi ? '१०८ पुनः डायल करें' : 'Redial 108'}</span>
          </a>
        </div>

      </div>
    </div>
  );
};

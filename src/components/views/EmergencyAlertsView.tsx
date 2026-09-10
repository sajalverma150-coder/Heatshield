import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  BellRing, 
  Send, 
  Volume2, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  MessageSquare, 
  Radio, 
  ShieldAlert, 
  FileText,
  Copy,
  Sparkles,
  Thermometer,
  ShieldCheck
} from 'lucide-react';
import { EmergencyBroadcast, LanguageCode, WeatherTelemetry } from '../../types';
import { ACTIVE_EMERGENCY_BROADCAST } from '../../data/mockData';
import { CityData } from '../../data/indiaCities';
import { useAppTranslation } from '../../i18n/translations';

interface EmergencyAlertsViewProps {
  language: LanguageCode;
  selectedCity?: CityData;
  weather?: WeatherTelemetry;
  onOpenCitySelector?: () => void;
  onTriggerSOS: () => void;
}

export const EmergencyAlertsView: React.FC<EmergencyAlertsViewProps> = ({
  language,
  selectedCity,
  weather,
  onOpenCitySelector,
  onTriggerSOS,
}) => {
  const t = useAppTranslation(language);
  const isHindi = language === 'hi';
  const cityName = selectedCity?.name || 'New Delhi';

  // Live or fallback telemetry values
  const currentTemp = weather?.dryBulbTemp ?? selectedCity?.weather.dryBulbTemp ?? 38.5;
  const heatIndex = typeof weather?.heatIndex === 'number' && !isNaN(weather.heatIndex) 
    ? weather.heatIndex 
    : selectedCity?.weather.heatIndex ?? 41.2;
  const wbgt = weather?.wbgt ?? selectedCity?.weather.wbgt ?? 31.5;
  const riskLevel = weather?.riskLevel ?? selectedCity?.weather.riskLevel ?? 'HIGH';

  // Dynamically generated OBD Voice Broadcast content based on live weather, temperatures, and safety measures
  const dynamicObdContent = useMemo(() => {
    const isExtreme = currentTemp >= 40 || wbgt >= 32.5 || heatIndex >= 44 || riskLevel === 'EXTREME';
    const isModerate = currentTemp >= 33 || wbgt >= 28.5 || heatIndex >= 36 || riskLevel === 'HIGH' || riskLevel === 'VERY_HIGH';

    if (isExtreme) {
      return {
        severity: 'critical' as const,
        badgeLabelEn: 'CRITICAL HEATWAVE CURFEW BROADCAST',
        badgeLabelHi: 'अत्यधिक लू व कर्फ्यू आपातकालीन बुलेटिन',
        durationSec: 52,
        messageEn: `Attention citizens of ${cityName}. This is an urgent heatwave health broadcast from the Disaster Management Authority. The current air temperature has reached ${currentTemp.toFixed(1)} degrees Celsius, with a dangerous heat index of ${heatIndex.toFixed(1)} degrees Celsius. A critical heat alert is in effect. Extreme caution is advised. Outdoor physical labor and direct sun exposure must be strictly avoided between 11:30 AM and 4:30 PM under local disaster management directives. Drink plenty of clean water and take ORS rehydration solution every 20 minutes to prevent heat stroke. Children, elderly individuals, and outdoor workers must stay indoors in cool, shaded, or air-conditioned spaces. If you experience dizziness, headache, high body temperature, or lack of sweating, visit the nearest government cooling center immediately. For emergency ambulance assistance, dial 108 without delay.`,
        messageHi: `${cityName} के सभी सम्मानित नागरिकों के लिए आपदा प्रबंधन प्राधिकरण द्वारा तत्काल आवश्यक मौसम व स्वास्थ्य बुलेटिन। वर्तमान परिवेश तापमान ${currentTemp.toFixed(1)} डिग्री सेल्सियस दर्ज किया गया है और अनुभूत हीट इंडेक्स ${heatIndex.toFixed(1)} डिग्री सेल्सियस के अत्यंत खतरनाक स्तर पर पहुंच चुका है। शहर में गंभीर लू और हीटवेव का रेड अलर्ट लागू है। दोपहर 11:30 से शाम 4:30 बजे के बीच तेज धूप में शारीरिक श्रम करने और बाहर निकलने से सख्त परहेज करें। शरीर में पानी और लवण की कमी न होने दें; हर 20 मिनट में स्वच्छ जल और ओआरएस का घोल अवश्य पिएं। बच्चों, बुजुर्गों और अस्वस्थ नागरिकों को शीतल व छायादार स्थानों पर रखें। यदि चक्कर, अत्यधिक कमजोरी, तेज सिरदर्द या बेहोशी के लक्षण हों, तो तुरंत नजदीकी सरकारी शीत राहत केंद्र या अस्पताल जाएं। आपातकालीन एम्बुलेंस सहायता के लिए तुरंत 108 नंबर पर कॉल करें।`,
      };
    }

    if (isModerate) {
      return {
        severity: 'advisory' as const,
        badgeLabelEn: 'MODERATE HEAT ADVISORY BROADCAST',
        badgeLabelHi: 'मध्यम गर्मी एहतियाती व स्वास्थ्य बुलेटिन',
        durationSec: 42,
        messageEn: `Weather advisory for ${cityName}. The current air temperature is ${currentTemp.toFixed(1)} degrees Celsius, with a heat index of ${heatIndex.toFixed(1)} degrees Celsius. A moderate heat warning is active today. Please take essential precautions: maintain steady hydration by drinking water and electrolyte fluids frequently throughout the day. Avoid strenuous physical exertion during peak afternoon hours, wear light loose cotton clothing, and rest in shaded areas. Pay special attention to the hydration of children and senior citizens. Municipal drinking water kiosks and designated cooling shelters are open for public use. Stay safe and keep hydrated.`,
        messageHi: `${cityName} के लिए मौसम परामर्श। वर्तमान तापमान ${currentTemp.toFixed(1)} डिग्री सेल्सियस है और हीट इंडेक्स ${heatIndex.toFixed(1)} डिग्री सेल्सियस है। शहर में मध्यम गर्मी का येलो अलर्ट सक्रिय है। कृपया आवश्यक सावधानी बरतें: दिनभर नियमित रूप से पानी, नींबू पानी और छाछ पीते रहें। दोपहर के समय भारी शारीरिक मेहनत से बचें, हल्के ढीले सूती कपड़े पहनें और धूप में निकलने पर सिर ढककर रखें। घर के बुजुर्गों और बच्चों के जलयोजन का विशेष ध्यान रखें। नगर में पेयजल कियोस्क और शीत राहत केंद्र कार्यरत हैं। सुरक्षित रहें और स्वस्थ रहें।`,
      };
    }

    // Normal / Safe weather condition
    return {
      severity: 'safe' as const,
      badgeLabelEn: 'NORMAL WEATHER BULLETIN • NO HEAT HAZARD',
      badgeLabelHi: 'सामान्य मौसम बुलेटिन • चिंता की कोई बात नहीं',
      durationSec: 36,
      messageEn: `Weather bulletin for ${cityName}. The current air temperature is ${currentTemp.toFixed(1)} degrees Celsius, with a comfortable heat index of ${heatIndex.toFixed(1)} degrees Celsius. Meteorological conditions are currently safe and well within normal seasonal limits. There is no active heatwave danger, and there is nothing to worry about. Citizens may comfortably carry out their daily indoor and outdoor activities. Remember to maintain normal daily hydration of 2.5 to 3 liters of water to stay energetic. Have a safe, healthy, and pleasant day.`,
      messageHi: `${cityName} के लिए मौसम बुलेटिन। वर्तमान वायु तापमान ${currentTemp.toFixed(1)} डिग्री सेल्सियस है और हीट इंडेक्स ${heatIndex.toFixed(1)} डिग्री सेल्सियस है। मौसम की स्थिति पूरी तरह से सुरक्षित और सामान्य मौसमी सीमा के भीतर है। इस समय किसी भी प्रकार की भीषण लू या हीटवेव का कोई खतरा नहीं है, और किसी भी नागरिक को चिंता करने की बिल्कुल आवश्यकता नहीं है। आप अपनी सामान्य दैनिक गतिविधियां बिना किसी रुकावट के जारी रख सकते हैं। दिनभर में ढाई से तीन लीटर पानी पीकर शरीर को ऊर्जावान बनाए रखें। आपका दिन शुभ, सुरक्षित और सुखद रहे।`,
    };
  }, [currentTemp, heatIndex, wbgt, riskLevel, cityName]);

  const [broadcast, setBroadcast] = useState<EmergencyBroadcast>(() => {
    const baseAlert = selectedCity?.alert || ACTIVE_EMERGENCY_BROADCAST;
    return {
      ...baseAlert,
      targetDevices: baseAlert.targetDevices ?? Math.round((baseAlert.smsDelivered ?? 280000) * 1.8),
      smsDelivered: baseAlert.smsDelivered ?? 284190,
      whatsappDelivered: baseAlert.whatsappDelivered ?? 198420,
      audioObdDialed: baseAlert.audioObdDialed ?? 142000,
      messageEn: dynamicObdContent.messageEn,
      messageHi: dynamicObdContent.messageHi,
    };
  });

  // Sync broadcast with dynamic content and city change
  useEffect(() => {
    const baseAlert = selectedCity?.alert || ACTIVE_EMERGENCY_BROADCAST;
    setBroadcast(prev => ({
      ...baseAlert,
      ...prev,
      targetDevices: baseAlert.targetDevices ?? prev.targetDevices ?? Math.round((baseAlert.smsDelivered ?? 280000) * 1.8),
      messageEn: dynamicObdContent.messageEn,
      messageHi: dynamicObdContent.messageHi,
    }));
  }, [selectedCity, dynamicObdContent]);

  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [activeTemplate, setActiveTemplate] = useState<'curfew' | 'water' | 'shelter' | 'live'>('live');
  
  // Dispatch console states
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [transmitSuccess, setTransmitSuccess] = useState<boolean>(false);
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  // Audio OBD player state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [activeVoiceLanguage, setActiveVoiceLanguage] = useState<LanguageCode>(language);
  const audioIntervalRef = useRef<any>(null);

  // Synchronize audio voice language when app language switches
  useEffect(() => {
    setActiveVoiceLanguage(language);
  }, [language]);

  const handleSelectTemplate = (templateKey: 'curfew' | 'water' | 'shelter' | 'live') => {
    setActiveTemplate(templateKey);
    if (templateKey === 'live') {
      setBroadcast(prev => ({
        ...prev,
        messageEn: dynamicObdContent.messageEn,
        messageHi: dynamicObdContent.messageHi,
      }));
    } else if (templateKey === 'curfew') {
      setBroadcast(prev => ({
        ...prev,
        messageEn: `CRITICAL HEALTH ALERT for ${cityName}: WBGT has reached ${wbgt.toFixed(1)}°C (Temp: ${currentTemp.toFixed(1)}°C). Immediate curfew on outdoor physical work 12:00-16:00. Hydrate with ORS every 20 mins. Move to nearest designated cooling center. Ambulance: Call 108.`,
        messageHi: `${cityName} अत्यधिक आपातकालीन चेतावनी: हीट स्ट्रेस ${wbgt.toFixed(1)}°C (तापमान ${currentTemp.toFixed(1)}°C)। आपदा प्रबंधन अधिनियम के तहत दोपहर 12:00 से 16:00 बजे तक खुले में शारीरिक श्रम प्रतिबंधित। हर 20 मिनट में ओआरएस या पानी पिएं। निकटतम शीत राहत केंद्र में जाएं। एम्बुलेंस: 108 पर कॉल करें।`,
      }));
    } else if (templateKey === 'water') {
      setBroadcast(prev => ({
        ...prev,
        messageEn: `MUNICIPAL WATER DISPATCH in ${cityName}: Emergency chilled potable water bowsers deployed to vulnerable transit points. Free hydration kiosks operational 24x7. Call 1916 for water tanker refill.`,
        messageHi: `${cityName} आपातकालीन जल आपूर्ति: संवेदनशील क्षेत्रों और चौराहों पर शीतल पेयजल टैंकर तैनात कर दिए गए हैं। सभी नगरपालिका आश्रय स्थलों पर 24 घंटे निःशुल्क जल कियोस्क चालू हैं। टैंकर सहायता के लिए 1916 पर कॉल करें।`,
      }));
    } else if (templateKey === 'shelter') {
      setBroadcast(prev => ({
        ...prev,
        messageEn: `COOLING SHELTER ACTIVATION in ${cityName}: High-capacity air-cooled emergency relief shelters are open with paramedic teams, IV saline rehydration, and surge cooling beds. Free admission for all citizens, gig workers, and seniors.`,
        messageHi: `${cityName} शीत राहत केंद्र सक्रिय: वातानुकूलित आपातकालीन राहत केंद्र चिकित्सा दलों, आईवी सेलाइन पुनर्जलीकरण और इमरजेंसी कूलिंग बेड के साथ खोल दिए गए हैं। सभी नागरिकों, गिग श्रमिकों और वरिष्ठ नागरिकों के लिए निःशुल्क प्रवेश।`,
      }));
    }
  };

  // Audio OBD simulation and browser speech synthesis in English and Hindi
  const handleToggleAudio = (forcedLang?: LanguageCode) => {
    const speechLang = forcedLang || activeVoiceLanguage;

    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    setIsPlayingAudio(true);
    setAudioProgress(0);

    // Web Speech API synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const speechText = speechLang === 'hi' ? broadcast.messageHi : broadcast.messageEn;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = speechLang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = speechLang === 'hi' ? 0.92 : 0.95;

      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          if (speechLang === 'hi') {
            const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
            if (hiVoice) utterance.voice = hiVoice;
          } else {
            const enVoice = voices.find(v => v.lang === 'en-IN' || v.lang.startsWith('en'));
            if (enVoice) utterance.voice = enVoice;
          }
        }
      } catch {
        // Fallback to default browser synthesizer
      }

      utterance.onend = () => {
        setIsPlayingAudio(false);
        setAudioProgress(100);
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
        if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      };

      window.speechSynthesis.speak(utterance);
    }

    const duration = dynamicObdContent.durationSec || 45;
    const increment = 100 / duration;

    audioIntervalRef.current = setInterval(() => {
      setAudioProgress((prev) => {
        if (prev >= 100) {
          clearInterval(audioIntervalRef.current);
          setIsPlayingAudio(false);
          return 100;
        }
        return prev + increment;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleTransmit = () => {
    setIsTransmitting(true);
    setTransmitSuccess(false);

    setTimeout(() => {
      setIsTransmitting(false);
      setTransmitSuccess(true);
      setBroadcast(prev => ({
        ...prev,
        deliveredTotal: prev.deliveredTotal + 27100,
        smsDelivered: prev.smsDelivered + 22400,
        whatsappDelivered: prev.whatsappDelivered + 3200,
        audioObdDialed: prev.audioObdDialed + 1500,
      }));
      setTimeout(() => setTransmitSuccess(false), 5000);
    }, 2000);
  };

  const handleCopy = (text: string, langKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(langKey);
    setTimeout(() => setCopiedLang(null), 2500);
  };

  return (
    <div id="emergency-alerts-view" className="space-y-4 pb-8">
      
      {/* Top Banner: Emergency Broadcasting Status */}
      <section id="emergency-broadcast-status-banner" className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-headline font-bold text-white">
                  {isHindi ? 'राष्ट्रीय आपदा प्रबंधन (NDMA) मास ब्रॉडकास्ट सिस्टम' : 'NDMA Mass Emergency Broadcast Center'}
                </h2>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
                  dynamicObdContent.severity === 'critical'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                    : dynamicObdContent.severity === 'advisory'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isHindi ? dynamicObdContent.badgeLabelHi : dynamicObdContent.badgeLabelEn}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {cityName} • {isHindi ? 'वर्तमान तापमान:' : 'Current Temp:'} <strong className="text-white">{currentTemp.toFixed(1)}°C</strong> • {isHindi ? 'हीट इंडेक्स:' : 'Heat Index:'} <strong className="text-orange-400">{heatIndex.toFixed(1)}°C</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCitySelector && (
              <button
                onClick={onOpenCitySelector}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{cityName}</span>
                <span className="text-orange-400">({currentTemp.toFixed(1)}°C)</span>
              </button>
            )}

            <button
              onClick={onTriggerSOS}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{isHindi ? '108 आपातकालीन कॉल' : 'DIAL 108 SOS'}</span>
            </button>
          </div>
        </div>

        {/* Live Delivery Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Radio className="w-4 h-4 text-orange-400" />
              <span>{isHindi ? 'सेल्युलर उपकरण लक्षित:' : 'Target Devices:'}</span>
            </div>
            <span className="text-white font-bold">
              {(broadcast.targetDevices ?? Math.round(((broadcast.smsDelivered ?? 280000) * 1.8))).toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>{isHindi ? 'एसएमएस वितरित:' : 'SMS Dispatched:'}</span>
            </div>
            <span className="text-white font-bold">{(broadcast.smsDelivered ?? 0).toLocaleString()}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>{isHindi ? 'व्हाट्सएप एपीआई:' : 'WhatsApp Cloud API:'}</span>
            </div>
            <span className="text-white font-bold">{(broadcast.whatsappDelivered ?? 0).toLocaleString()}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Volume2 className="w-4 h-4 text-orange-400" />
              <span>{isHindi ? 'आईवीआर वॉयस कॉल:' : 'IVR Voice OBD Calls:'}</span>
            </div>
            <span className="text-white font-bold">{(broadcast.audioObdDialed ?? 0).toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* 2. Automated Outbound Dialing (OBD) Audio Broadcast Engine (FULL VOICE IN ENGLISH & HINDI) */}
      <section id="audio-obd-ivr-console" className="bg-slate-900/90 rounded-2xl border border-orange-500/30 p-4 sm:p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-headline font-bold text-white">
                  {isHindi ? 'स्वचालित आउटबाउंड डायलिंग (OBD) ऑडियो वॉयस इंजन' : 'Automated Outbound Dialing (OBD) Audio Broadcast Engine'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold">
                  {isHindi ? 'मौसम के अनुसार गतिशील वॉयस' : 'WEATHER-DYNAMIC VOICE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHindi 
                  ? 'मौसम, तापमान और सुरक्षा उपायों के अनुसार स्वतः उत्पन्न पूर्ण वॉयस प्रसारण (हिन्दी व अंग्रेज़ी में उपलब्ध)'
                  : 'Synthesizes full voice prompts tailored dynamically to current temperature, heat index, and safety directives'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
              {isHindi ? '● एसआईपी ट्रंक (3,000 चैनल)' : '● SIP TRUNK (3,000 CHANNELS)'}
            </span>
          </div>
        </div>

        {/* Dynamic Voice Language Selector & Playback Controller */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
          
          {/* Language Toggle Row for OBD Audio Voice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span>{isHindi ? 'वॉयस भाषा चुनें:' : 'Select Audio Voice Language:'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="obd-voice-lang-en-btn"
                onClick={() => {
                  if (isPlayingAudio) {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsPlayingAudio(false);
                  }
                  setActiveVoiceLanguage('en');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                  activeVoiceLanguage === 'en'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🌐 English Voice (en-IN)
              </button>

              <button
                id="obd-voice-lang-hi-btn"
                onClick={() => {
                  if (isPlayingAudio) {
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                    setIsPlayingAudio(false);
                  }
                  setActiveVoiceLanguage('hi');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                  activeVoiceLanguage === 'hi'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                🇮🇳 हिन्दी वॉयस (hi-IN)
              </button>
            </div>
          </div>

          {/* Player controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            
            <div className="flex items-center gap-3.5">
              <button
                id="play-obd-voice-btn"
                onClick={() => handleToggleAudio(activeVoiceLanguage)}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ${
                  isPlayingAudio 
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : 'bg-orange-500 hover:bg-orange-400 text-white'
                }`}
                title={isPlayingAudio ? 'Stop Audio' : 'Play OBD Voice'}
              >
                {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>
                    {activeVoiceLanguage === 'hi'
                      ? `हिन्दी वॉयस प्रसारण • ${cityName} (#OBD-HI)`
                      : `English Voice Broadcast • ${cityName} (#OBD-EN)`}
                  </span>
                  {isPlayingAudio && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-pulse font-bold">
                      {activeVoiceLanguage === 'hi' ? 'बोल रहा है...' : 'SPEAKING...'}
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {activeVoiceLanguage === 'hi'
                    ? 'बोली: प्रामाणिक राष्ट्रीय हिन्दी • तापमान आधारित स्वचालित सुरक्षा परामर्श'
                    : 'Dialect: Standard Indian English • Dynamic biometeorological synthesis'}
                </div>
              </div>
            </div>

            {/* Timecode & Duration */}
            <div className="text-right font-mono text-xs text-slate-300">
              <span className="text-orange-400 font-bold">
                {isPlayingAudio 
                  ? `00:${Math.min(dynamicObdContent.durationSec, Math.round((audioProgress / 100) * dynamicObdContent.durationSec)).toString().padStart(2, '0')}` 
                  : '00:00'}
              </span>
              <span className="text-slate-500"> / 00:{dynamicObdContent.durationSec.toString().padStart(2, '0')}</span>
            </div>

          </div>

          {/* Animated Waveform Visualizer */}
          <div className="h-10 flex items-center gap-1 px-2 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
            {Array.from({ length: 48 }).map((_, i) => {
              const isActive = isPlayingAudio;
              const height = isActive 
                ? `${Math.max(15, Math.sin(i * 0.4 + (audioProgress / 10)) * 90 + 20)}%`
                : `${Math.max(10, (i % 6) * 12 + 10)}%`;

              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    i <= (audioProgress / 100) * 48
                      ? 'bg-orange-500'
                      : 'bg-slate-700/60'
                  }`}
                  style={{ height }}
                />
              );
            })}
          </div>

          {/* Live Dynamic Speech Transcript Display */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-sans space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-orange-400 font-mono text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {activeVoiceLanguage === 'hi'
                    ? 'ध्वनि आईवीआर ट्रांसक्रिप्ट (हिन्दी में पूर्ण आवाज):'
                    : 'Synthesized IVR Transcript (Full Voice in English):'}
                </span>
              </strong>
              <span className="text-[10px] font-mono text-slate-400">
                {activeVoiceLanguage === 'hi' ? 'देवनागरी' : 'Latin Script'}
              </span>
            </div>

            <p className="text-slate-200 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
              {activeVoiceLanguage === 'hi' ? broadcast.messageHi : broadcast.messageEn}
            </p>
          </div>

        </div>

      </section>

      {/* 3. Municipal Dispatch Console & Multilingual Broadcast Templates */}
      <section id="municipal-dispatch-console" className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-orange-400" />
              {isHindi ? 'नगरपालिका नियंत्रण कक्ष • मास नोटिफिकेशन डिस्पैच' : 'Municipal Dispatch Console • Mass Notification Dispatch'}
            </h3>
            <p className="text-xs text-slate-400">
              {isHindi 
                ? 'सेल्युलर टावर, एसएमएस और व्हाट्सएप के जरिए आपातकालीन निर्देश तुरंत प्रसारित करें'
                : 'Compose, preview, and broadcast emergency directives across cellular towers and SMS gateways'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">{isHindi ? 'लक्षित वार्ड:' : 'Target Ward:'}</span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-slate-950 text-xs font-mono text-white border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">{isHindi ? 'सभी संवेदनशील वार्ड' : 'All Critical Wards'}</option>
              <option value="gnorth">Ward G/North (Central District)</option>
              <option value="lkurla">Ward L (Industrial Belt)</option>
              <option value="meast">Ward M/East (Transit Cluster)</option>
            </select>
          </div>
        </div>

        {/* Template Selectors */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-mono text-slate-400">{isHindi ? 'प्रसारण निर्देश:' : 'Directives:'}</span>
          
          <button
            onClick={() => handleSelectTemplate('live')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTemplate === 'live'
                ? 'bg-orange-600 text-white font-bold'
                : 'bg-slate-950/60 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {isHindi ? '⚡ लाइव मौसम-संचालित बुलेटिन' : '⚡ Live Weather-Generated'}
          </button>

          <button
            onClick={() => handleSelectTemplate('curfew')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTemplate === 'curfew'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-slate-950/60 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {isHindi ? 'शारीरिक श्रम कर्फ्यू आदेश' : 'Curfew Stoppage Order'}
          </button>

          <button
            onClick={() => handleSelectTemplate('water')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTemplate === 'water'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-slate-950/60 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {isHindi ? 'आपातकालीन जल आपूर्ति' : 'Emergency Water Dispatch'}
          </button>

          <button
            onClick={() => handleSelectTemplate('shelter')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTemplate === 'shelter'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-950/60 text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {isHindi ? 'शीत राहत केंद्र सक्रियता' : 'Cooling Shelter Activation'}
          </button>
        </div>

        {/* Multilingual Translation Payload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
          
          {/* English Payload Card */}
          <div className={`p-3.5 rounded-xl bg-slate-950/60 border flex flex-col justify-between transition-all ${
            activeVoiceLanguage === 'en' ? 'border-orange-500/60 shadow-sm ring-1 ring-orange-500/30' : 'border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <span>English (Latin Broadcast Payload)</span>
                  {activeVoiceLanguage === 'en' && (
                    <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded">Active Voice</span>
                  )}
                </span>
                <button
                  onClick={() => handleCopy(broadcast.messageEn, 'en')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {broadcast.messageEn}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>{broadcast.messageEn.length} chars</span>
              <button
                onClick={() => {
                  setActiveVoiceLanguage('en');
                  handleToggleAudio('en');
                }}
                className="text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>Play English Voice</span>
              </button>
            </div>
          </div>

          {/* Hindi Payload Card */}
          <div className={`p-3.5 rounded-xl bg-slate-950/60 border flex flex-col justify-between transition-all ${
            activeVoiceLanguage === 'hi' ? 'border-orange-500/60 shadow-sm ring-1 ring-orange-500/30' : 'border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-orange-400 flex items-center gap-1.5">
                  <span>हिन्दी (देवनागरी आधिकारिक प्रारूप)</span>
                  {activeVoiceLanguage === 'hi' && (
                    <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1.5 py-0.2 rounded">सक्रिय आवाज</span>
                  )}
                </span>
                <button
                  onClick={() => handleCopy(broadcast.messageHi, 'hi')}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {broadcast.messageHi}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>{broadcast.messageHi.length} वर्ण • यूनिकोड</span>
              <button
                onClick={() => {
                  setActiveVoiceLanguage('hi');
                  handleToggleAudio('hi');
                }}
                className="text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3 h-3" />
                <span>हिन्दी वॉयस सुनें</span>
              </button>
            </div>
          </div>

        </div>

        {/* Transmit Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'सेल ब्रॉडकास्ट सेवा (CBS) तैयार' : 'Cell Broadcast Service (CBS) Ready'}</span>
            </span>
            <span>{isHindi ? 'सीडैक एसएमएस गेटवे सक्रिय' : 'CDAC SMS Gateways Active'}</span>
          </div>

          <div className="flex items-center gap-3">
            {copiedLang && (
              <span className="text-xs font-mono text-emerald-400">
                ✓ {isHindi ? `${copiedLang.toUpperCase()} संदेश कॉपी हुआ!` : `Copied ${copiedLang.toUpperCase()} text!`}
              </span>
            )}

            {transmitSuccess && (
              <span className="text-xs font-mono text-emerald-400">
                ✓ {isHindi ? 'आपातकालीन संदेश 27,100 मोबाइल उपकरणों पर सफलतापूर्वक भेजा गया!' : 'Emergency Broadcast Successfully Transmitted to 27,100 Mobile Devices!'}
              </span>
            )}

            <button
              id="transmit-broadcast-btn"
              onClick={handleTransmit}
              disabled={isTransmitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono tracking-wider rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isTransmitting ? 'animate-spin' : ''}`} />
              <span>{isTransmitting 
                ? (isHindi ? 'सीबीएस के जरिए प्रसारण हो रहा है...' : 'TRANSMITTING VIA CBS...') 
                : (isHindi ? 'आपातकालीन संदेश प्रसारित करें' : 'TRANSMIT EMERGENCY DISPATCH')}</span>
            </button>
          </div>
        </div>

      </section>

      {/* 4. Citizen Heat Defense Protocol & Triage Checklist */}
      <section id="citizen-defense-checklist" className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <h3 className="text-base font-headline font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-400" />
          {isHindi ? 'आशा / आंगनवाड़ी स्वास्थ्य कार्यकर्ता चेकलिस्ट' : 'Field Health Worker Checklist (Asha / Anganwadi Deployments)'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-white block mb-1">
              {isHindi ? '1. घर-घर ओआरएस वितरण' : '1. Door-to-Door ORS Check'}
            </span>
            {isHindi 
              ? 'झुग्गी-बस्तियों और टिन शेड वाले घरों में प्रति परिवार 4 ओआरएस पैकेट का वितरण सुनिश्चित करें।'
              : 'Distribute 4 sachets per hutment in vulnerable settlements.'}
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-white block mb-1">
              {isHindi ? '2. वरिष्ठ नागरिक स्वास्थ्य जांच' : '2. Senior Citizen Check'}
            </span>
            {isHindi
              ? '60 वर्ष से अधिक आयु के उच्च रक्तचाप पीड़ित नागरिकों के वाइटल्स और जल स्तर की जांच करें।'
              : 'Inspect vital signs and hydration in residents aged > 60 with hypertension.'}
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-white block mb-1">
              {isHindi ? '3. जल टैंकर गुणवत्ता' : '3. Water Bowser Quality'}
            </span>
            {isHindi
              ? '24 आपातकालीन टैंकरों में क्लोरीन अवशिष्ट (0.5 पीपीएम) और पानी के तापमान का सत्यापन करें।'
              : 'Verify chlorine residual (0.5 ppm) and chilled temperature in municipal tankers.'}
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="font-bold text-white block mb-1">
              {isHindi ? '4. पशुओं के लिए पेयजल' : '4. Animal Troughs'}
            </span>
            {isHindi
              ? 'सार्वजनिक स्थानों और श्रमिक बस्तियों के पास पशु पेयजल कुंडों को पुनः भरें।'
              : 'Refill municipal animal drinking troughs across critical public markets.'}
          </div>
        </div>
      </section>

    </div>
  );
};

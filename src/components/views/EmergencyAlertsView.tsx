import React, { useState, useRef, useEffect } from 'react';
import { 
  BellRing, 
  Send, 
  Volume2, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall, 
  MessageSquare, 
  Radio, 
  Globe, 
  ShieldAlert, 
  Flame, 
  FileText,
  Copy,
  Users
} from 'lucide-react';
import { EmergencyBroadcast, LanguageCode } from '../../types';
import { ACTIVE_EMERGENCY_BROADCAST } from '../../data/mockData';
import { CityData } from '../../data/indiaCities';

interface EmergencyAlertsViewProps {
  language: LanguageCode;
  selectedCity?: CityData;
  onOpenCitySelector?: () => void;
  onTriggerSOS: () => void;
}

export const EmergencyAlertsView: React.FC<EmergencyAlertsViewProps> = ({
  language,
  selectedCity,
  onOpenCitySelector,
  onTriggerSOS,
}) => {
  const initialBroadcast = selectedCity?.emergencyBroadcast || ACTIVE_EMERGENCY_BROADCAST;
  const [broadcast, setBroadcast] = useState<EmergencyBroadcast>(initialBroadcast);

  useEffect(() => {
    if (selectedCity?.emergencyBroadcast) {
      setBroadcast(selectedCity.emergencyBroadcast);
    }
  }, [selectedCity]);
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'WARNING' | 'HIGH' | 'EXTREME_CODE_RED'>('EXTREME_CODE_RED');
  const [activeTemplate, setActiveTemplate] = useState<'curfew' | 'water' | 'shelter'>('curfew');
  
  // Dispatch console states
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [transmitSuccess, setTransmitSuccess] = useState<boolean>(false);
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  // Audio OBD player state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioIntervalRef = useRef<any>(null);

  // Audio OBD simulation and browser speech synthesis
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setIsPlayingAudio(true);
      setAudioProgress(0);

      // Web Speech API synthesis if available
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(broadcast.messageHi);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        utterance.onend = () => {
          setIsPlayingAudio(false);
          setAudioProgress(100);
        };
        window.speechSynthesis.speak(utterance);
      }

      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            clearInterval(audioIntervalRef.current);
            setIsPlayingAudio(false);
            return 100;
          }
          return prev + 2.5;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleTransmit = () => {
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);
      setTransmitSuccess(true);
      setBroadcast((prev) => ({
        ...prev,
        smsDelivered: prev.smsDelivered + 12500,
        whatsappDelivered: prev.whatsappDelivered + 8400,
        audioObdDialed: prev.audioObdDialed + 6200,
      }));
      setTimeout(() => setTransmitSuccess(false), 5000);
    }, 1500);
  };

  const handleCopy = (text: string, lang: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2500);
  };

  return (
    <div id="emergency-alerts-screen" className="space-y-4 sm:space-y-6 pb-12">
      
      {/* 1. Active Red Code Emergency Banner */}
      <section id="active-broadcast-banner" className="relative rounded-2xl bg-gradient-to-r from-red-950 via-[#171f33] to-red-950 border-2 border-red-500/60 p-4 sm:p-6 shadow-2xl shadow-red-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-black bg-red-600 text-white tracking-wider animate-pulse">
                  {broadcast.code}
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Issued: {broadcast.issuedAt}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-headline font-black text-white mt-1">
                {broadcast.title}
              </h2>
              <p className="text-xs text-red-300/90 font-mono mt-0.5">
                Authority: {broadcast.issuedBy}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setBroadcast(b => ({ ...b, acknowledged: true }))}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                broadcast.acknowledged
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 animate-bounce'
              }`}
            >
              {broadcast.acknowledged ? '✓ SIREN ACKNOWLEDGED' : 'ACKNOWLEDGE SIREN'}
            </button>
          </div>
        </div>

        {/* Live Delivery Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-red-500/30 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449] flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>SMS Gateway (CDAC):</span>
            </div>
            <span className="text-white font-bold">{broadcast.smsDelivered.toLocaleString()}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449] flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Cloud API:</span>
            </div>
            <span className="text-white font-bold">{broadcast.whatsappDelivered.toLocaleString()}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#060e20] border border-[#2d3449] flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Volume2 className="w-4 h-4 text-orange-400" />
              <span>IVR Voice OBD Calls:</span>
            </div>
            <span className="text-white font-bold">{broadcast.audioObdDialed.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* 2. Municipal Dispatch Console & Multilingual Broadcast Bar */}
      <section id="municipal-dispatch-console" className="bg-[#0b1326] rounded-2xl border border-[#2d3449] p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#2d3449] pb-3 mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-headline font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-orange-400" />
              Municipal Dispatch Console • Mass Notification Engine
            </h3>
            <p className="text-xs text-slate-400">
              Compose, auto-localize, and broadcast emergency directives across cellular towers and SMS gateways
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Target Ward:</span>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-[#060e20] text-xs font-mono text-white border border-[#2d3449] rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Critical Wards (G/N, L, M/E)</option>
              <option value="gnorth">Ward G/North (Dharavi / Sion)</option>
              <option value="lkurla">Ward L (Kurla / Chunabhatti)</option>
              <option value="meast">Ward M/East (Govandi / Mankhurd)</option>
            </select>
          </div>
        </div>

        {/* Template Selectors */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-mono text-slate-400">Preset Directives:</span>
          <button
            onClick={() => setActiveTemplate('curfew')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              activeTemplate === 'curfew'
                ? 'bg-red-600 text-white font-bold'
                : 'bg-[#060e20] text-slate-300 border border-[#2d3449] hover:text-white'
            }`}
          >
            Curfew Stoppage Order
          </button>
          <button
            onClick={() => setActiveTemplate('water')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              activeTemplate === 'water'
                ? 'bg-cyan-600 text-white font-bold'
                : 'bg-[#060e20] text-slate-300 border border-[#2d3449] hover:text-white'
            }`}
          >
            Emergency Water Tanker Schedule
          </button>
          <button
            onClick={() => setActiveTemplate('shelter')}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              activeTemplate === 'shelter'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-[#060e20] text-slate-300 border border-[#2d3449] hover:text-white'
            }`}
          >
            Cooling Shelter Route Activation
          </button>
        </div>

        {/* Multilingual Translation Payload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          
          {/* English */}
          <div className="p-3.5 rounded-xl bg-[#060e20] border border-[#2d3449] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  English (Latin Payload)
                </span>
                <button
                  onClick={() => handleCopy(broadcast.messageEn, 'en')}
                  className="text-slate-400 hover:text-white"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {broadcast.messageEn}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#2d3449] text-[10px] font-mono text-slate-500">
              Length: {broadcast.messageEn.length} chars • 1 SMS Segment
            </div>
          </div>

          {/* Hindi */}
          <div className="p-3.5 rounded-xl bg-[#060e20] border border-orange-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-orange-400">
                  हिन्दी (Devanagari Unicode)
                </span>
                <button
                  onClick={() => handleCopy(broadcast.messageHi, 'hi')}
                  className="text-slate-400 hover:text-white"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {broadcast.messageHi}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#2d3449] text-[10px] font-mono text-slate-500">
              Length: {broadcast.messageHi.length} chars • Unicode 2 Segments
            </div>
          </div>

          {/* Marathi */}
          <div className="p-3.5 rounded-xl bg-[#060e20] border border-[#2d3449] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold text-slate-300">
                  मराठी (State Official Language)
                </span>
                <button
                  onClick={() => handleCopy(broadcast.messageMr, 'mr')}
                  className="text-slate-400 hover:text-white"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {broadcast.messageMr}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-[#2d3449] text-[10px] font-mono text-slate-500">
              Length: {broadcast.messageMr.length} chars • Unicode 2 Segments
            </div>
          </div>

        </div>

        {/* Transmit Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#2d3449]">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cell Broadcast Service (CBS) Ready</span>
            </span>
            <span>CDAC SMS Gateways Active</span>
          </div>

          <div className="flex items-center gap-3">
            {copiedLang && (
              <span className="text-xs font-mono text-emerald-400">
                ✓ Copied {copiedLang.toUpperCase()} text!
              </span>
            )}

            {transmitSuccess && (
              <span className="text-xs font-mono text-emerald-400 animate-pulse">
                ✓ Emergency Broadcast Successfully Transmitted to 27,100 Mobile Devices!
              </span>
            )}

            <button
              id="transmit-broadcast-btn"
              onClick={handleTransmit}
              disabled={isTransmitting}
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold font-mono tracking-wider rounded-xl shadow-lg shadow-red-950/40 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isTransmitting ? 'animate-spin' : ''}`} />
              <span>{isTransmitting ? 'TRANSMITTING VIA CBS...' : 'TRANSMIT MULTILINGUAL DISPATCH'}</span>
            </button>
          </div>
        </div>

      </section>

      {/* 3. Multilingual Delivery Pipeline & Interactive Audio OBD Console */}
      <section id="audio-obd-ivr-console" className="bg-[#0b1326] rounded-2xl border border-orange-500/30 p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#2d3449] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
                Automated Outbound Dialing (OBD) Audio Broadcast Engine
              </h3>
              <p className="text-xs text-slate-400">
                Auto-calls uneducated, senior, and informal worker mobile phones with automated voice warning in local dialects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              SIP TRUNK CONNECTED (3,000 CHANNELS)
            </span>
          </div>
        </div>

        {/* Audio Player Controller Box */}
        <div className="p-4 rounded-xl bg-[#060e20] border border-[#2d3449] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Play/Pause Button & Timecode */}
            <div className="flex items-center gap-3">
              <button
                id="play-obd-voice-btn"
                onClick={handleToggleAudio}
                className="w-11 h-11 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-950/40 transition-transform active:scale-95"
              >
                {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Hindi Voice Prompt #OBD-4019</span>
                  {isPlayingAudio && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded animate-pulse">
                      SPEAKING
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Dialect: North Mumbai Standard Hindi • 48 kHz HD Voice
                </div>
              </div>
            </div>

            {/* Timecode */}
            <div className="text-right font-mono text-xs text-slate-300">
              <span className="text-orange-400 font-bold">
                {isPlayingAudio ? `00:${Math.min(48, Math.round((audioProgress / 100) * 48)).toString().padStart(2, '0')}` : '00:00'}
              </span>
              <span className="text-slate-500"> / 00:48</span>
            </div>

          </div>

          {/* Animated Waveform Visualizer */}
          <div className="h-10 flex items-center gap-1 px-2 bg-[#0b1326] rounded-lg overflow-hidden border border-[#2d3449]">
            {Array.from({ length: 48 }).map((_, i) => {
              const isActive = isPlayingAudio;
              // Randomized height simulation
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

          {/* Synthesized Phonetic Transcript */}
          <div className="p-3 rounded-lg bg-[#0b1326] border border-[#2d3449] text-xs font-sans text-slate-300">
            <strong className="text-orange-400 block font-mono text-[11px] mb-1">
              Phonetic IVR Transcript Broadcast:
            </strong>
            "नमस्कार! यह बृहन्मुंबई महानगरपालिका का आपातकालीन स्वास्थ्य संदेश है। धारावी और सायन क्षेत्र में आज अत्यधिक खतरनाक लू का स्तर पार हो चुका है। कृपया दोपहर 12 से 4 के बीच धूप में न निकलें। हर 20 मिनट में पानी या ओआरएस पिएं। चक्कर या बेहोशी आने पर तुरंत 108 पर कॉल करें। नजदीकी शीत राहत केंद्र कामराज हाई स्कूल के सामने खुला है।"
          </div>
        </div>

      </section>

      {/* 4. Citizen Heat Defense Protocol & Triage Checklist */}
      <section id="citizen-defense-checklist" className="p-4 sm:p-5 rounded-2xl bg-[#0b1326] border border-[#2d3449]">
        <h3 className="text-base font-headline font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-orange-400" />
          Field Health Worker Checklist (Asha / Anganwadi Deployments)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-[#060e20] border border-[#2d3449]">
            <span className="font-bold text-white block mb-1">1. Door-to-Door ORS Check</span>
            Distribute 4 sachets per hutment in tin-roof chawls on 60ft and 90ft Roads.
          </div>
          <div className="p-3 rounded-xl bg-[#060e20] border border-[#2d3449]">
            <span className="font-bold text-white block mb-1">2. Senior Citizen Check</span>
            Inspect vital signs and hydration in residents aged &gt; 60 with hypertension.
          </div>
          <div className="p-3 rounded-xl bg-[#060e20] border border-[#2d3449]">
            <span className="font-bold text-white block mb-1">3. Water Bowser Quality</span>
            Verify chlorine residual (0.5 ppm) and chilled temperature in 24 tankers.
          </div>
          <div className="p-3 rounded-xl bg-[#060e20] border border-[#2d3449]">
            <span className="font-bold text-white block mb-1">4. Animal Troughs</span>
            Refill 82 municipal animal drinking troughs across leather tanning clusters.
          </div>
        </div>
      </section>

    </div>
  );
};

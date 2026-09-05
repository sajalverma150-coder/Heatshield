import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Compass, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  ChevronRight, 
  Droplet, 
  Sun, 
  Wind, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Flame, 
  AlertTriangle,
  QrCode,
  Ticket
} from 'lucide-react';
import { CoolingFacility } from '../types';
import { CityData } from '../data/indiaCities';

interface GpsNavigationModalProps {
  facility: CoolingFacility;
  selectedCity: CityData;
  userLocation: { lat: number; lng: number } | null;
  routeMode: 'cool' | 'fast';
  onToggleRouteMode: (mode: 'cool' | 'fast') => void;
  onClose: () => void;
  onTriggerSOS: () => void;
}

export const GpsNavigationModal: React.FC<GpsNavigationModalProps> = ({
  facility,
  selectedCity,
  userLocation,
  routeMode,
  onToggleRouteMode,
  onClose,
  onTriggerSOS,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [isReservedSpot, setIsReservedSpot] = useState<boolean>(false);
  const [reservationTimer, setReservationTimer] = useState<number>(900); // 15 mins
  const [audioFeedbackMsg, setAudioFeedbackMsg] = useState<string>('');

  const isHospital = facility.isHospital || facility.category === 'triage_hospital';

  // Realistic generated step-by-step route for this facility
  const steps = [
    {
      instruction: `Head out from current location toward ${routeMode === 'cool' ? 'shaded tree canopy avenue' : 'direct roadway'}`,
      distance: '60 m',
      direction: 'straight',
      shadeType: routeMode === 'cool' ? 'Dense Tree Arcade (78% UV Block)' : 'Direct Sun (High Heat Exposure)',
      uvRisk: routeMode === 'cool' ? 'Low' : 'Extreme',
    },
    {
      instruction: `Turn right at ${selectedCity.name} Municipal Transit corridor`,
      distance: '180 m',
      direction: 'right',
      shadeType: routeMode === 'cool' ? 'Covered Shop Awning Shade' : 'Asphalt Surface Radiation',
      uvRisk: routeMode === 'cool' ? 'Moderate' : 'High',
    },
    {
      instruction: 'Pass Municipal Jal Sansthan Chilled Drinking Water Bowser #04 (Free ORS available)',
      distance: '240 m',
      direction: 'straight',
      shadeType: 'Hydration Checkpoint & Mist Fan Corridor',
      uvRisk: 'Protected',
    },
    {
      instruction: `Turn left into ${facility.address.split(',')[0]}`,
      distance: '120 m',
      direction: 'left',
      shadeType: routeMode === 'cool' ? 'High Building Shadow' : 'Direct Sun',
      uvRisk: routeMode === 'cool' ? 'Low' : 'High',
    },
    {
      instruction: `Arrive at destination: ${facility.name}. Enter through climate-controlled reception.`,
      distance: '40 m',
      direction: 'arrive',
      shadeType: 'Indoor Air-Conditioned Comfort',
      uvRisk: 'Zero (Protected)',
    },
  ];

  // Reservation countdown timer
  useEffect(() => {
    if (!isReservedSpot) return;
    const interval = setInterval(() => {
      setReservationTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isReservedSpot]);

  // Voice announcement helper
  const speakInstruction = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      setAudioFeedbackMsg(`Speaking: "${text.substring(0, 45)}..."`);
      setTimeout(() => setAudioFeedbackMsg(''), 3000);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Announce initial instruction when opened
  useEffect(() => {
    const welcomeMsg = `Navigation started to ${facility.name}. ${steps[0].instruction}. Total distance ${facility.distanceKm} kilometers, estimated walk time ${facility.walkTimeMins} minutes.`;
    speakInstruction(welcomeMsg);
  }, [facility.id, routeMode]);

  // Simulate Walk progress
  const handleAdvanceStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      speakInstruction(`In ${steps[nextIdx].distance}, ${steps[nextIdx].instruction}`);
    } else {
      speakInstruction(`You have arrived safely at ${facility.name}. Current indoor temperature is ${facility.indoorTemp} degrees Celsius.`);
    }
  };

  // Format reservation timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPct = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div 
        id="gps-navigation-hud"
        className="bg-[#0b1326] border border-orange-500/70 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5"
      >
        
        {/* Header HUD */}
        <div className="p-4 sm:p-5 bg-[#060e20] border-b border-[#2d3449] flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 animate-pulse">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
                  LIVE TURN-BY-TURN GPS
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isHospital ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isHospital ? 'HOSPITAL TRIAGE' : 'AC COOLING SHELTER'}
                </span>
              </div>
              <h3 className="font-headline font-bold text-white text-base sm:text-lg mt-0.5">
                {facility.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-1">
                {facility.address}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#171f33] rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Navigation Metric Strip */}
        <div className="grid grid-cols-3 divide-x divide-[#2d3449] bg-[#0d162d] border-b border-[#2d3449] py-2.5 px-3 text-center">
          <div>
            <div className="text-[10px] font-mono text-slate-400">ESTIMATED WALK</div>
            <div className="text-sm sm:text-base font-mono font-bold text-orange-400">
              {routeMode === 'cool' ? facility.walkTimeMins + 1 : facility.walkTimeMins} mins
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400">TOTAL DISTANCE</div>
            <div className="text-sm sm:text-base font-mono font-bold text-white">
              {facility.distanceKm} km
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-slate-400">INDOOR REFUGE</div>
            <div className="text-sm sm:text-base font-mono font-bold text-emerald-400">
              {facility.indoorTemp}°C
            </div>
          </div>
        </div>

        {/* Route Mode Switcher: Shaded Cool Corridor vs Fast Path */}
        <div className="p-3 bg-[#0b1326] border-b border-[#2d3449] flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-xs text-slate-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Navigation Path Strategy:</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#060e20] p-1 rounded-xl border border-[#2d3449] w-full sm:w-auto">
            <button
              onClick={() => onToggleRouteMode('cool')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                routeMode === 'cool'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Cool Corridor (Shaded)</span>
            </button>
            <button
              onClick={() => onToggleRouteMode('fast')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                routeMode === 'fast'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Shortest Direct</span>
            </button>
          </div>
        </div>

        {/* Route Exposure Alert Banner */}
        <div className={`p-3 border-b text-xs flex items-center justify-between gap-2 ${
          routeMode === 'cool'
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
            : 'bg-orange-950/30 border-orange-500/30 text-orange-200'
        }`}>
          <div className="flex items-center gap-2">
            {routeMode === 'cool' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            )}
            <span>
              {routeMode === 'cool' 
                ? 'Shaded Corridor Selected: 42% lower direct solar radiation load via trees & covered walkways.'
                : 'Direct Road Selected: High asphalt radiative heat load. Carry water & stay covered.'}
            </span>
          </div>

          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              isVoiceEnabled 
                ? 'bg-orange-500/20 border-orange-500/50 text-orange-300' 
                : 'bg-[#171f33] border-[#2d3449] text-slate-500'
            }`}
            title={isVoiceEnabled ? "Voice Guidance Active (Tap to Mute)" : "Voice Muted (Tap to Enable)"}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {audioFeedbackMsg && (
          <div className="px-3 py-1 bg-orange-500/10 text-orange-300 text-[10px] font-mono border-b border-orange-500/20 text-center animate-pulse">
            {audioFeedbackMsg}
          </div>
        )}

        {/* Main Step HUD Viewport */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* Active Step Big Display */}
          <div className="p-4 rounded-2xl bg-[#060e20] border-2 border-orange-500/60 shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider">
                  CURRENT DIRECTION • STEP {currentStepIndex + 1} OF {steps.length}
                </span>
                <h4 className="text-base sm:text-lg font-headline font-bold text-white leading-snug">
                  {steps[currentStepIndex].instruction}
                </h4>
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-300 font-mono">
                  <span className="px-2 py-0.5 rounded bg-[#171f33] border border-[#2d3449] text-orange-300">
                    In {steps[currentStepIndex].distance}
                  </span>
                  <span className="text-slate-400">
                    {steps[currentStepIndex].shadeType}
                  </span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
                {steps[currentStepIndex].direction === 'left' ? '⬅️' : steps[currentStepIndex].direction === 'right' ? '➡️' : '⬆️'}
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="mt-3 pt-3 border-t border-[#2d3449]">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Route Progress</span>
                <span className="text-orange-400 font-bold">{progressPct}%</span>
              </div>
              <div className="w-full bg-[#171f33] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Step list sequence */}
          <div className="space-y-2">
            <h5 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Turn-by-Turn Route Guidance
            </h5>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      speakInstruction(`In ${step.distance}, ${step.instruction}`);
                    }}
                    className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-[#171f33] border-orange-500/80 text-white shadow'
                        : isPassed
                        ? 'bg-[#060e20]/50 border-[#2d3449]/40 text-slate-500'
                        : 'bg-[#060e20] border-[#2d3449] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-orange-500 text-white'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#171f33] text-slate-400'
                      }`}>
                        {isPassed ? '✓' : idx + 1}
                      </div>
                      <div>
                        <div className={`line-clamp-1 font-medium ${isCurrent ? 'text-white font-bold' : ''}`}>
                          {step.instruction}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {step.shadeType}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-orange-400 shrink-0">
                      {step.distance}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reserve Cooling Mat Feature */}
          <div className="p-3 bg-[#060e20] rounded-2xl border border-[#2d3449] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Ticket className="w-4 h-4 text-orange-400" />
                <span>Express Cooling Pass (15-Min Spot Hold)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Reserve an air-conditioned recliner or hydration spot while walking
              </p>
            </div>

            {isReservedSpot ? (
              <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center shrink-0">
                <span className="text-[10px] font-mono text-emerald-400 font-bold block">SPOT HELD</span>
                <span className="text-xs font-mono font-bold text-white">{formatTimer(reservationTimer)}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsReservedSpot(true);
                  speakInstruction(`Cooling spot reserved for 15 minutes at ${facility.name}.`);
                }}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
              >
                Hold Spot
              </button>
            )}
          </div>

        </div>

        {/* Bottom Interactive Controls */}
        <div className="p-4 bg-[#060e20] border-t border-[#2d3449] flex flex-wrap items-center justify-between gap-2.5">
          
          <div className="flex items-center gap-2">
            {/* Advance Step / Walk Simulation Button */}
            <button
              onClick={handleAdvanceStep}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-950/40 transition-all cursor-pointer"
            >
              <span>{currentStepIndex < steps.length - 1 ? 'Next Step (Simulate Walk)' : 'Destination Arrived'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Real Google Maps native app link */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates[0]},${facility.coordinates[1]}&travelmode=walking`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Launch Google Maps App"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Open in Google Maps</span>
              <span className="sm:hidden">Google Maps</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${facility.contactPhone}`}
              className="p-2 bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-orange-400 rounded-xl text-xs flex items-center justify-center transition-colors"
              title="Call Facility Reception"
            >
              <PhoneCall className="w-4 h-4" />
            </a>

            <button
              onClick={onTriggerSOS}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-950/40 transition-colors animate-pulse"
              title="Trigger Emergency SOS"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>SOS (108)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

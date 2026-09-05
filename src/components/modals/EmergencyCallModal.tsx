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
import { UserHealthProfile } from '../../types';

interface EmergencyCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserHealthProfile;
}

export const EmergencyCallModal: React.FC<EmergencyCallModalProps> = ({
  isOpen,
  onClose,
  userProfile,
}) => {
  const [etaSeconds, setEtaSeconds] = useState<number>(348); // 5 mins 48 secs
  const [isTransmitted, setIsTransmitted] = useState<boolean>(true);

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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#0b1326] border-2 border-red-500 rounded-3xl max-w-md w-full p-5 sm:p-6 text-center shadow-2xl shadow-red-950/60 relative overflow-hidden">
        
        {/* Siren Radar Animation Ring */}
        <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 mx-auto flex items-center justify-center text-red-500 mb-4 relative">
          <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping" />
          <PhoneCall className="w-9 h-9 animate-bounce text-red-400" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          CODE RED 108 DISPATCHED
        </div>

        <h2 className="text-xl sm:text-2xl font-headline font-black text-white">
          Heat Stroke Emergency Unit En Route
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Lokmanya Tilak Sion Hospital Hyperthermia Trauma Unit
        </p>

        {/* Live ETA Card */}
        <div className="mt-4 p-4 rounded-2xl bg-[#060e20] border border-[#2d3449] space-y-2">
          <div className="text-xs font-mono text-slate-400">ESTIMATED ARRIVAL TIME</div>
          <div className="text-4xl font-headline font-black text-orange-400 tracking-tight">
            {formatEta(etaSeconds)}
          </div>
          <div className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Unit #MH-01-4491 (Ice-Bath Equipped)</span>
          </div>
        </div>

        {/* Live GPS Coordinates Transmitted */}
        <div className="mt-3 p-3 rounded-xl bg-[#171f33] border border-[#2d3449] text-left text-xs font-mono space-y-1.5">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-red-400" /> GPS Locked:
            </span>
            <span className="text-white font-bold">19.0435° N, 72.8532° E</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Location:</span>
            <span className="text-slate-200 truncate">Dharavi 90ft Rd / Labour Camp</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Patient:</span>
            <span className="text-white font-bold">{userProfile.name} (Age {userProfile.age})</span>
          </div>
          <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-[#2d3449]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> ICE SMS Dispatched:
            </span>
            <span>{userProfile.iceContact.name}</span>
          </div>
        </div>

        {/* Immediate Survival Instructions */}
        <div className="mt-4 text-xs text-left bg-red-950/30 border border-red-500/30 p-3 rounded-xl text-red-200 leading-relaxed">
          <strong className="block font-headline text-red-400 mb-1">
            CRITICAL FIRST-AID WHILE AMBULANCE TRAVELS:
          </strong>
          1. Move patient immediately into shade or AC refuge.<br />
          2. Douse body with cold water and fan vigorously.<br />
          3. Do NOT give water if patient is confused or vomiting.<br />
          4. Place ice packs on neck, underarms, and groin.
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#171f33] hover:bg-[#222a3d] border border-[#2d3449] text-slate-300 text-xs font-mono font-bold rounded-xl transition-colors"
          >
            Minimize Tracking Window
          </button>
          <a
            href="tel:108"
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-red-950/50"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Redial 108</span>
          </a>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { X, FileText } from 'lucide-react';
import { HealthReportView } from '../views/HealthReportView';
import { WeatherTelemetry, UserHealthProfile, CoolingFacility } from '../../types';
import { CityData } from '../../data/indiaCities';

interface HealthReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherTelemetry;
  userProfile: UserHealthProfile;
  selectedCity: CityData;
  coolingFacilities: CoolingFacility[];
  onOpenTriage?: () => void;
  onTriggerSOS?: () => void;
  onLogWater?: (amountMl: number) => void;
}

export const HealthReportModal: React.FC<HealthReportModalProps> = ({
  isOpen,
  onClose,
  weather,
  userProfile,
  selectedCity,
  coolingFacilities,
  onOpenTriage,
  onTriggerSOS,
  onLogWater,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      id="health-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        className="relative w-full max-w-5xl my-auto bg-[#0b1326] border border-[#2d3449] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2d3449] bg-[#060e20] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-sm sm:text-base text-white">
                Personalized Heat Health & Clinical Risk Dossier
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Patient: {userProfile?.name || 'Citizen (Primary User)'} | City: {selectedCity?.name || weather?.stationName || 'India'}
              </span>
            </div>
          </div>

          <button
            id="close-health-report-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close Health Report"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          <HealthReportView 
            weather={weather}
            userProfile={userProfile}
            selectedCity={selectedCity}
            coolingFacilities={coolingFacilities}
            onOpenTriage={onOpenTriage}
            onTriggerSOS={onTriggerSOS}
            onLogWater={onLogWater}
          />
        </div>
      </div>
    </div>
  );
};

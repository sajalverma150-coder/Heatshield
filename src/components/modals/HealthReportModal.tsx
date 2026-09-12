import React from 'react';
import { X, FileText } from 'lucide-react';
import { HealthReportView } from '../views/HealthReportView';
import { WeatherTelemetry, UserHealthProfile, CoolingFacility, LanguageCode } from '../../types';
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
  language?: LanguageCode;
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
  language = 'en',
}) => {
  if (!isOpen) return null;
  const isHindi = language === 'hi';

  return (
    <div 
      id="health-report-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#12304A]/80 backdrop-blur-sm overflow-y-auto"
    >
      <div 
        className="relative w-full max-w-5xl my-auto bg-white border-2 border-[#1E5A7A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#D6E0E5] bg-[#12304A] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-sm sm:text-base text-white">
                {isHindi ? 'व्यक्तिगत ताप स्वास्थ्य एवं नैदानिक जोखिम डॉसियर' : 'Personalized Heat Health & Clinical Risk Dossier'}
              </h2>
              <span className="text-[11px] font-mono text-[#E8F1F5]/80">
                {isHindi ? 'नागरिक:' : 'Patient:'} {userProfile?.name || (isHindi ? 'नागरिक (प्राथमिक उपयोगकर्ता)' : 'Citizen (Primary User)')} | {isHindi ? 'शहर:' : 'City:'} {selectedCity?.name || weather?.stationName || (isHindi ? 'भारत' : 'India')}
              </span>
            </div>
          </div>

          <button
            id="close-health-report-modal-btn"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Health Report"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#F4F1EA]">
          <HealthReportView 
            weather={weather}
            userProfile={userProfile}
            selectedCity={selectedCity}
            coolingFacilities={coolingFacilities}
            onOpenTriage={onOpenTriage}
            onTriggerSOS={onTriggerSOS}
            onLogWater={onLogWater}
            language={language}
          />
        </div>
      </div>
    </div>
  );
};

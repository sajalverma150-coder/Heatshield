import React, { useEffect } from 'react';
import { LogOut, ShieldAlert, X } from 'lucide-react';
import { LanguageCode } from '../../types';

interface AdminLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  language?: LanguageCode;
}

export const AdminLogoutModal: React.FC<AdminLogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  language = 'en'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isHindi = language === 'hi';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white border border-[#D6E0E5] rounded-lg p-6 shadow-xl space-y-4 text-[#263746]"
        onClick={(e) => e.stopPropagation()}
        id="admin-logout-modal-card"
      >
        {/* Header & Close Button */}
        <div className="flex items-start justify-between border-b border-[#D6E0E5] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#F8E9E8] border border-[#A63D40] flex items-center justify-center text-[#A63D40] shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-[#12304A]">
                {isHindi ? 'एडमिन लॉगआउट की पुष्टि करें' : 'Confirm Admin Logout'}
              </h3>
              <p className="text-xs text-[#657783] font-mono mt-0.5">
                {isHindi ? 'नगरपालिका अधिकारी सत्र' : 'NDMA / Municipal Authority Session'}
              </p>
            </div>
          </div>
          <button
            id="admin-logout-modal-close-icon"
            onClick={onClose}
            className="p-1 rounded text-[#657783] hover:text-[#12304A] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="p-3.5 rounded-md bg-[#F4F1EA] border border-[#D6E0E5] text-xs text-[#263746] leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" />
          <span>
            {isHindi 
              ? 'क्या आप वाकई अपने एडमिन सत्र से लॉगआउट करना चाहते हैं? आपकी प्रशासनिक पहुंच समाप्त कर दी जाएगी और आप नागरिक मोड में वापस आ जाएंगे।'
              : 'Are you sure you want to log out of your Admin session? Your administrative console access will be locked and you will immediately return to Citizen Mode.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="admin-logout-modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-white hover:bg-[#F4F1EA] text-[#263746] text-xs font-semibold transition-colors border border-[#D6E0E5] cursor-pointer"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>

          <button
            id="admin-logout-modal-confirm-btn"
            type="button"
            onClick={onConfirmLogout}
            className="px-4 py-2 rounded-md bg-[#A63D40] hover:bg-[#8F3437] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isHindi ? 'लॉगआउट करें' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

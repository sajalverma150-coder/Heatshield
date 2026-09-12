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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="admin-logout-modal-card"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header & Close Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-white">
                {isHindi ? 'एडमिन लॉगआउट की पुष्टि करें' : 'Confirm Admin Logout'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isHindi ? 'नगरपालिका अधिकारी सत्र' : 'NDMA / Municipal Session'}
              </p>
            </div>
          </div>
          <button
            id="admin-logout-modal-close-icon"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            {isHindi 
              ? 'क्या आप वाकई अपने एडमिन सत्र से लॉगआउट करना चाहते हैं? आपकी प्रशासनिक पहुंच समाप्त कर दी जाएगी और आप नागरिक मोड में वापस आ जाएंगे।'
              : 'Are you sure you want to log out of your Admin session? Your administrative permissions will be locked and you will automatically return to Citizen Mode.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="admin-logout-modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>

          <button
            id="admin-logout-modal-confirm-btn"
            type="button"
            onClick={onConfirmLogout}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isHindi ? 'लॉगआउट करें' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

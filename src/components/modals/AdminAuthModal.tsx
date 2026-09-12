import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, AlertCircle, X, CheckCircle2, Sparkles } from 'lucide-react';
import { UserRole, LanguageCode } from '../../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAuth?: (role: UserRole) => void;
  onAuthSuccess?: (role: UserRole) => void;
  language?: LanguageCode;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessAuth,
  onAuthSuccess,
  language = 'en'
}) => {
  const [adminId, setAdminId] = useState<string>('admin@heatshield.gov.in');
  const [password, setPassword] = useState<string>('admin123');
  const [selectedRole, setSelectedRole] = useState<UserRole>('civic_authority');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const isHindi = language === 'hi';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Flexible credential check for ease of functioning
    if ((adminId.trim() === 'admin@heatshield.gov.in' || adminId.trim() === 'admin' || adminId.trim().toLowerCase().includes('ndma')) && password === 'admin123') {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        const authCallback = onAuthSuccess || onSuccessAuth;
        if (authCallback) {
          authCallback(selectedRole);
        }
        onClose();
      }, 700);
    } else {
      setErrorMessage(
        isHindi 
          ? 'अमान्य अधिकारी आईडी या पासवर्ड। कृपया डेमो क्रेडेंशियल का उपयोग करें।' 
          : 'Invalid Admin ID or Password. Please use demo credentials.'
      );
    }
  };

  const handleUseDemo = () => {
    setAdminId('admin@heatshield.gov.in');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <div 
      id="admin-auth-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        id="admin-auth-modal-card"
        className="bg-white border border-[#D6E0E5] rounded-lg w-full max-w-md p-5 sm:p-6 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 text-left text-[#263746]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D6E0E5] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-md bg-[#E8F1F5] border border-[#1E5A7A] flex items-center justify-center text-[#1E5A7A] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-[#12304A]">
                {isHindi ? 'नगरपालिका नियंत्रण कक्ष लॉगिन' : 'Authority & Dispatch Authentication'}
              </h3>
              <p className="text-xs text-[#657783]">
                {isHindi ? 'केवल अधिकृत अधिकारियों के लिए नियंत्रण केंद्र' : 'Restricted Municipal Dispatch & NDMA Console'}
              </p>
            </div>
          </div>
          <button
            id="admin-auth-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded text-[#657783] hover:text-[#12304A] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E8F1F5] text-[#317A5A] flex items-center justify-center mx-auto border border-[#317A5A]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-headline font-bold text-[#12304A] text-base">
              {isHindi ? 'अधिकार सत्यापित! प्रशासनिक पहुंच सक्षम।' : 'Authority Verified! Admin Session Granted.'}
            </h4>
            <p className="text-xs text-[#657783] font-mono">
              Unlocking Dispatch Controls & Emergency Protocols...
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Quick Demo Credentials Banner */}
            <div className="p-3 rounded-md bg-[#F4F1EA] border border-[#D6E0E5] flex items-start justify-between gap-2">
              <div className="text-xs text-[#263746]">
                <span className="font-bold text-[#12304A] block mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#1E5A7A]" />
                  {isHindi ? 'डेमो प्रशासनिक लॉगिन:' : 'Demo Authority Credentials:'}
                </span>
                <div className="font-mono text-[11px] text-[#657783] space-y-0.5">
                  <div>ID: <strong className="text-[#12304A]">admin@heatshield.gov.in</strong></div>
                  <div>Password: <strong className="text-[#12304A]">admin123</strong></div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseDemo}
                className="px-2.5 py-1 rounded bg-[#E8F1F5] hover:bg-[#D6E0E5] text-[#1E5A7A] text-[11px] font-bold border border-[#D6E0E5] transition-colors shrink-0 cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-md bg-[#F8E9E8] border border-[#A63D40] flex items-center gap-2 text-[#A63D40] text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Authority Role Selector */}
            <div>
              <label className="text-xs font-mono text-[#657783] block mb-1 font-bold">
                {isHindi ? 'प्रशासनिक भूमिका चुनें:' : 'Select Authority Designation:'}
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-white border border-[#D6E0E5] rounded-md px-3 py-2 text-xs text-[#12304A] font-sans focus:outline-none focus:border-[#1E5A7A] cursor-pointer"
              >
                <option value="civic_authority">
                  {isHindi ? 'नगरपालिका स्वास्थ्य अधिकारी (Civic Authority)' : 'Municipal Health Officer (Civic Authority)'}
                </option>
                <option value="hospital_triage">
                  {isHindi ? 'अस्पताल ट्राइएज और रीहाइड्रेशन प्रभारी' : 'Hospital Triage & Emergency Lead'}
                </option>
                <option value="system_admin">
                  {isHindi ? 'NDMA मौसम प्रणाली प्रशासक' : 'NDMA Meteorological System Admin'}
                </option>
              </select>
            </div>

            {/* Admin ID / Email */}
            <div>
              <label className="text-xs font-mono text-[#657783] block mb-1 font-bold">
                {isHindi ? 'अधिकारी आईडी या ईमेल:' : 'Official Admin ID / Email:'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#657783] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="admin@heatshield.gov.in"
                  required
                  className="w-full bg-white border border-[#D6E0E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#12304A] placeholder-[#657783] focus:outline-none focus:border-[#1E5A7A] font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-mono text-[#657783] block mb-1 font-bold">
                {isHindi ? 'पासवर्ड:' : 'Secret Authorization Key / Password:'}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#657783] absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-[#D6E0E5] rounded-md pl-9 pr-3 py-2 text-xs text-[#12304A] placeholder-[#657783] focus:outline-none focus:border-[#1E5A7A] font-mono"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#D6E0E5]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-white hover:bg-[#F4F1EA] text-[#263746] text-xs font-semibold border border-[#D6E0E5] transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-[#1E5A7A] hover:bg-[#164863] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isHindi ? 'प्रशासनिक पहुंच प्राप्त करें' : 'Authenticate & Unlock'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

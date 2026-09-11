import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, AlertCircle, X, CheckCircle2, Sparkles } from 'lucide-react';
import { UserRole, LanguageCode } from '../../types';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAuth: (role: UserRole) => void;
  language: LanguageCode;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessAuth,
  language
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
        onSuccessAuth(selectedRole);
        onClose();
      }, 800);
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        id="admin-auth-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldCheck className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-white">
                {isHindi ? 'नगरपालिका नियंत्रण कक्ष लॉगिन' : 'Authority & Admin Authentication'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHindi ? 'केवल अधिकृत अधिकारियों के लिए नियंत्रण केंद्र' : 'Restricted Municipal Dispatch & NDMA Console'}
              </p>
            </div>
          </div>
          <button
            id="admin-auth-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-headline font-bold text-white text-base">
              {isHindi ? 'अधिकार सत्यापित! प्रशासनिक पहुंच सक्षम।' : 'Authority Verified! Admin Session Granted.'}
            </h4>
            <p className="text-xs text-slate-400 font-mono">
              Unlocking Dispatch Controls & Broadcast Systems...
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Quick Demo Credentials Banner */}
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start justify-between gap-2">
              <div className="text-xs text-slate-300">
                <span className="font-bold text-orange-400 block mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isHindi ? 'डेमो प्रशासनिक लॉगिन:' : 'Demo Authority Credentials:'}
                </span>
                <div className="font-mono text-[11px] text-slate-400 space-y-0.5">
                  <div>ID: <strong className="text-white">admin@heatshield.gov.in</strong></div>
                  <div>Password: <strong className="text-white">admin123</strong></div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseDemo}
                className="px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[11px] font-bold border border-orange-500/30 transition-colors shrink-0 cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Authority Role Selector */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5 font-bold">
                {isHindi ? 'प्रशासनिक भूमिका चुनें:' : 'Select Authority Designation:'}
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500 cursor-pointer"
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
              <label className="text-xs font-mono text-slate-400 block mb-1.5 font-bold">
                {isHindi ? 'अधिकारी आईडी या ईमेल:' : 'Official Admin ID / Email:'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="admin@heatshield.gov.in"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5 font-bold">
                {isHindi ? 'पासवर्ड:' : 'Secret Authorization Key / Password:'}
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
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

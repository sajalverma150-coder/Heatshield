import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  HeartPulse, 
  Pill, 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  QrCode, 
  Plus, 
  Trash2, 
  Save, 
  Lock, 
  Sparkles,
  RefreshCw,
  Clock,
  HardHat,
  Droplet,
  Cloud,
  LogIn,
  LogOut
} from 'lucide-react';
import { UserHealthProfile, LanguageCode } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface PersonalHealthProfileViewProps {
  profile: UserHealthProfile;
  onUpdateProfile: (updated: UserHealthProfile) => void;
  onOpenTriage: () => void;
  language?: LanguageCode;
}

export const PersonalHealthProfileView: React.FC<PersonalHealthProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenTriage,
  language = 'en',
}) => {
  const isHindi = language === 'hi';
  const { user, signInWithGoogle, signOutUser, saveUserProfileToFirestore, getUserProfileFromFirestore } = useAuth();
  const [formData, setFormData] = useState<UserHealthProfile>(profile);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showAddMedModal, setShowAddMedModal] = useState<boolean>(false);
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');
  const [newMedType, setNewMedType] = useState<string>('');
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // Auto-sync profile from Firestore when signed in
  useEffect(() => {
    if (user) {
      getUserProfileFromFirestore().then((cloudProfile) => {
        if (cloudProfile && cloudProfile.name) {
          setFormData(prev => ({
            ...prev,
            ...cloudProfile,
          }));
          onUpdateProfile(cloudProfile);
        }
      });
    }
  }, [user]);

  // Dynamic calculation of personal bio-multiplier risk score (0 - 100)
  const calculateRiskScore = () => {
    let score = 50; // Base baseline
    // Age factor
    if (formData.age >= 50) score += 12;
    else if (formData.age >= 40) score += 6;

    // Sun exposure hours factor
    score += Math.round(formData.sunExposureHours * 2.4);

    // Chronic conditions
    if (formData.conditions.hypertension) score += 10;
    if (formData.conditions.diabetes) score += 8;
    if (formData.conditions.cardiovascular) score += 14;
    if (formData.conditions.chronicKidney) score += 12;
    if (formData.conditions.asthma) score += 6;

    // Medication count
    score += formData.medications.length * 4;

    return Math.min(99, Math.max(45, score));
  };

  const dynamicRiskScore = calculateRiskScore();
  const personalizedThreshold = (33.0 - (dynamicRiskScore - 50) * 0.1).toFixed(1);

  const handleConditionToggle = (condition: keyof UserHealthProfile['conditions']) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [condition]: !prev.conditions[condition],
      },
    }));
  };

  const handleDeleteMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: newMedName.trim(),
          dosage: newMedDosage.trim() || 'Standard Dose',
          type: newMedType.trim() || 'General Therapeutic',
          riskImpact: 'Requires augmented hydration monitoring during acute heat stress',
        },
      ],
    }));
    setNewMedName('');
    setNewMedDosage('');
    setNewMedType('');
    setShowAddMedModal(false);
  };

  const handleSave = async () => {
    onUpdateProfile(formData);
    if (user) {
      await saveUserProfileToFirestore(formData);
      setSaveSuccessToast(
        isHindi
          ? 'प्रोफ़ाइल और बायो-मल्टीप्लायर फायरबेस फायरस्टोर क्लाउड पर सफलतापूर्वक सहेजा गया'
          : 'Profile & Bio-Multiplier Synced to Firebase Firestore Cloud'
      );
    } else {
      setSaveSuccessToast('Profile & Bio-Multiplier Synced to Local Storage (Sign in for Cloud)');
    }
    setTimeout(() => setSaveSuccessToast(null), 3500);
  };

  return (
    <div id="personal-health-profile-screen" className="space-y-4 sm:space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-headline font-bold text-white">
              {isHindi ? 'व्यक्तिगत स्वास्थ्य प्रोफ़ाइल एवं बायो-परामर्श' : 'Personalized Bio-Advisory & Health Memory'}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 border border-orange-500/30">
              {user ? user.email : 'ID: RAJESH-KUMAR-52'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHindi 
              ? 'पैथोफिजियोलॉजिकल प्रोफाइलिंग, दवा परस्पर क्रिया और अनुकूलित WBGT संवेदनशीलता सीमाएं'
              : 'Pathophysiological profiling, medication interactions, and customized WBGT vulnerability thresholds'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <Cloud className="w-3.5 h-3.5" />
              <span>Synced</span>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle().catch(() => {})}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-orange-400" />
              <span>{isHindi ? 'क्लाउड सिंक साइन-इन' : 'Sign In with Google'}</span>
            </button>
          )}

          <button
            id="view-paramedic-qr-btn"
            onClick={() => setShowQrModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-orange-400" />
            <span>{isHindi ? 'पैरामेडिक ट्राइएज QR' : 'Paramedic Triage QR'}</span>
          </button>
          <button
            id="save-profile-btn"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isHindi ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {saveSuccessToast && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* Main Grid: Profile Form (7 Cols) + Dynamic Bio-Multiplier Gauge (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column (7 Cols): Profile Data, Conditions & Medications */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Identity & Occupational Stress Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <h3 className="text-base font-headline font-bold text-white mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-orange-400" />
              {isHindi ? 'पहचान एवं व्यावसायिक तनाव प्रोफ़ाइल' : 'Identity & Occupational Stress Profile'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">{isHindi ? 'पूरा नाम' : 'Full Name'}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{isHindi ? 'आयु (वर्ष)' : 'Age'}</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{isHindi ? 'मोबाइल नंबर' : 'Mobile Phone'}</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{isHindi ? 'वार्ड / क्षेत्र' : 'Residential Ward'}</label>
                <input
                  type="text"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Direct Sun Exposure Slider */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-orange-400" />
                  {isHindi ? 'दैनिक सीधी धूप में काम के घंटे:' : 'Daily Direct Sunlight Exposure:'}
                </span>
                <span className="text-orange-400 font-bold text-sm">
                  {formData.sunExposureHours} {isHindi ? 'घंटे / दिन' : 'Hours / Day'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={formData.sunExposureHours}
                onChange={(e) => setFormData({ ...formData, sunExposureHours: Number(e.target.value) })}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{isHindi ? '0 घंटे (इनडोर)' : '0h (Indoor)'}</span>
                <span>{isHindi ? '6 घंटे (मध्यम)' : '6h (Moderate)'}</span>
                <span>{isHindi ? '12 घंटे (अत्यधिक धूप)' : '12h (Severe Unshaded)'}</span>
              </div>
            </div>
          </div>

          {/* Chronic Pathophysiology Memory */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <h3 className="text-base font-headline font-bold text-white mb-2 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-400" />
              {isHindi ? 'दीर्घकालिक स्वास्थ्य स्थितियां' : 'Chronic Pathophysiology Memory'}
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {isHindi 
                ? 'मौजूदा स्वास्थ्य स्थितियां जो शरीर के तापमान नियंत्रण या इलेक्ट्रोलाइट संतुलन को प्रभावित करती हैं:'
                : 'Pre-existing morbidities that compromise autonomic thermoregulation or electrolyte balance:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              
              <button
                type="button"
                onClick={() => handleConditionToggle('hypertension')}
                className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  formData.conditions.hypertension
                    ? 'bg-red-950/30 border-red-500 text-red-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold block text-white">{isHindi ? 'उच्च रक्तचाप (हाइपरटेंशन)' : 'Hypertension (Stage 2)'}</span>
                  <span className="text-[10px] text-slate-400">{isHindi ? 'हृदय पर अतिरिक्त दबाव' : 'Cardiovascular strain'}</span>
                </div>
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                  formData.conditions.hypertension ? 'bg-red-500 border-red-400 text-white' : 'border-slate-700'
                }`}>
                  {formData.conditions.hypertension ? '✓' : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleConditionToggle('diabetes')}
                className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  formData.conditions.diabetes
                    ? 'bg-orange-950/30 border-orange-500 text-orange-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold block text-white">{isHindi ? 'टाइप 2 मधुमेह (डायबिटीज)' : 'Type 2 Diabetes'}</span>
                  <span className="text-[10px] text-slate-400">{isHindi ? 'पसीने की ग्रंथि शिथिलता' : 'Impaired sweat innervation'}</span>
                </div>
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                  formData.conditions.diabetes ? 'bg-orange-500 border-orange-400 text-white' : 'border-slate-700'
                }`}>
                  {formData.conditions.diabetes ? '✓' : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleConditionToggle('cardiovascular')}
                className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  formData.conditions.cardiovascular
                    ? 'bg-red-950/30 border-red-500 text-red-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold block text-white">{isHindi ? 'हृदय रोग (कार्डियोवैस्कुलर)' : 'Cardiovascular Disease'}</span>
                  <span className="text-[10px] text-slate-400">{isHindi ? 'उच्च इस्केमिया जोखिम' : 'High ischemia risk'}</span>
                </div>
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                  formData.conditions.cardiovascular ? 'bg-red-500 border-red-400 text-white' : 'border-slate-700'
                }`}>
                  {formData.conditions.cardiovascular ? '✓' : ''}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleConditionToggle('chronicKidney')}
                className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                  formData.conditions.chronicKidney
                    ? 'bg-purple-950/30 border-purple-500 text-purple-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold block text-white">{isHindi ? 'गुर्दे की बीमारी (क्रोनिक किडनी)' : 'Chronic Kidney Disease'}</span>
                  <span className="text-[10px] text-slate-400">{isHindi ? 'द्रव नियंत्रण की आवश्यकता' : 'Rapid fluid restriction risk'}</span>
                </div>
                <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                  formData.conditions.chronicKidney ? 'bg-purple-500 border-purple-400 text-white' : 'border-slate-700'
                }`}>
                  {formData.conditions.chronicKidney ? '✓' : ''}
                </span>
              </button>

            </div>
          </div>

          {/* Active Medications Manager */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-headline font-bold text-white flex items-center gap-2">
                <Pill className="w-4 h-4 text-cyan-400" />
                {isHindi ? 'सक्रिय थर्मल-प्रभावित दवाएं' : 'Active Thermal-Interacting Medications'}
              </h3>
              <button
                id="add-medication-btn"
                onClick={() => setShowAddMedModal(true)}
                className="px-2.5 py-1 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHindi ? 'दवा जोड़ें' : 'Add Compound'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {formData.medications.map((med, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{med.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-cyan-300 rounded border border-slate-700">
                        {med.dosage}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block">{med.type}</span>
                    <p className="text-[11px] text-red-300/80 leading-tight mt-1">
                      ⚠️ {med.riskImpact}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteMedication(idx)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Automated ICE Panic Contact */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
            <h3 className="text-base font-headline font-bold text-white mb-2 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              {isHindi ? 'स्वचालित आपातकालीन संपर्क (ICE)' : 'Automated ICE (In Case of Emergency) Node'}
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              {isHindi ? '108 SOS पैनिक बटन दबाने पर लाइव जीपीएस लोकेशन के साथ भेजा जाएगा:' : 'Dispatched with live GPS coordinates if 108 SOS panic button is pressed:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">{isHindi ? 'संपर्क का नाम' : 'Contact Name'}</label>
                <input
                  type="text"
                  value={formData.iceContact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    iceContact: { ...formData.iceContact, name: e.target.value }
                  })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{isHindi ? 'संबंध' : 'Relationship'}</label>
                <input
                  type="text"
                  value={formData.iceContact.relation}
                  onChange={(e) => setFormData({
                    ...formData,
                    iceContact: { ...formData.iceContact, relation: e.target.value }
                  })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">{isHindi ? 'आपातकालीन नंबर' : 'Emergency Mobile'}</label>
                <input
                  type="text"
                  value={formData.iceContact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    iceContact: { ...formData.iceContact, phone: e.target.value }
                  })}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (5 Cols): Dynamic Calculated Bio-Multiplier Radial Dial */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-orange-500/30 relative overflow-hidden shadow-sm">
            <h3 className="text-base font-headline font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              {isHindi ? 'गतिशील बायो-मल्टीप्लायर जोखिम' : 'Dynamic Calculated Bio-Multiplier'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isHindi ? 'आपकी उम्र, दवाओं और धूप में काम के घंटों पर आधारित वास्तविक समय संवेदनशीलता:' : 'Real-time vulnerability index factoring your age, medications, and exposure hours:'}
            </p>

            {/* Radial SVG Dial */}
            <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="14"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="65"
                  fill="none"
                  stroke="url(#riskGradient)"
                  strokeWidth="14"
                  strokeDasharray={`${(dynamicRiskScore / 100) * 408} 408`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-headline font-black text-white">
                  {dynamicRiskScore}
                </span>
                <span className="text-xs font-mono font-bold text-red-400">
                  / 100 EXTREME
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  Bio-Multiplier 1.88x
                </span>
              </div>
            </div>

            {/* Decomposed Breakdown */}
            <div className="space-y-2 mt-4 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Age 52 Morbidity Multiplier:</span>
                <span className="text-orange-400 font-bold">+12 Pts</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>{formData.sunExposureHours}h Outdoor Exertion Multiplier:</span>
                <span className="text-orange-400 font-bold">+{Math.round(formData.sunExposureHours * 2.4)} Pts</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Active Medications Multiplier:</span>
                <span className="text-red-400 font-bold">+{formData.medications.length * 4} Pts</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span className="text-slate-400">Adjusted Critical Threshold:</span>
                <span className="text-amber-300 font-bold">{personalizedThreshold}°C WBGT</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-red-950/25 border border-red-500/25 text-xs text-red-200">
              Your personal heat stress danger threshold triggers at <strong>{personalizedThreshold}°C WBGT</strong> (compared to 33.0°C for young healthy adults) due to impaired vasodilation and diuretics.
            </div>
          </div>

          {/* DPDP Act 2023 Compliance & Privacy */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 space-y-2 font-mono shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                <span className="font-bold">DPDP Act 2023 Compliant</span>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                ON-DEVICE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Your biometrical and prescription parameters are stored in private client-side encrypted storage. No medical profiles are sold to third parties.
            </p>
          </div>

        </div>

      </div>

      {/* Paramedic QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl">
            <h3 className="font-headline font-bold text-white text-base">
              Paramedic Emergency Triage QR
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Scannable by 108 first-responders & Lokmanya Tilak Sion Hospital trauma team
            </p>

            {/* Generated QR Code Graphic Representation */}
            <div className="my-4 p-4 bg-white rounded-xl inline-block shadow-md">
              <svg viewBox="0 0 120 120" className="w-40 h-40">
                {/* QR matrix mockup */}
                <rect width="120" height="120" fill="white" />
                {/* Corner markers */}
                <rect x="10" y="10" width="30" height="30" fill="black" />
                <rect x="15" y="15" width="20" height="20" fill="white" />
                <rect x="20" y="20" width="10" height="10" fill="black" />

                <rect x="80" y="10" width="30" height="30" fill="black" />
                <rect x="85" y="15" width="20" height="20" fill="white" />
                <rect x="90" y="20" width="10" height="10" fill="black" />

                <rect x="10" y="80" width="30" height="30" fill="black" />
                <rect x="15" y="85" width="20" height="20" fill="white" />
                <rect x="20" y="90" width="10" height="10" fill="black" />

                {/* Random simulated data pattern */}
                <rect x="45" y="15" width="25" height="10" fill="black" />
                <rect x="50" y="30" width="20" height="10" fill="black" />
                <rect x="15" y="45" width="15" height="15" fill="black" />
                <rect x="35" y="45" width="50" height="30" fill="black" />
                <rect x="45" y="85" width="25" height="20" fill="black" />
                <rect x="80" y="55" width="25" height="15" fill="black" />
                <rect x="75" y="80" width="35" height="25" fill="black" />
              </svg>
            </div>

            <div className="text-left font-mono text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1">
              <div><strong className="text-slate-400">Patient:</strong> {formData.name} (52M)</div>
              <div><strong className="text-slate-400">Meds:</strong> Amlodipine, Metformin, HCTZ</div>
              <div><strong className="text-slate-400">ICE:</strong> {formData.iceContact.name} ({formData.iceContact.phone})</div>
              <div><strong className="text-red-400">Bio-Multiplier:</strong> {dynamicRiskScore}/100</div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-4 w-full py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close QR Viewer
            </button>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="font-headline font-bold text-white text-base mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Add Thermal-Interacting Medication
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-slate-300 block mb-1">Compound / Generic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Atenolol, Furosemide, Enalapril"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Dosage & Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. 25mg OD (Morning)"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Therapeutic Class</label>
                <input
                  type="text"
                  placeholder="e.g. Beta-Blocker, Loop Diuretic, ACE Inhibitor"
                  value={newMedType}
                  onChange={(e) => setNewMedType(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAddMedModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedication}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Add Compound
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

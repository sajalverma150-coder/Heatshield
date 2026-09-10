import { LanguageCode } from '../types';

export interface TranslationDictionary {
  // Navigation & Common
  appName: string;
  subTitle: string;
  nationalWarning: string;
  overview: string;
  coolingFinder: string;
  protocols: string;
  forecast: string;
  alerts: string;
  profile: string;
  clinicalReport: string;
  monitoringStation: string;
  changeStation: string;
  change: string;
  activeStation: string;
  emergencyHotlines: string;
  ambulance108: string;
  disasterMgmt: string;
  police: string;
  aiTriage: string;
  sos108: string;
  emergencySos: string;
  open: string;
  closed: string;
  searchCityPrompt: string;
  language: string;
  english: string;
  hindi: string;
  pushAlerts: string;
  desktopCanvas: string;
  phoneSimulator: string;
  role: string;
  citizen: string;
  civicAuthority: string;
  hospitalTriage: string;
  systemAdmin: string;
  saveProfile: string;
  dataStream: string;
  liveApi: string;
  imdHeatwave: string;
  more: string;
  menu: string;
  live: string;
  shelters: string;
  dossier: string;
  close: string;
  back: string;
  cancel: string;
  confirm: string;
  download: string;
  exportPdf: string;
  exportJson: string;
  copied: string;
  copySummary: string;
  callNow: string;
  navigate: string;
  directions: string;
  refresh: string;
  viewAll: string;
  extremeRisk: string;
  findShelter: string;
  logHydration: string;
  call108: string;
  triageAI: string;

  // Ticker
  tickerAlert: string;
  tickerStations: string;

  // Telemetry View
  codeRedWarning: string;
  codeRedDesc: string;
  currentVitals: string;
  heatIndex: string;
  wbgt: string;
  utci: string;
  humidity: string;
  windSpeed: string;
  solarRadiation: string;
  sweatLossRate: string;
  uhiAnomaly: string;
  dryBulb: string;
  curfewWindow: string;
  stayIndoors: string;
  safeHours: string;
  grapStage: string;
  hydrationTracker: string;
  hydrationToday: string;
  targetIntake: string;
  quickLog250: string;
  quickLog500: string;
  logWaterSuccess: string;
  lastLog: string;
  noLogYet: string;
  nearestCoolingPoint: string;
  walkTime: string;
  distance: string;
  bedsAvailable: string;
  iceBaths: string;
  satelliteHeatMap: string;
  imdCertifiedStation: string;
  stationId: string;
  wardZone: string;
  pinCode: string;

  // Cooling Finder View
  findCoolingTitle: string;
  findCoolingSubtitle: string;
  searchCoolingPlaceholder: string;
  filterAll: string;
  filterAc: string;
  filterWater: string;
  filterMedical: string;
  filterShaded: string;
  facilityStatusOpen: string;
  facilityStatusCritical: string;
  facilityStatusFull: string;
  occupancy: string;
  indoorTemperature: string;
  facilitiesFound: string;
  startNavigation: string;
  activeRouteTo: string;
  cancelRoute: string;
  directCall: string;
  amenities: string;

  // Protocols View
  protocolsTitle: string;
  protocolsSubtitle: string;
  emergencyChecklistTitle: string;
  heatExhaustion: string;
  heatStroke: string;
  symptomsTitle: string;
  immediateActionTitle: string;
  exhaustionSymptoms: string;
  exhaustionAction: string;
  strokeSymptoms: string;
  strokeAction: string;
  ndmaStage4Directives: string;
  directiveLabor: string;
  directiveWater: string;
  directiveSchools: string;
  directiveHospitals: string;
  hydrationRecipeTitle: string;
  hydrationRecipeDesc: string;
  vulnerablePopulations: string;
  elderlyRisk: string;
  childrenRisk: string;
  chronicRisk: string;

  // Forecast View
  forecastTitle: string;
  forecastSubtitle: string;
  confidenceScore: string;
  sevenDayOverview: string;
  maxTemp: string;
  minTemp: string;
  peakWbgt: string;
  projectedHospitalSurge: string;
  diurnalThermalCurve: string;
  shapDrivers: string;
  eocAction: string;
  requestBeds: string;
  issueCurfew: string;

  // Emergency Alerts View
  alertsTitle: string;
  alertsSubtitle: string;
  activeAlertBanner: string;
  audioObdNotice: string;
  listenAudio: string;
  stopAudio: string;
  cbsTitle: string;
  englishMessage: string;
  hindiMessage: string;
  smsBroadcastsSent: string;
  whatsappSent: string;
  audioCallsConnected: string;
  triggerCbsBroadcast: string;
  cbsSentSuccess: string;

  // Profile View
  profileTitle: string;
  profileSubtitle: string;
  personalInfo: string;
  fullName: string;
  ageYears: string;
  phone: string;
  wardArea: string;
  occupation: string;
  sunExposureTitle: string;
  hoursPerDay: string;
  chronicConditionsTitle: string;
  hypertension: string;
  cardiovascular: string;
  diabetes: string;
  chronicKidney: string;
  asthma: string;
  medicationsTitle: string;
  addMedication: string;
  noMedications: string;
  iceTitle: string;
  contactName: string;
  relationship: string;
  contactPhone: string;
  saveChanges: string;
  savedSuccess: string;
  paramedicQr: string;
  paramedicQrDesc: string;
  showQr: string;
  phsiMultiplier: string;

  // Health Report View
  reportTitle: string;
  reportSubtitle: string;
  patientProfileSummary: string;
  ambientTelemetrySummary: string;
  phsiDiagnostic: string;
  coreTempElevation: string;
  vasodilationImpedance: string;
  cardiacShuntLoad: string;
  netFluidDeficit: string;
  armstrongTitle: string;
  pharmacokineticsTitle: string;
  hydrationScheduleTitle: string;
  morningHydration: string;
  curfewMandatory: string;
  eveningRecovery: string;
  nearestFacilityNotice: string;

  // Modals
  triageTitle: string;
  triageSubtitle: string;
  call108Title: string;
  call108Subtitle: string;
  gpsNavTitle: string;
  pushSettingsTitle: string;
}

export const APP_TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    // Navigation & Common
    appName: 'HeatShield AI',
    subTitle: 'Tactical Heatwave Warning & Bio-Advisory',
    nationalWarning: 'National Heat Early Warning',
    overview: 'Live Telemetry',
    coolingFinder: 'Safe Zones & Cooling',
    protocols: 'Action Protocols',
    forecast: '7-Day Horizon',
    alerts: 'Emergency Alerts',
    profile: 'Health Memory',
    clinicalReport: 'Clinical Health Dossier',
    monitoringStation: 'Monitoring Station',
    changeStation: 'Change',
    change: 'Change',
    activeStation: 'Active Station',
    emergencyHotlines: 'Emergency Hotlines',
    ambulance108: 'Ambulance (108)',
    disasterMgmt: 'Disaster Mgmt (1070/1077)',
    police: 'Police (112)',
    aiTriage: 'AI Triage',
    sos108: '108 SOS',
    emergencySos: 'Emergency SOS',
    open: 'Open',
    closed: 'Closed',
    searchCityPrompt: 'Search Indian cities or use GPS',
    language: 'Language / भाषा',
    english: 'English (Default)',
    hindi: 'हिन्दी (Hindi)',
    pushAlerts: 'Push & Siren Alerts',
    desktopCanvas: 'Desktop Canvas',
    phoneSimulator: 'Phone Simulator',
    role: 'Role / भूमिका',
    citizen: 'Citizen / Public',
    civicAuthority: 'Disaster Authority / DM',
    hospitalTriage: 'Hospital Paramedic',
    systemAdmin: 'Meteorological Admin',
    saveProfile: 'Save Profile',
    dataStream: 'Data Stream',
    liveApi: 'Live Open-Meteo',
    imdHeatwave: 'IMD Red Alert Wave',
    more: 'More',
    menu: 'Menu',
    live: 'Live',
    shelters: 'Shelters',
    dossier: 'Dossier',
    close: 'Close',
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    download: 'Download',
    exportPdf: 'Print / PDF',
    exportJson: 'Export JSON',
    copied: 'Copied!',
    copySummary: 'Copy Summary',
    callNow: 'Call Now',
    navigate: 'Navigate',
    directions: 'Get Directions',
    refresh: 'Refresh Telemetry',
    viewAll: 'View All',
    extremeRisk: 'EXTREME HEAT DANGER',
    findShelter: 'Find Nearest AC Shelter',
    logHydration: 'Log Hydration (+250ml)',
    call108: 'Emergency SOS (108)',
    triageAI: 'AI Triage Diagnostic',

    // Ticker
    tickerAlert: 'CRITICAL HEATWAVE ALERT',
    tickerStations: 'REAL-TIME MONITORING',

    // Telemetry View
    codeRedWarning: 'CODE RED • EXTREME HEAT CURFEW IN EFFECT',
    codeRedDesc: 'Ambient WBGT has breached dangerous physiological limits. Outdoor manual labor is banned by order of NDMA.',
    currentVitals: 'Real-Time Biometeorological Vitals',
    heatIndex: 'Heat Index',
    wbgt: 'Wet Bulb Globe Temp (WBGT)',
    utci: 'Universal Thermal Climate Index',
    humidity: 'Relative Humidity',
    windSpeed: 'Surface Wind Speed',
    solarRadiation: 'Solar Radiative Flux',
    sweatLossRate: 'Estimated Sweat Loss',
    uhiAnomaly: 'Urban Heat Island Delta',
    dryBulb: 'Ambient Dry-Bulb',
    curfewWindow: 'Peak Radiation Curfew Window',
    stayIndoors: 'STAY INDOORS • MANDATORY REST PERIOD',
    safeHours: 'Safe Outdoor Exposure Window',
    grapStage: 'GRAP Action Stage',
    hydrationTracker: 'Hydration & Electrolyte Balancer',
    hydrationToday: "Today's Intake",
    targetIntake: 'Daily Target',
    quickLog250: '+250ml Water / ORS',
    quickLog500: '+500ml Chilled ORS',
    logWaterSuccess: 'Hydration recorded successfully',
    lastLog: 'Last intake logged',
    noLogYet: 'No logs yet today - hydrate now!',
    nearestCoolingPoint: 'Nearest Emergency AC Cooling Center',
    walkTime: 'mins walk',
    distance: 'away',
    bedsAvailable: 'Emergency Heat Beds',
    iceBaths: 'Cold Water Immersion Baths',
    satelliteHeatMap: 'NASA VIIRS High-Resolution Thermal Sensor Grid',
    imdCertifiedStation: 'IMD AWS Station Telemetry Live',
    stationId: 'Station ID',
    wardZone: 'Ward / Climate Zone',
    pinCode: 'Postal Code',

    // Cooling Finder View
    findCoolingTitle: 'Emergency Cooling Centers & Hydration Network',
    findCoolingSubtitle: 'Verified public air-conditioned relief centers, hydration stations, and emergency heatstroke stabilization units',
    searchCoolingPlaceholder: 'Search by facility name, ward, landmark or area...',
    filterAll: 'All Facilities',
    filterAc: 'AC Relief Centers',
    filterWater: 'Drinking Water Kiosks',
    filterMedical: 'Triage Hospitals',
    filterShaded: 'Cool Shaded Parks',
    facilityStatusOpen: 'OPEN NOW',
    facilityStatusCritical: 'NEAR CAPACITY',
    facilityStatusFull: 'FULL',
    occupancy: 'Occupancy',
    indoorTemperature: 'Indoor Temperature',
    facilitiesFound: 'cooling facilities available in',
    startNavigation: 'Start Turn-by-Turn GPS',
    activeRouteTo: 'Active Navigation To',
    cancelRoute: 'Exit Navigation',
    directCall: 'Contact Facility',
    amenities: 'Key Amenities',

    // Protocols View
    protocolsTitle: 'Heatwave Action Protocols & Clinical First-Aid',
    protocolsSubtitle: 'National Disaster Management Authority (NDMA) verified heat emergency directives and life-saving resuscitation algorithms',
    emergencyChecklistTitle: 'Emergency First-Aid: Heat Exhaustion vs. Life-Threatening Heatstroke',
    heatExhaustion: 'Heat Exhaustion (Early Warning)',
    heatStroke: 'Heatstroke (Code Red Emergency)',
    symptomsTitle: 'Recognizable Clinical Symptoms',
    immediateActionTitle: 'Immediate Life-Saving Protocol',
    exhaustionSymptoms: 'Heavy sweating, pale/clammy skin, fast weak pulse, dizziness, nausea, muscle cramps, headache.',
    exhaustionAction: 'Move to AC shelter immediately, loosen tight clothing, sip cool salted water or ORS slowly, apply wet cloths to neck and forehead.',
    strokeSymptoms: 'Core temperature >40°C (104°F), hot red dry skin or heavy sweating, confusion, slurred speech, seizures, loss of consciousness.',
    strokeAction: 'DIAL 108 IMMEDIATELY! Do NOT give oral fluids if unconscious. Immerse patient in cold water tub up to neck or pack ice in groin, armpits and neck.',
    ndmaStage4Directives: 'NDMA Stage IV Labor Curfew & Public Directives',
    directiveLabor: 'Compulsory ban on outdoor construction, agricultural, and unshaded manual labor between 11:30 AM and 4:30 PM.',
    directiveWater: 'Employers must provide chilled electrolytes, salted buttermilk, or WHO-ORS kiosks every 100 meters.',
    directiveSchools: 'Schools and non-air-conditioned educational institutions must suspend outdoor activities or operate on morning-only shifts.',
    directiveHospitals: 'District civil hospitals must activate dedicated 24x7 Air-Conditioned Heat Emergency Wards with ice-bath immersion tubs.',
    hydrationRecipeTitle: 'Standard WHO-ORS Electrolyte Preparation at Home',
    hydrationRecipeDesc: 'Clean Drinking Water (1 Litre) + 6 level teaspoons Sugar (24g) + 1/2 level teaspoon Common Salt (3g). Stir until dissolved completely.',
    vulnerablePopulations: 'High-Vulnerability Cohorts',
    elderlyRisk: 'Senior citizens (>65 yrs): Impaired thirst reflex and delayed cardiovascular vasodilation.',
    childrenRisk: 'Infants & Children: Lower sweating capacity and faster core body temperature rise.',
    chronicRisk: 'Chronic illness patients (Diabetes, Hypertension, Kidney disease): Heightened electrolyte imbalance danger.',

    // Forecast View
    forecastTitle: '7-Day Predictive Heatwave & Physiological Strain Horizon',
    forecastSubtitle: 'Calibrated AI predictive forecasting for temperatures, wet-bulb globe strain, and municipal hospital surge load',
    confidenceScore: 'AI Model Confidence',
    sevenDayOverview: '7-Day Synoptic Weather Matrix',
    maxTemp: 'Max Temp',
    minTemp: 'Min Temp',
    peakWbgt: 'Peak WBGT',
    projectedHospitalSurge: 'Projected Hospital Admissions',
    diurnalThermalCurve: 'Hourly Diurnal WBGT Stress Curve',
    shapDrivers: 'Key Meteorological Drivers (SHAP Analysis)',
    eocAction: 'Emergency Operations Center (EOC) Pre-emptive Trigger',
    requestBeds: 'Requisition 50 Additional Heatbeds',
    issueCurfew: 'Broadcast NDMA Curfew Advisory',

    // Emergency Alerts View
    alertsTitle: 'Civil Defense & Emergency Warning Dispatch Console',
    alertsSubtitle: 'Authorized disaster management broadcast channel for acoustic sirens, Cell Broadcast (CBS), and multi-lingual voice alerts',
    activeAlertBanner: 'Active Red Alert Warning Broadcast',
    audioObdNotice: 'Acoustic Voice Siren & IVR Radio Broadcast',
    listenAudio: 'Play Hindi Audio Broadcast',
    stopAudio: 'Stop Audio',
    cbsTitle: 'Direct Citizen Alert Distribution Matrix',
    englishMessage: 'English (Central Advisory)',
    hindiMessage: 'हिन्दी (National Official Advisory)',
    smsBroadcastsSent: 'SMS Delivered',
    whatsappSent: 'WhatsApp Alerts',
    audioCallsConnected: 'Voice OBD Connected',
    triggerCbsBroadcast: 'Trigger Instant Cell Broadcast (CBS)',
    cbsSentSuccess: 'Emergency Alert Transmitted Successfully to All Wards!',

    // Profile View
    profileTitle: 'Personalized Heat Vulnerability & Health Profile',
    profileSubtitle: 'Configure your age, chronic ailments, medications, and daily outdoor hours to compute your personalized Heat Strain Index',
    personalInfo: 'Personal Demographics',
    fullName: 'Full Name',
    ageYears: 'Age (Years)',
    phone: 'Phone Number',
    wardArea: 'Ward / Locality',
    occupation: 'Occupation',
    sunExposureTitle: 'Daily Direct Sun Exposure',
    hoursPerDay: 'Hours / Day Outdoors',
    chronicConditionsTitle: 'Chronic Pre-Existing Medical Conditions',
    hypertension: 'Hypertension (High Blood Pressure)',
    cardiovascular: 'Cardiovascular / Heart Disease',
    diabetes: 'Diabetes Mellitus',
    chronicKidney: 'Chronic Kidney Disease (CKD)',
    asthma: 'Asthma / Respiratory Conditions',
    medicationsTitle: 'Active Prescribed Medications',
    addMedication: '+ Add Medication',
    noMedications: 'No high-risk medications logged',
    iceTitle: 'In Case of Emergency (ICE) Contact',
    contactName: 'Contact Name',
    relationship: 'Relationship',
    contactPhone: 'Contact Phone',
    saveChanges: 'Save Health Profile',
    savedSuccess: 'Profile saved to local memory!',
    paramedicQr: 'Paramedic Emergency Triage QR Code',
    paramedicQrDesc: 'Display this fast QR code to paramedics or doctors at any hospital triage desk to instantly load your chronic conditions and medications without unlocking your phone.',
    showQr: 'View Paramedic QR Card',
    phsiMultiplier: 'Personalized Physiological Strain Multiplier',

    // Health Report View
    reportTitle: 'Clinical Heat Strain & Bio-Advisory Dossier',
    reportSubtitle: 'Physiological Strain Index (PHSI), urine hydration assessment, and custom 24-hour hydration recovery protocol',
    patientProfileSummary: 'Patient Profile & Vulnerability Cohort',
    ambientTelemetrySummary: 'Ambient Thermal Telemetry',
    phsiDiagnostic: 'Physiological Heat Strain Index (PHSI)',
    coreTempElevation: 'Core Temp Elevation',
    vasodilationImpedance: 'Vasodilation Impedance',
    cardiacShuntLoad: 'Cardiac Shunt Load',
    netFluidDeficit: 'Net Fluid Deficit',
    armstrongTitle: 'Armstrong 8-Level Urine Hydration Color Matrix',
    pharmacokineticsTitle: 'Active Medications & Thermal Pharmacokinetics',
    hydrationScheduleTitle: 'Customized 24-Hour Clinical Fluid & Shelter Schedule',
    morningHydration: 'Morning Pre-Hydration (06:00 – 10:00 IST)',
    curfewMandatory: 'Peak Curfew (Mandatory 12:30 – 16:30 IST)',
    eveningRecovery: 'Evening Cellular Recovery (16:30 – 21:00 IST)',
    nearestFacilityNotice: 'Nearest Emergency Heatstroke Stabilization Center',

    // Modals
    triageTitle: 'AI Heat Emergency Symptom Triage',
    triageSubtitle: 'Answer 4 critical clinical questions to determine if immediate hospital resuscitation is required',
    call108Title: 'Connecting to 108 Emergency Ambulance Dispatch',
    call108Subtitle: 'Transmitting live GPS coordinates and biometric profile to nearest State Emergency Operations Center',
    gpsNavTitle: 'Live Route Guidance to Cooling Facility',
    pushSettingsTitle: 'Emergency Siren & Push Notification Settings',
  },
  hi: {
    // Navigation & Common
    appName: 'हीटशील्ड एआई',
    subTitle: 'रणनीतिक लू पूर्व चेतावनी व स्वास्थ्य सुरक्षा प्रणाली',
    nationalWarning: 'राष्ट्रीय भीषण लू पूर्व चेतावनी प्रणाली',
    overview: 'लाइव टेलीमेट्री',
    coolingFinder: 'सुरक्षित शीत केंद्र व जल',
    protocols: 'सुरक्षा प्रोटोकॉल व प्राथमिक उपचार',
    forecast: '७-दिवसीय पूर्वानुमान',
    alerts: 'आपातकालीन अलर्ट व सायरन',
    profile: 'व्यक्तिगत स्वास्थ्य स्मृति',
    clinicalReport: 'क्लीनिकल स्वास्थ्य डॉसियर',
    monitoringStation: 'मौसम निगरानी केंद्र',
    changeStation: 'बदलें',
    change: 'बदलें',
    activeStation: 'सक्रिय केंद्र',
    emergencyHotlines: 'आपातकालीन हेल्पलाइन',
    ambulance108: 'एम्बुलेंस (१०८)',
    disasterMgmt: 'आपदा प्रबंधन (१०७०/१०७७)',
    police: 'पुलिस सहायता (११२)',
    aiTriage: 'एआई लक्षण जांच',
    sos108: '१०८ आपातकाल',
    emergencySos: 'आपातकालीन सहायता',
    open: 'खुला है',
    closed: 'बंद है',
    searchCityPrompt: 'भारतीय शहर खोजें या जीपीएस का उपयोग करें',
    language: 'भाषा / Language',
    english: 'English (अंग्रेजी)',
    hindi: 'हिन्दी (Hindi)',
    pushAlerts: 'पुश नोटिफिकेशन व सायरन',
    desktopCanvas: 'डेस्कटॉप दृश्य',
    phoneSimulator: 'मोबाइल सिमुलेटर',
    role: 'भूमिका / Role',
    citizen: 'आम नागरिक / जनसाधारण',
    civicAuthority: 'आपदा प्रबंधन अधिकारी / डीएम',
    hospitalTriage: 'अस्पताल ट्राइएज पैरामेडिक',
    systemAdmin: 'मौसम प्रणाली प्रबंधक',
    saveProfile: 'प्रोफाइल सहेजें',
    dataStream: 'डेटा स्रोत',
    liveApi: 'लाइव ओपन-मेटिओ डेटा',
    imdHeatwave: 'आईएमडी रेड अलर्ट मोड',
    more: 'अन्य मेन्यू',
    menu: 'मेन्यू',
    live: 'लाइव',
    shelters: 'शीत केंद्र',
    dossier: 'रिपोर्ट',
    close: 'बंद करें',
    back: 'पीछे जाएं',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    download: 'डाउनलोड करें',
    exportPdf: 'प्रिंट / पीडीएफ',
    exportJson: 'जेसन (JSON) एक्सपोर्ट',
    copied: 'कॉपी हो गया!',
    copySummary: 'सारांश कॉपी करें',
    callNow: 'तुरंत कॉल करें',
    navigate: 'दिशा निर्देश',
    directions: 'रास्ता देखें',
    refresh: 'टेलीमेट्री रीफ्रेश करें',
    viewAll: 'सभी देखें',
    extremeRisk: 'अत्यंत गंभीर लू का खतरा',
    findShelter: 'निकटतम एसी शीत केंद्र खोजें',
    logHydration: 'पानी दर्ज करें (+२५० मिली)',
    call108: 'आपातकालीन एम्बुलेंस (१०८)',
    triageAI: 'एआई लक्षण परीक्षण',

    // Ticker
    tickerAlert: 'गंभीर लू रेड अलर्ट चेतावनी',
    tickerStations: 'वास्तविक समय निगरानी केंद्र',

    // Telemetry View
    codeRedWarning: 'कोड रेड • भीषण लू कर्फ्यू लागू है',
    codeRedDesc: 'परिवेश का तापमान व आर्द्रता खतरनाक स्तर पार कर चुकी है। एनडीएमए के आदेशानुसार दोपहर में खुले में शारीरिक श्रम प्रतिबंधित है।',
    currentVitals: 'वास्तविक समय मौसम व शारीरिक महत्वपूर्ण आंकड़े',
    heatIndex: 'हीट इंडेक्स (अनुभूत तापमान)',
    wbgt: 'वेट बल्ब ग्लोब तापमान (WBGT)',
    utci: 'सार्वभौमिक तापीय जलवायु सूचकांक',
    humidity: 'सापेक्ष आर्द्रता',
    windSpeed: 'हवा की गति',
    solarRadiation: 'सौर विकिरण प्रवाह',
    sweatLossRate: 'अनुमानित पसीना बहाव दर',
    uhiAnomaly: 'शहरी ताप द्वीप अंतर',
    dryBulb: 'परिवेश तापमान (ड्राई बल्ब)',
    curfewWindow: 'तीव्र विकिरण कर्फ्यू समय',
    stayIndoors: 'घर के अंदर रहें • अनिवार्य विश्राम अवधि',
    safeHours: 'सुरक्षित बाहर निकलने का समय',
    grapStage: 'ग्रैप (GRAP) आपात चरण',
    hydrationTracker: 'जलयोजन (हाइड्रेशन) व ओआरएस ट्रैकर',
    hydrationToday: 'आज का कुल जल सेवन',
    targetIntake: 'दैनिक जल लक्ष्य',
    quickLog250: '+२५० मिली पानी / ओआरएस',
    quickLog500: '+५०० मिली ठंडा ओआरएस',
    logWaterSuccess: 'जल सेवन सफलतापूर्वक दर्ज किया गया',
    lastLog: 'अंतिम सेवन समय',
    noLogYet: 'आज अभी तक पानी दर्ज नहीं किया गया - तुरंत पिएं!',
    nearestCoolingPoint: 'निकटतम आपातकालीन वातानुकूलित शीत केंद्र',
    walkTime: 'मिनट पैदल दूरी',
    distance: 'दूरी',
    bedsAvailable: 'आपातकालीन हीटवेव बेड',
    iceBaths: 'बर्फ स्नान टब (Ice Baths)',
    satelliteHeatMap: 'नासा वीआईआईआरएस उच्च-रिजोल्यूशन थर्मल सैटेलाइट ग्रिड',
    imdCertifiedStation: 'भारतीय मौसम विभाग (IMD) प्रमाणित स्टेशन टेलीमेट्री',
    stationId: 'स्टेशन कोड',
    wardZone: 'वार्ड / जलवायु क्षेत्र',
    pinCode: 'पिन कोड',

    // Cooling Finder View
    findCoolingTitle: 'आपातकालीन शीत केंद्र व पेयजल राहत नेटवर्क',
    findCoolingSubtitle: 'सत्यापित सार्वजनिक वातानुकूलित आश्रय, ओआरएस पेयजल केंद्र और आपातकालीन हीटस्ट्रोक उपचार केंद्र',
    searchCoolingPlaceholder: 'केंद्र का नाम, वार्ड, क्षेत्र या लैंडमार्क खोजें...',
    filterAll: 'सभी केंद्र',
    filterAc: 'वातानुकूलित आश्रय',
    filterWater: 'पेयजल कियोस्क',
    filterMedical: 'अस्पताल व ट्राइएज',
    filterShaded: 'छायादार सार्वजनिक पार्क',
    facilityStatusOpen: 'अभी खुला है',
    facilityStatusCritical: 'क्षमता समाप्त होने वाली है',
    facilityStatusFull: 'पूरी तरह भरा हुआ',
    occupancy: 'उपस्थिति',
    indoorTemperature: 'भीतरी तापमान',
    facilitiesFound: 'शीत केंद्र उपलब्ध हैं इस शहर में:',
    startNavigation: 'जीपीएस नेविगेशन शुरू करें',
    activeRouteTo: 'सक्रिय रास्ता दिशा-निर्देश:',
    cancelRoute: 'नेविगेशन समाप्त करें',
    directCall: 'केंद्र से संपर्क करें',
    amenities: 'मुख्य सुविधाएं',

    // Protocols View
    protocolsTitle: 'भीषण लू सुरक्षा प्रोटोकॉल व क्लीनिकल प्राथमिक उपचार',
    protocolsSubtitle: 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) अनुमोदित जीवनरक्षक दिशा-निर्देश एवं आपातकालीन उपचार',
    emergencyChecklistTitle: 'आपातकालीन प्राथमिक उपचार: लू की थकान (Exhaustion) बनाम जानलेवा हीटस्ट्रोक',
    heatExhaustion: 'लू की थकान (प्रारंभिक चेतावनी संकेत)',
    heatStroke: 'हीटस्ट्रोक (अत्यंत गंभीर आपात स्थिति)',
    symptomsTitle: 'पहचानने योग्य मुख्य लक्षण',
    immediateActionTitle: 'तत्काल जीवनरक्षक प्राथमिक उपचार',
    exhaustionSymptoms: 'अत्यधिक पसीना, त्वचा पीली व ठंडी होना, तेज परंतु कमजोर नब्ज, चक्कर, जी मिचलाना, मांसपेशियों में ऐंठन, सिरदर्द।',
    exhaustionAction: 'तुरंत वातानुकूलित या छायादार स्थान पर जाएं, कपड़े ढीले करें, धीरे-धीरे ओआरएस या नमकीन छाछ पिएं, गर्दन व माथे पर गीला कपड़ा रखें।',
    strokeSymptoms: 'शरीर का तापमान ४०°C (१०४°F) से अधिक, त्वचा गर्म, लाल व सूखी होना, भ्रम, लड़खड़ाती आवाज, दौरे पड़ना या बेहोशी।',
    strokeAction: 'बिना देर किए तुरंत १०८ पर कॉल करें! बेहोशी की हालत में मुंह से कुछ न पिलाएं। मरीज को गर्दन तक ठंडे पानी में रखें या बगल, गर्दन व जांघों में बर्फ की थैलियां लगाएं।',
    ndmaStage4Directives: 'एनडीएमए स्टेज ४ श्रमिक कर्फ्यू व सार्वजनिक नियम',
    directiveLabor: 'दोपहर ११:३० से शाम ४:३० बजे तक खुले में निर्माण, कृषि व भारी शारीरिक कार्य पूर्णतः प्रतिबंधित है।',
    directiveWater: 'नियोक्ताओं को कार्यस्थलों पर हर १०० मीटर पर ठंडा पेयजल, ओआरएस तथा छायादार विश्राम कक्ष उपलब्ध कराना अनिवार्य है।',
    directiveSchools: 'बिना एसी वाले स्कूलों व शैक्षणिक संस्थानों में बाहरी खेलकूद बंद रखे जाएं अथवा केवल सुबह की कक्षाएं चलाई जाएं।',
    directiveHospitals: 'जिले के सभी मुख्य अस्पतालों में २४ घंटे वातानुकूलित हीट इमरजेंसी वार्ड तथा कोल्ड वाटर इमर्शन टब सक्रिय रखे जाएं।',
    hydrationRecipeTitle: 'घर पर डब्ल्यूएचओ-ओआरएस घोल बनाने की विधि',
    hydrationRecipeDesc: '१ लीटर स्वच्छ पेयजल + ६ छोटी चम्मच चीनी (२४ ग्राम) + आधा छोटा चम्मच साधारण नमक (३ ग्राम)। पूरी तरह घुलने तक मिलाएं।',
    vulnerablePopulations: 'उच्च जोखिम वाले संवेदनशील समूह',
    elderlyRisk: 'वरिष्ठ नागरिक (६५+ वर्ष): प्यास का संकेत देरी से मिलना और हृदय प्रणाली पर अधिक दबाव।',
    childrenRisk: 'शिशु व छोटे बच्चे: पसीना कम आना और शरीर का तापमान अत्यधिक तेजी से बढ़ना।',
    chronicRisk: 'दीर्घकालिक रोगी (मधुमेह, उच्च रक्तचाप, गुर्दा रोग): इलेक्ट्रोलाइट असंतुलन का गंभीर खतरा।',

    // Forecast View
    forecastTitle: '७-दिवसीय पूर्वानुमान एवं स्वास्थ्य जोखिम आकलन',
    forecastSubtitle: 'आर्टिफिशियल इंटेलिजेंस (AI) आधारित तापमान, आर्द्रता तनाव और अस्पताल भर्ती का अग्रिम अनुमान',
    confidenceScore: 'एआई मॉडल सटीकता',
    sevenDayOverview: '७-दिवसीय सिनॉप्टिक मौसम मैट्रिक्स',
    maxTemp: 'अधिकतम तापमान',
    minTemp: 'न्यूनतम तापमान',
    peakWbgt: 'अधिकतम WBGT',
    projectedHospitalSurge: 'अनुमानित अस्पताल भर्ती भार',
    diurnalThermalCurve: 'प्रति घंटे थर्मल स्ट्रेस वक्र (Diurnal WBGT)',
    shapDrivers: 'मुख्य मौसम कारक (SHAP विश्लेषण)',
    eocAction: 'आपदा नियंत्रण कक्ष (EOC) आपातकालीन कार्रवाई',
    requestBeds: '५० अतिरिक्त हीटवेव बेड आवंटित करें',
    issueCurfew: 'एनडीएमए कर्फ्यू एडवाइजरी जारी करें',

    // Emergency Alerts View
    alertsTitle: 'नागरिक सुरक्षा एवं आपातकालीन चेतावनी कंसोल',
    alertsSubtitle: 'ध्वनि सायरन, सेल ब्रॉडकास्ट (CBS), और बहुभाषी वॉयस अलर्ट के लिए आधिकारिक आपदा प्रसारण प्रणाली',
    activeAlertBanner: 'सक्रिय रेड अलर्ट चेतावनी प्रसारण',
    audioObdNotice: 'आपातकालीन ध्वनि सायरन एवं आईवीआर ऑडियो प्रसारण',
    listenAudio: 'हिन्दी ऑडियो प्रसारण सुनें',
    stopAudio: 'ऑडियो बंद करें',
    cbsTitle: 'नागरिक प्रत्यक्ष अलर्ट वितरण स्थिति',
    englishMessage: 'English (केन्द्रीय परामर्श)',
    hindiMessage: 'हिन्दी (राष्ट्रीय आधिकारिक परामर्श)',
    smsBroadcastsSent: 'एसएमएस प्रेषित',
    whatsappSent: 'व्हाट्सएप अलर्ट',
    audioCallsConnected: 'वॉयस कॉल कनेक्टेड',
    triggerCbsBroadcast: 'तुरंत सेल ब्रॉडकास्ट (CBS) प्रसारित करें',
    cbsSentSuccess: 'सभी वार्डों में आपातकालीन चेतावनी सफलतापूर्वक प्रसारित की गई!',

    // Profile View
    profileTitle: 'व्यक्तिगत स्वास्थ्य संवेदनशीलता एवं मेडिकल प्रोफाइल',
    profileSubtitle: 'अपनी आयु, पुरानी बीमारियां, दवाएं व धूप में रहने के घंटे दर्ज करें ताकि व्यक्तिगत हीट स्ट्रेस स्कोर की गणना हो सके',
    personalInfo: 'व्यक्तिगत विवरण',
    fullName: 'पूरा नाम',
    ageYears: 'आयु (वर्ष)',
    phone: 'मोबाइल नंबर',
    wardArea: 'वार्ड / क्षेत्र',
    occupation: 'व्यवसाय / कार्य',
    sunExposureTitle: 'दैनिक धूप में रहने का समय',
    hoursPerDay: 'घंटे प्रतिदिन बाहर',
    chronicConditionsTitle: 'पूर्व-मौजूद पुरानी बीमारियां (Chronic Conditions)',
    hypertension: 'उच्च रक्तचाप (Hypertension)',
    cardiovascular: 'हृदय रोग (Cardiovascular)',
    diabetes: 'मधुमेह (Diabetes)',
    chronicKidney: 'गुर्दा रोग (Chronic Kidney Disease)',
    asthma: 'अस्थमा / श्वास संबंधी रोग',
    medicationsTitle: 'नियमित रूप से ली जाने वाली दवाएं',
    addMedication: '+ नई दवा जोड़ें',
    noMedications: 'कोई उच्च जोखिम वाली दवा दर्ज नहीं है',
    iceTitle: 'आपातकालीन संपर्क व्यक्ति (ICE Contact)',
    contactName: 'संपर्क व्यक्ति का नाम',
    relationship: 'संबंध',
    contactPhone: 'मोबाइल नंबर',
    saveChanges: 'स्वास्थ्य प्रोफाइल सहेजें',
    savedSuccess: 'प्रोफाइल सफलतापूर्वक सुरक्षित की गई!',
    paramedicQr: 'पैरामेडिक इमरजेंसी ट्राइएज क्यूआर (QR) कोड',
    paramedicQrDesc: 'अस्पताल पहुंचने पर यह क्यूआर कोड डॉक्टर या पैरामेडिक को दिखाएं ताकि वे फोन अनलॉक किए बिना आपकी पुरानी बीमारियों व दवाओं की जानकारी तुरंत देख सकें।',
    showQr: 'पैरामेडिक क्यूआर कार्ड देखें',
    phsiMultiplier: 'व्यक्तिगत शारीरिक तनाव गुणक (PHSI)',

    // Health Report View
    reportTitle: 'क्लीनिकल हीट स्ट्रेन एवं बायो-स्वास्थ्य डॉसियर',
    reportSubtitle: 'फिजियोलॉजिकल स्ट्रेन इंडेक्स (PHSI), मूत्र जलयोजन विश्लेषण और २४ घंटे का अनुकूलित पुनर्जलीकरण प्रोटोकॉल',
    patientProfileSummary: 'रोगी विवरण एवं जोखिम वर्ग',
    ambientTelemetrySummary: 'परिवेश का तापीय वातावरण',
    phsiDiagnostic: 'शारीरिक ताप तनाव सूचकांक (PHSI)',
    coreTempElevation: 'आंतरिक शरीर तापमान वृद्धि',
    vasodilationImpedance: 'रक्त वाहिका फैलाव अवरोध',
    cardiacShuntLoad: 'हृदय संवहन भार',
    netFluidDeficit: 'शुद्ध तरल कमी (Fluid Deficit)',
    armstrongTitle: 'आर्मस्ट्रांग ८-स्तरीय मूत्र जलयोजन रंग पैमाना',
    pharmacokineticsTitle: 'सक्रिय दवाएं व तापीय औषध प्रभाव',
    hydrationScheduleTitle: '२४ घंटे का क्लीनिकल जल व विश्राम समय चक्र',
    morningHydration: 'सुबह का पूर्व-जलयोजन (०६:०० – १०:००)',
    curfewMandatory: 'चरम कर्फ्यू (अनिवार्य आराम १२:३० – १६:३०)',
    eveningRecovery: 'शाम का पुनर्प्राप्ति समय (१६:३० – २१:००)',
    nearestFacilityNotice: 'निकटतम आपातकालीन हीटस्ट्रोक उपचार अस्पताल',

    // Modals
    triageTitle: 'एआई आपातकालीन हीटस्ट्रोक लक्षण जांच',
    triageSubtitle: 'तुरंत पता लगाने के लिए ४ महत्वपूर्ण प्रश्नों के उत्तर दें कि क्या अस्पताल में भर्ती होना आवश्यक है',
    call108Title: '१०८ आपातकालीन एम्बुलेंस से संपर्क किया जा रहा है',
    call108Subtitle: 'निकटतम राज्य आपदा नियंत्रण कक्ष को आपकी लाइव जीपीएस लोकेशन और मेडिकल प्रोफाइल भेजी जा रही है',
    gpsNavTitle: 'शीत केंद्र के लिए लाइव जीपीएस मार्ग',
    pushSettingsTitle: 'आपातकालीन सायरन व चेतावनी नोटिफिकेशन सेटिंग्स',
  },
};

export const TRANSLATIONS = APP_TRANSLATIONS;

export const useAppTranslation = (language: LanguageCode): TranslationDictionary => {
  return APP_TRANSLATIONS[language] || APP_TRANSLATIONS.en;
};

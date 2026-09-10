import { UserHealthProfile, WeatherTelemetry, LanguageCode } from '../types';

/**
 * Get current date key in India Standard Time (IST - Asia/Kolkata)
 * e.g. "2026-09-10"
 */
export function getISTDateString(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    // Fallback if Intl is restricted
    const d = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  }
}

/**
 * Calculate milliseconds remaining until 11:59:59 PM IST tonight
 */
export function getMillisecondsUntilISTReset(): number {
  const now = new Date();
  try {
    const istFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    
    const parts = istFormatter.formatToParts(now);
    let hour = 0, minute = 0, second = 0;
    for (const part of parts) {
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
      if (part.type === 'second') second = parseInt(part.value, 10);
    }
    
    const secondsCurrent = hour * 3600 + minute * 60 + second;
    const secondsTarget = 23 * 3600 + 59 * 60 + 59; // 23:59:59 IST
    
    let diffSeconds = secondsTarget - secondsCurrent;
    if (diffSeconds <= 0) {
      diffSeconds += 86400; // roll over to tomorrow
    }
    return diffSeconds * 1000;
  } catch {
    // Fallback: 24h cycle
    return 60 * 60 * 1000;
  }
}

export interface ConditionGuidanceItem {
  conditionKey: string;
  title: string;
  severity: 'warning' | 'caution' | 'info' | 'critical';
  recommendedTargetMl: number;
  guidanceText: string;
  orsGuidanceText: string;
}

export interface HealthConditionWaterAssessment {
  baseDailyTargetMl: number;
  conditionAdjustedTargetMl: number;
  hourlySipRecommendationMl: number;
  conditionItems: ConditionGuidanceItem[];
  isFluidRestricted: boolean;
  fluidRestrictionWarning?: string;
  summaryNote: string;
}

/**
 * Calculate customized water intake targets and clinical advisories based on reported health profile & conditions
 */
export function calculateConditionBasedWaterIntake(
  profile: UserHealthProfile,
  weather: WeatherTelemetry,
  lang: LanguageCode = 'en'
): HealthConditionWaterAssessment {
  const isHi = lang === 'hi';
  const age = profile.age || 42;
  const sunHours = profile.sunExposureHours || 4;
  const conditions = profile.conditions || {
    hypertension: false,
    cardiovascular: false,
    diabetes: false,
    chronicKidney: false,
    asthma: false,
  };

  const heatIndex = typeof weather.heatIndex === 'number' && !isNaN(weather.heatIndex) ? weather.heatIndex : 40;
  const heatAboveNormal = Math.max(0, heatIndex - 28);
  const thermalAddon = Math.round(heatAboveNormal * 45 + (sunHours * Math.max(0, heatIndex - 32) * 3.5));

  // Standard baseline: 2600ml
  let baseTarget = 2600 + thermalAddon;
  const conditionItems: ConditionGuidanceItem[] = [];
  let isFluidRestricted = false;
  let fluidRestrictionWarning: string | undefined = undefined;

  // 1. Chronic Kidney Disease (CKD) - STRICT FLUID RESTRICTION
  if (conditions.chronicKidney) {
    isFluidRestricted = true;
    const restrictedCap = 1200; // Strict clinical cap
    fluidRestrictionWarning = isHi
      ? '⚠️ गुर्दा रोग (CKD) चेतावनी: तरल पदार्थ का सेवन सीमित रखें (१.० - १.२ लीटर/दिन अधिकतम)। अत्यधिक पानी या ओआरएस से फेफड़ों में पानी (पल्मोनरी एडिमा) और पोटेशियम बढ़ने का खतरा रहता है। केवल अपने नेफ्रोलॉजिस्ट की सलाह से पानी पिएं।'
      : '⚠️ Chronic Kidney Disease Alert: Strict fluid restriction applies (max 1.0 - 1.2 L/day). Excess water or standard ORS risks pulmonary edema and hyperkalemia. Strictly adhere to your nephrologist\'s prescribed intake.';

    conditionItems.push({
      conditionKey: 'chronicKidney',
      title: isHi ? 'गुर्दा रोग (क्रोनिक किडनी डिजीज)' : 'Chronic Kidney Disease (CKD)',
      severity: 'critical',
      recommendedTargetMl: restrictedCap,
      guidanceText: isHi
        ? 'कड़ा तरल प्रतिबंध (१०००-१२०० मिली/दिन)। अत्यधिक पानी पीने से गुर्दे पर दबाव बढ़ता है। तरल पदार्थों को दिनभर में छोटी मात्रा में मापकर पिएं।'
        : 'Strict fluid ceiling of 1,000 - 1,200 ml/day. Do not consume large boluses. Measure all liquids (water, tea, soups) precisely.',
      orsGuidanceText: isHi
        ? 'पोटेशियम युक्त मानक ओआरएस से बचें। डॉक्टर की अनुमति के बिना इलेक्ट्रोलाइट न लें।'
        : 'Avoid potassium-rich WHO-ORS formulations without explicit nephrology clearance.',
    });
    baseTarget = restrictedCap;
  }

  // 2. Cardiovascular Disease / Severe Hypertension
  if (conditions.cardiovascular || conditions.hypertension) {
    if (!isFluidRestricted) {
      const cardioTarget = Math.min(3400, Math.max(2800, baseTarget));
      conditionItems.push({
        conditionKey: 'cardiovascular',
        title: isHi ? 'उच्च रक्तचाप व हृदय प्रणाली' : 'Hypertension & Cardiovascular Strain',
        severity: 'warning',
        recommendedTargetMl: cardioTarget,
        guidanceText: isHi
          ? 'हृदय की कार्यक्षमता बनाए रखने के लिए २.८ से ३.२ लीटर पानी दिनभर में धीरे-धीरे पिएं। अचानक बहुत अधिक पानी पीने से रक्तचाप बढ़ सकता है।'
          : 'Maintain steady, gradual hydration (2.8 - 3.2 L). Avoid rapid fluid chugging which causes transient ventricular volume overload.',
        orsGuidanceText: isHi
          ? 'ओआरएस लेते समय अतिरिक्त नमक वाले भोजन से बचें और नियमित रक्तचाप (BP) की जांच करते रहें।'
          : 'When taking ORS, monitor sodium balance and check blood pressure daily during heat waves.',
      });
      baseTarget = cardioTarget;
    }
  }

  // 3. Diabetes Mellitus
  if (conditions.diabetes) {
    if (!isFluidRestricted) {
      const diabeticTarget = Math.max(3200, baseTarget + 300);
      conditionItems.push({
        conditionKey: 'diabetes',
        title: isHi ? 'मधुमेह (डायबिटीज) ऑस्मोटिक नियंत्रण' : 'Diabetes Mellitus (Hyperosmolar Defense)',
        severity: 'warning',
        recommendedTargetMl: diabeticTarget,
        guidanceText: isHi
          ? 'गर्मी में डिहाइड्रेशन से ब्लड शुगर बहुत तेजी से बढ़ता है। ३.२ से ३.५ लीटर सादा पानी पिएं। मीठे पेय, कोल्ड ड्रिंक्स और पैक्ड जूस से पूर्णतः बचें।'
          : 'Dehydration induces acute hyperosmolar hyperglycemia. Target 3.2 - 3.5 L plain water. Strictly avoid sweetened sodas, energy drinks, and fruit juices.',
        orsGuidanceText: isHi
          ? 'मानक डब्ल्यूएचओ-ओआरएस में ग्लूकोज होता है, इसलिए केवल डॉक्टर की सलाह या तेज पसीने पर ही पिएं।'
          : 'Standard WHO-ORS contains ~13.5g glucose/L. Consume when sweating heavily, but monitor blood glucose accordingly.',
      });
      baseTarget = diabeticTarget;
    }
  }

  // 4. Asthma / Respiratory Disease
  if (conditions.asthma) {
    if (!isFluidRestricted) {
      conditionItems.push({
        conditionKey: 'asthma',
        title: isHi ? 'अस्थमा व श्वसन म्यूकोसा सुरक्षा' : 'Asthma & Airway Hydration',
        severity: 'info',
        recommendedTargetMl: baseTarget,
        guidanceText: isHi
          ? 'गर्म व रूखी हवा से सांस की नलियां सूखती हैं। कमरे के तापमान का पानी हर आधे घंटे में घूंट-घूंट पिएं।'
          : 'Inhaling dry hot air desiccates the respiratory tree. Frequent room-temperature sips preserve airway ciliary defense.',
        orsGuidanceText: isHi
          ? 'आवश्यकतानुसार नियमित ओआरएस का सेवन सुरक्षित है।'
          : 'Standard WHO-ORS is completely safe and encouraged during exertion.',
      });
    }
  }

  // 5. Senior Citizen (Age >= 60)
  if (age >= 60 && !isFluidRestricted) {
    conditionItems.push({
      conditionKey: 'elderly',
      title: isHi ? `वरिष्ठ नागरिक (आयु ${age} वर्ष)` : `Elderly Hydration Protocol (Age ${age})`,
      severity: 'warning',
      recommendedTargetMl: Math.max(2800, baseTarget),
      guidanceText: isHi
        ? 'उम्र के साथ मस्तिष्क को प्यास का अनुभव देर से होता है। प्यास का इंतजार किए बिना हर ४५ मिनट में १५०-२०० मिली पानी पिएं।'
        : 'Age-associated hypodipsia blunts thirst receptors. Do not wait for thirst—hydrate on a timed schedule (150-200ml every 45 mins).',
      orsGuidanceText: isHi
        ? 'हल्का ओआरएस घोल छोटे घूंटों में दिन के समय पिएं।'
        : 'Sip 1 sachet of WHO-ORS in divided small cups across morning and afternoon.',
    });
  }

  // 6. Heavy Outdoor Sun Exposure (>3 hours)
  if (sunHours >= 3 && !isFluidRestricted) {
    const outdoorTarget = Math.max(3800, baseTarget + 400);
    conditionItems.push({
      conditionKey: 'outdoorWorker',
      title: isHi ? `धूप में बाहरी कार्य (${sunHours} घंटे)` : `Outdoor Occupational Exposure (${sunHours} hrs)`,
      severity: 'warning',
      recommendedTargetMl: outdoorTarget,
      guidanceText: isHi
        ? 'धूप में भारी पसीना बहने से शरीर का पानी तेजी से घटता है। कार्य के दौरान प्रति घंटे २५० मिली पानी और ओआरएस अनिवार्य है।'
        : 'Accelerated transpirational sweat loss (600-1100 ml/hr). Drink 250ml every 20-30 minutes under direct sun.',
      orsGuidanceText: isHi
        ? 'प्रतिदिन २ पैकेट ओआरएस कार्यस्थल पर पानी के साथ आवश्यक है।'
        : '2 WHO-ORS sachets (2 Litres) strongly recommended across active work shift.',
    });
    baseTarget = outdoorTarget;
  }

  // Default item if no chronic illness
  if (conditionItems.length === 0) {
    conditionItems.push({
      conditionKey: 'standardAdult',
      title: isHi ? 'सामान्य स्वस्थ नागरिक' : 'Healthy Adult Heat Defense',
      severity: 'info',
      recommendedTargetMl: baseTarget,
      guidanceText: isHi
        ? 'वर्तमान तापमान और आर्द्रता के अनुसार दिनभर में ३.० से ३.५ लीटर पानी पिएं।'
        : 'Under current meteorological heat loading, maintain 3.0 to 3.5 L daily fluid intake.',
      orsGuidanceText: isHi
        ? 'धूप में निकलने पर १ पैकेट ओआरएस पिएं।'
        : '1 WHO-ORS sachet recommended if traveling or exercising outdoors.',
    });
  }

  const hourlySip = isFluidRestricted ? 100 : 220;
  const summaryNote = isHi
    ? `आपकी स्वास्थ्य प्रोफाइल (${profile.name || 'उपयोगकर्ता'}) के अनुसार आज का दैनिक जल लक्ष्य: ${(baseTarget / 1000).toFixed(1)} लीटर।`
    : `Personalized daily fluid target for ${profile.name || 'User'}: ${(baseTarget / 1000).toFixed(1)} Litres.`;

  return {
    baseDailyTargetMl: 2600,
    conditionAdjustedTargetMl: baseTarget,
    hourlySipRecommendationMl: hourlySip,
    conditionItems,
    isFluidRestricted,
    fluidRestrictionWarning,
    summaryNote,
  };
}

export interface WeatherORSRecommendation {
  orsSachets: number;
  orsLitresSolution: number;
  riskTier: 'NORMAL' | 'YELLOW' | 'ORANGE' | 'RED';
  riskTitle: string;
  timingGuidance: string;
  rationale: string;
  preparationRecipe: string;
  electrolytesRecovered: string;
}

/**
 * Calculate precise WHO-ORS requirements based on ambient weather (Temp, WBGT, Heat Index, Sweat Rate)
 */
export function calculateWeatherBasedORS(
  weather: WeatherTelemetry,
  profile: UserHealthProfile,
  lang: LanguageCode = 'en'
): WeatherORSRecommendation {
  const isHi = lang === 'hi';
  const dryBulb = weather.dryBulbTemp || 38;
  const heatIndex = typeof weather.heatIndex === 'number' && !isNaN(weather.heatIndex) ? weather.heatIndex : 41;
  const wbgt = weather.wbgt || 31;
  const sweatRate = weather.sweatLossRate || 550;

  // Renal condition guardrail: always restrict ORS if CKD is present
  const isCKD = profile.conditions?.chronicKidney;

  if (isCKD) {
    return {
      orsSachets: 0,
      orsLitresSolution: 0,
      riskTier: 'NORMAL',
      riskTitle: isHi ? 'गुर्दा रोग प्रतिबंध (शून्य ओआरएस)' : 'Renal Fluid & Potassium Restriction',
      timingGuidance: isHi ? 'डॉक्टर की अनुमति के बिना ओआरएस न लें' : 'Do not take ORS without physician advice',
      rationale: isHi
        ? 'क्रोनिक किडनी डिजीज (CKD) में पोटेशियम और सोडियम का असंतुलन जानलेवा हो सकता है। केवल नेफ्रोलॉजिस्ट के बताए अनुसार सीमित पानी लें।'
        : 'Due to impaired renal excretion, potassium in standard WHO-ORS can precipitate dangerous hyperkalemia and fluid retention.',
      preparationRecipe: isHi
        ? 'अपने डॉक्टर द्वारा निर्धारित विशेष कम-पोटेशियम इलेक्ट्रोलाइट ही लें।'
        : 'Strictly use renal-approved electrolytes as prescribed by your nephrologist.',
      electrolytesRecovered: '0 mmol (Restricted)',
    };
  }

  // Red alert: Extreme Heat
  if (wbgt >= 32.5 || heatIndex >= 44.0 || dryBulb >= 42.0) {
    return {
      orsSachets: 3,
      orsLitresSolution: 3.0,
      riskTier: 'RED',
      riskTitle: isHi ? 'रेड अलर्ट • अत्यधिक पसीना व सोडियम ह्रास' : 'Red Alert • Critical Electrolyte Depletion',
      timingGuidance: isHi
        ? 'सुबह १०:३० से शाम ५:०० बजे के बीच हर २० मिनट में १५०-२०० मिली पिएं'
        : 'Sip 150-200ml every 20-25 mins during peak sun window (10:30 AM - 5:00 PM)',
      rationale: isHi
        ? `वर्तमान हीट इंडेक्स (${heatIndex.toFixed(1)}°C) और पसीना दर (~${sweatRate} मिली/घंटा) पर शरीर से प्रति घंटे २ से ३ ग्राम सोडियम और पोटेशियम बह रहा है। केवल सादा पानी पीने से हाइपोनेट्रेमिया (रक्त में नमक की अत्यधिक कमी) और मांसपेशियों में तीव्र ऐंठन का खतरा होता है। ३ पैकेट डब्ल्यूएचओ-ओआरएस आवश्यक है।`
        : `Severe thermal strain (${heatIndex.toFixed(1)}°C Heat Index, ~${sweatRate} ml/hr sweat loss) rapidly leaches 2-3g of sodium per hour. Drinking only plain water causes dilutional hyponatremia and heat cramps. 2-3 Litres of WHO-ORS is vital to stabilize plasma osmolality.`,
      preparationRecipe: isHi
        ? '३ पैकेट ओआरएस को ३ अलग-अलग स्वच्छ १ लीटर पेयजल बोतलों में घोलें। ठंडा पिएं। २४ घंटे से पुराना घोल न पिएं।'
        : 'Dissolve 3 WHO-ORS sachets in 3 separate 1-Litre bottles of potable water. Keep cool in shade. Discard unused solution after 24 hours.',
      electrolytesRecovered: 'Sodium: 225 mmol, Potassium: 60 mmol, Citrate: 30 mmol',
    };
  }

  // Orange alert: High Heat
  if (wbgt >= 30.0 || heatIndex >= 39.0 || dryBulb >= 38.0) {
    return {
      orsSachets: 2,
      orsLitresSolution: 2.0,
      riskTier: 'ORANGE',
      riskTitle: isHi ? 'ऑरेंज अलर्ट • उच्च तापीय तनाव' : 'Orange Alert • High Heat Index Loss',
      timingGuidance: isHi
        ? 'दोपहर ११:०० से शाम ४:०० बजे के बीच नियमित घूंट लें'
        : 'Consume 2 Litres spaced across peak hours (11:00 AM - 4:00 PM)',
      rationale: isHi
        ? `गर्मी के प्रभाव से पसीना बहाव (~${sweatRate} मिली/घंटा) बढ़ चुका है। २ पैकेट ओआरएस पीने से इलेक्ट्रोलाइट संतुलन बना रहता है और लू की थकान (Heat Exhaustion) से बचाव होता है।`
        : `Elevated perspiration (~${sweatRate} ml/hr) depletes essential electrolytes. 2 Litres of WHO-ORS maintains cellular hydration and halts progression to heat exhaustion.`,
      preparationRecipe: isHi
        ? '२ पैकेट ओआरएस को २ लीटर स्वच्छ जल में अच्छी तरह घोलें।'
        : 'Dissolve 2 sachets into 2 Litres of clean water. Stir until completely clear.',
      electrolytesRecovered: 'Sodium: 150 mmol, Potassium: 40 mmol, Citrate: 20 mmol',
    };
  }

  // Yellow alert: Moderate Heat
  if (wbgt >= 28.0 || heatIndex >= 33.0 || dryBulb >= 33.0) {
    return {
      orsSachets: 1,
      orsLitresSolution: 1.0,
      riskTier: 'YELLOW',
      riskTitle: isHi ? 'येलो अलर्ट • मध्यम तापीय लोड' : 'Yellow Alert • Moderate Heat Loading',
      timingGuidance: isHi
        ? 'दोपहर के समय धूप में निकलने या कार्य करने पर पिएं'
        : 'Sip 1 Litre across the afternoon if traveling or working outdoors',
      rationale: isHi
        ? `मध्यम गर्मी में पसीना बहने से शरीर में हल्की लवण कमी होती है। १ पैकेट (१ लीटर) ओआरएस सिरदर्द और सुस्ती को रोकता है।`
        : `Moderate thermal loading leaches mild minerals. 1 sachet (1 Litre) prevents heat-induced lethargy and dehydration headache.`,
      preparationRecipe: isHi
        ? '१ पैकेट ओआरएस को १ लीटर स्वच्छ पीने के पानी में मिलाएं।'
        : 'Mix 1 WHO-ORS sachet in 1 Litre of clean drinking water.',
      electrolytesRecovered: 'Sodium: 75 mmol, Potassium: 20 mmol, Citrate: 10 mmol',
    };
  }

  // Normal / Green Alert (<33°C)
  return {
    orsSachets: 0,
    orsLitresSolution: 0,
    riskTier: 'NORMAL',
    riskTitle: isHi ? 'सामान्य तापमान • कोई विशेष ओआरएस आवश्यक नहीं' : 'Normal Ambient Range • 0 ORS Needed',
    timingGuidance: isHi ? 'नियमित स्वच्छ पेयजल पिएं' : 'Maintain regular clean drinking water schedule',
    rationale: isHi
      ? 'परिवेश का तापमान सामान्य सीमा में है। पसीने से गंभीर लवण ह्रास नहीं हो रहा है। भोजन से मिलने वाले खनिज और सादा पानी पूर्णतः पर्याप्त हैं।'
      : 'Meteorological conditions are within baseline comfort. Normal diet and plain water provide sufficient sodium and potassium.',
    preparationRecipe: isHi
      ? 'यदि धूप में व्यायाम करें तो घर पर नींबू, पानी और चुटकी भर नमक ले सकते हैं।'
      : 'Plain water, fresh coconut water, or light salted buttermilk is ideal for standard routine.',
    electrolytesRecovered: '0 mmol (Baseline dietary intake adequate)',
  };
}

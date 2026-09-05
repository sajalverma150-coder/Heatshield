export type NavigationTab = 
  | 'overview' 
  | 'cooling-finder' 
  | 'protocols' 
  | 'forecast' 
  | 'alerts' 
  | 'profile'
  | 'health-report';

export type UserRole = 'citizen' | 'civic_authority' | 'hospital_triage' | 'system_admin';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface WeatherTelemetry {
  stationId: string;
  stationName: string;
  ward: string;
  pinCode: string;
  lastUpdated: string;
  dryBulbTemp: number; // °C
  wetBulbTemp: number; // °C
  wbgt: number; // Wet Bulb Globe Temp °C
  heatIndex: number; // NOAA Heat Index °C
  utci: number; // Universal Thermal Climate Index °C
  humidity: number; // %
  solarRadiation: number; // W/m²
  windSpeed: number; // km/h
  uhiAnomaly: number; // Urban Heat Island °C
  sweatLossRate: number; // ml/hr
  solarRadiativeLoad: number; // kW
  peakWindowStart: string;
  peakWindowEnd: string;
  grapStage: string;
  riskLevel: 'MODERATE' | 'HIGH' | 'VERY_HIGH' | 'EXTREME';
}

export interface CoolingFacility {
  id: string;
  name: string;
  category: 'shelter' | 'triage_hospital';
  address: string;
  distanceKm: number;
  walkTimeMins: number;
  totalCapacity: number;
  currentOccupancy: number;
  indoorTemp: number; // °C
  amenities: string[];
  contactPhone: string;
  status: 'OPEN' | 'CRITICAL_CAPACITY' | 'FULL';
  coordinates: [number, number];
  isHospital?: boolean;
  heatBedsAvailable?: number;
  iceBathsAvailable?: number;
}

export interface UserHealthProfile {
  name: string;
  age: number;
  phone: string;
  occupation: string;
  ward: string;
  sunExposureHours: number;
  conditions: {
    hypertension: boolean;
    cardiovascular: boolean;
    diabetes: boolean;
    chronicKidney: boolean;
    asthma: boolean;
  };
  medications: Array<{
    name: string;
    dosage: string;
    type: string;
    riskImpact: string;
  }>;
  iceContact: {
    name: string;
    relation: string;
    phone: string;
    preferredLanguage: string;
  };
  hydrationTodayMl: number;
  targetHydrationMl: number;
  lastWaterLogTime: string;
  lastWaterLogTimestamp?: number;
}

export interface ForecastDay {
  dayName: string;
  dateStr: string;
  maxTemp: number;
  minTemp: number;
  maxWBGT: number;
  maxHeatIndex: number;
  riskScore: number;
  grapStage: string;
  riskLevel: 'MODERATE' | 'HIGH' | 'EXTREME' | 'CRITICAL';
  projectedSurgeAdmissions: number;
  shapFactors: Array<{ factor: string; impact: number; description: string }>;
  hourlyStress: Array<{ hour: string; temp: number; wbgt: number; stressLevel: number }>;
}

export interface EmergencyBroadcast {
  id: string;
  code: string;
  severity: 'WARNING' | 'HIGH' | 'EXTREME_CODE_RED';
  title: string;
  issuedBy: string;
  issuedAt: string;
  targetWards: string[];
  messageEn: string;
  messageHi: string;
  messageMr: string;
  directives: string[];
  smsDelivered: number;
  whatsappDelivered: number;
  audioObdDialed: number;
  acknowledged: boolean;
}

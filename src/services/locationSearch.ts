// Real-Time Global & Pan-India Location Geocoding & Autocomplete Service
// Supports any building, monument, area, street, hospital, commercial hub, or transit node.
// Uses Photon (Komoot OSM Elasticsearch) with Nominatim fallback + instant local index. Zero API keys required.

export interface LocationSearchResult {
  id: string;
  name: string;
  displayName: string;
  secondaryText: string;
  lat: number;
  lng: number;
  category: 'monument' | 'building' | 'hospital' | 'transit' | 'park' | 'area' | 'shelter' | 'other';
  typeLabel: string;
  city?: string;
  state?: string;
  distanceKm?: number;
  isCoolingFacility?: boolean;
}

// Famous Curated Indian Landmarks for Instant (0ms) Autocomplete Matching
const POPULAR_INDIAN_LANDMARKS: LocationSearchResult[] = [
  // Lucknow
  {
    id: 'lko-bara-imambara',
    name: 'Bara Imambara (Asfi Mosque & Bhool Bhulaiya)',
    displayName: 'Bara Imambara, Machchhi Bhavan, Lucknow, Uttar Pradesh',
    secondaryText: 'Historical Monument • Machchhi Bhavan, Lucknow',
    lat: 26.8692,
    lng: 80.9126,
    category: 'monument',
    typeLabel: 'Monument / Heritage',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-chota-imambara',
    name: 'Chota Imambara (Hussainabad)',
    displayName: 'Chota Imambara, Tahseen Ganj, Lucknow, Uttar Pradesh',
    secondaryText: 'Historical Monument • Husainabad, Lucknow',
    lat: 26.8741,
    lng: 80.9048,
    category: 'monument',
    typeLabel: 'Monument / Heritage',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-rumi-darwaza',
    name: 'Rumi Darwaza (Turkish Gate)',
    displayName: 'Rumi Darwaza, Husainabad, Lucknow, Uttar Pradesh',
    secondaryText: 'Historic Monument Gate • Lucknow',
    lat: 26.8718,
    lng: 80.9118,
    category: 'monument',
    typeLabel: 'Monument',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-lulu-mall',
    name: 'Lulu Mall Lucknow',
    displayName: 'Lulu Mall, Amar Shaheed Path, Sector B Ansal API, Golf City, Lucknow',
    secondaryText: 'Commercial Shopping Mall • Golf City, Lucknow',
    lat: 26.7686,
    lng: 80.9882,
    category: 'building',
    typeLabel: 'Shopping Mall',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-phoenix-palassio',
    name: 'Phoenix Palassio Mall',
    displayName: 'Phoenix Palassio, Sector-7, Gomti Nagar Extension, Lucknow',
    secondaryText: 'Shopping & AC Complex • Gomti Nagar Ext., Lucknow',
    lat: 26.8115,
    lng: 81.0189,
    category: 'building',
    typeLabel: 'Shopping Mall',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-kgmu',
    name: 'KGMU Trauma Center (King George Medical University)',
    displayName: 'KGMU, Shah Mina Rd, Chowk, Lucknow, Uttar Pradesh',
    secondaryText: 'Premier Trauma & Hyperthermia Ward • Chowk, Lucknow',
    lat: 26.8687,
    lng: 80.9168,
    category: 'hospital',
    typeLabel: 'Trauma Hospital',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-sgpgi',
    name: 'Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI)',
    displayName: 'SGPGI, Raebareli Rd, Lucknow, Uttar Pradesh',
    secondaryText: 'Super-Speciality Medical Institute • Lucknow',
    lat: 26.7454,
    lng: 80.9388,
    category: 'hospital',
    typeLabel: 'Super-Speciality Hospital',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-charbagh',
    name: 'Lucknow Charbagh Railway Junction (LKO/LJN)',
    displayName: 'Charbagh Railway Station, Lucknow, Uttar Pradesh',
    secondaryText: 'Transit Hub • Charbagh, Lucknow',
    lat: 26.8315,
    lng: 80.9234,
    category: 'transit',
    typeLabel: 'Railway Junction',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-hazratganj',
    name: 'Hazratganj Central Commercial Promenade',
    displayName: 'Hazratganj Market & Underground Metro, Lucknow, Uttar Pradesh',
    secondaryText: 'Commercial Area & Underground AC Metro • Lucknow',
    lat: 26.8486,
    lng: 80.9431,
    category: 'area',
    typeLabel: 'Commercial District',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },
  {
    id: 'lko-janeshwar-mishra',
    name: 'Janeshwar Mishra Park',
    displayName: 'Janeshwar Mishra Park, Gomti Nagar, Lucknow, Uttar Pradesh',
    secondaryText: 'Public Eco-Park & Canopy Shaded Walkways • Gomti Nagar',
    lat: 26.8458,
    lng: 81.0118,
    category: 'park',
    typeLabel: 'Public Park / Canopy',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  },

  // Delhi NCR
  {
    id: 'del-india-gate',
    name: 'India Gate',
    displayName: 'India Gate, Rajpath, Central Secretariat, New Delhi, Delhi',
    secondaryText: 'National Monument • Central New Delhi',
    lat: 28.6129,
    lng: 77.2295,
    category: 'monument',
    typeLabel: 'National Monument',
    city: 'Delhi',
    state: 'Delhi',
  },
  {
    id: 'del-qutub-minar',
    name: 'Qutub Minar Complex',
    displayName: 'Qutub Minar, Seth Sarai, Mehrauli, New Delhi, Delhi',
    secondaryText: 'UNESCO World Heritage Site • Mehrauli, Delhi',
    lat: 28.5245,
    lng: 77.1855,
    category: 'monument',
    typeLabel: 'UNESCO Monument',
    city: 'Delhi',
    state: 'Delhi',
  },
  {
    id: 'del-red-fort',
    name: 'Red Fort (Lal Qila)',
    displayName: 'Red Fort, Netaji Subhash Marg, Lal Qila, Chandni Chowk, Delhi',
    secondaryText: 'Historic Fort Complex • Old Delhi',
    lat: 28.6562,
    lng: 77.2410,
    category: 'monument',
    typeLabel: 'Historic Fort',
    city: 'Delhi',
    state: 'Delhi',
  },
  {
    id: 'del-aiims',
    name: 'AIIMS New Delhi (All India Institute of Medical Sciences)',
    displayName: 'AIIMS, Sri Aurobindo Marg, Ansari Nagar East, New Delhi, Delhi',
    secondaryText: 'Premier Apex Medical & Emergency Trauma Center • New Delhi',
    lat: 28.5672,
    lng: 77.2100,
    category: 'hospital',
    typeLabel: 'Apex Medical Institute',
    city: 'Delhi',
    state: 'Delhi',
  },
  {
    id: 'del-connaught-place',
    name: 'Connaught Place (Rajiv Chowk)',
    displayName: 'Connaught Place Inner & Outer Circle, New Delhi, Delhi',
    secondaryText: 'Commercial Center & Central Metro Interchange • Delhi',
    lat: 28.6315,
    lng: 77.2167,
    category: 'area',
    typeLabel: 'Commercial District',
    city: 'Delhi',
    state: 'Delhi',
  },
  {
    id: 'del-dlf-mall-india',
    name: 'DLF Mall of India Noida',
    displayName: 'DLF Mall of India, Sector 18, Noida, Uttar Pradesh',
    secondaryText: 'Massive Retail Mall & Indoor Climate Sanctuary • Noida',
    lat: 28.5678,
    lng: 77.3211,
    category: 'building',
    typeLabel: 'Shopping Mall',
    city: 'Noida',
    state: 'Uttar Pradesh',
  },

  // Agra
  {
    id: 'agr-taj-mahal',
    name: 'Taj Mahal',
    displayName: 'Taj Mahal, Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh',
    secondaryText: 'World Wonder Heritage Monument • Agra',
    lat: 27.1751,
    lng: 78.0421,
    category: 'monument',
    typeLabel: 'World Heritage Wonder',
    city: 'Agra',
    state: 'Uttar Pradesh',
  },
  {
    id: 'agr-fort',
    name: 'Agra Fort',
    displayName: 'Agra Fort, Rakabganj, Agra, Uttar Pradesh',
    secondaryText: 'UNESCO World Heritage Site • Agra',
    lat: 27.1795,
    lng: 78.0211,
    category: 'monument',
    typeLabel: 'Historic Fort',
    city: 'Agra',
    state: 'Uttar Pradesh',
  },

  // Mumbai
  {
    id: 'bom-gateway-india',
    name: 'Gateway of India',
    displayName: 'Gateway of India, Apollo Bandar, Colaba, Mumbai, Maharashtra',
    secondaryText: 'Historic Monument • Colaba, South Mumbai',
    lat: 18.9220,
    lng: 72.8347,
    category: 'monument',
    typeLabel: 'Historic Monument',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  {
    id: 'bom-marine-drive',
    name: 'Marine Drive Promenade (Queen\'s Necklace)',
    displayName: 'Marine Drive, Netaji Subhash Chandra Bose Rd, Churchgate, Mumbai',
    secondaryText: 'Coastal Promenade • South Mumbai',
    lat: 18.9432,
    lng: 72.8230,
    category: 'area',
    typeLabel: 'Coastal Promenade',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  {
    id: 'bom-csmt',
    name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
    displayName: 'CSMT Railway Terminus, Fort, Mumbai, Maharashtra',
    secondaryText: 'UNESCO Heritage Railway Hub • Fort, Mumbai',
    lat: 18.9401,
    lng: 72.8354,
    category: 'transit',
    typeLabel: 'Heritage Railway Station',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  {
    id: 'bom-kem-hospital',
    name: 'KEM Hospital & Seth GS Medical College',
    displayName: 'KEM Hospital, Acharya Donde Marg, Parel, Mumbai, Maharashtra',
    secondaryText: 'Municipal Tertiary Trauma Hospital • Parel, Mumbai',
    lat: 19.0028,
    lng: 72.8428,
    category: 'hospital',
    typeLabel: 'Tertiary Hospital',
    city: 'Mumbai',
    state: 'Maharashtra',
  },

  // Jaipur
  {
    id: 'jpr-hawa-mahal',
    name: 'Hawa Mahal (Palace of Winds)',
    displayName: 'Hawa Mahal, Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Jaipur',
    secondaryText: 'Historic Architectural Monument • Pink City, Jaipur',
    lat: 26.9239,
    lng: 75.8267,
    category: 'monument',
    typeLabel: 'Historic Palace Monument',
    city: 'Jaipur',
    state: 'Rajasthan',
  },
  {
    id: 'jpr-amber-palace',
    name: 'Amber Palace (Amer Fort)',
    displayName: 'Amer Fort, Devisinghpura, Amer, Jaipur, Rajasthan',
    secondaryText: 'Hilltop Historic Fort & UNESCO Site • Amer, Jaipur',
    lat: 26.9855,
    lng: 75.8513,
    category: 'monument',
    typeLabel: 'Hill Fort Monument',
    city: 'Jaipur',
    state: 'Rajasthan',
  },
  {
    id: 'jpr-sms-hospital',
    name: 'Sawai Man Singh Hospital (SMS Medical College)',
    displayName: 'SMS Hospital, Jawahar Lal Nehru Marg, Ashok Nagar, Jaipur',
    secondaryText: 'State Apex Trauma & Heat Stroke Unit • Jaipur',
    lat: 26.9034,
    lng: 75.8152,
    category: 'hospital',
    typeLabel: 'Apex Medical Hospital',
    city: 'Jaipur',
    state: 'Rajasthan',
  },

  // Hyderabad
  {
    id: 'hyd-charminar',
    name: 'Charminar',
    displayName: 'Charminar, Char Kaman, Ghansi Bazaar, Hyderabad, Telangana',
    secondaryText: 'Historic Monument & Mosque • Old City, Hyderabad',
    lat: 17.3616,
    lng: 78.4747,
    category: 'monument',
    typeLabel: 'Historic Monument',
    city: 'Hyderabad',
    state: 'Telangana',
  },
  {
    id: 'hyd-hitec-city',
    name: 'HITEC City Cyber Towers',
    displayName: 'Cyber Towers, HITEC City, Madhapur, Hyderabad, Telangana',
    secondaryText: 'IT Tech Park & Commercial District • Hyderabad',
    lat: 17.4504,
    lng: 78.3808,
    category: 'building',
    typeLabel: 'Commercial IT Hub',
    city: 'Hyderabad',
    state: 'Telangana',
  },

  // Bengaluru
  {
    id: 'blr-bangalore-palace',
    name: 'Bangalore Palace',
    displayName: 'Bangalore Palace, Vasanth Nagar, Bengaluru, Karnataka',
    secondaryText: 'Historic Tudor Architecture Palace • Bengaluru',
    lat: 12.9982,
    lng: 77.5921,
    category: 'monument',
    typeLabel: 'Historic Palace',
    city: 'Bengaluru',
    state: 'Karnataka',
  },
  {
    id: 'blr-victoria-hospital',
    name: 'Victoria Hospital (BMCRI)',
    displayName: 'Victoria Hospital, Fort Road, Kalasipalya, Bengaluru, Karnataka',
    secondaryText: 'Centenary Medical Emergency Care • Bengaluru',
    lat: 12.9644,
    lng: 77.5756,
    category: 'hospital',
    typeLabel: 'Government Hospital',
    city: 'Bengaluru',
    state: 'Karnataka',
  },

  // Kolkata
  {
    id: 'ccu-victoria-memorial',
    name: 'Victoria Memorial',
    displayName: 'Victoria Memorial, Queens Way, Maidan, Kolkata, West Bengal',
    secondaryText: 'Historical Marble Monument & Gardens • Kolkata',
    lat: 22.5448,
    lng: 88.3426,
    category: 'monument',
    typeLabel: 'Historic Monument',
    city: 'Kolkata',
    state: 'West Bengal',
  },
  {
    id: 'ccu-howrah-bridge',
    name: 'Howrah Bridge (Rabindra Setu)',
    displayName: 'Howrah Bridge, Hooghly River, Kolkata / Howrah, West Bengal',
    secondaryText: 'Iconic Cantilever Bridge Landmark • Kolkata',
    lat: 22.5851,
    lng: 88.3468,
    category: 'monument',
    typeLabel: 'Historic Landmark',
    city: 'Kolkata',
    state: 'West Bengal',
  },

  // Amritsar
  {
    id: 'atq-golden-temple',
    name: 'Golden Temple (Harmandir Sahib)',
    displayName: 'Sri Harmandir Sahib, Golden Temple Rd, Amritsar, Punjab',
    secondaryText: 'Spiritual Heritage Landmark & Sacred Shrine • Amritsar',
    lat: 31.6200,
    lng: 74.8765,
    category: 'monument',
    typeLabel: 'Spiritual Heritage Site',
    city: 'Amritsar',
    state: 'Punjab',
  },

  // Ahmedabad
  {
    id: 'amd-sabarmati-ashram',
    name: 'Sabarmati Gandhi Ashram',
    displayName: 'Sabarmati Ashram, Gandhi Smarak Sangrahalaya, Ahmedabad, Gujarat',
    secondaryText: 'National Historic Landmark • Ahmedabad',
    lat: 23.0605,
    lng: 72.5801,
    category: 'monument',
    typeLabel: 'National Heritage',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
  {
    id: 'amd-atal-bridge',
    name: 'Atal Pedestrian Riverfront Bridge',
    displayName: 'Atal Bridge, Sabarmati Riverfront, Ahmedabad, Gujarat',
    secondaryText: 'Architectural Riverfront Promenade • Ahmedabad',
    lat: 23.0232,
    lng: 72.5714,
    category: 'monument',
    typeLabel: 'Pedestrian Landmark',
    city: 'Ahmedabad',
    state: 'Gujarat',
  },
];

// Helper: Calculate Haversine Distance in Kilometers
export function calculateGeodesicDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Categorize OSM Place Types
function categorizeOsmPlace(props: any): { category: LocationSearchResult['category']; typeLabel: string } {
  const osmKey = (props.osm_key || '').toLowerCase();
  const osmValue = (props.osm_value || '').toLowerCase();
  const type = (props.type || '').toLowerCase();

  if (
    osmKey === 'historic' ||
    osmKey === 'tourism' ||
    osmValue === 'monument' ||
    osmValue === 'memorial' ||
    osmValue === 'attraction' ||
    osmValue === 'place_of_worship' ||
    osmValue === 'castle' ||
    osmValue === 'fort' ||
    type === 'monument'
  ) {
    return { category: 'monument', typeLabel: 'Monument / Heritage' };
  }

  if (
    osmKey === 'hospital' ||
    osmValue === 'hospital' ||
    osmValue === 'clinic' ||
    osmValue === 'doctors' ||
    osmValue === 'pharmacy'
  ) {
    return { category: 'hospital', typeLabel: 'Hospital / Healthcare' };
  }

  if (
    osmKey === 'highway' ||
    osmValue === 'station' ||
    osmValue === 'subway' ||
    osmValue === 'bus_stop' ||
    osmValue === 'aerodrome' ||
    osmValue === 'airport' ||
    type === 'station'
  ) {
    return { category: 'transit', typeLabel: 'Transit Station' };
  }

  if (
    osmKey === 'leisure' ||
    osmValue === 'park' ||
    osmValue === 'garden' ||
    osmValue === 'nature_reserve'
  ) {
    return { category: 'park', typeLabel: 'Park / Green Canopy' };
  }

  if (
    osmKey === 'shop' ||
    osmValue === 'mall' ||
    osmValue === 'supermarket' ||
    osmValue === 'commercial' ||
    osmKey === 'building' ||
    type === 'building' ||
    type === 'house'
  ) {
    return { category: 'building', typeLabel: 'Building / Commercial' };
  }

  if (type === 'city' || type === 'town' || type === 'village' || type === 'suburb' || type === 'district') {
    return { category: 'area', typeLabel: 'City / Ward / Area' };
  }

  return { category: 'other', typeLabel: 'Location' };
}

// In-flight request controller to cancel stale searches on fast typing
let currentAbortController: AbortController | null = null;

/**
 * Real-time geocoding search for ANY building, monument, area, hospital, or street.
 * Queries Photon OSM Elasticsearch API with location biasing + local instant index.
 */
export async function searchGlobalLocations(
  query: string,
  options?: {
    lat?: number;
    lng?: number;
    limit?: number;
  }
): Promise<LocationSearchResult[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const limit = options?.limit || 8;
  const results: LocationSearchResult[] = [];
  const seenIds = new Set<string>();

  // 1. Instant Match against Curated Popular Indian Landmarks (0ms Latency)
  const localMatches = POPULAR_INDIAN_LANDMARKS.filter((item) => {
    return (
      item.name.toLowerCase().includes(cleanQuery) ||
      item.displayName.toLowerCase().includes(cleanQuery) ||
      (item.city && item.city.toLowerCase().includes(cleanQuery)) ||
      (item.state && item.state.toLowerCase().includes(cleanQuery))
    );
  });

  localMatches.forEach((match) => {
    let dist: number | undefined;
    if (options?.lat && options?.lng) {
      dist = calculateGeodesicDistance(options.lat, options.lng, match.lat, match.lng);
    }
    seenIds.add(`${match.lat.toFixed(4)},${match.lng.toFixed(4)}`);
    results.push({ ...match, distanceKm: dist });
  });

  // Sort local matches by proximity if user coordinates are available
  if (options?.lat && options?.lng) {
    results.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
  }

  // If query is very short (1 char), local matches are sufficient
  if (cleanQuery.length < 2) {
    return results.slice(0, limit);
  }

  // Cancel prior in-flight fetch
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  try {
    // 2. Query Photon Komoot OSM Autocomplete API (specifically designed for real-time keystroke suggestions)
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=${limit}`;
    if (options?.lat && options?.lng) {
      url += `&lat=${options.lat}&lon=${options.lng}`;
    }

    const resp = await fetch(url, { signal });
    if (resp.ok) {
      const data = await resp.json();
      if (data && Array.isArray(data.features)) {
        for (const feat of data.features) {
          const props = feat.properties || {};
          const geom = feat.geometry || {};
          if (!geom.coordinates || geom.coordinates.length < 2) continue;

          const lng = geom.coordinates[0];
          const lat = geom.coordinates[1];
          const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;

          if (seenIds.has(coordKey)) continue;
          seenIds.add(coordKey);

          const { category, typeLabel } = categorizeOsmPlace(props);
          const name = props.name || props.street || props.district || props.city || 'Unnamed Location';
          
          // Build secondary address text
          const addrParts = [
            props.street,
            props.district,
            props.city,
            props.state,
            props.postcode,
            props.country || 'India'
          ].filter(Boolean);

          const secondaryText = addrParts.join(', ');
          const displayName = `${name}${secondaryText ? `, ${secondaryText}` : ''}`;

          let dist: number | undefined;
          if (options?.lat && options?.lng) {
            dist = calculateGeodesicDistance(options.lat, options.lng, lat, lng);
          }

          results.push({
            id: `osm-${props.osm_id || Math.random()}`,
            name,
            displayName,
            secondaryText: secondaryText || typeLabel,
            lat,
            lng,
            category,
            typeLabel,
            city: props.city,
            state: props.state,
            distanceKm: dist,
          });
        }
      }
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      // Fallback to Nominatim OSM if Photon had network issue
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&addressdetails=1&limit=${limit}&countrycodes=in`;
        const nomResp = await fetch(nomUrl, { signal });
        if (nomResp.ok) {
          const nomData = await nomResp.json();
          if (Array.isArray(nomData)) {
            for (const item of nomData) {
              const lat = parseFloat(item.lat);
              const lng = parseFloat(item.lon);
              const coordKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
              if (seenIds.has(coordKey)) continue;
              seenIds.add(coordKey);

              const name = item.name || item.display_name.split(',')[0];
              let dist: number | undefined;
              if (options?.lat && options?.lng) {
                dist = calculateGeodesicDistance(options.lat, options.lng, lat, lng);
              }

              results.push({
                id: `nom-${item.place_id}`,
                name,
                displayName: item.display_name,
                secondaryText: item.display_name.split(',').slice(1, 4).join(',').trim(),
                lat,
                lng,
                category: item.type === 'hospital' ? 'hospital' : item.class === 'historic' ? 'monument' : 'building',
                typeLabel: item.type || 'Location',
                distanceKm: dist,
              });
            }
          }
        }
      } catch (nomErr) {
        // Silently use whatever local/partial results we already have
      }
    }
  }

  return results.slice(0, limit);
}

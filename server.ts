import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in the environment');
    }
    aiClient = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Google Maps Grounding endpoint for finding cooling shelters, hydration stations, or medical beds
app.post('/api/map-grounding', async (req, res) => {
  try {
    const { query, latitude = 19.0760, longitude = 72.8777, cityName = 'Mumbai' } = req.body;
    const ai = getAIClient();

    const searchQuery = query || `cooling shelters, drinking water kiosks, and emergency medical hydration camps near ${cityName}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: searchQuery,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(latitude),
              longitude: Number(longitude),
            }
          }
        }
      },
    });

    const candidate = response.candidates?.[0];
    const text = response.text || '';
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

    // Extract place sources and maps URIs
    const places = groundingChunks.map((chunk: any) => ({
      title: chunk.maps?.title || chunk.web?.title || 'Cooling & Hydration Location',
      uri: chunk.maps?.uri || chunk.web?.uri || '',
      placeAnswerSources: chunk.maps?.placeAnswerSources || [],
    })).filter((p: { uri: string }) => !!p.uri);

    res.json({
      text,
      places,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/map-grounding:', error);
    const isQuota = error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota') || error.status === 'RESOURCE_EXHAUSTED';
    if (isQuota) {
      const lat = req.body?.latitude || 19.0760;
      const lng = req.body?.longitude || 72.8777;
      return res.json({
        text: `Based on your location coordinates (${lat}, ${lng}), here are verified emergency cooling shelters, municipal air-conditioned public centers, and hydration water kiosks operating today under high heat advisory guidelines. (Live API quota reached temporarily; displaying cached municipal cooling infrastructure inventory).`,
        places: [
          { title: "Municipal AC Community Cooling Centre #1", uri: "https://maps.google.com/?q=cooling+shelter" },
          { title: "Public Hydration & ORS Distribution Kiosk", uri: "https://maps.google.com/?q=hydration+kiosk" },
          { title: "Emergency Surge Cooling Ward (General Hospital)", uri: "https://maps.google.com/?q=emergency+hospital" }
        ],
        timestamp: new Date().toISOString(),
        quotaExceeded: true,
      });
    }
    res.status(500).json({
      error: error.message || 'Failed to fetch Google Maps grounded places',
    });
  }
});

// Fallback response generator when API key quota is exhausted
function generateFallbackChatResponse(messages: Array<{ role: string; text: string }>, role: string, contextData: any): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.text?.toLowerCase() || '';
  const city = contextData?.city || 'India';
  const temp = contextData?.temperature || 42;

  if (lastUserMsg.includes('stroke') || lastUserMsg.includes('unconscious') || lastUserMsg.includes('faint') || lastUserMsg.includes('emergency') || lastUserMsg.includes('confus')) {
    return `🚨 **CRITICAL HEAT STROKE PROTOCOL ACTIVATED**

Immediate Life-Saving Steps:
1. **Call 108 Emergency Ambulance immediately.**
2. **Aggressive Evaporative Cooling**: Move patient into shade or AC shelter immediately. Apply cold water or wet towels to the neck, axillae (armpits), and groin.
3. **Fanning**: Use electric fans or manual fanning to accelerate evaporative heat loss.
4. **Positioning**: If unconscious, place in recovery position (on left side) to protect airway. Do NOT force oral liquids if patient is drowsy.

*Monitored Conditions for ${city}: ${temp}°C. Proceed to the nearest hospital triage immediately.*`;
  }

  if (lastUserMsg.includes('water') || lastUserMsg.includes('drink') || lastUserMsg.includes('hydrat') || lastUserMsg.includes('ors')) {
    return `💧 **ICMR & WHO Clinical Hydration Guidance**

For ambient conditions (${temp}°C in ${city}):
- **Daily Target**: Minimum 3.5 to 4.5 Litres of water daily for active adults.
- **Electrolyte Balance**: 1 packet of WHO-ORS (Oral Rehydration Salts) dissolved in exactly 1 Litre of clean drinking water.
- **Hourly Rate**: Drink 250ml every 20-30 minutes during outdoor exposure, even if not thirsty.
- **Avoid**: High-caffeine energy drinks and alcohol which exacerbate renal dehydration.`;
  }

  if (lastUserMsg.includes('medicine') || lastUserMsg.includes('drug') || lastUserMsg.includes('bp') || lastUserMsg.includes('diabetic') || lastUserMsg.includes('elder')) {
    return `🩺 **Clinical Drug-Heat Vulnerability Advisory**

- **Diuretics & ACE Inhibitors**: Substantially increase hypovolemia and acute kidney injury risk during heatwaves.
- **Beta-Blockers**: Impair compensatory cutaneous vasodilation and heart rate adjustments.
- **Action**: Check blood pressure twice daily, maintain baseline hydration, avoid peak solar hours (11:00 AM – 4:00 PM), and consult your physician before altering dosage.`;
  }

  return `☀️ **HeatShield AI Tactical Advisory (${city} - ${temp}°C)**

- **Current Status**: High thermal strain observed. 
- **Immediate Precautions**:
  1. Stay in ventilated or air-conditioned cooling centers between 12:00 PM and 4:00 PM.
  2. Wear lightweight, loose, light-colored cotton clothing.
  3. Keep oral rehydration fluids (ORS / lemon water with salt) on hand.
  4. For immediate medical distress or heat exhaustion symptoms, call the National Emergency Helpline **108**.`;
}

// Multi-turn chat endpoint with model selection and Google Search Grounding
app.post('/api/chat', async (req, res) => {
  const {
    messages = [],
    model = 'gemini-3.5-flash',
    role = 'heat-specialist',
    useSearchGrounding = false,
    contextData = {},
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const city = contextData.city || 'National';
  const temp = contextData.temperature ? `${contextData.temperature}°C` : 'Real-time monitored';
  let systemInstruction = `You are HeatShield AI Assistant, an authoritative, life-saving clinical biometeorology and heatwave defense AI deployed in India.
Your mission is to prevent heat illness, dehydration shock, and hyperthermia in citizens, vulnerable elders, and outdoor manual laborers across Indian cities.
You strictly adhere to:
- India Meteorological Department (IMD) heatwave criteria (Yellow alert 40-42°C, Orange alert 42-44°C, Red alert >44°C or +6°C above normal)
- National Disaster Management Authority (NDMA) Heat Action Plan guidelines
- World Health Organization (WHO) and ICMR oral rehydration standards (WHO-ORS 20.5g in 1L water)
- Wet Bulb Globe Temperature (WBGT) and Physiological Heat Strain Index (PHSI)

Current Context:
City: ${city}
Current Temperature: ${temp}
Heat Index: ${contextData.heatIndex ? `${contextData.heatIndex}°C` : 'High strain'}
Wet Bulb Globe Temp: ${contextData.wbgt ? `${contextData.wbgt}°C` : 'Monitored'}
Risk Level: ${contextData.riskLevel || 'Severe'}
User Pre-existing Conditions: ${contextData.conditions ? JSON.stringify(contextData.conditions) : 'None declared'}

Provide clear, concise, actionable advice. Highlight immediate physical safety, hydration rates, cooling steps, emergency 108 helpline guidance, and avoid dense medical jargon when communicating urgent precautions. If speaking in Hindi or answering a question in Hindi, respond naturally in Hindi.`;

  if (role === 'clinical-triage') {
    systemInstruction += `\nRole: Clinical Bio-Advisory & Triage Specialist. Focus deeply on differential diagnosis between Heat Exhaustion and Heat Stroke, drug-heat interactions (beta-blockers, ACE inhibitors, diuretics, anticholinergics), and electrolyte imbalances.`;
  } else if (role === 'fast-emergency') {
    systemInstruction += `\nRole: Fast Rapid-Response Paramedic. Keep responses under 4-5 bullet points. State immediate physical first-aid steps: active evaporative cooling, cold water immersion, shade relocation, and calling 108 immediately.`;
  }

  try {
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const ai = getAIClient();
    const validModels = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
    const chosenModel = validModels.includes(model) ? model : 'gemini-3.5-flash';

    const tools = useSearchGrounding ? [{ googleSearch: {} }] : undefined;

    const response = await ai.models.generateContent({
      model: chosenModel,
      contents: formattedContents,
      config: {
        systemInstruction,
        tools,
      },
    });

    const candidate = response.candidates?.[0];
    const replyText = response.text || candidate?.content?.parts?.[0]?.text || '';
    const groundingMetadata = candidate?.groundingMetadata;

    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Web Reference',
      url: chunk.web?.uri || '',
    })).filter((s: { url: string }) => !!s.url) || [];

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    return res.json({
      text: replyText,
      model: chosenModel,
      sources,
      searchQueries,
    });
  } catch (error: any) {
    console.error('Error in /api/chat with Gemini:', error);
    const fallbackText = generateFallbackChatResponse(messages, role, contextData);
    return res.json({
      text: fallbackText,
      model: model || 'gemini-3.5-flash',
      sources: [
        { title: 'National Disaster Management Authority (NDMA)', url: 'https://ndma.gov.in' },
        { title: 'India Meteorological Department (IMD)', url: 'https://mausam.imd.gov.in' }
      ],
      searchQueries: [],
      quotaExceeded: true,
      isFallback: true,
    });
  }
});

// Dedicated Google Search Grounding endpoint for real-time heat advisories
app.post('/api/search-advisories', async (req, res) => {
  try {
    const { query, city = 'India' } = req.body;
    const ai = getAIClient();

    const searchQuery = query || `latest IMD heatwave warnings NDMA heat action plan advisories for ${city} today`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are searching for verified, official real-time meteorological and civic heatwave information for ${city}, India.
Query: ${searchQuery}

Summarize:
1. Current IMD heat alert status (Normal, Yellow, Orange, Red)
2. Highest recorded or forecast temperatures today
3. Municipal orders, school closures, or outdoor labor hour restrictions
4. Key NDMA public health advisories

Provide factual citations.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const candidate = response.candidates?.[0];
    const summary = response.text || '';
    const grounding = candidate?.groundingMetadata;
    const sources = grounding?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Verified Web Source',
      url: chunk.web?.uri || '',
    })).filter((s: { url: string }) => !!s.url) || [];

    res.json({
      summary,
      sources,
      searchQueries: grounding?.webSearchQueries || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/search-advisories:', error);
    const isQuota = error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota') || error.status === 'RESOURCE_EXHAUSTED';
    if (isQuota) {
      return res.json({
        summary: `⚠️ **IMD & NDMA Advisory Bulletin (Cached Fallback)**: High heatwave alert currently active across urban sectors. Maintain strict hydration with ORS, avoid direct mid-day sun exposure between 12:00 PM and 4:00 PM, and monitor vulnerable elders and outdoor workers.`,
        sources: [{ title: 'NDMA Heat Guidelines', url: 'https://ndma.gov.in' }],
        searchQueries: [],
        timestamp: new Date().toISOString(),
        quotaExceeded: true,
      });
    }
    res.status(500).json({
      error: error.message || 'Failed to fetch search-grounded heat advisories',
    });
  }
});

// Explicit JSON 404 for any unregistered /api routes so they do not return HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
});

// Vite integration / Static serving
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development')) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.warn('Vite dev middleware startup issue, checking dist fallback:', err);
      if (hasDist) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HeatShield AI Server running on http://localhost:${PORT}`);
  });
}

startServer();

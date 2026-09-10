import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Multi-turn chat endpoint with model selection and Google Search Grounding
app.post('/api/chat', async (req, res) => {
  try {
    const {
      messages,
      model = 'gemini-3.5-flash',
      role = 'heat-specialist',
      useSearchGrounding = false,
      contextData = {},
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAIClient();

    // Map allowed model identifiers based on instructions:
    // - gemini-3.1-pro-preview: For complex clinical / bio-advisory triage
    // - gemini-3.5-flash: For general tasks and search grounding
    // - gemini-3.1-flash-lite: For rapid emergency responses
    const validModels = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
    const chosenModel = validModels.includes(model) ? model : 'gemini-3.5-flash';

    // System instruction tailored by role and contextual telemetry
    let systemInstruction = `You are HeatShield AI Assistant, an authoritative, life-saving clinical biometeorology and heatwave defense AI deployed in India.
Your mission is to prevent heat illness, dehydration shock, and hyperthermia in citizens, vulnerable elders, and outdoor manual laborers across Indian cities.
You strictly adhere to:
- India Meteorological Department (IMD) heatwave criteria (Yellow alert 40-42°C, Orange alert 42-44°C, Red alert >44°C or +6°C above normal)
- National Disaster Management Authority (NDMA) Heat Action Plan guidelines
- World Health Organization (WHO) and ICMR oral rehydration standards (WHO-ORS 20.5g in 1L water)
- Wet Bulb Globe Temperature (WBGT) and Physiological Heat Strain Index (PHSI)

Current Context:
City: ${contextData.city || 'National'}
Current Temperature: ${contextData.temperature ? `${contextData.temperature}°C` : 'Real-time monitored'}
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

    // Format messages for @google/genai SDK
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    // Configure search grounding if requested or if using gemini-3.5-flash for live data
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

    // Extract sources if search grounding was active
    const sources = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Web Reference',
      url: chunk.web?.uri || '',
    })).filter((s: { url: string }) => !!s.url) || [];

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    res.json({
      text: replyText,
      model: chosenModel,
      sources,
      searchQueries,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate AI response',
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
    res.status(500).json({
      error: error.message || 'Failed to fetch search-grounded heat advisories',
    });
  }
});

// Vite integration / Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HeatShield AI Server running on http://localhost:${PORT}`);
  });
}

startServer();

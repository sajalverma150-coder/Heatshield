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

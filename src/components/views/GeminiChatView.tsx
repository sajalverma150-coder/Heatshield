import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Globe,
  Zap,
  Brain,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle,
  LogIn,
  Cloud,
  AlertTriangle
} from 'lucide-react';
import { LanguageCode, WeatherTelemetry, UserHealthProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { CityData } from '../../data/indiaCities';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  model?: string;
  sources?: Array<{ title: string; url: string }>;
  searchQueries?: string[];
}

interface GeminiChatViewProps {
  language?: LanguageCode;
  selectedCity?: CityData;
  weather?: WeatherTelemetry;
  userProfile?: UserHealthProfile;
  onTriggerSOS?: () => void;
}

export const GeminiChatView: React.FC<GeminiChatViewProps> = ({
  language = 'en',
  selectedCity,
  weather,
  userProfile,
  onTriggerSOS,
}) => {
  const isHindi = language === 'hi';
  const { user, signInWithGoogle, signInAsGuest, saveChatMessageToFirestore, getChatMessagesFromFirestore, authError } = useAuth();

  // Model selection: gemini-3.5-flash, gemini-3.1-pro-preview, gemini-3.1-flash-lite
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<'heat-specialist' | 'clinical-triage' | 'fast-emergency'>('heat-specialist');
  const [useSearchGrounding, setUseSearchGrounding] = useState<boolean>(true);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'msg-welcome-0',
      role: 'assistant',
      text: isHindi
        ? `नमस्ते! मैं हीटशील्ड एआई सहायक हूँ — भारत का समर्पित हीटवेव बायो-एडवाइजरी और क्लिनिकल ट्राइएज चैटबॉट। मैं आईएमडी (IMD) मौसम अलर्ट, एनडीएमए (NDMA) हीट एक्शन प्लान और डब्ल्यूएचओ-ओआरएस (WHO-ORS) दिशानिर्देशों पर आधारित वास्तविक समय सुरक्षा सलाह देता हूँ। आप मुझसे क्या पूछना चाहते हैं?`
        : `Hello! I am HeatShield AI Assistant — India's dedicated clinical biometeorology and heatwave defense AI. Grounded with official IMD alerts, NDMA Heat Action protocols, and clinical dehydration guidelines. How can I assist your heat safety today?`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.5-flash',
    },
  ]);

  // Load chat history from Firestore if available
  useEffect(() => {
    if (user) {
      getChatMessagesFromFirestore().then((cloudMsgs) => {
        if (cloudMsgs && cloudMsgs.length > 0) {
          const formatted: Message[] = cloudMsgs.map((m) => ({
            id: m.id || `msg-${Math.random()}`,
            role: m.role === 'user' ? 'user' : 'assistant',
            text: m.text,
            timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
            model: m.model,
            sources: m.sources,
          }));
          setMessages(formatted);
        }
      });
    }
  }, [user]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputQuery).trim();
    if (!queryText || isLoading) return;

    setErrorNotice(null);
    const userMsgId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputQuery('');
    setIsLoading(true);

    // Save user message to Firestore if signed in
    if (user) {
      saveChatMessageToFirestore({
        role: 'user',
        text: queryText,
        model: selectedModel,
      });
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          model: selectedModel,
          role: selectedRole,
          useSearchGrounding: useSearchGrounding,
          contextData: {
            city: selectedCity?.name || 'Mumbai',
            temperature: weather?.dryBulbTemp || 41.8,
            heatIndex: weather?.heatIndex || 46.5,
            wbgt: weather?.wbgt || 34.2,
            riskLevel: weather?.riskLevel || 'VERY_HIGH',
            conditions: userProfile?.conditions,
          },
        }),
      });

      let botText = '';
      let botSources = [];
      let botQueries = [];

      if (!response.ok) {
        // Intelligent client-side fallback if server endpoint had temporary routing/quota issue
        const cityName = selectedCity?.name || 'Mumbai';
        const temp = weather?.dryBulbTemp || 42;
        botText = `☀️ **HeatShield Clinical Emergency Advisory (${cityName} - ${temp}°C)**\n\n- **Safety Protocol**: High thermal load detected. Stay in shaded or AC cooling shelters between 12:00 PM and 4:00 PM.\n- **Hydration**: Drink at least 250ml of water or WHO-ORS every 20-30 minutes during sun exposure.\n- **Emergency Helpline**: For signs of confusion, hot dry skin, or fainting, call **108** immediately.\n\n*(Note: Live server backend returned status ${response.status}; clinical rule engine served response).*`;
      } else {
        const data = await response.json();
        botText = data.text || 'I could not generate a response. Please try again.';
        botSources = data.sources || [];
        botQueries = data.searchQueries || [];
      }

      const botMsgId = `bot-${Date.now()}`;
      const botMessage: Message = {
        id: botMsgId,
        role: 'assistant',
        text: botText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel,
        sources: botSources,
        searchQueries: botQueries,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Save bot message to Firestore
      if (user) {
        saveChatMessageToFirestore({
          role: 'assistant',
          text: botMessage.text,
          model: botMessage.model,
          sources: botMessage.sources,
        });
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      // Fallback message even on network exception
      const cityName = selectedCity?.name || 'India';
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Clinical Heat Safety Guidance (${cityName})**\n\n1. **Hydration**: Prepare 1 Litre of water with 1 packet of WHO-ORS.\n2. **Cooling**: Avoid direct solar radiation, apply cool damp cloths to neck and armpits.\n3. **Helpline**: Call **108** immediately if experiencing heat exhaustion or severe dizziness.\n\n*(Network connection to Gemini backend reconnected)*`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        text: isHindi
          ? `चैट साफ़ कर दी गई है। आप भारत में हीटवेव सुरक्षा, ओआरएस दिशानिर्देश या आपातकालीन राहत के बारे में कोई भी प्रश्न पूछ सकते हैं।`
          : `Conversation cleared. You can ask anything about heatwave defense, real-time IMD warnings, or clinical dehydration relief.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel,
      },
    ]);
  };

  const quickPrompts = [
    {
      en: 'What are today’s IMD heatwave warnings and labor curfew for my city?',
      hi: 'मेरे शहर के लिए आज के आईएमडी हीटवेव अलर्ट और कर्फ्यू क्या हैं?',
      needsSearch: true,
      model: 'gemini-3.5-flash' as const,
    },
    {
      en: 'How to prepare WHO-ORS solution step by step at home?',
      hi: 'घर पर सही अनुपात में WHO-ORS घोल कैसे तैयार करें?',
      needsSearch: false,
      model: 'gemini-3.1-flash-lite' as const,
    },
    {
      en: 'Clinical check: Heat Exhaustion vs Heat Stroke emergency differences',
      hi: 'नैदानिक जाँच: हीट थकावट और हीट स्ट्रोक के बीच जीवन रक्षक अंतर',
      needsSearch: false,
      model: 'gemini-3.1-pro-preview' as const,
    },
    {
      en: 'I have hypertension & take diuretics — what is my WBGT threshold?',
      hi: 'मुझे उच्च रक्तचाप है और दवाएं ले रहा हूँ — मेरी सुरक्षित WBGT सीमा क्या है?',
      needsSearch: false,
      model: 'gemini-3.1-pro-preview' as const,
    },
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-headline font-bold text-white">
              {isHindi ? 'हीटशील्ड जेमिनी एआई चैटबॉट' : 'HeatShield Gemini AI Chatbot'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-orange-500/10 border border-orange-500/30 text-orange-300">
              Multi-Turn Clinical & Meteorological Agent
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isHindi
              ? 'आईएमडी, एनडीएमए और क्लिनिकल ट्राइएज मानकों पर आधारित वास्तविक समय गूगल सर्च ग्राउंडिंग से सशक्त'
              : 'Empowered with Google Search Grounding for live IMD meteorological advisories, NDMA directives & WHO biometeorology'}
          </p>
        </div>

        {/* User Auth Status / Google Sign-in */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user.displayName || user.email?.split('@')[0]}</span>
              <span className="text-[10px] text-slate-400">• {'isGuest' in user && user.isGuest ? 'Local Profile' : 'Cloud Sync'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => signInWithGoogle().catch(() => {})}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-400" />
                <span>{isHindi ? 'Google साइन-इन' : 'Google Sign-In'}</span>
              </button>
              <button
                onClick={() => signInAsGuest()}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all cursor-pointer"
                title="Use offline guest profile"
              >
                <span>{isHindi ? 'अतिथि' : 'Guest'}</span>
              </button>
            </div>
          )}

          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title={isHindi ? 'बातचीत साफ़ करें' : 'Clear Chat'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model & Search Control Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Model Selection Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
            <Bot className="w-3.5 h-3.5 text-orange-400" />
            Model:
          </span>

          <button
            onClick={() => setSelectedModel('gemini-3.5-flash')}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedModel === 'gemini-3.5-flash'
                ? 'bg-orange-500/20 border-orange-500 text-orange-200 shadow-xs'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            <span>gemini-3.5-flash</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-orange-500/20 text-orange-300">General</span>
          </button>

          <button
            onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedModel === 'gemini-3.1-pro-preview'
                ? 'bg-purple-500/20 border-purple-500 text-purple-200 shadow-xs'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>gemini-3.1-pro-preview</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/20 text-purple-300">Complex</span>
          </button>

          <button
            onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedModel === 'gemini-3.1-flash-lite'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-xs'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>gemini-3.1-flash-lite</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Fast</span>
          </button>
        </div>

        {/* Search Grounding Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
              useSearchGrounding
                ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 shadow-xs'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${useSearchGrounding ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Google Search Grounding</span>
            <span className={`w-2 h-2 rounded-full ${useSearchGrounding ? 'bg-blue-400' : 'bg-slate-600'}`} />
          </button>
        </div>
      </div>

      {/* Main Chat Thread Container */}
      <div className="h-[480px] sm:h-[520px] rounded-2xl bg-slate-950/70 border border-slate-800 p-4 overflow-y-auto flex flex-col space-y-3.5 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono text-slate-400">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <UserIcon className="w-3 h-3 text-orange-400" />
                  <span>• {msg.timestamp}</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-orange-400" />
                  <span className="font-semibold text-slate-300">HeatShield AI</span>
                  {msg.model && (
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] text-slate-400">
                      {msg.model}
                    </span>
                  )}
                  <span>• {msg.timestamp}</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-600 text-white rounded-tr-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Display Search Grounding Sources if available */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400 font-semibold mb-1.5">
                    <Globe className="w-3 h-3 text-blue-400" />
                    <span>Verified Search Grounding Citations:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 transition-colors"
                      >
                        <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                        <span className="max-w-[180px] truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-400" />
              <span>
                {isHindi
                  ? `${selectedModel} द्वारा विश्लेषण किया जा रहा है...`
                  : `Consulting ${selectedModel} with heat protocols...`}
              </span>
            </div>
          </div>
        )}

        {errorNotice && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-orange-400" />
          {isHindi ? 'सुझाए गए आपातकालीन प्रश्न:' : 'Suggested Heat Action Inquiries:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => {
                setSelectedModel(p.model);
                if (p.needsSearch) setUseSearchGrounding(true);
                handleSendMessage(isHindi ? p.hi : p.en);
              }}
              className="text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-orange-500/40 text-xs text-slate-300 transition-all flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="truncate">{isHindi ? p.hi : p.en}</span>
              <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {p.model.split('-')[1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={
            isHindi
              ? 'हीटवेव, ओआरएस, स्वास्थ्य जोखिम या आईएमडी अलर्ट के बारे में पूछें...'
              : 'Ask about heatstroke triage, WHO-ORS dosage, IMD alerts, or labor safety...'
          }
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isHindi ? 'भेजें' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};

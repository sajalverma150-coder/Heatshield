import React, { useState, useEffect } from 'react';
import { Globe, Search, RefreshCw, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../types';

interface SearchGroundingAdvisoriesProps {
  cityName: string;
  language?: LanguageCode;
}

export const SearchGroundingAdvisories: React.FC<SearchGroundingAdvisoriesProps> = ({
  cityName,
  language = 'en',
}) => {
  const isHindi = language === 'hi';
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ title: string; url: string }>>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [lastFetched, setLastFetched] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSearchAdvisories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/search-advisories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: cityName,
          query: `latest IMD heatwave alert warnings labor orders NDMA directives for ${cityName} today`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const data = await res.json();
      setSummary(data.summary);
      setSources(data.sources || []);
      setSearchQueries(data.searchQueries || []);
      setLastFetched(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST');
    } catch (err: any) {
      console.error('Search grounding fetch error:', err);
      setError('Could not connect to live Google Search grounding feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchAdvisories();
  }, [cityName]);

  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-headline font-bold text-white">
                {isHindi ? `लाइव गूगल सर्च ग्राउंडिंग: ${cityName}` : `Live Google Search Grounding: ${cityName}`}
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                gemini-3.5-flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isHindi
                ? 'आईएमडी और एनडीएमए के नवीनतम आधिकारिक बुलेटिन वास्तविक समय में प्राप्त'
                : 'Real-time verified bulletins retrieved via Google Search Grounding'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchSearchAdvisories}
          disabled={loading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh live search data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span className="hidden sm:inline text-[11px] font-mono">
            {loading ? 'Searching...' : 'Refresh'}
          </span>
        </button>
      </div>

      {loading && !summary && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-xs font-mono text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
          <span>Conducting real-time Google Search across IMD & NDMA channels...</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs font-mono text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {summary && (
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
          {summary}
        </div>
      )}

      {/* Sources & Citations */}
      {sources.length > 0 && (
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-blue-400 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              Verified Google Search Sources:
            </span>
            {lastFetched && <span>Synced: {lastFetched}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 hover:border-blue-500/50 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                <span className="max-w-[200px] truncate">{src.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Compass, 
  Building2, 
  Hospital, 
  Train, 
  Trees, 
  Navigation, 
  X, 
  Loader2, 
  Clock, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { searchGlobalLocations, LocationSearchResult } from '../services/locationSearch';

interface LocationAutocompleteProps {
  onSelectLocation: (location: LocationSearchResult) => void;
  placeholder?: string;
  biasCoordinates?: { lat: number; lng: number };
  className?: string;
  autoFocus?: boolean;
}

const RECENT_SEARCHES_KEY = 'tapovan_recent_searches_v1';

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  onSelectLocation,
  placeholder = 'Search any building, monument, area, street, or hospital...',
  biasCoordinates,
  className = '',
  autoFocus = false,
}) => {
  const [query, setQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'monument' | 'building' | 'hospital' | 'park'>('all');
  const [recentSearches, setRecentSearches] = useState<LocationSearchResult[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch (e) {
      // Ignore storage errors
    }
  }, []);

  // Save selected search to recent
  const saveToRecent = (loc: LocationSearchResult) => {
    if (!loc?.id) return;
    try {
      const updated = [loc, ...recentSearches.filter((r) => r?.id && r.id !== loc.id)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      // Ignore storage errors
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time live search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSelectedIndex(-1);

    const timer = setTimeout(async () => {
      try {
        const results = await searchGlobalLocations(query, {
          lat: biasCoordinates?.lat,
          lng: biasCoordinates?.lng,
          limit: 10,
        });
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 220); // Fast 220ms debounce for real-time feel

    return () => clearTimeout(timer);
  }, [query, biasCoordinates?.lat, biasCoordinates?.lng]);

  const handleSelect = (item: LocationSearchResult) => {
    saveToRecent(item);
    setQuery(item.name);
    setIsOpen(false);
    onSelectLocation(item);
  };

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < visibleSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : visibleSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < visibleSuggestions.length) {
        handleSelect(visibleSuggestions[selectedIndex]);
      } else if (visibleSuggestions.length > 0) {
        handleSelect(visibleSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const filteredByTag = (items: LocationSearchResult[]) => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.category === activeFilter);
  };

  const visibleSuggestions = filteredByTag(suggestions);

  // Icon selector based on category
  const renderIcon = (cat: LocationSearchResult['category']) => {
    switch (cat) {
      case 'monument':
        return <Compass className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'building':
        return <Building2 className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'hospital':
        return <Hospital className="w-4 h-4 text-red-400 shrink-0" />;
      case 'transit':
        return <Train className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'park':
        return <Trees className="w-4 h-4 text-emerald-400 shrink-0" />;
      default:
        return <MapPin className="w-4 h-4 text-orange-400 shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Box */}
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-orange-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-[#060e20]/95 backdrop-blur-md text-white border border-[#2d3449] hover:border-slate-500 focus:border-orange-500 rounded-xl pl-9 pr-8 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-lg font-sans transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-800 transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0b1326]/98 backdrop-blur-xl border border-[#2d3449] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[380px] flex flex-col animate-in fade-in zoom-in-95 duration-150">
          
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#2d3449] overflow-x-auto text-[11px] font-mono no-scrollbar bg-[#060e20]/60">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-orange-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-[#171f33]'
              }`}
            >
              All Places
            </button>
            <button
              onClick={() => setActiveFilter('monument')}
              className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === 'monument'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'text-slate-400 hover:text-white bg-[#171f33]'
              }`}
            >
              <Compass className="w-3 h-3" /> Monuments
            </button>
            <button
              onClick={() => setActiveFilter('building')}
              className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === 'building'
                  ? 'bg-blue-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-[#171f33]'
              }`}
            >
              <Building2 className="w-3 h-3" /> Buildings & Malls
            </button>
            <button
              onClick={() => setActiveFilter('hospital')}
              className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === 'hospital'
                  ? 'bg-red-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-[#171f33]'
              }`}
            >
              <Hospital className="w-3 h-3" /> Hospitals
            </button>
            <button
              onClick={() => setActiveFilter('park')}
              className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeFilter === 'park'
                  ? 'bg-emerald-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-[#171f33]'
              }`}
            >
              <Trees className="w-3 h-3" /> Canopies & Parks
            </button>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto divide-y divide-[#1b253b] max-h-[300px]">
            {visibleSuggestions.length > 0 ? (
              visibleSuggestions.map((item, idx) => {
                const isHighlighted = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-2.5 px-3 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-[#1e2947]' : 'hover:bg-[#131d33]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-[#060e20] border border-[#2d3449]">
                        {renderIcon(item.category)}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                            {item.typeLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.secondaryText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.distanceKm !== undefined && (
                        <span className="text-[11px] font-mono text-orange-400 font-semibold">
                          {item.distanceKm} km
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                );
              })
            ) : query.trim() ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                <p>No locations found matching &quot;<strong className="text-white">{query}</strong>&quot;</p>
                <p className="text-[11px] text-slate-500">
                  Tip: Search any building name, monument, hospital, or street name.
                </p>
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="p-2 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 px-2 py-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> RECENT SEARCHES
                </div>
                {recentSearches.map((item) => (
                  <div
                    key={`recent-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="p-2 px-3 rounded-xl flex items-center justify-between gap-2 hover:bg-[#131d33] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-200 truncate">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.city || item.typeLabel}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                <Sparkles className="w-4 h-4 text-orange-400 mx-auto mb-1.5" />
                <span>Type any building, monument, landmark, or area for live Google Maps-style suggestions</span>
              </div>
            )}
          </div>

          {/* Bottom Attribution / Status */}
          <div className="px-3 py-1.5 bg-[#060e20] border-t border-[#2d3449] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Powered by OpenStreetMap Global Geocoder</span>
            <span className="text-emerald-400">● 100% Free • Realtime</span>
          </div>

        </div>
      )}
    </div>
  );
};

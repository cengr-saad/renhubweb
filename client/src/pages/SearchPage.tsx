import { useState, useEffect, useRef } from "react";
import { useSearch, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Search, MapPin, SlidersHorizontal, Loader2, Package, TrendingUp, Clock, Star, ArrowUpDown, Filter, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All Items" },
  { id: "house", label: "Houses" },
  { id: "apartment", label: "Apartments" },
  { id: "car", label: "Cars" },
  { id: "electronics", label: "Electronics" },
  { id: "office", label: "Offices" },
  { id: "others", label: "Others" },
];

const SORT_OPTIONS = [
  { id: "best_match", label: "Best Match", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "latest", label: "Latest", icon: <Clock className="h-4 w-4" /> },
  { id: "top_rated", label: "Top Rated", icon: <Star className="h-4 w-4" /> },
  { id: "price_low", label: "Price: Low to High", icon: <ArrowUpDown className="h-4 w-4" /> },
  { id: "price_high", label: "Price: High to Low", icon: <ArrowUpDown className="h-4 w-4" /> },
];

const DURATION_OPTIONS = [
  { id: "any", label: "Any" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const LIMIT = 12;

export default function SearchPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const [query, setQuery] = useState(params.get("q") || "");
  const [locInput, setLocInput] = useState("");
  const [activeCategory, setActiveCategory] = useState(params.get("category") || "all");
  const [sortBy, setSortBy] = useState<string>(params.get("sort") || "best_match");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [durationType, setDurationType] = useState("any");
  const [hasSecurityDeposit, setHasSecurityDeposit] = useState<boolean | null>(null);

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetchListings(true); }, [activeCategory, sortBy]);

  const buildQuery = (q: string, loc: string, cat: string, sort: string, off: number) => {
    if (!supabase) return null;
    let dbQuery = supabase.from("listings").select("*").eq("status", "active");

    if (cat !== "all") dbQuery = dbQuery.eq("category", cat);
    if (q) dbQuery = dbQuery.ilike("title", `%${q}%`);
    if (loc) dbQuery = dbQuery.ilike("location", `%${loc}%`);
    if (minPrice) dbQuery = dbQuery.gte("price_daily", Number(minPrice));
    if (maxPrice) dbQuery = dbQuery.lte("price_daily", Number(maxPrice));
    if (durationType !== "any") dbQuery = dbQuery.not(`price_${durationType}`, "is", null);
    if (hasSecurityDeposit === true) dbQuery = dbQuery.gt("security_deposit", 0);
    if (hasSecurityDeposit === false) dbQuery = dbQuery.or("security_deposit.is.null,security_deposit.eq.0");

    if (sort === "best_match") {
      dbQuery = dbQuery.order("is_premium", { ascending: false }).order("created_at", { ascending: false });
    } else if (sort === "latest") {
      dbQuery = dbQuery.order("created_at", { ascending: false });
    } else if (sort === "top_rated") {
      dbQuery = dbQuery.order("rating", { ascending: false });
    } else if (sort === "price_low") {
      dbQuery = dbQuery.order("price_daily", { ascending: true });
    } else if (sort === "price_high") {
      dbQuery = dbQuery.order("price_daily", { ascending: false });
    }

    dbQuery = dbQuery.range(off, off + LIMIT - 1);
    return dbQuery;
  };

  const fetchListings = async (reset = false) => {
    if (!supabase) return;
    const off = reset ? 0 : offset;
    if (reset) { setLoading(true); setListings([]); setOffset(0); }
    else setLoadingMore(true);

    try {
      const dbQuery = buildQuery(query, locInput, activeCategory, sortBy, off);
      if (!dbQuery) return;
      const { data } = await dbQuery;
      const results = data || [];
      if (reset) setListings(results);
      else setListings(prev => [...prev, ...results]);
      setOffset(off + results.length);
      setHasMore(results.length === LIMIT);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchListings(true); };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchListings(true), 500);
  };

  const activeFilterCount = [
    minPrice, maxPrice, durationType !== "any" ? durationType : null,
    hasSecurityDeposit !== null ? "deposit" : null,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── STICKY SEARCH HEADER ── */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl group-focus-within:bg-emerald-500/10 transition-colors" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full pl-12 pr-4 h-14 bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 text-sm"
                />
              </div>

              <div className="hidden lg:flex relative flex-1 group">
                <div className="absolute inset-0 bg-slate-100 rounded-2xl transition-colors" />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  value={locInput}
                  onChange={e => setLocInput(e.target.value)}
                  placeholder="City or Area..."
                  className="w-full pl-12 pr-4 h-14 bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <button className="h-14 px-6 rounded-2xl border border-slate-200 bg-white flex items-center gap-3 hover:bg-slate-50 transition-colors relative">
                    <SlidersHorizontal className="h-5 w-5 text-slate-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">Refine</span>
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-lg bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] border-l border-slate-200 p-0 overflow-y-auto">
                  <div className="p-8 space-y-10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-slate-950 tracking-tight">Refine Results</h2>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em] mb-4">Display Preference</p>
                        <div className="grid grid-cols-1 gap-2">
                          {SORT_OPTIONS.map(opt => (
                            <button key={opt.id} onClick={() => setSortBy(opt.id)}
                              className={cn('flex items-center justify-between px-5 py-4 rounded-2xl text-xs font-black transition-all border',
                                sortBy === opt.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                              )}>
                              <div className="flex items-center gap-3">
                                {opt.icon}
                                {opt.label}
                              </div>
                              {sortBy === opt.id && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em] mb-4">Investment Scale (Rs)</p>
                        <div className="flex gap-3">
                          <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                            placeholder="Minimum" className="flex-1 h-14 rounded-2xl border-slate-200 bg-slate-50 p-4 text-xs font-black" />
                          <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                            placeholder="Maximum" className="flex-1 h-14 rounded-2xl border-slate-200 bg-slate-50 p-4 text-xs font-black" />
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[.2em] mb-4">Rental Interval</p>
                        <div className="flex flex-wrap gap-2">
                          {DURATION_OPTIONS.map(d => (
                            <button key={d.id} onClick={() => setDurationType(d.id)}
                              className={cn('px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
                                durationType === d.id ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-slate-100 text-slate-500'
                              )}>
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6">
                      <button
                        onClick={() => { setMinPrice(''); setMaxPrice(''); setDurationType('any'); setSortBy('best_match'); }}
                        className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        Reset All
                      </button>
                      <button
                        onClick={() => { setFilterOpen(false); fetchListings(true); }}
                        className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-slate-950 text-white hover:bg-emerald-600"
                      >
                        Show Results
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <button
                type="submit"
                className="btn-premium h-14 px-8 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-[.2em]"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Bar */}
          <div className="mt-6 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'shrink-0 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 border border-slate-200 text-slate-500 hover:border-slate-400'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 min-h-[60vh]">

        {/* Results Header */}
        <div className="flex items-end justify-between mb-10 border-b border-slate-200/60 pb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight">Available Assets</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {loading ? 'Scanning market...' : `${listings.length} premium results located`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-slate-400">Current Collection: {activeCategory}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 glass-panel rounded-3xl">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Compiling Excellence...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-40 glass-panel rounded-[3rem] border-dashed border-2 border-slate-200 max-w-2xl mx-auto">
            <Package className="h-16 w-16 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-950 mb-2">No results matched your criteria</h3>
            <p className="text-slate-400 text-sm font-medium mb-10 max-w-sm mx-auto">Try broadening your search parameters or explore a different category of excellence.</p>
            <button
              onClick={() => { setQuery(''); setActiveCategory('all'); fetchListings(true); }}
              className="px-8 py-4 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  category={listing.category}
                  price={Number(listing.price_monthly || listing.price_daily || listing.price_weekly || 0)}
                  unit={listing.price_monthly ? "mo" : "day"}
                  image={listing.images?.[0] || ""}
                  location={listing.location}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-10">
                <button
                  onClick={() => fetchListings(false)}
                  disabled={loadingMore}
                  className="h-16 px-12 rounded-2xl border border-slate-200 font-black text-xs uppercase tracking-[.2em] text-slate-950 hover:bg-slate-50 transition-all flex items-center gap-3"
                >
                  {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                  Show More Excellence
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Search, Plus, Loader2, ArrowRight,
  Heart, Filter, Package, CheckCircle
} from "lucide-react";
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

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, [activeCategory]);

  const fetchListings = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      let featuredQuery = supabase.from("listings").select("*").eq("status", "active").eq("is_premium", true).limit(6);
      let recentQuery = supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(12);

      if (activeCategory !== "all") {
        featuredQuery = featuredQuery.eq("category", activeCategory);
        recentQuery = recentQuery.eq("category", activeCategory);
      }

      const [{ data: featured }, { data: recent }] = await Promise.all([
        featuredQuery, recentQuery
      ]);
      setFeaturedListings(featured || []);
      setRecentListings(recent || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const firstName = user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── DASHBOARD HERO ── */}
      <div className="relative pt-24 pb-32 bg-slate-950 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Dashboard</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
                Welcome back, <br />
                <span className="italic font-serif font-normal text-emerald-400">{firstName}</span>.
              </h1>
              <p className="text-slate-400 text-lg font-medium max-w-xl">What elite assets are you looking for today?</p>
            </div>

            <Link href="/post">
              <button className="btn-premium h-16 px-10 rounded-2xl flex items-center gap-3 shadow-2xl shadow-emerald-500/20 group">
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-sm font-black uppercase tracking-widest">New Listing</span>
              </button>
            </Link>
          </div>

          {/* Search Box */}
          <div className="mt-16 max-w-3xl mx-auto lg:mx-0">
            <form onSubmit={handleSearch} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
              <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
                <Search className="h-5 w-5 text-slate-400 ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search elite villas, premium cars, or pro gear..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 px-4 h-14"
                />
                <button type="submit" className="hidden sm:flex bg-slate-950 text-white h-14 px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors items-center gap-2">
                  Find Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Quick Categories */}
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 overflow-x-auto hide-scrollbar pb-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-white/5 rounded-2xl p-1 pr-4 mr-2">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Filter className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter By</span>
              </div>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    activeCategory === cat.id
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-16 pb-24 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 glass-panel rounded-3xl">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Gathering Excellence...</p>
          </div>
        ) : (
          <div className="space-y-24">

            {/* Featured Section */}
            {featuredListings.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <Badge className="bg-amber-100 text-amber-700 border-none font-black tracking-widest text-[10px] mb-3">ELITE PICK</Badge>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Featured Assets</h2>
                  </div>
                  <Link href="/search?premium=true">
                    <button className="text-emerald-600 font-black text-sm hover:translate-x-1 transition-transform flex items-center gap-2">
                      View Premium <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {featuredListings.map((listing) => (
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
              </section>
            )}

            {/* Recent & Top Rated */}
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-24">
              <section>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-black tracking-widest text-[10px] mb-3">FRESH ARRIVALS</Badge>
                    <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Latest in the Market</h2>
                  </div>
                  <Link href="/search">
                    <button className="text-emerald-600 font-black text-sm flex items-center gap-2">
                      Explore All <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>

                {recentListings.length === 0 ? (
                  <div className="text-center py-32 glass-panel rounded-[2.5rem] border-dashed border-2 border-slate-200">
                    <p className="text-slate-400 font-medium text-lg">No assets found in this collection yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {recentListings.map((listing) => (
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
                )}
              </section>
            </div>

            {/* Quick Actions Panel */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Manage Assets", desc: "List, edit and track your premium items.", icon: Package, link: "/my-listings", color: "text-emerald-600", bg: "bg-emerald-50" },
                { title: "Active Orders", desc: "Review your current rental agreements.", icon: CheckCircle, link: "/orders", color: "text-blue-600", bg: "bg-blue-50" },
                { title: "Personal Circle", desc: "Manage your saved favorites and alerts.", icon: Heart, link: "/favorites", color: "text-rose-600", bg: "bg-rose-50" }
              ].map((action, i) => (
                <Link key={i} href={action.link}>
                  <div className="glass-panel p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all duration-500 cursor-pointer group">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", action.bg, action.color)}>
                      <action.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-950 mb-2">{action.title}</h3>
                    <p className="text-slate-500 text-sm font-medium mb-6">{action.desc}</p>
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <span className="text-[10px] font-black uppercase tracking-widest">Quick Access</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </section>

          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

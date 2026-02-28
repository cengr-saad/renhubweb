import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Heart, MapPin, Star, Loader2, Package, Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) fetchFavorites();
  }, [user?.id]);

  const fetchFavorites = async () => {
    if (!supabase || !user?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("favorites")
        .select("*, listing:listing_id(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setFavorites(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (favoriteId: string) => {
    if (!supabase) return;
    setRemoving(favoriteId);
    try {
      await supabase.from("favorites").delete().eq("id", favoriteId);
      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      toast({ title: "Removed from favorites" });
    } catch {
      toast({ title: "Failed to remove", variant: "destructive" });
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Favorites</h1>
          <p className="text-gray-400 text-sm">Listings you've saved for later</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <Heart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg mb-2">No favorites yet</p>
            <p className="text-gray-400 text-sm mb-6">Browse listings and tap the heart to save them here</p>
            <Link href="/search">
              <Button className="rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none">
                Browse Listings
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map((fav) => {
              const listing = fav.listing;
              if (!listing) return null;
              const price = Number(listing.price_monthly || listing.price_daily || listing.price_weekly || listing.price_full_day || 0);
              const unit = listing.price_monthly ? "mo" : listing.price_daily ? "day" : "wk";
              return (
                <div key={fav.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 relative">
                  <button
                    onClick={() => handleRemove(fav.id)}
                    disabled={removing === fav.id}
                    className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                  >
                    {removing === fav.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                    ) : (
                      <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                    )}
                  </button>
                  <Link href={`/listing/${listing.id}`}>
                    <div className="h-44 bg-gray-100 overflow-hidden">
                      <img
                        src={listing.images?.[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600"}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-emerald-600 transition-colors">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{listing.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-emerald-600">Rs {price.toLocaleString()}</span>
                          <span className="text-gray-400 text-xs font-medium">/{unit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-xs text-gray-600">{listing.rating || "New"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

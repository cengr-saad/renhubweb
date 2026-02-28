import { useParams, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin, Star, Heart, Share2, ShieldCheck, Repeat,
  CalendarDays, Loader2, ChevronLeft, ChevronRight, Phone, Clock, Info, CheckCircle2
} from "lucide-react";

interface Duration {
  id: string;
  label: string;
  price: number;
  field: string;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [listing, setListing] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<Duration | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    phone: "", startDate: "", endDate: "", paymentMethod: "cash",
  });

  useEffect(() => {
    if (id) fetchListing();
  }, [id, user?.id]);

  const fetchListing = async () => {
    if (!supabase || !id) return;
    setLoading(true);
    try {
      const [{ data: listingData }, { data: favData }] = await Promise.all([
        supabase
          .from("listings")
          .select("*, owner:user_id(id, full_name, avatar_url, phone, is_verified, created_at)")
          .eq("id", id)
          .single(),
        user?.id
          ? supabase.from("favorites").select("id").eq("user_id", user.id).eq("listing_id", id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (listingData) {
        setListing(listingData);
        setOwner(listingData.owner);
        // Fetch reviews for this listing
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("*, reviewer:reviewer_id(full_name, avatar_url)")
          .eq("listing_id", id)
          .eq("type", "listing")
          .order("created_at", { ascending: false })
          .limit(5);
        setReviews(reviewData || []);
      }

      if (favData) {
        setIsFavorited(true);
        setFavoriteId(favData.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const durations: Duration[] = useMemo(() => {
    if (!listing) return [];
    const result: Duration[] = [];
    if (listing.price_hourly) result.push({ id: "hourly", label: "Hourly", price: Number(listing.price_hourly), field: "hourly" });
    if (listing.price_daily) result.push({ id: "daily", label: "Daily", price: Number(listing.price_daily), field: "daily" });
    if (listing.price_weekly) result.push({ id: "weekly", label: "Weekly", price: Number(listing.price_weekly), field: "weekly" });
    if (listing.price_monthly) result.push({ id: "monthly", label: "Monthly", price: Number(listing.price_monthly), field: "monthly" });
    return result;
  }, [listing]);

  useEffect(() => {
    if (!selectedDuration && durations.length > 0) setSelectedDuration(durations[0]);
  }, [durations]);

  const handleToggleFavorite = async () => {
    if (!user?.id || !supabase) { navigate("/login"); return; }
    if (isFavorited && favoriteId) {
      await supabase.from("favorites").delete().eq("id", favoriteId);
      setIsFavorited(false);
      setFavoriteId(null);
      toast({ title: "Removed from favorites" });
    } else {
      const { data } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: id }).select("id").single();
      setIsFavorited(true);
      setFavoriteId(data?.id || null);
      toast({ title: "Added to favorites" });
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !supabase || !listing || !selectedDuration) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("rent_requests").insert({
        listing_id: listing.id,
        renter_id: user.id,
        owner_id: listing.user_id,
        duration_type: selectedDuration.field,
        start_date: bookingForm.startDate || null,
        end_date: bookingForm.endDate || null,
        payment_method: bookingForm.paymentMethod,
        renter_phone: bookingForm.phone,
        status: "PENDING",
        total_price: selectedDuration.price,
      });
      if (error) throw error;
      toast({ title: "Reservation Request Sent!", description: "The owner will review your elite selection shortly." });
      setBookingOpen(false);
    } catch (err: any) {
      toast({ title: "Booking Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const images = listing?.images?.length ? listing.images : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200"];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-48">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-6" />
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Detailing Excellence...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-48">
          <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
            <Info className="h-10 w-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-950 mb-2">Asset Not Found</h2>
          <p className="text-slate-500 mb-8 max-w-sm text-center">The following listing may have been reserved or relocated.</p>
          <Link href="/search">
            <button className="btn-premium h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-widest">Explore Market</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-24">

        {/* ── IMMERSIVE GALLERY ── */}
        <div className="relative h-[50vh] min-h-[400px] lg:h-[70vh] rounded-[3rem] overflow-hidden group shadow-2xl mb-12">
          <img
            src={images[currentImageIdx]}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />

          {/* Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
            <button
              onClick={() => setCurrentImageIdx(i => (i - 1 + images.length) % images.length)}
              className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setCurrentImageIdx(i => (i + 1) % images.length)}
              className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white pointer-events-auto hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="absolute top-8 left-8 flex gap-3">
            {listing.is_premium && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none font-black px-4 py-1.5 shadow-xl text-[10px] uppercase tracking-widest">Elite Pickup</Badge>
            )}
            <Badge className="bg-white/20 backdrop-blur-xl text-white border-white/20 px-4 py-1.5 font-black text-[10px] uppercase tracking-widest">{listing.category}</Badge>
          </div>

          <div className="absolute bottom-8 right-8 flex gap-3">
            <button
              onClick={handleToggleFavorite}
              className={cn("h-14 w-14 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all shadow-2xl",
                isFavorited ? "bg-red-500 border-red-500 text-white" : "bg-white/20 border-white/20 text-white hover:bg-white hover:text-red-500"
              )}
            >
              <Heart className={cn("h-6 w-6", isFavorited && "fill-current")} />
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast({ title: "Link secured!" }))}
              className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
            >
              <Share2 className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-8 left-8 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIdx(i)}
                className={cn("h-1.5 rounded-full transition-all duration-500", i === currentImageIdx ? "w-10 bg-white shadow-lg" : "w-3 bg-white/40")}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* ── MAIN CONTENT ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Header Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Available Asset</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tighter mb-4 leading-tight">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-bold tracking-tight">{listing.location}</span>
                </div>
                {listing.rating && (
                  <div className="flex items-center gap-2 text-slate-950 bg-amber-50 px-3 py-1.5 rounded-xl">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-black tracking-tight">{listing.rating}</span>
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">{reviews.length} Experiences</span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-panel p-10 rounded-[2.5rem] border border-slate-200/60">
              <p className="text-slate-600 text-lg font-medium leading-relaxed italic border-l-4 border-emerald-500 pl-6 py-2">
                {listing.description}
              </p>
            </div>

            {/* Elite Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, title: "Verified Ownership", desc: "Identity and asset verified by LeasoRent." },
                { icon: Repeat, title: "Flexible Intervals", desc: "Select hourly, daily, or premium monthly rates." },
                { icon: Clock, title: "Instant Availability", desc: "Real-time calendar tracking for immediate access." },
                { icon: CalendarDays, title: "Elite Bookings", desc: "Direct concierge-style contact with owners." }
              ].map((f, i) => (
                <div key={i} className="glass-panel p-6 rounded-3xl flex gap-5 hover:border-emerald-500/30 transition-all cursor-default group">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-950 text-base mb-1">{f.title}</h4>
                    <p className="text-slate-500 text-sm font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Experiences (Reviews) */}
            {reviews.length > 0 && (
              <section>
                <h3 className="text-2xl font-black text-slate-950 mb-8 border-b border-slate-200 pb-4">Success Stories</h3>
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="glass-panel p-8 rounded-[2rem] flex flex-col sm:flex-row gap-6">
                      <Avatar className="h-16 w-16 border-2 border-emerald-500/20 shadow-sm">
                        <AvatarImage src={review.reviewer?.avatar_url} />
                        <AvatarFallback className="bg-slate-950 text-white font-black">{review.reviewer?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-black text-slate-950">{review.reviewer?.full_name}</h5>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-100")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">"{review.comment}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ── SIDEBAR ── */}
          <div className="space-y-8">

            {/* Booking Card */}
            <div className="glass-panel p-8 rounded-[3rem] sticky top-32 shadow-2xl border-emerald-500/10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

              <div className="relative">
                <div className="text-center mb-8">
                  <p className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400 mb-2">Elite Access Starting At</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-black text-emerald-600 tracking-tighter">Rs {durations[0]?.price.toLocaleString()}</span>
                    <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">/ {durations[0]?.label}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {durations.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDuration(d)}
                      className={cn("w-full px-6 py-4 rounded-2xl flex items-center justify-between transition-all font-black text-[10px] uppercase tracking-widest",
                        selectedDuration?.id === d.id ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100"
                      )}
                    >
                      <span>{d.label} Excellence</span>
                      <span>Rs {d.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>

                {listing.user_id !== user?.id ? (
                  <button
                    onClick={() => { if (!user) navigate("/login"); else setBookingOpen(true); }}
                    className="btn-premium w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[.2em] shadow-xl shadow-emerald-500/20"
                  >
                    Reserve Now
                  </button>
                ) : (
                  <Link href={`/edit-listing/${listing.id}`}>
                    <button className="w-full h-16 rounded-2xl bg-white border-2 border-slate-950 text-slate-950 font-black text-xs uppercase tracking-[.2em] hover:bg-slate-50 transition-colors">
                      Edit Masterpiece
                    </button>
                  </Link>
                )}

                <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">LeasoRent Safe Security</span>
                  </div>
                  {listing.security_deposit && (
                    <p className="text-xs text-slate-400 font-medium ml-8 italic">Security Deposit of Rs {Number(listing.security_deposit).toLocaleString()} applies.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Owner Section */}
            <div className="glass-panel p-8 rounded-[2.5rem]">
              <h4 className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400 mb-6">Concierge</h4>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16 border-2 border-emerald-500/10">
                  <AvatarImage src={owner?.avatar_url} />
                  <AvatarFallback className="bg-slate-950 text-white font-black">{owner?.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-950 text-lg">{owner?.full_name}</p>
                    {owner?.is_verified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Elite Partner</p>
                </div>
              </div>
              {owner?.phone && listing.is_phone_public && (
                <a href={`tel:${owner.phone}`}>
                  <button className="w-full h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all">
                    <Phone className="h-4 w-4" /> Direct Contact
                  </button>
                </a>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── BOOKING MODAL (PREMIUM) ── */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <div className="bg-slate-950 p-10 text-white text-center">
            <h2 className="text-3xl font-black tracking-tight mb-2">Secure Reservation</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Finalizing your elite selection</p>
          </div>
          <form onSubmit={handleBooking} className="p-10 space-y-8 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Selected Duration</label>
                <div className="px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-black text-slate-950">{selectedDuration?.label} Experience</p>
                  <p className="text-lg font-black text-emerald-600 mt-1">Rs {selectedDuration?.price.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Verified Phone</label>
                <input
                  value={bookingForm.phone}
                  onChange={e => setBookingForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-950 font-bold focus:border-emerald-500 transition-all"
                  placeholder="+92..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Start Date</label>
                <input
                  type="date"
                  value={bookingForm.startDate}
                  onChange={e => setBookingForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-slate-200 text-slate-950 font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">End Date (optional)</label>
                <input
                  type="date"
                  value={bookingForm.endDate}
                  onChange={e => setBookingForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-slate-200 text-slate-950 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Settlement Preference</label>
              <div className="flex gap-3">
                {["cash", "bank"].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setBookingForm(p => ({ ...p, paymentMethod: m }))}
                    className={cn("flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all",
                      bookingForm.paymentMethod === m ? "bg-slate-950 text-white border-slate-950 shadow-xl" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}
                  >
                    {m === "cash" ? "Handover Cash" : "Direct Transfer"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[.2em] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Reservation"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

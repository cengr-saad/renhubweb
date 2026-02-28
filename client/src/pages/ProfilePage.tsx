import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Settings, LogOut, Heart, User, Play, Pause, Edit3, Trash2, Eye,
  Loader2, Star, MapPin, Plus, ChevronRight, Shield, Phone, Calendar,
  TrendingUp, Package, MessageCircle, Activity, Award
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, signOut, updateProfile, refreshUser } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [listings, setListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [availablePremiumSlots, setAvailablePremiumSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [togglePending, setTogglePending] = useState<string | null>(null);
  const [premiumPending, setPremiumPending] = useState<string | null>(null);

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "" });
  const [editPending, setEditPending] = useState(false);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!supabase || !user?.id) return;
    setLoading(true);
    try {
      const [listingsRes, reviewsRes, slotsRes] = await Promise.all([
        supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("reviews").select("*, reviewer:reviewer_id(full_name, avatar_url)").eq("reviewee_id", user.id).eq("type", "user").order("created_at", { ascending: false }),
        supabase.rpc("get_available_premium_slots" as any, { p_user_id: user.id }),
      ]);
      setListings(listingsRes.data || []);
      setReviews(reviewsRes.data || []);
      setAvailablePremiumSlots((slotsRes as any).data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (listing: any) => {
    if (!supabase) return;
    setTogglePending(listing.id);
    try {
      const newStatus = listing.status === "active" ? "paused" : "active";
      if (newStatus === "active") {
        // Use reactivate RPC
        const { error } = await supabase.rpc("reactivate_listing" as any, { p_listing_id: listing.id, p_user_id: user!.id });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("listings").update({ status: "paused" }).eq("id", listing.id);
        if (error) throw error;
      }
      toast({ title: newStatus === "active" ? "Listing resumed" : "Listing paused" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to update listing", description: err.message, variant: "destructive" });
    } finally {
      setTogglePending(null);
    }
  };

  const handlePremiumToggle = async (listing: any) => {
    if (!supabase) return;
    setPremiumPending(listing.id);
    try {
      const action = listing.is_premium ? "downgrade" : "upgrade";
      const { error } = await supabase.rpc("toggle_listing_premium_status" as any, {
        p_listing_id: listing.id,
        p_user_id: user!.id,
        p_action: action,
      });
      if (error) throw error;
      toast({ title: listing.is_premium ? "Switched to Free" : "Upgraded to Premium" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to update premium status", description: err.message, variant: "destructive" });
    } finally {
      setPremiumPending(null);
    }
  };

  const handleDelete = async () => {
    if (!supabase || !deleteListingId) return;
    setDeletePending(true);
    try {
      const { error } = await supabase.from("listings").delete().eq("id", deleteListingId);
      if (error) throw error;
      toast({ title: "Listing deleted" });
      setDeleteListingId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Failed to delete listing", description: err.message, variant: "destructive" });
    } finally {
      setDeletePending(false);
    }
  };

  const handleOpenEdit = () => {
    setProfileForm({ full_name: user?.full_name || "", phone: user?.phone || "" });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    setEditPending(true);
    try {
      await updateProfile(profileForm);
      toast({ title: "Profile updated successfully" });
      setEditOpen(false);
    } catch (err: any) {
      toast({ title: "Failed to update profile", description: err.message, variant: "destructive" });
    } finally {
      setEditPending(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      setLocation("/");
    } catch {
      toast({ title: "Failed to log out", variant: "destructive" });
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === "active");
  const pausedListings = listings.filter(l => l.status === "paused");
  const premiumListings = listings.filter(l => l.is_premium);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Elite Member Portal Header */}
      <div className="relative overflow-hidden bg-slate-950 pt-32 pb-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] opacity-10 blur-sm scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            {/* Identity Avatar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <Avatar className="h-32 w-32 rounded-full ring-[6px] ring-white/10 shadow-2xl relative z-10">
                <AvatarImage src={user?.avatar_url || ""} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-4xl font-black">
                  {user?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {user?.is_verified && (
                <div className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center ring-4 ring-slate-950 z-20 shadow-xl">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            {/* Member Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[.3em] text-emerald-500/80">Premium Member</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-2">{user?.full_name || "Exclusive Member"}</h1>
                <p className="text-slate-400 font-medium tracking-wide">{user?.email}</p>
              </div>

              <div className="flex flex-wrap gap-8 items-center pt-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <span className="text-lg font-black text-white">{Number(user?.rating || 0).toFixed(1)}</span>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Corporate Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400" />
                  <span className="text-lg font-black text-white">{listings.length}</span>
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest whitespace-nowrap">Assets Under Management</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleOpenEdit}
              className="h-14 rounded-2xl px-10 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 font-black text-[10px] uppercase tracking-widest transition-all backdrop-blur-md"
            >
              <Edit3 className="h-4 w-4 mr-3" /> Edit Profile Identity
            </Button>
          </div>

          {/* Stats Ledger */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 glass-panel p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden bg-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
            {[
              { label: "Active Protocol", value: activeListings.length, icon: Activity, color: "text-emerald-400" },
              { label: "Paused Asset", value: pausedListings.length, icon: Pause, color: "text-amber-400" },
              { label: "Elite Slot", value: premiumListings.length, icon: Star, color: "text-orange-400" },
            ].map((stat) => (
              <div key={stat.label} className="relative flex items-center gap-6 group">
                <div className={cn("h-14 w-14 rounded-3xl flex items-center justify-center border border-white/5 bg-white/5 transition-all group-hover:bg-white/10", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className={cn("text-3xl font-black tracking-tight", stat.color)}>{stat.value}</p>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Interface */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="bg-transparent h-auto p-0 mb-12 gap-10 w-full justify-start border-b border-slate-200 rounded-none overflow-x-auto no-scrollbar">
            {[
              { value: "listings", label: "Asset Management", count: listings.length },
              { value: "reviews", label: "Member Feedback", count: reviews.length },
              { value: "account", label: "Security & Ledger", count: null },
            ].map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-0 py-4 bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-slate-950 data-[state=active]:bg-transparent text-slate-400 data-[state=active]:text-slate-950 transition-all font-black text-[10px] uppercase tracking-[.2em] whitespace-nowrap"
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-3 h-5 px-2 rounded-full bg-slate-100 text-[10px] text-slate-400 group-data-[state=active]:bg-slate-950 group-data-[state=active]:text-white transition-colors">
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Asset Management Tab */}
          <TabsContent value="listings" className="mt-0 focus-visible:ring-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-950 tracking-tight">Managed Assets</h2>
                <p className="text-slate-500 font-medium">Curation and oversight of your rental inventory.</p>
              </div>
              <Link href="/post">
                <Button className="h-14 rounded-2xl px-8 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-950/20 hover:translate-y-[-2px] transition-all">
                  <Plus className="h-4 w-4 mr-3" /> Catalog New Asset
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-gray-900">My Listings ({listings.length})</h2>
              <Link href="/post">
                <Button size="sm" className="rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none shadow-md shadow-emerald-500/20">
                  <Plus className="h-4 w-4 mr-1" /> New Listing
                </Button>
              </Link>
            </div>

            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 glass-panel rounded-[3rem] border border-dashed border-slate-200 bg-white/20">
                <div className="h-24 w-24 rounded-[3rem] bg-slate-50 flex items-center justify-center mb-8 border border-white">
                  <Package className="h-10 w-10 text-slate-200" />
                </div>
                <h4 className="text-xl font-black text-slate-950 tracking-tight mb-2">Portfolio Empty</h4>
                <p className="text-slate-400 font-medium max-w-[280px] text-center text-sm mb-8">You have not registered any assets for rental circulation.</p>
                <Link href="/post">
                  <Button className="h-12 rounded-2xl px-10 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest">
                    <Plus className="h-4 w-4 mr-3" /> Initiate First Listing
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {listings.map((listing) => {
                  const price = Number(listing.price_monthly || listing.price_daily || listing.price_weekly || listing.price_full_day || 0);
                  const isPaused = listing.status === "paused";
                  const canShowPremiumBtn = isPaused && (listing.is_premium || availablePremiumSlots.length > 0);

                  return (
                    <div key={listing.id} className="glass-panel rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden group hover:border-emerald-200 transition-all duration-500 bg-white/40">
                      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-8">
                        <div className="relative shrink-0 overflow-hidden rounded-[2rem] w-full sm:w-28 h-40 sm:h-28 shadow-xl shadow-slate-200/50">
                          <img
                            src={listing.images?.[0] || "/images/placeholder.jpg"}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt=""
                          />
                          {listing.is_premium && (
                            <div className="absolute top-2 right-2">
                              <div className="h-7 w-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-white">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-black text-slate-950 tracking-tight leading-none mb-2">{listing.title}</h3>
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <MapPin className="h-3 w-3 text-emerald-500" />
                                <span>{listing.location}</span>
                              </div>
                            </div>
                            <Badge className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-none",
                              isPaused ? "bg-amber-500/10 text-amber-600 border-amber-200/50" : "bg-emerald-500/10 text-emerald-600 border-emerald-200/50"
                            )}>
                              {isPaused ? "Paused" : "Active"}
                            </Badge>
                          </div>
                          <p className="text-xl font-black text-slate-950">
                            Rs {price.toLocaleString()}
                            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-2">
                              {listing.price_monthly ? "Per Month" : listing.price_daily ? "Per Day" : "Per Week"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Administrative Action Bar */}
                      <div className="px-6 pb-6 pt-2 grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <Link href={`/listing/${listing.id}`}>
                          <button className="h-12 w-full rounded-2xl border border-slate-100 bg-white/50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-950 transition-all">
                            <Eye className="h-4 w-4" /> Preview
                          </button>
                        </Link>

                        <Link href={`/edit-listing/${listing.id}`}>
                          <button className="h-12 w-full rounded-2xl border border-slate-100 bg-white/50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-950 transition-all">
                            <Edit3 className="h-4 w-4" /> Refine
                          </button>
                        </Link>

                        <button
                          onClick={() => handleToggleStatus(listing)}
                          disabled={togglePending === listing.id}
                          className="h-12 w-full rounded-2xl border border-slate-100 bg-white/50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          {togglePending === listing.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          ) : isPaused ? (
                            <Play className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                          ) : (
                            <Pause className="h-4 w-4 text-slate-400" />
                          )}
                          <span className={cn(isPaused ? "text-emerald-500" : "text-slate-400")}>
                            {isPaused ? "Reactivate" : "Deactivate"}
                          </span>
                        </button>

                        {canShowPremiumBtn ? (
                          <button
                            onClick={() => handlePremiumToggle(listing)}
                            disabled={premiumPending === listing.id}
                            className="h-12 w-full rounded-2xl border border-slate-100 bg-white/50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                          >
                            {premiumPending === listing.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                            ) : (
                              <Star className={cn("h-4 w-4", listing.is_premium ? "text-slate-400" : "text-amber-500 fill-amber-500")} />
                            )}
                            <span className={cn(listing.is_premium ? "text-slate-400" : "text-amber-500")}>
                              {listing.is_premium ? "Downgrade" : "Elevate"}
                            </span>
                          </button>
                        ) : (
                          <div className="h-12 w-full rounded-2xl border border-slate-50 bg-slate-50/20 flex items-center justify-center opacity-40 grayscale">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Premium Locked</span>
                          </div>
                        )}

                        <button
                          onClick={() => setDeleteListingId(listing.id)}
                          className="h-12 w-full rounded-2xl bg-red-50/50 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all col-span-2 sm:col-span-1"
                        >
                          <Trash2 className="h-4 w-4" /> Liquidation
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Member Feedback Tab */}
          <TabsContent value="reviews" className="mt-0 focus-visible:ring-0">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">Reputation Ledger</h2>
              <p className="text-slate-500 font-medium">Verified performance metrics and member feedback.</p>
            </div>

            {reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 glass-panel rounded-[3rem] border border-dashed border-slate-200 bg-white/20">
                <div className="h-24 w-24 rounded-[3rem] bg-slate-50 flex items-center justify-center mb-8 border border-white">
                  <Star className="h-10 w-10 text-slate-200" />
                </div>
                <h4 className="text-xl font-black text-slate-950 tracking-tight mb-2">History Vacant</h4>
                <p className="text-slate-400 font-medium max-w-[280px] text-center text-sm">Initiate rental protocols to start building your professional reputation.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.map((review: any) => (
                  <div key={review.id} className="glass-panel rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm bg-white/40">
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className="h-12 w-12 rounded-2xl ring-2 ring-white border border-slate-100">
                        <AvatarImage src={review.reviewer?.avatar_url || ""} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 text-xs font-black">
                          {review.reviewer?.full_name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-slate-950 tracking-tight">{review.reviewer?.full_name || "Anonymous Member"}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {review.comment && <p className="text-slate-600 text-sm leading-relaxed font-medium italic">"{review.comment}"</p>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Security & Ledger Tab */}
          <TabsContent value="account" className="mt-0 focus-visible:ring-0">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-950 tracking-tight">Access Control</h2>
              <p className="text-slate-500 font-medium">Manage your security credentials and profile metadata.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Account Info Card */}
              <div className="glass-panel rounded-[2.5rem] border border-slate-200/60 p-10 shadow-sm bg-white/40 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-950" />
                  <h3 className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Profile Metadata</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { label: "Formal Name", value: user?.full_name || "—", icon: User },
                    { label: "Primary Email", value: user?.email || "—", icon: MessageCircle },
                    { label: "Phone Protocol", value: user?.phone || "Disconnected", icon: Phone },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-6 group">
                      <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-slate-950 group-hover:text-white transition-all">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                        <p className="text-sm font-black text-slate-950">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={handleOpenEdit}
                  className="h-14 w-full rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-950 hover:bg-slate-50 mt-6"
                >
                  <Edit3 className="h-4 w-4 mr-3" /> Adjust Profile Info
                </Button>
              </div>

              {/* Navigation & Logout */}
              <div className="space-y-6">
                <div className="glass-panel rounded-[2.5rem] border border-slate-200/60 overflow-hidden bg-white/40">
                  {[
                    { label: "Curated Favorites", icon: Heart, color: "text-rose-500", bg: "bg-rose-50", href: "/favorites" },
                    { label: "Rental Ledger", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50", href: "/orders" },
                    { label: "System Settings", icon: Settings, color: "text-slate-500", bg: "bg-slate-100", href: "/settings" },
                  ].map((link, i) => (
                    <Link key={link.label} href={link.href}>
                      <div className={cn(
                        "flex items-center justify-between p-6 hover:bg-white transition-all cursor-pointer group",
                        i !== 2 && "border-b border-slate-100"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", link.bg, link.color)}>
                            <link.icon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-black text-slate-950 tracking-tight">{link.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-slate-950 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>

                <Button
                  variant="destructive"
                  className="w-full h-16 rounded-[2rem] font-black text-[10px] uppercase tracking-[.3em] bg-red-500 shadow-xl shadow-red-500/20 hover:bg-red-600 group"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <LogOut className="h-5 w-5 mr-3 group-hover:translate-x-1 transition-transform" />}
                  {loggingOut ? "Terminating..." : "Terminate Session"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />

      {/* Identity Update Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-slate-200/60 glass-panel p-10">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight">Identity Registry</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formal Designation</Label>
              <Input
                value={profileForm.full_name}
                onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                className="h-14 rounded-2xl bg-slate-50 border-slate-200 px-6 font-medium text-slate-950"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communications Link</Label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+92 XXX XXXXXXX"
                className="h-14 rounded-2xl bg-slate-50 border-slate-200 px-6 font-medium text-slate-950"
              />
            </div>
          </div>
          <DialogFooter className="mt-10 gap-4 sm:justify-start">
            <Button
              onClick={handleSaveProfile}
              disabled={editPending}
              className="h-14 rounded-2xl px-10 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest flex-1 shadow-xl shadow-slate-950/20"
            >
              {editPending ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : null}
              Validate Changes
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="h-14 rounded-2xl px-8 border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-400 flex-1">
              Abort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Liquidation Dialog */}
      <Dialog open={!!deleteListingId} onOpenChange={() => setDeleteListingId(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-slate-200/60 glass-panel p-10">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight text-red-600">Liquidation Protocol</DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 font-medium mb-8">This action will permanently withdraw the asset from all rental circulation. This protocol is irreversible.</p>
          <DialogFooter className="gap-4 sm:justify-start">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePending}
              className="h-14 rounded-2xl px-10 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest flex-1 shadow-xl shadow-red-500/20"
            >
              {deletePending ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : null}
              Confirm Liquidation
            </Button>
            <Button variant="outline" onClick={() => setDeleteListingId(null)} className="h-14 rounded-2xl px-8 border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-400 flex-1">
              Abort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

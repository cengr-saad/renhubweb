import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Clock, CheckCircle2, History, Check, X, Handshake, RotateCcw,
  Loader2, Package, Star, MapPin, ChevronRight, AlertCircle, Calendar, ArrowRightLeft, User
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "renter" | "owner";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending Review", color: "bg-amber-500/10 text-amber-600 border-amber-200/50", icon: Clock },
  ACCEPTED: { label: "Booking Secured", color: "bg-blue-500/10 text-blue-600 border-blue-200/50", icon: CheckCircle2 },
  HANDOVER_PENDING: { label: "Protocol Initiated", color: "bg-purple-500/10 text-purple-600 border-purple-200/50", icon: Handshake },
  LIVE: { label: "Active Rental", color: "bg-emerald-500/20 text-emerald-700 border-emerald-200/50", icon: Star },
  RETURN_PENDING: { label: "Return Protocol", color: "bg-orange-500/10 text-orange-600 border-orange-200/50", icon: RotateCcw },
  DISPUTED: { label: "Mediation Required", color: "bg-red-500/10 text-red-600 border-red-200/50", icon: AlertCircle },
  COMPLETED: { label: "Protocol Finalized", color: "bg-slate-100 text-slate-500 border-slate-200/50", icon: Check },
  CANCELLED: { label: "Cancelled", color: "bg-slate-50 text-slate-400 border-slate-200/50", icon: X },
  REJECTED: { label: "Declined", color: "bg-red-50 text-red-400 border-red-100/50", icon: X },
  WITHDRAWN: { label: "Withdrawn", color: "bg-slate-50 text-slate-400 border-slate-200/50", icon: X },
};

function OrderCard({ request, viewMode, onAction }: { request: any; viewMode: ViewMode; onAction: (id: string, action: string, reason?: string) => void }) {
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const statusCfg = STATUS_CONFIG[request.status] || { label: request.status, color: "bg-slate-100 text-slate-600", icon: AlertCircle };

  const handleAction = async (action: string, reason?: string) => {
    setActionPending(action);
    await onAction(request.id, action, reason);
    setActionPending(null);
  };

  const listing = request.listing;
  const partner = viewMode === "renter" ? request.owner : request.renter;

  return (
    <div className="glass-panel rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden group hover:border-emerald-200 transition-all duration-500 relative bg-white/40">

      <div className="p-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Asset Image */}
          <div className="relative shrink-0 overflow-hidden rounded-[2rem] w-full sm:w-32 h-48 sm:h-32 shadow-xl shadow-slate-200/50">
            <img
              src={listing?.images?.[0] || "/images/placeholder.jpg"}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-950 tracking-tight leading-none mb-2">{listing?.title || "Exclusive Possession"}</h3>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  <span>{listing?.location || "—"}</span>
                </div>
              </div>
              <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-none", statusCfg.color)}>
                <statusCfg.icon className="h-3 w-3 mr-2" />
                {statusCfg.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 rounded-full ring-2 ring-white border border-slate-100">
                  <AvatarImage src={partner?.avatar_url} />
                  <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-[10px]">
                    {partner?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{viewMode === "renter" ? "CURATOR" : "CLIENT"}</p>
                  <p className="text-xs font-black text-slate-950">{partner?.full_name || "Anonymous Member"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">TIMELINE</p>
                  <p className="text-xs font-black text-slate-950">
                    {request.start_date && request.end_date ? (
                      <>
                        {new Date(request.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        <span className="mx-2 text-slate-300">→</span>
                        {new Date(request.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </>
                    ) : "Undated Request"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 pb-8 flex flex-wrap gap-3">
        {viewMode === "owner" && request.status === "PENDING" && (
          <>
            <button
              onClick={() => handleAction("accept")}
              disabled={!!actionPending}
              className="flex-1 h-12 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[.2em] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {actionPending === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Authorize Booking
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              disabled={!!actionPending}
              className="px-6 h-12 rounded-2xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[.2em] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 border border-slate-100"
            >
              <X className="h-4 w-4" /> Decline
            </button>
          </>
        )}

        {viewMode === "owner" && request.status === "ACCEPTED" && (
          <button
            onClick={() => handleAction("confirm_handover")}
            disabled={!!actionPending}
            className="w-full h-12 rounded-2xl bg-slate-950 text-white font-black text-[10px] uppercase tracking-[.2em] shadow-xl flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all disabled:opacity-50"
          >
            {actionPending === "confirm_handover" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Handshake className="h-5 w-5" />}
            Initiate Asset Handover
          </button>
        )}

        {viewMode === "owner" && request.status === "RETURN_PENDING" && (
          <button
            onClick={() => handleAction("approve_return")}
            disabled={!!actionPending}
            className="w-full h-12 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[.2em] shadow-xl flex items-center justify-center gap-3 hover:translate-y-[-2px] transition-all disabled:opacity-50"
          >
            {actionPending === "approve_return" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            Finalize Return & Settlement
          </button>
        )}

        {viewMode === "renter" && request.status === "PENDING" && (
          <button
            onClick={() => handleAction("withdraw")}
            disabled={!!actionPending}
            className="w-full h-12 rounded-2xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[.2em] flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50 border border-slate-100"
          >
            {actionPending === "withdraw" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Withdraw Interest
          </button>
        )}

        {viewMode === "renter" && request.status === "LIVE" && (
          <button
            onClick={() => handleAction("request_return")}
            disabled={!!actionPending}
            className="w-full h-12 rounded-2xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-[.2em] shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {actionPending === "request_return" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            Request Return Protocol
          </button>
        )}

        {/* Details Link */}
        <Link href={`/order/${request.id}`} className="w-full">
          <button className="w-full h-12 rounded-2xl border border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[.2em] flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-slate-950 transition-all">
            Overview Protocol <ChevronRight className="h-4 w-4" />
          </button>
        </Link>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-slate-200/60 glass-panel p-10">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-950 tracking-tight">Decline Protocol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formal Reason</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State the reason for non-acceptance..."
              className="rounded-3xl bg-slate-50 border-slate-200 p-6 min-h-[120px] font-medium text-slate-950 resize-none"
            />
          </div>
          <DialogFooter className="mt-10 gap-4 sm:justify-start">
            <Button
              variant="destructive"
              onClick={() => { handleAction("reject", rejectReason); setRejectOpen(false); }}
              className="h-14 rounded-2xl px-10 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 flex-1"
            >
              Confirm Decline
            </Button>
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="h-14 rounded-2xl px-8 border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-400 flex-1">
              Abort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("renter");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchRequests();
  }, [user?.id, viewMode]);

  const fetchRequests = async () => {
    if (!supabase || !user?.id) return;
    setLoading(true);
    try {
      const field = viewMode === "renter" ? "renter_id" : "owner_id";
      const { data } = await supabase
        .from("rent_requests")
        .select(`
          *,
          listing:listing_id(id, title, images, location, price_daily, price_monthly, price_weekly),
          renter:renter_id(id, full_name, avatar_url),
          owner:owner_id(id, full_name, avatar_url)
        `)
        .eq(field, user.id)
        .order("created_at", { ascending: false });

      setRequests(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: string, reason?: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.rpc("handle_rent_request_action" as any, {
        p_request_id: requestId,
        p_action: action,
        p_user_id: user!.id,
        p_reason: reason || null,
      });
      if (error) throw error;
      toast({ title: "Protocol Executed", description: `Request ${action.replace("_", " ")} successfully.` });
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Protocol Failure", description: err.message, variant: "destructive" });
    }
  };

  const pending = requests.filter(r => ["PENDING", "ACCEPTED", "HANDOVER_PENDING"].includes(r.status));
  const live = requests.filter(r => ["LIVE", "RETURN_PENDING", "DISPUTED"].includes(r.status));
  const history = requests.filter(r => ["COMPLETED", "CANCELLED", "REJECTED", "WITHDRAWN"].includes(r.status));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Ledger & Logistics</span>
            </div>
            <h1 className="text-5xl font-black text-slate-950 tracking-tight leading-none mb-3">Orders</h1>
            <p className="text-slate-500 font-medium">Monitoring your rental ecosystem and asset throughput.</p>
          </div>

          <div className="flex p-1 bg-white/50 backdrop-blur-xl rounded-[1.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/50">
            <button
              onClick={() => setViewMode("renter")}
              className={cn(
                "px-8 h-12 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[.2em] transition-all flex items-center gap-3",
                viewMode === "renter" ? "bg-slate-950 text-white shadow-xl" : "text-slate-400 hover:text-slate-950"
              )}
            >
              <ArrowRightLeft className="h-3 w-3" /> As Client
            </button>
            <button
              onClick={() => setViewMode("owner")}
              className={cn(
                "px-8 h-12 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[.2em] transition-all flex items-center gap-3",
                viewMode === "owner" ? "bg-slate-950 text-white shadow-xl" : "text-slate-400 hover:text-slate-950"
              )}
            >
              <ArrowRightLeft className="h-3 w-3" /> As Curator
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center animate-pulse">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accessing Protocol Data...</p>
          </div>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 mb-12 gap-8 w-full justify-start border-b border-slate-100 rounded-none">
              {[
                { value: "pending", label: "Pending Requests", count: pending.length, icon: Clock },
                { value: "live", label: "Active Protocol", count: live.length, icon: Star },
                { value: "history", label: "Archive", count: history.length, icon: History },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="px-0 py-4 bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-slate-950 data-[state=active]:bg-transparent text-slate-400 data-[state=active]:text-slate-950 transition-all font-black"
                >
                  <div className="flex items-center gap-3 text-[10px] uppercase tracking-[.2em]">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    <span className="h-5 px-2 rounded-full bg-slate-50 text-[10px] text-slate-400 group-data-[state=active]:bg-slate-950 group-data-[state=active]:text-white transition-colors">
                      {tab.count}
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {[
              { key: "pending", items: pending, emptyIcon: Clock, emptySub: "No incoming rental protocols detected in the current queue." },
              { key: "live", items: live, emptyIcon: Star, emptySub: "No assets currently deployed in active circulation." },
              { key: "history", items: history, emptyIcon: History, emptySub: "Your operational archive is currently empty." },
            ].map(({ key, items, emptyIcon: EmptyIcon, emptySub }) => (
              <TabsContent key={key} value={key} className="mt-0 focus-visible:ring-0">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-40 glass-panel rounded-[3rem] border border-dashed border-slate-200 bg-white/20">
                    <div className="h-24 w-24 rounded-[3rem] bg-slate-50 flex items-center justify-center mb-8 border border-white">
                      <EmptyIcon className="h-10 w-10 text-slate-200" />
                    </div>
                    <h4 className="text-xl font-black text-slate-950 tracking-tight mb-2">Queue Vacant</h4>
                    <p className="text-slate-400 font-medium max-w-[280px] text-center text-sm">{emptySub}</p>
                    <Link href="/home">
                      <Button variant="outline" className="mt-8 h-12 rounded-2xl px-10 border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-950 hover:bg-slate-50">
                        Explore Catalog
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-10">
                    {items.map((req) => (
                      <OrderCard key={req.id} request={req} viewMode={viewMode} onAction={handleAction} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, X, ShieldCheck, Banknote, CreditCard, Repeat, CalendarDays, Loader2, Plus, Info, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
  { id: "house", label: "Houses" },
  { id: "apartment", label: "Apartments" },
  { id: "car", label: "Cars" },
  { id: "electronics", label: "Electronics" },
  { id: "office", label: "Offices" },
  { id: "others", label: "Others" },
];

interface FormData {
  title: string;
  category: string;
  location: string;
  description: string;
  securityDeposit: string;
  requirements: string;
  rules: string;
  prices: Record<string, string>;
  isRecurring: boolean;
  paymentMethods: string[];
}

export default function PostRentalPage() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    location: "",
    description: "",
    securityDeposit: "",
    requirements: "",
    rules: "",
    prices: {},
    isRecurring: false,
    paymentMethods: [],
  });

  const DURATIONS = [
    { id: "hourly", label: "Hourly", field: "price_hourly" },
    { id: "daily", label: "Daily", field: "price_daily" },
    { id: "weekly", label: "Weekly", field: "price_weekly" },
    { id: "monthly", label: "Monthly", field: "price_monthly" },
  ];

  const createListing = async (data: any) => {
    if (!supabase || !user?.id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("listings").insert(data);
      if (error) throw error;
      toast({ title: "Masterpiece Published!", description: "Your asset is now live in the elite market." });
      setLocation("/home");
    } catch (err: any) {
      toast({ title: "Submission Error", description: err.message || "Failed to curate listing.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImages(prev => [...prev, url]);
  };

  const toggleDuration = (id: string) => {
    setSelectedDurations(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const togglePaymentMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const listingData: any = {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: formData.location,
      images: images.length > 0 ? images : null,
      security_deposit: formData.securityDeposit ? Number(formData.securityDeposit) : null,
      requirements: formData.requirements || null,
      rules: formData.rules || null,
      is_recurring: formData.isRecurring,
      allowed_durations: selectedDurations,
      payment_methods: formData.paymentMethods.length > 0 ? formData.paymentMethods : null,
      status: "active",
      is_premium: false,
    };

    DURATIONS.forEach(d => {
      if (selectedDurations.includes(d.id) && formData.prices[d.id]) {
        listingData[d.field] = Number(formData.prices[d.id]);
      }
    });

    createListing(listingData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-24 pb-24">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[.3em] text-slate-400">Inventory Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight mb-2">Curate New Asset</h1>
          <p className="text-slate-500 font-medium">Introduce your premium possession to the elite community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* 📸 Photos Section */}
          <section className="glass-panel p-10 rounded-[3rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-950 flex items-center gap-3">
                <ImagePlus className="h-6 w-6 text-emerald-500" /> Elite Portfolio
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{images.length} / 10 Assets</span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              <label className="shrink-0 w-40 h-40 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all cursor-pointer bg-slate-50 group">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Enrich Gallery</span>
              </label>

              {images.map((img, i) => (
                <div key={i} className="relative shrink-0 w-40 h-40 rounded-[2rem] overflow-hidden shadow-xl border border-white/20 group">
                  <img src={img} alt="Upload" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-950/80 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">High-resolution imagery enhances asset perception.</p>
          </section>

          {/* 📅 Pricing Section */}
          <section className="glass-panel p-10 rounded-[3rem] border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <CalendarDays className="h-6 w-6 text-emerald-500" />
              <h3 className="text-xl font-black text-slate-950">Investment Structure</h3>
            </div>

            <div className="space-y-8">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400 mb-4 block">Preferred Rental Intervals</Label>
                <div className="flex flex-wrap gap-3">
                  {DURATIONS.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDuration(d.id)}
                      className={cn(
                        "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        selectedDurations.includes(d.id)
                          ? "bg-slate-950 text-white border-slate-950 shadow-xl"
                          : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                {selectedDurations.map(id => (
                  <div key={id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 animate-in slide-in-from-left-4 duration-500">
                    <Label className="font-black text-slate-950 text-sm">{DURATIONS.find(d => d.id === id)?.label} Valuation</Label>
                    <div className="relative flex-1 max-w-sm group">
                      <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl group-focus-within:bg-emerald-500/10 transition-colors" />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs</span>
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full h-14 bg-transparent border border-slate-200 rounded-2xl pl-12 pr-6 text-slate-950 font-black focus:border-emerald-500 focus:ring-0 transition-all text-sm"
                        value={formData.prices[id] || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          prices: { ...prev.prices, [id]: e.target.value }
                        }))}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {selectedDurations.some(d => ['weekly', 'monthly'].includes(d)) && (
                <div className="flex items-center justify-between p-6 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-500/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-5 w-5" />
                      <h4 className="font-black text-sm uppercase tracking-widest">Recurring Subscriptions</h4>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-100">Establish long-term predictable revenue streams.</p>
                  </div>
                  <Switch
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                    className="data-[state=checked]:bg-slate-950"
                  />
                </div>
              )}
            </div>
          </section>

          {/* 📝 Identity Section */}
          <section className="glass-panel p-10 rounded-[3rem] border border-slate-200/60 shadow-sm">
            <h3 className="text-xl font-black text-slate-950 mb-8">Asset Credentials</h3>
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Classification</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 border text-slate-950 font-black text-xs uppercase tracking-widest">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200">
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.id} value={c.id} className="font-black text-[10px] uppercase tracking-widest py-3 mb-1 rounded-xl">
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Geographic Location</Label>
                  <Input
                    placeholder="e.g. Defense, Karachi"
                    className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-slate-950 font-bold"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Market Title</Label>
                <Input
                  placeholder="e.g. Pro-series Cinema Rig or Executive Office Suite"
                  className="h-14 rounded-2xl bg-slate-50 border-slate-200 text-slate-950 font-black text-lg"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Operational Description</Label>
                <Textarea
                  placeholder="Detailed specifications, maintenance history, and elite features..."
                  className="bg-slate-50 border-slate-200 rounded-[2rem] min-h-[160px] text-slate-950 font-medium p-6"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
            </div>
          </section>

          {/* 🛡 Security & Policy */}
          <section className="glass-panel p-10 rounded-[3rem] border border-slate-200/60 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-500" /> Terms & Protocol
                </h3>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Renter Requirements</Label>
                  <Textarea
                    placeholder="e.g. Verified Professional Profile required..."
                    className="bg-slate-50 border-slate-200 rounded-2xl min-h-[100px] text-sm font-medium"
                    value={formData.requirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Custom Protocol</Label>
                  <Textarea
                    placeholder="e.g. Handover protocol, usage boundaries..."
                    className="bg-slate-50 border-slate-200 rounded-2xl min-h-[100px] text-sm font-medium"
                    value={formData.rules}
                    onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-950 flex items-center gap-3">
                  <Banknote className="h-6 w-6 text-emerald-500" /> Assurance
                </h3>
                <div>
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Security Deposit (Rs)</Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl group-focus-within:bg-emerald-500/10 transition-colors" />
                    <Input
                      type="number"
                      placeholder="50,000"
                      className="h-16 rounded-2xl bg-transparent border-slate-200 text-slate-950 font-black text-xl pl-6"
                      value={formData.securityDeposit}
                      onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                    />
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Held securely until asset restoration.</p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Settlement Channels</Label>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="p-cash"
                        checked={formData.paymentMethods.includes("cash")}
                        onCheckedChange={() => togglePaymentMethod("cash")}
                        className="rounded-lg h-6 w-6 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-transparent"
                      />
                      <Label htmlFor="p-cash" className="font-black text-xs uppercase tracking-widest text-slate-950">Direct Cash</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="p-bank"
                        checked={formData.paymentMethods.includes("bank")}
                        onCheckedChange={() => togglePaymentMethod("bank")}
                        className="rounded-lg h-6 w-6 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-transparent"
                      />
                      <Label htmlFor="p-bank" className="font-black text-xs uppercase tracking-widest text-slate-950">Bank Transfer</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="btn-premium w-full h-20 rounded-[2.5rem] font-black text-sm uppercase tracking-[.3em] shadow-2xl shadow-emerald-500/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {submitting ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" /> Finalizing Masterpiece...
              </span>
            ) : (
              "Submit Listing for Verification"
            )}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

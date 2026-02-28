import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

const CATEGORIES = [
  { id: "electronics", label: "Electronics" },
  { id: "vehicles", label: "Vehicles" },
  { id: "tools", label: "Tools" },
  { id: "furniture", label: "Furniture" },
  { id: "sports", label: "Sports" },
  { id: "cameras", label: "Cameras" },
  { id: "clothing", label: "Clothing" },
  { id: "other", label: "Other" },
];

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    images: [] as string[],
    price_half_day: "",
    price_full_day: "",
    price_daily: "",
    price_weekly: "",
    price_monthly: "",
    security_deposit: "",
    is_recurring: false,
    payment_methods: [] as string[],
    requirements: "",
  });

  useEffect(() => {
    if (!id || !supabase) return;
    setIsLoading(true);
    supabase.from("listings").select("*").eq("id", id).single().then(({ data: listing }) => {
      if (listing) {
        setForm({
          title: listing.title || "",
          description: listing.description || "",
          category: listing.category || "",
          location: listing.location || "",
          images: listing.images || [],
          price_half_day: listing.price_half_day || "",
          price_full_day: listing.price_full_day || "",
          price_daily: listing.price_daily || "",
          price_weekly: listing.price_weekly || "",
          price_monthly: listing.price_monthly || "",
          security_deposit: listing.security_deposit || "",
          is_recurring: listing.is_recurring || false,
          payment_methods: listing.payment_methods || [],
          requirements: listing.requirements || "",
        });
      }
      setIsLoading(false);
    });
  }, [id]);

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.location) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    if (!supabase || !id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("listings").update({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        images: form.images,
        price_half_day: form.price_half_day || null,
        price_full_day: form.price_full_day || null,
        price_daily: form.price_daily || null,
        price_weekly: form.price_weekly || null,
        price_monthly: form.price_monthly || null,
        security_deposit: form.security_deposit || null,
        is_recurring: form.is_recurring,
        payment_methods: form.payment_methods,
        requirements: form.requirements,
      }).eq("id", id);
      if (error) throw error;
      toast({ title: "Listing updated successfully" });
      navigate("/profile");
    } catch (err: any) {
      toast({ title: "Failed to update listing", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePaymentMethod = (method: string) => {
    setForm(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Edit Listing</h1>
          <p className="text-gray-400 text-sm">Update your listing details</p>
        </div>
        <main className="space-y-6">
          <section className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What are you renting?"
              className="h-11 rounded-xl"
            />
          </section>

          <section className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Category *</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, category: cat.id }))}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${form.category === cat.id
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Location *</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Area"
              className="h-11 rounded-xl"
            />
          </section>

          <section className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your rental..."
              className="min-h-[100px] rounded-xl resize-none"
            />
          </section>

          <section className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Pricing</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Half Day (3-12hrs)</Label>
                <Input type="number" value={form.price_half_day} onChange={(e) => setForm(prev => ({ ...prev, price_half_day: e.target.value }))} placeholder="Rs 0" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Full Day (12-24hrs)</Label>
                <Input type="number" value={form.price_full_day} onChange={(e) => setForm(prev => ({ ...prev, price_full_day: e.target.value }))} placeholder="Rs 0" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Daily (2-7 days)</Label>
                <Input type="number" value={form.price_daily} onChange={(e) => setForm(prev => ({ ...prev, price_daily: e.target.value }))} placeholder="Rs 0" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Weekly (7-27 days)</Label>
                <Input type="number" value={form.price_weekly} onChange={(e) => setForm(prev => ({ ...prev, price_weekly: e.target.value }))} placeholder="Rs 0" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Monthly (28+ days)</Label>
                <Input type="number" value={form.price_monthly} onChange={(e) => setForm(prev => ({ ...prev, price_monthly: e.target.value }))} placeholder="Rs 0" className="h-10 rounded-lg" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Security Deposit</Label>
                <Input type="number" value={form.security_deposit} onChange={(e) => setForm(prev => ({ ...prev, security_deposit: e.target.value }))} placeholder="Rs 0" className="h-10 rounded-lg" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Payment Methods</Label>
            <div className="flex gap-3">
              {["cash", "bank"].map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => togglePaymentMethod(method)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${form.payment_methods.includes(method)
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {method === "cash" ? "Cash" : "Bank Transfer"}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl border border-teal-100">
              <div>
                <Label className="font-bold text-teal-700">Enable Recurring</Label>
                <p className="text-xs text-teal-600">Allow automatic renewal for long-term rentals</p>
              </div>
              <Checkbox
                checked={form.is_recurring}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_recurring: !!checked }))}
                disabled={!form.price_daily && !form.price_weekly && !form.price_monthly}
                className="border-teal-500 data-[state=checked]:bg-teal-500"
              />
            </div>
            {(!form.priceDaily && !form.priceWeekly && !form.priceMonthly) && form.isRecurring && (
              <p className="text-xs text-amber-600">Recurring is only available for daily, weekly, or monthly durations.</p>
            )}
          </section>

          <section className="space-y-3">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Requirements</Label>
            <Textarea
              value={form.requirements}
              onChange={(e) => setForm(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder="e.g., Valid ID required, minimum age 21+"
              className="min-h-[80px] rounded-xl resize-none"
            />
          </section>
        </main>

        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none"
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

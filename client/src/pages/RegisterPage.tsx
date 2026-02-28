import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      toast({ title: "Account created! Welcome to RentEase 🎉" });
      setLocation("/home");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-base">R</span>
              </div>
              <span className="font-black text-2xl">RentEase</span>
            </div>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-black mb-4 leading-tight">
            Join thousands of people<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              renting smarter
            </span>
          </h2>
          <p className="text-slate-300 text-lg mb-10">
            Create your free account and start renting or earning today.
          </p>
          <div className="space-y-4">
            {[
              "Free account — no credit card required",
              "List your first item in minutes",
              "Earn from things you already own",
              "Rent anything at a fraction of the cost",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-slate-500 text-sm">
          © 2026 RentEase. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/">
              <div className="inline-flex items-center gap-2 cursor-pointer">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-base">R</span>
                </div>
                <span className="font-black text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RentEase</span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/80 p-8 border border-gray-100">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-500">Join RentEase — it's completely free to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Full Name</Label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 text-sm"
                  required
                  data-testid="input-full-name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 text-sm"
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 text-sm pr-12"
                    required
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Confirm Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 text-sm"
                  required
                  data-testid="input-confirm-password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-none shadow-lg shadow-emerald-500/20 text-base"
                data-testid="button-register"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account...</>
                ) : (
                  <>Create Free Account <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    Sign in
                  </span>
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

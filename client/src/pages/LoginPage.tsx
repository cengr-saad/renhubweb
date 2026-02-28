import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, ArrowRight, Star, Shield, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      setLocation("/home");
    } catch (err: any) {
      toast({ title: "Sign in failed", description: err.message, variant: "destructive" });
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
            Welcome back to<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Pakistan's #1 Rental Platform
            </span>
          </h2>
          <p className="text-slate-300 text-lg mb-10">
            Access your listings, manage orders, and connect with renters.
          </p>
          <div className="space-y-4">
            {[
              { icon: Star, text: "Manage your premium listings" },
              { icon: Shield, text: "Secure payment handling" },
              { icon: Zap, text: "Real-time order updates" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-slate-300 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-slate-500 text-sm">
          © 2026 RentEase. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
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
              <h1 className="text-3xl font-black text-gray-900 mb-2">Sign In</h1>
              <p className="text-gray-500">Welcome back! Enter your credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-700">Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm"
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
                    placeholder="Enter your password"
                    className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm pr-12"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-none shadow-lg shadow-emerald-500/20 text-base"
                data-testid="button-signin"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{" "}
                <Link href="/register">
                  <span className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    Create one free
                  </span>
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

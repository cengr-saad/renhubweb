import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Eye, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function SettingsPage() {
  const { user, updateProfile, signOut } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [saving, setSaving] = useState(false);
  const [isPhonePublic, setIsPhonePublic] = useState(user?.is_phone_public ?? false);

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      await updateProfile({ is_phone_public: isPhonePublic });
      toast({ title: "Settings saved" });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-400 text-sm">Manage your account preferences</p>
        </div>

        <div className="space-y-5">
          {/* Account Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-emerald-500" />
              <h2 className="font-black text-gray-900">Account</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold text-gray-900">{user?.email || "—"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500">Account Status</span>
                <span className={`font-bold ${user?.is_verified ? "text-emerald-600" : "text-amber-600"}`}>
                  {user?.is_verified ? "✓ Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-blue-500" />
              <h2 className="font-black text-gray-900">Privacy</h2>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Show Phone Number</p>
                <p className="text-xs text-gray-400 mt-0.5">Allow renters to see your phone number on listings</p>
              </div>
              <Switch checked={isPhonePublic} onCheckedChange={setIsPhonePublic} />
            </div>
            <Button
              onClick={handleSavePrivacy}
              disabled={saving}
              className="w-full mt-4 h-11 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Settings
            </Button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
            <h2 className="font-black text-red-600 mb-4">Danger Zone</h2>
            <Button variant="destructive" className="w-full h-11 rounded-xl font-bold" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

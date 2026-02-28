import { Link } from "wouter";
import { Smartphone, Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnderDevelopmentPage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <Construction className="h-10 w-10 text-emerald-600" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                    Web App Under Development
                </h1>

                <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                    The LeasORent web experience is currently being built. To start renting items, properties, or cars right now, please use our mobile app.
                </p>

                <div className="space-y-4">
                    <Button
                        className="w-full h-14 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                        onClick={() => alert("App coming soon to Google Play & App Store!")}
                    >
                        <Smartphone className="h-5 w-5 mr-2" />
                        Download Mobile App
                    </Button>

                    <Link href="/">
                        <Button variant="ghost" className="w-full h-14 rounded-2xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Landing Page
                        </Button>
                    </Link>
                </div>

                <div className="mt-12 flex justify-center gap-6">
                    <Link href="/terms"><span className="text-xs font-bold text-gray-400 hover:text-emerald-600 cursor-pointer uppercase tracking-widest transition-colors">Terms</span></Link>
                    <Link href="/privacy"><span className="text-xs font-bold text-gray-400 hover:text-emerald-600 cursor-pointer uppercase tracking-widest transition-colors">Privacy</span></Link>
                </div>
            </div>
        </div>
    );
}

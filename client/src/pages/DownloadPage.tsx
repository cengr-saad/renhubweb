import { Link } from "wouter";
import { Smartphone, Download, Apple, PlayCircle, ArrowLeft, Shield, Zap, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

export default function DownloadPage() {
    return (
        <div className="min-h-screen bg-slate-950 font-sans selection:bg-emerald-500/30">
            <Navbar />

            {/* ── HERO SECTION ── */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black tracking-widest text-[10px] mb-6 px-4 py-1.5 uppercase">Mobile Access</Badge>
                            <h1 className="text-5xl sm:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.95]">
                                Excellence in <br />
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent italic font-serif font-normal">your pocket.</span>
                            </h1>
                            <p className="text-slate-400 text-lg sm:text-xl mb-12 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                                Join the elite circle of owners and renters. Experience peer-to-peer marketplace with our native mobile application.
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 lg:gap-10 justify-center lg:justify-start">
                                {/* Direct APK Download */}
                                <a
                                    href="/apk/leasorent.apk"
                                    download
                                    className="group relative bg-emerald-500 text-white h-24 w-full sm:w-[240px] px-8 rounded-2xl font-black flex items-center gap-5 hover:scale-105 transition-all duration-300 shadow-2xl overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="bg-white/20 p-2 rounded-xl transition-transform group-hover:rotate-12">
                                        <Download className="h-7 w-7 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-widest text-emerald-100 font-bold mb-1">Direct Download</p>
                                        <p className="text-xl leading-none">Android APK</p>
                                    </div>
                                </a>

                                {/* Google Play */}
                                <div className="relative group w-full sm:w-[240px]">
                                    <div className="bg-white/5 border border-white/10 h-24 px-8 rounded-2xl flex items-center gap-5 opacity-70 cursor-not-allowed">
                                        <div className="bg-white/5 p-2 rounded-xl">
                                            <PlayCircle className="h-7 w-7 text-slate-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Get it on</p>
                                            <p className="text-xl leading-none text-slate-300">Google Play</p>
                                        </div>
                                    </div>
                                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-[10px] font-black text-white px-3 py-1 rounded-full shadow-lg animate-bounce duration-1000">
                                        COMING SOON 2026
                                    </div>
                                </div>

                                {/* iOS */}
                                <div className="relative group w-full sm:w-[240px]">
                                    <div className="bg-white/5 border border-white/10 h-24 px-8 rounded-2xl flex items-center gap-5 opacity-70 cursor-not-allowed">
                                        <div className="bg-white/5 p-2 rounded-xl">
                                            <Apple className="h-7 w-7 text-slate-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Get it on</p>
                                            <p className="text-xl leading-none text-slate-300">App Store</p>
                                        </div>
                                    </div>
                                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-[10px] font-black text-white px-3 py-1 rounded-full shadow-lg animate-bounce duration-1000">
                                        COMING SOON 2026
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative lg:block flex justify-center">
                            <div className="relative z-10 max-w-[500px] w-full group">
                                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <img
                                    src="/images/premium/download_showcase.png"
                                    alt="LeasoRent Mobile App"
                                    className="relative rounded-[3rem] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── APP FEATURES RECAP ── */}
            <section className="py-24 bg-white/5 backdrop-blur-sm border-y border-white/10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center lg:text-left">
                        {[
                            { title: "Secure P2P", icon: Shield, desc: "Direct connections with community members through our encrypted platform." },
                            { title: "Real-time Chat", icon: Smartphone, desc: "Message owners and renters instantly to coordinate handovers and returns." },
                            { title: "Elite Assets", icon: Star, desc: "Access most curated collection of rentals in a single native app." }
                        ].map((feature, i) => (
                            <div key={i} className="flex flex-col lg:flex-row gap-6 items-center lg:items-start group">
                                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:border-emerald-500/30 transition-all duration-500">
                                    <feature.icon className="h-7 w-7 text-emerald-400 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center lg:text-left">
                                    <h4 className="text-xl font-black text-white mb-3 tracking-tight">{feature.title}</h4>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── APP GALLERY SECTION ── */}
            <section className="py-32 bg-slate-950 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16 text-center lg:text-left">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 font-black tracking-widest text-[10px] mb-6 px-4 py-1.5 uppercase">App Discovery</Badge>
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 tracking-tighter">Inside the <br /><span className="text-emerald-500 italic font-serif font-normal">LeasORent Experience.</span></h2>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">A visual journey through sophisticated utility sharing application. From discovery to handover, everything is optimized for excellence.</p>
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />

                    <div className="flex overflow-x-auto gap-8 px-6 lg:px-8 pb-12 hide-scrollbar snap-x">
                        {[
                            { img: "/assets/app-gallery/home.jpg", label: "Dashboard" },
                            { img: "/assets/app-gallery/categories.jpg", label: "Discovery" },
                            { img: "/assets/app-gallery/search.jpg", label: "Smart Search" },
                            { img: "/assets/app-gallery/near-you.jpg", label: "Proximity" },
                            { img: "/assets/app-gallery/map-search.jpg", label: "Global Map" },
                            { img: "/assets/app-gallery/listing.jpg", label: "The Catalog" },
                            { img: "/assets/app-gallery/chat.jpg", label: "Secure Protocol" },
                            { img: "/assets/app-gallery/profile.jpg", label: "Account" },
                            { img: "/assets/app-gallery/featured.jpg", label: "Elite Access" }
                        ].map((screen, i) => (
                            <div key={i} className="flex-shrink-0 snap-center">
                                <div className="group/screen relative">
                                    {/* Mobile Frame */}
                                    <div className="w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-[10px] border-slate-900 shadow-2xl relative overflow-hidden transition-transform duration-500 hover:scale-[1.03] group-hover/screen:shadow-emerald-500/10 mb-6">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-900 rounded-b-xl z-20 flex items-center justify-center">
                                            <div className="w-5 h-0.5 bg-slate-800/50 rounded-full" />
                                        </div>

                                        <img
                                            src={screen.img}
                                            alt={screen.label}
                                            className="w-full h-full object-cover object-top"
                                        />

                                        {/* Glass Overlay on Hover */}
                                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/screen:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full transform translate-y-4 group-hover/screen:translate-y-0 transition-transform">
                                                <span className="text-white font-black text-[10px] uppercase tracking-widest">{screen.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover/screen:opacity-100 transition-opacity">{screen.label}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── RETURN TO HOME ── */}
            <div className="py-20 text-center">
                <Link href="/">
                    <button className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-400 font-black text-xs uppercase tracking-widest transition-colors group">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>
                </Link>
            </div>

            <Footer />
        </div>
    );
}

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import {
    Search, MapPin, ArrowRight, Star, Shield, Zap, Users,
    Package, CheckCircle, Smartphone, ChevronDown,
    HandshakeIcon, TrendingUp, Lock, MessageCircle, ArrowUpRight,
    Bug, Globe, Video, Milestone, Rocket, Camera
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CATEGORIES = [
    { id: "house", label: "Luxury Houses", image: "/images/premium/cat_house.png", accent: "#064e3b" },
    { id: "apartment", label: "Apartments", image: "/images/premium/cat_apartment.png", accent: "#064e3b" },
    { id: "car", label: "Premium Cars", image: "/images/premium/cat_car.png", accent: "#064e3b" },
    { id: "electronics", label: "Pro Electronics", image: "/images/premium/cat_electronics.png", accent: "#064e3b" },
    { id: "office", label: "Office Spaces", image: "/images/premium/cat_office.png", accent: "#064e3b" },
    { id: "room", label: "Cozy Rooms", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400", accent: "#064e3b" },
    { id: "bike", label: "Bikes & Scooters", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400", accent: "#064e3b" },
    { id: "transport_vehicle", label: "Transport", image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=400", accent: "#064e3b" },
    { id: "shop", label: "Commercial", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400", accent: "#064e3b" },
    { id: "storage", label: "Warehouses", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400", accent: "#064e3b" },
    { id: "land", label: "Lush Land", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400", accent: "#064e3b" },
    { id: "others", label: "More", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400", accent: "#064e3b" },
];

const TESTIMONIALS = []; // Hidden as requested

export default function LandingPage() {
    const [stats, setStats] = useState({ listings: 0, users: 0 });
    const [, setLocation] = useLocation();
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        if (!supabase) return;
        try {
            const [{ count: listingCount }, { count: userCount }] = await Promise.all([
                supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
                supabase.from("users").select("*", { count: "exact", head: true }),
            ]);
            setStats({ listings: listingCount || 0, users: userCount || 0 });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const scrollDown = () => {
        window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary/10">
            <Navbar />

            {/* ── HERO ── */}
            <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden bg-slate-950 pt-16">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/premium/hero.png"
                        alt="Premium Interior"
                        className="w-full h-full object-cover opacity-60 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                </div>

                <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 mb-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-full pl-2 pr-5 py-1.5 hover:bg-white/10 transition-colors cursor-default group mx-auto lg:mx-0">
                                <Badge className="bg-emerald-500 text-white border-none px-3 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full">
                                    Official
                                </Badge>
                                <span className="text-sm font-bold text-emerald-100 group-hover:text-white transition-colors">
                                    Peer-to-Peer Rental Network
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.95] text-white">
                                Access the <br />
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent italic font-serif font-normal">Extraordinary.</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-slate-300 mb-12 leading-relaxed max-w-xl font-medium mx-auto lg:mx-0">
                                LeasORent connects you directly with owners of premium assets. From luxury villas to elite gear — seamless, safe, and sophisticated.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                                <Link href="/download">
                                    <button className="btn-premium h-16 px-10 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 group cursor-pointer w-full sm:w-auto">
                                        <Smartphone className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        <span>Download Mobile App</span>
                                    </button>
                                </Link>
                                <button
                                    onClick={() => scrollDown()}
                                    className="h-16 px-10 rounded-2xl text-white font-black bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                >
                                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                                    Learn More
                                </button>
                            </div>

                            <div className="mt-16 flex flex-wrap justify-center lg:justify-start items-center gap-x-10 gap-y-6 pt-10 border-t border-white/5">
                                {[
                                    { icon: Shield, label: "Community Driven" },
                                    { icon: Zap, label: "Peer-to-Peer" },
                                    { icon: Lock, label: "Asset Marketplace" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <item.icon className="h-4 w-4 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="hidden lg:flex lg:col-span-5 justify-end">
                            <div className="relative group perspective-1000">
                                <div className="w-80 glass-panel p-1 border-white/30 rounded-[2.5rem] shadow-3xl overflow-hidden group-hover:rotate-y-12 group-hover:rotate-x-6 transition-transform duration-700 ease-out">
                                    <div className="bg-slate-950 rounded-[2.25rem] overflow-hidden p-6 relative">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="h-10 w-10 rounded-xl bg-premium-gradient flex items-center justify-center overflow-hidden">
                                                <img src="/assets/logo.png" alt="L" className="h-7 w-7 object-contain" />
                                            </div>
                                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 font-black tracking-widest text-[9px]">MOBILE ONLY</Badge>
                                        </div>

                                        <div className="space-y-6 mb-8 text-center pt-10 pb-10">
                                            {/* <Smartphone className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-bounce" /> */}
                                            <img src="/assets/favicon.png" alt="L" className="h-16 w-16 text-emerald-500 mx-auto mb-4 animate-bounce" />
                                            <p className="text-white font-black text-xl">The Full Experience<br />on Mobile</p>
                                            <p className="text-slate-400 text-sm">Download our app to browse, list, and manage rentals.</p>
                                        </div>

                                        <Link href="/download">
                                            <button className="w-full btn-premium py-4 text-xs tracking-widest uppercase shine-effect cursor-pointer">
                                                Get the Mobile App
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="absolute -top-12 -right-12 h-24 w-24 bg-emerald-500/20 rounded-full blur-2xl animate-float" />
                                <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-teal-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce cursor-pointer group" onClick={scrollDown}>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-emerald-400 transition-colors">Discover</span>
                    <div className="h-10 w-6 rounded-full border-2 border-slate-700 flex justify-center pt-2">
                        <div className="w-1 h-2 bg-emerald-500 rounded-full" />
                    </div>
                </div> */}
            </section>


            {/* ── CATEGORIES ── */}
            <section id="categories" className="py-32 bg-slate-950 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05),_transparent)] pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 mb-24">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <Badge className="bg-emerald-500 text-white border-none font-black tracking-widest text-[10px] mb-6">MOBILE PORTFOLIO</Badge>
                            <h2 className="text-5xl sm:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.95]">
                                Everything you need, <br />
                                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent italic font-serif font-normal">accessible on mobile.</span>
                            </h2>
                            <p className="text-slate-400 text-xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
                                Experience premier rental collection. A curated world of luxury and utility, optimized for your pocket.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                                    <Smartphone className="h-4 w-4 text-emerald-400" />
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Optimized for iOS</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                                    <Zap className="h-4 w-4 text-teal-400" />
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Instant Discovery</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <motion.div
                                animate={{ y: [0, -15, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="w-72 h-[500px] bg-slate-950 rounded-[3.5rem] border-[12px] border-slate-900 shadow-2xl relative overflow-hidden"
                            >
                                {/* Notch Area */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-slate-900 rounded-b-lg z-20 flex items-center justify-center">
                                    <div className="w-5 h-0.5 bg-slate-800/50 rounded-full" />
                                </div>

                                <div className="absolute inset-0 rounded-[2.2rem] overflow-hidden">
                                    <img
                                        src="/assets/home-2.jpg"
                                        alt="App Interface"
                                        className="w-full h-full object-cover object-top"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                                </div>
                                {/* <div className="absolute inset-0 p-6 pt-12 space-y-4">
                                    <div className="h-8 w-1/2 bg-white/10 rounded-lg animate-pulse" />
                                    <div className="grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="aspect-square bg-white/5 rounded-2xl border border-white/10" />
                                        ))}
                                    </div>
                                    <div className="h-24 w-full bg-emerald-500/10 rounded-2xl border border-emerald-500/20" />
                                    <div className="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse" />
                                </div> */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                            </motion.div>
                            <div className="absolute -z-10 -bottom-10 -right-10 h-64 w-64 bg-emerald-500/20 rounded-full blur-[100px]" />
                        </div>
                    </div>
                </div>

                <div className="relative space-y-8">
                    {/* First Row: Sliding Right */}
                    <div className="flex overflow-hidden">
                        <motion.div
                            animate={{ x: [0, -100 * CATEGORIES.length] }}
                            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                            className="flex gap-6 whitespace-nowrap"
                        >
                            {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((cat, i) => (
                                <motion.div
                                    key={`cat-1-${i}`}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="relative w-64 md:w-80 aspect-[16/10] rounded-[2rem] overflow-hidden group cursor-pointer flex-shrink-0"
                                >
                                    <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                    <div className="absolute inset-0 border border-white/5 rounded-[2rem]" />

                                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">Browse Mobile</p>
                                        <h3 className="text-white font-black text-xl tracking-tight leading-none group-hover:text-emerald-50 transition-colors">{cat.label}</h3>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Second Row: Sliding Left */}
                    <div className="flex overflow-hidden">
                        <motion.div
                            animate={{ x: [-100 * CATEGORIES.length, 0] }}
                            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                            className="flex gap-6 whitespace-nowrap"
                        >
                            {[...CATEGORIES.reverse(), ...CATEGORIES, ...CATEGORIES].map((cat, i) => (
                                <motion.div
                                    key={`cat-2-${i}`}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="relative w-64 md:w-80 aspect-[16/10] rounded-[2rem] overflow-hidden group cursor-pointer flex-shrink-0"
                                >
                                    <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                                    <div className="absolute inset-0 border border-white/5 rounded-[2rem]" />

                                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">Quick Access</p>
                                        <h3 className="text-white font-black text-xl tracking-tight leading-none group-hover:text-teal-50 transition-colors">{cat.label}</h3>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <Link href="/download">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 sm:px-10 py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all shadow-2xl"
                        >
                            <Smartphone className="h-4 w-4 text-emerald-400 group-hover:animate-bounce" />
                            Launch Discovery in App
                            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </motion.button>
                    </Link>
                </div>
            </section>

            {/* ── HOW IT WORKS: THE JOURNEY ── */}
            <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none font-black tracking-widest text-[10px] mb-4">THE RENTAL LIFECYCLE</Badge>
                        <h2 className="text-5xl sm:text-6xl font-black text-slate-950 mb-8 tracking-tighter">How excellence <br /><span className="text-emerald-600">is delivered.</span></h2>
                        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">From the first glance to the final return, we've engineered every touchpoint for absolute seamlessness.</p>
                    </div>

                    <div className="relative">
                        {/* Central Connector Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-500/50 via-slate-200 to-transparent hidden lg:block -translate-x-1/2" />

                        <div className="space-y-32 relative">
                            {/* Step 1: Discovery */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center relative"
                            >
                                <div className="hidden lg:flex absolute left-1/2 top-0 -translate-x-1/2 h-12 w-12 rounded-full bg-white border-2 border-emerald-500 items-center justify-center z-10 shadow-xl shadow-emerald-500/20">
                                    <span className="text-emerald-600 font-black text-xs">01</span>
                                </div>

                                <div className="relative group">
                                    <div className="absolute -inset-6 bg-emerald-500/5 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
                                        <img src="/images/premium/workflow_discovery.png" alt="Discover Elite Assets" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-950/80 to-transparent">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-white font-black text-[10px] uppercase tracking-widest">Digital Marketplace</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Floating UI Element */}
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-6 -right-6 h-24 w-24 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-4 hidden sm:flex flex-col items-center justify-center text-center"
                                    >
                                        <Search className="h-6 w-6 text-emerald-500 mb-2" />
                                        <span className="text-[8px] font-black uppercase text-slate-400">Smart Filter</span>
                                    </motion.div>
                                </div>

                                <div className="lg:pl-12">
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-6">Discovery Phase</Badge>
                                    <h3 className="text-4xl sm:text-5xl font-black text-slate-950 mb-8 tracking-tighter leading-[0.9]">Explore <br /><span className="text-emerald-600">Extraordinary</span> Assets.</h3>
                                    <div className="space-y-8">
                                        <div className="flex gap-6 group">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-300">
                                                <Smartphone className="h-6 w-6 text-emerald-600 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-950 mb-1 uppercase text-xs tracking-widest">Infinite Selection</h4>
                                                <p className="font-medium text-slate-500 text-base leading-relaxed">Browse high-fidelity listings across World. From luxury escapes to elite tech — all in one unified mobile platform.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 group">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all duration-300">
                                                <Users className="h-6 w-6 text-emerald-600 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-950 mb-1 uppercase text-xs tracking-widest">Owner Engagement</h4>
                                                <p className="font-medium text-slate-500 text-base leading-relaxed">Send personalized rental requests directly. Our app handles the protocol, ensuring your inquiry stands out.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Step 2: Handover */}
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center relative"
                            >
                                <div className="hidden lg:flex absolute left-1/2 top-0 -translate-x-1/2 h-12 w-12 rounded-full bg-white border-2 border-emerald-500 items-center justify-center z-10 shadow-xl shadow-emerald-500/20">
                                    <span className="text-emerald-600 font-black text-xs">02</span>
                                </div>

                                <div className="lg:order-2 relative group">
                                    <div className="absolute -inset-6 bg-teal-500/5 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
                                        <img src="/images/premium/workflow_handover.png" alt="Secure Interface" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/20 via-transparent to-transparent" />
                                    </div>
                                    <motion.div
                                        animate={{ x: [0, 10, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -bottom-6 -left-6 bg-slate-950 text-white p-6 rounded-3xl shadow-2xl border border-white/10 hidden sm:block max-w-[180px]"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="h-4 w-4 text-emerald-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Security Protocol</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight">Digital confirmation ensures both parties are protected.</p>
                                    </motion.div>
                                </div>

                                <div className="lg:text-right lg:pr-12">
                                    <Badge className="bg-teal-50 text-teal-600 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-6">Execution Phase</Badge>
                                    <h3 className="text-4xl sm:text-5xl font-black text-slate-950 mb-8 tracking-tighter leading-[0.9]">Seamless <br /><span className="text-teal-600">Physical</span> Connect.</h3>
                                    <div className="space-y-8">
                                        <div className="flex flex-row-reverse lg:flex-row gap-6 group">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:border-teal-500 transition-all duration-300">
                                                <MessageCircle className="h-6 w-6 text-teal-600 group-hover:text-white" />
                                            </div>
                                            <div className="text-right">
                                                <h4 className="font-black text-slate-950 mb-1 uppercase text-xs tracking-widest">Direct Communication</h4>
                                                <p className="font-medium text-slate-500 text-base leading-relaxed">Coordinate timing and high-precision locations directly via secure chat. Peership at its finest.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row-reverse lg:flex-row gap-6 group">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:border-teal-600 transition-all duration-300">
                                                <HandshakeIcon className="h-6 w-6 text-teal-600 group-hover:text-white" />
                                            </div>
                                            <div className="text-right">
                                                <h4 className="font-black text-slate-950 mb-1 uppercase text-xs tracking-widest">The Handover</h4>
                                                <p className="font-medium text-slate-500 text-base leading-relaxed">Fast, efficient, and documented. Confirm the exchange in-app to trigger the countdown.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Step 3: Completion */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center relative"
                            >
                                <div className="hidden lg:flex absolute left-1/2 top-0 -translate-x-1/2 h-12 w-12 rounded-full bg-slate-950 border-2 border-emerald-500 items-center justify-center z-10 shadow-2xl shadow-emerald-500/40">
                                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                                </div>

                                <div className="relative group">
                                    <div className="absolute -inset-10 bg-emerald-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                    <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
                                        <img src="/images/premium/workflow_return.png" alt="Return Success" className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-12">
                                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4">
                                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                                <span className="text-white font-black uppercase tracking-widest text-[10px]">Elite Rating</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:pl-12">
                                    <Badge className="bg-slate-900 text-white border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-6">Post-Rental Phase</Badge>
                                    <h3 className="text-4xl sm:text-5xl font-black text-slate-950 mb-8 tracking-tighter leading-[0.9]">Completion & <br /><span className="text-emerald-600 italic font-serif font-normal">Peer Reviews.</span></h3>
                                    <div className="space-y-8">
                                        <div className="flex gap-6 group">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-950 group-hover:border-slate-950 transition-all duration-300">
                                                <ArrowRight className="h-6 w-6 text-slate-900 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-950 mb-1 uppercase text-xs tracking-widest">The Return</h4>
                                                <p className="font-medium text-slate-500 text-base leading-relaxed">Return the asset as seamlessly as you received it. Double-documented completion keeps the marketplace healthy.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 group">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-300">
                                                <Zap className="h-6 w-6 text-emerald-500 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-950 mb-1 uppercase text-xs tracking-widest">Share the Experience</h4>
                                                <p className="font-medium text-slate-500 text-base leading-relaxed">Review your peer. Every star contributes to the trust-map that defines elite shared economy.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none font-black tracking-widest text-[10px] mb-4">POWERFUL CAPABILITIES</Badge>
                        <h2 className="text-4xl sm:text-5xl font-black text-slate-950 mb-6 tracking-tighter">Everything you need to <br /><span className="text-emerald-600">manage like a pro.</span></h2>
                        <p className="text-slate-500 text-lg font-medium">Built for speed, convenience, and absolute control. Experience the features that make our mobile app elite.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        {/* Large Card: Smart Rental Manager */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-4 h-[400px] group relative rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl"
                        >
                            <img
                                src="/images/premium/feature_manager.png"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/20 to-transparent" />
                            <div className="absolute inset-0 p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <Badge className="bg-emerald-500 text-white border-none mb-3 sm:mb-4">MEMBER TOOLS</Badge>
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3 tracking-tighter">Smart Rental Manager</h3>
                                    <p className="text-slate-300 font-medium max-w-md text-xs sm:text-sm leading-relaxed">A professional dashboard engineered to track earnings, coordinate handovers, and manage returns in real-time.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Side Card: Map */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-2 h-[400px] group relative rounded-[3rem] overflow-hidden bg-slate-950 shadow-2xl"
                        >
                            <img
                                src="/images/premium/feature_map.png"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 to-transparent" />
                            <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 sm:mb-6">
                                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">Global Map Search</h3>
                                <p className="text-emerald-100/60 text-xs sm:text-sm font-medium">Visualize every elite listing in your vicinity with high-precision geolocation.</p>
                            </div>
                        </motion.div>

                        {/* Search Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="md:col-span-2 h-[400px] group relative rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/5"
                        >
                            <img
                                src="/images/premium/feature_search.png"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                            <div className="absolute inset-0 p-8 sm:p-10 flex flex-col items-center justify-center text-center">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-4 mb-6 sm:mb-8 backdrop-blur-md group-hover:border-emerald-500/50 transition-colors shadow-2xl shadow-black/40"
                                >
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <Search className="h-4 w-4 text-emerald-400" />
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ x: ["-100%", "100%"] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3 tracking-tighter">Optimized Search</h3>
                                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">Advanced discovery tailored to your elite preferences.</p>
                            </div>
                        </motion.div>

                        {/* Proximity Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="md:col-span-4 h-[400px] group relative rounded-[3rem] overflow-hidden bg-premium-gradient shadow-2xl"
                        >
                            <img
                                src="/images/premium/feature_proximity.png"
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-105 transition-transform duration-[2s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-transparent" />
                            <div className="absolute inset-0 p-8 sm:p-10 lg:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl sm:text-2xl font-black text-white mb-2 sm:mb-3 leading-tight">Near You <br />Sorting</h3>
                                    <p className="text-emerald-50/70 text-xs sm:text-sm font-medium leading-relaxed max-w-md">Connect with elite members in your neighbourhood. Zero friction, absolute trust.</p>
                                </div>
                                <motion.div
                                    whileHover={{ rotate: -5, scale: 1.05 }}
                                    className="h-32 w-32 sm:h-48 sm:w-48 rounded-[2rem] sm:rounded-[3rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex flex-col items-center justify-center shadow-2xl shadow-black/20"
                                >
                                    <div className="relative">
                                        <Zap className="h-16 w-16 text-white mb-2 animate-pulse" />
                                        <div className="absolute inset-0 blur-xl bg-white/30 animate-pulse" />
                                    </div>
                                    <span className="text-[10px] font-black text-white/50 tracking-[0.3em] uppercase mt-2">Hyper Local</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── TRUST & SAFETY ── */}
            <section className="py-24 bg-slate-950 overflow-hidden relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <Badge className="bg-emerald-500 text-white border-none font-black tracking-widest text-[10px] mb-6">MOBILE EXPERIENCE</Badge>
                            <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">Empowering <br /> <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Direct Connections.</span></h2>
                            <div className="space-y-8">
                                {[
                                    { title: "Member Directory", desc: "Our mobile app connects you with a community of renters and owners across major cities.", icon: Users },
                                    { title: "Direct Communication", desc: "Facilitate direct conversations and agreements with ease using our integrated chat.", icon: MessageCircle },
                                    { title: "Search & Filter", desc: "Discover exactly what you need with our advanced search tools powered by the mobile platform.", icon: Search },
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-all duration-500">
                                            <feature.icon className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white mb-2 tracking-tight">{feature.title}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed font-medium">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative group mx-auto max-w-md w-full">
                            <div className="relative bg-white/5 rounded-[3.5rem] p-4 border border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
                                <div className="bg-slate-900 rounded-[3rem] p-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                            <Smartphone className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-lg leading-none">Mobile Optimized</p>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Available Nationwide</p>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 mb-8">
                                        <p className="text-slate-400 text-sm italic font-medium">"LeasORent is designed to work where you are. Our mobile platform is the heart of our community."</p>
                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center p-1.5 border border-emerald-500/30">
                                                <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-white font-black text-xs">LeasORent Team</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setLocation("/download")}
                                        className="w-full btn-premium py-5 text-xs font-black tracking-widest uppercase rounded-2xl shadow-xl shadow-emerald-500/20 shine-effect cursor-pointer"
                                    >
                                        Download Now
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -z-10 -bottom-10 -right-10 h-64 w-64 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section - Hidden as requested */}
            {false && (
                <section className="py-24 bg-white">
                    {/* ... (previous implementation) */}
                </section>
            )}

            {/* ── ROADMAP / UPCOMING ── */}
            <section id="updates" className="py-32 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16 items-end mb-20">
                        <div className="max-w-2xl">
                            <Badge className="bg-slate-200 text-slate-700 border-none font-black tracking-widest text-[10px] mb-4">FUTURE FOCUS</Badge>
                            <h2 className="text-4xl sm:text-6xl font-black text-slate-950 mb-6 tracking-tighter">The Evolution of <br /><span className="text-emerald-600">LeasORent.</span></h2>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed">We're constantly perfecting the experience. Here's a glimpse into the short-term milestones and the vision ahead.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: "Full Web Commerce",
                                icon: Globe,
                                desc: "Transitioning our web platform to support direct rental bookings and payments, mirroring the mobile experience.",
                                status: "In Development"
                            },
                            {
                                title: "Elite Bug Fixing",
                                icon: Bug,
                                desc: "Rigorous testing and community-driven refinements to ensure the highest standard of stability and performance.",
                                status: "Ongoing"
                            },
                            {
                                title: "Media Ledger",
                                icon: Camera,
                                desc: "Advanced record-keeping for every rental, utilizing photo and video logs to verify asset state before and after use.",
                                status: "Planning"
                            },
                            {
                                title: "Long-Term Expansion",
                                icon: Rocket,
                                desc: "Scaling across new markets and introducing AI-driven utility predictions for a smarter sharing economy.",
                                status: "Vision"
                            }
                        ].map((milestone, i) => (
                            <div key={i} className="group glass-panel p-10 rounded-[2.5rem] border border-white hover:bg-white hover:shadow-2xl transition-all duration-500">
                                <div className="h-14 w-14 rounded-2xl bg-slate-950 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-500">
                                    <milestone.icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                                    {milestone.status}
                                </div>
                                <h4 className="text-xl font-black text-slate-950 mb-4 tracking-tight">{milestone.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">{milestone.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="py-24 relative overflow-hidden bg-slate-950">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]" />
                </div>
                <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-5xl sm:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">Elevate your mobility. <br /><span className="italic font-serif font-normal text-emerald-400">Join the community.</span></h2>
                    <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">Download the LeasORent application today and experience premier peer-to-peer destination.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/download">
                            <button className="bg-white text-slate-950 h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-3 shadow-2xl cursor-pointer">
                                <Smartphone className="h-5 w-5" />
                                Launch the App
                            </button>
                        </Link>
                    </div>

                    <div className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-x-12 gap-y-6">
                        {[
                            { value: "Peer-to-Peer", label: "Direct Connections" },
                            { value: "No Web Fees", label: "Zero Commissions" },
                            { value: "24/7", label: "App Support" }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-2xl font-black text-white leading-none">{stat.value}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mt-2">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

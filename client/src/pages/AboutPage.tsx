import { Link } from "wouter";
import { Info, User, Code, Heart, Smartphone, Database, Zap, Globe, Github } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <div className="mb-16 last:mb-0">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-emerald-500" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">{title}</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-4 text-base sm:text-lg font-medium">
                {children}
            </div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />

            {/* Header / Hero */}
            <div className="bg-slate-950 text-white relative overflow-hidden pt-32 pb-24">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5">
                        <Info className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Genesis Story</span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight">
                        Built from <br />
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent italic font-serif font-normal">the ground up.</span>
                    </h1>
                    <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-medium">
                        LeasORent isn't just an app; it's a vision of shared prosperity, crafted with obsession by a solo developer.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
                <Section title="The Solo Journey" icon={User}>
                    <p>
                        Contrary to what the polished interface might suggest, LeasORent is not the product of a massive software house or an agency. Ever line of code, every design decision, and every operational detail has been implemented by a <span className="text-emerald-600 font-bold">single individual</span>.
                    </p>
                    <p>
                        This project started as a challenge: to build Pakistan's first truly premium peer-to-peer rental ecosystem. Doing it solo meant wearing many hats—from backend architect and mobile developer to UI designer and product strategist.
                    </p>
                </Section>

                <Section title="The Vision" icon={Heart}>
                    <p>
                        In many parts of the world, including Pakistan, people have valuable assets sitting idle while others struggle to access the tools they need to grow their businesses or enjoy their lives.
                    </p>
                    <p>
                        LeasORent was built to bridge that gap. By creating a direct, peer-to-peer connection, we empower owners to earn passive income and renters to access premium assets—from high-end cameras to luxury cars—without the burden of ownership.
                    </p>
                </Section>

                {/* <Section title="Tech Stack & Craft" icon={Code}>
                    <p>
                        Crafting a high-performance, secure, and beautiful application requires a modern foundation. Under the hood, LeasORent utilizes:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <Smartphone className="h-6 w-6 text-slate-900 shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-950">React Native / Expo</h4>
                                <p className="text-sm text-slate-500">Powering the high-fidelity mobile experience on iOS and Android.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <Database className="h-6 w-6 text-slate-900 shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-950">Supabase / PostgreSQL</h4>
                                <p className="text-sm text-slate-500">Managing real-time data, authentication, and secure storage.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <Zap className="h-6 w-6 text-slate-900 shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-950">Tailwind CSS</h4>
                                <p className="text-sm text-slate-500">Enabling the sophisticated, glassmorphic design system on the web.</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                            <Globe className="h-6 w-6 text-slate-900 shrink-0" />
                            <div>
                                <h4 className="font-bold text-slate-950">Wouter / Vite</h4>
                                <p className="text-sm text-slate-500">Providing a lightning-fast web experience for our users.</p>
                            </div>
                        </div>
                    </div>
                </Section> */}

                <Section title="Why LeasORent?" icon={Zap}>
                    <p>
                        Unlike traditional rental companies, leasOrent doesn't own any inventory. We are a community platform. This allows us to offer a wider variety of items at more competitive prices, while putting money directly back into the pockets of everyday people.
                    </p>
                    <p>
                        Being a solo developer project means that every bit of feedback is heard by the person who can actually improve the app. We are constantly evolving, with new features being pushed every week.
                    </p>
                </Section>

                {/* Call to Action */}
                <div className="mt-24 p-12 bg-slate-950 rounded-[3rem] text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                    <h3 className="text-3xl font-black text-white mb-6 relative z-10">Part of the Community?</h3>
                    <p className="text-slate-400 mb-10 relative z-10 max-w-xl mx-auto font-medium">
                        If you believe in the vision of a shared economy, download the app and help us grow Pakistan's first peer-to-peer rental network.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Link href="/download">
                            <button className="btn-premium h-14 px-8 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                                <Smartphone className="h-5 w-5" />
                                Get the App
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

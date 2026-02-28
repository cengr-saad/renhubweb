import { Link, useLocation } from "wouter";
import { Mail, Phone, MapPin, Globe, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [location] = useLocation();

    return (
        <footer className="bg-slate-950 text-slate-400 py-20 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-2.5 mb-6 group">
                            <div className="h-10 w-10 rounded-xl bg-premium-gradient flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 overflow-hidden">
                                <img src="/assets/logo.png" alt="L" className="h-7 w-7 object-contain" />
                            </div>
                            <span className="font-black text-2xl tracking-tighter text-white">
                                Leas<span className="text-emerald-400">ORent</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed mb-8 max-w-xs">
                            Pakistan's most sophisticated peer-to-peer rental ecosystem. Elevating the way you access and share what matters.
                        </p>
                        <div className="flex items-center gap-4">
                            {/* Social Placeholder Removed */}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Navigation</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Home", href: "/" },
                                { label: "Download App", href: "/download" },
                                { label: "Pricing Tiers", href: "/pricing" },
                                { label: "About App", href: "/about" },
                                { label: "How it Works", href: "/#how-it-works" },
                            ].map((link) => {
                                const isAnchor = link.href.startsWith("/#");

                                const handleClick = (e: React.MouseEvent) => {
                                    if (isAnchor && location === "/") {
                                        e.preventDefault();
                                        const id = link.href.replace("/#", "");
                                        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                                    }
                                };

                                return (
                                    <li key={link.label}>
                                        {link.href.startsWith("mailto") ? (
                                            <a href={link.href} className="text-sm hover:text-white transition-colors flex items-center group">
                                                {link.label}
                                                <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                            </a>
                                        ) : (
                                            <Link href={link.href}>
                                                <span
                                                    onClick={handleClick}
                                                    className="text-sm hover:text-white transition-colors cursor-pointer flex items-center group"
                                                >
                                                    {link.label}
                                                    <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                                </span>
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Trust & Legal</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Privacy Policy", href: "/privacy" },
                                { label: "Terms of Service", href: "/terms" },
                                { label: "Paid Services", href: "/pricing" },
                            ].map((link) => (
                                <li key={link.label}>
                                    {link.href.startsWith("mailto") ? (
                                        <a href={link.href} className="text-sm hover:text-white transition-colors flex items-center group">
                                            {link.label}
                                            <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                        </a>
                                    ) : (
                                        <Link href={link.href}>
                                            <span className="text-sm hover:text-white transition-colors cursor-pointer flex items-center group">
                                                {link.label}
                                                <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                            </span>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Reach Out */}
                    <div>
                        <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Connect</h4>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">Corporate</p>
                                    <a href="mailto:support@leasorent.com" className="text-sm hover:text-white transition-colors">support@leasorent.com</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Globe className="h-5 w-5 text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-0.5">Based In</p>
                                    <p className="text-sm">Pakistan & International</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs font-medium tracking-wide">
                        © {currentYear} LEASORENT PVT LTD. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">System Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

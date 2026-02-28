import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import {
    Menu,
    Search,
    Home,
    Plus,
    ClipboardList,
    MessageCircle,
    User,
    LogOut,
    Heart,
    Settings,
    X,
    Bell,
    Info,
    Smartphone,
    Rocket,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const [location, setLocation] = useLocation();
    const { session, user, signOut } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setLocation("/");
    };

    const navLinks = [
        { href: "/about", label: "About", icon: Info },
        { href: "/#features", label: "Features", icon: Zap },
        { href: "/#how-it-works", label: "How it Works", icon: ClipboardList },
        { href: "/#updates", label: "Updates", icon: Rocket },
    ];

    const authLinks = [];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled
                ? "py-2 px-4"
                : "py-4 px-4"
        )}>
            <div className={cn(
                "max-w-7xl mx-auto rounded-2xl transition-all duration-300",
                scrolled
                    ? "glass-panel px-6 py-2 shadow-xl border-white/40"
                    : "bg-transparent px-4 py-2 border-transparent"
            )}>
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href={session ? "/home" : "/"}>
                        <div className="flex items-center gap-2.5 cursor-pointer group">
                            <div className="h-10 w-10 rounded-xl bg-premium-gradient flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                                <img
                                    src={scrolled ? "/assets/logo-white.png" : "/assets/logo.png"}
                                    alt="L"
                                    className="h-7 w-7 object-contain"
                                />
                            </div>
                            <span className="font-black text-2xl tracking-tighter flex items-center">
                                <span className={cn(
                                    "transition-colors duration-300",
                                    scrolled ? "text-primary" : "text-white"
                                )}>Leas</span>
                                <span className={cn(
                                    "transition-colors duration-300",
                                    scrolled ? "text-gray-900" : "text-emerald-300"
                                )}>ORent</span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-2">
                        {(session ? authLinks : navLinks).map((link) => {
                            const isActive = location === link.href;
                            const isAnchor = link.href.startsWith("/#");

                            const handleClick = (e: React.MouseEvent) => {
                                if (isAnchor && location === "/") {
                                    e.preventDefault();
                                    const id = link.href.replace("/#", "");
                                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                                }
                            };

                            return (
                                <Link key={link.href} href={link.href}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClick}
                                        className={cn(
                                            "font-bold text-sm rounded-xl px-4 transition-all duration-200",
                                            isActive
                                                ? scrolled ? "bg-primary/5 text-primary" : "bg-white/10 text-white"
                                                : scrolled ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100" : "text-white/70 hover:text-white hover:bg-white/10"
                                        )}
                                    >
                                        {link.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden md:flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => alert("LeasoRent is available on the Play Store & App Store!")}
                                    className="btn-premium group flex items-center gap-2 shadow-primary/20 hover:shadow-primary/40"
                                >
                                    <Smartphone className="h-4 w-4" />
                                    <span>Download App</span>
                                </button>
                                <div className="h-8 w-px bg-border/50 mx-1" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="relative group ring-offset-background transition-all hover:scale-105 active:scale-95">
                                            <Avatar className="h-10 w-10 border-2 border-black/5 ring-2 ring-primary/20 shadow-sm">
                                                <AvatarImage src={user?.avatar_url || ""} />
                                                <AvatarFallback className="bg-premium-gradient text-white text-xs font-bold">
                                                    {user?.full_name?.[0]?.toUpperCase() || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-2xl border-white/40 glass-panel p-2 mt-2">
                                        <div className="px-4 py-3 mb-2 flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user?.avatar_url || ""} />
                                                <AvatarFallback className="bg-primary text-white text-xs font-bold">
                                                    {user?.full_name?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <p className="font-bold text-sm text-gray-900 leading-none">{user?.full_name || "User"}</p>
                                                <p className="text-xs text-gray-400 mt-1 truncate max-w-[140px]">{user?.email}</p>
                                            </div>
                                        </div>
                                        <DropdownMenuSeparator className="bg-gray-100/50" />
                                        <div className="p-1 space-y-1">
                                            {[
                                                { href: "/profile", label: "My Profile", icon: User },
                                                { href: "/notifications", label: "Notifications", icon: Bell },
                                                { href: "/map-search", label: "Global Map", icon: Map },
                                                { href: "/settings", label: "Settings", icon: Settings },
                                            ].map((item) => (
                                                <DropdownMenuItem key={item.href} asChild className="rounded-xl cursor-pointer py-2.5 focus:bg-primary/5 focus:text-primary transition-colors">
                                                    <Link href={item.href}>
                                                        <div className="flex items-center w-full">
                                                            <item.icon className="h-4 w-4 mr-3 opacity-70" />
                                                            <span className="font-semibold text-sm">{item.label}</span>
                                                        </div>
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                        <DropdownMenuSeparator className="bg-gray-100/50" />
                                        <DropdownMenuItem
                                            onClick={handleSignOut}
                                            className="rounded-xl cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 m-1 py-2.5"
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            <span className="font-bold text-sm">Sign Out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/download">
                                    <button className="btn-premium px-6 py-2.5 text-sm shadow-emerald-500/20 cursor-pointer">
                                        Get the App
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className={cn(
                                    "rounded-xl transition-colors",
                                    scrolled ? "bg-gray-100/50" : "bg-white/10 text-white"
                                )}>
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[85%] p-0 border-none glass-panel">
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <div className="h-9 w-9 rounded-xl bg-premium-gradient flex items-center justify-center p-1.5 shadow-lg">
                                                <img src="/assets/logo.png" alt="L" className="w-full h-full object-contain brightness-0 invert" />
                                            </div>
                                            <span className="font-black text-xl text-primary flex items-center">
                                                <span>Leas</span>
                                                <span className="text-gray-900">ORent</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-2">
                                        {(session ? authLinks : navLinks).map((link) => {
                                            const isAnchor = link.href.startsWith("/#");
                                            const handleClick = (e: React.MouseEvent) => {
                                                setMobileOpen(false);
                                                if (isAnchor && location === "/") {
                                                    e.preventDefault();
                                                    const id = link.href.replace("/#", "");
                                                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                                                }
                                            };

                                            return (
                                                <Link key={link.href} href={link.href}>
                                                    <button
                                                        onClick={handleClick}
                                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-primary/5 text-left font-bold text-gray-700 hover:text-primary transition-all active:scale-[0.98]"
                                                    >
                                                        <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10">
                                                            <link.icon className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                                                        </div>
                                                        {link.label}
                                                    </button>
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
                                        {session && (
                                            <div className="space-y-3">
                                                <Link href="/profile">
                                                    <button
                                                        onClick={() => setMobileOpen(false)}
                                                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-gray-100"
                                                    >
                                                        <Avatar className="h-12 w-12 border-2 border-primary/20">
                                                            <AvatarImage src={user?.avatar_url || ""} />
                                                            <AvatarFallback className="bg-primary text-white text-sm font-bold">
                                                                {user?.full_name?.[0]?.toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="text-left">
                                                            <p className="font-black text-gray-900">{user?.full_name}</p>
                                                            <p className="text-xs text-gray-400">View Public Profile</p>
                                                        </div>
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 text-red-600 font-bold active:scale-95 transition-all"
                                                >
                                                    <LogOut className="h-5 w-5" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}


import { Tag, Layers, CheckCircle, Mail, Zap, Star } from "lucide-react";

function PriceBadge({ label }: { label: string }) {
    return (
        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            {label}
        </span>
    );
}

function FeatureRow({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-gray-600 text-sm leading-relaxed">{text}</span>
        </div>
    );
}

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-semibold text-emerald-300 mb-6">
                        <Zap className="h-4 w-4" /> Simple, transparent pricing
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black mb-4">Grow with LeasORent</h1>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
                        Start for free. Upgrade only when you need more. No hidden fees, no commissions.
                    </p>
                </div>
            </div>

            {/* Free tier callout */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Free for everyone</p>
                            <p className="text-gray-500 text-xs">Every user gets 3 free listings — no credit card required.</p>
                        </div>
                    </div>
                    <span className="text-2xl font-black text-emerald-600">$0</span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Featured Listing Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-8 pt-8 pb-6 border-b border-orange-100">
                            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                                <Star className="h-6 w-6 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-1">Featured Listing</h2>
                            <p className="text-gray-500 text-sm mb-5">Boost a specific listing to the top of search results and the home page.</p>
                            <div className="flex items-end gap-2">
                                <span className="text-5xl font-black text-gray-900">$1</span>
                                <span className="text-gray-400 font-medium mb-2">/ day</span>
                            </div>
                            <p className="text-xs text-amber-700 font-semibold mt-2 bg-amber-100 inline-block px-3 py-1 rounded-full">
                                Minimum: 1 day (24 hours)
                            </p>
                        </div>
                        <div className="px-8 py-6 flex flex-col gap-4 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">What you get</p>
                            <FeatureRow text="Your listing appears at the top of relevant search results" />
                            <FeatureRow text="Displayed in the Featured section on the home page" />
                            <FeatureRow text="Runs for exactly the number of days you pay for" />
                            <FeatureRow text="Works on any of your existing free or premium listings" />
                            <FeatureRow text="No effect on listing content — only placement changes" />
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400">
                                    Example: Feature a listing for 7 days = <strong className="text-gray-700">$7</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Extra Listing Slots Card */}
                    <div className="bg-white rounded-3xl border border-emerald-200 shadow-sm overflow-hidden flex flex-col relative">
                        <div className="absolute top-4 right-4">
                            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">Best Value</span>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 px-8 pt-8 pb-6 border-b border-emerald-100">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
                                <Layers className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-1">Extra Listing Slots</h2>
                            <p className="text-gray-500 text-sm mb-5">Post more than 3 listings. Each slot lets you add one additional listing.</p>

                            {/* Pricing toggle */}
                            <div className="space-y-3">
                                <div className="flex items-end justify-between bg-white rounded-2xl px-5 py-4 border border-emerald-100 shadow-sm">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Weekly</p>
                                        <div className="flex items-end gap-1.5">
                                            <span className="text-4xl font-black text-gray-900">$5</span>
                                            <span className="text-gray-400 font-medium mb-1">/ slot / week</span>
                                        </div>
                                    </div>
                                    <PriceBadge label="Min. 1 week" />
                                </div>
                                <div className="flex items-end justify-between bg-white rounded-2xl px-5 py-4 border-2 border-emerald-500 shadow-sm">
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Monthly — Save 20%</p>
                                        <div className="flex items-end gap-1.5">
                                            <span className="text-4xl font-black text-gray-900">$20</span>
                                            <span className="text-gray-400 font-medium mb-1">/ slot / month</span>
                                        </div>
                                    </div>
                                    <PriceBadge label="30 days" />
                                </div>
                            </div>
                        </div>
                        <div className="px-8 py-6 flex flex-col gap-4 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">What you get</p>
                            <FeatureRow text="1 extra listing slot per subscription purchased" />
                            <FeatureRow text="Buy multiple slots to post as many listings as you need" />
                            <FeatureRow text="Premium listings look identical to free listings — no special badge" />
                            <FeatureRow text="Slot activates immediately after payment confirmation" />
                            <FeatureRow text="Slot expires after the chosen duration (7 or 30 days)" />
                            <div className="mt-auto pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400">
                                    Example: 2 extra slots for 1 month = <strong className="text-gray-700">$40</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ-style notes */}
                <div className="mt-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Good to know</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <p className="font-bold text-gray-800 text-sm mb-1">Do featured listings get verified?</p>
                            <p className="text-gray-500 text-sm">No. Featuring a listing is a paid placement service only. LeasORent does not verify, endorse, or guarantee any listing regardless of its featured status.</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm mb-1">Do premium slots change how my listing looks?</p>
                            <p className="text-gray-500 text-sm">No. Premium slots only increase how many listings you can post. Your extra listings appear exactly the same as your 3 free listings.</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm mb-1">Does LeasORent handle payments?</p>
                            <p className="text-gray-500 text-sm">Payments for paid services are handled directly. LeasORent does not process or hold any rental payments between users.</p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm mb-1">Can prices change?</p>
                            <p className="text-gray-500 text-sm">Yes. Pricing is subject to change at any time without prior notice. Current prices are shown on this page.</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8 bg-gradient-to-br from-slate-900 to-emerald-950 rounded-3xl p-8 sm:p-10 text-center text-white">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">Ready to get started?</h3>
                    <p className="text-slate-300 text-sm mb-6 max-w-md mx-auto">
                        Contact our services team to purchase a featured listing or extra slots. We'll get you set up quickly.
                    </p>
                    <a
                        href="mailto:services@leasorent.com"
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm"
                    >
                        <Mail className="h-4 w-4" />
                        services@leasorent.com
                    </a>
                    <p className="text-slate-500 text-xs mt-4">For general support: support@leasorent.com</p>
                </div>
            </div>
        </div>
    );
}

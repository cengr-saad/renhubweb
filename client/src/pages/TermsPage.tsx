import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-10">
            <h2 className="text-xl font-black text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
            <div className="text-gray-600 leading-relaxed space-y-3 text-sm sm:text-base">{children}</div>
        </div>
    );
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                            <FileText className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black">Terms of Use</h1>
                            <p className="text-slate-400 text-sm mt-1">Last updated: February 2026</p>
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                        Please read these terms carefully before using LeasORent. By accessing or using our platform, you agree to be bound by these terms.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">

                    <Section title="1. About LeasORent">
                        <p>
                            LeasORent ("we", "us", "our", or "the Platform") is a peer-to-peer rental marketplace that connects individuals who wish to rent items, properties, or vehicles ("Renters") with individuals who own such items and wish to make them available for rent ("Owners"). LeasORent operates primarily in Pakistan but is accessible internationally.
                        </p>
                        <p>
                            <strong className="text-gray-800">We are a connection platform only.</strong> LeasORent does not own, rent, sell, resell, furnish, provide, or manage any listings. We are not a party to any rental agreement between Renters and Owners. All rental agreements, terms, pricing, and conditions are agreed upon solely between the Renter and the Owner.
                        </p>
                    </Section>

                    <Section title="2. Eligibility">
                        <p>You must be at least 18 years of age to use LeasORent. By using the Platform, you represent and warrant that you meet this requirement and that you have the legal capacity to enter into binding agreements.</p>
                    </Section>

                    <Section title="3. Platform Role & Limitation of Liability">
                        <p>
                            LeasORent acts solely as an intermediary to facilitate connections between Renters and Owners. We do not:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Verify the accuracy, completeness, or legality of any listing</li>
                            <li>Guarantee the quality, safety, or condition of any item listed</li>
                            <li>Handle, process, or hold any rental payments between parties</li>
                            <li>Take responsibility for any loss, damage, theft, injury, or dispute arising from a rental transaction</li>
                            <li>Guarantee that a Renter or Owner will complete a transaction</li>
                        </ul>
                        <p>
                            <strong className="text-gray-800">All rental transactions are conducted directly between Renters and Owners at their own risk.</strong> LeasORent shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or any rental transaction.
                        </p>
                    </Section>

                    <Section title="4. No Financial Transactions by LeasORent">
                        <p>
                            LeasORent does not collect, process, hold, or transfer any rental payments between users. All financial transactions for rental agreements are conducted directly between the Renter and the Owner through their own agreed-upon payment methods. LeasORent takes no commission or fee on any rental transaction.
                        </p>
                    </Section>

                    <Section title="5. Featured Listings & Paid Services">
                        <p>
                            LeasORent offers optional paid services, including but not limited to:
                        </p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li><strong className="text-gray-800">Featured Listings:</strong> Owners may pay to have their listings displayed more prominently in search results and on the home page. A featured listing is a paid visibility service only — it does not constitute an endorsement, verification, or guarantee of the listing by LeasORent.</li>
                            <li><strong className="text-gray-800">Premium Subscription (Extra Listing Slots):</strong> By default, every user may post up to 3 free listings. A Premium subscription allows users to post additional listings beyond this free limit. Premium does <em>not</em> affect the visibility, ranking, or appearance of listings — premium listings are displayed identically to free listings.</li>
                        </ul>
                        <p>
                            Paid service terms, pricing, and availability may change at any time without prior notice. For paid services inquiries, contact us at <a href="mailto:services@leasorent.com" className="text-emerald-600 hover:underline">services@leasorent.com</a>.
                        </p>
                    </Section>

                    <Section title="6. User Responsibilities">
                        <p>As a user of LeasORent, you agree to:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Provide accurate and truthful information in your profile and listings</li>
                            <li>Only list items that you legally own or have the right to rent out</li>
                            <li>Honour rental agreements you enter into with other users</li>
                            <li>Not use the Platform for any illegal, fraudulent, or harmful activity</li>
                            <li>Not post misleading, false, or deceptive listings</li>
                            <li>Treat other users with respect and honesty</li>
                            <li>Resolve disputes directly with the other party; LeasORent is not obligated to mediate</li>
                        </ul>
                    </Section>

                    <Section title="7. Prohibited Activities">
                        <p>You may not use LeasORent to:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>List stolen, counterfeit, or illegal items</li>
                            <li>Harass, threaten, or defraud other users</li>
                            <li>Circumvent the Platform to avoid agreed terms</li>
                            <li>Scrape, copy, or reproduce Platform content without permission</li>
                            <li>Impersonate another person or entity</li>
                        </ul>
                    </Section>

                    <Section title="8. Listings & Content">
                        <p>
                            Owners are solely responsible for the accuracy and legality of their listings. LeasORent reserves the right to remove any listing at any time for any reason, including but not limited to violations of these Terms, without notice or liability.
                        </p>
                        <p>
                            By posting content on LeasORent, you grant us a non-exclusive, royalty-free, worldwide licence to display and distribute that content on the Platform.
                        </p>
                    </Section>

                    <Section title="9. Disputes Between Users">
                        <p>
                            Any dispute arising from a rental transaction is solely between the Renter and the Owner. LeasORent is not responsible for resolving such disputes and shall not be liable for any outcome. We encourage users to communicate openly and resolve issues directly.
                        </p>
                    </Section>

                    <Section title="10. Account Termination">
                        <p>
                            LeasORent reserves the right to suspend or terminate any account at any time, with or without notice, for violations of these Terms or for any other reason at our sole discretion.
                        </p>
                    </Section>

                    <Section title="11. Changes to These Terms">
                        <p>
                            We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting to the Platform. Your continued use of LeasORent after any changes constitutes your acceptance of the new Terms. We are a startup and our policies will evolve as we grow.
                        </p>
                    </Section>

                    <Section title="12. Governing Law">
                        <p>
                            These Terms shall be governed by and construed in accordance with the laws of Pakistan. For international users, local laws may also apply.
                        </p>
                    </Section>

                    <Section title="13. Contact">
                        <p>For general support: <a href="mailto:support@leasorent.com" className="text-emerald-600 hover:underline">support@leasorent.com</a></p>
                        <p>For paid services: <a href="mailto:services@leasorent.com" className="text-emerald-600 hover:underline">services@leasorent.com</a></p>
                    </Section>

                </div>


            </div>
        </div>
    );
}

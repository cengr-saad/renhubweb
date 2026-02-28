import { Link } from "wouter";
import { ArrowLeft, Lock } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-10">
            <h2 className="text-xl font-black text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
            <div className="text-gray-600 leading-relaxed space-y-3 text-sm sm:text-base">{children}</div>
        </div>
    );
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                            <Lock className="h-6 w-6 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black">Privacy Policy</h1>
                            <p className="text-slate-400 text-sm mt-1">Last updated: February 2026</p>
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                        Your privacy matters to us. This policy explains what data we collect, how we use it, and your rights as a user of LeasORent.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">

                    <Section title="1. Who We Are">
                        <p>
                            LeasORent is a peer-to-peer rental platform connecting Renters and Owners. We are a startup based in Pakistan, operating internationally. This Privacy Policy applies to all users of the LeasORent mobile application and website.
                        </p>
                    </Section>

                    <Section title="2. Data We Collect">
                        <p>We collect the following types of information when you use LeasORent:</p>
                        <p><strong className="text-gray-800">Account Information:</strong></p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Full name and email address (provided at registration)</li>
                            <li>Profile photo (optional, uploaded by you)</li>
                            <li>Phone number (optional, for contact purposes)</li>
                        </ul>
                        <p><strong className="text-gray-800">Listing Information:</strong></p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Item details, photos, pricing, and location you provide when creating a listing</li>
                        </ul>
                        <p><strong className="text-gray-800">Usage Data:</strong></p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Rental requests sent and received</li>
                            <li>Messages exchanged between users on the Platform</li>
                            <li>Reviews and ratings submitted</li>
                            <li>Listing views and interactions</li>
                        </ul>
                        <p><strong className="text-gray-800">Device & Technical Data:</strong></p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>Device type, operating system, and app version</li>
                            <li>IP address and general location (country/city level)</li>
                        </ul>
                    </Section>

                    <Section title="3. How We Use Your Data">
                        <p>We use your data solely to operate and improve the LeasORent platform:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li>To create and manage your account</li>
                            <li>To display your listings to other users</li>
                            <li>To facilitate communication between Renters and Owners</li>
                            <li>To process rental requests and manage order workflows</li>
                            <li>To display reviews and ratings</li>
                            <li>To send you notifications about your account and orders</li>
                            <li>To improve the Platform's features and performance</li>
                            <li>To prevent fraud and enforce our Terms of Use</li>
                        </ul>
                        <p>
                            <strong className="text-gray-800">We do not sell, rent, or share your personal data with third parties for marketing purposes.</strong>
                        </p>
                    </Section>

                    <Section title="4. Data Sharing">
                        <p>We share your data only in the following limited circumstances:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li><strong className="text-gray-800">With other users:</strong> Your name, profile photo, listings, and reviews are visible to other users as part of the Platform's core functionality.</li>
                            <li><strong className="text-gray-800">Service providers:</strong> We use third-party services (such as Supabase for database and authentication) that process data on our behalf under strict data processing agreements.</li>
                            <li><strong className="text-gray-800">Legal requirements:</strong> We may disclose data if required by law or to protect the rights and safety of our users or the public.</li>
                        </ul>
                    </Section>

                    <Section title="5. Data Security — Startup Disclaimer">
                        <p>
                            We take reasonable technical measures to protect your data, including encrypted connections (HTTPS), secure authentication, and access controls. However, <strong className="text-gray-800">we are a startup and cannot guarantee absolute security of your data.</strong>
                        </p>
                        <p>
                            No system is completely secure. In the event of a data breach, we will make reasonable efforts to notify affected users and relevant authorities as required by applicable law. However, LeasORent shall not be held liable for any damages resulting from unauthorised access to your data beyond our reasonable control.
                        </p>
                        <p>
                            We are committed to improving our security practices as we grow and mature as a company.
                        </p>
                    </Section>

                    <Section title="6. Data Retention">
                        <p>
                            We retain your personal data for as long as your account is active or as needed to provide you with our services. If you delete your account, we will delete or anonymise your personal data within a reasonable period, except where we are required to retain it for legal or operational reasons.
                        </p>
                    </Section>

                    <Section title="7. Your Rights">
                        <p>As a user of LeasORent, you have the right to:</p>
                        <ul className="list-disc pl-5 space-y-1.5">
                            <li><strong className="text-gray-800">Access:</strong> Request a copy of the personal data we hold about you</li>
                            <li><strong className="text-gray-800">Correction:</strong> Update or correct inaccurate information in your profile</li>
                            <li><strong className="text-gray-800">Deletion:</strong> Request deletion of your account and associated data</li>
                            <li><strong className="text-gray-800">Objection:</strong> Object to certain uses of your data</li>
                        </ul>
                        <p>
                            To exercise any of these rights, contact us at <a href="mailto:support@leasorent.com" className="text-emerald-600 hover:underline">support@leasorent.com</a>. We will respond within a reasonable timeframe.
                        </p>
                    </Section>

                    <Section title="8. Cookies & Tracking">
                        <p>
                            Our web platform may use cookies and similar technologies to maintain your session and improve your experience. We do not use tracking cookies for advertising purposes. You can control cookie settings through your browser.
                        </p>
                    </Section>

                    <Section title="9. Children's Privacy">
                        <p>
                            LeasORent is not intended for users under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.
                        </p>
                    </Section>

                    <Section title="10. International Users">
                        <p>
                            LeasORent is primarily operated from Pakistan. If you access the Platform from outside Pakistan, your data may be transferred to and processed in Pakistan. By using LeasORent, you consent to this transfer. We will handle your data in accordance with this Privacy Policy regardless of where you are located.
                        </p>
                    </Section>

                    <Section title="11. Changes to This Policy">
                        <p>
                            We may update this Privacy Policy from time to time as our platform evolves. Changes will be posted on this page with an updated date. Your continued use of LeasORent after any changes constitutes your acceptance of the updated policy. We recommend reviewing this page periodically.
                        </p>
                    </Section>

                    <Section title="12. Contact Us">
                        <p>If you have any questions or concerns about this Privacy Policy or your data:</p>
                        <p>📧 General support: <a href="mailto:support@leasorent.com" className="text-emerald-600 hover:underline">support@leasorent.com</a></p>
                        <p>📧 Paid services: <a href="mailto:services@leasorent.com" className="text-emerald-600 hover:underline">services@leasorent.com</a></p>
                    </Section>

                </div>


            </div>
        </div>
    );
}

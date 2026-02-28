import { useState, useEffect } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Bell, Clock, CheckCircle2, XCircle, AlertCircle, Package, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_CONFIG: Record<string, { title: string; icon: React.ReactNode; dotClass: string; description: (data: any) => string }> = {
    submit: { title: 'New Rental Request', icon: <Package className="h-4 w-4" />, dotClass: 'bg-blue-500', description: (d) => `${d?.performer?.full_name || 'Someone'} sent a rental request` },
    accept: { title: 'Request Accepted', icon: <CheckCircle2 className="h-4 w-4" />, dotClass: 'bg-emerald-500', description: (d) => `Your request was accepted` },
    reject: { title: 'Request Rejected', icon: <XCircle className="h-4 w-4" />, dotClass: 'bg-red-500', description: (d) => `Your request was rejected` },
    withdraw: { title: 'Request Withdrawn', icon: <XCircle className="h-4 w-4" />, dotClass: 'bg-gray-400', description: (d) => `${d?.performer?.full_name || 'Renter'} withdrew the request` },
    cancel: { title: 'Rental Cancelled', icon: <XCircle className="h-4 w-4" />, dotClass: 'bg-red-500', description: (d) => `The rental was cancelled` },
    submit_handover: { title: 'Payment Submitted', icon: <CheckCircle2 className="h-4 w-4" />, dotClass: 'bg-blue-500', description: (d) => `${d?.performer?.full_name || 'Renter'} submitted payment` },
    approve_handover: { title: 'Handover Approved', icon: <CheckCircle2 className="h-4 w-4" />, dotClass: 'bg-emerald-500', description: (d) => `Handover approved — rental is now LIVE` },
    reject_handover: { title: 'Handover Rejected', icon: <AlertCircle className="h-4 w-4" />, dotClass: 'bg-amber-500', description: (d) => `Payment was rejected — please resubmit` },
    request_return: { title: 'Check Out Requested', icon: <RefreshCw className="h-4 w-4" />, dotClass: 'bg-pink-500', description: (d) => `${d?.performer?.full_name || 'Renter'} requested check out` },
    approve_return: { title: 'Return Approved', icon: <CheckCircle2 className="h-4 w-4" />, dotClass: 'bg-emerald-500', description: (d) => `Return approved — rental completed!` },
    reject_return: { title: 'Return Rejected', icon: <XCircle className="h-4 w-4" />, dotClass: 'bg-red-500', description: (d) => `Return was rejected` },
    dispute: { title: 'Dispute Raised', icon: <AlertCircle className="h-4 w-4" />, dotClass: 'bg-red-500', description: (d) => `A dispute has been raised` },
};

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) fetchNotifications();
    }, [user?.id]);

    const fetchNotifications = async () => {
        if (!supabase || !user?.id) return;
        setLoading(true);
        try {
            // Fetch activity log entries where the user is the OTHER party (not the performer)
            const { data } = await supabase
                .from('request_activity_log')
                .select(`
          *,
          performer:performed_by(id, full_name, avatar_url),
          request:request_id(
            id, status, listing_id, renter_id, owner_id,
            listing:listing_id(id, title, images)
          )
        `)
                .neq('performed_by', user.id)
                .or(`request.renter_id.eq.${user.id},request.owner_id.eq.${user.id}`)
                .order('created_at', { ascending: false })
                .limit(50);

            setNotifications(data || []);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (d: string) => {
        const date = new Date(d);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-1">Notifications</h1>
                        <p className="text-gray-400 text-sm">Activity on your orders</p>
                    </div>
                    <button onClick={fetchNotifications} className="h-9 w-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <RefreshCw className="h-4 w-4 text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
                        <Bell className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold text-lg mb-2">No notifications yet</p>
                        <p className="text-gray-400 text-sm">Activity on your orders will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.map((notif) => {
                            const cfg = ACTION_CONFIG[notif.action] || {
                                title: notif.action.replace(/_/g, ' '),
                                icon: <Bell className="h-4 w-4" />,
                                dotClass: 'bg-gray-400',
                                description: () => 'Order updated',
                            };
                            const listing = notif.request?.listing;
                            return (
                                <Link key={notif.id} href={`/order/${notif.request_id}`}>
                                    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 items-start">
                                        <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0', cfg.dotClass)}>
                                            {cfg.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-bold text-gray-900 text-sm">{cfg.title}</p>
                                                <span className="text-xs text-gray-400 shrink-0">{formatTime(notif.created_at)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{cfg.description(notif)}</p>
                                            {listing && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    {listing.images?.[0] && (
                                                        <img src={listing.images[0]} className="h-8 w-8 rounded-lg object-cover" alt="" />
                                                    )}
                                                    <p className="text-xs text-gray-400 truncate">{listing.title}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

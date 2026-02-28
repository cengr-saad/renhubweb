import { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getAvailableActions, STATUS_LABELS, STATUS_COLORS, REASON_OPTIONS,
  ACTION_LABELS, ACTION_COLORS, type Action, type Role, type RequestStatus
} from "@/lib/stateMachine";
import {
  Loader2, MapPin, Clock, FileText, User, CheckCircle2, XCircle,
  AlertCircle, ArrowRight, Receipt, ShieldCheck, MessageCircle,
  Star, Copy, RefreshCw, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Activity log icon/color map ───────────────────────────────────────────
const ACTION_CONFIG: Record<string, { title: string; color: string; icon: React.ReactNode; dotClass: string }> = {
  submit: { title: 'Rental Request Sent', color: 'text-emerald-600', icon: <ArrowRight className="h-3 w-3" />, dotClass: 'bg-emerald-500' },
  accept: { title: 'Request Accepted', color: 'text-emerald-600', icon: <CheckCircle2 className="h-3 w-3" />, dotClass: 'bg-emerald-500' },
  resubmit: { title: 'Request Resubmitted', color: 'text-blue-600', icon: <RefreshCw className="h-3 w-3" />, dotClass: 'bg-blue-500' },
  reject: { title: 'Request Rejected', color: 'text-red-600', icon: <XCircle className="h-3 w-3" />, dotClass: 'bg-red-500' },
  withdraw: { title: 'Request Withdrawn', color: 'text-gray-500', icon: <XCircle className="h-3 w-3" />, dotClass: 'bg-gray-400' },
  cancel: { title: 'Rental Cancelled', color: 'text-red-600', icon: <XCircle className="h-3 w-3" />, dotClass: 'bg-red-500' },
  submit_handover: { title: 'Payment Submitted', color: 'text-blue-600', icon: <Receipt className="h-3 w-3" />, dotClass: 'bg-blue-500' },
  approve_handover: { title: 'Handover Accepted', color: 'text-emerald-600', icon: <CheckCircle2 className="h-3 w-3" />, dotClass: 'bg-emerald-500' },
  reject_handover: { title: 'Handover Rejected', color: 'text-amber-600', icon: <AlertCircle className="h-3 w-3" />, dotClass: 'bg-amber-500' },
  request_return: { title: 'Check Out Requested', color: 'text-pink-600', icon: <RefreshCw className="h-3 w-3" />, dotClass: 'bg-pink-500' },
  approve_return: { title: 'Check Out Approved', color: 'text-emerald-600', icon: <CheckCircle2 className="h-3 w-3" />, dotClass: 'bg-emerald-500' },
  reject_return: { title: 'Check Out Rejected', color: 'text-red-600', icon: <XCircle className="h-3 w-3" />, dotClass: 'bg-red-500' },
  dispute: { title: 'Dispute Raised', color: 'text-red-600', icon: <AlertCircle className="h-3 w-3" />, dotClass: 'bg-red-500' },
};

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [request, setRequest] = useState<any>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modals
  const [reasonModal, setReasonModal] = useState<{ open: boolean; action: Action | null }>({ open: false, action: null });
  const [selectedReason, setSelectedReason] = useState('');
  const [reasonNote, setReasonNote] = useState('');
  const [consentModal, setConsentModal] = useState<{ open: boolean; action: Action | null }>({ open: false, action: null });
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [handoverModal, setHandoverModal] = useState(false);

  // Handover form
  const [handoverForm, setHandoverForm] = useState({
    actualAmount: '', securityDeposit: '', totalAmount: '', txId: '', paymentMethod: 'cash', notes: '',
  });

  // Review
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      fetchAll();
      setupRealtime();
    }
    return () => { channelRef.current?.unsubscribe(); };
  }, [id]);

  const fetchAll = async () => {
    if (!supabase || !id) return;
    try {
      const [{ data: req }, { data: logs }] = await Promise.all([
        supabase.from('rent_requests').select(`
          *,
          listing:listing_id(id, title, images, location, status, user_id, is_premium, price_daily, price_weekly, price_monthly, price_full_day, price_half_day, security_deposit, payment_methods,
            owner:user_id(id, full_name, avatar_url, phone)
          ),
          renter:renter_id(id, full_name, avatar_url, phone),
          owner:owner_id(id, full_name, avatar_url, phone)
        `).eq('id', id).single(),
        supabase.from('request_activity_log').select(`
          *, performer:performed_by(id, full_name, avatar_url)
        `).eq('request_id', id).order('created_at', { ascending: true }),
      ]);
      if (req) setRequest(req);
      setActivityLog(logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    if (!supabase || !id) return;
    channelRef.current = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rent_requests', filter: `id=eq.${id}` },
        (payload) => { if (payload.new) setRequest((prev: any) => ({ ...prev, ...payload.new })); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'request_activity_log', filter: `request_id=eq.${id}` },
        () => fetchAll())
      .subscribe();
  };

  const getRole = (): Role => {
    if (!request || !user?.id) return 'renter';
    return request.renter_id === user.id ? 'renter' : 'owner';
  };

  // ─── Action handlers ───────────────────────────────────────────────────────
  const handleAction = async (action: Action, extra?: Record<string, any>) => {
    if (!supabase || !id) return;
    setActionLoading(action);
    try {
      const { error } = await supabase.rpc('update_request_status', {
        p_request_id: id,
        p_action: action,
        p_user_id: user?.id,
        ...extra,
      });
      if (error) throw error;
      toast({ title: ACTION_LABELS[action] + ' successful' });
      fetchAll();
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const openReasonModal = (action: Action) => {
    setReasonModal({ open: true, action });
    setSelectedReason('');
    setReasonNote('');
  };

  const submitReason = async () => {
    if (!selectedReason) { toast({ title: 'Please select a reason', variant: 'destructive' }); return; }
    if (selectedReason === 'Other' && !reasonNote.trim()) { toast({ title: 'Please provide details', variant: 'destructive' }); return; }
    const action = reasonModal.action!;
    const note = selectedReason === 'Other' ? reasonNote : null;
    const extra: Record<string, any> = {};
    if (action === 'reject') { extra.p_rejection_reason = selectedReason; extra.p_note = note; }
    else if (action === 'reject_handover') { extra.p_rejection_reason = selectedReason; extra.p_note = note; }
    else if (action === 'cancel') { extra.p_cancellation_reason = selectedReason; extra.p_note = note; extra.p_cancelled_by = user?.id; }
    else if (action === 'withdraw') { extra.p_withdrawal_reason = selectedReason; extra.p_note = note; }
    else if (action === 'reject_return') { extra.p_dispute_reason = selectedReason; extra.p_note = note; }
    else if (action === 'dispute') { extra.p_dispute_reason = selectedReason; extra.p_note = note; }
    setReasonModal({ open: false, action: null });
    await handleAction(action, extra);
  };

  const openConsentModal = (action: Action) => {
    setConsentModal({ open: true, action });
    setConsentAgreed(false);
  };

  const submitConsent = async () => {
    if (!consentAgreed) { toast({ title: 'Please agree to the terms', variant: 'destructive' }); return; }
    const action = consentModal.action!;
    setConsentModal({ open: false, action: null });
    const extra: Record<string, any> = {};
    if (action === 'approve_handover') extra.p_owner_handover_consent = true;
    else if (action === 'request_return') extra.p_renter_return_consent = true;
    else if (action === 'approve_return') extra.p_owner_return_consent = true;
    await handleAction(action, extra);
  };

  const submitHandover = async () => {
    if (!handoverForm.actualAmount) { toast({ title: 'Enter amount paid', variant: 'destructive' }); return; }
    if (!handoverForm.totalAmount) { toast({ title: 'Enter total amount', variant: 'destructive' }); return; }
    if (handoverForm.paymentMethod !== 'cash' && !handoverForm.txId) {
      toast({ title: 'Transaction ID required for online payments', variant: 'destructive' }); return;
    }
    setHandoverModal(false);
    await handleAction('submit_handover', {
      p_actual_amount_paid: parseFloat(handoverForm.actualAmount) || 0,
      p_security_deposit_paid: parseFloat(handoverForm.securityDeposit) || 0,
      p_total_amount_paid: parseFloat(handoverForm.totalAmount) || 0,
      p_transaction_id: handoverForm.paymentMethod === 'cash' ? null : handoverForm.txId,
      p_payment_method: handoverForm.paymentMethod,
      p_handover_notes: handoverForm.notes,
    });
  };

  const submitReview = async () => {
    if (!supabase || !user?.id || !request) return;
    setSubmittingReview(true);
    try {
      const revieweeId = getRole() === 'renter' ? request.owner_id : request.renter_id;
      await supabase.from('reviews').insert({
        reviewer_id: user.id, reviewee_id: revieweeId, listing_id: request.listing_id,
        request_id: id, rating: reviewRating, comment: reviewComment, type: 'user',
      });
      toast({ title: 'Review submitted!' });
      setReviewModal(false);
    } catch (err: any) {
      toast({ title: 'Failed to submit review', description: err.message, variant: 'destructive' });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ─── Render helpers ────────────────────────────────────────────────────────
  const formatDateTime = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
    </div>
  );

  if (!request) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-gray-500 font-bold text-lg mb-4">Order not found</p>
        <Link href="/orders"><Button className="rounded-xl font-bold">Back to Orders</Button></Link>
      </div>
    </div>
  );

  const role = getRole();
  const status = request.status as RequestStatus;
  const statusColors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  const availableActions = getAvailableActions(status, role, request.return_requested_by, user?.id);
  const listing = request.listing;
  const partner = role === 'renter' ? request.owner : request.renter;
  const price = Number(request.total_amount || request.snapshot_listing_price || 0);
  const secDeposit = Number(request.security_deposit_amount || listing?.security_deposit || 0);

  // Separate approval vs negation actions
  const approvalActions: Action[] = ['accept', 'submit_handover', 'approve_handover', 'request_return', 'approve_return'];
  const negationActions: Action[] = ['withdraw', 'reject', 'reject_handover', 'cancel', 'reject_return', 'dispute'];
  const needsConsent: Action[] = ['approve_handover', 'request_return', 'approve_return'];
  const needsReason: Action[] = ['reject', 'reject_handover', 'cancel', 'withdraw', 'reject_return', 'dispute'];

  const handleActionClick = (action: Action) => {
    if (action === 'submit_handover') { setHandoverModal(true); return; }
    if (needsConsent.includes(action)) { openConsentModal(action); return; }
    if (needsReason.includes(action)) { openReasonModal(action); return; }
    handleAction(action);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* Status Banner */}
        <div className={cn('rounded-2xl p-5 mb-5 border', statusColors.bg, statusColors.border)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                {role === 'renter' ? 'BORROWING' : 'LENDING'}
              </p>
              <p className={cn('text-2xl font-black', statusColors.text)}>{STATUS_LABELS[status]}</p>
              <button
                onClick={() => navigator.clipboard.writeText(request.id).then(() => toast({ title: 'ID copied' }))}
                className="flex items-center gap-1 mt-1 opacity-60 hover:opacity-100 transition-opacity"
              >
                <span className={cn('text-xs font-mono', statusColors.text)}>#{request.id.slice(0, 12).toUpperCase()}</span>
                <Copy className="h-3 w-3" />
              </button>
            </div>
            {status === 'COMPLETED' && (
              <button
                onClick={() => setReviewModal(true)}
                className="flex items-center gap-2 bg-white/80 rounded-xl px-4 py-2 font-bold text-sm shadow-sm hover:bg-white transition-colors"
              >
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Leave Review
              </button>
            )}
          </div>
        </div>

        {/* Listing Card */}
        {listing && (
          <Link href={`/listing/${listing.id}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-4 flex gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <img
                src={listing.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200'}
                className="h-20 w-20 object-cover rounded-xl shrink-0"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Renting Product</p>
                <h2 className="font-bold text-gray-900 truncate">{request.snapshot_listing_title || listing.title}</h2>
                <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" /> {listing.location}
                </p>
                {listing.status === 'paused' && (
                  <span className="text-xs text-amber-600 font-semibold mt-1 block">⚠ Listing is paused</span>
                )}
              </div>
              <ChevronLeft className="h-5 w-5 text-gray-300 rotate-180 self-center shrink-0" />
            </div>
          </Link>
        )}

        {/* Partner Card */}
        {partner && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={partner.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
                  {partner.full_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{role === 'renter' ? 'Owner' : 'Renter'}</p>
                <p className="font-bold text-gray-900">{partner.full_name}</p>
              </div>
            </div>
            <Link href={`/chat/${request.id}`}>
              <Button size="sm" className="rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none font-bold">
                <MessageCircle className="h-4 w-4 mr-1.5" /> Chat
              </Button>
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        {availableActions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Available Actions</p>
            <div className="flex flex-wrap gap-2">
              {[...approvalActions, ...negationActions].filter(a => availableActions.includes(a)).map(action => (
                <Button
                  key={action}
                  onClick={() => handleActionClick(action)}
                  disabled={!!actionLoading}
                  className={cn('rounded-xl font-bold h-10 text-sm border-none', ACTION_COLORS[action] || 'bg-gray-100 text-gray-700')}
                >
                  {actionLoading === action ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {ACTION_LABELS[action]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Rental Schedule */}
        {(request.start_date_time || request.start_date) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" /> Rental Schedule
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Start</p>
                <p className="font-bold text-gray-900 text-sm">{formatDateTime(request.start_date_time || request.start_date)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">End</p>
                <p className="font-bold text-gray-900 text-sm">{formatDateTime(request.end_date_time || request.end_date)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" /> Financial Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Duration Type</span>
              <span className="font-bold text-gray-900 capitalize">{request.snapshot_listing_duration_type || request.duration_type || '—'}</span>
            </div>
            {(request.snapshot_listing_price || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rate</span>
                <span className="font-bold text-gray-900">Rs {Number(request.snapshot_listing_price).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Amount</span>
              <span className="font-bold text-gray-900">Rs {price.toLocaleString()}</span>
            </div>
            {secDeposit > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Security Deposit</span>
                <span className="font-bold text-gray-900">Rs {secDeposit.toLocaleString()}</span>
              </div>
            )}
            <div className="h-px bg-gray-100 my-1" />
            <div className="flex justify-between">
              <span className="font-bold text-gray-900">Due at Handover</span>
              <span className="font-black text-emerald-600 text-lg">Rs {(price + secDeposit).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Payment Method</span>
              <span className="font-bold text-gray-900 capitalize">{request.payment_method || '—'}</span>
            </div>
          </div>
        </div>

        {/* Payment Record (post-handover) */}
        {(['HANDOVER_PENDING', 'LIVE', 'RETURN_PENDING', 'COMPLETED', 'DISPUTED'].includes(status) && request.total_amount_paid) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-4">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" /> Payment Record
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rental Amount Paid</span>
                <span className="font-bold text-gray-900">Rs {Number(request.actual_amount_paid || 0).toLocaleString()}</span>
              </div>
              {Number(request.security_deposit_paid) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Security Deposit Paid</span>
                  <span className="font-bold text-gray-900">Rs {Number(request.security_deposit_paid).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-700">Total Paid</span>
                <span className="text-emerald-600">Rs {Number(request.total_amount_paid).toLocaleString()}</span>
              </div>
              {request.transaction_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="font-mono text-gray-900 text-xs">{request.transaction_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" /> Activity Log
            </h3>
            <span className="text-xs text-gray-400 font-medium">{activityLog.length} events</span>
          </div>

          {activityLog.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-200" />
              No activity yet
            </div>
          ) : (
            <div className="space-y-0">
              {activityLog.map((log, index) => {
                const cfg = ACTION_CONFIG[log.action] || {
                  title: log.action.replace(/_/g, ' ').toUpperCase(),
                  color: 'text-gray-600',
                  icon: <Clock className="h-3 w-3" />,
                  dotClass: 'bg-gray-400',
                };
                const performerName = log.performer?.full_name ||
                  (log.performed_by === request.renter_id ? (request.renter?.full_name || 'Renter') : (request.owner?.full_name || 'Owner'));
                const isLast = index === activityLog.length - 1;

                return (
                  <div key={log.id} className="flex gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={cn('h-6 w-6 rounded-full flex items-center justify-center text-white shrink-0 mt-0.5', cfg.dotClass)}>
                        {cfg.icon}
                      </div>
                      {!isLast && <div className="w-0.5 bg-gray-100 flex-1 my-1" />}
                    </div>

                    {/* Content */}
                    <div className={cn('pb-4 flex-1', isLast ? '' : '')}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn('font-bold text-sm', cfg.color)}>{cfg.title}</p>
                          <p className="text-xs text-gray-400">By {performerName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-gray-600">
                            {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {/* Handover details */}
                      {log.action === 'submit_handover' && log.data && (
                        <div className="mt-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Handover Details</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Amount Paid</span>
                              <span className="font-bold">Rs {Number(log.data.actual_amount_paid || 0).toLocaleString()}</span>
                            </div>
                            {Number(log.data.security_deposit_paid) > 0 && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Security Deposit</span>
                                <span className="font-bold">Rs {Number(log.data.security_deposit_paid).toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-gray-700">Total Paid</span>
                              <span className="text-blue-700">Rs {Number(log.data.total_amount_paid || 0).toLocaleString()}</span>
                            </div>
                            {log.data.transaction_id && (
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">TX ID</span>
                                <span className="font-mono">{log.data.transaction_id}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Rejection/cancellation details */}
                      {['reject', 'reject_handover', 'cancel', 'withdraw', 'dispute', 'reject_return'].includes(log.action) && log.data && (() => {
                        const reasonMap: Record<string, string> = {
                          reject: log.data.rejection_reason,
                          reject_handover: log.data.rejection_reason,
                          cancel: log.data.cancellation_reason,
                          withdraw: log.data.withdrawal_reason,
                          dispute: log.data.dispute_reason,
                          reject_return: log.data.dispute_reason,
                        };
                        const reason = reasonMap[log.action];
                        const note = log.data.note_to_other_party || log.data.cancellation_note || log.data.withdrawal_note;
                        if (!reason) return null;
                        return (
                          <div className="mt-2 bg-red-50 rounded-xl p-3 border border-red-100">
                            <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Decline Details</p>
                            <p className="text-xs font-bold text-red-700">{reason}</p>
                            {reason === 'Other' && note && <p className="text-xs text-red-600 mt-0.5">{note}</p>}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Link href="/orders">
          <Button className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none mb-8">
            Back to Orders
          </Button>
        </Link>
      </div>

      {/* ─── Reason Modal ─────────────────────────────────────────────────── */}
      <Dialog open={reasonModal.open} onOpenChange={(o) => setReasonModal({ open: o, action: null })}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">{reasonModal.action ? ACTION_LABELS[reasonModal.action] : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Select a reason:</p>
            <div className="space-y-2">
              {(REASON_OPTIONS[reasonModal.action || ''] || []).map(r => (
                <button
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
                    selectedReason === r ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            {selectedReason === 'Other' && (
              <Textarea
                value={reasonNote}
                onChange={e => setReasonNote(e.target.value)}
                placeholder="Please provide more details..."
                className="rounded-xl resize-none text-sm"
                rows={3}
              />
            )}
            <Button
              onClick={submitReason}
              disabled={!selectedReason || !!actionLoading}
              className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Consent Modal ────────────────────────────────────────────────── */}
      <Dialog open={consentModal.open} onOpenChange={(o) => setConsentModal({ open: o, action: null })}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">{consentModal.action ? ACTION_LABELS[consentModal.action] : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-800 font-medium">
                {consentModal.action === 'approve_handover' && 'By approving, you confirm that you have received the payment and are handing over the item. This will mark the rental as LIVE.'}
                {consentModal.action === 'request_return' && 'By requesting check out, you confirm that you are returning the item to the owner. The owner will need to approve the return.'}
                {consentModal.action === 'approve_return' && 'By approving the return, you confirm that the item has been returned in acceptable condition. This will complete the rental.'}
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAgreed}
                onChange={e => setConsentAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-emerald-500"
              />
              <span className="text-sm text-gray-700 font-medium">I understand and agree to proceed with this action</span>
            </label>
            <Button
              onClick={submitConsent}
              disabled={!consentAgreed || !!actionLoading}
              className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-none"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Handover Modal ───────────────────────────────────────────────── */}
      <Dialog open={handoverModal} onOpenChange={setHandoverModal}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-black">Submit Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-blue-700 font-medium">
                Due at handover: <span className="font-black">Rs {(price + secDeposit).toLocaleString()}</span>
                {secDeposit > 0 && ` (incl. Rs ${secDeposit.toLocaleString()} deposit)`}
              </p>
            </div>

            <div>
              <Label className="text-xs font-bold">Payment Method</Label>
              <div className="flex gap-2 mt-1.5">
                {['cash', 'bank'].map(m => (
                  <button key={m} type="button"
                    onClick={() => setHandoverForm(p => ({ ...p, paymentMethod: m }))}
                    className={cn('flex-1 py-2 rounded-xl text-sm font-bold border transition-all capitalize',
                      handoverForm.paymentMethod === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600'
                    )}
                  >
                    {m === 'cash' ? '💵 Cash' : '🏦 Bank'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">Rental Amount Paid (Rs)</Label>
              <Input type="number" value={handoverForm.actualAmount}
                onChange={e => setHandoverForm(p => ({ ...p, actualAmount: e.target.value }))}
                className="mt-1 h-10 rounded-xl" placeholder="0" />
            </div>

            {secDeposit > 0 && (
              <div>
                <Label className="text-xs font-bold">Security Deposit Paid (Rs)</Label>
                <Input type="number" value={handoverForm.securityDeposit}
                  onChange={e => setHandoverForm(p => ({ ...p, securityDeposit: e.target.value }))}
                  className="mt-1 h-10 rounded-xl" placeholder="0" />
              </div>
            )}

            <div>
              <Label className="text-xs font-bold">Total Amount Paid (Rs)</Label>
              <Input type="number" value={handoverForm.totalAmount}
                onChange={e => setHandoverForm(p => ({ ...p, totalAmount: e.target.value }))}
                className="mt-1 h-10 rounded-xl" placeholder="0" />
            </div>

            {handoverForm.paymentMethod !== 'cash' && (
              <div>
                <Label className="text-xs font-bold">Transaction ID</Label>
                <Input value={handoverForm.txId}
                  onChange={e => setHandoverForm(p => ({ ...p, txId: e.target.value }))}
                  className="mt-1 h-10 rounded-xl font-mono text-sm" placeholder="TX-XXXXXXXX" />
              </div>
            )}

            <div>
              <Label className="text-xs font-bold">Notes (optional)</Label>
              <Textarea value={handoverForm.notes}
                onChange={e => setHandoverForm(p => ({ ...p, notes: e.target.value }))}
                className="mt-1 rounded-xl resize-none text-sm" rows={2} placeholder="Any additional notes..." />
            </div>

            <Button onClick={submitHandover} disabled={!!actionLoading}
              className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none">
              {actionLoading === 'submit_handover' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Review Modal ─────────────────────────────────────────────────── */}
      <Dialog open={reviewModal} onOpenChange={setReviewModal}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold mb-2 block">Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={cn('h-8 w-8 transition-colors', s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200')} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold">Comment</Label>
              <Textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                className="mt-1 rounded-xl resize-none text-sm" rows={3} placeholder="Share your experience..." />
            </div>
            <Button onClick={submitReview} disabled={submittingReview}
              className="w-full h-11 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white border-none">
              {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

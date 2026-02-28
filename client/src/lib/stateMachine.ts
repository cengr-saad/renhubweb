export type RequestStatus =
    | 'PENDING'
    | 'ACCEPTED'
    | 'HANDOVER_PENDING'
    | 'LIVE'
    | 'RETURN_PENDING'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'REJECTED'
    | 'WITHDRAWN'
    | 'DISPUTED';

export type Action =
    | 'withdraw'
    | 'edit'
    | 'accept'
    | 'reject'
    | 'cancel'
    | 'submit_handover'
    | 'approve_handover'
    | 'reject_handover'
    | 'request_return'
    | 'approve_return'
    | 'reject_return'
    | 'dispute'
    | 'auto_complete';

export type Role = 'renter' | 'owner';

interface Transition {
    from: RequestStatus;
    to: RequestStatus;
    action: Action;
    allowedBy: Role[];
    requiresData?: string[];
}

export const STATE_TRANSITIONS: Transition[] = [
    { from: 'PENDING', to: 'WITHDRAWN', action: 'withdraw', allowedBy: ['renter'] },
    { from: 'PENDING', to: 'PENDING', action: 'edit', allowedBy: ['renter'] },
    { from: 'PENDING', to: 'ACCEPTED', action: 'accept', allowedBy: ['owner'] },
    { from: 'PENDING', to: 'REJECTED', action: 'reject', allowedBy: ['owner'] },

    { from: 'ACCEPTED', to: 'CANCELLED', action: 'cancel', allowedBy: ['renter', 'owner'] },
    { from: 'ACCEPTED', to: 'HANDOVER_PENDING', action: 'submit_handover', allowedBy: ['renter'] },

    { from: 'HANDOVER_PENDING', to: 'LIVE', action: 'approve_handover', allowedBy: ['owner'] },
    { from: 'HANDOVER_PENDING', to: 'ACCEPTED', action: 'reject_handover', allowedBy: ['owner'] },

    { from: 'LIVE', to: 'RETURN_PENDING', action: 'request_return', allowedBy: ['renter'] },
    { from: 'LIVE', to: 'COMPLETED', action: 'approve_return', allowedBy: ['owner'] },

    { from: 'RETURN_PENDING', to: 'COMPLETED', action: 'approve_return', allowedBy: ['owner'] },
    { from: 'RETURN_PENDING', to: 'LIVE', action: 'reject_return', allowedBy: ['owner'] },
    { from: 'RETURN_PENDING', to: 'COMPLETED', action: 'auto_complete', allowedBy: [] },
];

export function getAvailableActions(
    currentStatus: RequestStatus,
    role: Role,
    returnRequestedBy?: string | null,
    userId?: string
): Action[] {
    return STATE_TRANSITIONS
        .filter(t => t.from === currentStatus && t.allowedBy.includes(role))
        .filter(t => {
            if (t.action === 'approve_return' && returnRequestedBy === userId) return false;
            return true;
        })
        .map(t => t.action);
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
    PENDING: 'Pending Approval',
    ACCEPTED: 'Awaiting Handover',
    HANDOVER_PENDING: 'Payment Submitted',
    LIVE: 'Active Rental',
    RETURN_PENDING: 'Check Out Requested',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
    DISPUTED: 'Disputed',
};

export const STATUS_COLORS: Record<RequestStatus, { bg: string; text: string; border: string }> = {
    PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    ACCEPTED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    HANDOVER_PENDING: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    LIVE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    RETURN_PENDING: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    CANCELLED: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
    REJECTED: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    WITHDRAWN: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
    DISPUTED: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export const REASON_OPTIONS: Record<string, string[]> = {
    withdraw: [
        'Found a better deal',
        'Plans changed',
        'Entered wrong dates',
        'Item no longer needed',
        'Shipping/Pickup issue',
        'Other',
    ],
    reject: [
        'Item currently unavailable',
        'Location too far',
        'Safety/Trust concerns',
        'Price mismatch',
        'Too short/long duration',
        'Other',
    ],
    reject_handover: [
        'Incorrect amount paid',
        'Transaction ID invalid',
        'Security deposit missing',
        'Identity verification failed',
        'Other',
    ],
    cancel: [
        'Personal emergency',
        'Schedule conflict',
        'Found alternative',
        'Item broken/missing',
        'Other',
    ],
    reject_return: [
        'Item damaged',
        'Parts missing',
        'Incorrect item returned',
        'Late return fee required',
        'Other',
    ],
    dispute: [
        'Item damaged',
        'Payment not received',
        'Communication issues',
        'Terms of service violation',
        'Late return',
        'Other',
    ],
};

export const ACTION_LABELS: Record<Action, string> = {
    withdraw: 'Withdraw Request',
    edit: 'Edit Request',
    accept: 'Accept Request',
    reject: 'Reject Request',
    cancel: 'Cancel Rental',
    submit_handover: 'Submit Payment',
    approve_handover: 'Approve Handover',
    reject_handover: 'Reject Handover',
    request_return: 'Request Check Out',
    approve_return: 'Approve Return',
    reject_return: 'Reject Return',
    dispute: 'Raise Dispute',
    auto_complete: 'Auto Complete',
};

export const ACTION_COLORS: Record<string, string> = {
    accept: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    approve_handover: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    approve_return: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    submit_handover: 'bg-blue-500 hover:bg-blue-600 text-white',
    request_return: 'bg-blue-500 hover:bg-blue-600 text-white',
    reject: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    reject_handover: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    reject_return: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    cancel: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    withdraw: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    dispute: 'bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200',
    edit: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
};

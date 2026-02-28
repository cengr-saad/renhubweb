import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Search, MessageCircle, Loader2 } from "lucide-react";

export default function InboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.id) fetchConversations();
  }, [user?.id]);

  const fetchConversations = async () => {
    if (!supabase || !user?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("conversations")
        .select(`
          *,
          listing:listing_id(id, title, images),
          user1:user1_id(id, full_name, avatar_url),
          user2:user2_id(id, full_name, avatar_url),
          messages(content, created_at, sender_id)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      setConversations(data || []);
    } finally {
      setLoading(false);
    }
  };

  const getPartner = (conv: any) => {
    return conv.user1?.id === user?.id ? conv.user2 : conv.user1;
  };

  const getLastMessage = (conv: any) => {
    if (!conv.messages?.length) return "No messages yet";
    const sorted = [...conv.messages].sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted[0]?.content || "No messages yet";
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const filtered = conversations.filter((conv) => {
    const partner = getPartner(conv);
    return partner?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-1">Messages</h1>
          <p className="text-gray-400 text-sm">Your conversations with renters and owners</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-11 h-11 rounded-xl bg-white border-gray-200 text-sm"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100">
            <MessageCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg mb-2">No conversations yet</p>
            <p className="text-gray-400 text-sm">Start by browsing listings and sending a rental request</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {filtered.map((conv) => {
              const partner = getPartner(conv);
              const lastMsg = getLastMessage(conv);
              const lastMsgTime = conv.messages?.length
                ? [...conv.messages].sort((a: any, b: any) =>
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0]?.created_at
                : conv.updated_at;

              return (
                <Link key={conv.id} href={`/chat/${conv.id}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarImage src={partner?.avatar_url || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
                        {partner?.full_name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-bold text-gray-900 text-sm truncate">{partner?.full_name || "Unknown"}</p>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {lastMsgTime ? getTimeAgo(lastMsgTime) : ""}
                        </span>
                      </div>
                      {conv.listing && (
                        <p className="text-[10px] text-emerald-600 font-semibold mb-0.5 truncate">
                          📦 {conv.listing.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 truncate">{lastMsg}</p>
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

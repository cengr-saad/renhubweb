import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId && user?.id) {
      fetchConversation();
      fetchMessages();
      subscribeToMessages();
    }
  }, [conversationId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversation = async () => {
    if (!supabase || !conversationId) return;
    const { data } = await supabase
      .from("conversations")
      .select(`
        *,
        listing:listing_id(id, title, images),
        user1:user1_id(id, full_name, avatar_url),
        user2:user2_id(id, full_name, avatar_url)
      `)
      .eq("id", conversationId)
      .single();
    setConversation(data);
  };

  const fetchMessages = async () => {
    if (!supabase || !conversationId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:sender_id(id, full_name, avatar_url)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setMessages(data || []);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!supabase || !conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();
    return () => { supabase?.removeChannel(channel); };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !user?.id || !conversationId) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");
    try {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      });
      // Update conversation updated_at
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    } finally {
      setSending(false);
    }
  };

  const partner = conversation
    ? (conversation.user1?.id === user?.id ? conversation.user2 : conversation.user1)
    : null;

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Chat Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-16 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/inbox">
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
          </Link>
          <Avatar className="h-10 w-10">
            <AvatarImage src={partner?.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold text-sm">
              {partner?.full_name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">{partner?.full_name || "Chat"}</p>
            {conversation?.listing && (
              <p className="text-xs text-emerald-600 font-medium truncate">
                📦 {conversation.listing.title}
              </p>
            )}
          </div>
          {conversation?.listing && (
            <Link href={`/listing/${conversation.listing.id}`}>
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Package className="h-4 w-4 text-gray-400" />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Send the first message!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === user?.id;
              const showAvatar = !isMe && (i === 0 || messages[i - 1]?.sender_id !== msg.sender_id);
              return (
                <div key={msg.id || i} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                  {!isMe && (
                    <div className="w-7 shrink-0">
                      {showAvatar && (
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={msg.sender?.avatar_url || ""} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold">
                            {msg.sender?.full_name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}
                  <div className={cn("max-w-xs sm:max-w-sm", isMe ? "items-end" : "items-start", "flex flex-col gap-0.5")}>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                      isMe
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-md"
                        : "bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-md"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 px-1">
                      {msg.created_at ? formatTime(msg.created_at) : ""}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-100 shadow-sm sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-11 rounded-xl bg-gray-50 border-gray-200 text-sm"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="h-11 w-11 p-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-md shadow-emerald-500/20"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

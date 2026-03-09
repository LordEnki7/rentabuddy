import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { useSearch } from "wouter";

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const threadFromUrl = urlParams.get("thread");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(threadFromUrl);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (threadFromUrl) {
      setSelectedThreadId(threadFromUrl);
    }
  }, [threadFromUrl]);

  const { data: threadsData } = useQuery({
    queryKey: ["messageThreads"],
    queryFn: () => api.getMessageThreads(),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const { data: messagesData } = useQuery({
    queryKey: ["messages", selectedThreadId],
    queryFn: () => api.getMessages(selectedThreadId!),
    enabled: !!selectedThreadId,
    refetchInterval: 3000,
  });

  const threads = threadsData?.threads || [];
  const messages = messagesData?.messages || [];

  const selectedThread = threads.find((t: any) => t.id === selectedThreadId);

  const getOtherPersonName = (thread: any) => {
    if (!user) return "Unknown";
    return user.id === thread.clientId ? thread.buddyName : thread.clientName;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      api.createMessage(threadId, content),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedThreadId] });
      queryClient.invalidateQueries({ queryKey: ["messageThreads"] });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || !messageText.trim()) return;
    sendMutation.mutate({ threadId: selectedThreadId, content: messageText.trim() });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground" data-testid="text-login-prompt">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8" data-testid="heading-messages">Messages</h1>

      <div className="grid md:grid-cols-4 gap-6">
        <div className={`md:col-span-1 ${selectedThreadId ? "hidden md:block" : ""}`}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {threads.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground" data-testid="text-no-conversations">
                    No conversations yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start a conversation from a buddy's profile
                  </p>
                </div>
              ) : (
                threads.map((thread: any) => {
                  const otherName = getOtherPersonName(thread);
                  return (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`w-full text-left p-3 rounded-lg border transition flex items-center gap-3 ${
                        selectedThreadId === thread.id
                          ? "bg-primary/10 border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`button-thread-${thread.id}`}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/20">
                          {getInitials(otherName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate" data-testid={`text-thread-name-${thread.id}`}>
                          {otherName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate" data-testid={`text-thread-preview-${thread.id}`}>
                          {thread.lastMessage || "No messages yet"}
                        </div>
                        {thread.lastMessageAt && (
                          <div className="text-xs text-muted-foreground/60 mt-0.5">
                            {new Date(thread.lastMessageAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className={`md:col-span-3 ${!selectedThreadId ? "hidden md:block" : ""}`}>
          {selectedThreadId && selectedThread ? (
            <Card className="flex flex-col h-[600px]" data-testid="card-message-thread">
              <CardHeader className="border-b flex-row items-center gap-3 space-y-0 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0"
                  onClick={() => setSelectedThreadId(null)}
                  data-testid="button-back-threads"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/20">
                    {getInitials(getOtherPersonName(selectedThread))}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-base" data-testid="text-chat-name">
                  {getOtherPersonName(selectedThread)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 p-4" data-testid="div-messages">
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground" data-testid="text-no-messages">
                      No messages yet. Say hello!
                    </p>
                  </div>
                )}
                {messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                        msg.senderId === user.id
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-xs opacity-60 block mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={sendMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageText.trim() || sendMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="text-select-conversation">
                  Select a conversation to get started
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

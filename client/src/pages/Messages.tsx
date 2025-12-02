import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: threadsData } = useQuery({
    queryKey: ["messageThreads"],
    queryFn: () => api.getMessageThreads(),
    enabled: !!user,
  });

  const { data: messagesData } = useQuery({
    queryKey: ["messages", selectedThreadId],
    queryFn: () => api.getMessages(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  const threads = threadsData?.threads || [];
  const messages = messagesData?.messages || [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || !messageText.trim()) return;

    try {
      await api.createMessage(selectedThreadId, messageText);
      setMessageText("");
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 mb-16 md:mb-0">
      <h1 className="text-3xl font-bold mb-8" data-testid="heading-messages">Messages</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Threads List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {threads.length === 0 ? (
                <p className="text-sm text-muted-foreground" data-testid="text-no-conversations">
                  No conversations yet
                </p>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedThreadId === thread.id
                        ? "bg-primary/10 border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`button-thread-${thread.id}`}
                  >
                    <div className="font-medium text-sm line-clamp-1">
                      {thread.lastMessage || "New conversation"}
                    </div>
                    {thread.lastMessageAt && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(thread.lastMessageAt).toLocaleDateString()}
                      </div>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages View */}
        <div className="md:col-span-3">
          {selectedThreadId ? (
            <Card className="flex flex-col h-[600px]" data-testid="card-message-thread">
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4" data-testid="div-messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === user.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-xs opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    data-testid="input-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
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
                <p className="text-muted-foreground">
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

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { CalendarDays, MessageSquare, Clock, MapPin, Phone, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: bookingsData } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => api.getBookings(),
    enabled: !!user,
  });

  const { data: threadsData } = useQuery({
    queryKey: ["messageThreads"],
    queryFn: () => api.getMessageThreads(),
    enabled: !!user,
  });

  const bookings = bookingsData?.bookings || [];
  const threads = threadsData?.threads || [];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Please log in to view your dashboard</p>
      </div>
    );
  }

  const upcomingBookings = bookings.filter(
    (b: any) => b.status === "CONFIRMED" && new Date(b.startTime) > new Date()
  );
  const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED");
  const totalEarnings = user.role === "BUDDY" 
    ? completedBookings.reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice || 0), 0)
    : completedBookings.reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-md">
            <AvatarImage src="https://i.pravatar.cc/150?u={user.id}" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-heading font-bold" data-testid="heading-dashboard">
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground">
              {user.role === "BUDDY" ? "Buddy Account" : "Client Account"} • Active
            </p>
          </div>
        </div>
        <Button onClick={() => setLocation("/buddies")} data-testid="button-find-buddy">
          Find a New Buddy
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card data-testid="card-stat-bookings">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Upcoming Bookings</p>
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-completed">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedBookings.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-messages">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">{threads.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600/50" />
            </div>
          </CardContent>
        </Card>

        {user.role === "BUDDY" && (
          <Card data-testid="card-stat-earnings">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-600/50" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="w-full md:w-auto mb-6 bg-transparent p-0 border-b border-border rounded-none h-auto justify-start space-x-6">
          <TabsTrigger 
            value="bookings" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
            data-testid="tab-bookings"
          >
            My Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
            data-testid="tab-messages"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
            data-testid="tab-settings"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          {bookings.length === 0 ? (
            <Card data-testid="card-no-bookings">
              <CardContent className="p-12 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">Get started by browsing or creating bookings!</p>
                <Button onClick={() => setLocation("/buddies")}>Browse Buddies</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking: any) => (
                <Card key={booking.id} className="overflow-hidden" data-testid={`card-booking-${booking.id}`}>
                  <div className="flex flex-col md:flex-row">
                    <div
                      className={`w-full md:w-2 ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-500"
                          : booking.status === "COMPLETED"
                          ? "bg-blue-500"
                          : "bg-muted"
                      }`}
                    ></div>
                    <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              booking.status === "CONFIRMED"
                                ? "default"
                                : booking.status === "COMPLETED"
                                ? "secondary"
                                : "outline"
                            }
                            data-testid={`badge-status-${booking.status}`}
                          >
                            {booking.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">#{booking.id}</span>
                        </div>
                        <h3 className="text-lg font-bold font-heading" data-testid={`text-booking-activity-${booking.id}`}>
                          {booking.activity || "Buddies Session"}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                          <div className="flex items-center gap-1" data-testid={`text-booking-date-${booking.id}`}>
                            <CalendarDays className="h-4 w-4" />
                            {new Date(booking.startTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1" data-testid={`text-booking-time-${booking.id}`}>
                            <Clock className="h-4 w-4" />
                            {new Date(booking.startTime).toLocaleTimeString()}
                          </div>
                          {booking.locationType && (
                            <div className="flex items-center gap-1" data-testid={`text-booking-location-${booking.id}`}>
                              <MapPin className="h-4 w-4" />
                              {booking.locationType === "VIRTUAL" ? "Virtual" : booking.locationDescription || "Public Place"}
                            </div>
                          )}
                        </div>
                        {booking.totalPrice && (
                          <div className="text-sm font-semibold text-primary pt-2" data-testid={`text-booking-price-${booking.id}`}>
                            ${parseFloat(booking.totalPrice).toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="outline" data-testid={`button-details-${booking.id}`}>
                          View Details
                        </Button>
                        <Button
                          disabled={booking.status !== "CONFIRMED"}
                          data-testid={`button-message-${booking.id}`}
                          variant="secondary"
                          size="icon"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" data-testid="tab-content-messages">
          {threads.length === 0 ? (
            <Card data-testid="card-no-messages">
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                <p className="text-muted-foreground">Start a conversation with a buddy to get messages.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {threads.map((thread: any) => (
                <Card key={thread.id} className="p-4 cursor-pointer hover:border-primary transition" data-testid={`card-thread-${thread.id}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold" data-testid={`text-thread-message-${thread.id}`}>
                        {thread.lastMessage || "New conversation"}
                      </p>
                      {thread.lastMessageAt && (
                        <p className="text-sm text-muted-foreground" data-testid={`text-thread-date-${thread.id}`}>
                          {new Date(thread.lastMessageAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card data-testid="card-settings">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" defaultValue={user?.name} data-testid="input-name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  defaultValue={user?.email}
                  disabled
                  data-testid="input-email"
                />
              </div>

              {user?.role === "BUDDY" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate ($)</Label>
                    <Input id="rate" type="number" placeholder="25" data-testid="input-rate" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea
                      id="bio"
                      placeholder="Tell clients about yourself..."
                      className="w-full p-2 border rounded-md"
                      data-testid="textarea-bio"
                    />
                  </div>
                </>
              )}

              <Button data-testid="button-save-settings">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

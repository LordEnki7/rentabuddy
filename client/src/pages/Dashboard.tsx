import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_BOOKINGS } from "@/lib/mockData";
import { CalendarDays, MessageSquare, Clock, MapPin } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-md">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-heading font-bold">Welcome back, John!</h1>
            <p className="text-muted-foreground">Client Account • Active</p>
          </div>
        </div>
        <Button>Find a New Buddy</Button>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="w-full md:w-auto mb-6 bg-transparent p-0 border-b border-border rounded-none h-auto justify-start space-x-6">
          <TabsTrigger 
            value="bookings" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
          >
            My Bookings
          </TabsTrigger>
          <TabsTrigger 
            value="messages" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <div className="grid gap-4">
            {MOCK_BOOKINGS.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className={`w-full md:w-2 bg-primary/10 ${booking.status === 'CONFIRMED' ? 'bg-primary' : 'bg-muted'}`}></div>
                  <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">#{booking.id}</span>
                      </div>
                      <h3 className="text-lg font-bold font-heading">Session with {booking.buddyName}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {booking.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {booking.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.location}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                      <Button variant="outline" className="flex-1 md:flex-none">View Details</Button>
                      <Button className="flex-1 md:flex-none" disabled={booking.status !== 'CONFIRMED'}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No new messages</h3>
              <p className="text-muted-foreground">Your conversations with buddies will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account preferences and safety settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Display Name</Label>
                <Input defaultValue="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input defaultValue="john@example.com" />
              </div>
              <div className="pt-4">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

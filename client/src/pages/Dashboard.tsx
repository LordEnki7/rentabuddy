import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
  CalendarDays, MessageSquare, Clock, MapPin, DollarSign, TrendingUp,
  Camera, Loader2, Star, CheckCircle, Shield, AlertTriangle, Check, X,
  BarChart3, Award, Users, Activity, ShieldAlert
} from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { SafetyReportDialog } from "@/components/SafetyReportDialog";

export default function Dashboard() {
  const { user, profile, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; booking: any | null }>({ open: false, booking: null });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showSafetyReport, setShowSafetyReport] = useState(false);

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

  const { data: safetyReportsData } = useQuery({
    queryKey: ["mySafetyReports"],
    queryFn: () => api.getMySafetyReports(),
    enabled: !!user,
  });

  const safetyReports = safetyReportsData?.reports || [];
  const bookings = bookingsData?.bookings || [];
  const threads = threadsData?.threads || [];
  const profileImage = (profile as any)?.profileImage;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please select an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Image must be less than 5MB." });
      return;
    }
    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        if (user?.role === "BUDDY") {
          await api.updateBuddyProfile({ profileImage: base64 });
        } else {
          await api.updateClientProfile({ profileImage: base64 });
        }
        await refetch();
        toast({ title: "Profile updated!", description: "Your profile image has been updated." });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({ variant: "destructive", title: "Upload failed", description: "Failed to update profile image." });
      setUploadingImage(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    setUpdatingStatus(bookingId);
    try {
      await api.updateBookingStatus(bookingId, status);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({ title: "Booking updated", description: `Booking has been ${status.toLowerCase()}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update failed", description: error.message || "Failed to update booking." });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewDialog.booking) return;
    setSubmittingReview(true);
    try {
      await api.createReview({
        bookingId: reviewDialog.booking.id,
        buddyId: reviewDialog.booking.buddyId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setReviewDialog({ open: false, booking: null });
      setReviewForm({ rating: 5, comment: "" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Review failed", description: error.message || "Failed to submit review." });
    } finally {
      setSubmittingReview(false);
    }
  };

  const isBuddyProfileIncomplete = user?.role === "BUDDY" && profile &&
    (!(profile as any).headline || !(profile as any).bio || !(profile as any).hourlyRate);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Please log in to view your dashboard</p>
      </div>
    );
  }

  if (isBuddyProfileIncomplete) {
    window.location.href = "/buddy-onboarding";
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Redirecting to complete your profile...</p>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b: any) => b.status === "PENDING");
  const upcomingBookings = bookings.filter(
    (b: any) => b.status === "CONFIRMED" && new Date(b.startTime) > new Date()
  );
  const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED");
  const canceledBookings = bookings.filter((b: any) => b.status === "CANCELED" || b.status === "REJECTED");
  const totalEarnings = completedBookings.reduce((sum: number, b: any) => sum + parseFloat(b.totalPrice || 0), 0);
  const completionRate = bookings.length > 0
    ? Math.round((completedBookings.length / (completedBookings.length + canceledBookings.length || 1)) * 100)
    : 0;

  const buddyProfile = profile as any;

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
        data-testid="input-profile-image"
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-16 w-16 border-2 border-white shadow-md">
              <AvatarImage src={profileImage || undefined} />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              data-testid="button-upload-image"
            >
              {uploadingImage ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold" data-testid="heading-dashboard">
              Welcome back, {user.name}!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.role === "BUDDY" ? "default" : "secondary"} data-testid="badge-role">
                {user.role === "BUDDY" ? "Buddy" : "Client"}
              </Badge>
              {user.role === "BUDDY" && buddyProfile?.identityVerified && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50" data-testid="badge-verified">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {user.role === "CLIENT" && (
            <Button onClick={() => setLocation("/buddies")} data-testid="button-find-buddy">
              Find a Buddy
            </Button>
          )}
          <Button variant="outline" onClick={() => setLocation("/messages")} data-testid="button-go-messages">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {user.role === "BUDDY" ? (
          <>
            <Card data-testid="card-stat-pending">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Pending Requests</p>
                    <p className="text-2xl font-bold">{pendingBookings.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-upcoming">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                  </div>
                  <CalendarDays className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-earnings">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600/50" />
                </div>
              </CardContent>
            </Card>
            <Card data-testid="card-stat-rating">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-bold">
                        {parseFloat(buddyProfile?.ratingAverage || "0").toFixed(1)}
                      </p>
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    </div>
                  </div>
                  <Award className="h-8 w-8 text-yellow-500/50" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {buddyProfile?.ratingCount || 0} reviews
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card data-testid="card-stat-upcoming">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
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
            <Card data-testid="card-stat-pending">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{pendingBookings.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Buddy Verification Progress */}
      {user.role === "BUDDY" && (
        <Card className="mb-8" data-testid="card-verification-progress">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Trust & Verification
            </CardTitle>
            <CardDescription>Complete these steps to increase your visibility and earn client trust</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${buddyProfile?.identityVerified ? 'bg-green-50 border-green-200' : 'bg-muted/30'}`}>
                <div className={`rounded-full p-1.5 ${buddyProfile?.identityVerified ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {buddyProfile?.identityVerified ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Identity Verified</p>
                  <p className="text-xs text-muted-foreground">
                    {buddyProfile?.identityVerified ? "Completed" : "Submit ID for verification"}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${buddyProfile?.backgroundCheckPassed ? 'bg-green-50 border-green-200' : 'bg-muted/30'}`}>
                <div className={`rounded-full p-1.5 ${buddyProfile?.backgroundCheckPassed ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {buddyProfile?.backgroundCheckPassed ? <CheckCircle className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Background Check</p>
                  <p className="text-xs text-muted-foreground">
                    {buddyProfile?.backgroundCheckPassed ? "Passed" : "Request background check"}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${buddyProfile?.isCertified ? 'bg-green-50 border-green-200' : 'bg-muted/30'}`}>
                <div className={`rounded-full p-1.5 ${buddyProfile?.isCertified ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                  {buddyProfile?.isCertified ? <Award className="h-5 w-5" /> : <Award className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Certified Buddy</p>
                  <p className="text-xs text-muted-foreground">
                    {buddyProfile?.isCertified ? "Certified" : "Complete training program"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Trust Score</span>
                <span>{[buddyProfile?.identityVerified, buddyProfile?.backgroundCheckPassed, buddyProfile?.isCertified].filter(Boolean).length}/3</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${([buddyProfile?.identityVerified, buddyProfile?.backgroundCheckPassed, buddyProfile?.isCertified].filter(Boolean).length / 3) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Requests for Buddies */}
      {user.role === "BUDDY" && pendingBookings.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50/30" data-testid="card-pending-requests">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-600" />
              Incoming Booking Requests ({pendingBookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBookings.map((booking: any) => (
              <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 bg-white rounded-lg border" data-testid={`card-pending-${booking.id}`}>
                <div className="space-y-1">
                  <p className="font-medium">{booking.activity || "Buddy Session"}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(booking.startTime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.locationType === "VIRTUAL" ? "Virtual" : booking.locationDescription || "Public Place"}
                    </span>
                  </div>
                  {booking.clientNotes && (
                    <p className="text-sm text-muted-foreground italic">"{booking.clientNotes}"</p>
                  )}
                  {booking.totalPrice && (
                    <p className="text-sm font-semibold text-primary">${parseFloat(booking.totalPrice).toFixed(2)}</p>
                  )}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                    disabled={updatingStatus === booking.id}
                    data-testid={`button-accept-${booking.id}`}
                  >
                    {updatingStatus === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(booking.id, "REJECTED")}
                    disabled={updatingStatus === booking.id}
                    data-testid={`button-reject-${booking.id}`}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="w-full md:w-auto mb-6 bg-transparent p-0 border-b border-border rounded-none h-auto justify-start space-x-6">
          <TabsTrigger
            value="bookings"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
            data-testid="tab-bookings"
          >
            All Bookings
          </TabsTrigger>
          {user.role === "BUDDY" && (
            <TabsTrigger
              value="performance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
              data-testid="tab-performance"
            >
              Performance
            </TabsTrigger>
          )}
          <TabsTrigger
            value="safety"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base"
            data-testid="tab-safety"
          >
            Safety
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
        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card data-testid="card-no-bookings">
              <CardContent className="p-12 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">
                  {user.role === "CLIENT" ? "Browse buddies and book your first session!" : "Your booking requests will appear here."}
                </p>
                {user.role === "CLIENT" && (
                  <Button onClick={() => setLocation("/buddies")}>Browse Buddies</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking: any) => (
                <Card key={booking.id} className="overflow-hidden" data-testid={`card-booking-${booking.id}`}>
                  <div className="flex">
                    <div
                      className={`w-1.5 shrink-0 ${
                        booking.status === "CONFIRMED" ? "bg-green-500"
                          : booking.status === "COMPLETED" ? "bg-blue-500"
                          : booking.status === "PENDING" ? "bg-amber-500"
                          : booking.status === "CANCELED" || booking.status === "REJECTED" ? "bg-red-400"
                          : "bg-muted"
                      }`}
                    />
                    <div className="p-5 flex-1">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                booking.status === "CONFIRMED" ? "default"
                                  : booking.status === "COMPLETED" ? "secondary"
                                  : booking.status === "PENDING" ? "outline"
                                  : "destructive"
                              }
                              data-testid={`badge-status-${booking.id}`}
                            >
                              {booking.status}
                            </Badge>
                            <h3 className="font-semibold" data-testid={`text-booking-activity-${booking.id}`}>
                              {booking.activity || "Buddy Session"}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1" data-testid={`text-booking-date-${booking.id}`}>
                              <CalendarDays className="h-3.5 w-3.5" />
                              {new Date(booking.startTime).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1" data-testid={`text-booking-time-${booking.id}`}>
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {" - "}
                              {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {booking.locationType === "VIRTUAL" ? "Virtual" : booking.locationDescription || "Public Place"}
                            </span>
                          </div>
                          {booking.totalPrice && (
                            <p className="text-sm font-semibold text-primary" data-testid={`text-booking-price-${booking.id}`}>
                              ${parseFloat(booking.totalPrice).toFixed(2)}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 w-full md:w-auto flex-wrap">
                          {/* Buddy actions */}
                          {user.role === "BUDDY" && booking.status === "CONFIRMED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                              disabled={updatingStatus === booking.id}
                              data-testid={`button-complete-${booking.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark Complete
                            </Button>
                          )}

                          {/* Client actions */}
                          {user.role === "CLIENT" && booking.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(booking.id, "CANCELED")}
                              disabled={updatingStatus === booking.id}
                              data-testid={`button-cancel-${booking.id}`}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}

                          {/* Leave review for completed bookings (client only) */}
                          {user.role === "CLIENT" && booking.status === "COMPLETED" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setReviewForm({ rating: 5, comment: "" });
                                setReviewDialog({ open: true, booking });
                              }}
                              data-testid={`button-review-${booking.id}`}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Leave Review
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className={`flex items-center gap-0.5 ${booking.status !== "CANCELED" && booking.status !== "REJECTED" ? "text-green-600 font-medium" : ""}`}>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Requested
                          </span>
                          <div className="w-4 h-px bg-border" />
                          <span className={`flex items-center gap-0.5 ${["CONFIRMED", "COMPLETED"].includes(booking.status) ? "text-green-600 font-medium" : ""}`}>
                            <div className={`w-2 h-2 rounded-full ${["CONFIRMED", "COMPLETED"].includes(booking.status) ? "bg-green-500" : "bg-muted"}`} />
                            Confirmed
                          </span>
                          <div className="w-4 h-px bg-border" />
                          <span className={`flex items-center gap-0.5 ${booking.status === "COMPLETED" ? "text-green-600 font-medium" : ""}`}>
                            <div className={`w-2 h-2 rounded-full ${booking.status === "COMPLETED" ? "bg-green-500" : "bg-muted"}`} />
                            Completed
                          </span>
                          {(booking.status === "CANCELED" || booking.status === "REJECTED") && (
                            <>
                              <div className="w-4 h-px bg-border" />
                              <span className="flex items-center gap-0.5 text-red-500 font-medium">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                {booking.status === "CANCELED" ? "Canceled" : "Declined"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Performance Tab (Buddy Only) */}
        {user.role === "BUDDY" && (
          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card data-testid="card-performance-overview">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${completionRate}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Sessions</span>
                    <span className="font-semibold">{completedBookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Earnings</span>
                    <span className="font-semibold text-green-600">${totalEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{parseFloat(buddyProfile?.ratingAverage || "0").toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({buddyProfile?.ratingCount || 0})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="card-booking-breakdown">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Booking Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-amber-50">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Pending
                    </span>
                    <span className="font-semibold">{pendingBookings.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-green-50">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Confirmed
                    </span>
                    <span className="font-semibold">{upcomingBookings.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-blue-50">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Completed
                    </span>
                    <span className="font-semibold">{completedBookings.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-red-50">
                    <span className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      Canceled/Declined
                    </span>
                    <span className="font-semibold">{canceledBookings.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Log */}
            <Card data-testid="card-activity-log">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Your latest booking activity and updates</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 10).map((booking: any) => (
                      <div key={booking.id} className="flex items-start gap-3 text-sm" data-testid={`activity-${booking.id}`}>
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                          booking.status === "COMPLETED" ? "bg-blue-500"
                            : booking.status === "CONFIRMED" ? "bg-green-500"
                            : booking.status === "PENDING" ? "bg-amber-500"
                            : "bg-red-400"
                        }`} />
                        <div className="flex-1">
                          <p>
                            <span className="font-medium">{booking.activity || "Session"}</span>
                            {" — "}
                            <span className={`font-medium ${
                              booking.status === "COMPLETED" ? "text-blue-600"
                                : booking.status === "CONFIRMED" ? "text-green-600"
                                : booking.status === "PENDING" ? "text-amber-600"
                                : "text-red-500"
                            }`}>{booking.status}</span>
                          </p>
                          <p className="text-muted-foreground">
                            {new Date(booking.createdAt || booking.startTime).toLocaleDateString()} • {booking.totalPrice ? `$${parseFloat(booking.totalPrice).toFixed(2)}` : "Price TBD"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Safety Tab */}
        <TabsContent value="safety" className="space-y-6" data-testid="tab-content-safety">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  Safety Center
                </CardTitle>
                <CardDescription>Report issues and track your safety reports</CardDescription>
              </div>
              <Button onClick={() => setShowSafetyReport(true)} data-testid="button-new-safety-report">
                Report an Issue
              </Button>
            </CardHeader>
            <CardContent>
              {safetyReports.length === 0 ? (
                <div className="text-center py-12" data-testid="card-no-reports">
                  <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reports filed</h3>
                  <p className="text-muted-foreground mb-4">
                    If you experience any safety concerns, you can file a report here or from any booking or call.
                  </p>
                  <Button variant="outline" onClick={() => setShowSafetyReport(true)} data-testid="button-file-first-report">
                    File a Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {safetyReports.map((report: any) => (
                    <div
                      key={report.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                      data-testid={`card-report-${report.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm capitalize">
                            {report.category.replace(/_/g, " ")}
                          </span>
                          <Badge
                            variant={
                              report.status === "OPEN"
                                ? "destructive"
                                : report.status === "INVESTIGATING"
                                ? "default"
                                : "secondary"
                            }
                            data-testid={`badge-report-status-${report.id}`}
                          >
                            {report.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-report-desc-${report.id}`}>
                          {report.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Filed on {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card data-testid="card-settings">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-muted">
                      <AvatarImage src={profileImage || undefined} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      data-testid="button-settings-upload-image"
                    >
                      {uploadingImage ? <Loader2 className="h-8 w-8 text-white animate-spin" /> : <Camera className="h-8 w-8 text-white" />}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} data-testid="button-change-photo">
                      {uploadingImage ? "Uploading..." : "Change Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" defaultValue={user?.name} data-testid="input-name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" defaultValue={user?.email} disabled data-testid="input-email" />
              </div>
              {user?.role === "BUDDY" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate ($)</Label>
                    <Input id="rate" type="number" placeholder="25" defaultValue={buddyProfile?.hourlyRate} data-testid="input-rate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input id="headline" placeholder="Your tagline..." defaultValue={buddyProfile?.headline} data-testid="input-headline" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell clients about yourself..." defaultValue={buddyProfile?.bio} data-testid="textarea-bio" />
                  </div>
                </>
              )}
              <Button data-testid="button-save-settings">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, booking: open ? reviewDialog.booking : null })}>
        <DialogContent data-testid="dialog-review">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              How was your session? Your feedback helps other clients and helps buddies improve.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="focus:outline-none"
                    data-testid={`button-star-${star}`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= reviewForm.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {reviewForm.rating === 1 ? "Poor" : reviewForm.rating === 2 ? "Fair" : reviewForm.rating === 3 ? "Good" : reviewForm.rating === 4 ? "Great" : "Excellent"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Comment (optional)</Label>
              <Textarea
                id="review-comment"
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                data-testid="textarea-review-comment"
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmitReview}
              disabled={submittingReview}
              data-testid="button-submit-review"
            >
              {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SafetyReportDialog
        isOpen={showSafetyReport}
        onClose={() => setShowSafetyReport(false)}
      />
    </div>
  );
}

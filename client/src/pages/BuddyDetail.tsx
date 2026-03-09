import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Star, MapPin, MessageCircle, CheckCircle, Award, Clock, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function BuddyDetail() {
  const [, params] = useRoute("/buddy/:userId");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    startTime: "",
    endTime: "",
    activity: "",
    locationType: "PUBLIC",
    locationDescription: "",
    clientNotes: "",
  });

  const { data: buddyData, isLoading } = useQuery({
    queryKey: ["buddy", params?.userId],
    queryFn: () => api.getBuddyProfile(params!.userId),
    enabled: !!params?.userId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const { profile, user: buddyUser, reviews } = buddyData || {};

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Buddy not found</h2>
        <p className="text-muted-foreground mb-4">This profile may have been removed or is unavailable.</p>
        <Button onClick={() => setLocation("/buddies")}>Browse Buddies</Button>
      </div>
    );
  }

  const calculatePrice = () => {
    if (!bookingForm.startTime || !bookingForm.endTime || !profile.hourlyRate) return null;
    const start = new Date(bookingForm.startTime);
    const end = new Date(bookingForm.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (hours <= 0) return null;
    return (hours * parseFloat(profile.hourlyRate)).toFixed(2);
  };

  const estimatedPrice = calculatePrice();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "CLIENT") {
      toast({ variant: "destructive", title: "Login required", description: "You must be logged in as a client to book." });
      return;
    }

    const start = new Date(bookingForm.startTime);
    const end = new Date(bookingForm.endTime);
    if (end <= start) {
      toast({ variant: "destructive", title: "Invalid times", description: "End time must be after start time." });
      return;
    }
    if (start < new Date()) {
      toast({ variant: "destructive", title: "Invalid date", description: "Booking must be in the future." });
      return;
    }

    setSubmitting(true);
    try {
      await api.createBooking({
        buddyId: params!.userId,
        startTime: start,
        endTime: end,
        activity: bookingForm.activity,
        locationType: bookingForm.locationType,
        locationDescription: bookingForm.locationDescription,
        clientNotes: bookingForm.clientNotes,
        totalPrice: estimatedPrice,
      });
      toast({ title: "Booking request sent!", description: "The buddy will review your request and respond soon." });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Booking failed", description: err.message || "Failed to create booking." });
    } finally {
      setSubmitting(false);
    }
  };

  const rating = parseFloat(profile.ratingAverage || "0");
  const verificationCount = [profile.identityVerified, profile.backgroundCheckPassed, profile.isCertified].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Buddy Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card data-testid="card-buddy-profile">
            <CardContent className="pt-6">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={buddyUser?.name}
                  className="w-full aspect-square rounded-lg object-cover mb-4"
                  data-testid="img-buddy-photo"
                />
              ) : (
                <div className="w-full aspect-square rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-6xl font-heading text-primary/40">
                    {buddyUser?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}

              <h1 className="text-2xl font-bold mb-1" data-testid="text-buddy-name">
                {buddyUser?.name}
              </h1>

              {profile.headline && (
                <p className="text-muted-foreground mb-4" data-testid="text-buddy-headline">
                  {profile.headline}
                </p>
              )}

              <div className="space-y-3 mb-6">
                {profile.city && (
                  <div className="flex items-center gap-2 text-sm" data-testid="text-buddy-city">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-2" data-testid="text-buddy-rate">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold text-lg">${profile.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hr</span></span>
                </div>
                {rating > 0 && (
                  <div className="flex items-center gap-2" data-testid="text-buddy-rating">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "fill-current" : ""}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {rating.toFixed(1)} ({profile.ratingCount} reviews)
                    </span>
                  </div>
                )}
                {profile.experienceYears && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.experienceYears} years experience</span>
                  </div>
                )}
              </div>

              {/* Trust & Verification */}
              {verificationCount > 0 && (
                <div className="space-y-2 mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">Verified</p>
                  {profile.identityVerified && (
                    <div className="flex items-center gap-2 text-green-700" data-testid="badge-identity-verified">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Identity Verified</span>
                    </div>
                  )}
                  {profile.backgroundCheckPassed && (
                    <div className="flex items-center gap-2 text-green-700" data-testid="badge-background-check">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Background Check Passed</span>
                    </div>
                  )}
                  {profile.isCertified && (
                    <div className="flex items-center gap-2 text-green-700" data-testid="badge-certified">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-medium">Certified Buddy</span>
                    </div>
                  )}
                </div>
              )}

              {profile.activities && profile.activities.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2">Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.activities.map((activity: string) => (
                      <Badge key={activity} variant="secondary" data-testid={`badge-activity-${activity}`}>
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.languages && (profile.languages as string[]).length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {(profile.languages as string[]).map((lang: string) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {user && user.role === "CLIENT" && (
                <Button
                  className="w-full"
                  variant="outline"
                  data-testid="button-message"
                  onClick={async () => {
                    try {
                      const { thread } = await api.getOrCreateThread(params!.userId);
                      setLocation(`/messages?thread=${thread.id}`);
                    } catch (err: any) {
                      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to open conversation" });
                    }
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message {buddyUser?.name?.split(" ")[0]}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About {buddyUser?.name?.split(" ")[0]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed" data-testid="text-buddy-bio">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reviews</span>
                {reviews && reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "fill-current" : ""}`} />
                      ))}
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                      {rating.toFixed(1)} ({reviews.length})
                    </span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!reviews || reviews.length === 0) ? (
                <div className="text-center py-6">
                  <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No reviews yet. Be the first to book and review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0" data-testid={`review-${review.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : ""}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          {user && user.role === "CLIENT" && (
            <Card className="border-primary/20" data-testid="card-booking-form">
              <CardHeader>
                <CardTitle>Request a Booking</CardTitle>
                <CardDescription>
                  Fill in the details below to request a session with {buddyUser?.name?.split(" ")[0]}.
                  All meetings in public places are encouraged for safety.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="startTime">Start Date & Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={bookingForm.startTime}
                        onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                        data-testid="input-start-time"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endTime">End Date & Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={bookingForm.endTime}
                        onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                        data-testid="input-end-time"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="activity">Activity</Label>
                    {profile.activities && profile.activities.length > 0 ? (
                      <select
                        id="activity"
                        value={bookingForm.activity}
                        onChange={(e) => setBookingForm({ ...bookingForm, activity: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        data-testid="select-activity"
                        required
                      >
                        <option value="">Select an activity</option>
                        {profile.activities.map((act: string) => (
                          <option key={act} value={act}>{act}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <Input
                        id="activity"
                        placeholder="What would you like to do?"
                        value={bookingForm.activity}
                        onChange={(e) => setBookingForm({ ...bookingForm, activity: e.target.value })}
                        data-testid="input-activity"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="locationType">Location Type</Label>
                    <select
                      id="locationType"
                      value={bookingForm.locationType}
                      onChange={(e) => setBookingForm({ ...bookingForm, locationType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      data-testid="select-location-type"
                    >
                      <option value="PUBLIC">Public Place (Recommended)</option>
                      <option value="VIRTUAL">Virtual Meeting</option>
                    </select>
                  </div>

                  {bookingForm.locationType === "PUBLIC" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="location">Meeting Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., Central Park, Starbucks downtown..."
                        value={bookingForm.locationDescription}
                        onChange={(e) => setBookingForm({ ...bookingForm, locationDescription: e.target.value })}
                        data-testid="input-location"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any details or preferences for the session..."
                      value={bookingForm.clientNotes}
                      onChange={(e) => setBookingForm({ ...bookingForm, clientNotes: e.target.value })}
                      data-testid="textarea-notes"
                    />
                  </div>

                  {/* Price Estimate */}
                  {estimatedPrice && (
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10" data-testid="text-price-estimate">
                      <div>
                        <p className="text-sm font-medium">Estimated Total</p>
                        <p className="text-xs text-muted-foreground">
                          Based on ${profile.hourlyRate}/hr
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-primary">${estimatedPrice}</p>
                    </div>
                  )}

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
                    <div className="flex gap-2">
                      <Shield className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>For your safety, we recommend meeting in public places. All sessions are covered by our safety policies and code of conduct.</p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={submitting} data-testid="button-book-now">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {estimatedPrice ? `Request Booking - $${estimatedPrice}` : "Request Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Not logged in prompt */}
          {!user && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">Want to book {buddyUser?.name?.split(" ")[0]}?</h3>
                <p className="text-muted-foreground mb-4">Create an account or log in to request a booking.</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setLocation("/register")} data-testid="button-register-prompt">Sign Up</Button>
                  <Button variant="outline" onClick={() => setLocation("/login")} data-testid="button-login-prompt">Log In</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

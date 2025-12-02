import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, Star, MapPin, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "wouter";

export default function BuddyDetail() {
  const [, params] = useRoute("/buddy/:userId");
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
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
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  const { profile, user: buddyUser, reviews } = buddyData || {};

  if (!profile) {
    return <div className="container mx-auto px-4 py-12 text-center">Buddy not found</div>;
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "CLIENT") {
      alert("You must be logged in as a client to book");
      return;
    }

    try {
      const booking = {
        buddyId: params!.userId,
        startTime: new Date(bookingForm.startTime),
        endTime: new Date(bookingForm.endTime),
        activity: bookingForm.activity,
        locationType: bookingForm.locationType,
        locationDescription: bookingForm.locationDescription,
        clientNotes: bookingForm.clientNotes,
      };
      await api.createBooking(booking);
      alert("Booking request sent!");
      setLocation("/dashboard");
    } catch (err: any) {
      alert(err.message || "Failed to create booking");
    }
  };

  const rating = parseFloat(profile.ratingAverage || "0");

  return (
    <div className="container mx-auto px-4 py-12 mb-16 md:mb-0">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Buddy Info */}
        <div className="lg:col-span-1">
          <Card data-testid="card-buddy-profile">
            <CardContent className="pt-6">
              {profile.profileImage && (
                <img
                  src={profile.profileImage}
                  alt={buddyUser?.name}
                  className="w-full aspect-square rounded-lg object-cover mb-4"
                />
              )}

              <h1 className="text-2xl font-bold mb-2" data-testid="text-buddy-name">
                {buddyUser?.name}
              </h1>

              {profile.headline && (
                <p className="text-muted-foreground mb-4" data-testid="text-buddy-headline">
                  {profile.headline}
                </p>
              )}

              <div className="space-y-3 mb-6">
                {profile.city && (
                  <div className="flex items-center gap-2" data-testid="text-buddy-city">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.city}</span>
                  </div>
                )}

                <div className="flex items-center gap-2" data-testid="text-buddy-rate">
                  <span className="font-bold">${profile.hourlyRate}/hr</span>
                </div>

                {rating > 0 && (
                  <div className="flex items-center gap-2" data-testid="text-buddy-rating">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(rating) ? "fill-current" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {rating.toFixed(1)} ({profile.ratingCount} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Verification Badges */}
              <div className="space-y-2 mb-6">
                {profile.identityVerified && (
                  <div className="flex items-center gap-2 text-green-600" data-testid="badge-identity-verified">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Identity Verified</span>
                  </div>
                )}
                {profile.backgroundCheckPassed && (
                  <div className="flex items-center gap-2 text-green-600" data-testid="badge-background-check">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Background Check Passed</span>
                  </div>
                )}
              </div>

              {profile.activities && profile.activities.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Activities</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.activities.map((activity) => (
                      <Badge key={activity} variant="secondary" data-testid={`badge-activity-${activity}`}>
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {user && user.role === "CLIENT" && (
                <Button className="w-full mt-6" variant="outline" data-testid="button-message">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bio and Booking */}
        <div className="lg:col-span-2 space-y-8">
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line" data-testid="text-buddy-bio">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0" data-testid={`review-${review.id}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-current" : ""}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Booking Form */}
          {user && user.role === "CLIENT" && (
            <Card data-testid="card-booking-form">
              <CardHeader>
                <CardTitle>Request a Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Date & Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={bookingForm.startTime}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, startTime: e.target.value })
                        }
                        data-testid="input-start-time"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Date & Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={bookingForm.endTime}
                        onChange={(e) =>
                          setBookingForm({ ...bookingForm, endTime: e.target.value })
                        }
                        data-testid="input-end-time"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="activity">Activity</Label>
                    <Input
                      id="activity"
                      placeholder="What would you like to do?"
                      value={bookingForm.activity}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, activity: e.target.value })
                      }
                      data-testid="input-activity"
                    />
                  </div>

                  <div>
                    <Label htmlFor="locationType">Location Type</Label>
                    <select
                      id="locationType"
                      value={bookingForm.locationType}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, locationType: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      data-testid="select-location-type"
                    >
                      <option value="PUBLIC">Public Place</option>
                      <option value="VIRTUAL">Virtual</option>
                    </select>
                  </div>

                  {bookingForm.locationType === "PUBLIC" && (
                    <div>
                      <Label htmlFor="location">Location Description</Label>
                      <Input
                        id="location"
                        placeholder="Where would you like to meet?"
                        value={bookingForm.locationDescription}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            locationDescription: e.target.value,
                          })
                        }
                        data-testid="input-location"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional details..."
                      value={bookingForm.clientNotes}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, clientNotes: e.target.value })
                      }
                      data-testid="textarea-notes"
                    />
                  </div>

                  <Button type="submit" className="w-full" data-testid="button-book-now">
                    Request Booking
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

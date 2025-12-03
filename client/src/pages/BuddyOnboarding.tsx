import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { Shield, User, DollarSign, MapPin, FileText, CheckCircle, Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef } from "react";

const ACTIVITY_OPTIONS = [
  "Coffee & Conversation",
  "Hiking & Outdoors",
  "Museum Tours",
  "Gym Partner",
  "Shopping Companion",
  "Movie Buddy",
  "Restaurant Explorer",
  "Concert & Events",
  "Dog Walking",
  "Board Games",
  "Photography Tours",
  "Language Practice",
];

export default function BuddyOnboarding() {
  const { user, profile, refetch } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    profileImage: (profile as any)?.profileImage || "",
    headline: "",
    bio: "",
    hourlyRate: "",
    city: "",
    activities: [] as string[],
    safetyProtocolAccepted: false,
    backgroundCheckConsent: false,
  });

  if (!user || user.role !== "BUDDY") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">This page is only for buddy accounts.</p>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Please select an image file.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image must be less than 5MB.",
      });
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, profileImage: reader.result as string });
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleActivity = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.headline || !formData.bio || !formData.hourlyRate || !formData.city) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill out all required fields.",
      });
      return;
    }

    if (formData.activities.length === 0) {
      toast({
        variant: "destructive",
        title: "Select activities",
        description: "Please select at least one activity you offer.",
      });
      return;
    }

    if (!formData.safetyProtocolAccepted) {
      toast({
        variant: "destructive",
        title: "Safety protocol required",
        description: "Please accept the safety protocol to continue.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.updateBuddyProfile({
        profileImage: formData.profileImage || null,
        headline: formData.headline,
        bio: formData.bio,
        hourlyRate: formData.hourlyRate,
        city: formData.city,
        activities: formData.activities,
        safetyProtocolAcceptedAt: new Date().toISOString(),
      });

      await refetch();
      
      toast({
        title: "Profile complete!",
        description: "Your buddy profile is now set up. Welcome aboard!",
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.headline || !formData.bio)) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill out your headline and bio.",
      });
      return;
    }
    if (step === 2 && (!formData.hourlyRate || !formData.city)) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill out your rate and location.",
      });
      return;
    }
    if (step === 3 && formData.activities.length === 0) {
      toast({
        variant: "destructive",
        title: "Select activities",
        description: "Please select at least one activity.",
      });
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />

      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Complete Your Buddy Profile</h1>
        <p className="text-muted-foreground">
          Let's set up your profile so clients can find and book you.
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>About You</CardTitle>
            </div>
            <CardDescription>Tell clients who you are</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-muted">
                  <AvatarImage src={formData.profileImage || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "Upload Photo"}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Headline *</Label>
              <Input
                id="headline"
                placeholder="e.g., Hiking enthusiast & coffee lover"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                maxLength={100}
                data-testid="input-headline"
              />
              <p className="text-xs text-muted-foreground">A catchy one-liner about yourself</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <textarea
                id="bio"
                placeholder="Tell clients about yourself, your interests, and what makes you a great companion..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full min-h-[120px] p-3 border rounded-md resize-none"
                maxLength={500}
                data-testid="textarea-bio"
              />
              <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
            </div>

            <Button onClick={nextStep} className="w-full" data-testid="button-next-step1">
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle>Rates & Location</CardTitle>
            </div>
            <CardDescription>Set your hourly rate and service area</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder="25"
                min="10"
                max="500"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                data-testid="input-hourly-rate"
              />
              <p className="text-xs text-muted-foreground">Most buddies charge between $25-$75/hour</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="pl-10"
                  data-testid="input-city"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1" data-testid="button-next-step2">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Activities You Offer</CardTitle>
            </div>
            <CardDescription>Select activities you're available for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {ACTIVITY_OPTIONS.map((activity) => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  className={`p-3 text-sm rounded-lg border transition-colors text-left ${
                    formData.activities.includes(activity)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                  data-testid={`button-activity-${activity.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {activity}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {formData.activities.length} activities
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1" data-testid="button-next-step3">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Safety & Agreements</CardTitle>
            </div>
            <CardDescription>Review and accept our safety protocols</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-primary">Rent-A-Buddy Safety Protocol</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  All sessions must be conducted in public places or virtual settings
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Share your location with a trusted contact during sessions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Report any inappropriate behavior immediately
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  Maintain professional, platonic relationships at all times
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="safetyProtocol"
                  checked={formData.safetyProtocolAccepted}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, safetyProtocolAccepted: checked === true })
                  }
                  data-testid="checkbox-safety-protocol"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="safetyProtocol" className="text-sm font-medium">
                    I agree to follow all safety protocols *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I understand that violating these protocols may result in account suspension
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="backgroundCheck"
                  checked={formData.backgroundCheckConsent}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, backgroundCheckConsent: checked === true })
                  }
                  data-testid="checkbox-background-check"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="backgroundCheck" className="text-sm font-medium">
                    I consent to a background check (optional)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Verified buddies get a trust badge and higher visibility
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.safetyProtocolAccepted}
                className="flex-1"
                data-testid="button-complete-profile"
              >
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

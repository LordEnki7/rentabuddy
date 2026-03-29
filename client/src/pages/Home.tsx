import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, CheckCircle, Star, Heart, MapPin, Clock, Coffee, Mountain, Camera, Music, Dumbbell, ShoppingBag, ArrowRight, Quote } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const heroImage = "/media/hero.png";
const textureImage = "/media/texture.png";

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    city: "Austin, TX",
    rating: 5,
    text: "Moving to a new city is lonely. My buddy Alex showed me the best local spots and I finally felt at home. 10/10 would recommend.",
    avatar: "https://i.pravatar.cc/150?u=marcus",
    activity: "City Explorer"
  },
  {
    name: "Jennifer L.",
    city: "Chicago, IL",
    rating: 5,
    text: "Sarah was amazing! She attended my work gala as my plus-one and kept the conversation flowing. Professional, warm, and safe.",
    avatar: "https://i.pravatar.cc/150?u=jennifer",
    activity: "Event Plus-One"
  },
  {
    name: "David R.",
    city: "Seattle, WA",
    rating: 5,
    text: "After my divorce I was too anxious to go to the gym alone. My buddy Ryan kept me accountable for 3 months. Changed my life.",
    avatar: "https://i.pravatar.cc/150?u=david",
    activity: "Gym Partner"
  },
];

const ACTIVITIES = [
  { icon: Coffee, label: "Coffee & Chat", color: "bg-amber-100 text-amber-700" },
  { icon: Mountain, label: "Hiking", color: "bg-green-100 text-green-700" },
  { icon: Camera, label: "Photography", color: "bg-purple-100 text-purple-700" },
  { icon: Music, label: "Concerts", color: "bg-pink-100 text-pink-700" },
  { icon: Dumbbell, label: "Gym Partner", color: "bg-blue-100 text-blue-700" },
  { icon: ShoppingBag, label: "Shopping", color: "bg-rose-100 text-rose-700" },
];

const TRUST_STEPS = [
  {
    step: "01",
    icon: Users,
    title: "Browse Verified Profiles",
    desc: "Every buddy is identity-verified and background-checked. Filter by city, activity, and hourly rate.",
  },
  {
    step: "02",
    icon: CheckCircle,
    title: "Request a Booking",
    desc: "Send a request with your activity and time. Buddies respond within 24 hours. No surprises.",
  },
  {
    step: "03",
    icon: Shield,
    title: "Meet Safely",
    desc: "All sessions are covered by our strict non-romantic code of conduct. Public venues recommended.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <img src={textureImage} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
              <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border-primary/20 backdrop-blur-sm text-primary text-sm font-semibold shadow-sm">
                <Shield className="h-4 w-4" />
                Verified Safe Community
              </Badge>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-foreground leading-[1.1] tracking-tight">
                Find your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">platonic</span> <br />
                companion.
              </h1>

              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Need a plus-one for an event? A gym buddy? Or just someone to explore with?
                Rent-A-Buddy connects you with verified, friendly locals for strictly non-romantic companionship.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/buddies">
                  <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform" data-testid="button-hero-browse">
                    Browse Buddies
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                {!user && (
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg bg-white/50 backdrop-blur-sm hover:bg-white hover:text-primary transition-all" data-testid="button-hero-become">
                      Become a Buddy
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-muted overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground font-bold">2,000+</span> trusted members &amp; growing
                </p>
              </div>
            </div>

            <div className="relative animate-in slide-in-from-right-10 duration-1000 fade-in delay-200">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  src={heroImage}
                  alt="Friends laughing together"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg max-w-xs border border-white/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <Heart className="h-5 w-5 fill-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Recent Review</p>
                      <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">"Sarah was amazing! She showed me the best coffee spots in the city. Super friendly and safe."</p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-white border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,000+", label: "Active Members" },
              { value: "98%", label: "Safety Rating" },
              { value: "50+", label: "Cities Covered" },
              { value: "4.9★", label: "Average Rating" },
            ].map((stat, i) => (
              <div key={i} data-testid={`stat-${i}`}>
                <p className="text-3xl md:text-4xl font-heading font-extrabold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Showcase */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">What do people do with their Buddy?</h2>
            <p className="text-muted-foreground text-lg">From casual coffee to concert nights — every activity is welcome, as long as it's platonic.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ACTIVITIES.map((activity, i) => (
              <Link key={i} href="/buddies">
                <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${activity.color} hover:scale-105 transition-transform cursor-pointer`} data-testid={`activity-card-${i}`}>
                  <activity.icon className="h-8 w-8" />
                  <span className="text-sm font-semibold text-center">{activity.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">How Rent-A-Buddy works</h2>
            <p className="text-muted-foreground text-lg">We've built a community based on trust, transparency, and strict boundaries.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TRUST_STEPS.map((step, idx) => (
              <div key={idx} className="relative bg-muted/30 p-8 rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 transition-all group" data-testid={`how-step-${idx}`}>
                <div className="absolute -top-4 left-8 text-6xl font-heading font-extrabold text-primary/10 select-none">{step.step}</div>
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Real stories from real people</h2>
            <p className="text-muted-foreground text-lg">Thousands of meaningful connections, zero awkward situations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="border-none shadow-md hover:shadow-xl transition-shadow" data-testid={`testimonial-${i}`}>
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{t.city}</span>
                        <span>·</span>
                        <span className="text-primary font-medium">{t.activity}</span>
                      </div>
                    </div>
                    <div className="ml-auto flex text-yellow-400">
                      {[...Array(t.rating)].map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">Safety First</Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Your safety is our #1 priority</h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Every buddy goes through identity verification and background checks. Our strict code of conduct ensures all interactions remain respectful, platonic, and safe.
              </p>
              <div className="space-y-4">
                {[
                  "Identity verification on every buddy profile",
                  "Background checks available for all buddies",
                  "Strict non-romantic, anti-solicitation policy",
                  "In-app safety reporting for any concerns",
                  "24/7 platform safety monitoring",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/policies">
                <Button variant="outline" className="mt-8 rounded-full" data-testid="button-safety-policies">
                  Read Our Safety Policies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Background Checked", desc: "All buddies undergo thorough background screening", color: "text-blue-600 bg-blue-100" },
                { icon: CheckCircle, title: "ID Verified", desc: "Government-issued ID verification required", color: "text-green-600 bg-green-100" },
                { icon: Clock, title: "24hr Response", desc: "Safety team responds to all reports within 24 hours", color: "text-purple-600 bg-purple-100" },
                { icon: Users, title: "Public Venues", desc: "All in-person meetings encouraged in public spaces", color: "text-amber-600 bg-amber-100" },
              ].map((item, i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>

        <div className="container mx-auto px-4 relative z-10 text-center text-primary-foreground">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Ready to find your buddy?</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Join thousands of people making genuine connections and exploring life together — safely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/buddies">
              <Button size="lg" variant="secondary" className="h-16 px-10 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all" data-testid="button-cta-browse">
                Browse Buddies
              </Button>
            </Link>
            {!user && (
              <Link href="/register">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-xl font-bold border-white/30 text-white hover:bg-white/10 transition-all" data-testid="button-cta-join">
                  Become a Buddy
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Shield, Users, CheckCircle, Star, Heart } from "lucide-react";
import { Link } from "wouter";
const heroImage = "/media/hero.png";
const textureImage = "/media/texture.png";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 z-0 opacity-30">
           <img src={textureImage} alt="" className="w-full h-full object-cover" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in slide-in-from-left-10 duration-700 fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-primary/20 backdrop-blur-sm text-primary text-sm font-semibold shadow-sm">
                <Shield className="h-4 w-4" />
                <span>Verified Safe Community</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-foreground leading-[1.1] tracking-tight">
                Find your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">platonic</span> <br/>
                companion.
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Need a plus-one for an event? A gym buddy? Or just someone to talk to? 
                Rent-A-Buddy connects you with verified, friendly locals for strictly non-romantic companionship.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/buddies">
                  <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                    Browse Buddies
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg bg-white/50 backdrop-blur-sm hover:bg-white hover:text-primary transition-all">
                    Become a Buddy
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-muted overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?u=${i+20}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  <span className="text-foreground font-bold">2,000+</span> trusted members
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
                
                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg max-w-xs border border-white/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                      <Heart className="h-5 w-5 fill-secondary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Recent Review</p>
                      <div className="flex text-yellow-400 text-xs">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">"Sarah was amazing! She showed me the best coffee spots in the city. Super friendly and safe."</p>
                </div>
              </div>
              
              {/* Decorative blob */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">
              We've built a community based on trust, transparency, and strict boundaries.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "1. Browse Profiles",
                desc: "Filter by city, interests, and hourly rate to find someone who matches your vibe."
              },
              {
                icon: CheckCircle,
                title: "2. Request a Booking",
                desc: "Send a request with your activity details. All buddies are verified and background checked."
              },
              {
                icon: Shield,
                title: "3. Meet Safely",
                desc: "Meet in public or virtually. Our strict non-romantic policy ensures everyone feels comfortable."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-muted/30 p-8 rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 transition-all group">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center text-primary-foreground">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">Ready to find a buddy?</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Join thousands of people who are making new connections and exploring their cities together.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="h-16 px-10 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

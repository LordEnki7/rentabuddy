import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  
  // Client form state
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    password: "",
    safetyAgreementAccepted: false,
  });

  // Buddy form state
  const [buddyData, setBuddyData] = useState({
    name: "",
    email: "",
    city: "",
    password: "",
    codeOfConductAccepted: false,
  });

  const [loading, setLoading] = useState(false);

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        name: clientData.name,
        email: clientData.email,
        password: clientData.password,
        role: "CLIENT",
        safetyAgreementAccepted: clientData.safetyAgreementAccepted,
      });
      
      toast({
        title: "Welcome to Rent-A-Buddy!",
        description: "Your client account has been created successfully.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuddyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        name: buddyData.name,
        email: buddyData.email,
        password: buddyData.password,
        role: "BUDDY",
        city: buddyData.city,
        codeOfConductAccepted: buddyData.codeOfConductAccepted,
      });
      
      toast({
        title: "Welcome to Rent-A-Buddy!",
        description: "Your buddy account has been created successfully.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl mb-2">Join the Community</h1>
          <p className="text-muted-foreground">Create an account to start connecting.</p>
        </div>

        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-muted/50">
            <TabsTrigger value="client" className="rounded-md text-base font-medium" data-testid="tab-client">
              I want to hire a Buddy
            </TabsTrigger>
            <TabsTrigger value="buddy" className="rounded-md text-base font-medium" data-testid="tab-buddy">
              I want to be a Buddy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Client Registration</CardTitle>
                <CardDescription>
                  Find safe, platonic companions for your activities.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleClientRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      required
                      value={clientData.name}
                      onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                      data-testid="input-client-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={clientData.email}
                      onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                      data-testid="input-client-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={clientData.password}
                      onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                      data-testid="input-client-password"
                    />
                  </div>
                  
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3 mt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        required
                        className="mt-1"
                        checked={clientData.safetyAgreementAccepted}
                        onCheckedChange={(checked) => 
                          setClientData({ ...clientData, safetyAgreementAccepted: checked === true })
                        }
                        data-testid="checkbox-client-terms"
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="terms" className="text-sm font-bold text-primary">
                          Client Safety Agreement
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          I verify I am 18+ and understand this is a strictly platonic service. 
                          I agree to the Code of Conduct and Zero Tolerance Policy for harassment.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full h-11 text-lg"
                    disabled={loading}
                    data-testid="button-client-register"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="buddy">
            <Card>
              <CardHeader>
                <CardTitle>Buddy Application</CardTitle>
                <CardDescription>
                  Earn money by being a friendly companion.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleBuddyRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="b-name">Full Name</Label>
                    <Input
                      id="b-name"
                      placeholder="Jane Doe"
                      required
                      value={buddyData.name}
                      onChange={(e) => setBuddyData({ ...buddyData, name: e.target.value })}
                      data-testid="input-buddy-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-email">Email</Label>
                    <Input
                      id="b-email"
                      type="email"
                      placeholder="jane@example.com"
                      required
                      value={buddyData.email}
                      onChange={(e) => setBuddyData({ ...buddyData, email: e.target.value })}
                      data-testid="input-buddy-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-city">City</Label>
                    <Input
                      id="b-city"
                      placeholder="New York, NY"
                      required
                      value={buddyData.city}
                      onChange={(e) => setBuddyData({ ...buddyData, city: e.target.value })}
                      data-testid="input-buddy-city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-password">Password</Label>
                    <Input
                      id="b-password"
                      type="password"
                      required
                      minLength={8}
                      value={buddyData.password}
                      onChange={(e) => setBuddyData({ ...buddyData, password: e.target.value })}
                      data-testid="input-buddy-password"
                    />
                  </div>

                  <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg mt-4">
                     <div className="flex items-center gap-2 mb-2 text-destructive font-bold text-sm">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Strict Policy Notice</span>
                     </div>
                     <p className="text-xs text-muted-foreground mb-3">
                        Rent-A-Buddy has a zero-tolerance policy for any sexual content or solicitation. 
                        Violating this will result in immediate ban and reporting to authorities if necessary.
                     </p>
                     <div className="flex items-center space-x-2">
                        <Checkbox
                          id="b-terms"
                          required
                          checked={buddyData.codeOfConductAccepted}
                          onCheckedChange={(checked) => 
                            setBuddyData({ ...buddyData, codeOfConductAccepted: checked === true })
                          }
                          data-testid="checkbox-buddy-terms"
                        />
                        <Label htmlFor="b-terms" className="text-sm font-medium">
                          I agree to the Buddy Code of Conduct & Safety Protocols
                        </Label>
                     </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full h-11 text-lg"
                    disabled={loading}
                    data-testid="button-buddy-register"
                  >
                    {loading ? "Creating Account..." : "Start Application"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account? <Link href="/login"><span className="text-primary hover:underline cursor-pointer" data-testid="link-login">Log in</span></Link>
        </p>
      </div>
    </div>
  );
}

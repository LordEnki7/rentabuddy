import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { ShieldAlert } from "lucide-react";

export default function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Registration Successful (Mock)",
      description: "Welcome to Rent-A-Buddy! Redirecting to dashboard...",
    });
    setTimeout(() => setLocation("/dashboard"), 1500);
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
            <TabsTrigger value="client" className="rounded-md text-base font-medium">I want to hire a Buddy</TabsTrigger>
            <TabsTrigger value="buddy" className="rounded-md text-base font-medium">I want to be a Buddy</TabsTrigger>
          </TabsList>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Client Registration</CardTitle>
                <CardDescription>
                  Find safe, platonic companions for your activities.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required />
                  </div>
                  
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg space-y-3 mt-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox id="terms" required className="mt-1" />
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
                  <Button type="submit" className="w-full h-11 text-lg">Create Account</Button>
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
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="b-name">Full Name</Label>
                    <Input id="b-name" placeholder="Jane Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-email">Email</Label>
                    <Input id="b-email" type="email" placeholder="jane@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-city">City</Label>
                    <Input id="b-city" placeholder="New York, NY" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="b-password">Password</Label>
                    <Input id="b-password" type="password" required />
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
                        <Checkbox id="b-terms" required />
                        <Label htmlFor="b-terms" className="text-sm font-medium">
                          I agree to the Buddy Code of Conduct & Safety Protocols
                        </Label>
                     </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-11 text-lg">Start Application</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account? <Link href="/login"><a className="text-primary hover:underline">Log in</a></Link>
        </p>
      </div>
    </div>
  );
}

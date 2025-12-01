import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, ShieldCheck, BookOpen, Users, Scale, FileText } from "lucide-react";

export default function Policies() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-heading font-bold mb-4">Safety & Legal Policies</h1>
        <p className="text-xl text-muted-foreground">
          Rent-A-Buddy™ is built on trust, transparency, and strict boundaries. Please review our core policies below.
        </p>
      </div>

      <Tabs defaultValue="code-of-conduct" className="w-full max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-2 bg-muted/50 mb-8">
          <TabsTrigger value="code-of-conduct" className="py-3">Code of Conduct</TabsTrigger>
          <TabsTrigger value="zero-tolerance" className="py-3">Zero Tolerance</TabsTrigger>
          <TabsTrigger value="safety-agreements" className="py-3">Safety Agreements</TabsTrigger>
          <TabsTrigger value="terms" className="py-3">Terms of Service</TabsTrigger>
        </TabsList>

        {/* Code of Conduct Tab */}
        <TabsContent value="code-of-conduct">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Platform-Wide Code of Conduct</CardTitle>
              </div>
              <CardDescription>Expectations for both Clients and Buddies to ensure a respectful community.</CardDescription>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h3>A. For All Users</h3>
              <ul>
                <li><strong>Treat others with respect.</strong> No hate speech, harassment, threats, or intimidation.</li>
                <li><strong>No discrimination</strong> based on race, gender, sexuality, religion, or disability.</li>
                <li><strong>No illegal activity</strong> of any kind.</li>
                <li><strong>No physical harm</strong> or coercion.</li>
                <li><strong>No recording without consent</strong> (subject to local law).</li>
              </ul>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-xl border border-blue-100 dark:border-blue-900">
                  <h4 className="text-blue-700 dark:text-blue-300 mt-0">For Clients</h4>
                  <ul className="text-sm space-y-2 mt-4">
                    <li>Respect boundaries at all times.</li>
                    <li>Do NOT request or imply romantic, sexual, or escort-like services.</li>
                    <li>Do NOT follow, stalk, or pursue Buddies outside agreed locations.</li>
                    <li>Do NOT attempt to move Sessions to private homes unless approved.</li>
                    <li>Do NOT attempt off-platform payment.</li>
                  </ul>
                </div>

                <div className="bg-teal-50 dark:bg-teal-950/30 p-6 rounded-xl border border-teal-100 dark:border-teal-900">
                  <h4 className="text-teal-700 dark:text-teal-300 mt-0">For Buddies</h4>
                  <ul className="text-sm space-y-2 mt-4">
                    <li>Arrive on time, prepared, and appropriately dressed.</li>
                    <li>Maintain a professional presence.</li>
                    <li>Follow all Safety Protocols.</li>
                    <li>Never engage in physical, romantic, or sexual activities with clients.</li>
                    <li>Maintain confidentiality unless safety is at risk.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zero Tolerance Tab */}
        <TabsContent value="zero-tolerance">
          <Card className="border-red-200 dark:border-red-900 shadow-lg shadow-red-100/50 dark:shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2 text-red-600 dark:text-red-400">
                <ShieldAlert className="h-8 w-8" />
                <CardTitle className="text-2xl">Zero Sexual Content Policy</CardTitle>
              </div>
              <CardDescription>We enforce a strict zero-tolerance policy for sexual conduct.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border border-red-100 dark:border-red-900/50">
                <p className="font-medium text-lg mb-4">Strictly Prohibited:</p>
                <ul className="grid md:grid-cols-2 gap-3">
                  <li className="flex items-center gap-2 text-sm"><span className="text-red-500">❌</span> Sexual comments, innuendo, or propositions</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-red-500">❌</span> Flirting or romantic advances</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-red-500">❌</span> Physical affection (kissing, sexual touching)</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-red-500">❌</span> Escort-like behavior</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-red-500">❌</span> Sessions at locations intended for intimacy</li>
                  <li className="flex items-center gap-2 text-sm"><span className="text-red-500">❌</span> Sharing sexually explicit content</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Anti-Escort & Anti-Dating Clause</h3>
                <p className="text-muted-foreground">Rent-A-Buddy™ strictly prohibits:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Escort services</li>
                  <li>Romantic companionship services</li>
                  <li>Dating services</li>
                  <li>“Girlfriend/Boyfriend experience”</li>
                  <li>Overnight stays</li>
                  <li>Exchange of gifts intended to create intimacy</li>
                </ul>
                <p className="font-semibold text-red-600 dark:text-red-400 pt-2">
                  Any attempt to convert the service into escorting results in immediate termination.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Safety Agreements Tab */}
        <TabsContent value="safety-agreements">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                  <CardTitle>Client Safety Agreement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="list-decimal pl-5 space-y-3 text-sm text-muted-foreground">
                  <li>Use public meeting places for the first session unless otherwise allowed.</li>
                  <li>Respect all boundaries communicated by Buddies.</li>
                  <li>Follow all instructions related to safety, check-ins, and tracking.</li>
                  <li>Abstain from drugs or alcohol during Sessions.</li>
                  <li>Avoid offering rides unless previously agreed and permitted.</li>
                  <li>Immediately report inappropriate or unsafe Buddy behavior.</li>
                  <li>Never attempt to meet Buddies off-platform.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-secondary">
                  <ShieldCheck className="h-6 w-6" />
                  <CardTitle>Buddy Safety Protocol</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <div>
                      <h4 className="font-bold text-foreground mb-2">Before the Session</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Ensure location is safe and approved.</li>
                        <li>Review client profile and ratings.</li>
                        <li>Arrive early or on time.</li>
                        <li>Keep phone charged and GPS enabled.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-2">During the Session</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Maintain professional boundaries.</li>
                        <li>Use public areas unless explicitly allowed.</li>
                        <li>Follow the “Check-In Timer” prompts.</li>
                        <li>If unsafe, immediately end session and move to public area.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-2">Reasons to End Early</h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Client intoxication or aggression.</li>
                        <li>Sexual requests or advances.</li>
                        <li>Illegal activity.</li>
                        <li>Boundary violations.</li>
                      </ul>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Terms of Service Tab */}
        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Scale className="h-8 w-8 text-muted-foreground" />
                <CardTitle className="text-2xl">Terms of Service</CardTitle>
              </div>
              <CardDescription>Last Updated: December 1, 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-6">
                <div className="prose dark:prose-invert max-w-none space-y-8">
                  <section>
                    <h3>1. Acceptance of Terms</h3>
                    <p>By creating an account or using the Rent-A-Buddy™ platform (“Platform”), you agree to these Terms of Service. If you do not agree, do not use the Platform.</p>
                  </section>

                  <section>
                    <h3>2. Nature of the Service</h3>
                    <p>Rent-A-Buddy™ is a marketplace that connects Clients with independent contractors (“Buddies”) who offer companionship, emotional support, or activity-based session services. Rent-A-Buddy™ does not provide therapy, medical care, crisis intervention, dating, escorting, or any sexual services.</p>
                  </section>

                  <section>
                    <h3>3. Eligibility</h3>
                    <ul>
                      <li>You must be 18 years or older to use the Platform.</li>
                      <li>You must provide accurate information at all times.</li>
                      <li>You may not use the Platform if you have been previously suspended or removed.</li>
                    </ul>
                  </section>

                  <section>
                    <h3>4. Relationship of the Parties</h3>
                    <p>Buddies are independent contractors, not employees, partners, agents, or representatives of Rent-A-Buddy™. Clients and Buddies interact at their own risk, subject to safety protocols.</p>
                  </section>

                  <section>
                    <h3>5. Prohibited Conduct</h3>
                    <p>The following are strictly prohibited:</p>
                    <ul>
                      <li>Sexual, romantic, or intimate contact</li>
                      <li>Escorting or escort-adjacent services</li>
                      <li>Illegal substances or activities</li>
                      <li>Harassment, threats, or violence</li>
                      <li>Off-platform payments</li>
                    </ul>
                  </section>

                  <section>
                    <h3>6. Limitation of Liability</h3>
                    <p>To the fullest extent permitted by law, Rent-A-Buddy™ is not liable for any harm, loss, or damages arising from interactions between users. Our maximum liability shall not exceed the amount paid by you in the past 6 months.</p>
                  </section>

                  <section>
                    <h3>7. Non-Solicitation Clause</h3>
                    <p>Clients and Buddies agree not to:</p>
                    <ul>
                      <li>Ask for direct contact outside the Platform</li>
                      <li>Exchange personal phone numbers, social media, or email</li>
                      <li>Attempt to arrange off-platform Sessions</li>
                      <li>Circumvent Platform fees</li>
                    </ul>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Buddies from "@/pages/Buddies";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/buddies" component={Buddies} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Register} /> {/* Reuse register for mock */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/policies" component={() => (
          <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-4">Safety & Policies</h1>
            <p>Static policy content goes here...</p>
          </div>
        )} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

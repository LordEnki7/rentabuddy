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

import Policies from "@/pages/Policies";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/buddies" component={Buddies} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Register} /> {/* Reuse register for mock */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/policies" component={Policies} />
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

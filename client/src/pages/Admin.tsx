import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, CalendarDays, DollarSign, AlertTriangle, Shield, CheckCircle,
  XCircle, UserCheck, UserX, Loader2, BarChart3, Eye, Search,
  Bot, Play, Zap, Brain, Activity, Clock, TrendingUp, FileText, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const ROLE_ICONS: Record<string, typeof Bot> = {
  OPERATIONS: BarChart3,
  SAFETY: Shield,
  ENGAGEMENT: Users,
  QUALITY: TrendingUp,
};

const ROLE_COLORS: Record<string, string> = {
  OPERATIONS: "text-blue-600 bg-blue-50 border-blue-200",
  SAFETY: "text-red-600 bg-red-50 border-red-200",
  ENGAGEMENT: "text-purple-600 bg-purple-50 border-purple-200",
  QUALITY: "text-amber-600 bg-amber-50 border-amber-200",
};

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [expandedBrief, setExpandedBrief] = useState<string | null>(null);
  const [dailyBrief, setDailyBrief] = useState<any>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const { data: statsData } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => api.getAdminStats(),
    enabled: user?.role === "ADMIN",
  });

  const { data: usersData } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => api.getAdminUsers(),
    enabled: user?.role === "ADMIN",
  });

  const { data: bookingsData } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: () => api.getAdminBookings(),
    enabled: user?.role === "ADMIN",
  });

  const { data: reportsData } = useQuery({
    queryKey: ["adminReports"],
    queryFn: () => api.getSafetyReports(),
    enabled: user?.role === "ADMIN",
  });

  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ["adminAgents"],
    queryFn: async () => {
      const res = await fetch("/api/admin/agents", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json();
    },
    enabled: user?.role === "ADMIN",
  });

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You must be logged in as an administrator.</p>
        <Button onClick={() => setLocation("/login")}>Go to Login</Button>
      </div>
    );
  }

  const stats = statsData?.stats;
  const allUsers = usersData?.users || [];
  const allBookings = bookingsData?.bookings || [];
  const allReports = reportsData?.reports || [];
  const allAgents = agentsData?.agents || [];

  const filteredUsers = allUsers.filter((u: any) =>
    u.role !== "ADMIN" && (
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    )
  );

  const handleUserStatus = async (userId: string, status: string) => {
    setLoadingAction(`user-${userId}`);
    try {
      await api.updateUserStatus(userId, status);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast({ title: "User updated", description: `User has been ${status === "ACTIVE" ? "activated" : "suspended"}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVerification = async (userId: string, field: string, value: boolean) => {
    setLoadingAction(`verify-${userId}-${field}`);
    try {
      await api.updateBuddyVerification(userId, field, value);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({ title: "Verification updated", description: `Buddy verification has been ${value ? "approved" : "revoked"}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReportStatus = async (reportId: string, status: string) => {
    setLoadingAction(`report-${reportId}`);
    try {
      await api.updateSafetyReportStatus(reportId, status);
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      toast({ title: "Report updated", description: `Report marked as ${status.toLowerCase()}.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunAgent = async (agentId: string) => {
    setLoadingAction(`agent-${agentId}`);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}/run`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to run agent");
      queryClient.invalidateQueries({ queryKey: ["adminAgents"] });
      toast({ title: "Agent executed", description: "Agent run completed successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Agent failed", description: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRunAllAgents = async () => {
    setLoadingAction("run-all");
    try {
      const res = await fetch("/api/admin/agents/run-all", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to run agents");
      queryClient.invalidateQueries({ queryKey: ["adminAgents"] });
      toast({ title: "All agents executed", description: "All platform agents completed their runs." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerateBrief = async () => {
    setBriefLoading(true);
    try {
      const res = await fetch("/api/admin/agents/daily-brief", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate brief");
      const data = await res.json();
      setDailyBrief(data.brief);
      queryClient.invalidateQueries({ queryKey: ["adminAgents"] });
      toast({ title: "Daily brief generated", description: "Executive briefing ready for review." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setBriefLoading(false);
    }
  };

  const openReports = allReports.filter((r: any) => r.status === "OPEN");

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getLatestMemory = (agent: any, key: string) => {
    const mem = agent.memory?.find((m: any) => m.key?.startsWith(key));
    return mem?.value;
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16 md:mb-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold" data-testid="heading-admin">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Platform management and oversight</p>
        </div>
        <Badge variant="outline" className="text-primary border-primary">
          <Shield className="h-3 w-3 mr-1" />
          Administrator
        </Badge>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          <Card data-testid="stat-total-users">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-buddies">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Buddies</p>
              <p className="text-2xl font-bold text-primary">{stats.totalBuddies}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-clients">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Clients</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalClients}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-bookings">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-completed">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-revenue">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(0)}</p>
            </CardContent>
          </Card>
          <Card className={openReports.length > 0 ? "border-red-200 bg-red-50/50" : ""} data-testid="stat-open-reports">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Open Reports</p>
              <p className={`text-2xl font-bold ${openReports.length > 0 ? "text-red-600" : ""}`}>{stats.openReports}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="w-full md:w-auto mb-6 bg-transparent p-0 border-b border-border rounded-none h-auto justify-start space-x-4 md:space-x-6 overflow-x-auto">
          <TabsTrigger value="agents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3" data-testid="tab-admin-agents">
            <Bot className="h-4 w-4 mr-2" />
            Agents ({allAgents.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3" data-testid="tab-admin-users">
            <Users className="h-4 w-4 mr-2" />
            Users ({allUsers.filter((u: any) => u.role !== "ADMIN").length})
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3" data-testid="tab-admin-bookings">
            <CalendarDays className="h-4 w-4 mr-2" />
            Bookings ({allBookings.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3" data-testid="tab-admin-reports">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Safety ({allReports.length})
            {openReports.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">{openReports.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ========== AGENTS TAB ========== */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Platform Agent Command Center
              </h2>
              <p className="text-sm text-muted-foreground">Run, monitor, and review AI agents that manage your platform</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRunAllAgents}
                disabled={loadingAction === "run-all"}
                size="sm"
                data-testid="button-run-all-agents"
              >
                {loadingAction === "run-all" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                Run All Agents
              </Button>
              <Button
                onClick={handleGenerateBrief}
                disabled={briefLoading}
                size="sm"
                variant="outline"
                data-testid="button-daily-brief"
              >
                {briefLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                Daily Brief
              </Button>
            </div>
          </div>

          {/* Daily Brief Panel */}
          {dailyBrief && (
            <Card className="border-primary/30 bg-primary/5" data-testid="card-daily-brief">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Daily Executive Brief
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {new Date(dailyBrief.generatedAt).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(dailyBrief.agents).map(([role, data]: [string, any]) => {
                  if (data.error) return null;
                  const isExpanded = expandedBrief === role;
                  return (
                    <div key={role} className="border rounded-lg p-3 bg-background">
                      <button
                        className="w-full text-left flex items-center justify-between"
                        onClick={() => setExpandedBrief(isExpanded ? null : role)}
                        data-testid={`button-expand-brief-${role}`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={ROLE_COLORS[role] || ""}>{role}</Badge>
                          {data.executiveSummary && (
                            <span className="text-sm text-muted-foreground line-clamp-1">{data.executiveSummary}</span>
                          )}
                          {data.riskLevel && (
                            <Badge variant={data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH' ? "destructive" : data.riskLevel === 'MEDIUM' ? "outline" : "secondary"}>
                              {data.riskLevel}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{isExpanded ? "collapse" : "expand"}</span>
                      </button>
                      {isExpanded && (
                        <div className="mt-3 text-sm space-y-2">
                          {data.metrics && (
                            <div>
                              <p className="font-medium mb-1">Platform Metrics</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(data.metrics).map(([k, v]: [string, any]) => (
                                  <div key={k} className="bg-muted/50 rounded p-2">
                                    <p className="text-xs text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="font-semibold">{typeof v === 'number' && k.includes('Revenue') ? `$${v.toFixed(2)}` : `${v}${k.includes('Rate') ? '%' : ''}`}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {data.healthScore !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Health Score:</span>
                              <Badge variant={data.healthScore >= 80 ? "secondary" : data.healthScore >= 50 ? "outline" : "destructive"}>
                                {data.healthScore}/100
                              </Badge>
                            </div>
                          )}
                          {data.alerts && data.alerts.length > 0 && (
                            <div>
                              <p className="font-medium mb-1">Alerts</p>
                              {data.alerts.map((alert: any, i: number) => (
                                <div key={i} className="flex items-start gap-2 py-1">
                                  <Badge variant={alert.severity === 'CRITICAL' ? "destructive" : alert.severity === 'HIGH' ? "destructive" : "outline"} className="text-xs shrink-0">
                                    {alert.severity}
                                  </Badge>
                                  <span className="text-sm">{alert.message}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {data.repeatOffenders && data.repeatOffenders.length > 0 && (
                            <div>
                              <p className="font-medium mb-1">Repeat Offenders</p>
                              {data.repeatOffenders.map((o: any, i: number) => (
                                <p key={i} className="text-sm">User {o.userId.slice(0, 8)}... - {o.reportCount} reports</p>
                              ))}
                            </div>
                          )}
                          {data.priorityActions && data.priorityActions.length > 0 && (
                            <div>
                              <p className="font-medium mb-1">Priority Actions</p>
                              {data.priorityActions.map((a: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 py-0.5">
                                  <Badge variant={a.urgency === 'HIGH' ? "destructive" : "outline"} className="text-xs">{a.urgency}</Badge>
                                  <span className="text-sm">{a.title}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {data.recommendations && data.recommendations.length > 0 && (
                            <div>
                              <p className="font-medium mb-1">Recommendations</p>
                              <ul className="list-disc list-inside space-y-0.5">
                                {data.recommendations.map((r: string, i: number) => (
                                  <li key={i} className="text-sm">{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {data.topPerformers && data.topPerformers.length > 0 && (
                            <div>
                              <p className="font-medium mb-1">Top Performing Buddies</p>
                              {data.topPerformers.map((tp: any, i: number) => (
                                <div key={i} className="flex items-center gap-2 py-0.5">
                                  <span className="text-sm font-medium">{tp.name}</span>
                                  <Badge variant="secondary">{tp.rating} stars</Badge>
                                  <span className="text-xs text-muted-foreground">{tp.completedBookings} completed</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {data.ratingDistribution && (
                            <div>
                              <p className="font-medium mb-1">Rating Distribution</p>
                              <div className="flex gap-3">
                                {Object.entries(data.ratingDistribution).map(([stars, cnt]: [string, any]) => (
                                  <div key={stars} className="text-center">
                                    <p className="text-xs text-muted-foreground">{stars} star</p>
                                    <p className="font-semibold">{cnt}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {data.churnRisks && data.churnRisks.length > 0 && (
                            <div>
                              <p className="font-medium mb-1">Churn Risks</p>
                              {data.churnRisks.slice(0, 5).map((c: any, i: number) => (
                                <p key={i} className="text-sm">{c.name} - inactive {c.daysSinceLastActivity} days</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Agent Cards */}
          {agentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allAgents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No agents registered yet. Restart the server to seed agents.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {allAgents.map((agent: any) => {
                const RoleIcon = ROLE_ICONS[agent.role] || Bot;
                const roleColor = ROLE_COLORS[agent.role] || "";
                const isExpanded = expandedAgent === agent.id;
                const latestRun = agent.recentRuns?.[0];

                return (
                  <Card key={agent.id} className={`${roleColor} border`} data-testid={`card-agent-${agent.role}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-background/80">
                            <RoleIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{agent.name}</CardTitle>
                            <CardDescription className="text-xs mt-0.5">{agent.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={agent.status === "ACTIVE" ? "secondary" : "outline"} className="shrink-0">
                          {agent.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-background/60 rounded p-2">
                          <p className="text-xs text-muted-foreground">Total Runs</p>
                          <p className="font-bold text-lg">{agent.stats?.totalRuns || 0}</p>
                        </div>
                        <div className="bg-background/60 rounded p-2">
                          <p className="text-xs text-muted-foreground">Avg Quality</p>
                          <p className="font-bold text-lg">{agent.stats?.avgQualityScore || 0}<span className="text-xs font-normal">/10</span></p>
                        </div>
                        <div className="bg-background/60 rounded p-2">
                          <p className="text-xs text-muted-foreground">Avg Time</p>
                          <p className="font-bold text-lg">{agent.stats?.avgDurationMs ? formatDuration(agent.stats.avgDurationMs) : "—"}</p>
                        </div>
                      </div>

                      {agent.lastActiveAt && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last active: {new Date(agent.lastActiveAt).toLocaleString()}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">Capabilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {(agent.capabilities || []).slice(0, 3).map((cap: string) => (
                            <Badge key={cap} variant="outline" className="text-[10px] bg-background/60">
                              {cap.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          {(agent.capabilities || []).length > 3 && (
                            <Badge variant="outline" className="text-[10px] bg-background/60">
                              +{agent.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => handleRunAgent(agent.id)}
                          disabled={loadingAction === `agent-${agent.id}`}
                          className="flex-1"
                          data-testid={`button-run-agent-${agent.role}`}
                        >
                          {loadingAction === `agent-${agent.id}` ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3 mr-1" />
                          )}
                          Run Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                          data-testid={`button-expand-agent-${agent.role}`}
                        >
                          <Activity className="h-3 w-3 mr-1" />
                          {isExpanded ? "Hide" : "History"}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="border-t pt-3 space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-2">Recent Execution Runs</p>
                            {agent.recentRuns?.length > 0 ? (
                              <div className="space-y-2">
                                {agent.recentRuns.map((run: any) => (
                                  <div key={run.id} className="bg-background/80 rounded p-2 text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-muted-foreground">
                                        {new Date(run.startTime).toLocaleString()}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        {run.durationMs && (
                                          <span className="text-muted-foreground">{formatDuration(run.durationMs)}</span>
                                        )}
                                        {run.qualityScore && (
                                          <Badge variant={run.qualityScore >= 7 ? "secondary" : run.qualityScore >= 4 ? "outline" : "destructive"}>
                                            {run.qualityScore}/10
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {run.actionLog && (
                                      <div className="pl-2 border-l-2 border-muted space-y-0.5">
                                        {(run.actionLog as string[]).map((action: string, i: number) => (
                                          <p key={i} className="text-muted-foreground">{action}</p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No runs yet. Click "Run Now" to execute this agent.</p>
                            )}
                          </div>

                          {agent.memory?.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Agent Memory</p>
                              <div className="space-y-1">
                                {agent.memory.slice(0, 3).map((mem: any) => (
                                  <div key={mem.id} className="bg-background/80 rounded p-2 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{mem.key}</span>
                                      <span className="text-muted-foreground">{new Date(mem.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-muted-foreground capitalize">{mem.category}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ========== USERS TAB ========== */}
        <TabsContent value="users" className="space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u: any) => (
                <Card key={u.id} className={u.status === "SUSPENDED" ? "border-red-200 bg-red-50/30" : ""} data-testid={`card-user-${u.id}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{u.name}</p>
                          <Badge variant={u.role === "BUDDY" ? "default" : "secondary"} className="text-xs">
                            {u.role}
                          </Badge>
                          <Badge variant={u.status === "ACTIVE" ? "outline" : "destructive"} className="text-xs">
                            {u.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {u.role === "BUDDY" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleVerification(u.id, "identityVerified", true)}
                              disabled={loadingAction === `verify-${u.id}-identityVerified`}
                              data-testid={`button-verify-id-${u.id}`}
                            >
                              {loadingAction === `verify-${u.id}-identityVerified` ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                              Verify ID
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleVerification(u.id, "backgroundCheckPassed", true)}
                              disabled={loadingAction === `verify-${u.id}-backgroundCheckPassed`}
                              data-testid={`button-verify-bg-${u.id}`}
                            >
                              {loadingAction === `verify-${u.id}-backgroundCheckPassed` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3 mr-1" />}
                              BG Check
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleVerification(u.id, "isCertified", true)}
                              disabled={loadingAction === `verify-${u.id}-isCertified`}
                              data-testid={`button-certify-${u.id}`}
                            >
                              Certify
                            </Button>
                          </>
                        )}
                        {u.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                            onClick={() => handleUserStatus(u.id, "SUSPENDED")}
                            disabled={loadingAction === `user-${u.id}`}
                            data-testid={`button-suspend-${u.id}`}
                          >
                            {loadingAction === `user-${u.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserX className="h-3 w-3 mr-1" />}
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            className="text-xs"
                            onClick={() => handleUserStatus(u.id, "ACTIVE")}
                            disabled={loadingAction === `user-${u.id}`}
                            data-testid={`button-activate-${u.id}`}
                          >
                            {loadingAction === `user-${u.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3 mr-1" />}
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========== BOOKINGS TAB ========== */}
        <TabsContent value="bookings" className="space-y-3">
          {allBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            allBookings.map((b: any) => (
              <Card key={b.id} data-testid={`card-admin-booking-${b.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={
                          b.status === "CONFIRMED" ? "default"
                            : b.status === "COMPLETED" ? "secondary"
                            : b.status === "PENDING" ? "outline"
                            : "destructive"
                        }>
                          {b.status}
                        </Badge>
                        <span className="font-medium">{b.activity || "Session"}</span>
                        <span className="text-xs text-muted-foreground font-mono">#{b.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Client: {b.clientId.slice(0, 8)}...</span>
                        <span>Buddy: {b.buddyId.slice(0, 8)}...</span>
                        <span>{new Date(b.startTime).toLocaleDateString()}</span>
                        {b.totalPrice && <span className="font-medium text-foreground">${parseFloat(b.totalPrice).toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ========== SAFETY REPORTS TAB ========== */}
        <TabsContent value="reports" className="space-y-4">
          {openReports.length > 0 && (
            <Card className="border-red-200 bg-red-50/50" data-testid="card-open-reports-alert">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">{openReports.length} open report{openReports.length > 1 ? "s" : ""} requiring attention</p>
                </div>
              </CardContent>
            </Card>
          )}

          {allReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No safety reports filed</p>
              </CardContent>
            </Card>
          ) : (
            allReports.map((r: any) => (
              <Card key={r.id} className={r.status === "OPEN" ? "border-red-200" : r.status === "INVESTIGATING" ? "border-amber-200" : ""} data-testid={`card-report-${r.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={
                          r.status === "OPEN" ? "destructive"
                            : r.status === "INVESTIGATING" ? "outline"
                            : "secondary"
                        }>
                          {r.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">{r.category?.replace(/_/g, " ")}</Badge>
                      </div>
                      {r.description && (
                        <p className="text-sm text-muted-foreground">{r.description}</p>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Reporter: {r.reporterId.slice(0, 8)}...</span>
                        <span>Reported: {r.reportedUserId.slice(0, 8)}...</span>
                        <span>Filed: {new Date(r.createdAt).toLocaleDateString()}</span>
                        {r.resolvedAt && <span>Resolved: {new Date(r.resolvedAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {r.status === "OPEN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportStatus(r.id, "INVESTIGATING")}
                          disabled={loadingAction === `report-${r.id}`}
                          data-testid={`button-investigate-${r.id}`}
                        >
                          {loadingAction === `report-${r.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3 mr-1" />}
                          Investigate
                        </Button>
                      )}
                      {(r.status === "OPEN" || r.status === "INVESTIGATING") && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleReportStatus(r.id, "RESOLVED")}
                          disabled={loadingAction === `report-${r.id}`}
                          data-testid={`button-resolve-${r.id}`}
                        >
                          {loadingAction === `report-${r.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

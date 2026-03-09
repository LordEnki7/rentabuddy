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
  XCircle, UserCheck, UserX, Loader2, BarChart3, Eye, Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

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

  const openReports = allReports.filter((r: any) => r.status === "OPEN");
  const investigatingReports = allReports.filter((r: any) => r.status === "INVESTIGATING");

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

      {/* Stats Overview */}
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

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full md:w-auto mb-6 bg-transparent p-0 border-b border-border rounded-none h-auto justify-start space-x-6">
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
            Safety Reports ({allReports.length})
            {openReports.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">{openReports.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
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

        {/* Bookings Tab */}
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

        {/* Safety Reports Tab */}
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

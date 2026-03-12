import { db } from "./storage";
import { eq, desc, sql, and, gte, count } from "drizzle-orm";
import {
  agents, agentJobs, agentRuns, agentMemory,
  users, bookings, reviews, safetyReports, buddyProfiles, transactions,
  type Agent, type AgentJob, type AgentRun, type AgentMemory,
} from "@shared/schema";

const AGENT_DEFINITIONS = [
  {
    name: "Platform Operations Agent",
    role: "OPERATIONS",
    description: "Monitors platform health, tracks KPIs, generates daily executive briefings with revenue, bookings, user growth, and actionable insights.",
    capabilities: [
      "daily_executive_brief",
      "revenue_tracking",
      "booking_analytics",
      "user_growth_monitoring",
      "platform_health_check",
    ],
  },
  {
    name: "Safety & Governance Agent",
    role: "SAFETY",
    description: "Enforces platform safety policies. Auto-flags suspicious booking patterns, monitors report escalation timelines, detects repeat offenders, and enforces anti-solicitation rules.",
    capabilities: [
      "safety_report_triage",
      "suspicious_pattern_detection",
      "repeat_offender_detection",
      "escalation_monitoring",
      "policy_enforcement_audit",
    ],
  },
  {
    name: "User Engagement Agent",
    role: "ENGAGEMENT",
    description: "Tracks user retention and engagement. Identifies inactive users, monitors buddy response rates, flags incomplete profiles, and recommends re-engagement actions.",
    capabilities: [
      "inactive_user_detection",
      "buddy_response_rate_tracking",
      "incomplete_profile_detection",
      "booking_conversion_analysis",
      "churn_risk_scoring",
    ],
  },
  {
    name: "Quality & Review Agent",
    role: "QUALITY",
    description: "Analyzes review quality and patterns. Detects fake or suspicious reviews, tracks buddy performance trends, identifies top performers, and flags declining ratings.",
    capabilities: [
      "review_pattern_analysis",
      "fake_review_detection",
      "buddy_performance_scoring",
      "top_performer_identification",
      "rating_trend_analysis",
    ],
  },
];

export async function seedAgents() {
  for (const def of AGENT_DEFINITIONS) {
    const existing = await db.select().from(agents).where(eq(agents.role, def.role));
    if (existing.length === 0) {
      await db.insert(agents).values({
        name: def.name,
        role: def.role,
        description: def.description,
        capabilities: def.capabilities,
        status: "ACTIVE",
      });
    }
  }
  console.log("Agents seeded");
}

async function createRun(agentId: string, jobId: string | null, actionLog: string[], outputSummary: string, qualityScore: number, startTime: Date) {
  const endTime = new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  await db.insert(agentRuns).values({
    agentId,
    jobId,
    actionLog,
    outputSummary,
    qualityScore,
    startTime,
    endTime,
    durationMs,
  });
  await db.update(agents).set({ lastActiveAt: endTime }).where(eq(agents.id, agentId));
}

async function storeMemory(agentId: string, category: string, key: string, value: Record<string, any>) {
  const existing = await db.select().from(agentMemory)
    .where(and(eq(agentMemory.agentId, agentId), eq(agentMemory.key, key)));
  if (existing.length > 0) {
    await db.update(agentMemory).set({ value, updatedAt: new Date() })
      .where(eq(agentMemory.id, existing[0].id));
  } else {
    await db.insert(agentMemory).values({ agentId, category, key, value });
  }
}

// ========== OPERATIONS AGENT ==========
async function runOperationsAgent(agent: Agent) {
  const startTime = new Date();
  const actions: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  actions.push("Scanning platform metrics...");

  const allUsers = await db.select().from(users);
  const totalUsers = allUsers.filter(u => u.role !== 'ADMIN').length;
  const newUsersThisWeek = allUsers.filter(u => u.role !== 'ADMIN' && u.createdAt >= weekAgo).length;
  const activeClients = allUsers.filter(u => u.role === 'CLIENT' && u.status === 'ACTIVE').length;
  const activeBuddies = allUsers.filter(u => u.role === 'BUDDY' && u.status === 'ACTIVE').length;

  actions.push(`Found ${totalUsers} total users (${newUsersThisWeek} new this week)`);

  const allBookings = await db.select().from(bookings);
  const totalBookings = allBookings.length;
  const pendingBookings = allBookings.filter(b => b.status === 'PENDING').length;
  const completedBookings = allBookings.filter(b => b.status === 'COMPLETED').length;
  const canceledBookings = allBookings.filter(b => b.status === 'CANCELED' || b.status === 'REJECTED').length;
  const weekBookings = allBookings.filter(b => b.createdAt >= weekAgo).length;

  const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
  const cancelRate = totalBookings > 0 ? Math.round((canceledBookings / totalBookings) * 100) : 0;

  actions.push(`Bookings: ${totalBookings} total, ${pendingBookings} pending, ${completionRate}% completion rate`);

  const totalRevenue = completedBookings > 0
    ? allBookings.filter(b => b.status === 'COMPLETED').reduce((sum, b) => sum + parseFloat(String(b.totalPrice || '0')), 0)
    : 0;

  actions.push(`Revenue: $${totalRevenue.toFixed(2)} total from completed bookings`);

  const openReports = await db.select().from(safetyReports).where(eq(safetyReports.status, 'OPEN'));
  actions.push(`Safety: ${openReports.length} open reports requiring attention`);

  const priorities: any[] = [];
  if (openReports.length > 0) priorities.push({ title: "Resolve open safety reports", urgency: "HIGH", impact: "Platform trust", count: openReports.length });
  if (pendingBookings > 5) priorities.push({ title: "Address pending booking backlog", urgency: "MEDIUM", impact: "User experience", count: pendingBookings });
  if (cancelRate > 30) priorities.push({ title: "Investigate high cancellation rate", urgency: "HIGH", impact: "Revenue loss", rate: cancelRate + "%" });
  if (newUsersThisWeek === 0) priorities.push({ title: "User acquisition stalled", urgency: "MEDIUM", impact: "Growth" });

  const briefing = {
    date: new Date().toISOString().split('T')[0],
    executiveSummary: `Platform has ${totalUsers} users (${activeBuddies} buddies, ${activeClients} clients). ${weekBookings} bookings this week. Completion rate: ${completionRate}%. Revenue: $${totalRevenue.toFixed(2)}.`,
    metrics: {
      totalUsers, activeBuddies, activeClients, newUsersThisWeek,
      totalBookings, pendingBookings, completedBookings,
      completionRate, cancelRate, totalRevenue,
      openSafetyReports: openReports.length,
    },
    priorityActions: priorities,
    healthScore: Math.max(0, 100 - (openReports.length * 10) - (cancelRate > 30 ? 20 : 0) - (pendingBookings > 10 ? 10 : 0)),
  };

  actions.push(`Generated executive briefing. Platform health score: ${briefing.healthScore}/100`);

  await storeMemory(agent.id, "briefing", "daily_brief_" + briefing.date, briefing);
  await storeMemory(agent.id, "metrics", "latest_metrics", briefing.metrics);

  const qualityScore = Math.min(10, Math.max(1, Math.round(briefing.healthScore / 10)));

  await createRun(agent.id, null, actions, JSON.stringify(briefing), qualityScore, startTime);

  return briefing;
}

// ========== SAFETY AGENT ==========
async function runSafetyAgent(agent: Agent) {
  const startTime = new Date();
  const actions: string[] = [];

  actions.push("Scanning safety data...");

  const allReports = await db.select().from(safetyReports);
  const openReports = allReports.filter(r => r.status === 'OPEN');
  const investigatingReports = allReports.filter(r => r.status === 'INVESTIGATING');

  actions.push(`Found ${allReports.length} total reports: ${openReports.length} open, ${investigatingReports.length} investigating`);

  const reportedUserIds = allReports.map(r => r.reportedUserId);
  const repeatOffenders: Record<string, number> = {};
  reportedUserIds.forEach(id => { repeatOffenders[id] = (repeatOffenders[id] || 0) + 1; });
  const flaggedUsers = Object.entries(repeatOffenders).filter(([_, count]) => count >= 2);

  actions.push(`Repeat offender scan: ${flaggedUsers.length} users with 2+ reports`);

  const allBookings = await db.select().from(bookings);
  const suspiciousPatterns: any[] = [];

  const userBookingCounts: Record<string, number> = {};
  const recentBookings = allBookings.filter(b => {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return b.createdAt >= dayAgo;
  });
  recentBookings.forEach(b => {
    userBookingCounts[b.clientId] = (userBookingCounts[b.clientId] || 0) + 1;
  });
  Object.entries(userBookingCounts).forEach(([userId, count]) => {
    if (count >= 5) {
      suspiciousPatterns.push({ type: "rapid_booking", userId, bookingsIn24h: count, risk: "MEDIUM" });
    }
  });

  actions.push(`Suspicious pattern detection: ${suspiciousPatterns.length} patterns found`);

  const staleReports = openReports.filter(r => {
    const hoursSinceCreated = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
    return hoursSinceCreated > 24;
  });

  actions.push(`Escalation check: ${staleReports.length} reports open >24h`);

  const alerts: any[] = [];
  if (staleReports.length > 0) alerts.push({ type: "ESCALATION", message: `${staleReports.length} safety reports need attention (open >24h)`, severity: "HIGH" });
  flaggedUsers.forEach(([userId, count]) => {
    alerts.push({ type: "REPEAT_OFFENDER", message: `User ${userId.slice(0, 8)}... has ${count} reports filed against them`, severity: count >= 3 ? "CRITICAL" : "HIGH", userId });
  });
  suspiciousPatterns.forEach(p => {
    alerts.push({ type: "SUSPICIOUS_ACTIVITY", message: `User ${p.userId.slice(0, 8)}... made ${p.bookingsIn24h} bookings in 24h`, severity: "MEDIUM", userId: p.userId });
  });

  const safetyReport = {
    date: new Date().toISOString().split('T')[0],
    totalReports: allReports.length,
    openReports: openReports.length,
    investigatingReports: investigatingReports.length,
    repeatOffenders: flaggedUsers.map(([id, cnt]) => ({ userId: id, reportCount: cnt })),
    suspiciousPatterns,
    escalations: staleReports.length,
    alerts,
    riskLevel: alerts.some(a => a.severity === 'CRITICAL') ? 'CRITICAL' : alerts.some(a => a.severity === 'HIGH') ? 'HIGH' : alerts.length > 0 ? 'MEDIUM' : 'LOW',
  };

  await storeMemory(agent.id, "safety", "latest_safety_report", safetyReport);
  await createRun(agent.id, null, actions, JSON.stringify(safetyReport), openReports.length === 0 ? 9 : Math.max(3, 8 - openReports.length), startTime);

  return safetyReport;
}

// ========== ENGAGEMENT AGENT ==========
async function runEngagementAgent(agent: Agent) {
  const startTime = new Date();
  const actions: string[] = [];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  actions.push("Analyzing user engagement...");

  const allUsers = await db.select().from(users);
  const allBookings = await db.select().from(bookings);
  const allProfiles = await db.select().from(buddyProfiles);

  const buddyUsers = allUsers.filter(u => u.role === 'BUDDY' && u.status === 'ACTIVE');
  const clientUsers = allUsers.filter(u => u.role === 'CLIENT' && u.status === 'ACTIVE');

  const inactiveClients = clientUsers.filter(u => {
    const hasRecentBooking = allBookings.some(b => b.clientId === u.id && b.createdAt >= monthAgo);
    return !hasRecentBooking;
  });

  actions.push(`Inactive client detection: ${inactiveClients.length} clients with no bookings in 30 days`);

  const incompleteProfiles = allProfiles.filter(p => !p.headline || !p.bio || !p.hourlyRate || !p.activities || (p.activities as string[]).length === 0);
  actions.push(`Incomplete buddy profiles: ${incompleteProfiles.length}`);

  const buddyResponseRates: any[] = [];
  for (const buddy of buddyUsers) {
    const buddyBookings = allBookings.filter(b => b.buddyId === buddy.id);
    const total = buddyBookings.length;
    if (total === 0) continue;
    const responded = buddyBookings.filter(b => b.status !== 'PENDING').length;
    const rate = Math.round((responded / total) * 100);
    if (rate < 80) {
      buddyResponseRates.push({ userId: buddy.id, name: buddy.name, totalRequests: total, responded, responseRate: rate });
    }
  }

  actions.push(`Low response rate buddies: ${buddyResponseRates.length}`);

  const bookingConversion = clientUsers.length > 0
    ? Math.round((clientUsers.filter(u => allBookings.some(b => b.clientId === u.id)).length / clientUsers.length) * 100)
    : 0;

  actions.push(`Booking conversion rate: ${bookingConversion}% of clients have made at least one booking`);

  const churnRisks = inactiveClients.map(u => ({
    userId: u.id,
    name: u.name,
    daysSinceLastActivity: Math.round((Date.now() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    risk: "HIGH",
  }));

  const engagementReport = {
    date: new Date().toISOString().split('T')[0],
    totalActiveClients: clientUsers.length,
    totalActiveBuddies: buddyUsers.length,
    inactiveClients: inactiveClients.length,
    incompleteProfiles: incompleteProfiles.length,
    lowResponseBuddies: buddyResponseRates,
    bookingConversionRate: bookingConversion,
    churnRisks: churnRisks.slice(0, 10),
    recommendations: [
      ...(inactiveClients.length > 0 ? [`Send re-engagement notifications to ${inactiveClients.length} inactive clients`] : []),
      ...(incompleteProfiles.length > 0 ? [`Prompt ${incompleteProfiles.length} buddies to complete their profiles`] : []),
      ...(buddyResponseRates.length > 0 ? [`Coach ${buddyResponseRates.length} buddies on improving response rates`] : []),
      ...(bookingConversion < 50 ? [`Improve onboarding flow — only ${bookingConversion}% of clients have booked`] : []),
    ],
  };

  await storeMemory(agent.id, "engagement", "latest_engagement_report", engagementReport);
  await createRun(agent.id, null, actions, JSON.stringify(engagementReport), Math.min(9, Math.max(4, 10 - Math.floor(inactiveClients.length / 3))), startTime);

  return engagementReport;
}

// ========== QUALITY AGENT ==========
async function runQualityAgent(agent: Agent) {
  const startTime = new Date();
  const actions: string[] = [];

  actions.push("Analyzing review quality and buddy performance...");

  const allReviews = await db.select().from(reviews);
  const allProfiles = await db.select().from(buddyProfiles);
  const allUsers = await db.select().from(users);
  const allBookings = await db.select().from(bookings);

  actions.push(`Total reviews: ${allReviews.length}`);

  const suspiciousReviews: any[] = [];
  const reviewerCounts: Record<string, number> = {};
  allReviews.forEach(r => { reviewerCounts[r.clientId] = (reviewerCounts[r.clientId] || 0) + 1; });

  const buddyReviewMap: Record<string, typeof allReviews> = {};
  allReviews.forEach(r => {
    if (!buddyReviewMap[r.buddyId]) buddyReviewMap[r.buddyId] = [];
    buddyReviewMap[r.buddyId].push(r);
  });

  Object.entries(buddyReviewMap).forEach(([buddyId, revs]) => {
    if (revs.length >= 3) {
      const allSameRating = revs.every(r => r.rating === revs[0].rating);
      if (allSameRating && revs[0].rating === 5) {
        suspiciousReviews.push({ buddyId, reason: "All reviews are identical 5-star", count: revs.length });
      }
    }
  });

  actions.push(`Suspicious review patterns: ${suspiciousReviews.length}`);

  const buddyPerformance = allProfiles.map(p => {
    const user = allUsers.find(u => u.id === p.userId);
    const buddyBookings = allBookings.filter(b => b.buddyId === p.userId);
    const completed = buddyBookings.filter(b => b.status === 'COMPLETED').length;
    const total = buddyBookings.length;
    const buddyReviews = allReviews.filter(r => r.buddyId === p.userId);
    const avgRating = buddyReviews.length > 0
      ? buddyReviews.reduce((s, r) => s + r.rating, 0) / buddyReviews.length
      : 0;

    return {
      userId: p.userId,
      name: user?.name || 'Unknown',
      rating: Math.round(avgRating * 100) / 100,
      reviewCount: buddyReviews.length,
      completedBookings: completed,
      totalBookings: total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      isCertified: p.isCertified,
      identityVerified: p.identityVerified,
    };
  });

  const topPerformers = buddyPerformance
    .filter(b => b.reviewCount >= 1 && b.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const decliningPerformers = buddyPerformance.filter(b => b.reviewCount >= 2 && b.rating < 3);

  actions.push(`Top performers: ${topPerformers.length}, Declining: ${decliningPerformers.length}`);

  const platformAvgRating = allReviews.length > 0
    ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length) * 100) / 100
    : 0;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>;
  allReviews.forEach(r => { ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1; });

  const qualityReport = {
    date: new Date().toISOString().split('T')[0],
    totalReviews: allReviews.length,
    platformAverageRating: platformAvgRating,
    ratingDistribution,
    suspiciousReviews,
    topPerformers,
    decliningPerformers,
    buddyPerformance: buddyPerformance.sort((a, b) => b.rating - a.rating),
    recommendations: [
      ...(suspiciousReviews.length > 0 ? [`Investigate ${suspiciousReviews.length} suspicious review patterns`] : []),
      ...(decliningPerformers.length > 0 ? [`Reach out to ${decliningPerformers.length} buddies with declining ratings`] : []),
      ...(platformAvgRating < 3.5 ? [`Platform average rating (${platformAvgRating}) is below target. Consider quality improvement initiatives.`] : []),
    ],
  };

  await storeMemory(agent.id, "quality", "latest_quality_report", qualityReport);
  await createRun(agent.id, null, actions, JSON.stringify(qualityReport), platformAvgRating >= 4 ? 9 : platformAvgRating >= 3 ? 7 : 5, startTime);

  return qualityReport;
}

// ========== ORCHESTRATOR ==========
export async function runAllAgents() {
  const allAgents = await db.select().from(agents).where(eq(agents.status, 'ACTIVE'));
  const results: Record<string, any> = {};

  for (const agent of allAgents) {
    try {
      switch (agent.role) {
        case 'OPERATIONS':
          results[agent.role] = await runOperationsAgent(agent);
          break;
        case 'SAFETY':
          results[agent.role] = await runSafetyAgent(agent);
          break;
        case 'ENGAGEMENT':
          results[agent.role] = await runEngagementAgent(agent);
          break;
        case 'QUALITY':
          results[agent.role] = await runQualityAgent(agent);
          break;
      }
    } catch (err: any) {
      console.error(`Agent ${agent.name} failed:`, err.message);
      results[agent.role] = { error: err.message };
    }
  }

  return results;
}

export async function runSingleAgent(agentId: string) {
  const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
  if (!agent) throw new Error("Agent not found");

  switch (agent.role) {
    case 'OPERATIONS': return runOperationsAgent(agent);
    case 'SAFETY': return runSafetyAgent(agent);
    case 'ENGAGEMENT': return runEngagementAgent(agent);
    case 'QUALITY': return runQualityAgent(agent);
    default: throw new Error("Unknown agent role");
  }
}

export async function getAgentDashboardData() {
  const allAgents = await db.select().from(agents);

  const agentData = await Promise.all(allAgents.map(async (agent) => {
    const recentRuns = await db.select().from(agentRuns)
      .where(eq(agentRuns.agentId, agent.id))
      .orderBy(desc(agentRuns.createdAt))
      .limit(5);

    const recentJobs = await db.select().from(agentJobs)
      .where(eq(agentJobs.agentId, agent.id))
      .orderBy(desc(agentJobs.createdAt))
      .limit(5);

    const memory = await db.select().from(agentMemory)
      .where(eq(agentMemory.agentId, agent.id))
      .orderBy(desc(agentMemory.updatedAt));

    const totalRuns = await db.select({ count: sql<number>`count(*)` }).from(agentRuns).where(eq(agentRuns.agentId, agent.id));
    const avgScore = await db.select({ avg: sql<number>`avg(quality_score)` }).from(agentRuns).where(eq(agentRuns.agentId, agent.id));
    const avgDuration = await db.select({ avg: sql<number>`avg(duration_ms)` }).from(agentRuns).where(eq(agentRuns.agentId, agent.id));

    return {
      ...agent,
      recentRuns,
      recentJobs,
      memory,
      stats: {
        totalRuns: Number(totalRuns[0]?.count || 0),
        avgQualityScore: Math.round(Number(avgScore[0]?.avg || 0) * 10) / 10,
        avgDurationMs: Math.round(Number(avgDuration[0]?.avg || 0)),
      },
    };
  }));

  return agentData;
}

export async function generateDailyBrief() {
  const results = await runAllAgents();
  return {
    generatedAt: new Date().toISOString(),
    agents: results,
  };
}

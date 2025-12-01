import type { RegisterInput, LoginInput } from "@shared/schema";

const API_BASE = "/api";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || "An error occurred");
  }

  return data;
}

export const api = {
  // Auth
  register: (input: RegisterInput) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (input: LoginInput) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  logout: () =>
    fetchAPI("/auth/logout", {
      method: "POST",
    }),

  getCurrentUser: () => fetchAPI("/auth/me"),

  // Profiles
  updateClientProfile: (updates: any) =>
    fetchAPI("/profile/client", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  updateBuddyProfile: (updates: any) =>
    fetchAPI("/profile/buddy", {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  // Buddies
  getBuddies: (filters?: { city?: string; maxRate?: number }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.append("city", filters.city);
    if (filters?.maxRate) params.append("maxRate", filters.maxRate.toString());
    const query = params.toString();
    return fetchAPI(`/buddies${query ? `?${query}` : ""}`);
  },

  getBuddyProfile: (userId: string) => fetchAPI(`/buddies/${userId}`),

  // Bookings
  createBooking: (booking: any) =>
    fetchAPI("/bookings", {
      method: "POST",
      body: JSON.stringify(booking),
    }),

  getBookings: () => fetchAPI("/bookings"),

  updateBookingStatus: (id: string, status: string) =>
    fetchAPI(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Reviews
  createReview: (review: any) =>
    fetchAPI("/reviews", {
      method: "POST",
      body: JSON.stringify(review),
    }),
};

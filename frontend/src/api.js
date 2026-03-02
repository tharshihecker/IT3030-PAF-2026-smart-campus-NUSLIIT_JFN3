const API_BASE = "http://localhost:8080/api";
const USER_API_URL = `${API_BASE}/user`;

/* ── Helpers ─────────────────────────────────────────── */

async function request(path, data) {
  const res = await fetch(`${USER_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const asString = query.toString();
  return asString ? `?${asString}` : "";
}

async function sendJson(method, path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) return res.json();
  return res.text();
}

/* ── Auth ─────────────────────────────────────────────── */

export async function signup(data) {
  return request("/signup", data);
}

export async function login(data) {
  return request("/login", data);
}

/* ── User Profile ────────────────────────────────────── */

export async function fetchProfile(userId) {
  return fetchJson(`/user/profile/${userId}`);
}

export async function updateProfile(userId, data) {
  return sendJson("PUT", `/user/profile/${userId}`, data);
}

export async function changePassword(userId, data) {
  return sendJson("PUT", `/user/change-password/${userId}`, data);
}

/* ── Home Dashboard ──────────────────────────────────── */

export async function fetchHomeSummary() {
  return fetchJson("/home/summary");
}

/* ── Events ──────────────────────────────────────────── */

export async function fetchEvents() {
  return fetchJson("/events");
}

/* ── Resources ───────────────────────────────────────── */

export async function fetchResources() {
  return fetchJson("/resources");
}

/* ── Services ────────────────────────────────────────── */

export async function fetchServices() {
  return fetchJson("/services");
}

/* ── Facilities (public) ──────────────────────────────── */

export async function fetchFacilities(filters = {}) {
  return fetchJson(`/facilities${buildQuery(filters)}`);
}

export async function fetchFacilityById(id) {
  return fetchJson(`/facilities/${id}`);
}

export async function fetchFacilityTypes() {
  return fetchJson("/facilities/metadata/types");
}

export async function fetchFacilityStatuses() {
  return fetchJson("/facilities/metadata/statuses");
}

/* ── Facilities (admin) ───────────────────────────────── */

export async function createFacility(data) {
  return sendJson("POST", "/admin/facilities", data);
}

export async function updateFacility(id, data) {
  return sendJson("PUT", `/admin/facilities/${id}`, data);
}

export async function deleteFacility(id) {
  return sendJson("DELETE", `/admin/facilities/${id}`);
}

/* ── Bookings (user) ──────────────────────────────────── */

export async function createBooking(data) {
  return sendJson("POST", "/bookings", data);
}

export async function fetchUserBookings(userId) {
  return fetchJson(`/bookings/user/${userId}`);
}

export async function fetchFacilityBookings(facilityId) {
  return fetchJson(`/bookings/facility/${facilityId}`);
}

export async function cancelBooking(bookingId, userId) {
  return sendJson("PUT", `/bookings/${bookingId}/cancel?userId=${userId}`);
}

/* ── Bookings (admin) ─────────────────────────────────── */

export async function fetchAllBookings(status) {
  const q = status ? `?status=${status}` : "";
  return fetchJson(`/admin/bookings${q}`);
}

export async function updateBookingStatus(bookingId, status, adminRemarks) {
  return sendJson("PUT", `/admin/bookings/${bookingId}/status`, { status, adminRemarks });
}

export async function deleteBooking(bookingId) {
  return sendJson("DELETE", `/admin/bookings/${bookingId}`);
}

export async function fetchBookingStatuses() {
  return fetchJson("/admin/bookings/statuses");
}

/* ── Admin: Users ─────────────────────────────────────── */

export async function fetchAllUsers(q) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  return fetchJson(`/admin/users${query}`);
}

export async function fetchUserById(id) {
  return fetchJson(`/admin/users/${id}`);
}

export async function updateUserRole(id, role) {
  return sendJson("PUT", `/admin/users/${id}/role`, { role });
}

export async function toggleUserStatus(id) {
  return sendJson("PUT", `/admin/users/${id}/toggle-status`);
}

export async function deleteUser(id) {
  return sendJson("DELETE", `/admin/users/${id}`);
}

export async function fetchUserRoles() {
  return fetchJson("/admin/users/roles");
}

export async function fetchUserStats() {
  return fetchJson("/admin/users/stats");
}

/* ── Admin: Events ────────────────────────────────────── */

export async function fetchAdminEvents() {
  return fetchJson("/admin/events");
}

export async function createEvent(data) {
  return sendJson("POST", "/admin/events", data);
}

export async function updateEvent(id, data) {
  return sendJson("PUT", `/admin/events/${id}`, data);
}

export async function deleteEvent(id) {
  return sendJson("DELETE", `/admin/events/${id}`);
}

/* ── Admin: Services ──────────────────────────────────── */

export async function fetchAdminServices() {
  return fetchJson("/admin/services");
}

export async function createService(data) {
  return sendJson("POST", "/admin/services", data);
}

export async function updateService(id, data) {
  return sendJson("PUT", `/admin/services/${id}`, data);
}

export async function deleteService(id) {
  return sendJson("DELETE", `/admin/services/${id}`);
}

/* ── Admin: Resources ─────────────────────────────────── */

export async function fetchAdminResources() {
  return fetchJson("/admin/resources");
}

export async function createResource(data) {
  return sendJson("POST", "/admin/resources", data);
}

export async function updateResource(id, data) {
  return sendJson("PUT", `/admin/resources/${id}`, data);
}

export async function deleteResource(id) {
  return sendJson("DELETE", `/admin/resources/${id}`);
}

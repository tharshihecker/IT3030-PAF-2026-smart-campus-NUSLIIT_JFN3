const API_BASE = "http://localhost:8080/api";
const USER_API_URL = `${API_BASE}/user`;

async function request(path, data) {
  const res = await fetch(`${USER_API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || "Request failed");
  }

  return text;
}

export async function signup(data) {
  return request("/signup", data);
}

export async function login(data) {
  return request("/login", data);
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export async function fetchHomeSummary() {
  return fetchJson("/home/summary");
}

export async function fetchEvents() {
  return fetchJson("/events");
}

export async function fetchResources() {
  return fetchJson("/resources");
}

export async function fetchServices() {
  return fetchJson("/services");
}

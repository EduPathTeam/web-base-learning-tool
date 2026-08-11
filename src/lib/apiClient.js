// Thin fetch wrapper for the server/ Express API. Always sends the session
// cookie (credentials: 'include') so express-session recognizes the caller.
const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    // fetch() itself throws (not an HTTP error response) when the server
    // can't be reached at all — most commonly because only the frontend
    // (`npm run dev`) is running and the backend (`npm run dev` in
    // server/) was never started. Surface something a user can act on
    // instead of a raw "Failed to fetch" / "NetworkError".
    throw new Error("Can't reach the server. Please check your connection, or ask an admin if the issue continues.");
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export const apiGet = (path) => request(path, { method: 'GET' });
export const apiPost = (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) });

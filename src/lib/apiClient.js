// Thin fetch wrapper for the server/ Express API. Always sends the session
// cookie (credentials: 'include') so express-session recognizes the caller.
const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

// The backend requires an x-csrf-token header on every state-changing
// request (see server/src/app.js's doubleCsrfProtection). The token is
// cached after the first fetch so most requests don't pay an extra round
// trip; it's a per-request header value, not a secret, so caching it in
// memory is fine.
let csrfTokenPromise = null;

function fetchCsrfToken() {
  csrfTokenPromise = fetch(`${API_BASE}/csrf-token`, { credentials: 'include' })
    .then((res) => res.json())
    .then((data) => data.csrfToken)
    .catch((err) => {
      csrfTokenPromise = null;
      throw err;
    });
  return csrfTokenPromise;
}

function getCsrfToken() {
  return csrfTokenPromise || fetchCsrfToken();
}

async function request(path, options = {}, isRetry = false) {
  let res;
  try {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const method = options.method || 'GET';
    if (method !== 'GET') {
      headers['x-csrf-token'] = await getCsrfToken();
    }
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch {
    // fetch() itself throws (not an HTTP error response) when the server
    // can't be reached at all — most commonly because only the frontend
    // (`npm run dev`) is running and the backend (`npm run dev` in
    // server/) was never started. Surface something a user can act on
    // instead of a raw "Failed to fetch" / "NetworkError".
    throw new Error(
      "Can't reach the server. Please check your connection, or ask an admin if the issue continues."
    );
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    // A cached token can go stale (server restarted, cookie expired). On
    // the first such failure, drop the cache and retry exactly once with
    // a fresh token before surfacing an error to the caller.
    if (res.status === 403 && body?.code === 'EBADCSRFTOKEN' && !isRetry) {
      csrfTokenPromise = null;
      return request(path, options, true);
    }
    const message = body?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body;
}

export const apiGet = (path) => request(path, { method: 'GET' });
export const apiPost = (path, data) =>
  request(path, { method: 'POST', body: JSON.stringify(data) });
export const apiPatch = (path, data) =>
  request(path, { method: 'PATCH', body: JSON.stringify(data) });

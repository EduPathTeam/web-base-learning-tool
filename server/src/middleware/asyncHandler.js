// Express 4 doesn't auto-catch rejected promises from async route
// handlers — without this, a thrown DB error would hang the request
// instead of reaching the centralized error handler in index.js.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

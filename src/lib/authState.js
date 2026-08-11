// Tiny module-level mirror of "who is signed in", readable from plain
// (non-React) modules like csPlatform.js. AuthContext.jsx is the only
// writer — it calls setCurrentUser() whenever the session state changes.
let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}

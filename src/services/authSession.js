import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, authStateReady } from "../firebase";

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_STARTED_KEY = "munchmap:session-started-at";
const LAST_ACTIVITY_KEY = "munchmap:last-activity-at";
const PENDING_LOGIN_KEY = "munchmap:pending-login";
const ACTIVITY_EVENTS = ["click", "keydown", "mousedown", "scroll", "touchstart"];

let routerRef = null;
let sessionTimerId = null;
let authListenerBound = false;
let activityListenersBound = false;
let isEndingSession = false;

const readTimestamp = (key) => {
  const rawValue = window.sessionStorage.getItem(key);
  const parsedValue = Number(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

const writeTimestamp = (key, value = Date.now()) => {
  window.sessionStorage.setItem(key, String(value));
};

const clearSessionMetadata = () => {
  window.sessionStorage.removeItem(SESSION_STARTED_KEY);
  window.sessionStorage.removeItem(LAST_ACTIVITY_KEY);
  window.sessionStorage.removeItem(PENDING_LOGIN_KEY);
};

const hasPendingLogin = () =>
  window.sessionStorage.getItem(PENDING_LOGIN_KEY) === "1";

const clearSessionTimer = () => {
  if (sessionTimerId !== null) {
    window.clearTimeout(sessionTimerId);
    sessionTimerId = null;
  }
};

const scheduleSessionTimeout = () => {
  clearSessionTimer();

  if (!auth.currentUser) {
    return;
  }

  const lastActivityAt = readTimestamp(LAST_ACTIVITY_KEY);
  if (!lastActivityAt) {
    return;
  }

  const remainingMs = SESSION_TIMEOUT_MS - (Date.now() - lastActivityAt);
  if (remainingMs <= 0) {
    void endSession("expired");
    return;
  }

  sessionTimerId = window.setTimeout(() => {
    void endSession("expired");
  }, remainingMs);
};

const markActiveSession = () => {
  if (!auth.currentUser) {
    return;
  }

  const now = Date.now();
  if (!readTimestamp(SESSION_STARTED_KEY)) {
    writeTimestamp(SESSION_STARTED_KEY, now);
  }

  writeTimestamp(LAST_ACTIVITY_KEY, now);
  window.sessionStorage.removeItem(PENDING_LOGIN_KEY);
  scheduleSessionTimeout();
};

const handleUserActivity = () => {
  if (!auth.currentUser) {
    return;
  }

  markActiveSession();
};

const handleVisibilityChange = () => {
  if (!auth.currentUser || document.visibilityState !== "visible") {
    return;
  }

  const lastActivityAt = readTimestamp(LAST_ACTIVITY_KEY);
  if (lastActivityAt && Date.now() - lastActivityAt >= SESSION_TIMEOUT_MS) {
    void endSession("expired");
    return;
  }

  markActiveSession();
};

const bindActivityListeners = () => {
  if (activityListenersBound) {
    return;
  }

  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, handleUserActivity, { passive: true });
  });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  activityListenersBound = true;
};

const syncSessionWithAuthState = async (user) => {
  clearSessionTimer();

  if (!user) {
    clearSessionMetadata();
    return;
  }

  bindActivityListeners();

  const lastActivityAt = readTimestamp(LAST_ACTIVITY_KEY);
  if (!lastActivityAt) {
    if (hasPendingLogin()) {
      markActiveSession();
      return;
    }

    await endSession("closed");
    return;
  }

  if (Date.now() - lastActivityAt >= SESSION_TIMEOUT_MS) {
    await endSession("expired");
    return;
  }

  markActiveSession();
};

export const prepareSessionLogin = () => {
  window.sessionStorage.setItem(PENDING_LOGIN_KEY, "1");
};

export const clearPreparedSessionLogin = () => {
  window.sessionStorage.removeItem(PENDING_LOGIN_KEY);
};

export const markSessionActive = () => {
  markActiveSession();
};

export const waitForAuthReady = () => authStateReady;

export const endSession = async (reason = "manual", redirectPath = "/") => {
  if (isEndingSession) {
    return;
  }

  isEndingSession = true;
  clearSessionTimer();
  clearSessionMetadata();

  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } finally {
    if (routerRef && routerRef.currentRoute.value.path !== redirectPath) {
      const target =
        reason === "expired"
          ? { path: redirectPath, query: { session: "expired" } }
          : redirectPath;
      await routerRef.replace(target).catch(() => {});
    }

    isEndingSession = false;
  }
};

export const initializeAuthSession = async (router) => {
  routerRef = router;
  bindActivityListeners();
  await authStateReady;

  if (!authListenerBound) {
    onAuthStateChanged(auth, (user) => {
      void syncSessionWithAuthState(user);
    });
    authListenerBound = true;
  }

  await syncSessionWithAuthState(auth.currentUser);
};

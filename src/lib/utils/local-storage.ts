import { browser } from '$app/environment';
import { INTERVIEW_STORAGE_KEY } from '$lib/utils/constants';
import { createEmptySession, migrateSession, type InterviewSession } from '$lib/utils/session';

export const safeStorageAvailable = (): boolean => {
  if (!browser) {
    return false;
  }

  try {
    const key = '__folkline_storage_test__';
    window.localStorage.setItem(key, 'ok');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const loadSession = (): InterviewSession => {
  if (!safeStorageAvailable()) {
    return createEmptySession();
  }

  try {
    const raw = window.localStorage.getItem(INTERVIEW_STORAGE_KEY);
    return raw ? migrateSession(JSON.parse(raw)) : createEmptySession();
  } catch {
    return createEmptySession();
  }
};

export const saveSession = (session: InterviewSession): boolean => {
  if (!safeStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
};

export const clearSession = (): boolean => {
  if (!safeStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(INTERVIEW_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
};

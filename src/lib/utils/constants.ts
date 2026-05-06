export const APP_NAME = 'Folkline';
export const APP_TAGLINE = 'Your questions. Their story. Before it’s too late.';
export const APP_SUBHEAD =
  'A free tool to help you prepare for — and capture — a conversation with someone whose memories matter.';
export const INTERVIEW_STORAGE_KEY = 'folkline.interview.v1';
export const SESSION_VERSION = 1;

export const INTERVIEW_STEP_ORDER = ['prepare', 'conduct', 'capture', 'receive'] as const;
export type InterviewStep = (typeof INTERVIEW_STEP_ORDER)[number];

export const THEME_OPTIONS = [
  'childhood',
  'emigration',
  'work',
  'war',
  'family stories',
  'objects and photographs',
  'health history',
  'beliefs'
] as const;

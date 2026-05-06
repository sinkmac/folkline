import type { InterviewGuide } from '$lib/schemas/guide-output';
import type { CaptureState } from '$lib/schemas/capture';
import { interviewInputSchema, type InterviewInput } from '$lib/schemas/interview-input';
import { INTERVIEW_STEP_ORDER, SESSION_VERSION, type InterviewStep } from '$lib/utils/constants';

export type InterviewSession = {
  version: number;
  currentStep: InterviewStep;
  metadata: InterviewInput;
  guide: InterviewGuide | null;
  capture: CaptureState;
  createdAt: string;
  updatedAt: string;
};

export const createEmptySession = (): InterviewSession => {
  const now = new Date().toISOString();

  return {
    version: SESSION_VERSION,
    currentStep: INTERVIEW_STEP_ORDER[0],
    metadata: interviewInputSchema.parse({}),
    guide: null,
    capture: {
      notesByQuestionId: {},
      freeNotes: '',
      lastSavedAt: undefined
    },
    createdAt: now,
    updatedAt: now
  };
};

export const migrateSession = (value: unknown): InterviewSession => {
  if (!value || typeof value !== 'object') {
    return createEmptySession();
  }

  const candidate = value as Partial<InterviewSession>;

  if (candidate.version !== SESSION_VERSION) {
    return createEmptySession();
  }

  return {
    version: SESSION_VERSION,
    currentStep: INTERVIEW_STEP_ORDER.includes(candidate.currentStep as InterviewStep)
      ? (candidate.currentStep as InterviewStep)
      : 'prepare',
    metadata: interviewInputSchema.parse(candidate.metadata ?? {}),
    guide: candidate.guide ?? null,
    capture: {
      notesByQuestionId:
        candidate.capture && typeof candidate.capture.notesByQuestionId === 'object'
          ? candidate.capture.notesByQuestionId
          : {},
      freeNotes: candidate.capture?.freeNotes ?? '',
      lastSavedAt: candidate.capture?.lastSavedAt
    },
    createdAt: candidate.createdAt ?? new Date().toISOString(),
    updatedAt: candidate.updatedAt ?? new Date().toISOString()
  };
};

export const touchSession = (session: InterviewSession): InterviewSession => ({
  ...session,
  updatedAt: new Date().toISOString()
});

export const countAnsweredQuestions = (session: InterviewSession): number => {
  return Object.values(session.capture.notesByQuestionId).filter((value) => value.trim().length > 0).length;
};

export const countTotalQuestions = (session: InterviewSession): number => {
  return session.guide?.sections.reduce((sum, section) => sum + section.questions.length, 0) ?? 0;
};

export const hasAnyCapturedNotes = (session: InterviewSession): boolean => {
  return countAnsweredQuestions(session) > 0 || session.capture.freeNotes.trim().length > 0;
};

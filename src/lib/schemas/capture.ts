import { z } from 'zod';

export const captureStateSchema = z.object({
  notesByQuestionId: z.record(z.string(), z.string()),
  freeNotes: z.string(),
  lastSavedAt: z.string().optional()
});

export type CaptureState = z.infer<typeof captureStateSchema>;

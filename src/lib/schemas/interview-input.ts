import { z } from 'zod';
import { THEME_OPTIONS } from '$lib/utils/constants';

export const interviewInputSchema = z.object({
  intervieweeName: z.string().trim().min(1).max(80).default(''),
  interviewerName: z.string().trim().max(80).default(''),
  relationship: z.string().trim().min(1).max(80).default(''),
  origin: z.string().trim().min(1).max(120).default(''),
  earlyLifeEra: z.string().trim().min(1).max(120).default(''),
  knownContext: z.string().trim().max(1200).default(''),
  themes: z.array(z.enum(THEME_OPTIONS)).max(8).default([]),
  interviewDate: z.string().trim().max(40).default('')
});

export type InterviewInput = z.infer<typeof interviewInputSchema>;

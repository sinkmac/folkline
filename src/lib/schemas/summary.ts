import { z } from 'zod';

export const summarySectionSchema = z.object({
  title: z.string(),
  body: z.array(z.string())
});

export const summaryDocumentSchema = z.object({
  title: z.string(),
  intervieweeName: z.string(),
  interviewerName: z.string().optional(),
  relationship: z.string(),
  origin: z.string(),
  earlyLifeEra: z.string(),
  interviewDate: z.string(),
  themesCovered: z.array(z.string()),
  sections: z.array(summarySectionSchema),
  freeNotes: z.string().optional()
});

export type SummarySection = z.infer<typeof summarySectionSchema>;
export type SummaryDocument = z.infer<typeof summaryDocumentSchema>;

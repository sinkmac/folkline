import { z } from 'zod';

export const questionItemSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1)
});

export const guideSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  intro: z.string().min(1),
  questions: z.array(questionItemSchema),
  followUps: z.array(z.string().min(1))
});

export const interviewGuideSchema = z.object({
  briefingNote: z.string().min(1),
  openingLines: z.array(z.string().min(1)),
  sensitivityNotes: z.array(z.string().min(1)),
  sections: z.array(guideSectionSchema)
});

export type QuestionItem = z.infer<typeof questionItemSchema>;
export type GuideSection = z.infer<typeof guideSectionSchema>;
export type InterviewGuide = z.infer<typeof interviewGuideSchema>;

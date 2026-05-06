import { z } from 'zod';
import { summaryDocumentSchema } from '$lib/schemas/summary';

export const emailPayloadSchema = z.object({
  email: z.string().trim().email(),
  summary: summaryDocumentSchema,
  honeypot: z.string().optional().default('')
});

export type EmailPayload = z.infer<typeof emailPayloadSchema>;

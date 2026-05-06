import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { interviewInputSchema } from '$lib/schemas/interview-input';
import { generateInterviewGuide } from '$lib/server/anthropic';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = await request.json();
    const input = interviewInputSchema.parse(payload);
    const result = await generateInterviewGuide(input);

    return json({ guide: result.guide, repaired: result.repaired });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';

    return json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: "We couldn't generate a usable interview guide just now. Please try again.",
          details: message
        }
      },
      { status: 422 }
    );
  }
};

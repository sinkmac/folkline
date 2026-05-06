import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { emailPayloadSchema } from '$lib/schemas/email';
import { sendSummaryEmail } from '$lib/server/resend';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = emailPayloadSchema.parse(await request.json());

    if (payload.honeypot) {
      return json({ ok: true });
    }

    await sendSummaryEmail(payload.email, payload.summary);

    return json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';

    return json(
      {
        error: {
          code: 'EMAIL_FAILED',
          message: "We couldn't send that email just now. Your notes are still on this device.",
          details: message
        }
      },
      { status: 500 }
    );
  }
};

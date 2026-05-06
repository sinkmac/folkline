import { Resend } from 'resend';
import type { SummaryDocument } from '$lib/schemas/summary';
import { buildPlainTextSummary } from '$lib/utils/summary-builder';

const footer = 'Still Here helps families record proper testimonies. stillhere.scot';

const buildHtmlSummary = (summary: SummaryDocument) => {
  const sections = summary.sections
    .map(
      (section) => `
        <section style="margin:0 0 20px;">
          <h2 style="font-size:18px;margin:0 0 10px;">${section.title}</h2>
          <ul style="margin:0;padding-left:20px;line-height:1.7;">
            ${section.body.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </section>
      `
    )
    .join('');

  const freeNotes = summary.freeNotes
    ? `<section style="margin:0 0 20px;"><h2 style="font-size:18px;margin:0 0 10px;">Anything else</h2><p style="line-height:1.7;">${summary.freeNotes}</p></section>`
    : '';

  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;max-width:720px;margin:0 auto;padding:24px;">
      <p style="margin:0 0 8px;color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Folkline summary</p>
      <h1 style="margin:0 0 8px;font-size:30px;line-height:1.1;">${summary.title}</h1>
      <p style="margin:0 0 20px;color:#475569;">Recorded ${summary.interviewDate}</p>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 24px;">
        <div><strong>Interviewed</strong><br/>${summary.intervieweeName || 'Not set'}</div>
        <div><strong>Conducted by</strong><br/>${summary.interviewerName || 'Not set'}</div>
        <div><strong>Relationship</strong><br/>${summary.relationship || 'Not set'}</div>
        <div><strong>Origin</strong><br/>${summary.origin || 'Not set'}</div>
        <div><strong>Early life era</strong><br/>${summary.earlyLifeEra || 'Not set'}</div>
        <div><strong>Themes covered</strong><br/>${summary.themesCovered.length ? summary.themesCovered.join(', ') : 'None yet'}</div>
      </div>
      ${sections}
      ${freeNotes}
      <p style="margin-top:28px;color:#475569;font-size:13px;">${footer}</p>
    </div>
  `;
};

export const sendSummaryEmail = async (email: string, summary: SummaryDocument) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error('Resend is not configured.');
  }

  const resend = new Resend(apiKey);
  const text = `${buildPlainTextSummary(summary)}\n\n${footer}`;
  const html = buildHtmlSummary(summary);

  return resend.emails.send({
    from,
    to: email,
    subject: `${summary.title} — recorded ${summary.interviewDate}`,
    text,
    html
  });
};

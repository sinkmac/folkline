import type { SummaryDocument } from '$lib/schemas/summary';
import type { InterviewSession } from '$lib/utils/session';

const dedupe = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

export const buildSummaryDocument = (session: InterviewSession): SummaryDocument => {
  const interviewDate = session.metadata.interviewDate?.trim() || new Date().toLocaleDateString('en-GB');

  const sections = (session.guide?.sections ?? [])
    .map((section) => {
      const body = dedupe(
        section.questions
          .map((question) => session.capture.notesByQuestionId[question.id] ?? '')
          .filter((note) => note.trim().length > 0)
      );

      return {
        title: section.title,
        body
      };
    })
    .filter((section) => section.body.length > 0);

  const freeNotes = session.capture.freeNotes.trim();
  const themesCovered = sections.map((section) => section.title);

  return {
    title: `${session.metadata.intervieweeName || 'Untitled'}'s story`,
    intervieweeName: session.metadata.intervieweeName,
    interviewerName: session.metadata.interviewerName || undefined,
    relationship: session.metadata.relationship,
    origin: session.metadata.origin,
    earlyLifeEra: session.metadata.earlyLifeEra,
    interviewDate,
    themesCovered,
    sections,
    freeNotes: freeNotes || undefined
  };
};

export const buildPlainTextSummary = (summary: SummaryDocument): string => {
  const lines = [
    `${summary.title} — recorded ${summary.interviewDate}`,
    '',
    `Interviewed: ${summary.intervieweeName}`,
    summary.interviewerName ? `Conducted by: ${summary.interviewerName}` : '',
    `Relationship: ${summary.relationship}`,
    `Origin: ${summary.origin}`,
    `Early life era: ${summary.earlyLifeEra}`,
    summary.themesCovered.length ? `Themes covered: ${summary.themesCovered.join(', ')}` : '',
    ''
  ].filter(Boolean);

  for (const section of summary.sections) {
    lines.push(section.title, ...section.body.map((item) => `- ${item}`), '');
  }

  if (summary.freeNotes) {
    lines.push('Anything else', `- ${summary.freeNotes}`, '');
  }

  return lines.join('\n');
};

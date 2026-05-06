import type { SummaryDocument } from '$lib/schemas/summary';

export const hasSummaryContent = (summary: SummaryDocument): boolean => {
  return summary.sections.some((section) => section.body.length > 0) || Boolean(summary.freeNotes?.trim());
};

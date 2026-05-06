import type { InterviewGuide } from '$lib/schemas/guide-output';

const questionStem = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const bannedPhrases = [
  'legacy',
  'testimony capture',
  'oral history instrument',
  'please elaborate extensively',
  'how did that trauma shape you',
  'tell me everything about',
  'describe your socio-economic circumstances'
];

export const countQuestions = (guide: InterviewGuide): number =>
  guide.sections.reduce((sum, section) => sum + section.questions.length, 0);

export const detectDuplicateQuestionStems = (guide: InterviewGuide): string[] => {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const section of guide.sections) {
    for (const question of section.questions) {
      const stem = questionStem(question.text);
      if (seen.has(stem)) {
        duplicates.push(question.text);
      }
      seen.add(stem);
    }
  }

  return duplicates;
};

export const scanForBannedPhrases = (guide: InterviewGuide): string[] => {
  const matches: string[] = [];

  for (const section of guide.sections) {
    for (const question of section.questions) {
      const lower = question.text.toLowerCase();
      for (const phrase of bannedPhrases) {
        if (lower.includes(phrase)) {
          matches.push(question.text);
        }
      }
    }

    for (const prompt of section.followUps) {
      const lower = prompt.toLowerCase();
      for (const phrase of bannedPhrases) {
        if (lower.includes(phrase)) {
          matches.push(prompt);
        }
      }
    }
  }

  return matches;
};

export const enforceLengthRules = (guide: InterviewGuide): string[] => {
  const issues: string[] = [];

  for (const section of guide.sections) {
    for (const question of section.questions) {
      if (question.text.length > 220) {
        issues.push(question.id);
      }
    }

    for (const prompt of section.followUps) {
      if (prompt.length > 220) {
        issues.push(`${section.id}-follow-up`);
      }
    }
  }

  return issues;
};

export const validateGuideShape = (guide: InterviewGuide): string[] => {
  const issues: string[] = [];
  const totalQuestions = countQuestions(guide);

  if (guide.sections.length < 5 || guide.sections.length > 6) {
    issues.push('Guide must contain 5 to 6 sections.');
  }

  if (totalQuestions < 20 || totalQuestions > 30) {
    issues.push('Total questions must be between 20 and 30.');
  }

  for (const section of guide.sections) {
    if (section.questions.length < 3 || section.questions.length > 6) {
      issues.push(`Section "${section.title}" must have 3 to 6 questions.`);
    }

    if (section.followUps.length < 3 || section.followUps.length > 5) {
      issues.push(`Section "${section.title}" must have 3 to 5 follow-up prompts.`);
    }
  }

  const duplicates = detectDuplicateQuestionStems(guide);
  if (duplicates.length > 0) {
    issues.push(`Duplicate questions detected: ${duplicates.join(' | ')}`);
  }

  const banned = scanForBannedPhrases(guide);
  if (banned.length > 0) {
    issues.push(`Banned or suspect phrasing detected: ${banned.join(' | ')}`);
  }

  const lengthIssues = enforceLengthRules(guide);
  if (lengthIssues.length > 0) {
    issues.push(`Questions or follow-ups exceed length guidance: ${lengthIssues.join(', ')}`);
  }

  return issues;
};

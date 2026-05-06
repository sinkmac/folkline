import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Anthropic } from '@anthropic-ai/sdk';
import type { InterviewInput } from '$lib/schemas/interview-input';
import {
  interviewGuideSchema,
  type GuideSection,
  type InterviewGuide,
  type QuestionItem
} from '$lib/schemas/guide-output';

type AnthropicTextBlock = { type: 'text'; text: string };

type GenerationResult = {
  guide: InterviewGuide;
  repaired: boolean;
};

type SectionTemplate = {
  id: string;
  title: string;
  intro: string;
  questionCount: number;
  followUpCount: number;
};

type ConstrainedGuideResponse = {
  briefingNote: string;
  openingLines: string[];
  sensitivityNotes: string[];
  sections: Array<{
    id: string;
    questions: string[];
    followUps: string[];
  }>;
};

const PROMPT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../docs/prompts/question-generator-constrained-system-prompt.md'
);

const loadSystemPrompt = () => readFileSync(PROMPT_PATH, 'utf8');

const MODEL = 'claude-haiku-4-5-20251001';

const baseSectionTemplates: SectionTemplate[] = [
  {
    id: 'childhood-and-place',
    title: 'Childhood and place',
    intro: 'Let\'s start with where you grew up and what the place felt like day to day.',
    questionCount: 4,
    followUpCount: 4
  },
  {
    id: 'family-and-relationships',
    title: 'Family and relationships',
    intro: 'Now let\'s talk about the people around you and what family life was like.',
    questionCount: 4,
    followUpCount: 4
  },
  {
    id: 'work-and-daily-life',
    title: 'Work and daily life',
    intro: 'I\'d like to hear about how you spent your days, and about any work that became part of your life.',
    questionCount: 4,
    followUpCount: 4
  },
  {
    id: 'hard-times-and-major-events',
    title: 'Hard times and major events',
    intro: 'Every life has stretches that are harder or more uncertain. If any come to mind, we can talk about those gently.',
    questionCount: 3,
    followUpCount: 3
  },
  {
    id: 'objects-photos-and-stories',
    title: 'Objects, photos and remembered stories',
    intro: 'Sometimes a photograph, keepsake, or family story unlocks detail that nothing else does.',
    questionCount: 4,
    followUpCount: 4
  },
  {
    id: 'looking-back',
    title: 'Looking back',
    intro: 'As you look back now, I\'d like to hear what stands out and what still feels important.',
    questionCount: 3,
    followUpCount: 3
  }
];

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

const normalizeSentence = (value: string): string => value.replace(/\s+/g, ' ').trim();

const extractText = (content: unknown): string => {
  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .filter((block): block is AnthropicTextBlock => Boolean(block) && typeof block === 'object' && (block as AnthropicTextBlock).type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
};

const buildSectionTemplates = (input: InterviewInput): SectionTemplate[] => {
  const loweredThemes = input.themes.map((theme) => theme.toLowerCase());

  return baseSectionTemplates.map((section) => {
    if (section.id === 'work-and-daily-life' && loweredThemes.includes('beliefs')) {
      return {
        ...section,
        title: 'Work, beliefs and daily life',
        intro: 'I\'d like to hear about how you spent your days, any work that shaped your life, and whether belief or church was part of ordinary life around you.'
      };
    }

    if (section.id === 'work-and-daily-life' && loweredThemes.includes('emigration')) {
      return {
        ...section,
        title: 'Work, movement and daily life',
        intro: 'I\'d like to hear about how you spent your days, any work that shaped your life, and whether moving away or staying put was part of family conversation.'
      };
    }

    return section;
  });
};

const buildUserPrompt = (input: InterviewInput, sections: SectionTemplate[]) => `Create the fillable parts of an interview guide using the fixed section structure below.

Interviewee name: ${input.intervieweeName}
Interviewer name: ${input.interviewerName || 'Not provided'}
Relationship: ${input.relationship}
Origin: ${input.origin}
Early-life era: ${input.earlyLifeEra}
Known context: ${input.knownContext || 'None provided'}
Themes: ${input.themes.length ? input.themes.join(', ') : 'No specific themes selected'}
Interview date: ${input.interviewDate || 'Not provided'}

Fixed sections:
${sections
  .map(
    (section) => `- id: ${section.id}\n  title: ${section.title}\n  intro: ${section.intro}\n  questions: exactly ${section.questionCount}\n  followUps: exactly ${section.followUpCount}`
  )
  .join('\n')}

Return JSON only with this schema:
{
  "briefingNote": "string",
  "openingLines": ["string"],
  "sensitivityNotes": ["string"],
  "sections": [
    {
      "id": "section-id",
      "questions": ["question text"],
      "followUps": ["follow-up text"]
    }
  ]
}`;

const normalizeBriefingNote = (): string =>
  [
    'Start with one specific place, routine, or object rather than a broad life-summary question.',
    'Let the interviewee set the pace and stay with the detail that feels most alive to them.',
    'If they correct something or take the story in a different direction, treat that as useful information.',
    'Silence is fine. You do not need to fill every pause.',
    'If photographs or objects come up, use them as gentle prompts rather than proof points.'
  ].join(' ');

const buildSensitivityNotes = (input: InterviewInput): string[] => {
  const notes = [
    'If something feels uncertain, ask gently and let them correct or reshape it.',
    'If a topic feels tender, pause and follow their lead rather than pressing on.',
    'If memory is vague on dates or order, stay with the detail they do remember.',
    'If they seem tired or want to stop, that is the right moment to pause or finish.'
  ];

  const lowerContext = input.knownContext.toLowerCase();
  const lowerThemes = input.themes.map((theme) => theme.toLowerCase());

  if (lowerThemes.includes('objects and photographs') || /photo|photograph|object|tool|letter|keepsake/.test(lowerContext)) {
    notes.push('If photographs or objects appear, use them as gentle prompts rather than testing memory against them.');
  }

  if (lowerThemes.includes('war') || /war|ration/.test(lowerContext)) {
    notes.push('If wartime or shortage memories come up, let them describe what felt ordinary or difficult in their own terms.');
  }

  if (lowerThemes.includes('emigration') || /emigration|england|america|leave|left/.test(lowerContext)) {
    notes.push('If leaving, staying, or separation comes up, do not assume whether it felt hopeful, painful, or simply practical.');
  }

  if (lowerThemes.includes('beliefs') || /church|faith|belief/.test(lowerContext)) {
    notes.push('If belief or church was part of life, let them describe it in their own language without treating it as unusual.');
  }

  if (/illness|bereave|death|died|loss|estrang|adopt/.test(lowerContext)) {
    notes.push('If illness, loss, or strained family history comes up, acknowledge it simply and let them decide how far to go.');
  }

  return notes.slice(0, 5);
};

const normalizeQuestionText = (text: string): string => {
  let result = normalizeSentence(text);

  const rewrites: Array<[RegExp, string]> = [
    [/^I think you (.+?)—is that right, and (.+)$/i, 'Was it right that you $1? And if so, $2'],
    [/^I know there were (.+?)—tell me about that side of your life\.?$/i, 'Were there $1 at all, and if so what was that side of life like for you?'],
    [/^Your father worked in (.+?)—what do you remember about that\??$/i, 'Was $1 part of family life at all when you were growing up?'],
    [/^You grew up doing (.+?)\.?$/i, 'Was $1 part of everyday life for you when you were young?'],
    [/^You mentioned (.+?)—do you have memories of (.+)$/i, 'If $1 was part of life then, do you have memories of $2']
  ];

  for (const [pattern, replacement] of rewrites) {
    if (pattern.test(result)) {
      result = result.replace(pattern, replacement);
    }
  }

  return normalizeSentence(result);
};

const buildGuide = (response: ConstrainedGuideResponse, sections: SectionTemplate[], input: InterviewInput): InterviewGuide => ({
  briefingNote: normalizeBriefingNote(),
  openingLines: response.openingLines.map(normalizeSentence).filter(Boolean).slice(0, 3),
  sensitivityNotes: buildSensitivityNotes(input),
  sections: sections.map((section) => {
    const generated = response.sections.find((item) => item.id === section.id);
    const questions = (generated?.questions ?? []).slice(0, section.questionCount).map((text, index) => ({
      id: `q-${section.id}-${index + 1}`,
      text: normalizeQuestionText(text)
    }));
    const followUps = (generated?.followUps ?? []).slice(0, section.followUpCount).map(normalizeSentence);

    return {
      id: section.id,
      title: section.title,
      intro: section.intro,
      questions,
      followUps
    } satisfies GuideSection;
  })
});

const parseResponse = (rawText: string, sections: SectionTemplate[], input: InterviewInput): { guide: InterviewGuide | null; issues: string[] } => {
  try {
    const normalized = rawText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(normalized) as ConstrainedGuideResponse;
    const guide = interviewGuideSchema.parse(buildGuide(parsed, sections, input));
    const issues = validateGuideBusinessRules(guide, sections);
    return { guide: issues.length ? null : guide, issues };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON response';
    return { guide: null, issues: [message] };
  }
};

const makeClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }

  return new Anthropic({ apiKey });
};

const requestGuide = async (client: Anthropic, prompt: string) => {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    temperature: 0.5,
    system: loadSystemPrompt(),
    messages: [{ role: 'user', content: prompt }]
  });

  return extractText(response.content);
};

export const validateGuideBusinessRules = (guide: InterviewGuide, sections: SectionTemplate[]): string[] => {
  const issues: string[] = [];
  const totalQuestions = guide.sections.reduce((sum, section) => sum + section.questions.length, 0);

  if (guide.sections.length < 5 || guide.sections.length > 6) {
    issues.push('Guide must contain 5 to 6 sections.');
  }

  if (totalQuestions < 20 || totalQuestions > 30) {
    issues.push('Total questions must be between 20 and 30.');
  }

  const stems = new Set<string>();

  for (const section of guide.sections) {
    const template = sections.find((item) => item.id === section.id);
    if (!template) {
      issues.push(`Unexpected section id: ${section.id}`);
      continue;
    }

    if (section.questions.length !== template.questionCount) {
      issues.push(`Section "${section.title}" must have exactly ${template.questionCount} questions.`);
    }

    if (section.followUps.length !== template.followUpCount) {
      issues.push(`Section "${section.title}" must have exactly ${template.followUpCount} follow-up prompts.`);
    }

    for (const question of section.questions) {
      if (question.text.length > 220) {
        issues.push(`Question "${question.id}" is too long to read comfortably aloud.`);
      }

      const stem = questionStem(question.text);
      if (stems.has(stem)) {
        issues.push(`Question "${question.text}" duplicates an earlier question.`);
      }
      stems.add(stem);

      const lower = question.text.toLowerCase();
      for (const phrase of bannedPhrases) {
        if (lower.includes(phrase)) {
          issues.push(`Question "${question.id}" uses banned or suspect phrasing.`);
        }
      }
    }

    for (const prompt of section.followUps) {
      if (prompt.length > 220) {
        issues.push(`A follow-up prompt in "${section.title}" is too long.`);
      }
      const lower = prompt.toLowerCase();
      for (const phrase of bannedPhrases) {
        if (lower.includes(phrase)) {
          issues.push(`A follow-up prompt in "${section.title}" uses banned or suspect phrasing.`);
        }
      }
    }
  }

  return issues;
};

export const generateInterviewGuide = async (input: InterviewInput): Promise<GenerationResult> => {
  const client = makeClient();
  const sections = buildSectionTemplates(input);

  const firstResponse = await requestGuide(client, buildUserPrompt(input, sections));
  const firstPass = parseResponse(firstResponse, sections, input);

  if (firstPass.guide) {
    return { guide: firstPass.guide, repaired: false };
  }

  const secondResponse = await requestGuide(
    client,
    `${buildUserPrompt(input, sections)}\n\nThe previous response failed for these reasons:\n${firstPass.issues.map((issue) => `- ${issue}`).join('\n')}\n\nReturn corrected JSON only.`
  );
  const secondPass = parseResponse(secondResponse, sections, input);

  if (!secondPass.guide) {
    throw new Error(secondPass.issues.join(' | '));
  }

  return { guide: secondPass.guide, repaired: true };
};

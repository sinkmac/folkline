import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Anthropic } from '@anthropic-ai/sdk';
import type { InterviewInput } from '$lib/schemas/interview-input';
import { interviewGuideSchema, type InterviewGuide } from '$lib/schemas/guide-output';

type AnthropicTextBlock = { type: 'text'; text: string };

type GenerationResult = {
  guide: InterviewGuide;
  repaired: boolean;
};

const PROMPT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../docs/prompts/question-generator-system-prompt.md'
);

const loadSystemPrompt = () => readFileSync(PROMPT_PATH, 'utf8');

const MODEL = 'claude-sonnet-4-20250514';

const userPrompt = (input: InterviewInput) => `Create a personalised interview guide for this user input.

Interviewee name: ${input.intervieweeName}
Interviewer name: ${input.interviewerName || 'Not provided'}
Relationship: ${input.relationship}
Origin: ${input.origin}
Early-life era: ${input.earlyLifeEra}
Known context: ${input.knownContext || 'None provided'}
Themes: ${input.themes.length ? input.themes.join(', ') : 'No specific themes selected'}
Interview date: ${input.interviewDate || 'Not provided'}

Return JSON only.`;

const repairPrompt = (input: InterviewInput, invalidJson: string, issues: string[]) => `The previous output did not meet the contract.

Issues to fix:
${issues.map((issue) => `- ${issue}`).join('\n')}

Original user input:
${userPrompt(input)}

Previous invalid JSON:
${invalidJson}

Return corrected JSON only.`;

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

export const validateGuideBusinessRules = (guide: InterviewGuide): string[] => {
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
    if (section.questions.length < 3 || section.questions.length > 6) {
      issues.push(`Section "${section.title}" must have 3 to 6 questions.`);
    }

    if (section.followUps.length < 3 || section.followUps.length > 5) {
      issues.push(`Section "${section.title}" must have 3 to 5 follow-up prompts.`);
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

const parseGuide = (rawText: string): { guide: InterviewGuide | null; issues: string[] } => {
  try {
    const parsed = JSON.parse(rawText);
    const guide = interviewGuideSchema.parse(parsed);
    const issues = validateGuideBusinessRules(guide);
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
    temperature: 0.7,
    system: loadSystemPrompt(),
    messages: [{ role: 'user', content: prompt }]
  });

  return extractText(response.content);
};

export const generateInterviewGuide = async (input: InterviewInput): Promise<GenerationResult> => {
  const client = makeClient();

  const firstResponse = await requestGuide(client, userPrompt(input));
  const firstPass = parseGuide(firstResponse);

  if (firstPass.guide) {
    return { guide: firstPass.guide, repaired: false };
  }

  const secondResponse = await requestGuide(client, repairPrompt(input, firstResponse, firstPass.issues));
  const secondPass = parseGuide(secondResponse);

  if (!secondPass.guide) {
    throw new Error(secondPass.issues.join(' | '));
  }

  return { guide: secondPass.guide, repaired: true };
};

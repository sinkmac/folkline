import { config as loadEnv } from 'dotenv';
import { generateInterviewGuide } from '../src/lib/server/anthropic.ts';

loadEnv({ path: new URL('../.env', import.meta.url).pathname });

const cases = [
  {
    id: 'scottish',
    input: {
      intervieweeName: 'Jean McArthur',
      interviewerName: 'Eilidh',
      relationship: 'grandmother',
      origin: 'Lanarkshire, Scotland',
      earlyLifeEra: 'Born in the late 1930s, grew up in the 1940s and 1950s',
      knownContext: 'Grew up in a mining family, later worked in a shop in Glasgow, strong family stories about rationing and dances.',
      themes: ['childhood', 'work', 'family stories', 'objects and photographs'],
      interviewDate: '6 May 2026'
    }
  },
  {
    id: 'irish',
    input: {
      intervieweeName: 'Brigid O\'Sullivan',
      interviewerName: 'Aoife',
      relationship: 'great-aunt',
      origin: 'County Kerry, Ireland',
      earlyLifeEra: 'Born in the 1940s, came of age in the 1950s and 1960s',
      knownContext: 'One of several siblings, family talked about emigration to England and America, remembered farm work and church life.',
      themes: ['emigration', 'work', 'beliefs', 'family stories'],
      interviewDate: '6 May 2026'
    }
  },
  {
    id: 'generic',
    input: {
      intervieweeName: 'Harold Bennett',
      interviewerName: 'Sam',
      relationship: 'grandfather',
      origin: 'North East England',
      earlyLifeEra: 'Born in the early 1950s, grew up in the 1950s and 1960s',
      knownContext: 'Worked as an electrician, loved football, kept old tools and family photos in the shed.',
      themes: ['childhood', 'work', 'objects and photographs'],
      interviewDate: '6 May 2026'
    }
  }
];

for (const testCase of cases) {
  try {
    const result = await generateInterviewGuide(testCase.input);
    console.log(JSON.stringify({
      id: testCase.id,
      repaired: result.repaired,
      guide: result.guide
    }));
  } catch (error) {
    console.log(JSON.stringify({
      id: testCase.id,
      error: error instanceof Error ? error.message : String(error)
    }));
  }
}

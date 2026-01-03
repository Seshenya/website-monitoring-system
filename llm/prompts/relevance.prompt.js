export const relevancePrompt = `
You are evaluating whether a website change is relevant.

Keywords of interest:
{{keywords}}

If no keywords are listed, treat the entire summary as relevant.

Summary of changes:
{{summary}}

Score relevance from 0.0 to 1.0:
- 1.0 = highly relevant
- 0.0 = not relevant

Return ONLY valid JSON:
{
  "score": number,
  "reason": string
}
`;

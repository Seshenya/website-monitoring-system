export const summarizePrompt = `
You are summarizing website changes for monitoring purposes.

Keywords of interest:
{{keywords}}

If no keywords are listed, treat all changes as equally important.

Website changes:
{{changes}}

Instructions:
- Summarize the meaningful changes.
- Give priority to changes related to the keywords.
- Include other important changes even if not keyword-related.
- Be concise and factual.
- No marketing language.

Output ONLY the summary text.
`;

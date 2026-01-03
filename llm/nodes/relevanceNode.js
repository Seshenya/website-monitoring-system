import { relevanceLLM } from "../llmClient.js";
import { relevancePrompt } from "../prompts/relevance.prompt.js";
import { relevanceSchema } from "../schemas/relevance.schema.js";

export async function relevanceNode(state) {
  const prompt = relevancePrompt
    .replace("{{keywords}}", state.keywords.join(", "))
    .replace("{{summary}}", state.summary);

  let parsed;

  try {
    const res = await relevanceLLM.invoke(prompt);
    const json = JSON.parse(res.content);
    parsed = relevanceSchema.parse(json);
  } catch (err) {
    return {
      ...state,
      relevanceScore: 0,
      relevanceReason: "Invalid LLM output",
      attempts: state.attempts + 1,
    };
  }

  return {
    ...state,
    relevanceScore: parsed.score,
    relevanceReason: parsed.reason,
    attempts: state.attempts + 1,
  };
}

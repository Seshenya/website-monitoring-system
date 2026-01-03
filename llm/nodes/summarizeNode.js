import { summaryLLM } from "../llmClient.js";
import { summarizePrompt } from "../prompts/summarize.prompt.js";
import { monitorStateSchema } from "../schemas/state.schema.js";

export async function summarizeNode(state) {
  monitorStateSchema.parse(state);

  const keywordsStr = state.keywords?.length
    ? state.keywords.join(", ")
    : "none";
  const prompt = summarizePrompt
    .replace("{{keywords}}", keywordsStr)
    .replace("{{changes}}", state.changes);

  const res = await summaryLLM.invoke(prompt);

  return {
    ...state,
    summary: res.content,
  };
}

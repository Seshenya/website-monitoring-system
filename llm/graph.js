import { Annotation, StateGraph } from "@langchain/langgraph";
import { summarizeNode } from "./nodes/summarizeNode.js";
import { relevanceNode } from "./nodes/relevanceNode.js";
import { decision } from "./nodes/decision.js";

export const StateAnnotation = Annotation.Root({
  keywords: Annotation({
    default: () => [],
  }),
  changes: Annotation({
    default: () => "",
  }),
  summary: Annotation({
    default: () => "",
  }),
  relevanceScore: Annotation({
    default: () => 0,
  }),
  relevanceReason: Annotation({
    default: () => "",
  }),
  attempts: Annotation({
    default: () => 0,
  }),
  isRelevant: Annotation({
    default: () => false,
  }),
});

export function buildGraph() {
  const graph = new StateGraph(StateAnnotation);

  graph.addNode("summarize", summarizeNode);
  graph.addNode("relevance", relevanceNode);

  graph.addEdge("__start__", "summarize");
  graph.addEdge("summarize", "relevance");

  graph.addConditionalEdges("relevance", decision, {
    accept: "__end__",
    retry: "relevance",
    reject: "__end__",
  });

  return graph.compile();
}

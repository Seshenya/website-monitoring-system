import { ChatGroq } from "@langchain/groq";
import "../config/env.js";

export const summaryLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL,
  maxTokens: 300,
});

export const relevanceLLM = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL,
  maxTokens: 80,
});

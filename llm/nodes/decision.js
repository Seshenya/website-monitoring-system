export function decision(state) {
  if (state.relevanceScore >= 0.7) {
    return "accept";
  }

  if (state.attempts < 3) {
    return "retry";
  }

  return "reject";
}

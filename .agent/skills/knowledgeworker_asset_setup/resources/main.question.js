// Template for assetType 'question' or 'question-with-custom-question-text'
// (identical code). Copy to src/main.js.
//
// Key rule: Never show feedback, solutions, or lock the UI on your own.
// Always wait for the corresponding LMS callback.
import {
  onInitialize,
  onDesignChanged,
  onShowResult,
  onShowFeedback,
  onShowAnswerFeedback,
  onShowSolution,
  onDeactivate,
  onReset,
  onEvaluatedChanged,
  answered,
  setSuspendData,
  setHeight,
} from "knowledgeworker-embedded-asset-api";

onInitialize((configuration) => {
  console.log("Asset type:", configuration.assetType); // 'question' | 'question-with-custom-question-text'
  console.log("Is evaluated:", configuration.isEvaluated);

  if (configuration.suspendData) {
    const state = JSON.parse(configuration.suspendData);
    console.log("Restoring state:", state);
    // Re-sync LMS with saved answer
    // answered(state.answer, state.passed, state.score);
  }

  const app = document.getElementById("app");
  app.innerHTML = "<h1>Question Ready</h1>";

  setHeight(document.body.scrollHeight);
});

// LMS reveals overall result feedback
onShowResult((result) => {
  console.log("Show result:", result);
});

// LMS reveals general feedback text
onShowFeedback((feedback) => {
  console.log("Show feedback:", feedback);
});

// LMS reveals per-answer feedback
onShowAnswerFeedback((feedback) => {
  console.log("Show answer feedback:", feedback);
});

// LMS reveals the correct answer
onShowSolution(() => {
  console.log("Show solution");
});

// LMS locks the question — disable all inputs
onDeactivate(() => {
  console.log("Deactivated");
});

// LMS resets the question — clear all state
onReset(() => {
  console.log("Reset");
  setSuspendData("");
  answered(undefined, false, 0);
});

// Course author toggled evaluation mode
onEvaluatedChanged((isEvaluated) => {
  console.log("Evaluated changed:", isEvaluated);
});

onDesignChanged((design) => {
  console.log("Design updated:", design);
});

// Call when user submits: answered(answer, passed, score)
// Example: answered("B", true, 1.0);

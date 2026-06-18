// Template for assetType 'advanced-question'. Copy to src/main.js.
//
// The asset renders its own Check Answer / Retry / Show Solution buttons.
// The LMS controls their visibility — the asset notifies the LMS when clicked.
import {
  onInitialize,
  onDesignChanged,
  onShowResult,
  onShowFeedback,
  onShowAnswerFeedback,
  onShowSolution,
  onShowCheckAnswerButton,
  onShowRetryButton,
  onShowSolutionButton,
  onDeactivate,
  onReset,
  onEvaluatedChanged,
  answered,
  checkAnswerButtonClicked,
  solutionButtonClicked,
  retryButtonClicked,
  setSuspendData,
  setHeight,
} from "knowledgeworker-embedded-asset-api";

onInitialize((configuration) => {
  console.log("Asset type:", configuration.assetType); // 'advanced-question'
  console.log("Is evaluated:", configuration.isEvaluated);

  if (configuration.suspendData) {
    const state = JSON.parse(configuration.suspendData);
    console.log("Restoring state:", state);
    // answered(state.answer, state.passed, state.score);
  }

  const app = document.getElementById("app");
  app.innerHTML = "<h1>Advanced Question Ready</h1>";

  setHeight(document.body.scrollHeight);
});

// LMS controls button visibility — show/hide your rendered buttons accordingly
onShowCheckAnswerButton((visible) => {
  console.log("Check answer button visible:", visible);
});

onShowRetryButton((visible) => {
  console.log("Retry button visible:", visible);
});

onShowSolutionButton((visible) => {
  console.log("Solution button visible:", visible);
});

// LMS reveals feedback and solution
onShowResult((result) => {
  console.log("Show result:", result);
});

onShowFeedback((feedback) => {
  console.log("Show feedback:", feedback);
});

onShowAnswerFeedback((feedback) => {
  console.log("Show answer feedback:", feedback);
});

onShowSolution(() => {
  console.log("Show solution");
});

// LMS locks and resets
onDeactivate(() => {
  console.log("Deactivated");
});

onReset(() => {
  console.log("Reset");
  setSuspendData("");
  answered(undefined, false, 0);
});

onEvaluatedChanged((isEvaluated) => {
  console.log("Evaluated changed:", isEvaluated);
});

onDesignChanged((design) => {
  console.log("Design updated:", design);
});

// Wire your rendered buttons to these actions:
// checkButton.addEventListener("click", () => checkAnswerButtonClicked());
// solutionButton.addEventListener("click", () => solutionButtonClicked());
// retryButton.addEventListener("click", () => retryButtonClicked());

// Call when user submits: answered(answer, passed, score)
// Example: answered("B", true, 1.0);

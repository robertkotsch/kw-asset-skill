// Template for assetType 'medium' (default).
// Copy to src/main.js. For local dev outside the LMS, see main-with-fallback.js.
import {
  onInitialize,
  onDesignChanged,
  configure,
  completed,
} from "knowledgeworker-embedded-asset-api";

// Disable auto-completion to control it manually.
// Remove this line (and the completed() call) to let the API
// mark the asset complete automatically on load.
configure({ autoCompletion: false });

onInitialize((configuration) => {
  console.log("Asset type:", configuration.assetType); // 'medium'
  console.log("Knowledgeworker config received:", configuration);

  // Restore previous state if available
  if (configuration.suspendData) {
    const state = JSON.parse(configuration.suspendData);
    console.log("Restoring state:", state);
  }

  // Your application logic starts here
  const app = document.getElementById("app");
  app.innerHTML = "<h1>Asset Ready</h1>";

  // Call when the learner has completed the asset
  // completed();
});

onDesignChanged((design) => {
  console.log("Design updated:", design);
});

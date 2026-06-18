import {
  onInitialize,
  setSuspendData,
} from "knowledgeworker-embedded-asset-api";

let isInitialized = false;
let state = { visits: 0 };

// Normal LMS initialization
onInitialize((configuration) => {
  isInitialized = true;

  if (configuration.suspendData) {
    state = JSON.parse(configuration.suspendData);
  }

  state.visits += 1;
  setSuspendData(JSON.stringify(state));

  renderApp();
});

// Local development fallback (fires after 300ms if LMS doesn't respond)
setTimeout(() => {
  if (!isInitialized) {
    console.log("Local dev mode: No LMS detected");

    // Use localStorage as mock suspendData
    const saved = localStorage.getItem("kw_suspend_data");
    if (saved) {
      state = JSON.parse(saved);
    }

    state.visits += 1;
    localStorage.setItem("kw_suspend_data", JSON.stringify(state));

    renderApp();
  }
}, 300);

function renderApp() {
  // Your UI rendering logic here
}

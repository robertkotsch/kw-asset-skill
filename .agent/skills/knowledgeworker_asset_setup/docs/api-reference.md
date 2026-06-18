# API Quick Reference

> Back to [kw-asset-skill.md](../kw-asset-skill.md)

## Configuration

```javascript
import { configure } from "knowledgeworker-embedded-asset-api";

// Optional: Set before window load event
configure({
  autoCompletion: false, // Disable auto-completion (default: true)
});
```

## Handlers (attach before window load)

```javascript
import {
  onInitialize, // Receive config from LMS (includes design, suspendData)
  onDesignChanged, // Design tokens updated at runtime
  onSharedDataChanged, // Shared data changed by another asset
  onShowResult, // (Question only) Show correct/incorrect feedback
  onShowSolution, // (Question only) Show solution
  onDeactivate, // (Question only) Lock answers after evaluation
  onReset, // (Question only) Reset question
  onEvaluatedChanged, // (Question only) Evaluated setting changed
} from "knowledgeworker-embedded-asset-api";
```

## Actions

```javascript
import {
  setHeight, // Request iframe height change
  setSuspendData, // Persist state to LMS (limited size!)
  setSharedData, // Share state across assets
  completed, // (Medium only) Mark asset as completed
  answered, // (Question only) Submit answer: answered(answer, passed, score)
} from "knowledgeworker-embedded-asset-api";
```

---

## Configuration Object

The `onInitialize` callback receives a configuration object:

```typescript
interface Configuration {
  suspendData: string; // Previously saved user data
  sharedData: string; // Shared state from other assets
  assetType: AssetType; // 'medium' | 'question' | etc.
  isEvaluated: boolean; // Whether question is evaluated
  lmsData: LMSData; // { learnerName: string }
  design: Design; // Design tokens (see UI library)
  context: Context[]; // Context hierarchy
}
```

---

## Common Patterns

### State Persistence (Save/Load User Progress)

```javascript
import {
  setSuspendData,
  onInitialize,
} from "knowledgeworker-embedded-asset-api";

// Load saved state when asset initializes
onInitialize((configuration) => {
  if (configuration.suspendData) {
    const state = JSON.parse(configuration.suspendData);
    restoreState(state);
  }
});

// Save state when user makes progress
const saveProgress = (state) => {
  // SCORM limits apply (often 4KB or 64KB)
  setSuspendData(JSON.stringify(state));
};
```

### Mark Asset Complete (Medium assets only)

```javascript
import { configure, completed } from "knowledgeworker-embedded-asset-api";

// Disable auto-completion to handle it manually
configure({ autoCompletion: false });

// Call when user finishes the asset (e.g., viewed all content)
const finishAsset = () => {
  completed();
};
```

### Question/Assessment Assets

For quiz or assessment assets, use the `answered` action:

```javascript
import { answered } from "knowledgeworker-embedded-asset-api";

// answered(answer: string | undefined, passed: boolean, score: number)
answered("A", true, 1.0); // Correct answer
answered("C", false, 0.0); // Wrong answer
answered(undefined, false, 0); // Revoked answer
```

For handling question lifecycle (`onShowResult`, `onShowSolution`, `onDeactivate`, `onReset`), see the [Handlers](#handlers-attach-before-window-load) section above.

See the [Question Example](https://github.com/chemmedia/knowledgeworker-embedded-asset-api-question-example) for a full implementation.

### Dynamic Height Adjustment

```javascript
import { setHeight } from "knowledgeworker-embedded-asset-api";

// Notify LMS when content height changes
const updateHeight = () => {
  const height = document.body.scrollHeight;
  setHeight(height);
};

// Call after DOM updates
window.addEventListener("resize", updateHeight);
```

### Shared Data Across Assets

```javascript
import {
  onInitialize,
  onSharedDataChanged,
  setSharedData,
} from "knowledgeworker-embedded-asset-api";

// Get initial shared data
onInitialize((configuration) => {
  if (configuration.sharedData) {
    const shared = JSON.parse(configuration.sharedData);
    console.log("Initial shared data:", shared);
  }
});

// Listen for shared data changes from other assets
onSharedDataChanged((sharedData) => {
  const shared = JSON.parse(sharedData);
  console.log("Shared data changed:", shared);
});

// Share state with other assets (must be a string)
setSharedData(JSON.stringify({ userChoice: "optionA" }));
```

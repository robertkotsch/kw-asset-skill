# Knowledgeworker Asset Types

> Back to [SKILL.md](../SKILL.md)
>
> Source: [GitHub README](https://github.com/chemmedia/knowledgeworker-embedded-asset-api)

## Overview

| Type | `assetType` value | Template in `resources/` |
| :--- | :--- | :--- |
| **Medium** | `'medium'` | `main.medium.js` |
| **Question** | `'question'` | `main.question.js` |
| **Question with custom question text** | `'question-with-custom-question-text'` | `main.question.js` (identical) |
| **Advanced Question** | `'advanced-question'` | `main.advanced-question.js` |

---

## Medium

A Medium is a standalone learning asset that fully controls its own lifecycle. The LMS
receives only one signal: `completed()`. No scoring, no answer submission, no external
control over what the asset shows. Use when the learner explores content freely, without
grading.

### Actions
| Action | Description |
| :--- | :--- |
| `completed()` | Signals the LMS that the learner has finished |
| `configure({ autoCompletion })` | Disable auto-completion to call `completed()` manually |
| `setHeight(px)` | Request iframe height change |
| `setSuspendData(string)` | Persist learner state |
| `setSharedData(string)` | Share state across assets |

### Handlers
| Handler | Triggered when… |
| :--- | :--- |
| `onInitialize(config)` | LMS sends initial configuration |
| `onDesignChanged(design)` | LMS updates design tokens |
| `onSharedDataChanged(data)` | Another asset updates shared data |

---

## Question

```
┌─────────────────────────────────────┐
│  Knowledgeworker Create             │
│                                     │
│  [Check Answer]  [Retry]  [Solution]│  ← KW renders & styles these
│  ┌───────────────────────────────┐  │
│  │  Your asset (iframe)          │  │
│  │  ○ Option A                   │  │  ← you build this
│  │  ○ Option B                   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

Fully orchestrated by the LMS. You build the interaction area only. The LMS wraps your
asset with its own buttons. Use inside a larger LMS-controlled assessment.

**Key rule:** Never show feedback, solutions, or lock the UI on your own — always wait for
the LMS callback.

### Actions
| Action | Description |
| :--- | :--- |
| `answered(answer, passed, score)` | Submit the learner's answer |
| `setHeight(px)` | Request iframe height change |
| `setSuspendData(string)` | Persist learner state |
| `setSharedData(string)` | Share state across assets |

### Handlers
| Handler | Triggered when… |
| :--- | :--- |
| `onInitialize(config)` | LMS sends initial configuration |
| `onDesignChanged(design)` | LMS updates design tokens |
| `onEvaluatedChanged(bool)` | Course author toggles evaluation mode |
| `onShowResult(result)` | LMS reveals overall result feedback |
| `onShowFeedback(feedback)` | LMS reveals general feedback text |
| `onShowAnswerFeedback(feedback)` | LMS reveals per-answer feedback |
| `onShowSolution()` | LMS reveals the correct answer |
| `onDeactivate()` | LMS locks all inputs |
| `onReset()` | LMS resets the question |

---

## Question with custom question text

Functionally identical to **Question** — same API, same template. The only distinction:
the question stem is authored in the KW CMS and passed at runtime via `onInitialize`.
Use when course authors need to edit/translate the question text without touching code.

---

## Advanced Question

```
┌─────────────────────────────────────┐
│  Knowledgeworker Create             │
│  ┌───────────────────────────────┐  │
│  │  Your asset (iframe)          │  │
│  │  ○ Option A                   │  │  ← you build this
│  │  ○ Option B                   │  │
│  │  [Check Answer]  [Retry]      │  │  ← you render & style these too
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

Full control over Check Answer / Retry / Show Solution buttons — you render them. The LMS
tells your asset when to show/hide each button; your asset notifies the LMS when clicked.
Use when button design must be tightly integrated with the asset UI.

### Additional Actions (beyond Question)
| Action | Description |
| :--- | :--- |
| `checkAnswerButtonClicked()` | Notify LMS learner clicked Check Answer |
| `solutionButtonClicked()` | Notify LMS learner clicked Show Solution |
| `retryButtonClicked()` | Notify LMS learner clicked Retry |

### Additional Handlers (beyond Question)
| Handler | Triggered when… |
| :--- | :--- |
| `onShowCheckAnswerButton(visible)` | LMS shows/hides the Check Answer button |
| `onShowRetryButton(visible)` | LMS shows/hides the Retry button |
| `onShowSolutionButton(visible)` | LMS shows/hides the Show Solution button |

---

## Critical naming distinction

| Handler | Available in | What it does |
| :--- | :--- | :--- |
| `onShowSolution()` | all question types | LMS tells asset to **reveal the correct answer** |
| `onShowSolutionButton(visible)` | `advanced-question` only | LMS tells asset to **show/hide its Solution button** |

**Rule:** if the handler name ends in `Button`, it controls button visibility and is
`advanced-question` only. Without `Button`, it controls content visibility.

---

## Capability comparison

| | Medium | Question | Question w/ custom text | Advanced Question |
| :--- | :---: | :---: | :---: | :---: |
| `completed()` | ✅ | ❌ | ❌ | ❌ |
| `answered()` / scoring | ❌ | ✅ | ✅ | ✅ |
| LMS-controlled feedback | ❌ | ✅ | ✅ | ✅ |
| Question text from CMS | ❌ | ❌ | ✅ | ❌ |
| Asset renders buttons | ❌ | ❌ | ❌ | ✅ |

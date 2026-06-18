# Knowledgeworker Asset Types

Reference document for all four asset types defined by the Knowledgeworker Embedded Asset API.

Source: [GitHub README](https://github.com/chemmedia/knowledgeworker-embedded-asset-api)

---

## Overview

| Type | `assetType` value | `main.js` template (in `resources/`) |
| :--- | :--- | :--- |
| **Medium** | `'medium'` | `main.medium.js` |
| **Question** | `'question'` | `main.question.js` |
| **Question with custom question text** | `'question-with-custom-question-text'` | `main.question.js` (identical) |
| **Advanced Question** | `'advanced-question'` | `main.advanced-question.js` |

---

## Medium

**EN:** A Medium is a standalone learning asset that fully controls its own lifecycle. It can contain any interactive content — animations, simulations, exploratory interactions, or even simple quiz-like elements — but all feedback, state management, and completion logic are entirely self-contained. The LMS receives only one signal: `completed()`. There is no scoring, no answer submission, and no external control over what the asset shows. Use a Medium when the learner is meant to explore content freely, without grading or assessment.

**DE:** Ein Medium ist ein eigenständiges Lern-Asset, das seinen gesamten Lebenszyklus selbst steuert. Es kann beliebige interaktive Inhalte enthalten – Animationen, Simulationen, explorative Interaktionen oder auch einfache Quiz-ähnliche Elemente – aber sämtliches Feedback, die Zustandsverwaltung und die Abschlusslogik sind vollständig in sich geschlossen. Das LMS erhält nur ein einziges Signal: `completed()`. Es gibt keine Bewertung, keine Antwortübermittlung und keine externe Steuerung darüber, was das Asset anzeigt. Wähle ein Medium, wenn der Lernende Inhalte frei erkunden soll, ohne Benotung oder Bewertung.

### Actions
| Action | Description |
| :--- | :--- |
| `completed()` | Signals the LMS that the learner has finished the asset |
| `configure({ autoCompletion })` | Disable auto-completion to control `completed()` manually |
| `setHeight(px)` | Requests an iframe height change from the LMS |
| `setSuspendData(string)` | Persists learner state to the LMS |
| `setSharedData(string)` | Shares state across assets in the same course |

### Handlers
| Handler | Triggered when… |
| :--- | :--- |
| `onInitialize(config)` | LMS sends initial configuration after window load |
| `onDesignChanged(design)` | LMS updates design tokens at runtime |
| `onSharedDataChanged(data)` | Another asset updates shared data |

---

## Question

### Who renders what

```
┌─────────────────────────────────────┐
│  Knowledgeworker Create             │
│                                     │
│  [Check Answer]  [Retry]  [Solution]│  ← KW Create renders & styles these
│  ┌───────────────────────────────┐  │
│  │  Your asset (iframe)          │  │
│  │                               │  │
│  │  Your interaction content     │  │  ← you build this
│  │  ○ Option A                   │  │
│  │  ○ Option B                   │  │
│  │  ○ Option C                   │  │
│  │                               │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**EN:** A Question asset is fully orchestrated by the LMS. You build the interaction area only — the answer options, the interactive content, the visual feedback. The LMS wraps your asset with its own Check Answer, Retry, and Show Solution buttons, rendered and styled outside your iframe. When the learner clicks one of those LMS buttons, the LMS calls your registered handler. You never render or manage those buttons yourself. Your asset submits an answer via `answered()` and responds to LMS callbacks for all subsequent state changes. Use this type when the question is one item inside a larger LMS-controlled assessment.

**DE:** Ein Question-Asset wird vollständig vom LMS orchestriert. Du baust nur den Interaktionsbereich – die Antwortoptionen, den interaktiven Inhalt, das visuelle Feedback. Das LMS umhüllt dein Asset mit eigenen Schaltflächen (Antwort prüfen, Wiederholen, Lösung anzeigen), die außerhalb deines iFrames gerendert und gestaltet werden. Wenn der Lernende eine dieser LMS-Schaltflächen klickt, ruft das LMS deinen registrierten Callback auf. Du renderst oder verwaltest diese Schaltflächen nie selbst. Dein Asset übermittelt eine Antwort über `answered()` und reagiert auf LMS-Callbacks für alle weiteren Zustandsänderungen. Wähle diesen Typ, wenn die Frage ein einzelnes Element innerhalb einer größeren, LMS-gesteuerten Prüfung ist.

### Actions
| Action | Description |
| :--- | :--- |
| `answered(answer, passed, score)` | Submits the learner's answer to the LMS |
| `setHeight(px)` | Requests an iframe height change from the LMS |
| `setSuspendData(string)` | Persists learner state to the LMS |
| `setSharedData(string)` | Shares state across assets in the same course |

### Handlers
| Handler | Triggered when… |
| :--- | :--- |
| `onInitialize(config)` | LMS sends initial configuration after window load |
| `onDesignChanged(design)` | LMS updates design tokens at runtime |
| `onSharedDataChanged(data)` | Another asset updates shared data |
| `onEvaluatedChanged(bool)` | Course author toggles evaluation mode |
| `onShowResult(result)` | LMS reveals overall result feedback |
| `onShowFeedback(feedback)` | LMS reveals general feedback text |
| `onShowAnswerFeedback(feedback)` | LMS reveals per-answer feedback |
| `onShowSolution()` | LMS reveals the correct answer |
| `onDeactivate()` | LMS locks all inputs |
| `onReset()` | LMS resets the question to its initial state |

---

## Question with custom question text

**EN:** Functionally identical to **Question** — the same API surface, the same handlers, the same code template. The only distinction is that the question stem (the text of the question itself) is authored directly in the Knowledgeworker CMS rather than hardcoded inside the asset. The asset receives the question text at runtime via `onInitialize` and renders only the answer options and interaction area. Use this type when course authors need to edit or translate the question text without touching the asset code.

**DE:** Funktional identisch mit **Question** – dieselbe API-Oberfläche, dieselben Callbacks, dasselbe Code-Template. Der einzige Unterschied besteht darin, dass der Fragestamm (der eigentliche Fragetext) direkt im Knowledgeworker CMS verfasst wird, anstatt fest im Asset-Code eingebettet zu sein. Das Asset erhält den Fragetext zur Laufzeit über `onInitialize` und rendert nur die Antwortoptionen und den Interaktionsbereich. Wähle diesen Typ, wenn Kursautoren den Fragetext bearbeiten oder übersetzen möchten, ohne den Asset-Code anzupassen.

> Same actions and handlers as **Question** — see table above.

---

## Advanced Question

### Who renders what

```
┌─────────────────────────────────────┐
│  Knowledgeworker Create             │
│  ┌───────────────────────────────┐  │
│  │  Your asset (iframe)          │  │
│  │                               │  │
│  │  Your interaction content     │  │  ← you build this
│  │  ○ Option A                   │  │
│  │  ○ Option B                   │  │
│  │  ○ Option C                   │  │
│  │                               │  │
│  │  [Check Answer]  [Retry]      │  │  ← you render & style these too
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

> **Note:** "Advanced" means more responsibility for the developer, not more capability. You gain full visual control over the buttons — but you take on the work of rendering, styling, and wiring them yourself.

**EN:** An Advanced Question gives you full control over the Check Answer, Retry, and Show Solution buttons — you render and style them yourself inside the iframe. The LMS tells your asset when to show or hide each button via `onShowCheckAnswerButton()`, `onShowRetryButton()`, and `onShowSolutionButton()`. When the learner clicks a button, your asset notifies the LMS via `checkAnswerButtonClicked()`, `solutionButtonClicked()`, or `retryButtonClicked()`. All other feedback and lifecycle callbacks are identical to Question. Use this type when the visual design of the action buttons must be tightly integrated with the asset's own UI.

**DE:** Eine Advanced Question gibt dir die volle Kontrolle über die Schaltflächen „Antwort prüfen", „Wiederholen" und „Lösung anzeigen" – du renderst und gestaltest sie selbst innerhalb des iFrames. Das LMS teilt deinem Asset mit, wann jede Schaltfläche ein- oder ausgeblendet werden soll – über `onShowCheckAnswerButton()`, `onShowRetryButton()` und `onShowSolutionButton()`. Wenn der Lernende eine Schaltfläche klickt, benachrichtigt dein Asset das LMS über `checkAnswerButtonClicked()`, `solutionButtonClicked()` oder `retryButtonClicked()`. Alle anderen Feedback- und Lebenszyklus-Callbacks sind identisch mit dem Question-Typ. Wähle diesen Typ, wenn das visuelle Design der Aktionsschaltflächen eng mit der eigenen Benutzeroberfläche des Assets abgestimmt sein muss.

### Actions
| Action | Description |
| :--- | :--- |
| `answered(answer, passed, score)` | Submits the learner's answer to the LMS |
| `checkAnswerButtonClicked()` | Notifies LMS that the learner clicked Check Answer |
| `solutionButtonClicked()` | Notifies LMS that the learner clicked Show Solution |
| `retryButtonClicked()` | Notifies LMS that the learner clicked Retry |
| `setHeight(px)` | Requests an iframe height change from the LMS |
| `setSuspendData(string)` | Persists learner state to the LMS |
| `setSharedData(string)` | Shares state across assets in the same course |

### Handlers
| Handler | Triggered when… |
| :--- | :--- |
| `onInitialize(config)` | LMS sends initial configuration after window load |
| `onDesignChanged(design)` | LMS updates design tokens at runtime |
| `onSharedDataChanged(data)` | Another asset updates shared data |
| `onEvaluatedChanged(bool)` | Course author toggles evaluation mode |
| `onShowCheckAnswerButton(visible)` | LMS shows or hides the Check Answer button |
| `onShowRetryButton(visible)` | LMS shows or hides the Retry button |
| `onShowSolutionButton(visible)` | LMS shows or hides the Show Solution button |
| `onShowResult(result)` | LMS reveals overall result feedback |
| `onShowFeedback(feedback)` | LMS reveals general feedback text |
| `onShowAnswerFeedback(feedback)` | LMS reveals per-answer feedback |
| `onShowSolution()` | LMS reveals the correct answer |
| `onDeactivate()` | LMS locks all inputs |
| `onReset()` | LMS resets the question to its initial state |

---

## Critical naming distinction: `onShowSolution` vs `onShowSolutionButton`

These two handlers look similar but do completely different things and belong to different types:

| Handler | Available in | What it does |
| :--- | :--- | :--- |
| `onShowSolution()` | `question`, `question-with-custom-question-text`, `advanced-question` | LMS tells the asset to **reveal the correct answer** in the UI |
| `onShowSolutionButton(show)` | `advanced-question` only | LMS tells the asset to **show or hide its "Show Solution" button** |

The same distinction applies to the Check Answer and Retry pairs:

| Handler | Available in | What it does |
| :--- | :--- | :--- |
| *(no equivalent)* | — | — |
| `onShowCheckAnswerButton(show)` | `advanced-question` only | LMS shows or hides the **Check Answer button** |
| *(no equivalent)* | — | — |
| `onShowRetryButton(show)` | `advanced-question` only | LMS shows or hides the **Retry button** |

**Rule of thumb:** If the handler name ends in `Button`, it controls button visibility and is exclusive to `advanced-question`. Without `Button`, it controls content visibility and is available to all question types.

---

## Capability comparison

| | Medium | Question | Question w/ custom text | Advanced Question |
| :--- | :---: | :---: | :---: | :---: |
| Self-managed completion (`completed`) | ✅ | ❌ | ❌ | ❌ |
| Answer submission (`answered`) | ❌ | ✅ | ✅ | ✅ |
| Scoring | ❌ | ✅ | ✅ | ✅ |
| LMS-controlled feedback (`onShowResult`) | ❌ | ✅ | ✅ | ✅ |
| LMS-controlled solution (`onShowSolution`) | ❌ | ✅ | ✅ | ✅ |
| LMS-controlled reset (`onReset`) | ❌ | ✅ | ✅ | ✅ |
| Question text from CMS | ❌ | ❌ | ✅ | ❌ |
| Asset renders Check/Retry/Solution buttons | ❌ | ❌ | ❌ | ✅ |
| LMS controls button visibility | ❌ | ❌ | ❌ | ✅ |

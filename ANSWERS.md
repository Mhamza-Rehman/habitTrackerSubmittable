1) How to run
Local run (fresh machine)
1. Open `index.html` directly in your browser.


No package manager, build step, or framework install is required.

I did not deploy this project, so there is no live URL.


2) Stack & design choices
I chose plain `HTML + CSS + Vanilla JavaScript + localStorage` as this stack keeps startup time low, avoids build overhead, and makes behavior easy to inspect in one pass and also quick to setup.


Two specific decisions:


1. I decided to set monday as the starting point for the week.It makes the weekly metrics deterministic and easy to read.

2. Empty-state-first interaction:
When there are no habits, the grid is hidden and a centered empty state is shown.Once habits exist, the grid appears.This is good for human computer interaction and makes the UI look not broken


3) Responsive & accessibility
360px phone behavior
- The weekly table does not compress into unreadable cells.
- The `.grid-scroll` wrapper uses horizontal scrolling (`overflow-x: auto` with touch scrolling), so users can pan across days.



1440px laptop behavior
- The app stays centered with a max-width container.
- Full weekly grid is visible without horizontal scrolling.
- Spacing and card structure keep sections distinct (header, form, grid).


One accessibility consideration handled
I added keyboard-visible focus styling (`:focus-visible`) for form fields, buttons, and custom checkboxes.

One accessibility consideration knowingly skipped
I did not add a “confirm before delete” step for habit removal. Right now, clicking Delete removes a habit immediately. I skipped this to keep the flow fast in this version


4) AI usage
I used GPT-5 Codex (this coding assistant) for implementation support.


1. Used AI to scaffold the semantic app structure:
- Prompted for a minimal layout with week navigation, form, empty state, and grid wrapper.
- Output created `index.html`/`styles.css` baseline sections.


2. Used AI to implement data/state mechanics:
- Prompted for `state`, storage sync, and form submission flow in `app.js`.
- Output included `loadStateFromStorage`, `saveStateToStorage`, sanitization, and ID generation.


3. Used AI to implement week math and rendering loops:
- Prompted for Monday normalization, 7-day generation, week navigation, and dynamic headers.
- Output included `getMondayOfDateWeek`, `generateWeeklyDateArray`, and `render`.


4. Used AI to implement streak logic and row interactions:
- Prompted for backtracking streak behavior, checkbox toggles, rename/delete actions, and empty-state toggling.
- Output included `calculateCurrentStreak`, history writes, and inline handlers.


Specific change I made to AI output:
The AI first placed habit names directly into HTML. I changed that by escaping special characters first, so user text is treated as plain text, not code. This prevents broken layout and avoids HTML/script injection issues.


## 5) Honest gap
The least-polished part is interaction feedback around destructive actions:
- Delete happens immediately with no confirmation/undo.
- Rename uses `prompt(...)`, which is functional but not a refined UX.


With one more day, I would replace both with an toast: confirm delete, support undo for a few seconds, and use a rename dialog 




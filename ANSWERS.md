# Habit Tracker Design Defenses

## 1) Why weeks start on Monday
The tracker normalizes each rendered week to Monday-first (`getMondayOfDateWeek`) because it provides a stable seven-day block that aligns with common planning workflows and avoids shifting ambiguity around Sundays. This keeps navigation deterministic (`-7` / `+7` days) and ensures every anchor date maps to exactly one predictable weekly grid.

## 2) Why streak calculation is continuous (today/yesterday bridge)
`calculateCurrentStreak(habitId)` backtracks from today, but it intentionally preserves momentum for realistic usage patterns:
- If today is checked, streak counting starts from today.
- If today is unchecked but yesterday is checked, counting starts from yesterday.
- If both are unchecked, streak is `0`.

This prevents streaks from breaking early in the day for evening habits while still enforcing strict backward continuity after the starting point.

## 3) Layout scaling and mobile responsiveness
The grid is rendered as a true table for semantic day-column alignment. To protect readability on small screens, the table wrapper uses horizontal scrolling (`overflow-x: auto` and `-webkit-overflow-scrolling: touch`) and the table keeps a minimum width so columns never collapse into unusable cells. The outer layout uses fluid spacing and responsive controls so interaction stays intact across desktop and mobile viewports.
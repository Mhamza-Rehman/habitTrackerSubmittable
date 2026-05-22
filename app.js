const STORAGE_KEYS = {
  habits: "habitTracker.habits",
  history: "habitTracker.history",
};

const state = {
  habits: [],
  history: {},
  currentAnchorDate: getTodayAtMidnight(),
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getTodayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, daysToAdd) {
  const next = new Date(date);
  next.setDate(next.getDate() + daysToAdd);
  return next;
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMondayOfDateWeek(targetDate) {
  const date = toDateOnly(targetDate);
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}

function generateWeeklyDateArray(mondayDate) {
  const monday = toDateOnly(mondayDate);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

function sanitizeHabitText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateHabitId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `habit_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadStateFromStorage() {
  try {
    const rawHabits = localStorage.getItem(STORAGE_KEYS.habits);
    const parsedHabits = rawHabits ? JSON.parse(rawHabits) : [];
    state.habits = Array.isArray(parsedHabits) ? parsedHabits : [];
  } catch (error) {
    console.warn("Could not load habits from localStorage.", error);
    state.habits = [];
  }

  try {
    const rawHistory = localStorage.getItem(STORAGE_KEYS.history);
    const parsedHistory = rawHistory ? JSON.parse(rawHistory) : {};
    state.history =
      parsedHistory && typeof parsedHistory === "object" && !Array.isArray(parsedHistory)
        ? parsedHistory
        : {};
  } catch (error) {
    console.warn("Could not load history from localStorage.", error);
    state.history = {};
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(state.habits));
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
  } catch (error) {
    console.warn("Could not save state to localStorage.", error);
  }
}

function handleHabitFormSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const input = form.querySelector('input[name="habitName"]');

  if (!input) {
    return;
  }

  const sanitizedName = sanitizeHabitText(input.value);

  if (!sanitizedName) {
    input.value = "";
    return;
  }

  const newHabit = {
    id: generateHabitId(),
    name: sanitizedName,
    createdAt: new Date().toISOString(),
  };

  state.habits.push(newHabit);
  saveStateToStorage();
  input.value = "";
  render();
}

function formatWeekRange(weekDates) {
  const start = weekDates[0];
  const end = weekDates[6];
  const dateFormat = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  });
  const endFormat = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${dateFormat.format(start)} - ${endFormat.format(end)}`;
}

function renderTableHeader(weekDates) {
  const thead = document.querySelector(".habit-grid thead");
  if (!thead) {
    return;
  }

  const today = getTodayAtMidnight();
  const todayInWeek = weekDates.some((date) => isSameDate(date, today));

  const columns = weekDates
    .map((date, index) => {
      const isToday = todayInWeek && isSameDate(date, today);
      const className = isToday ? ' class="is-today"' : "";
      return `<th scope="col"${className}>${DAY_LABELS[index]} ${date.getDate()}</th>`;
    })
    .join("");

  thead.innerHTML = `<tr><th scope="col">Habit</th>${columns}</tr>`;
}

function renderTableBody(weekDates) {
  const tbody = document.querySelector(".habit-grid tbody");
  if (!tbody) {
    return;
  }

  if (state.habits.length === 0) {
    tbody.innerHTML = "";
    return;
  }

  const rows = state.habits
    .map((habit) => {
      const currentStreak = calculateCurrentStreak(habit.id);
      const safeHabitName = escapeHtml(habit.name);
      const dayCells = weekDates
        .map((date, index) => {
          const dateKey = date.toISOString().slice(0, 10);
          const checkboxId = `check_${habit.id}_${dateKey}`;
          const completed = Boolean(state.history?.[dateKey]?.[habit.id]);
          return `
            <td>
              <label class="check-control" for="${checkboxId}">
                <input class="check-input" type="checkbox" id="${checkboxId}" data-habit-id="${habit.id}" data-date="${dateKey}" onchange="handleHabitToggle(event)" ${
            completed ? "checked" : ""
          } />
                <span class="check-box" aria-hidden="true"></span>
                <span class="sr-only">Mark ${safeHabitName} ${DAY_LABELS[index]}</span>
              </label>
            </td>
          `;
        })
        .join("");

      return `
        <tr>
          <td>
            <button type="button" class="habit-title-btn" onclick="handleRenameHabit('${habit.id}')">${safeHabitName}</button>
            <span class="streak-pill" aria-label="Current streak">${currentStreak} day${currentStreak === 1 ? "" : "s"}</span>
            <button type="button" class="row-delete-btn" onclick="handleDeleteHabit('${habit.id}')" aria-label="Delete ${safeHabitName}">Delete</button>
          </td>
          ${dayCells}
        </tr>
      `;
    })
    .join("");

  tbody.innerHTML = rows;
}

function renderWeekRangeLabel(weekDates) {
  const weekRangeEl = document.querySelector(".week-range");
  if (weekRangeEl) {
    weekRangeEl.textContent = formatWeekRange(weekDates);
  }
}

function renderEmptyState() {
  const emptyState = document.getElementById("emptyState");
  const gridScroll = document.querySelector(".grid-scroll");
  if (!emptyState) {
    return;
  }

  const hasHabits = state.habits.length > 0;
  emptyState.hidden = hasHabits;

  if (gridScroll) {
    gridScroll.hidden = !hasHabits;
  }
}

function render() {
  const monday = getMondayOfDateWeek(state.currentAnchorDate);
  const weekDates = generateWeeklyDateArray(monday);

  renderWeekRangeLabel(weekDates);
  renderTableHeader(weekDates);
  renderTableBody(weekDates);
  renderEmptyState();
}

function removeHabitFromHistory(habitId) {
  Object.keys(state.history).forEach((dateKey) => {
    if (!state.history[dateKey] || typeof state.history[dateKey] !== "object") {
      return;
    }

    delete state.history[dateKey][habitId];

    if (Object.keys(state.history[dateKey]).length === 0) {
      delete state.history[dateKey];
    }
  });
}

function isHabitDoneOnDate(habitId, date) {
  const dateKey = date.toISOString().slice(0, 10);
  return Boolean(state.history?.[dateKey]?.[habitId]);
}

function countBackwardStreak(habitId, startDate) {
  let streak = 0;
  let cursor = toDateOnly(startDate);

  while (isHabitDoneOnDate(habitId, cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function calculateCurrentStreak(habitId) {
  const today = getTodayAtMidnight();
  const yesterday = addDays(today, -1);

  if (isHabitDoneOnDate(habitId, today)) {
    return countBackwardStreak(habitId, today);
  }

  if (isHabitDoneOnDate(habitId, yesterday)) {
    return countBackwardStreak(habitId, yesterday);
  }

  return 0;
}

function handleHabitToggle(event) {
  const checkbox = event.target;
  const habitId = checkbox.dataset.habitId;
  const dateKey = checkbox.dataset.date;

  if (!habitId || !dateKey) {
    return;
  }

  if (!state.history[dateKey]) {
    state.history[dateKey] = {};
  }

  if (checkbox.checked) {
    state.history[dateKey][habitId] = true;
  } else {
    delete state.history[dateKey][habitId];
    if (Object.keys(state.history[dateKey]).length === 0) {
      delete state.history[dateKey];
    }
  }

  saveStateToStorage();
  render();
}

function handleDeleteHabit(habitId) {
  state.habits = state.habits.filter((habit) => habit.id !== habitId);
  removeHabitFromHistory(habitId);
  saveStateToStorage();
  render();
}

function handleRenameHabit(habitId) {
  const habit = state.habits.find((item) => item.id === habitId);
  if (!habit) {
    return;
  }

  const nextName = window.prompt("Rename habit", habit.name);
  if (nextName === null) {
    return;
  }

  const sanitizedName = sanitizeHabitText(nextName);
  if (!sanitizedName) {
    return;
  }

  habit.name = sanitizedName;
  saveStateToStorage();
  render();
}

function handlePreviousWeek() {
  state.currentAnchorDate = addDays(state.currentAnchorDate, -7);
  render();
}

function handleNextWeek() {
  state.currentAnchorDate = addDays(state.currentAnchorDate, 7);
  render();
}

function handleThisWeek() {
  state.currentAnchorDate = getTodayAtMidnight();
  render();
}

function initializeHabitDataLayer() {
  loadStateFromStorage();
  window.handleHabitToggle = handleHabitToggle;
  window.handleDeleteHabit = handleDeleteHabit;
  window.handleRenameHabit = handleRenameHabit;

  const habitForm = document.getElementById("habitForm");
  if (habitForm) {
    habitForm.addEventListener("submit", handleHabitFormSubmit);
  }

  const prevWeekBtn = document.getElementById("prevWeekBtn");
  const nextWeekBtn = document.getElementById("nextWeekBtn");
  const thisWeekBtn = document.getElementById("thisWeekBtn");

  if (prevWeekBtn) {
    prevWeekBtn.addEventListener("click", handlePreviousWeek);
  }

  if (nextWeekBtn) {
    nextWeekBtn.addEventListener("click", handleNextWeek);
  }

  if (thisWeekBtn) {
    thisWeekBtn.addEventListener("click", handleThisWeek);
  }

  render();
}

initializeHabitDataLayer();

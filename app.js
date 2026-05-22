const STORAGE_KEYS = {
  habits: "habitTracker.habits",
  history: "habitTracker.history",
};

const state = {
  habits: [],
  history: {},
  currentAnchorDate: getTodayAtMidnight(),
};

function getTodayAtMidnight() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function sanitizeHabitText(value) {
  return value.replace(/\s+/g, " ").trim();
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
}

function initializeHabitDataLayer() {
  loadStateFromStorage();

  const habitForm = document.getElementById("habitForm");
  if (habitForm) {
    habitForm.addEventListener("submit", handleHabitFormSubmit);
  }
}

initializeHabitDataLayer();

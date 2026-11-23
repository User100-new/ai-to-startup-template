// Ascend Catalyst interactions. Personal check-ins are stored in this browser.
(function () {
  "use strict";

  const STORE_KEY = "ascend-catalyst";
  const today = new Date();
  const todayKey = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
  const emptyState = { goal: "", mood: "", water: 0, completed: [], history: [] };
  let state = emptyState;
  let storageAvailable = true;
  const notice = document.getElementById("storage-notice");

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!saved || typeof saved !== "object") return emptyState;
      const sameDay = saved.day === todayKey;
      return {
        goal: typeof saved.goal === "string" ? saved.goal : "",
        mood: sameDay && typeof saved.mood === "string" ? saved.mood : "",
        water: sameDay && Number.isInteger(saved.water) && saved.water >= 0 ? Math.min(saved.water, 8) : 0,
        completed: sameDay && Array.isArray(saved.completed) ? saved.completed.filter(function (id) { return typeof id === "string"; }) : [],
        history: Array.isArray(saved.history) ? saved.history.filter(function (entry) {
          return entry && typeof entry.date === "string" && typeof entry.activity === "string";
        }).slice(0, 30) : []
      };
    } catch (error) {
      storageAvailable = false;
      return emptyState;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        day: todayKey,
        goal: state.goal,
        mood: state.mood,
        water: state.water,
        completed: state.completed,
        history: state.history
      }));
    } catch (error) {
      storageAvailable = false;
      if (notice) {
        notice.hidden = false;
        notice.textContent = "Your browser couldn't save this change. It will be available until this page is refreshed.";
      }
    }
  }

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function dayFor(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function readableDate(value) {
    return new Date(value + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  }

  function showStorageNotice() {
    if (!storageAvailable && notice) {
      notice.hidden = false;
      notice.textContent = "Browser storage is unavailable. Your changes will last until this page is refreshed.";
    }
  }

  state = readState();

  function showView() {
    const requested = location.hash.slice(1) || "home";
    const views = Array.from(document.querySelectorAll("[data-view]"));
    const current = views.some(function (view) { return view.id === requested; }) ? requested : "home";
    views.forEach(function (view) { view.hidden = view.id !== current; });
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", showView);
  showView();

  function renderGoals() {
    const container = document.getElementById("goal-options");
    container.replaceChildren();
    GOALS.forEach(function (goal) {
      const button = node("button", "goal-card goal-" + goal.color);
      button.type = "button";
      button.setAttribute("aria-pressed", state.goal === goal.id ? "true" : "false");
      const icon = node("span", "goal-icon", goal.icon);
      icon.setAttribute("aria-hidden", "true");
      const check = node("span", "goal-check", state.goal === goal.id ? "✓" : "+");
      check.setAttribute("aria-hidden", "true");
      button.append(icon, node("strong", "", goal.title), node("span", "goal-description", goal.description), check);
      button.addEventListener("click", function () {
        state.goal = state.goal === goal.id ? "" : goal.id;
        saveState();
        renderGoals();
        document.getElementById("goal-status").textContent = state.goal
          ? "Your focus is " + goal.title.toLowerCase() + "."
          : "Your focus has been cleared.";
      });
      container.append(button);
    });
  }

  document.querySelectorAll(".mood-button").forEach(function (button) {
    function update() {
      const selected = state.mood === button.dataset.mood;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    }
    update();
    button.addEventListener("click", function () {
      state.mood = state.mood === button.dataset.mood ? "" : button.dataset.mood;
      saveState();
      document.querySelectorAll(".mood-button").forEach(update);
      document.getElementById("mood-status").textContent = state.mood
        ? "Thanks for checking in: " + state.mood.toLowerCase() + "."
        : "A quick check-in, just for you.";
    });
  });
  if (state.mood) document.getElementById("mood-status").textContent = "Thanks for checking in: " + state.mood.toLowerCase() + ".";

  function renderWater() {
    const bar = document.getElementById("water-progress");
    bar.style.width = Math.min(state.water / 8 * 100, 100) + "%";
    document.getElementById("water-count").textContent = state.water + (state.water === 1 ? " glass logged" : " glasses logged");
  }
  document.getElementById("water-add").addEventListener("click", function () {
    state.water += 1;
    saveState();
    renderWater();
  });
  renderWater();

  let activeFilter = "Everything";
  const filterContainer = document.getElementById("workout-filters");

  function renderWorkouts() {
    const grid = document.getElementById("workout-grid");
    grid.replaceChildren();
    WORKOUTS.filter(function (workout) {
      return activeFilter === "Everything" || workout.category === activeFilter;
    }).forEach(function (workout) {
      const card = node("article", "program-card");
      const visual = node("div", "program-visual visual-" + workout.color);
      const icon = node("span", "program-art-icon", workout.icon);
      icon.setAttribute("aria-hidden", "true");
      visual.append(icon, node("span", "pill program-duration", workout.duration));
      const content = node("div", "program-content");
      content.append(
        node("span", "eyebrow", workout.level),
        node("h3", "", workout.name),
        node("p", "program-description", workout.description),
        node("p", "program-detail", workout.detail)
      );
      const done = state.completed.includes(workout.id);
      const button = node("button", "button " + (done ? "button-completed" : "button-outline"), done ? "Done for today ✓" : "I did this today");
      button.type = "button";
      button.setAttribute("aria-pressed", done ? "true" : "false");
      button.addEventListener("click", function () {
        state.completed = done
          ? state.completed.filter(function (id) { return id !== workout.id; })
          : state.completed.concat(workout.id);
        saveState();
        renderWorkouts();
      });
      content.append(button);
      card.append(visual, content);
      grid.append(card);
    });
    const count = state.completed.length;
    document.getElementById("workout-completion").textContent = count
      ? count + " movement " + (count === 1 ? "idea" : "ideas") + " checked off today"
      : "Check off an activity to celebrate showing up.";
  }

  function renderFilters() {
    filterContainer.replaceChildren();
    WORKOUT_FILTERS.forEach(function (filter) {
      const button = node("button", "filter-button" + (filter === activeFilter ? " active" : ""), filter);
      button.type = "button";
      button.setAttribute("aria-pressed", filter === activeFilter ? "true" : "false");
      button.addEventListener("click", function () {
        activeFilter = filter;
        renderFilters();
        renderWorkouts();
      });
      filterContainer.append(button);
    });
  }
  renderFilters();
  renderWorkouts();

  function renderMeals() {
    const meals = MEALS[document.getElementById("meal-day").value] || MEALS.day;
    const grid = document.getElementById("meal-grid");
    grid.replaceChildren();
    meals.forEach(function (meal) {
      const card = node("article", "meal-card");
      const art = node("div", "meal-visual meal-" + meal.color);
      const icon = node("span", "meal-art-icon", meal.icon);
      icon.setAttribute("aria-hidden", "true");
      art.append(icon, node("span", "eyebrow", meal.type));
      const content = node("div", "meal-content");
      content.append(node("h3", "", meal.title), node("p", "", meal.description));
      const alternatives = node("details", "alternative-details");
      alternatives.append(node("summary", "", "An easy alternative"), node("p", "", meal.swap));
      content.append(alternatives);
      card.append(art, content);
      grid.append(card);
    });
  }
  document.getElementById("meal-day").addEventListener("change", renderMeals);
  renderMeals();

  const swaps = document.getElementById("swap-grid");
  SWAPS.forEach(function (swap) {
    const item = node("article", "swap-card");
    const icon = node("span", "swap-icon", swap.icon);
    icon.setAttribute("aria-hidden", "true");
    const words = node("div", "swap-words");
    words.append(
      node("span", "swap-from", swap.from),
      node("span", "swap-arrow", "→"),
      node("strong", "", swap.to),
      node("p", "", swap.note)
    );
    item.append(icon, words);
    swaps.append(item);
  });

  function renderProgress() {
    const summary = document.getElementById("progress-summary");
    summary.replaceChildren();
    [
      { icon: "↗", label: "MOVEMENT IDEAS", value: String(state.completed.length), note: state.completed.length === 1 ? "one small win" : "at your own pace" },
      { icon: "≈", label: "GLASSES OF WATER", value: String(state.water), note: "listen to your body" },
      { icon: "♡", label: "CHECK-INS", value: String(state.history.length), note: "moments worth remembering" }
    ].forEach(function (metric) {
      const item = node("article", "summary-card");
      const icon = node("span", "summary-icon", metric.icon);
      icon.setAttribute("aria-hidden", "true");
      item.append(icon, node("span", "eyebrow", metric.label), node("strong", "summary-value", metric.value), node("span", "summary-note", metric.note));
      summary.append(item);
    });
    document.getElementById("log-count").textContent = state.history.length + (state.history.length === 1 ? " MOMENT LOGGED" : " MOMENTS LOGGED");
    const history = document.getElementById("progress-history");
    history.replaceChildren();
    if (!state.history.length) {
      const empty = node("div", "history-empty");
      const icon = node("span", "empty-icon", "✳");
      icon.setAttribute("aria-hidden", "true");
      empty.append(
        icon,
        node("strong", "", "Your story starts whenever you’re ready."),
        node("p", "", "Log a movement session, a nourishing meal, a rest day, or any moment you want to remember.")
      );
      history.append(empty);
      return;
    }
    state.history.forEach(function (entry) {
      const row = node("article", "history-entry");
      const icon = node("span", "history-icon", "✳");
      icon.setAttribute("aria-hidden", "true");
      const content = node("div", "history-content");
      content.append(node("strong", "", entry.activity));
      if (entry.note) content.append(node("p", "", entry.note));
      const time = node("time", "history-date", readableDate(entry.date));
      time.dateTime = entry.date;
      row.append(icon, content, time);
      history.append(row);
    });
  }

  document.getElementById("progress-form").addEventListener("submit", function (event) {
    event.preventDefault();
    state.history.unshift({
      date: dayFor(new Date()),
      activity: document.getElementById("log-activity").value,
      note: document.getElementById("log-note").value.trim()
    });
    state.history = state.history.slice(0, 30);
    saveState();
    document.getElementById("log-note").value = "";
    renderProgress();
    document.getElementById("progress-history").setAttribute("tabindex", "-1");
    document.getElementById("progress-history").focus();
  });

  document.getElementById("clear-progress").addEventListener("click", function () {
    if (!state.history.length) return;
    state.history = [];
    saveState();
    renderProgress();
  });

  renderGoals();
  renderProgress();
  showStorageNotice();
})();

(function () {
  "use strict";

  const STORAGE_KEY = "my-todos-v1";

  const form = document.getElementById("todoForm");
  const input = document.getElementById("todoInput");
  const prioritySelect = document.getElementById("prioritySelect");
  const listEl = document.getElementById("todoList");
  const emptyState = document.getElementById("emptyState");
  const filtersEl = document.getElementById("filters");
  const clearBtn = document.getElementById("clearCompleted");
  const itemsLeftEl = document.getElementById("itemsLeft");
  const progressTextEl = document.getElementById("progressText");
  const dateText = document.getElementById("dateText");

  let todos = load();
  let filter = "all";

  // ---- date in header ----
  const now = new Date();
  const week = ["日", "一", "二", "三", "四", "五", "六"];
  dateText.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · 星期${week[now.getDay()]}`;

  // ---- storage ----
  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  // ---- actions ----
  function addTodo(text, priority) {
    todos.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text,
      priority: priority,
      completed: false,
      createdAt: Date.now(),
    });
    save();
    render();
  }

  function toggleTodo(id) {
    const t = todos.find((x) => x.id === id);
    if (t) {
      t.completed = !t.completed;
      save();
      render();
    }
  }

  function deleteTodo(id, el) {
    if (el) {
      el.classList.add("removing");
      setTimeout(() => {
        todos = todos.filter((x) => x.id !== id);
        save();
        render();
      }, 180);
    } else {
      todos = todos.filter((x) => x.id !== id);
      save();
      render();
    }
  }

  function editTodo(id, newText) {
    const t = todos.find((x) => x.id === id);
    if (t && newText.trim()) {
      t.text = newText.trim();
      save();
    }
    render();
  }

  function clearCompleted() {
    todos = todos.filter((x) => !x.completed);
    save();
    render();
  }

  // ---- render ----
  function getFiltered() {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }

  const priorityLabel = { high: "高", medium: "中", low: "低" };

  function render() {
    const visible = getFiltered();
    listEl.innerHTML = "";

    visible.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");
      li.dataset.id = todo.id;

      // checkbox
      const checkbox = document.createElement("span");
      checkbox.className = "checkbox";
      checkbox.title = "标记完成";
      checkbox.addEventListener("click", () => toggleTodo(todo.id));

      // priority dot
      const dot = document.createElement("span");
      dot.className = "priority-dot " + todo.priority;
      dot.title = "优先级：" + priorityLabel[todo.priority];

      // text
      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = todo.text;
      text.title = "双击编辑";
      text.addEventListener("dblclick", () => startEdit(li, todo));

      // delete
      const del = document.createElement("button");
      del.className = "delete-btn";
      del.innerHTML = "&times;";
      del.title = "删除";
      del.addEventListener("click", () => deleteTodo(todo.id, li));

      li.append(checkbox, dot, text, del);
      listEl.appendChild(li);
    });

    emptyState.classList.toggle("show", visible.length === 0);
    updateFooter();
  }

  function startEdit(li, todo) {
    const textEl = li.querySelector(".todo-text");
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "todo-input";
    editInput.value = todo.text;
    editInput.style.flex = "1";
    li.replaceChild(editInput, textEl);
    editInput.focus();
    editInput.setSelectionRange(editInput.value.length, editInput.value.length);

    const finish = () => editTodo(todo.id, editInput.value);
    editInput.addEventListener("blur", finish);
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") editInput.blur();
      if (e.key === "Escape") render();
    });
  }

  function updateFooter() {
    const left = todos.filter((t) => !t.completed).length;
    const total = todos.length;
    const done = total - left;
    itemsLeftEl.textContent = `${left} 个未完成`;
    progressTextEl.textContent = total
      ? `已完成 ${done}/${total}（${Math.round((done / total) * 100)}%）`
      : "";
  }

  // ---- events ----
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTodo(text, prioritySelect.value);
    input.value = "";
    input.focus();
  });

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filter = btn.dataset.filter;
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });

  clearBtn.addEventListener("click", clearCompleted);

  render();
})();

"use strict";
// Tabs
const taskTab = document.getElementById("task");
const calendarTab = document.getElementById("calendar");
const notificationTab = document.getElementById("notification");

// Containers
const taskContainer = document.getElementById("task__container");
const calendarContainer = document.getElementById("calender__container");
const notificationContainer = document.getElementById(
  "notification__container"
);

// buttons
const addTaskBtn = document.getElementById("add-button");
const clearTaskBtn = document.getElementById("clear-button");

// Form fields
const titleField = document.getElementById("title");
const descriptionField = document.getElementById("description");
const dueDateField = document.getElementById("due-date");

const taskListElement = document.getElementById("task-list");

let taskList = [];
let currentFilter = "all";
let sortOrder = "asc";
let editMode = false;
let editId = null;

document.addEventListener("DOMContentLoaded", () => {
  addTaskBtn.addEventListener("click", addTask);
  clearTaskBtn.addEventListener("click", clearForm);
  loadTasks();
});

function addTask() {
  const title = titleField.value;
  const description = descriptionField.value;
  const dueDate = dueDateField.value;

  if (!title || !description || !dueDate) {
    alert("Please fill in all fields.");
    return;
  }

  const newTask = {
    id: Date.now(),
    title,
    description,
    dueDate,
    completed: false,
  };

  taskList.unshift(newTask);
  saveTasks();
  appendTaskToDom(newTask);
  clearForm();
}

function appendTaskToDom(task) {
  const taskElement = createTaskElement(task);
  taskListElement.insertBefore(taskElement, taskListElement.firstChild);
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  if (task.completed) {
    li.classList.add("completed");
  }
  li.dataset.id = task.id;

  const header = document.createElement("div");
  header.className = "task-item-header";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", toggleTaskCompletion);

  const title = document.createElement("h3");
  title.textContent = task.title;
  title.className = "task-title";
  if (task.completed) {
    title.classList.add("completed-title");
  }

  const description = document.createElement("p");
  description.textContent = task.description;

  const dueDate = document.createElement("p");
  dueDate.textContent = `Due: ${task.dueDate}`;

  header.appendChild(checkbox);
  header.appendChild(title);
  header.appendChild(description);
  header.appendChild(dueDate);

  li.appendChild(header);

  return li;
}

function toggleTaskCompletion(event) {
  const taskId = event.target.closest("li").dataset.id;
  const task = taskList.find((t) => t.id === Number(taskId));

  if (task) {
    task.completed = event.target.checked;
    saveTasks();
    const taskElement = event.target.closest("li");
    const titleElement = taskElement.querySelector(".task-title");
    if (task.completed) {
      taskElement.classList.add("completed");
      titleElement.classList.add("completed-title");
    } else {
      taskElement.classList.remove("completed");
      titleElement.classList.remove("completed-title");
    }
  }
}

function saveTasks() {
  localStorage.setItem("taskList", JSON.stringify(taskList));
}

function loadTasks() {
  const storedTasks = localStorage.getItem("taskList");
  if (storedTasks) {
    taskList = JSON.parse(storedTasks);
    taskList.forEach((task) => appendTaskToDom(task));
  }
}

function clearForm() {
  titleField.value = "";
  descriptionField.value = "";
  dueDateField.value = "";
}

// Event listeners
clearTaskBtn.addEventListener("click", clearForm);

taskTab.addEventListener("click", function () {
  taskTab.classList.add("active");
  calendarTab.classList.remove("active");
  notificationTab.classList.remove("active");

  taskContainer.style.display = "flex";
  notificationContainer.style.display = "none";
  calendarContainer.style.display = "none";
});

calendarTab.addEventListener("click", function () {
  calendarTab.classList.add("active");
  taskTab.classList.remove("active");
  notificationTab.classList.remove("active");

  calendarContainer.style.display = "block";
  taskContainer.style.display = "none";
  notificationContainer.style.display = "none";
});

notificationTab.addEventListener("click", function () {
  notificationTab.classList.add("active");
  calendarTab.classList.remove("active");
  taskTab.classList.remove("active");

  notificationContainer.style.display = "block";
  calendarContainer.style.display = "none";
  taskContainer.style.display = "none";
});

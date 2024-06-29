"use strict";

/**
 * Tasks functionalities
 */

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

// Buttons
const addTaskBtn = document.getElementById("add-button");
const clearTaskBtn = document.getElementById("clear-button");

// Form fields
const titleField = document.getElementById("title");
const descriptionField = document.getElementById("description");
const dueDateField = document.getElementById("due-date");

const taskListElement = document.getElementById("task-list");

// Modal
const deleteModal = document.getElementById("delete-modal");
const modalContent = deleteModal.querySelector(".modal-content");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");

// Notification popup container
const notificationsPopup = document.querySelector(".notifications-popup");

let taskList = [];
let deleteId = null;

document.addEventListener("DOMContentLoaded", () => {
  addTaskBtn.addEventListener("click", addTask);
  clearTaskBtn.addEventListener("click", clearForm);
  loadTasks();
  notifText();
  cycleNotifications();
  // notifText();
  // setInterval(checkNotifications, 10000);
  // setInterval(displayPopUpNotification, 10000);
});

function addTask() {
  const title = titleField.value;
  const description = descriptionField.value;
  const dueDate = dueDateField.value.split("T")[0];

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
  updateCalendarTasks();
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
  checkbox.className = "checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", toggleTaskCompletion);

  const content = document.createElement("div");
  content.className = "task-item-content";

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

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.innerHTML = "🗑️";
  deleteButton.addEventListener("click", function () {
    deleteId = task.id;
    showModal();
  });

  content.appendChild(title);
  content.appendChild(description);
  content.appendChild(dueDate);

  header.appendChild(checkbox);
  header.appendChild(content);
  header.appendChild(deleteButton);

  li.appendChild(header);

  return li;
}

function showModal() {
  deleteModal.classList.add("show");
  modalContent.classList.add("show");
  document.querySelector("main").classList.add("blur");
}

function hideModal() {
  deleteModal.classList.remove("show");
  modalContent.classList.remove("show");
  document.querySelector("main").classList.remove("blur");
}

function deleteTask() {
  taskList = taskList.filter((task) => task.id !== deleteId);
  saveTasks();
  loadTasks();
  document.querySelector(`li[data-id="${deleteId}"]`).remove();
  hideModal();
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
    const today = new Date().setHours(0, 0, 0, 0);
    taskList = taskList.filter((task) => {
      const taskDate = new Date(task.dueDate).setHours(0, 0, 0, 0);
      return taskDate >= today;
    });
    saveTasks();
    taskList.forEach((task) => appendTaskToDom(task));
    updateCalendarTasks();
  }
}

function clearForm() {
  titleField.value = "";
  descriptionField.value = "";
  dueDateField.value = "";
}

// Update Daily, weekly and monthly task
function updateDailyTasks() {
  dailyContainer.innerHTML = "";
  const today = new Date().toISOString().split("T")[0];
  const dailyTasks = taskList.filter((task) => task.dueDate === today);

  if (dailyTasks.length === 0) {
    dailyContainer.innerHTML = "<p>No tasks for today.</p>";
    return;
  }

  dailyTasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    dailyContainer.appendChild(taskElement);
  });
}

function updateWeeklyTasks() {
  weekContainer.innerHTML = "";
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const weeklyTasks = taskList.filter((task) => {
    const taskDate = new Date(task.dueDate);
    return taskDate >= startOfWeek && taskDate <= endOfWeek;
  });

  if (weeklyTasks.length === 0) {
    weekContainer.innerHTML = "<p>No tasks for this week.</p>";
    return;
  }

  weeklyTasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    weekContainer.appendChild(taskElement);
  });
}

function updateMonthlyTasks() {
  monthContainer.innerHTML = "";
  const month = new Date().getMonth();
  const year = new Date().getFullYear();

  const monthlyTasks = taskList.filter((task) => {
    const taskDate = new Date(task.dueDate);
    return taskDate.getMonth() === month && taskDate.getFullYear() === year;
  });

  if (monthlyTasks.length === 0) {
    monthContainer.innerHTML = "<p>No tasks for this month.</p>";
    return;
  }

  monthlyTasks.forEach((task) => {
    const taskElement = createTaskElement(task);
    monthContainer.appendChild(taskElement);
  });
}

function updateCalendarTasks() {
  updateDailyTasks();
  updateWeeklyTasks();
  updateMonthlyTasks();
}

// Notification
// function checkNotifications() {
//   const today = new Date().toISOString().split("T")[0];
//   const todaysTasks = taskList.filter(
//     (task) => task.dueDate === today && !task.completed
//   );

//   const notificationsList = document.querySelector(".notifications-popup");
//   if (!notificationsList) {
//     console.error("Notifications list element not found.");
//     return;
//   }

//   notificationsPopup.innerHTML = ""; // Clear previous notifications

//   todaysTasks.forEach((task) => {
//     const notification = document.createElement("li");
//     notification.className = "notification-item";
//     notification.textContent = `Task: ${task.title}, Due: ${task.dueDate}`;
//     notificationsPopup.appendChild(notification);
//   });

//   addRandomNotifications();
// }

const notifications = [
  "You have a missed call from John.",
  "Meeting scheduled at 2:30 PM",
  "Don't forget to submit your report.",
  "You have a new message from Sarah",
  "3 missed calls",
];

function notifText() {
  const notifContainer = document.querySelector(".notif");
  if (!notifContainer) return;

  notifContainer.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = taskList.filter((task) => task.dueDate === today);

  if (todayTasks.length > 0) {
    const notifMessage = `You have ${todayTasks.length} tasks today`;
    notif.innerHTML += `<li class="notif-text">${notifMessage}</li>`;
  }

  notifications.forEach((elem) => {
    notif.innerHTML += `
    <li class="notif-text">${elem}</li>`;
  });
}

function showNotification(notification, index) {
  const popup = document.createElement("div");
  popup.className = "notification-popup";
  popup.textContent = notification;

  document.body.appendChild(popup);

  popup.addEventListener("click", () => {
    popup.remove();
  });

  setTimeout(() => {
    popup.remove();
  }, 10000);
}

function removeNotification(index) {
  const notifications = document.querySelectorAll(".notif .notif-text");

  if (notifications[index]) {
    notifications[index].remove();
  }
}

function cycleNotifications() {
  const notifications = document.querySelectorAll(".notif .notif-text");
  if (notifications.length === 0) return;

  let currentIndex = 0;
  let IntervalId;

  function showNextNotification() {
    if (notifications[currentIndex]) {
      const currentNotification = notifications[currentIndex].textContent;

      showNotification(currentNotification, currentIndex);

      currentIndex++;

      if (currentIndex >= notifications.length) {
        clearInterval(IntervalId);
      }
    } else {
      // Log the issue for debugging

      currentIndex = 0;
    }
  }

  showNextNotification();

  IntervalId = setInterval(showNextNotification, 17000);
}

/*
function addRandomNotifications() {
  const notifications = [
    "You have a missed call from John.",
    "Meeting scheduled at 2:30 PM",
    "Don't forget to submit your report.",
    "You have a new message from Sarah",
    "3 missed calls",
  ];

  const randomIndex = Math.floor(Math.random() * notifications.length);
  const notificationText = notifications[randomIndex];

  const notification = document.createElement("li");
  notification.textContent = notificationText;
  notificationsPopup.appendChild(notification);

  // Check if this notification matches a specific index
  if (randomIndex === 2) {
    // Show the notification popup if the condition matches
    displayPopUpNotification(notificationText);
  }
}
*/

/*
function displayPopUpNotification(message) {
  const notificationPopup = document.createElement("div");
  notificationPopup.className = "notification-popup";
  notificationPopup.textContent = message;
  notifContainer.appendChild(notificationPopup);

  setTimeout(() => {
    notificationPopup.remove();
  }, 10000);
}
  */

// Event listeners
taskTab.addEventListener("click", function () {
  taskTab.classList.add("active");
  calendarTab.classList.remove("active");

  taskContainer.style.display = "flex";
  calendarContainer.style.display = "none";
});

calendarTab.addEventListener("click", function () {
  calendarTab.classList.add("active");
  taskTab.classList.remove("active");

  calendarContainer.style.display = "block";
  taskContainer.style.display = "none";

  dailyTab.classList.add("active");
  weekContainer.style.display = "none";
  monthContainer.style.display = "none";

  notif.style.display = "none";

  // notifText();
});

confirmDeleteBtn.addEventListener("click", deleteTask);
cancelDeleteBtn.addEventListener("click", hideModal);

window.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    hideModal();
  }
});

clearTaskBtn.addEventListener("click", clearForm);

/**
 * Calendar functionalities
 */

const monthEl = document.querySelector(".date h1");
const fullDateEl = document.querySelector(".date p");
const daysEl = document.querySelector(".days");

// Tabs
const dailyTab = document.getElementById("day-tab");
const weekTab = document.getElementById("week-tab");
const monthTab = document.getElementById("month-tab");
const notifTab = document.getElementById("notif-tab");

// Containers
const dailyContainer = document.querySelector(".daily-task");
const weekContainer = document.querySelector(".weekly-task");
const monthContainer = document.querySelector(".monthly-task");
const notifContainer = document.querySelector(".my-notifications");
const notif = document.querySelector(".notif");

const monthIndex = new Date().getMonth();
const lastDay = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
const firstDay = new Date(new Date().getFullYear(), monthIndex, 1).getDay() - 1;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

monthEl.innerText = months[monthIndex];
fullDateEl.innerText = new Date().toDateString();

let days = "";

for (let i = firstDay; i > 0; i--) {
  days += `<div class="empty"></div>`;
}
for (let i = 1; i <= lastDay; i++) {
  if (i === new Date().getDate()) {
    days += `<div class="today">${i}</div>`;
  } else {
    days += `<div>${i}</div>`;
  }
}

daysEl.innerHTML = days;

dailyTab.addEventListener("click", function () {
  dailyTab.classList.add("active");
  weekTab.classList.remove("active");
  monthTab.classList.remove("active");
  notifTab.classList.remove("active");

  dailyContainer.style.display = "flex";
  weekContainer.style.display = "none";
  monthContainer.style.display = "none";
  notif.style.display = "none";

  updateDailyTasks();
});

weekTab.addEventListener("click", function () {
  weekTab.classList.add("active");
  dailyTab.classList.remove("active");
  monthTab.classList.remove("active");
  notifTab.classList.remove("active");

  weekContainer.style.display = "flex";
  dailyContainer.style.display = "none";
  monthContainer.style.display = "none";
  notif.style.display = "none";

  updateWeeklyTasks();
});

monthTab.addEventListener("click", function () {
  monthTab.classList.add("active");
  dailyTab.classList.remove("active");
  weekTab.classList.remove("active");
  notifTab.classList.remove("active");

  monthContainer.style.display = "flex";
  dailyContainer.style.display = "none";
  weekContainer.style.display = "none";
  notif.style.display = "none";

  updateMonthlyTasks();
});

notifTab.addEventListener("click", function () {
  monthTab.classList.remove("active");
  dailyTab.classList.remove("active");
  weekTab.classList.remove("active");
  notifTab.classList.add("active");

  monthContainer.style.display = "none";
  dailyContainer.style.display = "none";
  weekContainer.style.display = "none";
  notif.style.display = "flex";

  notifText();
});

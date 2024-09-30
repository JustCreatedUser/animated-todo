import { TaskInput, TasksStorage } from "./tasks.js";
export const API = "http://localhost:3000/api/tasks";
const wrap = document.querySelector(".wrap"),
  taskInputContainer = wrap.querySelector(".task-input-container"),
  closeTaskInputBtn = taskInputContainer.querySelector("#close-task-input-btn"),
  taskInput = new TaskInput(".task-input", ".task-input-container"),
  openTaskInputBtn = wrap.querySelector(".open-task-input-btn"),
  main = wrap.querySelector("main");
export const tasksStorage = new TasksStorage();

function setEventListeners() {
  try {
    openTaskInputBtn.addEventListener("click", () => {
      taskInputContainer.classList.add("creating-state");
      taskInput.visibilityCheckbox.checked = true;
    });
    closeTaskInputBtn.addEventListener("click", () => {
      taskInput.close();
      taskInputContainer.classList.remove("creating-state");
    });
    taskInput.editTaskBtn.addEventListener("click", () => {
      taskInput.editTask();
    });
    main.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-edit"))
        taskInput.prepareForEditing(e);
      else if (e.target.classList.contains("btn-delete"))
        tasksStorage.deleteTask(e);
    });
  } catch (err) {
    console.error("!setEventListeners: " + err.message);
  }
}
tasksStorage.getAllTasksFromMainStorage();
setEventListeners();

export function renderTasks() {
  const list = document.getElementById("list");
  list.innerHTML = "";
  const sortedTasks = tasksStorage.getSortedByPriority();
  const unCompletedTasks = new Set(
    sortedTasks.filter((task) => task.completed === false)
  );
  const sortedSetOfTasks = new Set(sortedTasks);
  const completedTasks = sortedSetOfTasks.difference(unCompletedTasks);
  function renderTasksFromGroup(group) {
    for (const element of group) {
      const ListItem = document.createElement("li");
      group === completedTasks ? ListItem.classList.add("completed") : "";

      ListItem.innerHTML = /*html*/ `
    <div class="taskItem">${element.title}</div>
    <div class="task-actions">
    <label for="task-input-visibility" class="btn-edit">Edit</label>
    <button class="btn-delete">Delete</button>
    </div>`;
      const expirationDate = new Date(element.expirationDate);
      if (expirationDate < new Date() && !element.completed)
        ListItem.classList.add("expired");

      list.appendChild(ListItem);
    }
  }
  renderTasksFromGroup(unCompletedTasks);
  renderTasksFromGroup(completedTasks);
  const hue = getComputedStyle(wrap).getPropertyValue("--wrap-background-hue");
  hue === "180deg"
    ? (wrap.style.animationName = "body-background-forwards")
    : (wrap.style.animationName = "body-background-backwards");
}

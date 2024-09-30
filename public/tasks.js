import setup3DElement,{mouseDragStartPositions}from "./3d-transform.js";import{API,renderTasks,tasksStorage}from "./main.js";export class TaskInput{editedTask=undefined;constructor(htmlElementName,containerName){this.htmlElement=document.querySelector(htmlElementName);this.inputs={expirationDate:this.htmlElement.querySelector("#task-expiration-date"),title:this.htmlElement.querySelector("#task-title"),priority:this.htmlElement.querySelector("#task-priority"),completed:this.htmlElement.querySelector("#task-completed"),};this.container=document.querySelector(containerName);this.transformStyles=setup3DElement(this.container,this.htmlElement);this.editTaskBtn=this.htmlElement.querySelector("#edit-task-btn");this.visibilityCheckbox=document.getElementById("task-input-visibility")}
close(){this.visibilityCheckbox.checked=!1;setTimeout(()=>{this.container.classList.remove("creating-state");mouseDragStartPositions.x=0;mouseDragStartPositions.y=0;this.transformStyles.x.initialValue=0;this.transformStyles.x.val=0;this.transformStyles.y.initialValue=0;this.transformStyles.y.val=0;this.inputs.title.value="";this.inputs.expirationDate.value=this.inputs.expirationDate.getAttribute("min");this.inputs.priority.value="middle";this.inputs.completed.checked=!1;this.editedTask=undefined},300)}
getExpirationDate(){return this.inputs.expirationDate.value}
getTitle(){return this.inputs.title.value}
getPriority(){return this.inputs.priority.value}
getCompleted(){return this.inputs.completed.checked}
createNewTask(){const newTask=new Task({title:this.getTitle(),completed:this.getCompleted(),expirationDate:this.getExpirationDate(),priority:this.getPriority(),});return newTask}
async editTask(){new Promise(async(resolve,reject)=>{const isInfoValid=this.verifyInfo();if(this.editedTask&&isInfoValid){await tasksStorage.updateTask(this.editedTask.t,new Task({title:this.getTitle(),completed:this.getCompleted(),expirationDate:this.getExpirationDate(),priority:this.getPriority(),}));this.editedTask.t=this.getTitle();this.editedTask.c=this.getCompleted();this.editedTask.exp=this.getExpirationDate();this.editedTask.pr=this.getPriority();this.editedTask=undefined;resolve("Task edited")}else if(isInfoValid){const newTask=this.createNewTask();tasksStorage.safeAdd(newTask);await newTask.saveToMainStorage();resolve("Task created")}}).then(()=>{renderTasks();this.close()}).catch((err)=>alert(err.message))}
verifyInfo(){try{this.createNewTask();return!0}catch(err){alert(err.message)}
return!1}
deleteTask(){if(this.editedTask&&confirm("Are you sure you want to delete this task?"))
tasksStorage.deleteTask(this.editedTask);this.close();renderTasks()}
prepareForEditing(event){const taskTitle=event.target.parentElement.previousElementSibling.textContent;const task=tasksStorage.findTask(taskTitle);this.editedTask=task;this.inputs.title.value=task.t;this.inputs.completed.checked=task.c;this.inputs.priority.value=task.pr;this.inputs.expirationDate.value=task.exp}}
export class TasksStorage extends Array{constructor(){super()}
safeAdd(task){this.forEach((t)=>{if(t.t===task.t)throw new Error("Duplicate task");});this.push(task)}
deleteTask(event){if(!confirm("Are you sure you want to delete this task?"))return;const taskTitle=event.target.parentElement.previousElementSibling.textContent;const task=tasksStorage.findTask(taskTitle);const taskIndex=this.findIndex((t)=>t.t===task.t);if(taskIndex===-1)throw new Error("Task not found");this.splice(taskIndex,1);renderTasks();task.deleteFromMainStorage()}
async getAllTasksFromMainStorage(){try{const result=await fetch(API,{method:"GET",});const data=await result.json();for(const element of data){try{this.safeAdd(new Task(element))}catch(error){alert(error.message)}}
renderTasks()}catch(err){alert(err.message)}}
findTask(taskTitle){return this.find((task)=>task.t===taskTitle)}
getSortedByPriority(){const newArray=JSON.parse(JSON.stringify(this));newArray.sort((a,b)=>{if(a.priority===b.priority)return 0;if(a.priority==="high")return-1;if(b.priority==="high")return 1;if(a.priority==="middle")return-1;if(b.priority==="middle")return 1;if(a.priority==="low")return-1;if(b.priority==="low")return 1});return newArray}
async updateTask(previousTitle,task){const taskIndex=this.findIndex((t)=>t.t===previousTitle);if(taskIndex===-1)throw new Error("Task not found");this[taskIndex]=task;try{const result=await fetch(API,{method:"PUT",headers:{"Content-Type":"application/json",},body:JSON.stringify({previousTitle,updated:task.formatToObject(),}),});const data=await result.json()}catch(err){alert(err.message)}}}
export class Task{title;completed;expirationDate;priority;constructor(data){this.t=data.title;this.c=data.completed;this.exp=data.expirationDate;this.pr=data.priority}
get t(){return this.title}
get c(){return this.completed}
get exp(){return this.expirationDate}
get pr(){return this.priority}
set t(value){this.verifyTitle(value);this.title=value}
set c(value){this.completed=value}
set exp(value){this.verifyExpirationDate(value);this.expirationDate=value}
set pr(value){if(!["high","middle","low"].includes(value))
throw new Error("Invalid priority value");this.priority=value}
verifyTitle(value){if(value.length>50)throw new Error("Title too long");if(value.length<3)throw new Error("Title too short");return!0}
verifyExpirationDate(value){const dateRegexp=/^\d{4}-\d{2}-\d{2}$/;if(!dateRegexp.test(value))throw new Error("Invalid date format");const dateArray=value.split("-");if(dateArray[0]<2024||dateArray[1]<1||dateArray[1]>12||dateArray[2]<1||dateArray[2]>31)
throw new Error("Invalid date");if(new Date(value)>new Date().setFullYear(new Date().getFullYear()+10))
throw new Error("This date is too far in future");return!0}
async saveToMainStorage(){const result=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json",},body:JSON.stringify(this.formatToObject()),});const data=await result.json();console.log(data)}
async deleteFromMainStorage(){const result=await fetch(API,{method:"DELETE",headers:{"Content-Type":"application/json",},body:JSON.stringify({previousTitle:this.title,}),});result.json().then((data)=>{console.log(data)})}
async updateInMainStorage(){const result=await fetch(API,{method:"PUT",headers:{"Content-Type":"application/json",},body:JSON.stringify({previousTitle:this.title,updated:{title:this.title,completed:this.completed,expirationDate:this.expirationDate,priority:this.priority,},}),});result.json().then((data)=>{console.log(data)})}
formatToObject(){return{title:this.t,completed:this.c,expirationDate:this.exp,priority:this.pr,}}}
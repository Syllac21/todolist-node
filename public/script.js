// variable
const day = new Date();
let currantDay = day.toLocaleDateString();
let alltasks = [];

// Charger les tâches depuis le serveur et les afficher
function loadTasks() {
  fetch('/api/tasks')
    .then(response => response.json())
      
    .then(tasks => {
        
      tasks.sort((a,b)=>compareDate(a.deadline, b.deadline));
      const taskList = document.getElementById("taskList");
      taskList.innerHTML = "";
      tasks.forEach((task, index) => {
          
        let delta = compareDate(currantDay,task.deadline);
        const taskItem = document.createElement("div");
        let classAlert ='';
        let classDDay = '';
        classAlert = delta > 0 ? 'bg-indigo-400': 'bg-teal-400';
        classDDay = delta === 0 ? '2xl font-bold' : 'xl font-semibold';
        taskItem.className = `p-4 rounded shadow-xl ${classAlert}`;
        taskItem.innerHTML = `
          <h2 class="text-${classDDay}">${task.title}</h2>
          <div>${task.description}</div>
          <div>${task.deadline}</div>
          <button onclick="deleteTask(${Number(task.id)})" class="text-red-500 mt-2 hover:underline">Supprimer</button>
          
          <button onclick="openEditForm(${task.id})">Modifier</button>
          `;
        taskList.appendChild(taskItem);
        alltasks = tasks
        
      });

      
        const inputDate = document.getElementById('filterDate');
        inputDate.value = ""
        const changeDate =  inputDate.addEventListener('change' , ()=>{
          const tempDate = inputDate.value;
          let filterDate ='';
            if(tempDate){
                const [year , month , day] = tempDate.split('-');
                filterDate = `${day}/${month}/${year}`;
            }
          let tableFilterTasks = tasks.filter(task => compareDate(filterDate,task.deadline) === 0);
          
          taskList.innerHTML = "";
          tableFilterTasks.forEach((task, index) => {
            
            let delta = compareDate(currantDay, task.deadline);
            const taskItem = document.createElement("div");
            let classAlert ='';
            let classDDay = '';
            delta > 0 ? classAlert = 'bg-red-400': '';
            delta === 0 ? classDDay = '2xl font-bold' : classDDay = 'xl font-semibold';
            taskItem.className = `p-4 rounded shadow ${classAlert}`;
            taskItem.innerHTML = `
              <h2 class="text-${classDDay}">${task.title}</h2>
              <div>${task.description}</div>
              <div>${task.deadline}</div>
              <button onclick="deleteTask(${task.id})" class="text-red-500 mt-2 hover:underline">Supprimer</button>`;
            taskList.appendChild(taskItem);
          })
          const btnAllTasks = document.createElement('button'); 
          btnAllTasks.className ='bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded' 
          btnAllTasks.innerHTML = 'revenir à la liste des tâches';
          taskList.appendChild(btnAllTasks);
          const onClickAllTasks = btnAllTasks.addEventListener('click' , ()=>loadTasks());
        })
      });
}
  
// Ajouter une nouvelle tâche
function addTask(event) {
  event.preventDefault();
  const taskTitle = document.getElementById("taskTitle").value;
  const taskDescription = document.getElementById("taskDescription").value;
  const taskDeadlineInput = document.getElementById("taskDeadline").value;
  const taskDeadlineTable = taskDeadlineInput.split('-');
  taskDeadline = `${taskDeadlineTable[2]}/${taskDeadlineTable[1]}/${taskDeadlineTable[0]}`;
  if (taskTitle) {
    const newTask = {
      title : taskTitle,
      description : taskDescription,
      deadline : taskDeadline,
      id : Date.now() // création d'un ID à partir du timestamp (id unique)
    }
    fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    })
    .then(response => response.json())
    .then(() => {
      document.getElementById("taskTitle").value = "";
      document.getElementById("taskDescription").value = "";
      document.getElementById("taskDeadline").value = "";
      window.location.href = "index.html";
    });
  }
}

// Supprimer une tâche

function deleteTask(id) {
  console.log('Tentative de suppression de la tâche avec ID:', id); // Vérification de l'ID
  fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  .then(response => {
      if (!response.ok) throw new Error('Échec de la suppression de la tâche');
      console.log('Tâche supprimée avec succès');
      return loadTasks(); // Rechargement de la liste des tâches
    })
    .catch(error => console.error("Erreur lors de la suppression :", error));
}
// rendre la fonction deleteTask globale
window.deleteTask = deleteTask;

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("addTaskForm")) {
    document.getElementById("addTaskForm").addEventListener("submit", addTask);
  }

  if (document.getElementById("taskList")) {
    loadTasks();
  }
});

/**
 * La fonction renvoie un nombre négatif si date1<date2 et positif sir date1>date2
 * @param {date au format jj/mm/aaaa} date1 
 * @param {date au format jj/mm/aaaa} date2 
 * @returns 
 */
function compareDate(date1,date2){
  
  const [day1, month1, year1] = date1.split('/').map(Number);
  const [day2, month2, year2] = date2.split('/').map(Number);
  let compare = 0;

  year1 !== year2 ? compare = year1 - year2 : month1 !== month2 ? compare = month1 - month2 : compare = day1 - day2;
  return compare;
}

// modification des taches
let currentEditId = null;



function openEditForm(id) {
  
  const task = alltasks.find(t => t.id === id); // Trouve la tâche par ID
  if (!task) {
    return;

  } 
  console.log('task' , task);
  document.getElementById("editForm").style.display = "block";
  document.getElementById("editTitle").value = task.title;
  document.getElementById("editDescription").value = task.description;
  document.getElementById("editDeadline").value = task.deadline.split('/').reverse().join('-'); // Format pour input date
  
  currentEditId = task.id;
}
window.openEditForm = openEditForm;

function closeEditForm() {
  document.getElementById("editForm").style.display = "none";
  currentEditId = null;
}
window.closeEditForm = closeEditForm;

function submitEdit() {
  const updatedTask = {
    title: document.getElementById("editTitle").value,
    description: document.getElementById("editDescription").value,
    deadline: document.getElementById("editDeadline").value.split('-').reverse().join('/') // Format dd/mm/yyyy
  };

  fetch(`/api/tasks/${currentEditId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedTask),
  })
  .then(response => response.json())
  .then(() => {
    closeEditForm();
    loadTasks(); // Rafraîchir la liste des tâches
  })
  .catch(error => console.error('Erreur lors de la mise à jour de la tâche:', error));
}

window.submitEdit = submitEdit;
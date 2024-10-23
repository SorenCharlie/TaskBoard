// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
    return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskCard = $(`
        <div class="task-card" data-id="${task.id}" style="background-color: ${getTaskColor(task.dueDate)};">
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p>Due: ${dayjs(task.dueDate).format('MM/DD/YYYY')}</p>
            <button class="delete-btn">Delete</button>
        </div>
    `);
    // Make task card draggable
    taskCard.draggable({
        revert: true,
        start: function(event, ui) {
            $(this).addClass('dragging');
        },
        stop: function(event, ui) {
            $(this).removeClass('dragging');
        }
    });
    return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    $('#not-started').empty();
    $('#in-progress').empty();
    $('#completed').empty();
    
    taskList.forEach(task => {
        const taskCard = createTaskCard(task);
        switch (task.status) {
            case 'Not Yet Started':
                $('#not-started').append(taskCard);
                break;
            case 'In Progress':
                $('#in-progress').append(taskCard);
                break;
            case 'Completed':
                $('#completed').append(taskCard);
                break;
        }
    });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    const now = dayjs();
    const taskDate = dayjs(dueDate);
    if (taskDate.isBefore(now, 'day')) {
        return 'red'; // Overdue
    } else if (taskDate.diff(now, 'day') <= 2) {
        return 'yellow'; // Nearing deadline
    }
    return 'white'; // Default color
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    event.preventDefault();
    
    const title = $('#task-title').val();
    const description = $('#task-description').val();
    const dueDate = $('#task-due-date').val();
    
    const newTask = {
        id: generateTaskId(),
        title,
        description,
        dueDate,
        status: 'Not Yet Started'
    };
    
    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", nextId);
    
    renderTaskList();
    $('#add-task-modal').modal('hide');
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = $(event.target).closest('.task-card').data('id');
    taskList = taskList.filter(task => task.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.draggable.data('id');
    const newStatus = $(this).attr('id');
    
    const task = taskList.find(task => task.id === taskId);
    if (task) {
        task.status = newStatus === 'not-started' ? 'Not Yet Started' : newStatus === 'in-progress' ? 'In Progress' : 'Completed';
        localStorage.setItem("tasks", JSON.stringify(taskList));
        renderTaskList();
    }
    
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();
    
    // Add event listeners
    $('#add-task-btn').on('click', handleAddTask);
    $(document).on('click', '.delete-btn', handleDeleteTask);
    
    // Make lanes droppable
    $('.task-lane').droppable({
        accept: '.task-card',
        drop: handleDrop
    });

    // Initialize date picker for due date input
    $('#task-due-date').datepicker();
});

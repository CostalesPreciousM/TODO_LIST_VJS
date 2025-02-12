document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

    loadTasks();

    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = prioritySelect.value;

        if (taskText) {
            const listItem = createTaskElement(taskText, dueDate, priority, false);
            taskList.appendChild(listItem);
            sortTasks();
            saveTasks();
            taskInput.value = '';
            dueDateInput.value = '';
        }
    }

    function createTaskElement(taskText, dueDate, priority, isCompleted) {
        const listItem = document.createElement('li');
        listItem.className = `list-group-item d-flex justify-content-between align-items-center priority-${priority}`;
        listItem.dataset.priority = priority;
        listItem.dataset.dueDate = dueDate;
        if (isCompleted) listItem.classList.add('completed');

        listItem.innerHTML = `
            <span class="task-text">${taskText}</span>
            <small class="due-date">${dueDate ? `Due: ${dueDate}` : ''}</small>
            <div>
                <button class="btn btn-sm btn-success done-button">${isCompleted ? 'Undo' : 'Done'}</button>
                <button class="btn btn-sm btn-danger delete-button">Delete</button>
            </div>
        `;
        return listItem;
    }

    taskList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            e.target.closest('li').remove();
            saveTasks();
        }
        if (e.target.classList.contains('done-button')) {
            const taskItem = e.target.closest('li');
            taskItem.classList.toggle('completed');
            e.target.textContent = taskItem.classList.contains('completed') ? 'Undo' : 'Done';
            saveTasks();
        }
    });

    function sortTasks() {
        const tasks = Array.from(taskList.children);
        tasks.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityA = priorityOrder[a.dataset.priority];
            const priorityB = priorityOrder[b.dataset.priority];
            if (priorityA !== priorityB) return priorityA - priorityB;

            const dueDateA = new Date(a.dataset.dueDate || '9999-12-31');
            const dueDateB = new Date(b.dataset.dueDate || '9999-12-31');
            return dueDateA - dueDateB;
        });
        tasks.forEach(task => taskList.appendChild(task));
    }

    function highlightOverdueTasks() {
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('.due-date').forEach(el => {
            const taskItem = el.closest('li');
            if (taskItem.dataset.dueDate && taskItem.dataset.dueDate < today) {
                el.classList.add('text-danger');
            } else {
                el.classList.remove('text-danger');
            }
        });
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#taskList li').forEach(task => {
            tasks.push({
                text: task.querySelector('.task-text').textContent,
                dueDate: task.dataset.dueDate,
                priority: task.dataset.priority,
                completed: task.classList.contains('completed'),
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        storedTasks.forEach(task => {
            const listItem = createTaskElement(task.text, task.dueDate, task.priority, task.completed);
            taskList.appendChild(listItem);
        });
        sortTasks();
        highlightOverdueTasks();
    }

    setInterval(highlightOverdueTasks, 60000);
});

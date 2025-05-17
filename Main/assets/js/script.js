// Theme Switcher and UI Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Delete specific tasks (temporary code)
    deleteTasksByTitle(["Excel sheet", "Presentation on AI"]);
    
    // Theme toggle
    const themeSwitch = document.getElementById('themeSwitch');
    
    themeSwitch.addEventListener('change', function() {
        if(this.checked) {
            document.documentElement.style.setProperty('--background', '#1a1c23');
            document.documentElement.style.setProperty('--card-bg', '#242731');
            document.documentElement.style.setProperty('--text-primary', '#ffffff');
            document.documentElement.style.setProperty('--text-secondary', '#a0a0a0');
        } else {
            document.documentElement.style.setProperty('--background', '#f8f9fa');
            document.documentElement.style.setProperty('--card-bg', '#ffffff');
            document.documentElement.style.setProperty('--text-primary', '#212529');
            document.documentElement.style.setProperty('--text-secondary', '#6c757d');
        }
    });
    
    // Sidebar toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.body.classList.toggle('sidebar-collapsed');
        });
    }
    
    // Handle small screens initially
    handleSmallScreens();
    
    // Handle resize
    window.addEventListener('resize', handleSmallScreens);

    // Add Task Button (navigation)
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            showAddTaskModal();
        });
    }
    
    // Add Task Button (in task list)
    const addTaskButton = document.querySelector('.btn-add-task');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', function() {
            showAddTaskModal();
        });
    }
    
    // Load tasks from storage or initialize empty
    initializeTasks();

    // Search functionality
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase().trim();
            filterTasks(searchValue);
        });
    }
});

// Handle small screens
function handleSmallScreens() {
    if (window.innerWidth <= 768) {
        document.body.classList.remove('sidebar-collapsed');
    } else {
        document.body.classList.remove('sidebar-collapsed');
    }
}

// Initialize tasks from storage or start empty
function initializeTasks() {
    // Try to get tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // If no tasks, the lists remain empty
    if (tasks.length > 0) {
        renderTasks(tasks);
    }
    
    // Update task stats even if empty
    updateTaskStats();
}

// Render tasks to the appropriate lists
function renderTasks(tasks) {
    const todayList = document.getElementById('todayTasksList');
    
    // Clear existing tasks
    todayList.innerHTML = '';
    
    // Render all tasks in today's task list (no separation now)
    tasks.forEach(task => {
        // Create task element
        const taskElement = createTaskElement(task);
        
        // Add to the task list
        todayList.appendChild(taskElement);
    });
    
    // Initialize the task interactivity
    initTaskCheckboxes();
    initTaskActionButtons();
}

// Create task element
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.dataset.id = task.id;
    
    taskItem.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}">
            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
        </div>
        <div class="task-content">
            <h3 class="task-title">${task.title}</h3>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div class="task-meta">
                <span>Due: ${formatDate(task.dueDate)}</span>
                <div class="task-tags">
                    ${task.priority ? `<span class="tag">${task.priority}</span>` : ''}
                    ${task.tags ? task.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        </div>
        <div class="task-actions">
            <button class="task-action-btn"><i class="fas fa-edit"></i></button>
            <button class="task-action-btn"><i class="fas fa-trash-alt"></i></button>
        </div>
    `;
    
    return taskItem;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
        return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        });
    }
}

// Initialize task checkboxes
function initTaskCheckboxes() {
    const taskCheckboxes = document.querySelectorAll('.task-checkbox');
    
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            this.classList.toggle('checked');
            if(this.classList.contains('checked')) {
                this.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                this.innerHTML = '';
            }
            
            // Update task in storage
            const taskItem = this.closest('.task-item');
            const taskId = taskItem.dataset.id;
            updateTaskCompletionStatus(taskId, this.classList.contains('checked'));
            
            // Update task count stats
            updateTaskStats();
        });
    });
}

// Update task completion status
function updateTaskCompletionStatus(taskId, isCompleted) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Find and update the task
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: isCompleted };
        }
        return task;
    });
    
    // Save back to storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

// Initialize task action buttons
function initTaskActionButtons() {
    // Edit task buttons
    const editButtons = document.querySelectorAll('.task-action-btn:first-child');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const taskItem = this.closest('.task-item');
            const taskId = taskItem.dataset.id;
            editTask(taskId);
        });
    });
    
    // Delete task buttons
    const deleteButtons = document.querySelectorAll('.task-action-btn:last-child');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const taskItem = this.closest('.task-item');
            const taskId = taskItem.dataset.id;
            const taskTitle = taskItem.querySelector('.task-title').textContent;
            
            if (confirm(`Are you sure you want to delete task: ${taskTitle}?`)) {
                deleteTask(taskId);
                taskItem.remove();
                // Update task count stats
                updateTaskStats();
            }
        });
    });
}

// Edit a task
function editTask(taskId) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Find the task to edit
    const taskToEdit = tasks.find(task => task.id === taskId);
    
    if (taskToEdit) {
        // Create edit modal HTML if it doesn't exist
        if (!document.getElementById('editTaskModal')) {
            const modalHTML = `
                <div id="editTaskModal" class="task-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Edit Task</h2>
                            <span class="close-modal">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="editTaskForm">
                                <input type="hidden" id="editTaskId">
                                <div class="form-group">
                                    <label for="editTaskTitle">Task Title</label>
                                    <input type="text" id="editTaskTitle" required>
                                </div>
                                <div class="form-group">
                                    <label for="editTaskDescription">Description</label>
                                    <textarea id="editTaskDescription"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="editTaskPriority">Priority</label>
                                    <select id="editTaskPriority">
                                        <option value="Normal">Low</option>
                                        <option value="Important">Medium</option>
                                        <option value="Urgent">High</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="editTaskDueDate">Due Date</label>
                                    <input type="datetime-local" id="editTaskDueDate">
                                </div>
                                <div class="form-actions">
                                    <button type="button" id="cancelEditBtn" class="btn-cancel">Cancel</button>
                                    <button type="submit" class="btn-primary">Update Task</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            // Append modal to body
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer.firstElementChild);
            
            // Add event listeners for modal
            document.querySelector('#editTaskModal .close-modal').addEventListener('click', closeEditModal);
            document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
            document.getElementById('editTaskForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const id = document.getElementById('editTaskId').value;
                const title = document.getElementById('editTaskTitle').value;
                const description = document.getElementById('editTaskDescription').value;
                const priority = document.getElementById('editTaskPriority').value;
                const dueDate = document.getElementById('editTaskDueDate').value;
                
                if (title.trim() !== '') {
                    updateTask(id, title.trim(), dueDate, priority, description);
                    closeEditModal();
                }
            });
        }
        
        // Fill form with task data
        document.getElementById('editTaskId').value = taskToEdit.id;
        document.getElementById('editTaskTitle').value = taskToEdit.title;
        document.getElementById('editTaskDescription').value = taskToEdit.description || '';
        document.getElementById('editTaskPriority').value = taskToEdit.priority || 'Normal';
        
        // Format date for datetime-local input
        if (taskToEdit.dueDate) {
            const dueDate = new Date(taskToEdit.dueDate);
            const formattedDate = dueDate.toISOString().slice(0, 16);
            document.getElementById('editTaskDueDate').value = formattedDate;
        }
        
        // Display the modal
        document.getElementById('editTaskModal').style.display = 'block';
    }
}

// Close edit task modal
function closeEditModal() {
    const modal = document.getElementById('editTaskModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Update task in storage
function updateTask(taskId, title, dueDate, priority, description) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Update the task
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            return { 
                ...task, 
                title: title,
                description: description || '',
                dueDate: dueDate || task.dueDate,
                priority: priority || task.priority
            };
        }
        return task;
    });
    
    // Save back to storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Re-render tasks
    renderTasks(updatedTasks);
}

// Delete a task
function deleteTask(taskId) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Filter out the task to delete
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    
    // Save back to storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
}

// Show add task modal
function showAddTaskModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('addTaskModal')) {
        const modalHTML = `
            <div id="addTaskModal" class="task-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add New Task</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="addTaskForm">
                            <div class="form-group">
                                <label for="taskTitle">Task Title</label>
                                <input type="text" id="taskTitle" required>
                            </div>
                            <div class="form-group">
                                <label for="taskDescription">Description</label>
                                <textarea id="taskDescription"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="taskPriority">Priority</label>
                                <select id="taskPriority">
                                    <option value="Normal">Low</option>
                                    <option value="Important">Medium</option>
                                    <option value="Urgent">High</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="taskDueDate">Due Date</label>
                                <input type="datetime-local" id="taskDueDate">
                            </div>
                            <div class="form-actions">
                                <button type="button" id="cancelTaskBtn" class="btn-cancel">Cancel</button>
                                <button type="submit" class="btn-primary">Add Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Append modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Add event listeners for modal
        document.querySelector('.close-modal').addEventListener('click', closeTaskModal);
        document.getElementById('cancelTaskBtn').addEventListener('click', closeTaskModal);
        document.getElementById('addTaskForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const priority = document.getElementById('taskPriority').value;
            const dueDate = document.getElementById('taskDueDate').value;
            
            if (title.trim() !== '') {
                addNewTask(title.trim(), dueDate, priority, description);
                closeTaskModal();
            }
        });
    }
    
    // Display the modal
    document.getElementById('addTaskModal').style.display = 'block';
}

// Close task modal
function closeTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('addTaskForm').reset();
    }
}

// Add new task to the list and storage
function addNewTask(title, dueDate, priority, description) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Create new task object
    const newTask = {
        id: Date.now().toString(), // Simple unique ID
        title: title,
        description: description || '',
        dueDate: dueDate || new Date().toISOString(),
        priority: priority || 'Normal',
        completed: false,
        tags: ['New']
    };
    
    // Add to array
    tasks.push(newTask);
    
    // Save to storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Re-render tasks
    renderTasks(tasks);
    
    // Update task count stats
    updateTaskStats();
}

// Update task statistics
function updateTaskStats() {
    // Count from DOM
    const totalTasks = document.querySelectorAll('.task-item').length;
    const completedTasks = document.querySelectorAll('.task-checkbox.checked').length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Get tasks from storage for more detailed stats
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Count in-progress tasks (tasks with a specific tag or status)
    const inProgressTasks = tasks.filter(task => 
        !task.completed && task.tags && task.tags.includes('In Progress')).length;
    
    // Count overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
        !task.completed && new Date(task.dueDate) < now).length;
    
    // Update stats in cards
    const statCards = document.querySelectorAll('.stat-card .stat-data h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = pendingTasks; // Pending Tasks
        statCards[1].textContent = inProgressTasks; // In Progress
        statCards[2].textContent = completedTasks; // Completed Tasks
        statCards[3].textContent = overdueTasks; // Overdue
    }
}

// Filter tasks based on search input
function filterTasks(searchValue) {
    // If no search value, show all tasks
    if (!searchValue) {
        const savedTasks = localStorage.getItem('tasks');
        const tasks = savedTasks ? JSON.parse(savedTasks) : [];
        renderTasks(tasks);
        return;
    }
    
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Filter tasks based on search value
    const filteredTasks = tasks.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(searchValue);
        const priorityMatch = task.priority && task.priority.toLowerCase().includes(searchValue);
        const tagMatch = task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchValue));
        
        return titleMatch || priorityMatch || tagMatch;
    });
    
    // Render filtered tasks
    renderTasks(filteredTasks);
}

// Delete tasks by title
function deleteTasksByTitle(titlesToDelete) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Filter out tasks with matching titles
    const updatedTasks = tasks.filter(task => !titlesToDelete.includes(task.title));
    
    // Save back to storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Re-render tasks
    renderTasks(updatedTasks);
    
    // Update task count stats
    updateTaskStats();
} 
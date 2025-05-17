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

    // Add Task Button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
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
        // In a real app, you would show a modal with form fields
        // This is simplified for demo purposes
        const newTitle = prompt('Edit task title:', taskToEdit.title);
        if (newTitle && newTitle.trim() !== '') {
            const newDueDate = prompt('Edit due date (YYYY-MM-DD HH:MM):', taskToEdit.dueDate);
            const newPriority = prompt('Edit priority:', taskToEdit.priority);
            
            // Update the task
            const updatedTasks = tasks.map(task => {
                if (task.id === taskId) {
                    return { 
                        ...task, 
                        title: newTitle.trim(),
                        dueDate: newDueDate || task.dueDate,
                        priority: newPriority || task.priority
                    };
                }
                return task;
            });
            
            // Save back to storage
            localStorage.setItem('tasks', JSON.stringify(updatedTasks));
            
            // Re-render tasks
            renderTasks(updatedTasks);
        }
    }
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

// Show add task modal (simplified for demo)
function showAddTaskModal() {
    const taskTitle = prompt('Enter task title:');
    if (taskTitle && taskTitle.trim() !== '') {
        // Simplified date input (in real app would use a date picker)
        const dueDate = prompt('Enter due date (YYYY-MM-DD HH:MM):');
        const taskPriority = prompt('Enter priority (e.g., Urgent, Important, Normal):');
        
        addNewTask(taskTitle.trim(), dueDate, taskPriority);
    }
}

// Add new task to the list and storage
function addNewTask(title, dueDate, priority) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Create new task object
    const newTask = {
        id: Date.now().toString(), // Simple unique ID
        title: title,
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
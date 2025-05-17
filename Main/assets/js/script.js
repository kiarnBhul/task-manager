// Theme Switcher and UI Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set up animations for modals
    setupModalAnimations();
    
    // Delete specific tasks (temporary code)
    deleteTasksByTitle(["Excel sheet", "Presentation on AI"]);
    
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
            filterTasks(searchValue, getCurrentPriorityFilter());
        });
    }
    
    // Priority filter removed as requested
    
    // Setup advanced filters
    setupAdvancedFilters();

    // Create task summary after initialization
    setTimeout(createTaskSummary, 500);
});

// Setup animations for modals
function setupModalAnimations() {
    // Prepare all modals for animations
    const modals = document.querySelectorAll('.task-modal');
    modals.forEach(modal => {
        // Ensure transitions work properly when modal is shown
        modal.addEventListener('transitionend', function(e) {
            // When modal finishes fading out, hide it completely
            if (e.propertyName === 'opacity' && !modal.classList.contains('show')) {
                modal.style.display = 'none';
            }
        });
    });
}

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
    
    // Remove task summary section if it exists
    removeSummarySection();
    
    // Update task stats even if empty
    updateTaskStats();
    
    // Initialize task category navigation
    initTaskCategoryNavigation();
    
    // Add category heading if not exists
    if (!document.getElementById('taskCategoryHeading')) {
        const todayTasksHeading = document.querySelector('h2');
        if (todayTasksHeading && todayTasksHeading.textContent.includes('Tasks')) {
            todayTasksHeading.id = 'taskCategoryHeading';
        } else {
            // Create category heading if it doesn't exist
            const tasksContainer = document.querySelector('.activity-card');
            if (tasksContainer && !document.getElementById('taskCategoryHeading')) {
                const headingElement = document.createElement('h2');
                headingElement.id = 'taskCategoryHeading';
                headingElement.className = 'section-heading';
                headingElement.textContent = 'All Tasks';
                
                // Insert at the beginning of the container
                if (tasksContainer.firstChild) {
                    tasksContainer.insertBefore(headingElement, tasksContainer.firstChild);
                } else {
                    tasksContainer.appendChild(headingElement);
                }
            }
        }
    }
}

// Remove task summary section if it exists
function removeSummarySection() {
    const summarySection = document.getElementById('taskSummarySection');
    if (summarySection) {
        summarySection.remove();
    }
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

    // Update task summary
    updateTaskSummary();
}

// Create task element
function createTaskElement(task) {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.dataset.id = task.id;
    
    // Define priority class based on value
    let priorityClass = '';
    let priorityLabel = '';
    
    if (task.priority === 'Normal') {
        priorityClass = 'priority-low';
        priorityLabel = 'Low';
    } else if (task.priority === 'Important') {
        priorityClass = 'priority-medium';
        priorityLabel = 'Medium';
    } else if (task.priority === 'Urgent') {
        priorityClass = 'priority-high';
        priorityLabel = 'High';
    }
    
    // Define progress bar class based on completion
    let progressClass = 'progress-low';
    if (task.progress >= 70) {
        progressClass = 'progress-high';
    } else if (task.progress >= 30) {
        progressClass = 'progress-medium';
    }
    
    taskItem.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}">
            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
        </div>
        <div class="task-content">
            <h3 class="task-title">${task.title}</h3>
            ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
            <div class="task-progress">
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${task.progress}%"></div>
                </div>
                <span class="progress-text">${task.progress}%</span>
            </div>
            <div class="task-meta">
                <span>Due: ${formatDate(task.dueDate)}</span>
                <span class="priority-badge ${priorityClass}">${priorityLabel}</span>
                <div class="task-tags">
                    ${task.tags ? task.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        </div>
        <div class="task-actions">
            <button class="task-action-btn edit-task-btn"><i class="fas fa-edit"></i></button>
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
            const isChecked = this.classList.contains('checked');
            
            if(isChecked) {
                this.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                this.innerHTML = '';
            }
            
            // Update task in storage
            const taskItem = this.closest('.task-item');
            const taskId = taskItem.dataset.id;
            
            // When checking the box, set progress to 100%
            // When unchecking, set progress back to the previous value or 0
            updateTaskCompletionStatus(taskId, isChecked);
            
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
            // If marking as completed, set progress to 100%
            // If unchecking, reset progress to 0
            return { 
                ...task, 
                completed: isCompleted,
                progress: isCompleted ? 100 : 0
            };
        }
        return task;
    });
    
    // Save back to storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Re-render tasks to show updated progress bars
    renderTasks(updatedTasks);
}

// Initialize task action buttons
function initTaskActionButtons() {
    // Edit task buttons
    const editButtons = document.querySelectorAll('.edit-task-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const taskItem = this.closest('.task-item');
            const taskId = taskItem.dataset.id;
            editTask(taskId);
        });
        
        // Add tooltip to edit button
        button.setAttribute('title', 'Edit task & update progress');
    });
    
    // Delete task buttons
    const deleteButtons = document.querySelectorAll('.task-action-btn:last-child');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const taskItem = this.closest('.task-item');
            const taskId = taskItem.dataset.id;
            const taskTitle = taskItem.querySelector('.task-title').textContent;
            
            // Show delete confirmation modal instead of browser confirm
            showDeleteConfirmationModal(taskId, taskTitle);
        });
    });
}

// Show delete confirmation modal
function showDeleteConfirmationModal(taskId, taskTitle) {
    const modal = document.getElementById('deleteTaskModal');
    const taskNameSpan = document.getElementById('deleteTaskName');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const closeModalBtn = modal.querySelector('.close-modal');
    
    // Set the task name in the modal
    taskNameSpan.textContent = taskTitle;
    
    // Show the modal with animation
    modal.style.display = 'block';
    
    // Trigger reflow to enable smooth animation
    void modal.offsetWidth;
    
    // Add show class for animation
    modal.classList.add('show');
    
    // Set up the confirm button action
    confirmBtn.onclick = function() {
        deleteTask(taskId);
        
        // Remove the task element from DOM
        const taskElement = document.querySelector(`.task-item[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.remove();
        }
        
        // Update task count stats
        updateTaskStats();
        
        // Close the modal with animation
        closeModalWithAnimation(modal);
        
        // Show success toast
        showToast('success', `Task "${taskTitle}" deleted successfully`);
    };
    
    // Close modal on cancel button click
    cancelBtn.onclick = function() {
        closeModalWithAnimation(modal);
    };
    
    // Close modal on X button click
    closeModalBtn.onclick = function() {
        closeModalWithAnimation(modal);
    };
    
    // Close modal when clicking outside the modal content
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModalWithAnimation(modal);
        }
    };
}

// Helper function to close modal with animation
function closeModalWithAnimation(modal) {
    // Remove show class to trigger animation
    modal.classList.remove('show');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Show toast notification
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let icon = '';
    switch(type) {
        case 'success':
            icon = 'fa-check';
            break;
        case 'error':
            icon = 'fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'info':
            icon = 'fa-info-circle';
            break;
        default:
            icon = 'fa-bell';
    }
    
    // Set toast content
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    // Add to container
    container.appendChild(toast);
    
    // Add click event to close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', function() {
        toast.remove();
    });
    
    // Auto remove after animation completes (4 seconds)
    setTimeout(() => {
        if (toast.parentNode === container) {
            container.removeChild(toast);
        }
    }, 4000);
}

// Edit a task with enhanced animation
function editTask(taskId) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Find the task to edit
    const taskToEdit = tasks.find(task => task.id === taskId);
    
    if (taskToEdit) {
        // Create a progress-only modal
        if (!document.getElementById('progressModal')) {
            const modalHTML = `
                <div id="progressModal" class="task-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Update Task Progress</h2>
                            <span class="close-modal">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="progressForm">
                                <input type="hidden" id="taskIdForProgress">
                                <div class="task-title-display"></div>
                                <div class="progress-section">
                                    <label for="taskProgressOnly">
                                        <span class="progress-label">Task Progress</span>
                                        <span id="progressOnlyValue" class="progress-value">0</span>
                                    </label>
                                    <div class="progress-control">
                                        <input type="range" id="taskProgressOnly" min="0" max="100" value="0" class="progress-slider">
                                        <div class="progress-preview">
                                            <div class="progress-bar">
                                                <div id="progressOnlyPreview" class="progress-fill" style="width: 0%"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-actions">
                                    <button type="button" id="cancelProgressBtn" class="btn-cancel">Cancel</button>
                                    <button type="submit" class="btn-primary">Update Progress</button>
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
            document.querySelector('#progressModal .close-modal').addEventListener('click', closeProgressModal);
            document.getElementById('cancelProgressBtn').addEventListener('click', closeProgressModal);
            
            // Add event listener for progress slider
            document.getElementById('taskProgressOnly').addEventListener('input', function() {
                const progressValue = this.value;
                document.getElementById('progressOnlyValue').textContent = progressValue;
                
                // Update preview
                const preview = document.getElementById('progressOnlyPreview');
                preview.style.width = progressValue + '%';
                
                // Update preview class based on value
                preview.className = 'progress-fill';
                if (progressValue >= 70) {
                    preview.classList.add('progress-high');
                } else if (progressValue >= 30) {
                    preview.classList.add('progress-medium');
                } else {
                    preview.classList.add('progress-low');
                }
            });
            
            document.getElementById('progressForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const taskId = document.getElementById('taskIdForProgress').value;
                const progress = document.getElementById('taskProgressOnly').value;
                
                updateTaskProgress(taskId, progress);
                closeProgressModal();
                
                // Show success notification
                showToast('success', `Task progress updated to ${progress}%`);
            });
        }
        
        // Set task title display
        document.querySelector('#progressModal .task-title-display').textContent = taskToEdit.title;
        
        // Fill form with task data
        document.getElementById('taskIdForProgress').value = taskToEdit.id;
        
        // Set progress slider value and display
        const progressValue = taskToEdit.progress || 0;
        const progressSlider = document.getElementById('taskProgressOnly');
        progressSlider.value = progressValue;
        document.getElementById('progressOnlyValue').textContent = progressValue;
        
        // Update progress preview
        const preview = document.getElementById('progressOnlyPreview');
        preview.style.width = progressValue + '%';
        
        // Update preview class based on value
        preview.className = 'progress-fill';
        if (progressValue >= 70) {
            preview.classList.add('progress-high');
        } else if (progressValue >= 30) {
            preview.classList.add('progress-medium');
        } else {
            preview.classList.add('progress-low');
        }
        
        // Show modal with enhanced animation
        const modal = document.getElementById('progressModal');
        modal.style.display = 'block';
        
        // Force reflow to enable smooth animation
        void modal.offsetWidth;
        
        // Add show class for animation
        modal.classList.add('show');
        
        // Focus on the slider after modal appears
        setTimeout(() => {
            progressSlider.focus();
        }, 300);
    }
}

// Close progress modal
function closeProgressModal() {
    const modal = document.getElementById('progressModal');
    if (modal) {
        closeModalWithAnimation(modal);
    }
}

// Update task progress only
function updateTaskProgress(taskId, progress) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Convert progress to number to ensure proper comparison
    const progressValue = parseInt(progress, 10);
    
    // Find task to get its title for the notification
    const task = tasks.find(t => t.id === taskId);
    const taskTitle = task ? task.title : '';
    
    // Update the task progress and check if it should be marked as completed
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            // If progress is 100%, mark the task as completed
            const isCompleted = progressValue >= 100 ? true : task.completed;
            
            return { 
                ...task, 
                progress: progressValue,
                completed: isCompleted
            };
        }
        return task;
    });
    
    // Save back to storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Re-render tasks
    renderTasks(updatedTasks);
    
    // Update task stats
    updateTaskStats();
    
    // Show appropriate toast notification based on progress
    if (progressValue === 100) {
        showToast('success', `"${taskTitle}" completed! (100%)`);
    } else {
        showToast('info', `"${taskTitle}" progress updated to ${progressValue}%`);
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
                            <div class="form-group progress-section">
                                <label for="taskProgress">
                                    <span class="progress-label">Task Progress:</span>
                                    <span id="addProgressValue" class="progress-value">0</span>%
                                </label>
                                <div class="progress-control">
                                    <input type="range" id="taskProgress" min="0" max="100" value="0" class="progress-slider">
                                    <div class="progress-preview">
                                        <div class="progress-bar">
                                            <div id="addProgressPreview" class="progress-fill progress-low" style="width: 0%"></div>
                                        </div>
                                    </div>
                                </div>
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
        document.querySelector('#addTaskModal .close-modal').addEventListener('click', function() {
            closeModalWithAnimation(document.getElementById('addTaskModal'));
        });
        
        document.getElementById('cancelTaskBtn').addEventListener('click', function() {
            closeModalWithAnimation(document.getElementById('addTaskModal'));
        });
        
        // Add event listener for progress slider
        document.getElementById('taskProgress').addEventListener('input', function() {
            const progressValue = this.value;
            document.getElementById('addProgressValue').textContent = progressValue;
            
            // Update preview
            const preview = document.getElementById('addProgressPreview');
            preview.style.width = progressValue + '%';
            
            // Update preview class based on value
            preview.className = 'progress-fill';
            if (progressValue >= 70) {
                preview.classList.add('progress-high');
            } else if (progressValue >= 30) {
                preview.classList.add('progress-medium');
            } else {
                preview.classList.add('progress-low');
            }
        });
        
        document.getElementById('addTaskForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const priority = document.getElementById('taskPriority').value;
            const progress = document.getElementById('taskProgress').value;
            const dueDate = document.getElementById('taskDueDate').value;
            
            if (title.trim() !== '') {
                addNewTask(title.trim(), dueDate, priority, description, progress);
                closeTaskModal();
            }
        });
    }
    
    const modal = document.getElementById('addTaskModal');
    
    // Display the modal
    modal.style.display = 'block';
    
    // Trigger reflow to enable smooth animation
    void modal.offsetWidth;
    
    // Add show class for animation
    modal.classList.add('show');
    
    // Reset preview
    const preview = document.getElementById('addProgressPreview');
    if (preview) {
        preview.style.width = '0%';
        preview.className = 'progress-fill progress-low';
    }
}

// Close task modal
function closeTaskModal() {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        closeModalWithAnimation(modal);
        
        // Reset form after animation completes
        setTimeout(() => {
            document.getElementById('addTaskForm').reset();
        }, 300);
    }
}

// Add new task to the list and storage
function addNewTask(title, dueDate, priority, description, progress) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Convert progress to number to ensure proper comparison
    const progressValue = parseInt(progress, 10) || 0;
    
    // Check if task should be marked as completed based on progress
    const isCompleted = progressValue >= 100 ? true : false;
    
    // Create new task object
    const newTask = {
        id: Date.now().toString(), // Simple unique ID
        title: title,
        description: description || '',
        dueDate: dueDate || new Date().toISOString(),
        priority: priority || 'Normal',
        completed: isCompleted,
        progress: progressValue,
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
    
    // Show success toast notification
    showToast('success', `Task "${title}" added successfully`);
}

// Update task statistics
function updateTaskStats() {
    // Get tasks from storage for detailed stats
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Count tasks by status
    const now = new Date();
    const allTasks = tasks.length;
    const pendingTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const overdueTasks = tasks.filter(task => 
        !task.completed && new Date(task.dueDate) < now).length;
    
    // Update stats in cards
    const statCards = document.querySelectorAll('.stat-card .stat-data h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = allTasks; // All Tasks
        statCards[1].textContent = pendingTasks; // Pending Tasks
        statCards[2].textContent = completedTasks; // Complete Tasks
        statCards[3].textContent = overdueTasks; // Overdue Tasks
    }
    
    // Update stat card labels if needed
    const statLabels = document.querySelectorAll('.stat-card .stat-data p');
    if (statLabels.length >= 4) {
        statLabels[0].textContent = 'All Tasks';
        statLabels[1].textContent = 'Pending Tasks';
        statLabels[2].textContent = 'Complete Tasks';
        statLabels[3].textContent = 'Overdue Tasks';
    }
}

// Get current priority filter
function getCurrentPriorityFilter() {
    // Always return 'all' since we removed the priority filter UI
    return 'all';
}

// Filter tasks based on search input and priority
function filterTasks(searchValue, priorityFilter) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Filter tasks based on search value and priority
    const filteredTasks = tasks.filter(task => {
        // Priority filter
        const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
        
        // If no search value but priority filter doesn't match, exclude
        if (!searchValue && !priorityMatch) {
            return false;
        }
        
        // If no search value but priority matches, include
        if (!searchValue && priorityMatch) {
            return true;
        }
        
        // Search filter combined with priority filter
        const titleMatch = task.title.toLowerCase().includes(searchValue);
        const descriptionMatch = task.description && task.description.toLowerCase().includes(searchValue);
        const tagMatch = task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchValue));
        
        return (titleMatch || descriptionMatch || tagMatch) && priorityMatch;
    });
    
    // Render filtered tasks
    renderTasks(filteredTasks);
    
    // Update UI to show filter results count
    updateFilterResultsCount(filteredTasks.length, tasks.length);
}

// Update filter results count
function updateFilterResultsCount(filteredCount, totalCount) {
    // Create or update filter results count element
    let resultsCount = document.querySelector('.filter-results-count');
    
    if (!resultsCount) {
        resultsCount = document.createElement('div');
        resultsCount.className = 'filter-results-count';
        
        // Insert after filter options
        const filterOptions = document.querySelector('.filter-options');
        if (filterOptions) {
            filterOptions.parentNode.insertBefore(resultsCount, filterOptions.nextSibling);
        }
    }
    
    // Update text
    if (filteredCount === totalCount) {
        resultsCount.textContent = `Showing all ${totalCount} tasks`;
    } else {
        resultsCount.textContent = `Showing ${filteredCount} of ${totalCount} tasks`;
    }
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

// Make dashboard cards clickable to filter tasks
function initTaskCategoryNavigation() {
    // Add click event to All Tasks sidebar item
    const allTasksLink = document.querySelector('.menu-item a[href="#all-tasks"]');
    if (allTasksLink) {
        allTasksLink.addEventListener('click', function(e) {
            e.preventDefault();
            filterTasksByStatus('all');
            updateActiveCategoryLink(this);
        });
    }

    // Add click events and enhanced hover effects to stats cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.cursor = 'pointer';
        
        // Add pulse effect on hover
        card.addEventListener('mouseenter', function() {
            this.querySelector('.icon').style.transform = 'scale(1.2) rotate(5deg)';
            this.querySelector('.stat-data h3').style.transform = 'scale(1.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('.icon').style.transform = '';
            this.querySelector('.stat-data h3').style.transform = '';
        });
        
        card.addEventListener('click', function() {
            // Add click effect
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            let status;
            
            // Map index to status
            switch(index) {
                case 0: // First card - All Tasks
                    status = 'all';
                    break;
                case 1: // Second card - Pending Tasks
                    status = 'pending';
                    break;
                case 2: // Third card - Complete Tasks
                    status = 'completed';
                    break;
                case 3: // Fourth card - Overdue Tasks
                    status = 'overdue';
                    break;
            }
            
            if (status) {
                filterTasksByStatus(status);
                
                // Update active link in sidebar if exists
                const sidebarLink = document.querySelector(`.menu-item a[href="#${status}-tasks"]`);
                if (sidebarLink) {
                    updateActiveCategoryLink(sidebarLink);
                }
            }
        });
    });
}

// Update active category link in sidebar
function updateActiveCategoryLink(activeLink) {
    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to the parent menu item
    if (activeLink) {
        const menuItem = activeLink.closest('.menu-item');
        if (menuItem) {
            menuItem.classList.add('active');
        }
    }
}

// Filter tasks by status
function filterTasksByStatus(status) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    const now = new Date();
    
    let filteredTasks;
    let statusLabel;
    
    switch (status) {
        case 'pending':
            filteredTasks = tasks.filter(task => !task.completed);
            statusLabel = 'Pending Tasks';
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);
            statusLabel = 'Complete Tasks';
            break;
        case 'overdue':
            filteredTasks = tasks.filter(task => !task.completed && new Date(task.dueDate) < now);
            statusLabel = 'Overdue Tasks';
            break;
        default:
            filteredTasks = tasks;
            statusLabel = 'All Tasks';
    }
    
    // Update category heading
    const categoryHeading = document.getElementById('taskCategoryHeading');
    if (categoryHeading) {
        categoryHeading.textContent = statusLabel;
    }
    
    // Render filtered tasks
    renderTasks(filteredTasks);
    
    // Update filter results count
    updateFilterResultsCount(filteredTasks.length, tasks.length);
}

// Update task in storage
function updateTask(taskId, title, dueDate, priority, description, progress) {
    // Get tasks from storage
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Convert progress to number to ensure proper comparison
    const progressValue = parseInt(progress, 10);
    
    // Update the task
    const updatedTasks = tasks.map(task => {
        if (task.id === taskId) {
            // If progress is 100%, mark the task as completed
            const isCompleted = progressValue >= 100 ? true : task.completed;
            
            return { 
                ...task, 
                title: title,
                description: description || '',
                dueDate: dueDate || task.dueDate,
                priority: priority || task.priority,
                progress: progressValue,
                completed: isCompleted
            };
        }
        return task;
    });
    
    // Save back to storage
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    
    // Re-render tasks
    renderTasks(updatedTasks);
    
    // Update task stats
    updateTaskStats();
}

// Add advanced filtering system
function setupAdvancedFilters() {
    // Create the advanced filter UI if it doesn't exist
    if (!document.querySelector('.advanced-filters')) {
        const filterContainer = document.querySelector('.search-container');
        if (filterContainer) {
            const filtersHTML = `
                <div class="advanced-filters">
                    <div class="filter-toggle">
                        <button class="filter-toggle-btn">
                            <i class="fas fa-filter"></i> Filters <span class="active-filters-badge">0</span>
                        </button>
                    </div>
                    <div class="filters-panel">
                        <div class="filter-group">
                            <h3>Priority</h3>
                            <div class="filter-options">
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="priority" value="Normal">
                                    <span class="checkbox-label">Low</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="priority" value="Important">
                                    <span class="checkbox-label">Medium</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="priority" value="Urgent">
                                    <span class="checkbox-label">High</span>
                                </label>
                            </div>
                        </div>
                        <div class="filter-group">
                            <h3>Progress</h3>
                            <div class="filter-options">
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="progress" value="0-30">
                                    <span class="checkbox-label">Just Started (0-30%)</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="progress" value="31-70">
                                    <span class="checkbox-label">In Progress (31-70%)</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="progress" value="71-99">
                                    <span class="checkbox-label">Almost Done (71-99%)</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="progress" value="100">
                                    <span class="checkbox-label">Completed (100%)</span>
                                </label>
                            </div>
                        </div>
                        <div class="filter-group">
                            <h3>Due Date</h3>
                            <div class="filter-options">
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="dueDate" value="today">
                                    <span class="checkbox-label">Due Today</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="dueDate" value="tomorrow">
                                    <span class="checkbox-label">Due Tomorrow</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="dueDate" value="week">
                                    <span class="checkbox-label">Due This Week</span>
                                </label>
                                <label class="filter-checkbox">
                                    <input type="checkbox" data-filter="dueDate" value="overdue">
                                    <span class="checkbox-label">Overdue</span>
                                </label>
                            </div>
                        </div>
                        <div class="filter-actions">
                            <button id="clearFilters" class="btn-clear-filters">Clear All Filters</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert after the search bar
            const searchBar = filterContainer.querySelector('.search-bar');
            if (searchBar) {
                const filtersElement = document.createElement('div');
                filtersElement.innerHTML = filtersHTML;
                searchBar.after(filtersElement.firstElementChild);
                
                // Add event listeners
                initAdvancedFilterEvents();
            }
        }
    }
}

// Initialize events for the advanced filters
function initAdvancedFilterEvents() {
    // Toggle filters panel visibility
    const filterToggle = document.querySelector('.filter-toggle-btn');
    const filtersPanel = document.querySelector('.filters-panel');
    
    if (filterToggle && filtersPanel) {
        filterToggle.addEventListener('click', function() {
            filtersPanel.classList.toggle('active');
            filterToggle.classList.toggle('active');
        });
    }
    
    // Handle filter changes
    const filterCheckboxes = document.querySelectorAll('.filter-checkbox input');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            applyAdvancedFilters();
        });
    });
    
    // Clear all filters
    const clearFilterBtn = document.getElementById('clearFilters');
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', function() {
            // Uncheck all checkboxes
            filterCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Apply filters (which will show all tasks since no filters are active)
            applyAdvancedFilters();
            
            // Hide the filters panel
            filtersPanel.classList.remove('active');
            filterToggle.classList.remove('active');
        });
    }
}

// Apply all selected filters
function applyAdvancedFilters() {
    // Get all tasks
    const savedTasks = localStorage.getItem('tasks');
    const allTasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Get current search input value
    const searchValue = document.querySelector('.search-container input')?.value.toLowerCase().trim() || '';
    
    // Get selected filters
    const selectedPriorities = Array.from(document.querySelectorAll('input[data-filter="priority"]:checked')).map(el => el.value);
    const selectedProgress = Array.from(document.querySelectorAll('input[data-filter="progress"]:checked')).map(el => el.value);
    const selectedDueDates = Array.from(document.querySelectorAll('input[data-filter="dueDate"]:checked')).map(el => el.value);
    
    // Count active filters and update badge
    const activeFiltersCount = selectedPriorities.length + selectedProgress.length + selectedDueDates.length;
    document.querySelector('.active-filters-badge').textContent = activeFiltersCount;
    
    if (activeFiltersCount > 0) {
        document.querySelector('.filter-toggle-btn').classList.add('has-active-filters');
    } else {
        document.querySelector('.filter-toggle-btn').classList.remove('has-active-filters');
    }
    
    // Filter tasks based on selected criteria
    const filteredTasks = allTasks.filter(task => {
        // Apply search filter
        if (searchValue && !(
            task.title.toLowerCase().includes(searchValue) || 
            (task.description && task.description.toLowerCase().includes(searchValue))
        )) {
            return false;
        }
        
        // Apply priority filter
        if (selectedPriorities.length > 0 && !selectedPriorities.includes(task.priority)) {
            return false;
        }
        
        // Apply progress filter
        if (selectedProgress.length > 0) {
            const progress = task.progress || 0;
            const progressMatch = selectedProgress.some(range => {
                if (range === '100' && progress === 100) return true;
                if (range === '0-30' && progress >= 0 && progress <= 30) return true;
                if (range === '31-70' && progress >= 31 && progress <= 70) return true;
                if (range === '71-99' && progress >= 71 && progress <= 99) return true;
                return false;
            });
            
            if (!progressMatch) return false;
        }
        
        // Apply due date filter
        if (selectedDueDates.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            
            const dueDate = new Date(task.dueDate);
            
            const dueDateMatch = selectedDueDates.some(option => {
                if (option === 'today' && dueDate.toDateString() === today.toDateString()) return true;
                if (option === 'tomorrow' && dueDate.toDateString() === tomorrow.toDateString()) return true;
                if (option === 'week' && dueDate >= today && dueDate <= weekEnd) return true;
                if (option === 'overdue' && dueDate < today) return true;
                return false;
            });
            
            if (!dueDateMatch) return false;
        }
        
        // If passed all filters
        return true;
    });
    
    // Display filtered tasks
    renderTasks(filteredTasks);
    
    // Update filter results count
    updateFilterResultsCount(filteredTasks.length, allTasks.length);
}

// Create visual task summary section
function createTaskSummary() {
    // Get the task data
    const savedTasks = localStorage.getItem('tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    // Don't create summary if no tasks
    if (tasks.length === 0) return;
    
    // Check if summary already exists
    if (document.getElementById('taskSummarySection')) return;
    
    // Calculate task statistics
    const tasksByPriority = {
        'Normal': tasks.filter(t => t.priority === 'Normal').length,
        'Important': tasks.filter(t => t.priority === 'Important').length,
        'Urgent': tasks.filter(t => t.priority === 'Urgent').length
    };
    
    // Calculate progress distribution
    const progressDistribution = {
        'Not Started (0%)': tasks.filter(t => t.progress === 0).length,
        'Just Started (1-30%)': tasks.filter(t => t.progress > 0 && t.progress <= 30).length,
        'In Progress (31-70%)': tasks.filter(t => t.progress > 30 && t.progress <= 70).length,
        'Almost Done (71-99%)': tasks.filter(t => t.progress > 70 && t.progress < 100).length,
        'Completed (100%)': tasks.filter(t => t.progress === 100).length
    };
    
    // Calculate due date distribution
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const dueDatesDistribution = {
        'Overdue': tasks.filter(t => !t.completed && new Date(t.dueDate) < today).length,
        'Due Today': tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === today.toDateString()).length,
        'Due Tomorrow': tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === tomorrow.toDateString()).length,
        'This Week': tasks.filter(t => !t.completed && new Date(t.dueDate) > tomorrow && new Date(t.dueDate) <= nextWeek).length,
        'Later': tasks.filter(t => !t.completed && new Date(t.dueDate) > nextWeek).length
    };
    
    // Create the summary section HTML
    const summaryHTML = `
        <div id="taskSummarySection" class="task-summary-section">
            <div class="summary-header">
                <h2>Task Analytics</h2>
                <button class="toggle-summary-btn">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="summary-content">
                <div class="summary-card">
                    <div class="summary-chart">
                        <div class="chart-title">Tasks by Priority</div>
                        <div class="donut-chart priority-chart">
                            <div class="donut-segment" style="--percentage: ${calculatePercentage(tasksByPriority.Normal, tasks.length)}; --color: var(--info);">
                                <span class="donut-label">Low</span>
                            </div>
                            <div class="donut-segment" style="--percentage: ${calculatePercentage(tasksByPriority.Important, tasks.length)}; --color: var(--warning);">
                                <span class="donut-label">Medium</span>
                            </div>
                            <div class="donut-segment" style="--percentage: ${calculatePercentage(tasksByPriority.Urgent, tasks.length)}; --color: var(--danger);">
                                <span class="donut-label">High</span>
                            </div>
                            <div class="donut-hole">
                                <div class="donut-hole-text">${tasks.length}</div>
                                <div class="donut-hole-subtext">Tasks</div>
                            </div>
                        </div>
                        <div class="chart-legend">
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: var(--info);"></span>
                                <span class="legend-label">Low (${tasksByPriority.Normal})</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: var(--warning);"></span>
                                <span class="legend-label">Medium (${tasksByPriority.Important})</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color" style="background-color: var(--danger);"></span>
                                <span class="legend-label">High (${tasksByPriority.Urgent})</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-chart">
                        <div class="chart-title">Tasks by Progress</div>
                        <div class="bar-chart progress-chart">
                            ${Object.entries(progressDistribution).map(([label, count]) => `
                                <div class="bar-group">
                                    <div class="bar-label">${label}</div>
                                    <div class="bar-container">
                                        <div class="bar-fill" style="width: ${calculatePercentage(count, tasks.length)}%;">
                                            <span class="bar-value">${count}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="summary-card">
                    <div class="summary-chart">
                        <div class="chart-title">Tasks by Due Date</div>
                        <div class="timeline-chart">
                            ${Object.entries(dueDatesDistribution).map(([label, count], index) => `
                                <div class="timeline-item ${label.toLowerCase().replace(/\s+/g, '-')}">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <span class="timeline-label">${label}</span>
                                        <span class="timeline-count">${count} task${count !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert the summary section before the activity container
    const activityContainer = document.querySelector('.activity-container');
    if (activityContainer) {
        const summaryElement = document.createElement('div');
        summaryElement.innerHTML = summaryHTML;
        activityContainer.before(summaryElement.firstElementChild);
        
        // Add event listener for toggle button
        document.querySelector('.toggle-summary-btn').addEventListener('click', function() {
            const summarySection = document.getElementById('taskSummarySection');
            const icon = this.querySelector('i');
            
            if (summarySection.classList.contains('collapsed')) {
                summarySection.classList.remove('collapsed');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                summarySection.classList.add('collapsed');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    }
}

// Helper function to calculate percentage
function calculatePercentage(value, total) {
    return total > 0 ? Math.round((value / total) * 100) : 0;
}

// Update summary when tasks change
function updateTaskSummary() {
    // Remove existing summary
    const existingSummary = document.getElementById('taskSummarySection');
    if (existingSummary) {
        existingSummary.remove();
    }
    
    // Create fresh summary
    createTaskSummary();
}

// Add summary update to relevant functions
const originalRenderTasks = renderTasks;
renderTasks = function(tasks) {
    originalRenderTasks(tasks);
    updateTaskSummary();
}; 
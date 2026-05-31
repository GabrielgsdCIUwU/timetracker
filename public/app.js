const API_URL = '/api/tasks';
let tasksData = [];
let intervals = []; // Keep track of intervals to update UI

// Utility functions
const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const calculateTimeFromEntries = (entries) => {
    const now = Date.now();
    return entries.reduce((total, entry) => {
        const start = new Date(entry.start).getTime();
        const end = entry.end ? new Date(entry.end).getTime() : now;
        return total + (end - start);
    }, 0);
};

// Clear intervals
const clearAllIntervals = () => {
    intervals.forEach(clearInterval);
    intervals = [];
};

// Fetch data
const fetchTasks = async () => {
    try {
        const response = await fetch(API_URL);
        tasksData = await response.json();
        tasksData.reverse(); // Mostrar primero las más recientes
        renderTasks();
    } catch (error) {
        console.error('Error fetching tasks', error);
    }
};

// Actions
const createTask = async (name) => {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    fetchTasks();
};

const createSubtask = async (taskId, name) => {
    await fetch(`${API_URL}/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    fetchTasks();
};

const toggleTaskStatus = async (taskId, action) => {
    await fetch(`${API_URL}/${taskId}/${action}`, { method: 'POST' });
    fetchTasks();
};

const deleteTask = async (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
        await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
        fetchTasks();
    }
};

const toggleSubtaskStatus = async (taskId, subtaskId, action) => {
    await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}/${action}`, { method: 'POST' });
    fetchTasks();
};

// Render logic
const renderTasks = () => {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';
    clearAllIntervals();

    tasksData.forEach((task, index) => {
        const template = document.getElementById('task-template').content.cloneNode(true);
        const card = template.querySelector('.task-card');
        card.style.animationDelay = `${index * 0.1}s`;
        
        template.querySelector('.task-title').textContent = task.name;
        
        const badge = template.querySelector('.task-status');
        badge.textContent = task.status;
        badge.classList.add(task.status);

        // Buttons
        const btnStart = template.querySelector('.btn-start');
        const btnPause = template.querySelector('.btn-pause');
        const btnStop = template.querySelector('.btn-stop');
        const btnDelete = template.querySelector('.btn-delete');
        
        if (task.status === 'active') {
            btnStart.classList.add('hidden');
            btnPause.classList.remove('hidden');
        } else if (task.status === 'completed') {
            btnStart.disabled = true;
            btnStart.style.opacity = '0.5';
            btnPause.classList.add('hidden');
            btnStop.disabled = true;
            btnStop.style.opacity = '0.5';
        } else {
            btnPause.classList.add('hidden');
            btnStart.classList.remove('hidden');
        }

        btnStart.onclick = () => toggleTaskStatus(task.id, 'start');
        btnPause.onclick = () => toggleTaskStatus(task.id, 'pause');
        btnStop.onclick = () => toggleTaskStatus(task.id, 'stop');
        btnDelete.onclick = () => deleteTask(task.id);

        // Render Subtasks
        const subtasksList = template.querySelector('.subtasks-list');
        task.subtasks.forEach(subtask => {
            const subTemplate = document.getElementById('subtask-template').content.cloneNode(true);
            subTemplate.querySelector('.subtask-title').textContent = subtask.name;
            
            const subBadge = subTemplate.querySelector('.subtask-status');
            subBadge.textContent = subtask.status;
            subBadge.classList.add(subtask.status);

            const sBtnStart = subTemplate.querySelector('.btn-start');
            const sBtnPause = subTemplate.querySelector('.btn-pause');
            const sBtnStop = subTemplate.querySelector('.btn-stop');

            if (subtask.status === 'active') {
                sBtnStart.classList.add('hidden');
                sBtnPause.classList.remove('hidden');
            } else if (subtask.status === 'completed') {
                sBtnStart.disabled = true;
                sBtnStart.style.opacity = '0.5';
                sBtnStop.disabled = true;
                sBtnStop.style.opacity = '0.5';
            }

            sBtnStart.onclick = () => toggleSubtaskStatus(task.id, subtask.id, 'start');
            sBtnPause.onclick = () => toggleSubtaskStatus(task.id, subtask.id, 'pause');
            sBtnStop.onclick = () => toggleSubtaskStatus(task.id, subtask.id, 'stop');

            subtasksList.appendChild(subTemplate);
        });

        // Add subtask form
        const addSubtaskForm = template.querySelector('.create-subtask-form');
        addSubtaskForm.onsubmit = (e) => {
            e.preventDefault();
            const input = addSubtaskForm.querySelector('.subtask-name');
            createSubtask(task.id, input.value);
            input.value = '';
        };

        // UI Time Updaters
        const timeDisplay = template.querySelector('.total-time');
        const subTimeDisplays = Array.from(subtasksList.querySelectorAll('.sub-time'));

        const updateTimes = () => {
            // Recalculate everything on the fly for UI
            let taskOwnTime = calculateTimeFromEntries(task.timeEntries);
            let totalSubTime = 0;

            task.subtasks.forEach((subtask, sIdx) => {
                const subTimeMs = calculateTimeFromEntries(subtask.timeEntries);
                totalSubTime += subTimeMs;
                if (subTimeDisplays[sIdx]) {
                    subTimeDisplays[sIdx].textContent = formatTime(subTimeMs);
                    if (subtask.status === 'active') subTimeDisplays[sIdx].classList.add('active');
                    else subTimeDisplays[sIdx].classList.remove('active');
                }
            });

            const grandTotal = taskOwnTime + totalSubTime;
            timeDisplay.textContent = formatTime(grandTotal);
            if (task.status === 'active') timeDisplay.classList.add('active');
            else timeDisplay.classList.remove('active');
        };

        // Initial render
        updateTimes();

        // If any task/subtask is active, start interval
        const hasActive = task.status === 'active' || task.subtasks.some(s => s.status === 'active');
        if (hasActive) {
            intervals.push(setInterval(updateTimes, 1000));
        }

        container.appendChild(template);
    });
};

// Event listeners
document.getElementById('create-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('task-name');
    if (input.value.trim()) {
        createTask(input.value.trim());
        input.value = '';
    }
});

// Init
fetchTasks();

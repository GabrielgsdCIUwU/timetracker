import * as api from './api.js';
import * as ui from './ui.js';
import { formatTime, calculateTimeFromEntries } from './utils.js';

let tasksData = [];

//region core orchestration
const loadTasks = async (showNotification = false) => {
    try {
        const data = await api.fetchTasks();
        tasksData = data.reverse();
        ui.renderTasks(tasksData, uiCallbacks);
        updateAllTimers();

        if (showNotification) ui.showToast('Data synced correctly', 'success');
    } catch (error) {
        ui.showToast('Error connection to server', 'error');
        console.error('Core Error:', error);
    }
};

const executeAction = async (apiPromise, successMsg) => {
    try {
        await apiPromise;
        await loadTasks();
        if (successMsg) ui.showToast(successMsg, 'success');
    } catch (error) {
        ui.showToast('Action failed', 'error');
        console.log('Action Error:', error);
    }
};

//region ui event callbacks
const uiCallbacks = {
    onCreateSubtask: (taskId, name) => executeAction(api.createSubtask(taskId, name), 'Subtask added'),
    
    onToggleTask: (taskId, action) => executeAction(api.toggleTaskStatus(taskId, action)),
    
    onToggleSubtask: (taskId, subtaskId, action) => executeAction(api.toggleSubtaskStatus(taskId, subtaskId, action)),

    onDeleteTask: (taskId) => {
        ui.showConfirmModal('Delete Task', 'Are you sure you want to permanently delete this task?', () => {
            executeAction(api.deleteTask(taskId), 'Task deleted');
        });
    }
}

//region update timers
const updateAllTimers = () => {
    let activeTaskInfo = null;

    tasksData.forEach(task => {
        let taskOwnTime = calculateTimeFromEntries(task.timeEntries);
        let totalSubTime = 0;

        task.subtasks.forEach(subtask => {
            const subTimeMs = calculateTimeFromEntries(subtask.timeEntries);
            totalSubTime += subTimeMs;

            const subTimeEl = document.getElementById(`time-sub-${subtask.id}`);
            if (subTimeEl) {
                subTimeEl.textContent = formatTime(subTimeMs);
                subTimeEl.classList.toggle('active', subtask.status === 'active');
            }

            if (subtask.status === 'active' && !activeTaskInfo) {
                activeTaskInfo = {name: subtask.name, time: subTimeMs};
            }
        });

        const grandTotal = taskOwnTime + totalSubTime;
        const timeDisplay = document.getElementById(`time-${task.id}`);

        if (timeDisplay) {
            timeDisplay.textContent = formatTime(grandTotal);
            timeDisplay.classList.toggle('active', task.status === 'active');
        }

        if (task.status === 'active' && !activeTaskInfo) {
            activeTaskInfo = { name: task.name, time: grandTotal };
        }
    });

    document.title = activeTaskInfo 
        ? `[${formatTime(activeTaskInfo.time)}] ${activeTaskInfo.name}` 
        : 'ChronoFlow - Advanced Time Tracker';
};

//region init
document.getElementById('create-task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('task-name');
    if (input.value.trim()) {
        executeAction(api.createTask(input.value.trim()), 'Task created successfully');
        input.value = '';
    }
});

setInterval(updateAllTimers, 1000);
loadTasks();
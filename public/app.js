import { ApiClient } from './api.js';
import * as ui from './ui.js';
import { TimeUtils } from './utils.js';

class AppController {
    #tasksData = [];
    #timerInterval = null;
    #currentTagFilter = null;

    init() {
        this.#setupEventListeners();
        this.#loadTasks();
        this.#timerInterval = setInterval(() => this.#updateAllTimers(), 1000);
    }

    destroy() {
        if (this.#timerInterval) {
            clearInterval(this.#timerInterval);
            this.#timerInterval = null;
        }
    }

    async #loadTasks(showNotification = false) {
        try {
            const data = await ApiClient.fetchTasks(this.#currentTagFilter);
            this.#tasksData = data.reverse();

            ui.renderTasks(this.#tasksData, this.#getUiCallbacks());

            ui.updateFilterUI(this.#currentTagFilter, () => {
                this.#currentTagFilter = null;
                this.#loadTasks();
            });

            this.#updateAllTimers();

            if (showNotification) ui.showToast('Data synced correctly', 'success');
        } catch (error) {
            ui.showToast('Error connection to server', 'error');
            console.error('Core Error:', error);
        }
    }

    async #executeAction(apiPromise, successMsg) {
        try {
            await apiPromise;
            await this.#loadTasks();
            if (successMsg) ui.showToast(successMsg, 'success');
        } catch (error) {
            ui.showToast('Action failed', 'error');
            console.log('Action Error:', error);
        }
    }

    #getUiCallbacks() {
        return {
            onCreateSubtask: (taskId, name) =>
                this.#executeAction(ApiClient.createSubtask(taskId, name), 'Subtask added'),

            onToggleTask: (taskId, action) =>
                this.#executeAction(ApiClient.toggleTaskStatus(taskId, action)),

            onToggleSubtask: (taskId, subtaskId, action) =>
                this.#executeAction(ApiClient.toggleSubtaskStatus(taskId, subtaskId, action)),

            onDeleteTask: (taskId) => {
                ui.showConfirmModal('Delete Task', 'Are you sure you want to permanently delete this task?', () => {
                    this.#executeAction(ApiClient.deleteTask(taskId), 'Task deleted');
                });
            },

            onDeleteSubtask: (taskId, subtaskId) => {
                ui.showConfirmModal('Delete Subtask', 'Delete this subtask permanently?', () => {
                    this.#executeAction(ApiClient.deleteSubtask(taskId, subtaskId), 'Subtask deleted');
                });
            },

            onAddManualTime: (taskId, subtaskId = null) => {
                ui.showManualTimeModal((startIso, endIso) => {
                    this.#executeAction(ApiClient.addManualTime(taskId, subtaskId, startIso, endIso), 'Time added successfully');
                });
            },

            onEditTask: (task) => {
                ui.showEditModal(task, false, (name, tags) => {
                    this.#executeAction(ApiClient.updateTask(task.id, { name, tags }), 'Task updated successfully');
                });
            },

            onEditSubtask: (taskId, subtask) => {
                ui.showEditModal(subtask, true, (name) => {
                    this.#executeAction(ApiClient.updateSubtask(taskId, subtask.id, { name }), 'Subtask updated successfully');
                });
            },

            onFilterTag: (tag) => {
                this.#currentTagFilter = tag;
                this.#loadTasks();
            },
        }
    }

    #updateAllTimers() {
        let activeTaskInfo = null;

        this.#tasksData.forEach(task => {
            let taskOwnTime = TimeUtils.calculateTimeFromEntries(task.timeEntries);
            let totalSubTime = 0;

            task.subtasks.forEach(subtask => {
                const subTimeMs = TimeUtils.calculateTimeFromEntries(subtask.timeEntries);
                totalSubTime += subTimeMs;

                ui.updateSubtaskTimeUI(
                    subtask.id,
                    TimeUtils.formatTime(subTimeMs),
                    subtask.status === 'active'
                );

                if (subtask.status === 'active' && !activeTaskInfo) {
                    activeTaskInfo = { name: subtask.name, time: subTimeMs };
                }
            });

            const grandTotal = taskOwnTime + totalSubTime;
            
            ui.updateTaskTimeUI(
                task.id,
                TimeUtils.formatTime(grandTotal),
                task.status === 'active'
            );

            if (task.status === 'active' && !activeTaskInfo) {
                activeTaskInfo = { name: task.name, time: grandTotal };
            }
        });

        const newTitle = activeTaskInfo
            ? `[${TimeUtils.formatTime(activeTaskInfo.time)}] ${activeTaskInfo.name}`
            : 'ChronoFlow - Advanced Time Tracker';
        
        ui.updateDocumentTitle(newTitle);
    }

    #setupEventListeners() {
        ui.bindCreateTaskForm((name, tags) => {
            this.#executeAction(ApiClient.createTask({name, tags}), 'Task created successfully');
        });
    }
}

const app = new AppController();
app.init();
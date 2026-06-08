//region UIUtils
class UIUtils {
    static getStatusColor(status) {
        const colors = {
            pending: 'bg-slate-700 text-slate-300',
            active: 'bg-emerald-900/50 text-emerald-400',
            paused: 'bg-amber-900/50 text-amber-400',
            completed: 'bg-indigo-900/50 text-indigo-400'
        };
        return colors[status] || colors.pending;
    }

    static cloneTemplate(id) {
        return document.getElementById(id).content.cloneNode(true);
    }
}

//region ToastUI
class ToastUI {
    static show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        const borderColors = { success: 'border-emerald-500', error: 'border-rose-500', info: 'border-blue-500' };
        
        toast.className = `bg-slate-800 border-l-4 ${borderColors[type]} text-white px-4 py-3 rounded shadow-lg transform transition-all duration-300 translate-x-full`;
        toast.textContent = message;
        
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
        
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

//region ModalCore
class ModalCore {
    static close() {
        document.getElementById('dynamic-modal').classList.add('hidden');
    }

    static open({ title, contentNode, confirmText = 'Confirm', isDanger = false, onConfirm }) {
        const modal = document.getElementById('dynamic-modal');
        const confirmButton = document.getElementById('modal-btn-confirm');
        
        document.getElementById('modal-title').textContent = title;
        
        const body = document.getElementById('modal-body');
        body.innerHTML = ''; 
        body.appendChild(contentNode);
        
        const baseBtnClasses = 'px-4 py-2 rounded-lg text-white font-medium transition-colors shadow-lg';
        confirmButton.className = isDanger 
            ? `${baseBtnClasses} bg-rose-600 hover:bg-rose-500 shadow-rose-900/20` 
            : `${baseBtnClasses} bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20`;
        confirmButton.textContent = confirmText;

        const duplicateConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(duplicateConfirmButton, confirmButton);

        duplicateConfirmButton.onclick = () => {
            if (onConfirm(body) !== false) this.close();
        };
        
        document.getElementById('modal-btn-cancel').onclick = () => this.close();
        modal.classList.remove('hidden');
    }
}

//region ManualTime Cont
class ManualTimeController {
    static setupTabs(container) {
        const tabBtns = container.querySelectorAll('.tab-btn');
        const sections = {
            duration: container.querySelector('#mode-duration'),
            range: container.querySelector('#mode-range')
        };

        tabBtns.forEach(btn => {
            btn.onclick = (e) => this.#switchTab(e.currentTarget, tabBtns, sections);
        });
    }

    static handleSubmit(bodyNode, onSubmitCallback) {
        const activeTab = bodyNode.querySelector('.tab-btn.active').dataset.target;
        try {
            const { start, end } = activeTab === 'range' 
                ? this.#parseRange(bodyNode) 
                : this.#parseDuration(bodyNode);
            
            onSubmitCallback(start, end);
            return true;
        } catch (error) {
            ToastUI.show(error.message, 'error');
            return false;
        }
    }

    static #switchTab(targetBtn, allBtns, sections) {
        allBtns.forEach(b => {
            b.classList.remove('bg-slate-700', 'text-white', 'active');
            b.classList.add('text-slate-400');
        });
        targetBtn.classList.add('bg-slate-700', 'text-white', 'active');
        targetBtn.classList.remove('text-slate-400');

        const isRange = targetBtn.dataset.target === 'range';
        sections.range.classList.toggle('hidden', !isRange);
        sections.range.classList.toggle('flex', isRange);
        sections.duration.classList.toggle('hidden', isRange);
        sections.duration.classList.toggle('flex', !isRange);
    }

    static #parseRange(node) {
        const start = node.querySelector('.manual-start').value;
        const end = node.querySelector('.manual-end').value;
        
        if (!start || !end) throw new Error('Both dates are required');
        if (new Date(start) >= new Date(end)) throw new Error('Start time must be before end time');
        
        return { start: new Date(start).toISOString(), end: new Date(end).toISOString() };
    }

    static #parseDuration(node) {
        const hours = Number.parseInt(node.querySelector('.manual-hours').value) || 0;
        const minutes = Number.parseInt(node.querySelector('.manual-minutes').value) || 0;
        
        if (hours === 0 && minutes === 0) throw new Error('Please enter a valid duration');
        
        const now = new Date();
        const totalMs = (hours * 3600000) + (minutes * 60000);
        return { start: new Date(now.getTime() - totalMs).toISOString(), end: now.toISOString() };
    }
}

//region ModalsUI
class ModalsUI {
    static confirm(title, message, onConfirmCallback) {
        const tpl = UIUtils.cloneTemplate('tpl-modal-confirm');
        tpl.querySelector('.confirm-message').textContent = message;

        ModalCore.open({
            title, contentNode: tpl, confirmText: 'Delete', isDanger: true,
            onConfirm: () => { onConfirmCallback(); return true; }
        });
    }

    static manualTime(onSubmitCallback) {
        const tpl = UIUtils.cloneTemplate('tpl-modal-manual-time');
        ManualTimeController.setupTabs(tpl);

        ModalCore.open({
            title: 'Add Time', contentNode: tpl, confirmText: 'Save Time', isDanger: false,
            onConfirm: (bodyNode) => ManualTimeController.handleSubmit(bodyNode, onSubmitCallback)
        });
    }
}

//region ActionBinder
class ActionBinder {
    static bind(node, entity, callbacks, isSubtask, parentId = null) {
        const isCompleted = entity.status === 'completed';
        const isActive = entity.status === 'active';

        const trigger = (action) => isSubtask 
            ? callbacks.onToggleSubtask(parentId, entity.id, action)
            : callbacks.onToggleTask(entity.id, action);

        this.#setupBtn(node, '.btn-start', isActive || isCompleted, () => trigger('start'));
        this.#setupBtn(node, '.btn-pause', !isActive, () => trigger('pause'));
        this.#setupBtn(node, '.btn-stop', isCompleted, () => trigger('stop'));
        this.#setupBtn(node, '.btn-reopen', !isCompleted, () => trigger('reopen'));

        this.#setupBtn(node, '.btn-delete', false, () => isSubtask 
            ? callbacks.onDeleteSubtask(parentId, entity.id) : callbacks.onDeleteTask(entity.id));

        this.#setupBtn(node, '.btn-add-time', false, () => isSubtask 
            ? callbacks.onAddManualTime(parentId, entity.id) : callbacks.onAddManualTime(entity.id));
    }

    static #setupBtn(parentNode, selector, isHidden, onClick) {
        const btn = parentNode.querySelector(selector);
        if (btn) {
            btn.classList.toggle('hidden', isHidden);
            btn.onclick = onClick;
        }
    }
}

//region TaskRenderer
class TaskRenderer {
    static render(tasksData, callbacks) {
        const container = document.getElementById('tasks-container');
        this.#cleanupDeleted(container, tasksData);

        tasksData.forEach((task, index) => {
            let node = document.getElementById(`task-card-${task.id}`);
            
            if (node) {
                this.#updateNode(node, task, callbacks);
            } else {
                node = this.#createNode(task, index, callbacks);
            }

            if (container.children[index] !== node) {
                container.insertBefore(node, container.children[index]);
            }
        });
    }

    static #cleanupDeleted(container, tasksData) {
        const newIds = new Set(tasksData.map(t => `task-card-${t.id}`));
        Array.from(container.children).forEach(child => {
            if (!newIds.has(child.id)) child.remove();
        });
    }

    static #createNode(task, index, callbacks) {
        const tpl = UIUtils.cloneTemplate('task-template');
        const card = tpl.querySelector('.task-card');
        
        card.id = `task-card-${task.id}`;
        card.style.animationDelay = `${index * 0.05}s`;
        tpl.querySelector('.total-time').id = `time-${task.id}`;
        
        const form = tpl.querySelector('.create-subtask-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const input = form.querySelector('.subtask-name');
            if (input.value.trim()) callbacks.onCreateSubtask(task.id, input.value.trim());
        };

        this.#updateNode(tpl, task, callbacks);
        return card || tpl;
    }

    static #updateNode(node, task, callbacks) {
        node.querySelector('.task-title').textContent = task.name;
        
        const badge = node.querySelector('.task-status');
        badge.className = `task-status text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold ${UIUtils.getStatusColor(task.status)}`;
        badge.textContent = task.status;

        node.querySelector('.task-tags').innerHTML = task.tags?.map(tag => 
            `<span class="bg-indigo-900/30 text-indigo-300 text-xs px-2 py-1 rounded-md border border-indigo-500/30">#${tag}</span>`
        ).join('') || '';

        ActionBinder.bind(node, task, callbacks, false);
        this.#renderSubtasks(node, task, callbacks);
    }

    static #renderSubtasks(parentNode, parentTask, callbacks) {
        const list = parentNode.querySelector('.subtasks-list');
        list.innerHTML = '';

        parentTask.subtasks.forEach(subtask => {
            const subTpl = UIUtils.cloneTemplate('subtask-template');
            subTpl.querySelector('.subtask-title').textContent = subtask.name;
            subTpl.querySelector('.sub-time').id = `time-sub-${subtask.id}`;

            const badge = subTpl.querySelector('.subtask-status');
            badge.className = `subtask-status text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${UIUtils.getStatusColor(subtask.status)}`;
            badge.textContent = subtask.status;

            ActionBinder.bind(subTpl, subtask, callbacks, true, parentTask.id);
            list.appendChild(subTpl);
        });
    }
};

//region exports
export const showToast = ToastUI.show;
export const showConfirmModal = ModalsUI.confirm;
export const showManualTimeModal = ModalsUI.manualTime;
export const renderTasks = (data, callbacks) => TaskRenderer.render(data, callbacks);
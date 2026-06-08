export const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const borderColors = {
        success: 'border-emerald-500',
        error: 'border-rose-500',
        info: 'border-blue-500',
    };
    toast.className = `bg-slate-800 border-l-4 ${borderColors[type]} text-white px-4 py-3 rounded shadow-lg transform transition-all duration-300 translate-x-full`;
    toast.textContent = message;
    
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.remove('translate-x-full'));
    
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

export const showConfirmModal = (title, message, onConfirmCallback) => {
    const tpl = document.getElementById('tpl-modal-confirm').content.cloneNode(true);
    tpl.querySelector('.confirm-message').textContent = message;

    openModal({
        title,
        contentNode: tpl,
        confirmText: 'Delete',
        isDanger: true,
        onConfirm: () => {
            onConfirmCallback();
            return true;
        }
    });
};

export const renderTasks = (tasksData, callbacks) => {
    const container = document.getElementById('tasks-container');
    const currentIds = Array.from(container.children).map(c => c.id);
    const newIds = new Set(tasksData.map(t => `task-card-${t.id}`));

    currentIds.forEach(id => {
        if (!newIds.has(id)) document.getElementById(id).remove();
    });

    tasksData.forEach((task, index) => {
        const cardId = `task-card-${task.id}`;
        const existingNode = document.getElementById(cardId);
        
        if (existingNode) {
            updateTaskNodeData(existingNode, task, callbacks);
        } else {
            const newNode = createTaskElement(task, callbacks);
            container.appendChild(newNode);
        }
    });
};

const createTaskElement = (task, index, callbacks) => {
    const template = document.getElementById('task-template').content.cloneNode(true);
    const card = template.querySelector('.task-card');
    card.id = `task-card-${task.id}`;
    card.style.animationDelay = `${index * 0.05}s`;
    
    template.querySelector('.total-time').id = `time-${task.id}`;
    
    const addSubtaskForm = template.querySelector('.create-subtask-form');
    addSubtaskForm.onsubmit = (e) => {
        e.preventDefault();
        const input = addSubtaskForm.querySelector('.subtask-name');
        if(input.value.trim()) callbacks.onCreateSubtask(task.id, input.value.trim());
    };

    updateTaskNodeData(template, task, callbacks);
    return card || template; 
};

const updateTaskNodeData = (node, task, callbacks) => {
    node.querySelector('.task-title').textContent = task.name;
    
    const badge = node.querySelector('.task-status');
    badge.className = `task-status text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold ${getStatusColor(task.status)}`;
    badge.textContent = task.status;

    const tagsContainer = node.querySelector('.task-tags');
    tagsContainer.innerHTML = task.tags?.map(tag => 
    `<span class="bg-indigo-900/30 text-indigo-300 text-xs px-2 py-1 rounded-md border border-indigo-500/30">#${tag}</span>`
    ).join('') || '';

    setupActionbuttons(node, task, callbacks, false);

    const subtasksList = node.querySelector('.subtasks-list');
    subtasksList.innerHTML = '';

    task.subtasks.forEach(subtask => {
        const subtaskTemplate = document.getElementById('subtask-template').content.cloneNode(true);
        subtaskTemplate.querySelector('.subtask-title').textContent = subtask.name;
        subtaskTemplate.querySelector('.sub-time').id = `time-sub-${subtask.id}`;

        const subtaskBadge = subtaskTemplate.querySelector('.subtask-status');
        subtaskBadge.className = `subtask-status text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${getStatusColor(subtask.status)}`;
        subtaskBadge.textContent = subtask.status;

        setupActionbuttons(subtaskTemplate, subtask, callbacks, true, task.id);
        subtasksList.appendChild(subtaskTemplate);
    });
};

const setupActionbuttons = (node, entity, callbacks, isSubtask, parentId = null) => {
    const btnStart = node.querySelector('.btn-start');
    const btnPause = node.querySelector('.btn-pause');
    const btnStop = node.querySelector('.btn-stop');
    const btnReopen = node.querySelector('.btn-reopen');
    const btnDelete = node.querySelector('.btn-delete');
    const btnAddTime = node.querySelector('.btn-add-time');

    const isCompleted = entity.status === 'completed';
    const isActive = entity.status === 'active';

    btnStart.classList.toggle('hidden', isActive || isCompleted);
    btnPause.classList.toggle('hidden', !isActive);
    btnStop.classList.toggle('hidden', isCompleted);
    btnReopen.classList.toggle('hidden', !isCompleted);

    const toggle = (action) => isSubtask 
        ? callbacks.onToggleSubtask(parentId, entity.id, action)
        : callbacks.onToggleTask(entity.id, action);

    btnStart.onclick = () => toggle('start');
    btnPause.onclick = () => toggle('pause');
    btnStop.onclick = () => toggle('stop');
    btnReopen.onclick = () => toggle('reopen');

    if (btnDelete) {
        btnDelete.onclick = () => isSubtask 
            ? callbacks.onDeleteSubtask(parentId, entity.id)
            : callbacks.onDeleteTask(entity.id);
    }

    if (btnAddTime && !isSubtask) {
        btnAddTime.onclick = () => callbacks.onAddManualTime(entity.id);
    }
}

const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-slate-700 text-slate-300',
        active: 'bg-emerald-900/50 text-emerald-400',
        paused: 'bg-amber-900/50 text-amber-400',
        completed: 'bg-indigo-900/50 text-indigo-400'
    };
    return colors[status] || colors.pending;
};

const openModal = ({title, contentNode, confirmText = 'Confirm', isDanger = false, onConfirm}) => {
    const modal = document.getElementById('dynamic-modal');
    document.getElementById('modal-title').textContent = title;
    
    const body = document.getElementById('modal-body');
    body.innerHTML = ''; 
    body.appendChild(contentNode); 
    
    const confirmButton = document.getElementById('modal-btn-confirm');
    const cancelButton = document.getElementById('modal-btn-cancel');

    const baseBtnClasses = 'px-4 py-2 rounded-lg text-white font-medium transition-colors shadow-lg';
    confirmButton.className = isDanger 
        ? `${baseBtnClasses} bg-rose-600 hover:bg-rose-500 shadow-rose-900/20` 
        : `${baseBtnClasses} bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20`;
    
    confirmButton.textContent = confirmText;

    const closeModal = () => modal.classList.add('hidden');

    const duplicateConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(duplicateConfirmButton, confirmButton);

    duplicateConfirmButton.onclick = () => {
        if (onConfirm && onConfirm(body) !== false) closeModal();
    };
    
    cancelButton.onclick = closeModal;
    modal.classList.remove('hidden');
};

export const showManualTimeModal = (onSubmitCallback) => {
    const tpl = document.getElementById('tpl-modal-manual-time').content.cloneNode(true);
    
    openModal({
        title: 'Add Manual Time',
        contentNode: tpl,
        confirmText: 'Save Time',
        isDanger: false,
        onConfirm: (bodyNode) => {
            const start = bodyNode.querySelector('.manual-start').value;
            const end = bodyNode.querySelector('.manual-end').value;
            
            if (!start || !end) {
                showToast('Both dates are required', 'error'); 
                return false; 
            }
            if (new Date(start) >= new Date(end)) {
                showToast('Start time must be before end time', 'error');
                return false; 
            }
            
            onSubmitCallback(new Date(start).toISOString(), new Date(end).toISOString());
            return true; 
        }
    });
};
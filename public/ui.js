export const showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
};

export const showConfirmModal = (title, message, onConfirm) => {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    
    const btnConfirm = document.getElementById('modal-btn-confirm');
    const btnCancel = document.getElementById('modal-btn-cancel');

    const closeModal = () => modal.classList.add('hidden');

    const newBtnConfirm = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

    newBtnConfirm.onclick = () => {
        onConfirm();
        closeModal();
    };
    
    btnCancel.onclick = closeModal;
    modal.classList.remove('hidden');
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
            const newNode = createTaskElement(task, index, callbacks);
            if (index === 0) container.prepend(newNode);
            else {
                const prevId = `task-card-${tasksData[index-1].id}`;
                document.getElementById(prevId).after(newNode);
            }
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
    badge.className = `task-status badge ${task.status}`;
    badge.textContent = task.status;

    const btnStart = node.querySelector('.btn-start');
    const btnPause = node.querySelector('.btn-pause');
    const btnStop = node.querySelector('.btn-stop');
    const btnDelete = node.querySelector('.btn-delete');
    
    btnStart.classList.toggle('hidden', task.status === 'active' || task.status === 'completed');
    btnPause.classList.toggle('hidden', task.status !== 'active');
    
    const isCompleted = task.status === 'completed';
    btnStart.disabled = isCompleted;
    btnStop.disabled = isCompleted;
    btnStart.style.opacity = isCompleted ? '0.5' : '1';
    btnStop.style.opacity = isCompleted ? '0.5' : '1';

    btnStart.onclick = () => callbacks.onToggleTask(task.id, 'start');
    btnPause.onclick = () => callbacks.onToggleTask(task.id, 'pause');
    btnStop.onclick = () => callbacks.onToggleTask(task.id, 'stop');
    btnDelete.onclick = () => callbacks.onDeleteTask(task.id);

    const subtasksList = node.querySelector('.subtasks-list');
    subtasksList.innerHTML = ''; 
    
    task.subtasks.forEach(subtask => {
        const subTpl = document.getElementById('subtask-template').content.cloneNode(true);
        subTpl.querySelector('.subtask-title').textContent = subtask.name;
        subTpl.querySelector('.sub-time').id = `time-sub-${subtask.id}`;
        
        const subBadge = subTpl.querySelector('.subtask-status');
        subBadge.className = `subtask-status badge badge-small ${subtask.status}`;
        subBadge.textContent = subtask.status;

        const sBtnStart = subTpl.querySelector('.btn-start');
        const sBtnPause = subTpl.querySelector('.btn-pause');
        const sBtnStop = subTpl.querySelector('.btn-stop');

        sBtnStart.classList.toggle('hidden', subtask.status === 'active' || subtask.status === 'completed');
        sBtnPause.classList.toggle('hidden', subtask.status !== 'active');
        
        const isSubCompleted = subtask.status === 'completed';
        sBtnStart.disabled = isSubCompleted;
        sBtnStop.disabled = isSubCompleted;
        sBtnStart.style.opacity = isSubCompleted ? '0.5' : '1';
        sBtnStop.style.opacity = isSubCompleted ? '0.5' : '1';

        sBtnStart.onclick = () => callbacks.onToggleSubtask(task.id, subtask.id, 'start');
        sBtnPause.onclick = () => callbacks.onToggleSubtask(task.id, subtask.id, 'pause');
        sBtnStop.onclick = () => callbacks.onToggleSubtask(task.id, subtask.id, 'stop');

        subtasksList.appendChild(subTpl);
    });
};
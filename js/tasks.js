const Tasks = {
    all: [],
    editingId: null,

    async init() {
        if (!localStorage.getItem('token')) {
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('btn-logout').addEventListener('click', () => this.logout());
        document.getElementById('btn-new-task').addEventListener('click', () => this.openModal());
        document.getElementById('btn-cancel').addEventListener('click', () => this.closeModal());
        document.getElementById('task-form').addEventListener('submit', e => { e.preventDefault(); this.save(); });
        document.getElementById('filter-status').addEventListener('change', () => this.render());

        await this.load();
    },

    async load() {
        this.setListLoading(true);
        try {
            const response = await Api.get('/tasks');
            this.all = response.data;
            this.render();
        } catch {
            this.showToast('Erro ao carregar tarefas.', 'error');
        } finally {
            this.setListLoading(false);
        }
    },

    render() {
        const filter  = document.getElementById('filter-status').value;
        const tasks   = filter ? this.all.filter(t => t.status === filter) : this.all;
        const list    = document.getElementById('task-list');
        const empty   = document.getElementById('empty-state');

        list.innerHTML = '';

        if (tasks.length === 0) {
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        tasks.forEach(task => list.appendChild(this.buildCard(task)));
    },

    buildCard(task) {
        const card = document.createElement('div');
        card.className = `task-card status-${task.status}`;
        card.innerHTML = `
            <div class="task-header">
                <span class="task-badge badge-${task.status}">${this.labelStatus(task.status)}</span>
                <div class="task-actions">
                    <button class="btn-icon" title="Editar" onclick="Tasks.openModal(${task.id})">✏️</button>
                    <button class="btn-icon" title="Excluir" onclick="Tasks.remove(${task.id})">🗑️</button>
                </div>
            </div>
            <h3 class="task-title">${this.escape(task.title)}</h3>
            ${task.description ? `<p class="task-desc">${this.escape(task.description)}</p>` : ''}
            ${task.due_date ? `<span class="task-date">📅 ${this.formatDate(task.due_date)}</span>` : ''}
        `;
        return card;
    },

    openModal(id = null) {
        this.editingId = id;
        const title = document.getElementById('modal-title');
        const form  = document.getElementById('task-form');
        form.reset();

        if (id) {
            const task = this.all.find(t => t.id === id);
            title.textContent = 'Editar Tarefa';
            document.getElementById('task-title').value       = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-status').value      = task.status;
            document.getElementById('task-due-date').value    = task.due_date || '';
        } else {
            title.textContent = 'Nova Tarefa';
        }

        document.getElementById('modal').classList.remove('hidden');
        document.getElementById('task-title').focus();
    },

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        this.editingId = null;
    },

    async save() {
        const btn  = document.getElementById('btn-save');
        const body = {
            title:       document.getElementById('task-title').value,
            description: document.getElementById('task-description').value || null,
            status:      document.getElementById('task-status').value,
            due_date:    document.getElementById('task-due-date').value || null,
        };

        btn.disabled    = true;
        btn.textContent = 'Salvando...';

        try {
            if (this.editingId) {
                const response = await Api.put(`/tasks/${this.editingId}`, body);
                const index    = this.all.findIndex(t => t.id === this.editingId);
                this.all[index] = response.data;
                this.showToast('Tarefa atualizada!');
            } else {
                const response = await Api.post('/tasks', body);
                this.all.unshift(response.data);
                this.showToast('Tarefa criada!');
            }
            this.closeModal();
            this.render();
        } catch (err) {
            const msg = err.data?.errors
                ? Object.values(err.data.errors).flat().join(' ')
                : 'Erro ao salvar tarefa.';
            this.showToast(msg, 'error');
        } finally {
            btn.disabled    = false;
            btn.textContent = 'Salvar';
        }
    },

    async remove(id) {
        if (!confirm('Deseja remover esta tarefa?')) return;
        try {
            await Api.delete(`/tasks/${id}`);
            this.all = this.all.filter(t => t.id !== id);
            this.render();
            this.showToast('Tarefa removida.');
        } catch {
            this.showToast('Erro ao remover tarefa.', 'error');
        }
    },

    async logout() {
        try { await Api.post('/logout'); } catch {}
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    },

    setListLoading(loading) {
        document.getElementById('loading').classList.toggle('hidden', !loading);
        document.getElementById('task-list').classList.toggle('hidden', loading);
    },

    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className   = `toast toast-${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    },

    labelStatus(status) {
        return { pending: 'Pendente', in_progress: 'Em andamento', done: 'Concluída' }[status] ?? status;
    },

    formatDate(date) {
        return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
    },

    escape(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    },
};

document.addEventListener('DOMContentLoaded', () => Tasks.init());

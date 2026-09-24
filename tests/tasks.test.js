global.CONFIG = { API_URL: 'http://test.api/api' };
global.Api = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
};

document.body.innerHTML = `
    <select id="filter-status">
        <option value="">Todos</option>
        <option value="pending">Pendente</option>
        <option value="in_progress">Em andamento</option>
        <option value="done">Concluída</option>
    </select>
    <div id="task-list"></div>
    <div id="empty-state" class="hidden"></div>
    <div id="loading" class="hidden"></div>
    <div id="modal" class="hidden"></div>
    <h2 id="modal-title"></h2>
    <div id="toast"></div>
    <form id="task-form">
        <input id="task-title" value="">
        <textarea id="task-description"></textarea>
        <select id="task-status"><option value="pending">Pendente</option></select>
        <input id="task-due-date" value="">
        <button id="btn-save" data-label="Salvar">Salvar</button>
        <button id="btn-cancel">Cancelar</button>
    </form>
    <button id="btn-logout"></button>
    <button id="btn-new-task"></button>
`;

const Tasks = require('../js/tasks');

describe('Tasks', () => {
    describe('labelStatus()', () => {
        it.each([
            ['pending',     'Pendente'],
            ['in_progress', 'Em andamento'],
            ['done',        'Concluída'],
        ])('retorna "%s" para status "%s"', (status, label) => {
            expect(Tasks.labelStatus(status)).toBe(label);
        });

        it('retorna o próprio valor para status desconhecido', () => {
            expect(Tasks.labelStatus('unknown')).toBe('unknown');
        });
    });

    describe('escape()', () => {
        it('converte & para &amp;', () => {
            expect(Tasks.escape('A & B')).toBe('A &amp; B');
        });

        it('converte < e > para entidades HTML', () => {
            expect(Tasks.escape('<script>')).toBe('&lt;script&gt;');
        });

        it('não altera texto sem caracteres especiais', () => {
            expect(Tasks.escape('Tarefa normal')).toBe('Tarefa normal');
        });
    });

    describe('formatDate()', () => {
        it('formata data no padrão brasileiro', () => {
            expect(Tasks.formatDate('2026-09-24')).toBe('24/09/2026');
        });
    });

    describe('buildCard()', () => {
        it('cria card com a classe de status correta', () => {
            const task = { id: 1, title: 'Tarefa', status: 'pending', description: null, due_date: null };
            const card = Tasks.buildCard(task);
            expect(card.classList.contains('task-card')).toBe(true);
            expect(card.classList.contains('status-pending')).toBe(true);
        });

        it('exibe o título da tarefa', () => {
            const task = { id: 2, title: 'Minha Tarefa', status: 'done', description: null, due_date: null };
            const card = Tasks.buildCard(task);
            expect(card.querySelector('.task-title').textContent).toBe('Minha Tarefa');
        });

        it('exibe o badge com o label correto', () => {
            const task = { id: 3, title: 'Teste', status: 'in_progress', description: null, due_date: null };
            const card = Tasks.buildCard(task);
            expect(card.querySelector('.task-badge').textContent).toBe('Em andamento');
        });

        it('não renderiza elemento de descrição quando ausente', () => {
            const task = { id: 4, title: 'Sem descrição', status: 'pending', description: null, due_date: null };
            const card = Tasks.buildCard(task);
            expect(card.querySelector('.task-desc')).toBeNull();
        });

        it('escapa HTML no título para prevenir XSS', () => {
            const task = { id: 5, title: '<b>Injeção</b>', status: 'pending', description: null, due_date: null };
            const card = Tasks.buildCard(task);
            expect(card.querySelector('.task-title').textContent).toBe('<b>Injeção</b>');
        });
    });

    describe('render()', () => {
        beforeEach(() => {
            Tasks.all = [
                { id: 1, title: 'T1', status: 'pending',     description: null, due_date: null },
                { id: 2, title: 'T2', status: 'done',        description: null, due_date: null },
                { id: 3, title: 'T3', status: 'in_progress', description: null, due_date: null },
            ];
            document.getElementById('filter-status').value = '';
        });

        it('renderiza todas as tarefas sem filtro', () => {
            Tasks.render();
            expect(document.getElementById('task-list').children).toHaveLength(3);
        });

        it('filtra tarefas por status', () => {
            document.getElementById('filter-status').value = 'done';
            Tasks.render();
            expect(document.getElementById('task-list').children).toHaveLength(1);
        });

        it('exibe estado vazio quando não há tarefas', () => {
            Tasks.all = [];
            Tasks.render();
            expect(document.getElementById('empty-state').classList.contains('hidden')).toBe(false);
        });
    });
});

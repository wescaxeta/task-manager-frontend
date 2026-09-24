global.CONFIG = { API_URL: 'http://test.api/api' };

const Api = require('../js/api');

describe('Api', () => {
    beforeEach(() => {
        localStorage.clear();
        global.fetch = jest.fn();
    });

    describe('headers()', () => {
        it('inclui Authorization quando há token no localStorage', () => {
            localStorage.setItem('token', 'meu-token-123');
            expect(Api.headers()['Authorization']).toBe('Bearer meu-token-123');
        });

        it('não inclui Authorization quando não há token', () => {
            expect(Api.headers()['Authorization']).toBeUndefined();
        });

        it('não inclui Authorization quando withAuth é false', () => {
            localStorage.setItem('token', 'meu-token-123');
            expect(Api.headers(false)['Authorization']).toBeUndefined();
        });

        it('sempre inclui Content-Type e Accept', () => {
            const headers = Api.headers();
            expect(headers['Content-Type']).toBe('application/json');
            expect(headers['Accept']).toBe('application/json');
        });
    });

    describe('request()', () => {
        it('chama fetch com a URL correta', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] }),
            });

            await Api.request('GET', '/tasks');

            expect(fetch).toHaveBeenCalledWith(
                'http://test.api/api/tasks',
                expect.objectContaining({ method: 'GET' })
            );
        });

        it('inclui o body serializado em JSON', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({}),
            });

            await Api.request('POST', '/tasks', { title: 'Nova tarefa' });

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ body: '{"title":"Nova tarefa"}' })
            );
        });

        it('lança erro com status e data em resposta não-ok', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 422,
                json: () => Promise.resolve({ errors: { title: ['Campo obrigatório'] } }),
            });

            await expect(Api.request('POST', '/tasks', {})).rejects.toMatchObject({
                status: 422,
                data: { errors: { title: ['Campo obrigatório'] } },
            });
        });

        it('retorna os dados da resposta bem-sucedida', async () => {
            const payload = { data: [{ id: 1, title: 'Tarefa' }] };
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(payload),
            });

            const result = await Api.get('/tasks');
            expect(result).toEqual(payload);
        });
    });

    describe('postPublic()', () => {
        it('envia requisição sem header de Authorization', async () => {
            localStorage.setItem('token', 'meu-token-123');
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ token: 'novo-token' }),
            });

            await Api.postPublic('/login', { email: 'a@a.com', password: '12345678' });

            const [, options] = fetch.mock.calls[0];
            expect(options.headers['Authorization']).toBeUndefined();
        });
    });
});

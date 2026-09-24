global.CONFIG = { API_URL: 'http://test.api/api' };
global.Api = {
    postPublic: jest.fn(),
    post: jest.fn(),
};

document.body.innerHTML = `
    <div id="card-login"></div>
    <div id="card-register" class="hidden"></div>
    <div id="error-login" class="error-msg hidden"></div>
    <div id="error-register" class="error-msg hidden"></div>
    <form id="form-login">
        <input id="login-email" value="user@test.com">
        <input id="login-password" value="12345678">
        <button id="btn-login" data-label="Entrar">Entrar</button>
    </form>
    <form id="form-register">
        <input id="register-name" value="Usuário Teste">
        <input id="register-email" value="novo@test.com">
        <input id="register-password" value="12345678">
        <input id="register-confirm" value="12345678">
        <button id="btn-register" data-label="Cadastrar">Cadastrar</button>
    </form>
    <button id="btn-show-register">Cadastre-se</button>
    <button id="btn-show-login">Entrar</button>
`;

const Auth = require('../js/auth');

describe('Auth', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        document.getElementById('error-login').classList.add('hidden');
        document.getElementById('error-register').classList.add('hidden');
    });

    describe('toggleForm()', () => {
        it('exibe cadastro e oculta login', () => {
            Auth.toggleForm(true);
            expect(document.getElementById('card-login').classList.contains('hidden')).toBe(true);
            expect(document.getElementById('card-register').classList.contains('hidden')).toBe(false);
        });

        it('exibe login e oculta cadastro', () => {
            Auth.toggleForm(false);
            expect(document.getElementById('card-login').classList.contains('hidden')).toBe(false);
            expect(document.getElementById('card-register').classList.contains('hidden')).toBe(true);
        });
    });

    describe('login()', () => {
        beforeEach(() => {
            delete window.location;
            window.location = { href: '' };
        });

        it('salva token no localStorage após login bem-sucedido', async () => {
            global.Api.postPublic.mockResolvedValue({ token: 'token-valido' });

            await Auth.login();

            expect(localStorage.getItem('token')).toBe('token-valido');
        });

        it('redireciona para o dashboard após login bem-sucedido', async () => {
            global.Api.postPublic.mockResolvedValue({ token: 'token-valido' });

            await Auth.login();

            expect(window.location.href).toBe('dashboard.html');
        });

        it('exibe mensagem de erro em credenciais inválidas', async () => {
            global.Api.postPublic.mockRejectedValue({ status: 401, data: { message: 'Credenciais inválidas.' } });

            await Auth.login();

            const errorEl = document.getElementById('error-login');
            expect(errorEl.classList.contains('hidden')).toBe(false);
            expect(errorEl.textContent).toBe('Credenciais inválidas.');
        });
    });

    describe('register()', () => {
        beforeEach(() => {
            delete window.location;
            window.location = { href: '' };
        });

        it('salva token após cadastro bem-sucedido', async () => {
            global.Api.postPublic.mockResolvedValue({ token: 'novo-token' });

            await Auth.register();

            expect(localStorage.getItem('token')).toBe('novo-token');
        });

        it('exibe erros de validação por campo', async () => {
            global.Api.postPublic.mockRejectedValue({
                status: 422,
                data: { errors: { email: ['E-mail já cadastrado.'] } },
            });

            await Auth.register();

            const errorEl = document.getElementById('error-register');
            expect(errorEl.classList.contains('hidden')).toBe(false);
            expect(errorEl.textContent).toContain('E-mail já cadastrado.');
        });

        it('exibe mensagem de conexão quando servidor está fora', async () => {
            global.Api.postPublic.mockRejectedValue(new TypeError('Failed to fetch'));

            await Auth.register();

            const errorEl = document.getElementById('error-register');
            expect(errorEl.textContent).toContain('Não foi possível conectar');
        });
    });
});

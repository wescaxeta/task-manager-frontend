const Auth = {
    init() {
        if (localStorage.getItem('token')) {
            window.location.href = 'dashboard.html';
            return;
        }
        document.getElementById('form-login').addEventListener('submit', e => { e.preventDefault(); this.login(); });
        document.getElementById('form-register').addEventListener('submit', e => { e.preventDefault(); this.register(); });
        document.getElementById('btn-show-register').addEventListener('click', () => this.toggleForm(true));
        document.getElementById('btn-show-login').addEventListener('click', () => this.toggleForm(false));
    },

    toggleForm(showRegister) {
        document.getElementById('card-login').classList.toggle('hidden', showRegister);
        document.getElementById('card-register').classList.toggle('hidden', !showRegister);
        this.clearErrors();
    },

    async login() {
        const btn = document.getElementById('btn-login');
        this.setLoading(btn, true);
        this.clearErrors();

        try {
            const data = await Api.postPublic('/login', {
                email:    document.getElementById('login-email').value,
                password: document.getElementById('login-password').value,
            });
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } catch (err) {
            this.showError('error-login', err.data?.message || 'Credenciais inválidas.');
        } finally {
            this.setLoading(btn, false);
        }
    },

    async register() {
        const btn = document.getElementById('btn-register');
        this.setLoading(btn, true);
        this.clearErrors();

        try {
            const data = await Api.postPublic('/register', {
                name:                  document.getElementById('register-name').value,
                email:                 document.getElementById('register-email').value,
                password:              document.getElementById('register-password').value,
                password_confirmation: document.getElementById('register-confirm').value,
            });
            localStorage.setItem('token', data.token);
            window.location.href = 'dashboard.html';
        } catch (err) {
            console.error('Erro no cadastro:', err);
            const errors = err.data?.errors;
            if (errors) {
                const msg = Object.values(errors).flat().join(' ');
                this.showError('error-register', msg);
            } else if (err.data?.message) {
                this.showError('error-register', err.data.message);
            } else if (err instanceof TypeError) {
                this.showError('error-register', 'Não foi possível conectar à API. Verifique se o servidor está rodando.');
            } else {
                this.showError('error-register', `Erro ${err.status ?? ''}: ${JSON.stringify(err.data)}`);
            }
        } finally {
            this.setLoading(btn, false);
        }
    },

    setLoading(btn, loading) {
        btn.disabled = loading;
        btn.textContent = loading ? 'Aguarde...' : btn.dataset.label;
    },

    showError(id, msg) {
        const el = document.getElementById(id);
        el.textContent = msg;
        el.classList.remove('hidden');
    },

    clearErrors() {
        document.querySelectorAll('.error-msg').forEach(el => el.classList.add('hidden'));
    },
};

if (typeof module !== 'undefined') module.exports = Auth;

document.addEventListener('DOMContentLoaded', () => Auth.init());

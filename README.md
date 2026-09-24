# task-manager-frontend

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

Interface de gerenciamento de tarefas em Vanilla JS que consome a [laravel-task-api](https://github.com/wescaxeta/laravel-task-api).

**[→ Ver demo ao vivo](https://wescaxeta.github.io/task-manager-frontend)**

## Funcionalidades

- Cadastro e login de usuário com token JWT (Sanctum)
- Listagem de tarefas com filtro por status
- Criar, editar e excluir tarefas
- Feedback visual com toasts e estados de loading
- Redirecionamento automático se não autenticado
- Layout responsivo (mobile e desktop)

## Stack

- HTML5 semântico
- CSS3 com variáveis customizadas (sem framework)
- JavaScript ES6+ puro (sem jQuery, sem bundler)
- `fetch()` para comunicação com a API REST
- `localStorage` para persistência do token

## Como rodar localmente

**1. Suba a API:**

```bash
# Clone e rode o backend
git clone https://github.com/wescaxeta/laravel-task-api
cd laravel-task-api && composer install && cp .env.example .env
php artisan key:generate && php artisan migrate && php artisan serve
```

**2. Configure a URL da API:**

Edite `js/config.js` se necessário:
```js
const CONFIG = {
    API_URL: 'http://localhost:8000/api',
};
```

**3. Abra o frontend:**

```bash
git clone https://github.com/wescaxeta/task-manager-frontend
cd task-manager-frontend
# Abra o index.html no navegador ou use um servidor local:
npx serve .
```

## Estrutura

```
├── index.html        # Página de login e cadastro
├── dashboard.html    # Aplicação principal (requer autenticação)
├── css/
│   └── style.css     # Estilos com CSS custom properties
└── js/
    ├── config.js     # URL da API
    ├── api.js        # Wrapper de fetch com autenticação
    ├── auth.js       # Login, cadastro e logout
    └── tasks.js      # CRUD de tarefas
```

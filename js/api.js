const Api = {
    token() {
        return localStorage.getItem('token');
    },

    headers(withAuth = true) {
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        if (withAuth && this.token()) headers['Authorization'] = `Bearer ${this.token()}`;
        return headers;
    },

    async request(method, endpoint, body = null, withAuth = true) {
        const options = { method, headers: this.headers(withAuth) };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) throw { status: response.status, data };
        return data;
    },

    get:    (endpoint)        => Api.request('GET',    endpoint),
    post:   (endpoint, body)  => Api.request('POST',   endpoint, body),
    put:    (endpoint, body)  => Api.request('PUT',    endpoint, body),
    delete: (endpoint)        => Api.request('DELETE', endpoint),

    postPublic: (endpoint, body) => Api.request('POST', endpoint, body, false),
};

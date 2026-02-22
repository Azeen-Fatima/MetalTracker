const API_BASE = API_BASE_URL + '/api';

const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();

    const headers = {
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);

        if (response.status === 401) {
            logout();
            throw new Error('Unauthorized');
        }

        if (response.headers.get('content-type')?.includes('application/pdf')) {
            return response;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            showToast('Network error. Please check your connection.', 'error');
            throw new Error('Network error');
        }
        throw error;
    }
};

const api = {
    auth: {
        sendVerification: (data) => apiFetch('/auth/send-verification', { method: 'POST', body: JSON.stringify(data) }),
        verifyCode: (data) => apiFetch('/auth/verify-code', { method: 'POST', body: JSON.stringify(data) }),
        signup: (data) => apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
        login: (data) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) })
    },
    user: {
        getProfile: () => apiFetch('/user/profile'),
        updateProfile: (data) => apiFetch('/user/update', { method: 'PUT', body: JSON.stringify(data) }),
        changePassword: (data) => apiFetch('/user/change-password', { method: 'PUT', body: JSON.stringify(data) }),
        sendEmailChange: (data) => apiFetch('/user/send-email-change', { method: 'POST', body: JSON.stringify(data) }),
        confirmEmailChange: (data) => apiFetch('/user/confirm-email-change', { method: 'PUT', body: JSON.stringify(data) }),
        uploadPic: (formData) => apiFetch('/user/upload-pic', { method: 'POST', body: formData })
    },
    metals: {
        getPrices: () => apiFetch('/metals/prices'),
        getHistorical: (metal, tf) => apiFetch(`/metals/historical?metal=${metal}&timeframe=${tf}`),
        getNews: () => apiFetch('/metals/news'),
        getExchange: () => apiFetch('/metals/exchange')
    },
    watchlist: {
        get: () => apiFetch('/watchlist'),
        add: (data) => apiFetch('/watchlist', { method: 'POST', body: JSON.stringify(data) }),
        remove: (metal) => apiFetch(`/watchlist/${metal}`, { method: 'DELETE' })
    },
    predictions: {
        get: () => apiFetch('/predictions'),
        add: (data) => apiFetch('/predictions', { method: 'POST', body: JSON.stringify(data) })
    },
    alerts: {
        get: () => apiFetch('/alerts'),
        markAsRead: (data) => apiFetch('/alerts/read', { method: 'PUT', body: JSON.stringify(data) })
    },
    pdf: {
        getReport: () => apiFetch('/pdf/report')
    }
};

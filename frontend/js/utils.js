function getToken() {
    const token = localStorage.getItem('metaltracker_token');
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            localStorage.removeItem('metaltracker_token');
            localStorage.removeItem('metaltracker_user');
            return null;
        }
        return token;
    } catch (e) {
        localStorage.removeItem('metaltracker_token');
        localStorage.removeItem('metaltracker_user');
        return null;
    }
}

const getUser = () => {
    const user = localStorage.getItem('metaltracker_user');
    return user ? JSON.parse(user) : null;
};

const applyTheme = (theme) => {
    if (theme === 'light') {
        document.body.classList.add('light');
    } else {
        document.body.classList.remove('light');
    }
};

const formatPrice = (price, currency, unit, exchangeRate) => {
    const convertWeight = (pricePerOz, targetUnit) => {
        if (targetUnit === 'gram') return pricePerOz / 31.1035;
        if (targetUnit === 'tola') return (pricePerOz / 31.1035) * 11.6638;
        return pricePerOz;
    };

    let converted = convertWeight(price, unit);
    if (currency === 'PKR') {
        converted *= exchangeRate;
    }

    const dec = currency === 'PKR' ? 0 : 2;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: dec
    }).format(converted);
};

const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    if (type === 'error') {
        toast.style.borderLeftColor = 'var(--error)';
    } else if (type === 'warning') {
        toast.style.borderLeftColor = '#ffcc00';
    } else {
        toast.style.borderLeftColor = 'var(--success)';
    }

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
};

const logout = () => {
    localStorage.removeItem('metaltracker_token');
    localStorage.removeItem('metaltracker_user');
    window.location.href = 'login.html';
};

function initProtectedPage() {
    const token = getToken();
    if (!token) { window.location.href = 'login.html'; return null; }
    return JSON.parse(localStorage.getItem('metaltracker_user'));
}

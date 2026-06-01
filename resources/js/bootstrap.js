import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

window.axios.interceptors.request.use((config) => {
    const lang = localStorage.getItem('lang') || 'uz';
    config.headers['Accept-Language'] = lang;
    return config;
});

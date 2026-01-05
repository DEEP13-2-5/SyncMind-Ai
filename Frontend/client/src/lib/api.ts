const API_URL = import.meta.env.VITE_API_URL || 'https://syncmind-ai.onrender.com/api';

const getHeaders = (token?: string) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(`📤 Sending Auth Header: Bearer ${token.substring(0, 10)}...`);
    }
    return headers;
};

export const api = {
    // Auth
    signup: async (username: string, email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ username, email, password })
        });
        return res.json();
    },

    login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },

    // Load Test
    runLoadTest: async (token: string, testURL: string, githubRepo?: string) => {
        const res = await fetch(`${API_URL}/load-test`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ testURL, githubRepo })
        });
        return res.json();
    },

    // Chat
    sendMessage: async (token: string, sessionId: string, message: string) => {
        const res = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ sessionId, message })
        });
        return res.json();
    },

    getChatHistory: async (token: string, sessionId: string | number) => {
        const res = await fetch(`${API_URL}/chat/${sessionId}`, {
            headers: getHeaders(token)
        });
        return res.json();
    },

    // Payment
    createSubscription: async (token: string, planType: 'weekly' | 'monthly') => {
        const res = await fetch(`${API_URL}/payment/create-sub`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ planType })
        });
        return res.json();
    },

    verifyPayment: async (token: string, paymentData: any) => {
        const res = await fetch(`${API_URL}/payment/verify-payment`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(paymentData)
        });
        return res.json();
    },

    getLoadTest: async (token: string, id: string | number) => {
        const res = await fetch(`${API_URL}/load-test/${id}`, {
            headers: getHeaders(token)
        });
        return res.json();
    },

    getLatestLoadTest: async (token: string) => {
        const res = await fetch(`${API_URL}/load-test/latest`, {
            headers: getHeaders(token)
        });
        return res.json();
    },

    getTestHistory: async (token: string) => {
        const res = await fetch(`${API_URL}/load-test/history`, {
            headers: getHeaders(token)
        });
        return res.json();
    }
};

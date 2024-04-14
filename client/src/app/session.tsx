
export function setToken(token: string) {
    'use client';
    localStorage.setItem('token', token);
    // sessionStorage.setItem('token',token);
}

export function getToken() {
    'use client';
    return localStorage.getItem('token');
    // return sessionStorage.getItem('token');
}

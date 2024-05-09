
export function setAdmin(uuid: string) {
    'use client';
    sessionStorage.setItem('uuid', uuid);
}

export function getAdmin() {
    'use client';
    return sessionStorage.getItem('uuid');
}

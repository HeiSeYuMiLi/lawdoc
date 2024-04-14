export function setFileUuid(uuid: string) {
    'use client';
    sessionStorage.setItem('fileUuid', uuid);
}

export function getFileUuid() {
    'use client';
    return sessionStorage.getItem('fileUuid');
}
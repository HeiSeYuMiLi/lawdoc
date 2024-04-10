let session = '1'
export function checkSession() {
    return (session === '')
}

export function setSession(token: string) {
    session = token;
}
// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
    return localStorage.getItem('yyc-authority');
}

export function setAuthority(currentAuthority) {
    return localStorage.setItem('yyc-authority', currentAuthority);
}

export function getToken() {
    return localStorage.getItem('yyc-token');
}

export function setToken(token) {
    return localStorage.setItem('yyc-token', token);
}

export function removeTokenAndAuthority() {
    localStorage.removeItem('yyc-token')
    localStorage.removeItem('yyc-authority');
}


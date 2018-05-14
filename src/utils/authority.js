// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority() {
  return localStorage.getItem('haowuji-authority') || 'admin';
}

export function setAuthority(currentAuthority) {
  return localStorage.setItem('haowuji-authority', currentAuthority);
}

export function getToken() {
  return localStorage.getItem('haowuji-token');
}

export function setToken(token) {
  return localStorage.setItem('haowuji-token', token);
}


import request from '../utils/request';
import config from '../config.js';

const { APIURL } = config;

export async function query() {
    return request(`${APIURL}/users`);
}

export async function queryCurrent() {
    return request(`${APIURL}/users/current`);
}

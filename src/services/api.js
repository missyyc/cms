import { stringify } from 'qs';
import request from '../utils/request';

const APIURL = 'http://127.0.0.1:5000/api/v1';

export async function accountLogin(params) {
    return request(`${APIURL}/auth`, {
        method: 'POST',
        body: params,
    });
}

export async function fakeRegister(params) {
    return request('/api/register', {
        method: 'POST',
        body: params,
    });
}

export async function queryNotices() {
    return request('/api/notices');
}

// 对象存储========================//
export async function getUploadToken() {
    return request(`${APIURL}/qiniu/token`);
}

// 歌曲信息=======================
export async function fetchSongs() {
    return request(`${APIURL}/songs/list`);
}

export async function readSong(params) {
    return request(`${APIURL}/songs/read/${params._id}`);
}

export async function createSong(params) {
    return request(`${APIURL}/songs/create`, {
        method: 'POST',
        body: params,
    });
}

export async function updateSong(params) {
    return request(`${APIURL}/songs/update/${params._id}`, {
        method: 'PUT',
        body: params,
    });
}

export async function deleteSong(params) {
    return request(`${APIURL}/songs/${params._id}`, {
        method: 'DELETE',
    });
}

export async function deleteMultiSongs(params) {
    return request(`${APIURL}/songs/delete/multi`, {
        method: 'POST',
        body: params,
    });
}

// 专辑信息==========================
export async function fetchAlbums() {
    return request(`${APIURL}/albums/list`);
}

export async function readAlbum(params) {
    return request(`${APIURL}/albums/read/${params._id}`);
}

export async function createAlbum(params) {
    return request(`${APIURL}/albums/create`, {
        method: 'POST',
        body: params,
    });
}

export async function updateAlbum(params) {
    return request(`${APIURL}/albums/update/${params._id}`, {
        method: 'PUT',
        body: params,
    });
}

export async function deleteAlbum(params) {
    return request(`${APIURL}/albums/${params._id}`, {
        method: 'DELETE',
    });
}

export async function deleteMultiAlbums(params) {
    return request(`${APIURL}/albums/delete/multi`, {
        method: 'POST',
        body: params,
    });
}

// 歌词信息==========================
export async function fetchLyrics() {
    return request(`${APIURL}/lyrics/list`);
}

export async function readLyric(params) {
    return request(`${APIURL}/lyrics/read/${params._id}`);
}

export async function createLyric(params) {
    return request(`${APIURL}/lyrics/create`, {
        method: 'POST',
        body: params,
    });
}

export async function updateLyric(params) {
    return request(`${APIURL}/lyrics/update/${params._id}`, {
        method: 'PUT',
        body: params,
    });
}

export async function deleteLyric(params) {
    return request(`${APIURL}/lyrics/${params._id}`, {
        method: 'DELETE',
    });
}

export async function deleteMultiLyrics(params) {
    return request(`${APIURL}/lyrics/delete/multi`, {
        method: 'POST',
        body: params,
    });
}

// 标签信息==========================
export async function fetchTags() {
    return request(`${APIURL}/tags/list`);
}

export async function readTag(params) {
    return request(`${APIURL}/tags/read/${params._id}`);
}

export async function createTag(params) {
    return request(`${APIURL}/tags/create`, {
        method: 'POST',
        body: params,
    });
}

export async function updateTag(params) {
    return request(`${APIURL}/tags/update/${params._id}`, {
        method: 'PUT',
        body: params,
    });
}

export async function deleteTag(params) {
    return request(`${APIURL}/tags/${params._id}`, {
        method: 'DELETE',
    });
}

export async function deleteMultiTags(params) {
    return request(`${APIURL}/tags/delete/multi`, {
        method: 'POST',
        body: params,
    });
}

import _ from 'lodash';
import { message } from 'antd';
import {
    fetchLyrics,
    readLyric,
    createLyric,
    updateLyric,
    deleteLyric,
    deleteMultiLyrics,
} from '../services/api';

export default {
    namespace: 'lyrics',

    state: {
        list: [],
    },

    effects: {
        *list({ payload }, { call, put }) {
            const response = yield call(fetchLyrics, payload);
            yield put({
                type: 'initList',
                payload: Array.isArray(response.results) ? response.results : [],
            });
        },
        *read({ payload }, { call, put }) {
            const response = yield call(readLyric, payload);
        },
        *create({ payload }, { call, put }) {
            const response = yield call(createLyric, payload);
            message.success('创建歌词成功！');
            yield put({
                type: 'addToList',
                payload: response.result,
            });
        },
        *update({ payload }, { call, put }) {
            const response = yield call(updateLyric, payload);
            if (response) {
                message.success('更新歌词成功');
                yield put({
                    type: 'updateList',
                    payload: response.result,
                });
            }
        },
        *delete({ payload }, { call, put }) {
            const response = yield call(deleteLyric, payload);
            if (response) {
                message.success('删除歌词成功');
                yield put({
                    type: 'deleteItem',
                    payload,
                });
            }
        },
        *deleteMulti({ payload }, { call, put }) {
            const response = yield call(deleteMultiLyrics, payload);
            console.log('response================>', response);
            if (response) {
                message.success('删除歌词成功');
                yield put({
                    type: 'deleteItem',
                    payload,
                });
            }
        },
    },

    reducers: {
        initList(state, action) {
            return {
                ...state,
                list: action.payload,
            };
        },
        addToList(state, action) {
            state.list.unshift(action.payload);
            return {
                ...state,
            };
        },
        updateList(state, action) {
            const idx = _.findIndex(state.list, row => row._id === action.payload._id);
            state.list[idx] = action.payload;
            return {
                ...state,
            };
        },
        deleteItem(state, action) {
            return {
                ...state,
                list: _.pullAllWith(state.list, action.payload.ids, (obj, id) => obj._id === id),
            };
        },
    },
};

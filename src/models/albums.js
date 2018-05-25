import _ from 'lodash';
import { message } from 'antd';
import {
    fetchAlbums,
    readAlbum,
    createAlbum,
    updateAlbum,
    deleteAlbum,
    deleteMultiAlbums,
} from '../services/api';

export default {
    namespace: 'albums',

    state: {
        list: [],
    },

    effects: {
        *list({ payload }, { call, put }) {
            console.log('call list================>')
            const response = yield call(fetchAlbums, payload);
            yield put({
                type: 'initList',
                payload: Array.isArray(response.results) ? response.results : [],
            });
        },
        *read({ payload }, { call, put }) {
            const response = yield call(readAlbum, payload);
        },
        *create({ payload }, { call, put }) {
            const response = yield call(createAlbum, payload);
            message.success('创建专辑成功！');
            yield put({
                type: 'addToList',
                payload: response.result,
            });
        },
        *update({ payload }, { call, put }) {
            const response = yield call(updateAlbum, payload);
            if (response) {
                message.success('更新专辑成功');
                yield put({
                    type: 'updateList',
                    payload: response.result,
                });
            }
        },
        *delete({ payload }, { call, put }) {
            const response = yield call(deleteAlbum, payload);
            if (response) {
                message.success('删除专辑成功');
                yield put({
                    type: 'deleteItem',
                    payload,
                });
            }
        },
        *deleteMulti({ payload }, { call, put }) {
            const response = yield call(deleteMultiAlbums, payload);
            if (response) {
                message.success('删除专辑成功');
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

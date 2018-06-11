import _ from 'lodash';
import { message } from 'antd';
import {
    fetchAudios,
    readAudio,
    createAudio,
    updateAudio,
    deleteAudio,
    deleteMultiAudios,
    createBatchAudios,
} from '../services/api';

export default {
    namespace: 'audios',

    state: {
        list: [],
    },

    effects: {
        *list({ payload }, { call, put }) {
            const response = yield call(fetchAudios, payload);
            yield put({
                type: 'initList',
                payload: Array.isArray(response.results) ? response.results : [],
            });
        },
        *read({ payload }, { call, put }) {
            const response = yield call(readAudio, payload);
        },
        *create({ payload }, { call, put }) {
            const response = yield call(createAudio, payload);
            message.success('创建歌曲成功！');
            yield put({
                type: 'list',
                payload,
            })
            // yield put({
            //     type: 'addToList',
            //     payload: response.result,
            // });
        },
        *createBatch({ payload }, { call, put }) {
            const reponse = yield call(createBatchAudios, payload)
            message.success('创建多个歌曲成功');
            yield put({
                type: 'list',
                payload,
            })
        },
        *update({ payload }, { call, put }) {
            const response = yield call(updateAudio, payload);
            if (response) {
                message.success('更新歌曲成功');
                yield put({
                    type: 'list',
                    payload,
                })
                // yield put({
                //     type: 'updateList',
                //     payload: response.result,
                // });
            }
        },
        *delete({ payload }, { call, put }) {
            const response = yield call(deleteAudio, payload);
            if (response) {
                message.success('删除歌曲成功');
                yield put({
                    type: 'deleteItem',
                    payload,
                });
            }
        },
        *deleteMulti({ payload }, { call, put }) {
            const response = yield call(deleteMultiAudios, payload);
            if (response) {
                message.success('删除歌曲成功');
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

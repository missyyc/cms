import { message } from 'antd';
import { getUploadToken } from '../services/api';

export default {
    namespace: 'qiniu',

    state: {
        token: '',
        domain: '',
    },

    effects: {
        *token({ payload }, { call, put }) {
            const response = yield call(getUploadToken, payload);
            yield put({
                type: 'putToken',
                payload: response,
            });
        },
    },

    reducers: {
        putToken(state, action) {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
};

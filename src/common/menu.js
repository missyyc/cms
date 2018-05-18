import { isUrl } from '../utils/utils';

const menuData = [
    {
        name: '账户',
        icon: 'user',
        path: 'user',
        authority: 'guest',
        children: [
            {
                name: '登录',
                path: 'login',
            },
            {
                name: '注册',
                path: 'register',
            },
            {
                name: '注册结果',
                path: 'register-result',
            },
        ],
    },
    {
        name: '音频管理',
        icon: 'heart-o',
        path: 'audios',
        authority: 'admin',
    },
    {
        name: '专辑管理',
        icon: 'heart-o',
        path: 'albums',
        authority: 'admin',
    },
    {
        name: '标签管理',
        icon: 'heart-o',
        path: 'tags',
        authority: 'admin',
    },
    {
        name: '歌词管理',
        icon: 'heart-o',
        path: 'lyrics',
        authority: 'admin',
    },
];

function formatter(data, parentPath = '/', parentAuthority) {
    return data.map(item => {
        let { path } = item;
        if (!isUrl(path)) {
            path = parentPath + item.path;
        }
        const result = {
            ...item,
            path,
            authority: item.authority || parentAuthority,
        };
        if (item.children) {
            result.children = formatter(
                item.children,
                `${parentPath}${item.path}/`,
                item.authority
            );
        }
        return result;
    });
}

export const getMenuData = () => formatter(menuData);

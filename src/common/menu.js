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
        name: '歌曲管理',
        icon: 'heart-o',
        path: 'songs',
    },
    {
        name: '专辑管理',
        icon: 'heart-o',
        path: 'albums',
    },
    {
        name: '标签管理',
        icon: 'heart-o',
        path: 'tags',
    },
    {
        name: '歌词管理',
        icon: 'heart-o',
        path: 'lyrics',
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

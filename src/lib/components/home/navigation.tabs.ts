export interface TabDefinition {
    name: string;
    path: string;
    icon: string;
    default: boolean;
};

const home: TabDefinition = {
    name: 'Organization',
    path: `/users/userId/home`,
    icon: 'material-symbols:dashboard-outline-rounded',
    default: true,
};

const careplan: TabDefinition = {
    name: 'Provide hours',
    path: `/users/userId/careplan`,
    icon: 'material-symbols:add-notes-outline-rounded',
    default: true,
};

// const notifications: TabDefinition = {
//     name: 'Notifications',
//     path: `/users/userId/notifications`,
//     icon: 'mdi:bell',
//     default: false,
// };

export const sidebarMenu = () => {
   
    const menus = [
        home,
        careplan,
        // notifications
    ];
    return replaceUserId(menus);
};

const replaceUserId = (menus: TabDefinition[]) => {
    return menus.map(x => {
        return {
            name: x.name,
            path: x.path.replace('userId','123'),
            icon: x.icon,
            default: x.default,
        };
    });
};


export interface TabDefinition {
    name: string;
    path: string;
    default: boolean;
};

const home: TabDefinition = {
    name: 'Home',
    path: `/users/userId/home`,
    default: true,
};

const drugs: TabDefinition = {
    name: 'Drugs',
    path: `/users/userId/drugs`,
    default: false,
};

const labRecordTypes: TabDefinition = {
    name: 'Lab-Record-Types',
    path: `/users/userId/lab-record-types`,
    default: false,
};

const personRoleTypes: TabDefinition = {
    name: 'Person-Role-Types',
    path: `/users/userId/person-role-types`,
    default: false,
};

const assessmentTemplates: TabDefinition = {
    name: 'Assessment-Templates',
    path: `/users/userId/assessment-templates`,
    default: false,
};

const apiClients: TabDefinition = {
    name: 'Clients',
    path: `/users/userId/api-clients`,
    default: false,
};

const organizations: TabDefinition = {
    name: 'Organizations',
    path: `/users/userId/organizations`,
    default: false,
};

const notices: TabDefinition = {
    name: 'Notices',
    path: `/users/userId/notices`,
    default: false,
};

const goals: TabDefinition = {
    name: 'Goal-Types',
    path: `/users/userId/goals`,
    default: false,
};

const newsFeeds: TabDefinition = {
    name: 'Newsfeeds',
    path: `/users/userId/newsfeeds`,
    default: false,
};

const knowledgeNuggets: TabDefinition = {
    name: 'Knowledge-Nuggets',
    path: `/users/userId/knowledge-nuggets`,
    default: false,
};

const learningJourneys: TabDefinition = {
    name: 'Learning-Journeys',
    path: `/users/userId/learning-journeys`,
    default: false,
};

const priorities: TabDefinition = {
    name: 'Priority-Types',
    path: `/users/userId/priorities`,
    default: false,
};

const notifications: TabDefinition = {
    name: 'Notifications',
    path: `/users/userId/notifications`,
    default: false,
};

const symptoms: TabDefinition = {
    name: 'Symptoms',
    path: `/users/userId/symptoms`,
    default: false,
};

const courses: TabDefinition = {
    name: 'Courses',
    path: `/users/userId/courses`,
    default: false,
};

const general: TabDefinition = {
    name: 'General',
    path: `/users/userId/home`,
    default: true,
};

const users: TabDefinition = {
    name: 'Users',
    path: `/users/userId/home/users-stats`,
    default: false,
};

const rhg: TabDefinition = {
    name: 'RHG',
    path: `/users/userId/home/users-stats`,
    default: false,
};

const bot: TabDefinition = {
    name: 'Bot',
    path: `/users/userId/home`,
    default: false,
};

export const navbarMenu = (userId) => {
    const menus = [
            home,
            apiClients,
            organizations,
            notifications,
    ];
    return replaceUserId(menus, userId);
};

export const sidebarMenu = (userId) => {
    const menus = [
        home,
        drugs,
        assessmentTemplates,
        notices,
        newsFeeds,
        goals,
        courses,
        learningJourneys,
        knowledgeNuggets,
        labRecordTypes,
        personRoleTypes,
        priorities,
        symptoms
    ];
    return replaceUserId(menus, userId);
};

export const dashboardMenu = (userId) => {
    const menus = [
        general,
        users,
        rhg,
        bot
    ];
    return replaceUserId(menus, userId);
};


const replaceUserId = (menus, userId) => {
    return menus.map(x => {
        return {
            name: x.name,
            path: x.path.replace('userId', userId),
            default: x.default,
        };
    });
};

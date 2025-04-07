import type { FeatureOptions } from '$lib/system.types';
import { getFeatureOptions } from '$lib/options/options.selector';
import type { SidebarMenu, NavigationMenu, TenantSettings } from './sidebar.types';

///////////////////////////////////////////////////////////////////////////////

//TODO: Remove feature-options based filtering.
//TODO: Move FeatureOptions to Tenant Settings for AHA and Sneha also.
//TODO: Remove this comment after above TODOs are done.

///////////////////////////////////////////////////////////////////////////////

const isSettingEnabled = (menuName: string, tenantSettings: TenantSettings) => {
	if (menuName === 'Settings') {
		return true;
	}
	if (menuName === 'Analysis') {
		if (tenantSettings.Common.Analysis.CustomQueries || tenantSettings.Common.Analysis.Quicksight) {
			return true;
		}
		return false;
	}
	if (menuName === 'Clinical') {
		if (
			tenantSettings.Common.Clinical.Assessments ||
			tenantSettings.Common.Clinical.LabRecords ||
			tenantSettings.Common.Clinical.Symptoms ||
			tenantSettings.Common.Clinical.DrugsManagement
		) {
			return true;
		}
		return false;
	}
	if (menuName === 'Assessments') {
		if (tenantSettings.Common.Clinical.Assessments) {
			return true;
		}
		return false;
	}
	if (menuName === 'Lab-Records') {
		if (tenantSettings.Common.Clinical.LabRecords) {
			return true;
		}
		return false;
	}
	if (menuName === 'Symptoms') {
		if (tenantSettings.Common.Clinical.Symptoms) {
			return true;
		}
		return false;
	}
	if (menuName === 'Drugs') {
		if (tenantSettings.Common.Clinical.DrugsManagement) {
			return true;
		}
		return false;
	}
	if (
		menuName === 'Careplan' ||
		menuName === 'Careplan-Dashboard' ||
		menuName === 'Careplan-Assets' ||
		menuName === 'Careplan-Plans' ||
		menuName === 'Careplan-Enrollments'
	) {
		if (tenantSettings.Common.Clinical.Careplans) {
			return true;
		}
		return false;
	}
	if (menuName === 'Assessments') {
		if (tenantSettings.Common.Clinical.Assessments) {
			return true;
		}
		return false;
	}
	if (
		menuName === 'Hospital-Systems' ||
		menuName === 'Hospitals' ||
		menuName === 'Health-Systems'
	) {
		if (tenantSettings.Common.AddOns.HospitalSystems) {
			return true;
		}
		return false;
	}
	if (
		menuName === 'Gamification' ||
		menuName === 'Gamification-Event-Types' ||
		menuName === 'Gamification-Badge-Categories' ||
		menuName === 'Gamification-Badges' ||
		menuName === 'Gamification-Schemas'
	) {
		if (tenantSettings.Common.AddOns.Gamification) {
			return true;
		}
		return false;
	}
	if (
		menuName === 'Educational' ||
		menuName === 'Courses' ||
		menuName === 'Learning-Journeys' ||
		menuName === 'Knowledge-Nuggets'
	) {
		if (tenantSettings.Common.AddOns.LearningJourney) {
			return true;
		}
		return false;
	}
	if (menuName === 'Types' || menuName === 'Priorities' || menuName === 'Goals') {
		if (tenantSettings.PatientApp) {
			return true;
		}
		return false;
	}
	if (menuName === 'Add-ons') {
		if (
			tenantSettings.Common.AddOns.Organizations ||
			tenantSettings.Common.AddOns.Cohorts ||
			tenantSettings.Common.AddOns.Notifications ||
			tenantSettings.Common.AddOns.Notices ||
			tenantSettings.Common.AddOns.Newsfeeds
		) {
			return true;
		}
		return false;
	}
	if (menuName === 'Organizations') {
		if (tenantSettings.Common.AddOns.Organizations) {
			return true;
		}
		return false;
	}
	if (menuName === 'Cohorts') {
		if (tenantSettings.Common.AddOns.Cohorts) {
			return true;
		}
		return false;
	}
	if (menuName === 'Notifications') {
		if (tenantSettings.Common.AddOns.Notifications) {
			return true;
		}
		return false;
	}
	if (menuName === 'Notices') {
		if (tenantSettings.Common.AddOns.Notices) {
			return true;
		}
		return false;
	}
	if (menuName === 'Newsfeeds') {
		if (tenantSettings.Common.AddOns.Newsfeeds) {
			return true;
		}
		return false;
	}
	if (menuName === 'Custom-Queries') {
		if (tenantSettings.Common.Analysis.CustomQueries) {
			return true;
		}
		return false;
	}

	return true;
};

const hasRolePermission = (menuName: string, userRole: string) => {
	if (
		menuName === 'Clients' ||
		menuName === 'Tenants' ||
		menuName === 'Person-Role' ||
		menuName === 'User Management'
	) {
		if (userRole === 'System admin' || userRole === 'System user') {
			return true;
		}
		return false;
	}

	if (menuName === 'Clients' || menuName === 'Tenants') {
		if (userRole === 'System admin' || userRole === 'System user') {
			return true;
		}
		return false;
	}

	if (menuName === 'Settings') {
		if (userRole === 'System admin' || userRole === 'Tenant admin') {
			return true;
		}
		return false;
	}

	if (menuName === 'User-Management') {
		if (userRole === 'System admin' || userRole === 'Tenant admin') {
			return true;
		}
		return false;
	}
	if (menuName === 'Administration') {
		if (userRole === 'System admin' || userRole === 'Tenant admin') {
			return true;
		}
		return false;
	}

	return true;
};

const shouldAdd = (
	menu: SidebarMenu,
	userRole: string,
	tenantSettings,
	options: FeatureOptions[]
) => {
	const settingEnabled = isSettingEnabled(menu.name, tenantSettings);
	if (!settingEnabled) {
		return null;
	}
	const hasPermission = hasRolePermission(menu.name, userRole);
	if (!hasPermission) {
		return null;
	}
	const featureOption = options.find((option) => option.Name === menu.name);
	const isEnabled = featureOption && featureOption.Enabled;
	if (!isEnabled) {
		return null;
	}
	return true;
};

const getMenu = (menuList, menuName) => {
	const menu = menuList.find((menu) => menu.name === menuName);
	return menu;
};

const toNavigation = (
	menu: SidebarMenu,
	userRole: string,
	tenantSettings,
	options: FeatureOptions[]
) => {
	const shouldAddMenu = shouldAdd(menu, userRole, tenantSettings, options);
	if (!shouldAddMenu) {
		return null;
	}
	const navigation: NavigationMenu = {
		title: menu.title,
		icon: menu.icon
	};
	if (menu.link) {
		navigation['link'] = menu.link;
	}
	if (menu.children.length > 0) {
		navigation['childNav'] = [];
		for (const child of menu.children) {
			const childNavigation = toNavigation(child, userRole, tenantSettings, options);
			if (childNavigation) {
				navigation['childNav'].push(childNavigation);
			}
		}
	}
	return navigation;
};

export const buildSidebarMenu = (
	userId: string,
	tenantSettings: any,
	userRole: string
): NavigationMenu[] => {
	const options: FeatureOptions = getFeatureOptions();

	let sidebarNaviagation: NavigationMenu[] = [];

	sidebarNaviagation = addMainDashboardMenu(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addAdministrationMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addTenantSettingsMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addAnalysisMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addHospitalSystemsMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addClinicalMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addCareplanMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addEducationalMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addTypesMenus(sidebarNaviagation, userId, userRole, tenantSettings, options);
	sidebarNaviagation = addMiscellaneousMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addMainAnalyticsMenu(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addGamificationMenus(
		sidebarNaviagation,
		userId,
		userRole,
		tenantSettings,
		options
	);
	sidebarNaviagation = addGMUMenus(sidebarNaviagation, userId, userRole, tenantSettings, options);
	// Add here any new menu items

	console.log('sidebarMenu', sidebarNaviagation);

	return sidebarNaviagation;
};

function addMainAnalyticsMenu(
	sidebarNaviagation: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const analytics: SidebarMenu = {
		name: 'Main-Analytics',
		title: 'Analytics',
		icon: 'pixel:analytics-solid',
		link: `/users/${userId}/analytics`,
		children: []
	};
	menuList.push(analytics);

	const mainAnalytics: SidebarMenu = getMenu(menuList, 'Main-Analytics');

	const mainAnalyticsNavigation: NavigationMenu | null = toNavigation(
		mainAnalytics,
		userRole,
		tenantSettings,
		options
	);
	if (mainAnalyticsNavigation) {
		sidebarNaviagation.push(mainAnalyticsNavigation);
	}
	return sidebarNaviagation;
}

function addMainDashboardMenu(
	sidebarNaviagation: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];
	const dashbord: SidebarMenu = {
		name: 'Main-Dashboard',
		title: 'Dashboard',
		icon: 'material-symbols:dashboard-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(dashbord);

	const rhg: SidebarMenu = {
		name: 'Main-Home',
		title: 'Home',
		icon: 'material-symbols:home-outline-rounded',
		link: `/users/${userId}/home`,
		children: []
	};
	menuList.push(rhg);

	const mainDashboard: SidebarMenu = getMenu(menuList, 'Main-Dashboard');
	const mainHome: SidebarMenu = getMenu(menuList, 'Main-Home');
	mainDashboard?.children.push(mainHome);

	const mainDashboardNavigation: NavigationMenu | null = toNavigation(
		mainDashboard,
		userRole,
		tenantSettings,
		options
	);
	if (mainDashboardNavigation) {
		sidebarNaviagation.push(mainDashboardNavigation);
	}
	return sidebarNaviagation;
}

function addAdministrationMenus(
	sidebarNaviagation: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const administration: SidebarMenu = {
		name: 'Administration',
		title: 'Administration',
		icon: 'material-symbols:shield-person-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(administration);

	const client: SidebarMenu = {
		name: 'Clients',
		title: 'Clients',
		icon: 'material-symbols:frame-person-outline-rounded',
		link: `/users/${userId}/api-clients`,
		children: []
	};
	menuList.push(client);

	const tenant: SidebarMenu = {
		name: 'Tenants',
		title: 'Tenants',
		icon: 'material-symbols:tenancy-outline',
		link: `/users/${userId}/tenants`,
		children: []
	};
	menuList.push(tenant);

	const personRoleMenu: SidebarMenu = {
		name: 'Person-Role',
		title: 'User Roles',
		icon: 'material-symbols:person-search-outline-rounded',
		link: `/users/${userId}/user-roles`,
		children: []
	};
	menuList.push(personRoleMenu);

	const usersMenu: SidebarMenu = {
		name: 'Users',
		title: 'Users',
		icon: 'material-symbols:group-outline-rounded',
		link: `/users/${userId}/users`,
		children: []
	};
	menuList.push(usersMenu);

	const userManagementMenu: SidebarMenu = {
		name: 'User-Managment',
		title: 'User Management',
		icon: 'material-symbols:manage_accounts',
		link: `/users/${userId}/user-management`,
		children: []
	};
	menuList.push(userManagementMenu);

	const administration_: SidebarMenu = getMenu(menuList, 'Administration');
	const clients: SidebarMenu = getMenu(menuList, 'Clients');
	const tenants: SidebarMenu = getMenu(menuList, 'Tenants');
	const personRole: SidebarMenu = getMenu(menuList, 'Person-Role');
	const userManagement: SidebarMenu = getMenu(menuList, 'User-Managment');
	const users: SidebarMenu = getMenu(menuList, 'Users');
	administration_?.children.push(clients);
	administration_?.children.push(tenants);
	administration_?.children.push(personRole);
	administration_?.children.push(userManagement);
	administration_?.children.push(users);

	const administrationNavigation: NavigationMenu | null = toNavigation(
		administration_,
		userRole,
		tenantSettings,
		options
	);
	if (administrationNavigation) {
		sidebarNaviagation.push(administrationNavigation);
	}

	return sidebarNaviagation;
}

function addTenantSettingsMenus(
	sidebarNaviagation: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const tenantSettingsMenu: SidebarMenu = {
		name: 'Settings',
		title: 'Settings',
		icon: 'material-symbols:settings-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(tenantSettingsMenu);

	const tenantSettings_: SidebarMenu = getMenu(menuList, 'Settings');
	const tenantSettingsNavigation: NavigationMenu | null = toNavigation(
		tenantSettings_,
		userRole,
		tenantSettings,
		options
	);
	if (tenantSettingsNavigation) {
		sidebarNaviagation.push(tenantSettingsNavigation);
	}

	return sidebarNaviagation;
}

function addAnalysisMenus(
	sidebarNaviagation: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const analysis: SidebarMenu = {
		name: 'Analysis',
		title: 'Analysis',
		icon: 'material-symbols:analytics-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(analysis);

	const customQuery: SidebarMenu = {
		name: 'Custom-Queries',
		title: 'Custom Queries',
		icon: 'material-symbols:database-outline',
		link: `/users/${userId}/custom-queries`,
		children: []
	};
	menuList.push(customQuery);

	const quicksightDashboard: SidebarMenu = {
		name: 'Quicksight-Dashboard',
		title: 'Quicksight Dashboard',
		icon: 'material-symbols:monitoring',
		link: `/users/${userId}/quicksight-dashboards`,
		children: []
	};
	menuList.push(quicksightDashboard);

	const analysis_: SidebarMenu = getMenu(menuList, 'Analysis');
	const customQueries_: SidebarMenu = getMenu(menuList, 'Custom-Queries');
	const quicksightDashboard_: SidebarMenu = getMenu(menuList, 'Quicksight-Dashboard');
	analysis_?.children.push(customQueries_);
	analysis_?.children.push(quicksightDashboard_);

	const analysisNavigation: NavigationMenu | null = toNavigation(
		analysis_,
		userRole,
		tenantSettings,
		options
	);
	if (analysisNavigation) {
		sidebarNaviagation.push(analysisNavigation);
	}

	return sidebarNaviagation;
}

function addHospitalSystemsMenus(
	sidebarNaviagation: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const hospitalSystems: SidebarMenu = {
		name: 'Hospital-Systems',
		title: 'Hospital Systems',
		icon: 'material-symbols:account-tree-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(hospitalSystems);

	const hospitals: SidebarMenu = {
		name: 'Hospitals',
		title: 'Hospitals',
		icon: 'material-symbols:local-hospital-outline-rounded',
		link: `/users/${userId}/hospitals`,
		children: []
	};
	menuList.push(hospitals);

	const healthSystems: SidebarMenu = {
		name: 'Health-Systems',
		title: 'Health Systems',
		icon: 'material-symbols:health-and-safety-outline-rounded',
		link: `/users/${userId}/health-systems`,
		children: []
	};
	menuList.push(healthSystems);

	const hospitalSystems_: SidebarMenu = getMenu(menuList, 'Hospital-Systems');
	const hospitals_: SidebarMenu = getMenu(menuList, 'Hospitals');
	const healthSystems_: SidebarMenu = getMenu(menuList, 'Health-Systems');
	hospitalSystems_?.children.push(hospitals_);
	hospitalSystems_?.children.push(healthSystems_);

	const hospitalSystemsNavigation: NavigationMenu | null = toNavigation(
		hospitalSystems_,
		userRole,
		tenantSettings,
		options
	);
	if (hospitalSystemsNavigation) {
		sidebarNaviagation.push(hospitalSystemsNavigation);
	}

	return sidebarNaviagation;
}

function addClinicalMenus(
	sidebarMenu: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const clinical: SidebarMenu = {
		name: 'Clinical',
		title: 'Clinical',
		icon: 'material-symbols:medical-services-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(clinical);

	const assessment: SidebarMenu = {
		name: 'Assessments',
		title: 'Assessments',
		icon: 'material-symbols:assignment-outline-rounded',
		link: `/users/${userId}/assessment-templates`,
		children: []
	};
	menuList.push(assessment);

	const labRecordType: SidebarMenu = {
		name: 'Lab-Records',
		title: 'Lab Records',
		icon: 'material-symbols:lab-research-outline-rounded',
		link: `/users/${userId}/lab-records`,
		children: []
	};
	menuList.push(labRecordType);

	const symptom: SidebarMenu = {
		name: 'Symptoms',
		title: 'Symptoms',
		icon: 'material-symbols:symptoms-outline',
		link: `/users/${userId}/symptoms`,
		children: []
	};
	menuList.push(symptom);

	const drug: SidebarMenu = {
		name: 'Drugs',
		title: 'Drugs',
		icon: 'material-symbols:pill-outline',
		link: `/users/${userId}/drugs`,
		children: []
	};
	menuList.push(drug);

	const clinical_: SidebarMenu = getMenu(menuList, 'Clinical');
	const assessments: SidebarMenu = getMenu(menuList, 'Assessments');
	const labRecords: SidebarMenu = getMenu(menuList, 'Lab-Records');
	const symptoms: SidebarMenu = getMenu(menuList, 'Symptoms');
	const drugs: SidebarMenu = getMenu(menuList, 'Drugs');
	clinical?.children.push(assessments);
	clinical?.children.push(labRecords);
	clinical?.children.push(symptoms);
	clinical?.children.push(drugs);

	const clinicalNavigation: NavigationMenu | null = toNavigation(
		clinical_,
		userRole,
		tenantSettings,
		options
	);
	if (clinicalNavigation) {
		sidebarMenu.push(clinicalNavigation);
	}

	return sidebarMenu;
}

function addCareplanMenus(
	sidebarMenu: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const careplan: SidebarMenu = {
		name: 'Careplan',
		title: 'Careplan',
		icon: 'material-symbols:home-health-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(careplan);

	const careplanDashboard: SidebarMenu = {
		name: 'Careplan-Dashboard',
		title: 'Dashboard',
		icon: 'material-symbols:dashboard-outline-rounded',
		link: `/users/${userId}/careplan`,
		children: []
	};
	menuList.push(careplanDashboard);

	const careplanAssets: SidebarMenu = {
		name: 'Careplan-Assets',
		title: 'Assets',
		icon: 'carbon:task-asset-view',
		link: `/users/${userId}/careplan/assets`,
		children: []
	};
	menuList.push(careplanAssets);

	const careplanPlans: SidebarMenu = {
		name: 'Careplan-Plans',
		title: 'Careplans',
		icon: 'iconoir:healthcare',
		link: `/users/${userId}/careplan/careplans`,
		children: []
	};
	menuList.push(careplanPlans);

	const careplanEnrollments: SidebarMenu = {
		name: 'Careplan-Enrollments',
		title: 'Enrollments',
		icon: 'material-symbols:check-box-outline-rounded',
		link: `/users/${userId}/careplan/enrollments`,
		children: []
	};
	menuList.push(careplanEnrollments);

	const careplan_: SidebarMenu = getMenu(menuList, 'Careplan');
	const careplanDashboards: SidebarMenu = getMenu(menuList, 'Careplan-Dashboard');
	const careplanAssets_: SidebarMenu = getMenu(menuList, 'Careplan-Assets');
	const careplanPlans_: SidebarMenu = getMenu(menuList, 'Careplan-Plans');
	const careplanEnrollments_: SidebarMenu = getMenu(menuList, 'Careplan-Enrollments');
	careplan_?.children.push(careplanDashboards);
	careplan_?.children.push(careplanAssets_);
	careplan_?.children.push(careplanPlans_);
	careplan_?.children.push(careplanEnrollments_);

	const careplanNavigation: NavigationMenu | null = toNavigation(
		careplan_,
		userRole,
		tenantSettings,
		options
	);
	if (careplanNavigation) {
		sidebarMenu.push(careplanNavigation);
	}

	return sidebarMenu;
}

function addEducationalMenus(
	sidebarMenu: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const educational: SidebarMenu = {
		name: 'Educational',
		title: 'Educational',
		icon: 'material-symbols:school-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(educational);

	const courses: SidebarMenu = {
		name: 'Courses',
		title: 'Courses',
		icon: 'material-symbols:abc-rounded',
		link: `/users/${userId}/courses`,
		children: []
	};
	menuList.push(courses);

	const learningJourneys: SidebarMenu = {
		name: 'Learning-Journeys',
		title: 'Learning Journeys',
		icon: 'material-symbols:local-library-outline-rounded',
		link: `/users/${userId}/learning-journeys`,
		children: []
	};
	menuList.push(learningJourneys);

	const knowledgeNuggets: SidebarMenu = {
		name: 'Knowledge-Nuggets',
		title: 'Knowledge Nuggets',
		icon: 'material-symbols:assignment-add-outline-rounded',
		link: `/users/${userId}/knowledge-nuggets`,
		children: []
	};
	menuList.push(knowledgeNuggets);

	const educational_: SidebarMenu = getMenu(menuList, 'Educational');
	const courses_: SidebarMenu = getMenu(menuList, 'Courses');
	const learningJourneys_: SidebarMenu = getMenu(menuList, 'Learning-Journeys');
	const knowledgeNuggets_: SidebarMenu = getMenu(menuList, 'Knowledge-Nuggets');
	educational_?.children.push(courses_);
	educational_?.children.push(learningJourneys_);
	educational_?.children.push(knowledgeNuggets_);

	const educationalNavigation: NavigationMenu | null = toNavigation(
		educational_,
		userRole,
		tenantSettings,
		options
	);
	if (educationalNavigation) {
		sidebarMenu.push(educationalNavigation);
	}

	return sidebarMenu;
}

function addTypesMenus(
	sidebarMenu: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const types: SidebarMenu = {
		name: 'Types',
		title: 'Types',
		icon: 'material-symbols:account-tree-outline-rounded',
		link: null,
		children: []
	};
	menuList.push(types);

	const priorities: SidebarMenu = {
		name: 'Priorities',
		title: 'Priorities',
		icon: 'material-symbols:priority-outline',
		link: `/users/${userId}/priorities`,
		children: []
	};
	menuList.push(priorities);

	const goals: SidebarMenu = {
		name: 'Goals',
		title: 'Goals',
		icon: 'material-symbols:radar',
		link: `/users/${userId}/goals`,
		children: []
	};
	menuList.push(goals);

	const types_: SidebarMenu = getMenu(menuList, 'Types');
	const priorities_: SidebarMenu = getMenu(menuList, 'Priorities');
	const goals_: SidebarMenu = getMenu(menuList, 'Goals');
	types_?.children.push(priorities_);
	types_?.children.push(goals_);

	const typesNavigation: NavigationMenu | null = toNavigation(
		types_,
		userRole,
		tenantSettings,
		options
	);
	if (typesNavigation) {
		sidebarMenu.push(typesNavigation);
	}

	return sidebarMenu;
}

function addMiscellaneousMenus(
	sidebarMenu: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const addOns: SidebarMenu = {
		name: 'Add-ons',
		title: 'Add-ons',
		icon: 'material-symbols:home-max-dots-outline',
		link: null,
		children: []
	};
	menuList.push(addOns);

	const organizations: SidebarMenu = {
		name: 'Organizations',
		title: 'Organizations',
		icon: 'material-symbols:corporate-fare-rounded',
		link: `/users/${userId}/organizations`,
		children: []
	};
	menuList.push(organizations);

	const cohorts: SidebarMenu = {
		name: 'Cohorts',
		title: 'Cohorts',
		icon: 'material-symbols:groups-outline',
		link: `/users/${userId}/cohorts`,
		children: []
	};
	menuList.push(cohorts);

	const notifications: SidebarMenu = {
		name: 'Notifications',
		title: 'Notifications',
		icon: 'material-symbols:notifications-outline-rounded',
		link: `/users/${userId}/notifications`,
		children: []
	};
	menuList.push(notifications);

	const notices: SidebarMenu = {
		name: 'Notices',
		title: 'Notices',
		icon: 'material-symbols:release-alert-outline-rounded',
		link: `/users/${userId}/notices`,
		children: []
	};
	menuList.push(notices);

	const newsfeeds: SidebarMenu = {
		name: 'Newsfeeds',
		title: 'News Feeds',
		icon: 'material-symbols:newsmode-outline-rounded',
		link: `/users/${userId}/newsfeeds`,
		children: []
	};
	menuList.push(newsfeeds);

	const addons_: SidebarMenu = getMenu(menuList, 'Add-ons');
	const organizations_: SidebarMenu = getMenu(menuList, 'Organizations');
	const cohorts_: SidebarMenu = getMenu(menuList, 'Cohorts');
	const notifications_: SidebarMenu = getMenu(menuList, 'Notifications');
	const notices_: SidebarMenu = getMenu(menuList, 'Notices');
	const newsfeeds_: SidebarMenu = getMenu(menuList, 'Newsfeeds');
	addons_?.children.push(organizations_);
	addons_?.children.push(cohorts_);
	addons_?.children.push(notifications_);
	addons_?.children.push(notices_);
	addons_?.children.push(newsfeeds_);

	const miscellaneousNavigation: NavigationMenu | null = toNavigation(
		addons_,
		userRole,
		tenantSettings,
		options
	);
	if (miscellaneousNavigation) {
		sidebarMenu.push(miscellaneousNavigation);
	}

	return sidebarMenu;
}

function addGamificationMenus(
	sidebarMenu: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const gamification: SidebarMenu = {
		name: 'Gamification',
		title: 'Gamification',
		icon: 'simple-icons:gamedeveloper',
		link: null,
		children: []
	};
	menuList.push(gamification);

	const eventTypes: SidebarMenu = {
		name: 'Gamification-Event-Types',
		title: 'Event Types',
		icon: 'mdi:event-edit',
		link: `/users/${userId}/gamification/event-types`,
		children: []
	};
	menuList.push(eventTypes);

	const badgeCategories: SidebarMenu = {
		name: 'Gamification-Badge-Categories',
		title: 'Badge Categories',
		icon: 'octicon:id-badge-16',
		link: `/users/${userId}/gamification/badge-categories`,
		children: []
	};
	menuList.push(badgeCategories);

	const badges: SidebarMenu = {
		name: 'Gamification-Badges',
		title: 'Badges',
		icon: 'cil:badge',
		link: `/users/${userId}/gamification/badges`,
		children: []
	};
	menuList.push(badges);

	const schemas: SidebarMenu = {
		name: 'Gamification-Schemas',
		title: 'Schemas',
		icon: 'ic:outline-schema',
		link: `/users/${userId}/gamification/schemas`,
		children: []
	};
	menuList.push(schemas);

	const gamification_: SidebarMenu = getMenu(menuList, 'Gamification');
	const eventTypes_: SidebarMenu = getMenu(menuList, 'Gamification-Event-Types');
	const badgeCategories_: SidebarMenu = getMenu(menuList, 'Gamification-Badge-Categories');
	const badges_: SidebarMenu = getMenu(menuList, 'Gamification-Badges');
	const schemas_: SidebarMenu = getMenu(menuList, 'Gamification-Schemas');
	gamification_?.children.push(eventTypes_);
	gamification_?.children.push(badgeCategories_);
	gamification_?.children.push(badges_);
	gamification_?.children.push(schemas_);

	const gamificationNavigation: NavigationMenu | null = toNavigation(
		gamification_,
		userRole,
		tenantSettings,
		options
	);
	if (gamificationNavigation) {
		sidebarMenu.push(gamificationNavigation);
	}

	return sidebarMenu;
}

function addGMUMenus(
	sidebarMenu: NavigationMenu[],
	userId: string,
	userRole: string,
	tenantSettings: any,
	options: FeatureOptions
): NavigationMenu[] {
	const menuList: SidebarMenu[] = [];

	const gmu: SidebarMenu = {
		name: 'GMU',
		title: 'Appointment Follow-Up',
		icon: 'simple-icons:gamedeveloper',
		link: null,
		children: []
	};
	menuList.push(gmu);

	const pdfUpload: SidebarMenu = {
		name: 'Appointment-pdf-Upload',
		title: 'Set-Reminders',
		icon: 'mdi:event-edit',
		link: `/users/${userId}/appointment-followup/set-reminders`,
		children: []
	};
	menuList.push(pdfUpload);

	const statusReport: SidebarMenu = {
		name: 'Appointment-Status-Report',
		title: 'Status Report',
		icon: 'octicon:id-badge-16',
		link: `/users/${userId}/appointment-followup/summary-uploads`,
		children: []
	};
	menuList.push(statusReport);

	const gmu_: SidebarMenu = getMenu(menuList, 'GMU');
	const pdfUpload_: SidebarMenu = getMenu(menuList, 'Appointment-pdf-Upload');
	const statusReport_: SidebarMenu = getMenu(menuList, 'Appointment-Status-Report');

	gmu_?.children.push(pdfUpload_);
	gmu_?.children.push(statusReport_);
	// gamification_?.children.push(badges_);
	// gamification_?.children.push(schemas_);

	const gmuNavigation: NavigationMenu | null = toNavigation(
		gmu_,
		userRole,
		tenantSettings,
		options
	);
	if (gmuNavigation) {
		sidebarMenu.push(gmuNavigation);
	}

	return sidebarMenu;
}

///////////////////////////////////////////////////////////////////////////////

import { SYSTEM_ADMIN_PERMISSIONS, ROLES, TENANT_ADMIN_PERMISSIONS } from './roles';

export const rolePermissions = {
	[ROLES.SystemAdmin]: [
		SYSTEM_ADMIN_PERMISSIONS.ClientApps,
		SYSTEM_ADMIN_PERMISSIONS.Tenants,
		SYSTEM_ADMIN_PERMISSIONS.Device,
		SYSTEM_ADMIN_PERMISSIONS.DeviceFirmware,
		SYSTEM_ADMIN_PERMISSIONS.Revenue,
		SYSTEM_ADMIN_PERMISSIONS.Notifications,
		SYSTEM_ADMIN_PERMISSIONS.Subscriptions,
		SYSTEM_ADMIN_PERMISSIONS.InternalAppUsers,
		SYSTEM_ADMIN_PERMISSIONS.TechnicalSupport,
		SYSTEM_ADMIN_PERMISSIONS.Payments,
		SYSTEM_ADMIN_PERMISSIONS.Settings,
		SYSTEM_ADMIN_PERMISSIONS.PerformanceMonitoring
	],
	[ROLES.FirmwareDeveloper]: [SYSTEM_ADMIN_PERMISSIONS.DeviceFirmware],
	[ROLES.InternalClientAppOwner]: [
		SYSTEM_ADMIN_PERMISSIONS.InternalAppUsers,
		SYSTEM_ADMIN_PERMISSIONS.Settings
	],
	[ROLES.TenantAdmin]: [
		TENANT_ADMIN_PERMISSIONS.Device,
		TENANT_ADMIN_PERMISSIONS.Payments,
		TENANT_ADMIN_PERMISSIONS.Settings,
		TENANT_ADMIN_PERMISSIONS.Subscriptions,
		TENANT_ADMIN_PERMISSIONS.Support,
		TENANT_ADMIN_PERMISSIONS.Users
	],
    
};

export function checkSystemAdminPermissions(role: string) {
	const userPermission = rolePermissions[role];
	console.log(rolePermissions[role]);
	const permissionData = {
		Tenants: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.Tenants),
		Clients: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.ClientApps),
		InternalAppUsers: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.InternalAppUsers),
		Subscription: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.Subscriptions),
		Device: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.Device),
		DeviceFirmware: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.DeviceFirmware),
		TechnicalSupport: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.TechnicalSupport),
		Payments: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.Payments),
		Revenue: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.Revenue),
		Reports: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.Reports),
		Notifications: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.Notifications),
		Settings: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.Settings),
		PerformanceMonitoring: userPermission?.includes(SYSTEM_ADMIN_PERMISSIONS.PerformanceMonitoring)
	};
	console.log(permissionData);
	return permissionData;
}

export function checkTenantAdminPermissions(role: string) {
	const userPermission = rolePermissions[role];
	console.log(rolePermissions[role]);
	const permissionData = {
        Users:userPermission?.includes(TENANT_ADMIN_PERMISSIONS.Users),
		Subscription: userPermission?.includes(TENANT_ADMIN_PERMISSIONS.Subscriptions),
		Device: userPermission?.includes(TENANT_ADMIN_PERMISSIONS.Device),
		Payments: userPermission?.includes(TENANT_ADMIN_PERMISSIONS.Payments),
		Settings: userPermission?.includes(TENANT_ADMIN_PERMISSIONS.Settings),
        Support: userPermission?.includes(TENANT_ADMIN_PERMISSIONS.Support),
	};
	console.log(permissionData);
	return permissionData;
}
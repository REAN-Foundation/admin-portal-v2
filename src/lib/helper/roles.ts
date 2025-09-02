export const ROLES = {
	SystemAdmin: 'System admin',
	DeviceAdmin: 'Device administrator',
	FirmwareDeveloper: 'Firmware developer',
	InternalDeveloper: 'Internal developer',
	ExternalDeveloper: 'External developer',
	InternalClientAppOwner: 'Internal client app owner',
	ExternalClientAppOwner: 'External client app owner',
	TechnicalSupport: 'Technical support',
	Doctor: 'Doctor',
	Nurse: 'Nurse',
	HealthWorker: 'Health worker',
	TenantAdmin: 'Tenant admin'
};

export const SYSTEM_ADMIN_PERMISSIONS = {
	Tenants: 'Tenants',
	ClientApps: 'Client Apps',
	InternalAppUsers: 'Internal App Users',
	Subscriptions: 'Subscriptions',
	Device: 'Device',
	Payments: 'Payments',
	Reports: 'Reports',
	Notifications: 'Notifications',
	TechnicalSupport: 'Technical Support',
	DeviceFirmware: 'Device Firmware',
	Revenue: 'Revenue',
	PerformanceMonitoring: 'Performance Monitoring',
	Settings: 'Settings'
};

export const TENANT_ADMIN_PERMISSIONS = {
	Users: 'Users',
	Subscriptions: 'Subscriptions',
	Device: 'Device',
	Payments: 'Payments',
	Support: 'Support',
	Settings: 'Settings'
};

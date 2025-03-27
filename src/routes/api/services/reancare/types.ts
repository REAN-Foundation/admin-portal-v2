import { BACKEND_API_URL } from '$env/static/private';
import type { PersonRole } from '$lib/types/domain.models';
import { get_ } from '../common';

export const getUserRoles = async (): Promise<PersonRole[]> => {
	try {
		const url =BACKEND_API_URL + '/types/person-roles';
		const response = await get_(url, false);

		return response.Data.PersonRoleTypes;
	} catch (error) {
		console.error(`Error retrieving user roles:. Switching to default roles...`);
		return [];
	}
};

export function findRoleDataByName(
	roles: UserRoles[],
	roleName: string
): { roleId: number; isSystemAdmin: boolean } {
	const role = roles.find((r) => r.RoleName === RolesData[roleName]);
	if (!role) {
		throw new Error(`Role with name "${roleName}" not found.`);
	}
	return { roleId: role.id, isSystemAdmin: role.IsSystemRole };
}

type UserRoles = {
	id: number;
	RoleName: string;
	Description: string;
	TenantId: string | null;
	IsUserRole: boolean;
	IsSystemRole: boolean;
	IsDefaultRole: boolean;
	CreatedAt: string;
};

const RolesData: Record<string, string> = {
	admin: 'System admin',
	deviceAdmin: 'Device administrator',
	firmwareDeveloper: 'Firmware developer',
	systemDeveloper: 'Internal developer',
	tenantDeveloper: 'External developer',
	iClientAppOwner: 'Internal client app owner',
	eClientAppOwner: 'External client app owner',
	support: 'Technical support',
	doctor: 'Doctor',
	nurse: 'Nurse',
	healthWorker: 'Health worker',
	tenantAdmin: 'Tenant admin'
};

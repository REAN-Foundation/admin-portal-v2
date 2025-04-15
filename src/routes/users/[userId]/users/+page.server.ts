import type { ServerLoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchPersonRoleTypes } from '../../../api/services/reancare/person-role-types';
import { addPermissionMatrix, searchUsers } from '../../../api/services/reancare/user';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	console.log('sessionId.....', sessionId);
	event.depends('app:users');
	const tenantId = event.locals.sessionUser.tenantId;
	const userRole = event.locals.sessionUser.roleName;
	const userId = event.locals.sessionUser.userId;
	const userRoleId = event.locals.sessionUser.roleId;
	console.log('tenantId.....', tenantId);

	const personRoles = await searchPersonRoleTypes(sessionId);
	if (personRoles.Status === 'failure' || personRoles.HttpCode !== 200) {
		throw error(personRoles.HttpCode, personRoles.Message);
	}
	const selectedRoles: string[] = [];
	personRoles.Data.PersonRoleTypes.map((personRole) => {
		if (
			personRole.RoleName === 'System admin' ||
			personRole.RoleName === 'System user' ||
			personRole.RoleName === 'Tenant admin' ||
			personRole.RoleName === 'Tenant user'
		) {
			selectedRoles.push(personRole.id);
		}
	});

	const response = await searchUsers(sessionId, {
		orderBy: 'FirstName',
		order: 'ascending',
		roleIds: selectedRoles.length ? (selectedRoles as string[]) : null
	});
	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const users = response.Data.Users;
	users.Items = await addPermissionMatrix(
		sessionId,
		users.Items,
		userRole,
		userId,
		tenantId,
		userRoleId
	);
	console.log('User Role After Add Permission Matrix', users.Items);
	return {
		users,
		sessionId,
		message: response.Message,
		selectedRoles,
		title: 'Administration-Users'
	};
};

// const addPermissionMatrix = async (userRoleList: any[], userRole?: string, userId?: string, tenantId?: string, roleId?: string) => {
//   console.log('User Role',userRole);
//   const permissionMatrix: any[] = [];

//   if (userRole === 'System admin') {
//     userRoleList.forEach((userRole) => {
//       permissionMatrix.push({...userRole, IsPermitted: 1});
//     })
//   }

//   if (userRole === 'Tenant admin') {
//       userRoleList.forEach((userRole) => {
//       console.log('Role',userRole.RoleId, '-', roleId);
//       console.log('Tenant Id',userRole.TenantId, '-', tenantId);
//       console.log('User Id',userRole.id, '-', userId);
//       console.log('Role',typeof userRole.RoleId, '-', typeof roleId);
//       console.log('Tenant Id',typeof userRole.TenantId, '-', typeof tenantId);
//       console.log('User Id',typeof userRole.id, '-', typeof userId);
//       console.log('COND1',userRole.RoleId === roleId )
//       console.log('COND2',userRole.TenantId === tenantId )
//       console.log('COND3',userRole.id === userId)
//       console.log('COND4',userRole.RoleId === roleId && userRole.id === userId && userRole.TenantId === tenantId)
//       if (userRole.RoleId === roleId &&
//         userRole.TenantId === tenantId &&
//         userRole.id === userId) {
//         permissionMatrix.push({...userRole, IsPermitted: 1});
//       } else {
//         permissionMatrix.push({...userRole, IsPermitted: 0});
//       }
//     })
//   }
//   console.log('--', permissionMatrix);
//   return permissionMatrix.length > 0  ? permissionMatrix : userRoleList;
// }

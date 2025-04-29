//import { BACKEND_API_URL } from '$env/static/private';
import { API_CLIENT_INTERNAL_KEY, BACKEND_API_URL } from '$env/static/private';
import Password from '$lib/components/input/password.input.svelte';
import type { LoginModel } from '$lib/types/domain.models';
import { Helper } from '$lib/utils/helper';
import { post_, get_, delete_, put_ } from '../common';
import { del, get, post } from './common.reancare';
import { searchPersonRoleTypes } from './person-role-types';

///////////////////////////////////////////////////////////////////////////////

export const loginAsUser = async (
	loginRoleId: number | null,
	password: string,
	username?: string,
	email?: string,
	phone?: string
) => {
	// const endPoint = '/users/login-with-password';
	//  	const body = {
	// 		"UserName": user,
	// 		"Password": password,
	// 	};
	// return  await post_(endPoint,body,false);
	try {
		const model: LoginModel = getLoginModel(loginRoleId, password, username, email, phone);
		console.log(JSON.stringify(model, null, 2));

		const body = model;
		console.log('model', model);
		const url = BACKEND_API_URL + '/users/login-with-password';

		return await post_(url, body, false);
	} catch (error) {
		console.log('error', error);
	}
};

const getLoginModel = (
	loginRoleId: number | null,
	password: string,
	username?: string,
	email?: string,
	phone?: string
): LoginModel => {
	const loginModel: LoginModel = {};

	if (username) {
		loginModel.UserName = username;
	}
	if (phone) {
		loginModel.Phone = phone;
	}
	if (email) {
		loginModel.Email = email;
	}
	if (password) {
		loginModel.Password = password;
	}
	if (loginRoleId) {
		loginModel.LoginRoleId = loginRoleId;
	}

	return loginModel;
};

export const SendPasswordResetCode = async (email?: string, phone?: string) => {
	const model = {
		Email: email,
		Phone: phone
	};

	const body = model;
	console.log('model', model);
	const url = BACKEND_API_URL + `/users/send-password-reset-code`;

	return await post_(url, body, false);
};

export const resetPassword = async (
	resetCode: string,
	newPassword: string,
	loginRoleId: number | null,
	email?: string,
	phone?: string
) => {
	const model = {
		NewPassword: newPassword,
		ResetCode: resetCode,
		RoleId: loginRoleId,
		Email: email,
		Phone: phone
	};

	const body = model;
	console.log('IN USER.TS');

	const url = BACKEND_API_URL + `/users/reset-password`;

	return await post_(url, body, false);
};

export const getUserById = async (sessionId: string, userId: string) => {
	const url = BACKEND_API_URL + `/users/${userId}`;
	return await get_(url, true, sessionId);
};

export const updateUser = async (
	sessionId: string,
	userId: string,
	firstName: string,
	lastName: string,
	phone: string,
	email: string,
	roleId: string,
	defaultTimeZone: string,
	currentTimeZone: string,
	imageResourceId?: string
) => {
	const body = {
		FirstName: firstName,
		LastName: lastName,
		RoleId: roleId,
		Phone: phone ? phone : null,
		Email: email ? email : null,
		DefaultTimeZone: defaultTimeZone ? defaultTimeZone : null,
		CurrentTimeZone: currentTimeZone ? currentTimeZone : null,
		ImageResourceId: imageResourceId ? imageResourceId : undefined
	};
	if (Helper.isPhone(phone)) {
		body.Phone = Helper.sanitizePhone(phone);
	}
	console.log('body.....', body);
	const url = BACKEND_API_URL + `/users/${userId}`;
	return await put_(url, body, true, sessionId);
};


///////////////////////////////////////////////////////////////////////

// User curd end points

export const createUser = async (
	sessionId: string,
    tenantId: string,
	firstName: string,
	lastName: string,
    phone: string,
	email: string,
	role: string,
    roleId: string,
	password: string,
    defaultTimeZone,
    currentTimeZone
) => {
	const body = {
    TenantId: tenantId,
	FirstName: firstName,
	LastName: lastName,
    Role: role,
    RoleId: roleId,
	Phone: phone ? phone : null,
    Email: email ? email : null,
	Password: password,
    DefaultTimeZone: defaultTimeZone,
    CurrentTimeZone: currentTimeZone
	};

    if (Helper.isPhone(phone)) {
        body.Phone = Helper.sanitizePhone(phone);
    }
    const url = BACKEND_API_URL + '/users';
    return await post(sessionId, url, body, true, API_CLIENT_INTERNAL_KEY);
};



export const searchUsers = async (sessionId: string, searchParams?: any) => {
    let searchString = '';
    if (searchParams) {
        const keys = Object.keys(searchParams);
        if (keys.length > 0) {
            searchString = '?';
            const params = [];
            for (const key of keys) {
                if (searchParams[key]) {
                    const param = `${key}=${searchParams[key]}`;
                    params.push(param);
                }
            }
            searchString += params.join('&');
        }
        console.log('searchString', searchString);
    }
    const url = BACKEND_API_URL + `/users/search${searchString}`;
    return await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};



export const deleteUser = async (sessionId: string, usreId: string) => {
    const url = BACKEND_API_URL + `/users/${usreId}`;
    return await del(sessionId, url, true, API_CLIENT_INTERNAL_KEY);
};

export const getUserRoleList = async (userRole: string) => {
  if (userRole === "System admin") {
    return [
      {
        Title : 'System User',
        Value : 'System user'
      },
      {
        Title : 'Tenant User',
        Value : 'Tenant user'
      },
      {
        Title : 'Tenant Admin',
        Value : 'Tenant admin'
      }
    ]
  }
  if (userRole === 'Tenant admin') {
    return [
      {
        Title : 'Tenant User',
        Value : 'Tenant user'
      },
    ];
  }

  return [];
}

export const addPermissionMatrix = async (sessionId: string, userRoleList: any[], userRole?: string, userId?: string, tenantId?: string, roleId?: string) => {
  const permissionMatrix: any[] = [];

  const response = await searchPersonRoleTypes(sessionId)
  let selectedUserRoleId;
  const personRoleTypes = response.Data.PersonRoleTypes
	const selectedRole = personRoleTypes?.find((x) => x.RoleName === 'Tenant user');
  if (selectedRole) {
    selectedUserRoleId = selectedRole.id;
  }

  if (userRole === 'System admin') {
    userRoleList.forEach((userRole) => {
      permissionMatrix.push({...userRole, IsPermitted: 1});
    })
  }

  if (userRole === 'Tenant admin') {
      userRoleList.forEach((userRole) => {
      if ((userRole.RoleId === roleId &&
        userRole.TenantId === tenantId &&
        userRole.id === userId) ||
      (userRole.TenantId === tenantId &&
        userRole.RoleId === selectedUserRoleId)) {
        permissionMatrix.push({...userRole, IsPermitted: 1});
      } else {
        permissionMatrix.push({...userRole, IsPermitted: 0});
      }
    })
  }
  // console.log('Permission Matrix', permissionMatrix)
  return permissionMatrix.length > 0  ? permissionMatrix : userRoleList;
}

//import { BACKEND_API_URL } from '$env/static/private';
import { API_CLIENT_INTERNAL_KEY, BACKEND_API_URL } from '$env/static/private';
import Password from '$lib/components/input/password.input.svelte';
import type { LoginModel } from '$lib/types/domain.models';
import { Helper } from '$lib/utils/helper';
import { post_, get_, delete_, put_ } from '../common';

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

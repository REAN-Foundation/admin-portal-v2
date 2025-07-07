import { type RequestEvent } from '@sveltejs/kit';
import { SendPasswordResetCode } from '../../../services/reancare/user';
import { getPersonRolesForEmail, getPersonRolesForPhone } from '$routes/api/services/reancare/persons';

//////////////////////////////////////////////////////////////
interface PersonRole {
	id: number,
	RoleName: string;
	// Description?: string;
};
export const POST = async (event: RequestEvent) => {

	const request = event.request;
	let availableRoles: PersonRole[] = [];
	let filteredRoles: PersonRole[] = [];

	let loginRoleId = null;

	const data = await request.json();
	console.log(data);

	try {

		console.log('Inside the send reset password code...');
		const email = data.Email;
		let phone = ''

		if (data.Phone && data.CountryCode) {
			phone = data.CountryCode + '-' + data.Phone;
			const res_ = availableRoles = await getPersonRolesForPhone(phone);
			availableRoles = res_.Data?.Roles ?? [];
		}
		else if (data.Email) {
			const res_ = await getPersonRolesForEmail(email);
			availableRoles = res_.Data?.Roles ?? [];
		}
		// const res_ = await getPersonRolesForEmail(email);
		// availableRoles = res_.Data?.Roles ?? [];

		if (availableRoles.length > 0) {
			filteredRoles = availableRoles.filter((x) => x.RoleName !== 'Doctor' && x.RoleName !== 'Patient');
			if (filteredRoles.length > 0) {
				loginRoleId = filteredRoles[0].id;
			}
		}

		if (filteredRoles.length > 1) {
			return new Response(JSON.stringify({
				Status: 'failure',
				HttpStatusCode: 409,
				Message: 'Multiple administrative roles associated with email.'
			}))
		}
		if (filteredRoles.length == 0) {
			return new Response(JSON.stringify({
				Status: 'failure',
				HttpStatusCode: 409,
				Message: 'Found no administrative roles associated with email.'
			}));
		}

		// console.log('Inside the send reset password code...');
		// let email = data.Email;
		// let phone = '';

		// if (data.Phone && data.CountryCode) {
		// 	phone = data.CountryCode + '-' + data.Phone;
		// }

		const response = await SendPasswordResetCode(loginRoleId, email, phone);
		console.log('response', response);

		return new Response(
			JSON.stringify({
				Status: response.Status,
				HttpStatusCode: response.HttpCode,
				Message: response.Message
			})
		);
	} catch (error) {
		console.error(`Error sending code: ${error}`);
	}
};

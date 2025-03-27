import { error, type RequestEvent } from '@sveltejs/kit';
import { SendPasswordResetCode } from '../../../services/reancare/user';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	const request = event.request;

	const data = await request.json();
	console.log(data);

	try {
		console.log('Inside the send reset password code...');
		let email = data.Email;
		let phone = '';

		if (data.Phone && data.CountryCode) {
			phone = data.CountryCode + '-' + data.Phone;
		}

		const response = await SendPasswordResetCode(email, phone);
		console.log('response', response);

		return new Response(
			JSON.stringify({
				Status: response.Status,
				HttpStatusCode: response.HttpCode,
				Message: response.Message
			})
		);
	} catch (err) {
		console.log(error);
		console.error(`Error sending code: `);
	}
};

import { z } from 'zod';

export const loginSchema = z.object({
	username: z.string().trim().min(1, { message: "Username can't be empty" }).optional(),
	password: z.string().trim().min(1, { message: 'Password cannot be empty' }),
	email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
	phone: z.string().optional(),
	countryCode: z.string().optional(),
	loginType: z.enum(['username', 'email', 'phone'], {
		required_error: 'Login type is required',
		invalid_type_error: 'Login type must be username, email, or phone'
	})
}).refine((data) => {
	// Ensure at least one login method is provided
	if (data.loginType === 'username' && !data.username) {
		return false;
	}
	if (data.loginType === 'email' && !data.email) {
		return false;
	}
	if (data.loginType === 'phone' && (!data.phone || !data.countryCode)) {
		return false;
	}
	return true;
}, {
	message: 'Please provide the required login information based on your selected login type',
	path: ['loginType']
});

import { z } from 'zod';

export const createSchema = z.object({
	FirstName: z
		.string({
			required_error: 'First name is required.',
			invalid_type_error: 'First name must be a string.'
		})
		.min(1, { message: 'First name cannot be empty.' })
		.max(256, { message: 'First name must be at most 256 characters long.' }),
	LastName: z
		.string({
			required_error: 'Last name is required.',
			invalid_type_error: 'Last name must be a string.'
		})
		.min(1, { message: 'Last name cannot be empty.' })
		.max(256, { message: 'Last name must be at most 256 characters long.' }),
	Phone: z.string({
		required_error: 'Contact number is required.',
		invalid_type_error: 'Contact number must be a string.'
	}),
	Email: z
		.string({
			required_error: 'Email is required.',
			invalid_type_error: 'Email must be a string.'
		})
		.email({ message: 'Email must be a valid email address.' }),

	Role: z.enum(['System user', 'Tenant user', 'Tenant admin'], {
		required_error: 'Role is required.',
		invalid_type_error: 'Role must be one of: System User, Tenant User, or Tenant Admin.'
	}),
	Password: z
		.string()
		.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
			message:
				'The password should be at least 8 characters long and must contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
		})
		.min(8, {
			message: 'Password must be 8 characters'
		}),
	SelectedUserRoleId: z.number(),
	CountryCode: z.string()
});

export const updateSchema = z.object({
	FirstName: z
		.string({
			required_error: 'First name is required.',
			invalid_type_error: 'First name must be a string.'
		})
		.min(1, { message: 'First name cannot be empty.' })
		.max(256, { message: 'First name must be at most 256 characters long.' }),
	LastName: z
		.string({
			required_error: 'Last name is required.',
			invalid_type_error: 'Last name must be a string.'
		})
		.min(1, { message: 'Last name cannot be empty.' })
		.max(256, { message: 'Last name must be at most 256 characters long.' }),
	Phone: z.string({
		required_error: 'Contact number is required.',
		invalid_type_error: 'Contact number must be a string.'
	}),
	Email: z
		.string({
			required_error: 'Email is required.',
			invalid_type_error: 'Email must be a string.'
		})
		.email({ message: 'Email must be a valid email address.' }),

	Role: z.enum(['System user', 'System admin', 'Tenant user', 'Tenant admin'], {
		required_error: 'Role is required.',
		invalid_type_error: 'Role must be one of: System User, Tenant User, or Tenant Admin.'
	}),
	SelectedUserRoleId: z.number(),
	CountryCode: z.string()
});

export const changePasswordSchema = z
	.object({
		OldPassword: z.string().min(1, 'Old password is required'),
		NewPassword: z
			.string()
			.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
				message:
					'Password should contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
			})
			.min(8, {
				message: 'Password must be 8 characters'
			}),
		ConfirmNewPassword: z
			.string()
			.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
				message:
					'Password should contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
			})
			.min(8, {
				message: 'Password must be 8 characters'
			})
	})
	.refine((data) => data.NewPassword === data.ConfirmNewPassword, {
		path: ['ConfirmNewPassword'],
		message: 'New password and confirm new password must match'
	});
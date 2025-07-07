<script lang="ts">
	import { z } from 'zod';
	import Password from '$lib/components/input/password.input.svelte';
	import {
		getPublicFooterLink,
		getPublicFooterText,
		getPublicLogoImageSource
	} from '$lib/themes/theme.selector';
	import { toasts } from '$lib/components/toast/toast.store';
	import { showMessage } from '$lib/components/toast/message.utils';

	/////////////////////////////////////////////////////////////////////////////////////
	
	let showResetPassword  = $state(false);
	let showForgotPassword  = $state(true);
	let isLoading = $state(false);

	let email = $state('');
	let resetCode = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let errors: any = $state({});
	let emailError = $state('');
	let loginActiveTab = 'email';
	let forgotPasswordActiveTab = $state('email');
	let phone = $state('');
	let countryCode = $state('+1');

	// Enhanced email validation function
	function validateEmail(email: string): { isValid: boolean; message: string } {
		if (!email || email.trim().length === 0) {
			return { isValid: false, message: 'Email is required' };
		}

		const trimmedEmail = email.trim();
		
		// Check length limits
		if (trimmedEmail.length > 254) {
			return { isValid: false, message: 'Email address is too long' };
		}

		// Basic email format check
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!emailRegex.test(trimmedEmail)) {
			return { isValid: false, message: 'Please enter a valid email address' };
		}

		// Check for common invalid patterns
		if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.') || trimmedEmail.includes('..')) {
			return { isValid: false, message: 'Email address contains invalid characters' };
		}

		if (trimmedEmail.includes('@.') || trimmedEmail.includes('.@')) {
			return { isValid: false, message: 'Email address contains invalid characters' };
		}

		// Check for consecutive dots in domain
		if (trimmedEmail.split('@')[1]?.includes('..')) {
			return { isValid: false, message: 'Email domain contains invalid characters' };
		}

		return { isValid: true, message: '' };
	}

	const logoImageSource = getPublicLogoImageSource();
	const footerText = `© ${new Date().getFullYear()} ${getPublicFooterText()}`;
	const footerLink = getPublicFooterLink();

	const resetPasswordSchema = z
		.object({
			email: z.string().email({ message: 'Email is not valid' }).optional().or(z.literal('')),
			phone: z
				.string()
				.regex(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
				.optional()
				.or(z.literal('')),
			resetCode: z.string().min(6, { message: 'Reset code must be 6 characters' }),
			newPassword: z
				.string()
				.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
					message:
						'Password should contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
				})
				.min(8, {
					message: 'Password must be 8 characters'
				}),
			confirmPassword: z
				.string()
				.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, {
					message:
						'Password should contain at least 1 capital letter, 1 small letter, 1 digit, and 1 special character.'
				})
				.min(8, {
					message: 'Password must be 8 characters'
				})
			// newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
			// confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }),
		})
		.refine((data) => data.newPassword === data.confirmPassword, {
			message: 'New password and confirm new password must match',
			path: ['confirmPassword']
		});

		const forgotPasswordSchema = z
	.object({
		email: z.string().email({ message: 'Please enter a valid email address' }).optional(),
		phone: z.string().regex(/^\d{10}$/, {
			message: 'Please enter a valid 10-digit phone number'
		}).optional(),
		countryCode: z.string().optional() // only required for phone input
	})
	.refine((data) => data.email || data.phone, {
		message: 'Email or phone is required'
	})
	.refine((data) => {
		if (data.email) {
			// Additional email validation checks
			const email = data.email.trim();
			if (email.length === 0) return false;
			if (email.length > 254) return false; // RFC 5321 limit
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
			// Check for common invalid patterns
			if (email.startsWith('.') || email.endsWith('.') || email.includes('..')) return false;
			if (email.includes('@.') || email.includes('.@')) return false;
			return true;
		}
		return true;
	}, {
		message: 'Please enter a valid email address',
		path: ['email']
	});

	async function handleForgotPassword() {
        try {
            isLoading = true;
            errors = {};
			emailError = null;

            if (forgotPasswordActiveTab === 'email') {
                if (!email || email.trim().length === 0) {
                    emailError = 'Email is required';
                    return;
                }
                const emailValidation = validateEmail(email);
                if (!emailValidation.isValid) {
                    emailError = emailValidation.message;
                    return;
                }
            }
            
            // Enhanced validation for phone tab
            if (forgotPasswordActiveTab === 'phone') {
                if (!phone || phone.trim().length === 0) {
                    emailError = 'Phone number is required';
                    return;
                }
                if (!/^\d{10}$/.test(phone.trim())) {
                    emailError = 'Please enter a valid 10-digit phone number';
                    return;
                }
            }
            
            let requestBody = {
                Email: email,
                CountryCode: countryCode,
                Phone: phone
            };
            
            const response = await fetch(`/api/server/users/send-reset-code`, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: { 'content-type': 'application/json' }
            });
            const res = await response.json();
            if (res.Status === 'success') {
                showMessage(res.Message || 'Reset code sent successfully', 'success', false, 3000);
                showResetPassword = true;
                showForgotPassword = false;
            } else {
                emailError = res.Message || 'Failed to send reset code';
            }
        } catch (err) {
            emailError = 'Something went wrong. Please try again.';
        } finally {
            isLoading = false;
        }
    }

	async function handleResetPassword() {
		errors = {};
		try {
			resetPasswordSchema.parse({ email, phone, resetCode, newPassword, confirmPassword });
			let resetPasswordBody = {
				ResetCode: resetCode,
				NewPassword: newPassword,
				Email: email,
				CountryCode: countryCode,
				Phone: phone
			};
			console.log('resetPasswordBody', resetPasswordBody);
			const response = await fetch('/api/server/users/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(resetPasswordBody)
			});
			const res = await response.json();
			if (res.Status === 'success') {
				showMessage(res.Message, 'success', false, 3000);
				showResetPassword = false;
				showForgotPassword = false;
				email = undefined;
				phone = undefined;
			} else {
				showMessage(res.Message, 'error', false, 3000);
			}
			window.location.href = '/';
		} catch (err) {
			if (err instanceof z.ZodError) {
				errors = err.flatten().fieldErrors;
			} else {
				showMessage('An unexpected error occurred', 'error', false, 3000);
			}
		}
	}
</script>

<div class="form-container flex flex-col py-6">
	<img class="ct-image mt-7 mb-7 w-36" alt="logo" src={logoImageSource} />

	{#if showForgotPassword}
		<div class="card mb-10 p-8">
			<form onsubmit={handleForgotPassword} class="">
				<h2 class="mb-4 text-center text-xl">Forgot Password</h2>

				<div class="mt-5 w-full justify-center">
					<div class="mb-4 flex gap-6">
						<label class="text-md flex items-center">
							<input
								type="radio"
								class="radio-input h-4 w-4"
								name="loginType"
								value="email"
								bind:group={forgotPasswordActiveTab}
								onchange={() => {
									emailError = '';
									email = '';
									phone = '';
								}}
							/> Email
						</label>
						<label class="text-md flex items-center">
							<input
								type="radio"
								class="radio-input h-4 w-4"
								name="loginType"
								value="phone"
								bind:group={forgotPasswordActiveTab}
								onchange={() => {
									emailError = '';
									email = '';
									phone = '';
								}}
							/> Phone
						</label>
					</div>
					{#if forgotPasswordActiveTab === 'email'}
						<input
							type="text"
							name="email"
							placeholder="Enter your email address"
							bind:value={email}
							class="input mb-1"
							onblur={() => {
								if (email && email.trim()) {
									const validation = validateEmail(email);
									if (!validation.isValid) {
										emailError = validation.message;
									} else {
										emailError = '';
									}
								}
							}}
							oninput={() => {
								// Clear error when user starts typing
								if (emailError) {
									emailError = '';
								}
							}}
						/>
						{#if emailError}
							<p class="error-text">{emailError}</p>
						{/if}
						{#if email && !emailError && forgotPasswordActiveTab === 'email'}
							{@const validation = validateEmail(email)}
						{/if}
					{/if}
					{#if forgotPasswordActiveTab === 'phone'}
						<div class="mb-4 flex gap-2">
							<div class="w-1/3">
								<select name="countryCode" class="input" bind:value={countryCode}>
									<option value="+1">+1</option>
									<option value="+91">+91</option>
								</select>
							</div>
							<div class="w-full">
								<input
									type="tel"
									id="phone"
									name="phone"
									bind:value={phone}
									class="input"
									placeholder="Enter your mobile number"
									onblur={() => {
										if (phone && phone.trim()) {
											if (!/^\d{10}$/.test(phone.trim())) {
												emailError = 'Please enter a valid 10-digit phone number';
											} else {
												emailError = '';
											}
										}
									}}
									oninput={() => {
										// Clear error when user starts typing
										if (emailError) {
											emailError = '';
										}
									}}
								/>
							</div>
						</div>
						{#if emailError && forgotPasswordActiveTab === 'phone'}
							<p class="error-text">{emailError}</p>
						{/if}
						{#if phone && !emailError && forgotPasswordActiveTab === 'phone'}
							{@const isValidPhone = /^\d{10}$/.test(phone.trim())}
						{/if}
					{/if}
				</div>
				<button type="submit" class="btn my-4 w-full cursor-pointer" disabled={isLoading}>
					{isLoading ? 'Sending...' : 'Send Reset Code'}
				</button>
				<a href="/">
					<button
						type="button"
						class="btn mb-6 w-full cursor-pointer"
						onclick={() => {
							showForgotPassword = false;
						}}
					>
						Back to Login
					</button>
				</a>
			</form>
		</div>
	{:else if showResetPassword}
		<div class="card mb-10 px-8 py-4">
			<form onsubmit={handleResetPassword} class="">
				<h2 class="mb-4 text-center text-xl">Reset Password</h2>
				<input type="email" name="email" bind:value={email} class="input mb-4 hidden" />
				<input type="text" name="countryCode" bind:value={countryCode} class="input mb-4 hidden" />
				<input type="text" name="phone" bind:value={phone} class="input mb-4 hidden" />
				<label>
					<span class="label">Reset Code/OTP</span>
					<input type="text" bind:value={resetCode} class="input" placeholder="Enter code/OTP" />
					{#if errors.resetCode}
						<p class="error-text">{errors.resetCode}</p>
					{/if}
				</label>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label>
					<span class="label">New Password</span>
					<div class="mt-2 mb-4">
						<Password bind:password={newPassword} name="newPassword" />
					</div>

					<!-- <input type="password" bind:value={newPassword} required class="input mb-4 mt-2" /> -->
					{#if errors.newPassword}
						<p class="error-text">{errors.newPassword}</p>
					{/if}
				</label>
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label>
					<span class="label">Confirm New Password</span>
					<div class="mt-2 mb-4">
						<Password bind:password={confirmPassword} name="confirmPassword" />
					</div>

					<!-- <input type="password" bind:value={confirmPassword} required class="input mb-4" /> -->
					{#if errors.confirmPassword}
						<p class="error-text">{errors.confirmPassword}</p>
					{/if}
				</label>
				<button type="submit" class="btn mb-6 w-full cursor-pointer">Reset Password</button>
				<button
					type="button"
					class="btn mb-6 w-full cursor-pointer"
					onclick={() => {
						showResetPassword = false;
					}}
				>
					<a href="/">Back to Login</a></button
				>
			</form>
		</div>
	{/if}
</div>

<!-- <footer class="footer fixed bottom-0 w-full p-2 text-center">
	<a href={footerLink} class="!text-white">{footerText}</a>
</footer> -->

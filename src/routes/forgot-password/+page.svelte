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
	let showResetPassword = false;
	let showForgotPassword = true;

	let email: any;
	let resetCode: any;
	let newPassword: any;
	let confirmPassword: any;
	let errors: any = {};
	let loginActiveTab = 'email';
	let forgotPasswordActiveTab = 'email';
	let phone: any;
	let countryCode: any;

	const logoImageSource = getPublicLogoImageSource();
	const footerText = `© ${new Date().getFullYear()} ${getPublicFooterText()}`;
	const footerLink = getPublicFooterLink();

	const resetPasswordSchema = z
		.object({
			email: z.string().email({ message: 'Invalid email address' }).optional(),
			phone: z.string().optional(),
			resetCode: z
				.string({
					required_error: 'Reset code is required.',
					invalid_type_error: 'Name must be a string.'
				})
				.min(6, { message: 'Reset code must be 6 characters' }),
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
				.string({
			required_error: 'Password  is required.',
			invalid_type_error: 'Name must be a string.'
		})
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

	async function handleForgotPassword() {
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
			// toast.success(res.Message);
			console.log('password reset successfully');
			showResetPassword = true;
			showForgotPassword = false;
		} else {
			// toast.error(res.Message);
			console.log('error');
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
							/> Email
						</label>
						<label class="text-md flex items-center">
							<input
								type="radio"
								class="radio-input h-4 w-4"
								name="loginType"
								value="phone"
								bind:group={forgotPasswordActiveTab}
							/> Phone
						</label>
					</div>
					{#if forgotPasswordActiveTab === 'email'}
						<label class="label" for="email">
							<span class="label-text-alt"></span>
						</label>
						<input
							type="email"
							name="email"
							placeholder="Enter your email"
							bind:value={email}
							class="input mb-4"
						/>
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
								/>
							</div>
						</div>
					{/if}
				</div>
				<button type="submit" class="btn mb-6 w-full cursor-pointer">Send Reset Code</button>
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
						<!-- <p class="text-error-500 mb-2 text-xs">{errors.resetCode}</p> -->
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

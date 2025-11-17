<script lang="ts">
	import Icon from '@iconify/svelte';
	import { browser } from '$app/environment';
	import { personRolesStore } from '$lib/store/general.store.js';
	import {
		getPublicFooterLink,
		getPublicFooterText,
		getPublicLogoImageSource,
		getSystemName
	} from '$lib/themes/theme.selector';
	import type { PersonRole } from '$lib/types/domain.models.js';
	import { LocalStorageUtils } from '$lib/utils/local.storage.utils.js';
	import type { PageServerData } from './$types';
	import { loginSchema } from '$lib/validation/login.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	
	///////////////////////////////////////////////////////////////////////////
	
	let loginType = $state('username');
	let showPassword = $state(false);
	let isLoading = $state(false);
	let errors: Record<string, string> = $state({});
	let { data }: { data: PageServerData } = $props();
	let roles: PersonRole[] = data.roles;	
	
	const logoImageSource = getPublicLogoImageSource();
	const footerText = `© ${new Date().getFullYear()} ${getPublicFooterText()}`;
	const footerLink = getPublicFooterLink();
	const systemName = getSystemName();

	personRolesStore.set(roles);
	LocalStorageUtils.setItem('personRoles', JSON.stringify(roles));
	let personRoles = [];

	if (browser) {
		const tmp: any = LocalStorageUtils.getItem('personRoles');
		personRoles = JSON.parse(tmp);
		LocalStorageUtils.removeItem('prevUrl');
	}

	// Handle form submission
	const handleSubmit = async (event: Event) => {
		try {
		event.preventDefault();
		isLoading = true;
		errors = {};

		const formData = new FormData(event.target as HTMLFormElement);
		const loginData = {
			username: formData.get('username') as string || undefined,
			password: formData.get('password') as string,
			email: formData.get('email') as string || undefined,
			phone: formData.get('phone') as string || undefined,
			countryCode: formData.get('countryCode') as string || undefined,
			loginType: loginType
		};

		// Validate the form data
		const validationResult = loginSchema.safeParse(loginData);
		if (!validationResult.success) {
			const validationErrors: Record<string, string> = {};
			validationResult.error.errors.forEach((error) => {
				const field = error.path[0] as string;
				validationErrors[field] = error.message;
			});
			errors = validationErrors;
			isLoading = false;
			return;
		}
			const response = await fetch('/api/server/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(loginData)
			});

			const result = await response.json();

			if (result.success) {
				await goto(result.data.redirectUrl);
				await tick();
				toastMessage({
					Message: result.message,
					HttpCode: 200,
					Status: 'success'
				});
	
			} else {
				toastMessage({
					Message: result.message,
					HttpCode: response.status,
					Status: 'failure'
				});
				isLoading = false
				// Handle validation errors
				if (result.errors) {
					const validationErrors: Record<string, string> = {};
					result.errors.forEach((error: any) => {
						validationErrors[error.field] = error.message;
					});
					errors = validationErrors;
				}
			}
		
		} catch (error) {
			toastMessage();
		}
	};
	

	let maxHeight = '80vh';
	if (browser) {
		const handleResize = () => {
			const screenWidth = window.innerWidth;
			if (screenWidth <= 600) {
				maxHeight = '40vh';
			} else if (screenWidth <= 1024) {
				maxHeight = '50vh';
			} else if (screenWidth <= 1440) {
				maxHeight = '60vh';
			} else if (screenWidth <= 1600) {
				maxHeight = '70vh';
			} else {
				maxHeight = '80vh';
			}
		};

		window.addEventListener('resize', handleResize);
		handleResize();
	}
</script>

<svelte:head>
	<title>{systemName}</title>
	<meta name="description" content="REAN careplans" />
</svelte:head>

<div class="form-container flex flex-col items-center justify-center">
	<img class="ct-image mt-7 mb-7 w-36" alt="logo" src={logoImageSource} />
	<form onsubmit={handleSubmit} class="card mb-10 p-8">
		<h2 class="mb-4 text-center text-xl">Sign In</h2>

		<div class="mb-4 flex items-center gap-6">
			<label class="text-md flex items-center">
				<input
					type="radio"
					name="loginType"
					value="username"
					bind:group={loginType}
					class="radio-input"
				/>
				<span class="">Username</span>
			</label>

			<label class="text-md flex items-center">
				<input
					type="radio"
					name="loginType"
					value="email"
					bind:group={loginType}
					class="radio-input"
				/>
				<span>Email</span>
			</label>

			<label class="text-md flex items-center">
				<input
					type="radio"
					name="loginType"
					value="phone"
					bind:group={loginType}
					class="radio-input"
				/>
				<span>Phone</span>
			</label>
		</div>

		{#if loginType === 'username'}
			<label for="username" class="label">Username</label>
			<input
				type="text"
				id="username"
				name="username"
				class="input"
				placeholder="Enter your username"
				required
			/>
			{#if errors.username}
				<p class="text-red-500 text-sm mt-1">{errors.username}</p>
			{/if}
		{/if}

		{#if loginType === 'email'}
			<label for="email" class="label">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				class="input"
				placeholder="Enter your email"
				required
			/>
			{#if errors.email}
				<p class="text-red-500 text-sm mt-1">{errors.email}</p>
			{/if}
		{/if}

		{#if loginType === 'phone'}
			<label for="phone" class="label">Phone</label>
			<div class="flex gap-2">
				<select name="countryCode" class="input !w-1/3" required>
					<option value="+1">+1</option>
					<option value="+91">+91</option>
				</select>
				<input
					type="tel"
					id="phone"
					name="phone"
					class="input"
					placeholder="Enter your mobile number"
					required
				/>
			</div>
			{#if errors.phone || errors.countryCode}
				<p class="text-red-500 text-sm mt-1">{errors.phone || errors.countryCode}</p>
			{/if}
		{/if}

		<label for="password" class="label">Password</label>
		<div class="relative">
			<input
				type={showPassword ? 'text' : 'password'}
				id="password"
				name="password"
				class="input pr-10"
				placeholder="Enter your password"
				required
			/>
			<button
				type="button"
				class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-800"
				onclick={() => (showPassword = !showPassword)}
				tabindex="-1"
			>
				<Icon
					icon={showPassword
						? 'material-symbols:visibility-outline'
						: 'material-symbols:visibility-off-outline'}
					class="h-5 w-5 text-black"
				/>
			</button>
		</div>
		{#if errors.password}
			<p class="text-red-500 text-sm mt-1">{errors.password}</p>
		{/if}

		<div class="mt-4 flex justify-between">
			<a href="/forgot-password" class="link">Forgot Password?</a>
		</div>
		<button type="submit" class="btn mt-4" disabled={isLoading}>
			{#if isLoading}
				<span class="flex items-center gap-2">
					<Icon icon="material-symbols:refresh" class="h-4 w-4 animate-spin" />
					Logging in...
				</span>
			{:else}
				Login
			{/if}
		</button>
	</form>
</div>

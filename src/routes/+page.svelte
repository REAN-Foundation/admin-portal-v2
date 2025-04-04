<script lang="ts">
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

	let loginType = $state('username');

	let { data }: { data: PageServerData } = $props();
	// console.log(data.roles);

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
	<form method="post" action="?/login" class="card mb-10 p-8">
		<h2 class="mb-4 text-center text-xl">Sign In</h2>

		<div class="mb-4 flex items-center gap-6">
			<label class="text-md flex items-center">
				<input
					type="radio"
					name="loginType"
					value="username"
					bind:group={loginType}
					class="radio-input "
				/>
				<span class="">Username</span>
			</label>

			<label class="text-md flex items-center">
				<input
					type="radio"
					name="loginType"
					value="email"
					bind:group={loginType}
					class="radio-input "
				/>
				<span>Email</span>
			</label>

			<label class="text-md flex items-center">
				<input
					type="radio"
					name="loginType"
					value="phone"
					bind:group={loginType}
					class="radio-input "
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
		{/if}

		<label for="password" class="label">Password</label>
		<input
			type="password"
			id="password"
			name="password"
			class="input"
			placeholder="Enter your password"
			required
		/>

		<div class="mt-4 flex justify-between">
			<a href="/forgot-password" class="link">Forgot Password?</a>
		</div>

		<button type="submit" class="btn mt-4">Login</button>
	</form>
</div>


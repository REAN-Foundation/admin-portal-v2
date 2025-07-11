<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { LocalStorageUtils } from '$lib/utils/local.storage.utils';
	import PasswordInput from '$lib/components/input/password.input.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import type { UserCreateModel } from '$lib/types/user.types.js';
	import { createSchema } from '$lib/validation/user.schemas.js';
	import Button from '$lib/components/button/button.svelte';
	import type { PageServerData } from './$types';
	import { onMount } from 'svelte';
	import Label from '$lib/components/label/label.svelte';
	import Input from '$lib/components/input/input.svelte';
	import Heading from '$lib/components/heading/heading.svelte';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();

	let userRoles = data.UserRoles;
	console.log('userRoles', userRoles);

	let firstName = $state(undefined);
	let lastName = $state(undefined);
	let role = $state(undefined);
	let countryCode = $state('+1');
	let email = $state(undefined);
	let phone = $state(undefined);
	let password = $state(undefined);

	const userId = page.params.userId;
	let selectedUserRoleId = $state(undefined);
	let errors: Record<string, string> = $state({});
	let promise = $state();

	const createRoute = `/users/${userId}/users/create`;
	const userRoute = `/users/${userId}/users`;

	const breadCrumbs = [
		{ name: 'Users', path: userRoute },
		{ name: 'Create', path: createRoute }
	];

	function getRoleIdByRoleName(event) {
		const selectedUserRole = event.target.value;
		const tmp = LocalStorageUtils.getItem('personRoles');
		const personRoles = JSON.parse(tmp);
		console.log('personRoles', personRoles);
		const selectedRole = personRoles?.find((x) => x.RoleName === selectedUserRole);
		if (selectedRole) {
			selectedUserRoleId = selectedRole.id;
		}
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const usersCreateModel: UserCreateModel = {
				FirstName: firstName,
				LastName: lastName,
				Phone: phone,
				Email: email,
				Role: role,
				Password: password,
				CountryCode: countryCode,
				SelectedUserRoleId: selectedUserRoleId
			};

			console.log('password', password);

			const validationResult = createSchema.safeParse(usersCreateModel);
			console.log(validationResult);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				return;
			}

			const res = await fetch(`/api/server/users`, {
				method: 'POST',
				body: JSON.stringify(usersCreateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				goto(`${userRoute}/${response?.Data?.User?.id}/view`);
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			toastMessage();
		}
	};

	onMount(() => {
		const defaultRole = userRoles?.find((r) => r.Title === 'System User');
		if (defaultRole) {
			role = defaultRole.Value;
			const tmp = LocalStorageUtils.getItem('personRoles');
			const personRoles = JSON.parse(tmp || '[]');
			const match = personRoles.find((x) => x.RoleName === defaultRole.Value);
			if (match) {
				selectedUserRoleId = match.id;
			}
		}
	});
</script>

<BreadCrumbs crumbs={breadCrumbs} />
<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<Heading text="Create User" />
			<a href={userRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>

		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<Label text="First Name" required={true} />
					<td class="table-data">
						<Input
							type="text"
							placeholder="Enter first name here..."
							bind:value={firstName}
							error={errors?.FirstName}
						/>
					</td>
				</tr>

				<tr class="tables-row">
					<Label text="Last Name" required={true} />
					<td class="table-data">
						<Input
							name="lastName"
							type="text"
							placeholder="Enter last name here..."
							bind:value={lastName}
							error={errors?.LastName}
						/>
					</td>
				</tr>
				<tr class="tables-row">
					<Label text="Contact Number" required={true} />
					<td class="table-data">
						<div class="flex">
							<select name="countryCode" bind:value={countryCode} class="input mr-2 !w-20">
								<option>+1</option>
								<option>+91</option>
							</select>
							<input
								type="text"
								name="phone"
								bind:value={phone}
								pattern="[0-9]*"
								placeholder="Enter contact number here..."
								class="input"
							/>
						</div>
					<td class="table-data">
						<div class="relative">
							<select
								name="role"
								bind:value={role}
								class="select"
								onchange={getRoleIdByRoleName}
								placeholder="Select role here..."
							>
								{#each userRoles as role}
									<option value={role.Value}>{role.Title}</option>
								{/each}
							</select>
							<div class="select-icon-container">
								<Icon icon="mdi:chevron-down" class="select-icon" />
							</div>
						</div>
						<input type="hidden" name="selectedUserRoleId" bind:value={selectedUserRoleId} />
					</td>
				</tr>
				<tr class="tables-row">
					<Label text="Password" required={true} />
					<td class="table-data">
						<PasswordInput bind:password />
						{#if errors?.Password}
							<p class="text-error">{errors?.Password}</p>
						{:else}
							<p class="text-error">
								The password should be at least 8 characters long and must contain at least 1
								capital letter, 1 small letter, 1 digit, and 1 special character.
							</p>
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button size="md" type="submit" text="Submit" variant="primary" />
			{/await}
		</div>
	</form>
</div>

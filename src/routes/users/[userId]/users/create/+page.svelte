<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { LocalStorageUtils } from '$lib/utils/local.storage.utils';
	import type { PageServerData } from '../$types.ts';
	import PasswordInput from '$lib/components/input/password.input.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store.js';
	import { goto } from '$app/navigation';
	import type { UserCreateModel } from '$lib/types/user.types.js';
	import { createSchema } from '$lib/validation/user.schemas.js';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();

	let userRoles = data.UserRoles;

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
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create User</th>
							<th class="text-end">
								<a href={userRoute} class="cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>First Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="firstName"
									bind:value={firstName}
									placeholder="Enter first name here..."
									class="health-system-input"
								/>
								{#if errors?.FirstName}
									<p class="text-error ml-1">{errors?.FirstName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Last Name <span class="text-red-700">*</span></td>
							<td>
								<input
									type="text"
									name="lastName"
									bind:value={lastName}
									placeholder="Enter last name here..."
									class="health-system-input"
								/>
								{#if errors?.LastName}
									<p class="text-error ml-1">{errors?.LastName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Contact Number <span class="text-red-700">*</span></td>
							<td class="flex gap-2">
								<select
									name="countryCode"
									bind:value={countryCode}
									class="health-system-input !w-20"
								>
									<option>+1</option>
									<option>+91</option>
								</select>
								<input
									type="text"
									name="phone"
									bind:value={phone}
									pattern="[0-9]*"
									placeholder="Enter contact number here..."
									class="health-system-input"
								/>
								{#if errors?.Phone}
									<p class="text-error">{errors?.Phone}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Email <span class="text-red-700">*</span></td>
							<td>
								<input
									type="email"
									name="email"
									bind:value={email}
									placeholder="Enter email here..."
									class="health-system-input"
								/>
								{#if errors?.Email}
									<p class="text-error">{errors?.Email}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Role <span class="text-red-700">*</span></td>
							<td>
								<select
									name="role"
									bind:value={role}
									class="health-system-input"
									onchange={getRoleIdByRoleName}
									placeholder="Select role here..."
								>
									{#each userRoles as role}
										<option value={`${role.Value}`}>{role.Title}</option>
									{/each}
								</select>
								<input type="hidden" name="selectedUserRoleId" bind:value={selectedUserRoleId} />
							</td>
						</tr>
						<tr>
							<td>Password <span class="text-red-700">*</span></td>
							<td>
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
				<div class="button-container">
					{#await promise}
						<button type="submit" class="health-system-btn variant-soft-secondary" disabled>
							Submiting
						</button>
					{:then data}
						<button type="submit" class="health-system-btn variant-soft-secondary"> Submit </button>
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>

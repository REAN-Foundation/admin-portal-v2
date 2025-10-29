<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import PasswordInput from '$lib/components/input/password.input.svelte';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { goto } from '$app/navigation';
	import type { UserCreateModel } from '$lib/types/user.types';
	import { createSchema } from '$lib/validation/user.schemas';
	import Button from '$lib/components/button/button.svelte';
	import type { PageServerData } from './$types';
	import { onMount } from 'svelte';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let userRoles = data.UserRoles;

	let availableRoles = $derived.by(() => {
		return userRoles.map((role) => ({
			id: role.RoleId,
			RoleName: role.Value,
			Title: role.Title
		}));
	});

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

	// Reactive statement to update role ID when role changes or when availableRoles loads
	$effect(() => {
		if (availableRoles && availableRoles.length > 0) {
			// If no role is selected yet, set the first one as default
			if (!role) {
				const defaultRole = availableRoles[0];
				role = defaultRole.RoleName;
				selectedUserRoleId = defaultRole.id;
			} else {
				// Find the selected role and update the ID
				const selectedRole = availableRoles.find((x) => x.RoleName === role);
				if (selectedRole && selectedUserRoleId !== selectedRole.id) {
					selectedUserRoleId = selectedRole.id;
				}
			}
		}
	});

	const createRoute = `/users/${userId}/users/create`;
	const userRoute = `/users/${userId}/users`;

	const breadCrumbs = [
		{ name: 'Users', path: userRoute },
		{ name: 'Create', path: createRoute }
	];

	function getRoleIdByRoleName(event) {
		const selectedUserRole = event.target.value;
		const selectedRole = availableRoles?.find((x) => x.RoleName === selectedUserRole);
		if (selectedRole) {
			selectedUserRoleId = selectedRole.id;
			role = selectedUserRole;
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

<div class="p-6">
	<form onsubmit={async (event) => (promise = handleSubmit(event))}>
		<div class="form-headers">
			<h2 class="form-titles">Create User</h2>
			<a href={userRoute} class="form-cancel-btn">
				<Icon icon="material-symbols:close-rounded" />
			</a>
		</div>
		<table class="w-full">
			<tbody>
				<tr class="tables-row">
					<td class="table-label">First Name <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="firstName"
							bind:value={firstName}
							placeholder="Enter first name here..."
							class="input {errors?.firstName ? 'input-text-error' : ''}"
						/>
						{#if errors?.FirstName}
							<p class="text-error ml-1">{errors?.FirstName}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Last Name <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="text"
							name="lastName"
							bind:value={lastName}
							placeholder="Enter last name here..."
							class="input {errors?.lastName ? 'input-text-error' : ''}"
						/>
						{#if errors?.LastName}
							<p class="text-error ml-1">{errors?.LastName}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Contact Number <span class="text-red-700">*</span></td>
					<td class="table-data">
						<div class="flex gap-2">
							<select name="countryCode" bind:value={countryCode} class="input !w-20">
								<option>+1</option>
								<option>+91</option>
							</select>
							<input
								type="text"
								name="phone"
								bind:value={phone}
								pattern="[0-9]*"
								placeholder="Enter contact number here..."
								class="input {errors?.phone ? 'input-text-error' : ''}"
							/>
						</div>

						{#if errors?.Phone}
							<p class="text-error">{errors?.Phone}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Email <span class="text-red-700">*</span></td>
					<td class="table-data">
						<input
							type="email"
							name="email"
							bind:value={email}
							placeholder="Enter email here..."
							class="input {errors?.email ? 'input-text-error' : ''}"
						/>
						{#if errors?.Email}
							<p class="text-error">{errors?.Email}</p>
						{/if}
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Role <span class="text-red-700">*</span></td>
					<td class="table-data">
						{#if availableRoles.length === 0}
							<div class="rounded border border-red-300 bg-red-50 p-3 text-red-600">
								<Icon icon="material-symbols:warning" class="mr-2 inline" />
								You don't have permission to create users with any roles.
							</div>
						{:else}
							<div class="relative">
								<select
									name="role"
									bind:value={role}
									class="select"
									onchange={getRoleIdByRoleName}
									placeholder="Select role here..."
								>
									{#each availableRoles as role}
										<option value={role.RoleName}>{role.RoleName}</option>
									{/each}
								</select>
								<div class="select-icon-container">
									<Icon icon="mdi:chevron-down" class="select-icon" />
								</div>
							</div>
						{/if}
						<input type="hidden" name="selectedUserRoleId" bind:value={selectedUserRoleId} />
					</td>
				</tr>
				<tr class="tables-row">
					<td class="table-label">Password <span class="text-red-700">*</span></td>
					<td class="table-data">
						<PasswordInput bind:password />
						{#if errors?.Password}
							<p class="text-error">{errors?.Password}</p>
						<!-- {:else}
							<p class="text-error">
								The password should be at least 8 characters long and must contain at least 1
								capital letter, 1 small letter, 1 digit, and 1 special character.
							</p> -->
						{/if}
					</td>
				</tr>
			</tbody>
		</table>
		<div class="btn-container">
			{#await promise}
				<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
			{:then data}
				<Button
					size="md"
					type="submit"
					text="Submit"
					variant="primary"
					disabled={availableRoles.length === 0}
				/>
			{/await}
		</div>
	</form>
</div>

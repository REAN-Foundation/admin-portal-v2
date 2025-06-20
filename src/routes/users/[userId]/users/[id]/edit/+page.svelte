<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { LocalStorageUtils } from '$lib/utils/local.storage.utils';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import type { UserUpdateModel } from '$lib/types/user.types';
	import { goto } from '$app/navigation';
	import { updateSchema } from '$lib/validation/user.schemas';
	import Button from '$lib/components/button/button.svelte';

	//////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let firstName = $state(data.user.Person.FirstName);
	let lastName = $state(data.user.Person.LastName);
	let phone = $state(data.user.Person.Phone);
	let email = $state(data.user.Person.Email);
	let role = $state(data.user.Role.RoleName);
	let errors: Record<string, string> = $state({});
	let promise = $state();

	let splitPhoneNumber = $derived(phone.split('-'));
	let selectedUserRoleId = $state(data.user.Role.id);

	function handleReset() {
		firstName = data?.user?.Person?.FirstName;
		lastName = data?.user?.Person?.LastName;
		role = data?.user?.Role?.RoleName;
		phone = data?.user?.Person?.Phone;
		email = data?.user?.Person?.Email;
	}

	const userId = page.params.userId;
	const id = page.params.id;
	const editRoute = `/users/${userId}/users/${id}/edit`;
	const viewRoute = `/users/${userId}/users/${id}/view`;
	const userRoute = `/users/${userId}/users`;

	const breadCrumbs = [
		{
			name: 'Users',
			path: userRoute
		},
		{
			name: 'Edit',
			path: editRoute
		}
	];

	function getRoleIdByRoleName(event) {
		const selectedUserRole = event.target.value;
		const tmp = LocalStorageUtils.getItem('personRoles');
		const personRoles = JSON.parse(tmp);
		const selectedRole = personRoles?.find((x) => x.RoleName === selectedUserRole);
		if (selectedRole) {
			selectedUserRoleId = selectedRole.id;
		}
	}

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const usersUpdateModel: UserUpdateModel = {
				FirstName: firstName,
				LastName: lastName,
				Phone: splitPhoneNumber[1],
				Email: email,
				Role: role,
				CountryCode: splitPhoneNumber[0],
				SelectedUserRoleId: selectedUserRoleId
			};

			const validationResult = updateSchema.safeParse(usersUpdateModel);
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

			const res = await fetch(`/api/server/users/${id}`, {
				method: 'PUT',
				body: JSON.stringify(usersUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();
			console.log('response', response);

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
		<div class="table-container">
			<form onsubmit={(event) => (promise = handleSubmit(event))}>
				<table class="table-c">
					<thead>
						<tr>
							<th>Edit User</th>
							<th class="text-end">
								<a href={viewRoute} class="form-cancel-btn">
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
									class="input"
								/>
								{#if errors?.FirstName}
									<p class="text-error">{errors?.FirstName}</p>
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
									class="input"
								/>
								{#if errors?.LastName}
									<p class="text-error">{errors?.LastName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Contact Number <span class="text-red-700">*</span></td>

							<td class="flex gap-2">
								<select name="countryCode" bind:value={splitPhoneNumber[0]} class="input !w-20">
									<option>+1</option>
									<option>+91</option>
								</select>
								<input
									type="text"
									name="phone"
									pattern="[0-9]*"
									bind:value={splitPhoneNumber[1]}
									placeholder="Enter contact number here..."
									class="input {errors?.Phone ? 'input-text-error' : ''}"
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
									class="input"
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
									name="roleId"
									class="input"
									placeholder="Select role here..."
									disabled
									bind:value={role}
									onchange={getRoleIdByRoleName}
								>
									<option value="Tenant admin">Tenant Admin</option>
									<option value="Tenant user">Tenant User</option>
									<option value="System user">System User</option>
									<option value="System admin">System Admin</option>
								</select>
								<input type="hidden" name="selectedUserRoleId" bind:value={selectedUserRoleId} />
							</td>
						</tr>
					</tbody>
				</table>
				<div class="btn-container mr-5 mb-2">
					<Button size="md" type="button" onclick={handleReset} text="Reset" variant="primary" />
					{#await promise}
						<Button size="md" type="submit" text="Submitting" variant="primary" disabled={true} />
					{:then data}
						<Button size="md" type="submit" text="Submit" variant="primary" />
					{/await}
				</div>
			</form>
		</div>
	</div>
</div>

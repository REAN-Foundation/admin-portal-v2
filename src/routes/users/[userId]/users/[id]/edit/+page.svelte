<script lang="ts">
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import { LocalStorageUtils } from '$lib/utils/local.storage.utils';

	//////////////////////////////////////////////////////////////////////

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();

	let firstName = $state(data.user.Person.FirstName);
	let lastName = $state(data.user.Person.LastName);
	let phone = $state(data.user.Person.Phone);
	let email = $state(data.user.Person.Email);
	let role = $state(data.user.Role.RoleName);
	let isSubmitting = $state(false);

	// let imageUrl = data.user.ImageUrl;
	// $: avatarSource = imageUrl;
	let splitPhoneNumber = $derived(phone.split('-'));
	//Original data
	let _firstName = $derived(firstName);
	let _lastName = $derived(lastName);
	let _role = $derived(role);
	let _phone = $derived(phone);
	let _email = $derived(email);
	// let _imageUrl = imageUrl;
	let selectedUserRoleId = $state(data.user.Role.id);

	// console.log("phone",phone)
	function handleReset() {
		firstName = _firstName;
		lastName = _lastName;
		role = _role;
		phone = _phone;
		email = _email;
		// imageUrl = _imageUrl
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

	// const upload = async (imgBase64, filename) => {
	// 	const data = {};
	// 	console.log(imgBase64);
	// 	const imgData = imgBase64.split(',');
	// 	data['image'] = imgData[1];
	// 	console.log(JSON.stringify(data));
	// 	const res = await fetch(`/api/server/file-resources/upload`, {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 			Accept: 'application/json',
	// 			filename: filename
	// 		},
	// 		body: JSON.stringify(data)
	// 	});
	// 	console.log(Date.now().toString());
	// 	const response = await res.json();
	// 	if (response.Status === 'success' && response.HttpCode === 201) {
	// 		const imageUrl_ = response.Data.FileResources[0].Url;
	// 		console.log('imageUrl_', imageUrl_);
	// 		if (imageUrl_) {
	// 			imageUrl = imageUrl_;
	// 		}
	// 		console.log(imageUrl);
	// 	} else {
	// 		showMessage(response.Message, 'error');
	// 	}
	// };

	// const onFileSelected = async (e) => {
	// 	let f = e.target.files[0];
	// 	const filename = f.name;
	// 	let reader = new FileReader();
	// 	reader.readAsDataURL(f);
	// 	reader.onload = async (e) => {
	// 		avatarSource = e.target.result;
	// 		await upload(e.target.result, filename);
	// 	};
	// };
	function getRoleIdByRoleName(event) {
		const selectedUserRole = event.target.value;
		const tmp = LocalStorageUtils.getItem('personRoles');
		const personRoles = JSON.parse(tmp);
		const selectedRole = personRoles?.find((x) => x.RoleName === selectedUserRole);
		if (selectedRole) {
			selectedUserRoleId = selectedRole.id;
		}
	}

	function handleSubmit() {
		isSubmitting = true;
	}
	if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form method="post" action="?/updateUserAction" use:enhance onsubmit={handleSubmit}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Edit User</th>
							<th class="text-end">
								<a href={viewRoute} class="health-system-btn variant-soft-secondary">
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
									required
									placeholder="Enter first name here..."
									class="health-system-input {form?.errors?.firstName
										? 'input-text-error'
										: 'border-primary-200'}"
								/>
								{#if form?.errors?.firstName}
									<p class="text-error">{form?.errors?.firstName[0]}</p>
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
									required
									placeholder="Enter last name here..."
									class="health-system-input {form?.errors?.lastName
										? 'input-text-error'
										: 'border-primary-200'}"
								/>
								{#if form?.errors?.lastName}
									<p class="text-error">{form?.errors?.lastName[0]}</p>
								{/if}
							</td>
						</tr>
						<!-- <tr>
				<td>Contact Number *</td>
				<td>
					<input
						type="text"
						name="phone"
						required
						bind:value={phone}
						placeholder="Enter phone here..."
						class="input"
					/>
				</td>
			</tr> -->
						<tr>
							<td>Contact Number <span class="text-red-700">*</span></td>

							<td class="flex gap-2">
								<select
									name="countryCode"
									bind:value={splitPhoneNumber[0]}
									class="health-system-input"
								>
									<option>+1</option>
									<option>+91</option>
								</select>
								<input
									type="text"
									name="phone"
									required
									pattern="[0-9]*"
									bind:value={splitPhoneNumber[1]}
									placeholder="Enter contact number here..."
									class="health-system-input {form?.errors?.phone ? 'input-text-error' : ''}"
								/>
								{#if form?.errors?.phone}
									<p class="text-error">{form?.errors?.phone[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Email <span class="text-red-700">*</span></td>

							<td>
								<input
									type="email"
									name="email"
									required
									bind:value={email}
									placeholder="Enter email here..."
									class="health-system-input"
								/>
								{#if form?.errors?.email}
									<p class="text-error">{form?.errors?.email[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Role <span class="text-red-700">*</span></td>

							<td>
								<select
									name="roleId"
									class="health-system-input"
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
						<!-- <tr>
				<td>Password</td>
				<td>
					<input
						type="password"
						name="password"
						bind:value={password}
						placeholder="Enter password here..."
						class="input w-full {form?.errors?.password
							? 'border-error-300'
							: 'border-primary-200'}"
					/>
					{#if form?.errors?.password}
						<p class="text-error">{form?.errors?.password[0]}</p>
					{/if}
				</td>
			</tr>	 -->
						<!-- <tr>
				<td class="align-top">Image</td>
				<td>
					{#if imageUrl === 'undefined'}
						<input
							name="fileinput"
							type="file"
							class="true input w-full"
							placeholder="Image"
							on:change={async (e) => await onFileSelected(e)}
						/>
					{:else}
						<Image cls="flex h-24 w-24 rounded-lg mb-2" source={imageUrl} w="24" h="24" />
						<input
							name="fileinput"
							type="file"
							class="true input w-full"
							placeholder="Image"
							on:change={async (e) => await onFileSelected(e)}
						/>
					{/if}
					<input type="hidden" name="imageUrl" value={imageUrl} />
				</td>
			</tr>	 -->
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
					<button
						type="submit"
						class="health-system-btn variant-soft-secondary"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Submitting...' : 'Submit'}
					</button>
				</div>
			</form>
		</div>
	</div>
</div>

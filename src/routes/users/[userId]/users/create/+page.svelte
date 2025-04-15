<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Icon from '@iconify/svelte';
	import { LocalStorageUtils } from '$lib/utils/local.storage.utils';
	import type { PageServerData } from '../$types.ts';
	import PasswordInput from '$lib/components/input/password.input.svelte';

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// export let form;
	// export let data: PageServerData;
	let { data, form }: { data: PageServerData; form: any } = $props();

	let userRoles = data.UserRoles;
	const userId = page.params.userId;
	let selectedUserRoleId = $state(undefined);
	const createRoute = `/users/${userId}/users/create`;
	const userRoute = `/users/${userId}/users`;

	const breadCrumbs = [
		{ name: 'Users', path: userRoute },
		{ name: 'Create', path: createRoute }
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
	// 		// const imageUrl_ = response.Data.FileResources[0].Url;
	// 		console.log('imageUrl', imageUrl);
	// 		const imageResourceId_ = response.Data.FileResources[0].id;
	// 		console.log('imageResourceId_', imageUrl);
	// 		if (imageResourceId_) {
	// 			imageResourceId = imageResourceId_;
	// 		}
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
	// 		fileinput = e.target.result;
	// 		await upload(e.target.result, filename);
	// 	};
	// };

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

	function handleSubmit() {
		isSubmitting = true;
	}
	let isSubmitting = $state(false);
	if (form) {
		isSubmitting = false;
	}
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form
				method="post"
				action="?/createUserAction"
				enctype="multipart/form-data"
				use:enhance
				onsubmit={handleSubmit}
			>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>Create User</th>
							<th class="text-end">
								<a href={userRoute} class="health-system-btn variant-soft-secondary">
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
									required
									value={form?.data?.firstName ?? ''}
									placeholder="Enter first name here..."
									class="health-system-input {form?.errors?.firstName ? 'input-text-error' : ''}"
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
									required
									value={form?.data?.lastName ?? ''}
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
						<!-- <tr >
				<td>Contact Number *</td>
				<td>
					<input
						type="text"
						name="phone"
						required
						placeholder="Enter phone here..."
						class="health-system-input {form?.errors?.phone ? 'input-text-error' : 'border-primary-200'}"
					/>
					{#if form?.errors?.phone}
						<p class="text-error">{form?.errors?.phone[0]}</p>
					{/if}
				</td>
			</tr> -->
						<tr>
							<td>Contact Number <span class="text-red-700">*</span></td>
							<td class="flex gap-2">
								<select
									name="countryCode"
									value={form?.data?.countryCode ?? '+1'}
									class="health-system-input !w-20"
								>
									<option>+1</option>
									<option>+91</option>
								</select>
								<input
									type="text"
									name="phone"
									value={form?.data?.phone ?? ''}
									pattern="[0-9]*"
									required
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
									value={form?.data?.email ?? ''}
									placeholder="Enter email here..."
									required
									class="health-system-input {form?.errors?.email
										? 'input-text-error'
										: 'border-primary-200'}"
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
									name="role"
									class="health-system-input"
									required
									value=""
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
								<!-- <input
						type="password"
						name="password"
						placeholder="Enter password here..."
						class="health-system-input {form?.errors?.password
							? 'input-text-error'
							: 'border-primary-200'}"
					/> -->
								<PasswordInput />
								{#if form?.errors?.password}
									<p class="text-error">{form?.errors?.password[0]}</p>
								{:else}
									<p class="text-error">
										The password should be at least 8 characters long and must contain at least 1
										capital letter, 1 small letter, 1 digit, and 1 special character.
									</p>
								{/if}
								<!-- {#if form?.errors?.password} -->
								<!-- <p class="border-b-surface-700">Password should be of minimum 8 characters & contain at least 1 capital letter , 1 digit & 1 special character</p> -->
								<!-- {/if} -->
							</td>
						</tr>
						<!-- <tr >
				<td>Image</td>
				<td>
					<input
						name="fileinput"
						type="file"
						class="true input w-full"
						placeholder="Image"
						on:change={async (e) => await onFileSelected(e)}
					/>
					<input type="hidden" name="imageResourceId" bind:value={imageResourceId} />
				</td>
			</tr> -->
					</tbody>
				</table>
				<div class="button-container">
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

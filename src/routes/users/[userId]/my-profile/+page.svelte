<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';
	import { enhance } from '$app/forms';
	import Image from '$lib/components/image.svelte';
	import BreadCrums from '$lib/components/breadcrumbs/breadcrums.svelte';
	import type { FileUploadModel } from '$lib/types/file.upload.types';
	import { fileUploadSchema } from '$lib/validation/file.upload.schema';
	import { toastMessage } from '$lib/components/toast/toast.store';
	import { createOrUpdateSchema, profileFileUploadSchema } from '$lib/validation/profile.schema';
	import { goto } from '$app/navigation';
	import type { ProfileFileUploadModel, ProfileUpdateModel } from '$lib/types/profile.types';

	//////////////////////////////////////////////////////////////////////

	let { data, form }: { data: PageServerData; form: any } = $props();

	let errors: Record<string, string> = $state({});
	let promise = $state();

	let firstName = $state(data.user.Person.FirstName);
	let lastName = $state(data.user.Person.LastName);
	let phone = $state(data.user.Person.Phone);
	let email = $state(data.user.Person.Email);
	let roleId = $state(data.user.Role.id);
	let roleName = $state(data.user.Role.RoleName);
	let splitPhoneNumber = $state(phone.split('-'));
	let [countryCode, phoneNumber] = $derived(splitPhoneNumber);
	let imageUrl = $state(data.user.Person.ImageUrl);
	let imageResourceId = $state(data.user.Person.ImageResourceId ?? undefined);
	let previewImage = $state(null);
	let fileInput: HTMLInputElement;

	console.log('data', data);

	// console.log('imageurl ==>', imageUrl);
	let profileImage = $state();
	let errorMessage = {
		Text: 'Max file upload size 150 KB',
		Colour: 'text-[var(--color-info)]'
	};
	const MAX_FILE_SIZE = 1024 * 150;

	console.log('phone', phone);
	function handleReset() {
		firstName = data?.user?.Person?.FirstName;
		lastName = data?.user?.Person?.LastName;
		email = data?.user?.Person?.Email;
		countryCode = countryCode;
		phoneNumber = phoneNumber;
	}

	const userId = page.params.userId;
	const userRoute = `/users/${userId}/home`;
	const profileRoute = `/users/${userId}`

	const breadCrumbs = [
		{
			name: 'My Profile',
			path: ''
		}
	];

	$inspect('errors', errors);

	const onFileSelected = async (e) => {
		const input = e.target as HTMLInputElement;
    	const file = input.files?.[0];

		const fileCreateModel: ProfileFileUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = profileFileUploadSchema.safeParse(fileCreateModel);
		console.log('validation result of file', fileValidationResult);

		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		const formData = new FormData();
		formData.append('file', file);
		formData.append('filename', file.name);

		try {
			const res = await fetch(`/api/server/profile-image/upload`, {
				method: 'POST',
				body: formData
			});

			const response = await res.json();
			imageUrl = response.Data.FileResources[0].Url;
			if (response.HttpCode === 201 || response.HttpCode === 200) {
				const imageResourceId_ = response.Data.FileResources[0].id;
				console.log('ImageResource', imageResourceId_);
				if (imageResourceId_) {
					imageResourceId = imageResourceId_;
					return true;
				}
				console.log('imageResourceId', imageResourceId);

				toastMessage(response);
				return;
			}

			if (response.Errors) {
				errors = response?.Errors || {};
			} else {
				toastMessage(response);
			}
		} catch (error) {
			console.error('Error uploading file:', error);

			toastMessage();
		}
	};

	$inspect('imageurl', imageUrl);

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			errors = {};

			const userUpdateModel: ProfileUpdateModel = {
				FirstName: firstName,
				LastName: lastName,
				Phone: phone,
				CountryCode: countryCode,
				Email: email,
				RoleId: roleId,
				Role: roleName,
				ResourceId: imageResourceId
			};
			const userValidation = createOrUpdateSchema.safeParse(userUpdateModel);
			console.log('validation result of documents', userValidation);

			if (!userValidation.success) {
				errors = Object.fromEntries(
					Object.entries(userValidation.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);

				return;
			}

			const res = await fetch(`/api/server/profile/${userId}`, {
				method: 'PUT',
				body: JSON.stringify(userUpdateModel),
				headers: { 'content-type': 'application/json' }
			});

			const response = await res.json();

			if (response.HttpCode === 201 || response.HttpCode === 200) {
				toastMessage(response);
				// goto(`${profileRoute}/my-profile`);
				window.location.reload();
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

<BreadCrums crumbs={breadCrumbs} />

<div class="px-6 py-4">
	<div class="mx-auto">
		<div class="health-system-table-container">
			<form onsubmit={async (event) => (promise = handleSubmit(event))}>
				<table class="health-system-table">
					<thead>
						<tr>
							<th>My Profile</th>
							<th class="text-end">
								<a href={userRoute} class=" cancel-btn">
									<Icon icon="material-symbols:close-rounded" />
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr class="hidden">
							<td>
								<input type="text" hidden name="roleId" bind:value={roleId} />
							</td>
						</tr>
						<tr>
							<td>First Name <span class="text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="firstName"
									bind:value={firstName}
									placeholder="Enter first name here..."
									class="health-system-input"
								/>
								{#if errors?.FirstName}
									<p class="text-error">{errors?.FirstName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Last Name <span class="text-red-600">*</span></td>
							<td>
								<input
									type="text"
									name="lastName"
									bind:value={lastName}
									placeholder="Enter last name here..."
									class="health-system-input"
								/>
								{#if errors?.LastName}
									<p class="text-error">{errors?.LastName}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Contact Number <span class="text-red-600">*</span></td>
							<td class="flex gap-2 px-4 py-4">
								<select name="countryCode" bind:value={countryCode} class="health-system-input">
									<option>+1</option>
									<option>+91</option>
								</select>
								<input
									type="text"
									name="phone"
									bind:value={phoneNumber}
									placeholder="Enter contact number here..."
									class="health-system-input"
								/>
								{#if errors?.Phone}
									<p class="text-error">{errors?.Phone[0]}</p>
								{/if}
							</td>
						</tr>
						<tr>
							<td>Email <span class="text-red-600">*</span></td>
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
							<td>Profile Image</td>
							<td>
								{#if imageUrl === undefined}
									<input
										name="fileinput"
										type="file"
										class="health-system-input"
										placeholder="select Image"
										onchange={async (e) => await onFileSelected(e)}
									/>
								{:else}
									<Image cls="flex h-24 w-24 rounded-lg" source={imageUrl} w="24" h="24" />
									<input
										name="fileinput"
										type="file"
										class="health-system-input my-2"
										bind:this={profileImage}
										placeholder="Image"
										onchange={async (e) => await onFileSelected(e)}
									/>
								{/if}
								<input type="hidden" name="imageResourceId" value={imageResourceId} />
								{#if errors?.UploadFile}
									<p class="text-error">{errors?.UploadFile}</p>
								{/if}

								
							</td>
						</tr>
					</tbody>
				</table>
				<div class="button-container">
					<button
						type="button"
						onclick={handleReset}
						class="health-system-btn variant-soft-secondary">Reset</button
					>
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
